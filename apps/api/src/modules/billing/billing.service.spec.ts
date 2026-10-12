import { createHmac } from "node:crypto";
import { BillingService } from "./billing.service";
import { DatabaseService } from "../../infrastructure/database/database.service";

describe("BillingService", () => {
  let service: BillingService;
  let mockDb: {
    organization: { findUnique: jest.Mock };
    subscription: { create: jest.Mock; upsert: jest.Mock };
    paymentTransaction: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };
  const mockSecretKey = "sk_test_secret_key_12345";

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = mockSecretKey;

    mockDb = {
      organization: {
        findUnique: jest.fn(),
      },
      subscription: {
        create: jest.fn(),
        upsert: jest.fn(),
      },
      paymentTransaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new BillingService(mockDb as unknown as DatabaseService);
  });

  describe("Webhook Signature Verification", () => {
    it("should accept a valid HMAC-SHA512 signature", () => {
      const rawBody = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } });
      const validSignature = createHmac("sha512", mockSecretKey).update(rawBody).digest("hex");

      const result = service.verifyWebhookSignature(validSignature, rawBody);
      expect(result).toBe(true);
    });

    it("should reject an invalid signature", () => {
      const rawBody = JSON.stringify({ event: "charge.success", data: { reference: "ref_1" } });
      const invalidSignature = "invalid_hex_string_12345";

      const result = service.verifyWebhookSignature(invalidSignature, rawBody);
      expect(result).toBe(false);
    });
  });

  describe("Webhook Idempotency", () => {
    it("should skip processing if transaction is already SUCCESS", async () => {
      const rawBody = JSON.stringify({
        event: "charge.success",
        data: { reference: "tch_test_ref", channel: "card" },
      });
      const validSignature = createHmac("sha512", mockSecretKey).update(rawBody).digest("hex");

      mockDb.paymentTransaction.findUnique.mockResolvedValue({
        id: "tx-1",
        reference: "tch_test_ref",
        status: "SUCCESS",
        organizationId: "org-1",
        metadata: JSON.stringify({ plan: "BUILDER" }),
      });

      const response = await service.handleWebhook(
        validSignature,
        JSON.parse(rawBody),
        rawBody,
      );

      expect(response.received).toBe(true);
      expect(response.alreadyProcessed).toBe(true);
      expect(mockDb.paymentTransaction.update).not.toHaveBeenCalled();
      expect(mockDb.subscription.upsert).not.toHaveBeenCalled();
    });

    it("should upgrade subscription on first successful charge event", async () => {
      const rawBody = JSON.stringify({
        event: "charge.success",
        data: { reference: "tch_test_ref", channel: "card" },
      });
      const validSignature = createHmac("sha512", mockSecretKey).update(rawBody).digest("hex");

      mockDb.paymentTransaction.findUnique.mockResolvedValue({
        id: "tx-1",
        reference: "tch_test_ref",
        status: "PENDING",
        organizationId: "org-1",
        metadata: JSON.stringify({ plan: "BUILDER" }),
      });

      mockDb.subscription.upsert.mockResolvedValue({
        id: "sub-1",
        plan: "BUILDER",
        status: "ACTIVE",
      });

      const response = await service.handleWebhook(
        validSignature,
        JSON.parse(rawBody),
        rawBody,
      );

      expect(response.received).toBe(true);
      expect(mockDb.paymentTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reference: "tch_test_ref" },
          data: expect.objectContaining({ status: "SUCCESS" }),
        }),
      );
      expect(mockDb.subscription.upsert).toHaveBeenCalled();
    });
  });
});
