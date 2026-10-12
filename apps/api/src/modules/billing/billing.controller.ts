import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { BillingService } from "./billing.service";
import type { PlanTier } from "@tcharize/contracts";
import { AuthGuard } from "../auth/auth.guard";
import { AuthService } from "../auth/auth.service";

interface CheckoutDto {
  organizationId: string;
  plan: PlanTier;
  email: string;
  callbackUrl?: string;
}

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService, private readonly auth: AuthService) {}

  @Get("plans")
  getPlans() {
    return this.billing.getPlans();
  }

  @Get("subscription/:orgId")
  @UseGuards(AuthGuard)
  async getSubscription(@Param("orgId") orgId: string, @Req() req: Request & { user: { id: string } }) {
    await this.auth.assertOrganizationAccess(req.user.id, orgId);
    return this.billing.getSubscription(orgId);
  }

  @Post("checkout")
  @UseGuards(AuthGuard)
  async checkout(@Body() body: CheckoutDto, @Req() req: Request & { user: { id: string } }) {
    await this.auth.assertOrganizationAccess(req.user.id, body.organizationId);
    return this.billing.initializeCheckout(body);
  }

  @Post("verify/:reference")
  @UseGuards(AuthGuard)
  verify(@Param("reference") reference: string) {
    return this.billing.verifyPayment(reference);
  }

  @Post("webhook")
  webhook(
    @Headers("x-paystack-signature") signature: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(body));
    return this.billing.handleWebhook(signature || "", body, rawBody);
  }
}
