import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHmac, randomBytes } from "node:crypto";
import { PLANS, type PlanTier } from "@tcharize/contracts";
import { DatabaseService } from "../../infrastructure/database/database.service";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly db: DatabaseService) {}

  private get paystackSecretKey(): string {
    return process.env.PAYSTACK_SECRET_KEY || "";
  }

  getPlans() {
    return Object.values(PLANS);
  }

  async getSubscription(organizationId: string) {
    let org = await this.db.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!org) {
      org = await this.db.organization.findUnique({
        where: { slug: organizationId },
        include: { subscription: true },
      });
    }

    if (!org) {
      throw new NotFoundException("Organization not found.");
    }

    if (!org.subscription) {
      // Default to FREE plan
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      const sub = await this.db.subscription.create({
        data: {
          organizationId: org.id,
          plan: "FREE",
          status: "ACTIVE",
          wordLimit: PLANS.FREE.wordLimit,
          wordsUsed: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
      return sub;
    }

    return org.subscription;
  }

  async initializeCheckout(input: {
    organizationId: string;
    plan: PlanTier;
    email: string;
    callbackUrl?: string;
  }) {
    let org = await this.db.organization.findUnique({
      where: { id: input.organizationId },
    });
    if (!org) {
      org = await this.db.organization.findUnique({
        where: { slug: input.organizationId },
      });
    }
    if (!org) {
      throw new NotFoundException("Organization not found.");
    }

    const planConfig = PLANS[input.plan];
    if (!planConfig) {
      throw new BadRequestException("Invalid plan selected.");
    }

    if (planConfig.priceKobo === 0) {
      // Free plan downgrade/activation
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      const sub = await this.db.subscription.upsert({
        where: { organizationId: org.id },
        update: {
          plan: "FREE",
          status: "ACTIVE",
          wordLimit: planConfig.wordLimit,
          currentPeriodEnd: periodEnd,
        },
        create: {
          organizationId: org.id,
          plan: "FREE",
          status: "ACTIVE",
          wordLimit: planConfig.wordLimit,
          wordsUsed: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
      return { success: true, message: "Free plan active.", subscription: sub };
    }

    const reference = `tch_${Date.now()}_${randomBytes(4).toString("hex")}`;

    // Record pending transaction
    await this.db.paymentTransaction.create({
      data: {
        organizationId: org.id,
        reference,
        amountKobo: planConfig.priceKobo,
        currency: "NGN",
        status: "PENDING",
        metadata: JSON.stringify({
          plan: input.plan,
          organizationId: org.id,
          email: input.email,
        }),
      },
    });

    if (!this.paystackSecretKey) {
      if (process.env.NODE_ENV === "production") {
        throw new BadRequestException("Payments are not ready yet. Please try again later.");
      }
      this.logger.warn("PAYSTACK_SECRET_KEY is not set. Using the local-only payment flow.");
      return {
        authorization_url: `${process.env.WEB_URL || "http://localhost:3000"}/dashboard?payment_success=true&reference=${reference}`,
        access_code: `mock_${reference}`,
        reference,
      };
    }

    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          amount: planConfig.priceKobo, // integer kobo
          currency: "NGN",
          reference,
          callback_url: input.callbackUrl || `${process.env.WEB_URL || "http://localhost:3000"}/dashboard`,
          metadata: {
            organizationId: org.id,
            plan: input.plan,
          },
        }),
      });

      const body = (await response.json()) as {
        status: boolean;
        message: string;
        data?: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      };

      if (!body.status || !body.data) {
        throw new Error(body.message || "Could not initialize Paystack checkout.");
      }

      return body.data;
    } catch (err) {
      this.logger.error(`Paystack initialization error: ${err instanceof Error ? err.message : String(err)}`);
      throw new BadRequestException("Could not initiate Paystack payment. Please try again.");
    }
  }

  async verifyPayment(reference: string) {
    const tx = await this.db.paymentTransaction.findUnique({
      where: { reference },
    });
    if (!tx) {
      throw new NotFoundException("Payment transaction not found.");
    }

    if (tx.status === "SUCCESS") {
      return { status: "success", message: "Transaction already processed." };
    }

    if (!this.paystackSecretKey) {
      if (process.env.NODE_ENV === "production") {
        throw new BadRequestException("Payments are not ready yet. Please try again later.");
      }
      // Local-only verification for development.
      return this.applySuccessfulTransaction(tx, "mock");
    }

    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });
      const data = (await res.json()) as {
        status: boolean;
        data?: {
          status: string;
          channel: string;
          paid_at: string;
        };
      };

      if (data.status && data.data?.status === "success") {
        return await this.applySuccessfulTransaction(tx, data.data.channel);
      } else {
        await this.db.paymentTransaction.update({
          where: { reference },
          data: { status: "FAILED" },
        });
        throw new BadRequestException("Paystack transaction was not successful.");
      }
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : "Could not verify transaction with Paystack.",
      );
    }
  }

  verifyWebhookSignature(signature: string, rawBody: Buffer | string): boolean {
    if (!this.paystackSecretKey) return false;
    const bodyStr = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
    const hash = createHmac("sha512", this.paystackSecretKey).update(bodyStr).digest("hex");
    return hash === signature;
  }

  async handleWebhook(
    signature: string,
    payload: { event?: string; data?: { reference?: string; channel?: string } },
    rawBody: Buffer | string,
  ) {
    if (!this.verifyWebhookSignature(signature, rawBody)) {
      this.logger.warn("Invalid Paystack webhook signature rejected.");
      throw new UnauthorizedException("Invalid webhook signature.");
    }

    const event = payload?.event;
    if (event === "charge.success") {
      const reference = payload?.data?.reference;
      if (!reference) return { received: true };

      const tx = await this.db.paymentTransaction.findUnique({
        where: { reference },
      });
      if (!tx) {
        this.logger.warn(`Received webhook for unknown reference: ${reference}`);
        return { received: true };
      }

      // Idempotency: skip if already SUCCESS
      if (tx.status === "SUCCESS") {
        this.logger.log(`Idempotent webhook: ${reference} already processed.`);
        return { received: true, alreadyProcessed: true };
      }

      await this.applySuccessfulTransaction(tx, payload.data?.channel);
      this.logger.log(`Successfully processed Paystack webhook for ${reference}`);
    }

    return { received: true };
  }

  private async applySuccessfulTransaction(
    tx: { id: string; organizationId: string; reference: string; metadata: string | null },
    channel?: string,
  ) {
    let plan: PlanTier = "BUILDER";
    if (tx.metadata) {
      try {
        const meta = JSON.parse(tx.metadata) as { plan?: PlanTier };
        if (meta.plan && PLANS[meta.plan]) {
          plan = meta.plan;
        }
      } catch {
        // use default BUILDER
      }
    }

    const planConfig = PLANS[plan];
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Update transaction to SUCCESS
    await this.db.paymentTransaction.update({
      where: { reference: tx.reference },
      data: {
        status: "SUCCESS",
        channel: channel || "paystack",
        paidAt: new Date(),
      },
    });

    // Upgrade organization subscription
    const subscription = await this.db.subscription.upsert({
      where: { organizationId: tx.organizationId },
      update: {
        plan,
        status: "ACTIVE",
        wordLimit: planConfig.wordLimit,
        currentPeriodEnd: periodEnd,
      },
      create: {
        organizationId: tx.organizationId,
        plan,
        status: "ACTIVE",
        wordLimit: planConfig.wordLimit,
        wordsUsed: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    return { status: "success", subscription };
  }
}
