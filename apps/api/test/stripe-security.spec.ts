import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
const db = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("../src/prisma", () => ({ prisma: { $transaction: db.transaction } }));
const inventory = vi.hoisted(() => ({ commit: vi.fn() }));
vi.mock("../src/services/inventory.service", () => ({
  InventoryService: { commitOrderInventory: inventory.commit },
}));
import {
  PaymentService,
  verifyStripeSignature,
} from "../src/services/payment.service";
const secret = "whsec_testfixture1234567890";
const timestamp = Math.floor(Date.now() / 1000);
const orderId = "11111111-1111-4111-8111-111111111111";
function sign(body: Buffer, time = timestamp) {
  return `t=${time},v1=${createHmac("sha256", secret).update(`${time}.`).update(body).digest("hex")}`;
}
function event(amount = 185000) {
  return Buffer.from(
    JSON.stringify({
      id: "evt_test",
      type: "checkout.session.completed",
      livemode: false,
      data: {
        object: {
          id: "cs_test",
          payment_status: "paid",
          currency: "aed",
          amount_total: amount,
          metadata: { orderId },
        },
      },
    }),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PAYMENTS_ENABLED", "true");
  vi.stubEnv("PAYMENT_PROVIDER", "stripe");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_testfixture1234567890");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
});
describe("Stripe payment boundary", () => {
  it("validates raw-body signatures and supports key rotation", () => {
    const body = event();
    expect(verifyStripeSignature(body, sign(body), secret)).toBe(true);
    expect(
      verifyStripeSignature(body, sign(body) + ",v1=" + "0".repeat(64), secret),
    ).toBe(true);
    expect(
      verifyStripeSignature(
        Buffer.from(body.toString() + " "),
        sign(body),
        secret,
      ),
    ).toBe(false);
  });
  it("rejects stale, future, malformed, and duplicated timestamps", () => {
    const body = event();
    for (const header of [
      sign(body, timestamp - 301),
      sign(body, timestamp + 301),
      "t=bad,v1=00",
      sign(body) + `,t=${timestamp}`,
      `t=${timestamp},v1=garbage`,
    ])
      expect(verifyStripeSignature(body, header, secret)).toBe(false);
  });
  it("never reaches database mutation for unsigned callbacks", async () => {
    await expect(
      PaymentService.handleStripeWebhook(event(), "invalid"),
    ).rejects.toMatchObject({ code: "INVALID_SIGNATURE" });
    expect(db.transaction).not.toHaveBeenCalled();
  });
  it("disables unconfigured providers, COD, and fake automatic card captures", () => {
    expect(PaymentService.availableMethods()).toEqual(["CREDIT_CARD"]);
    expect(() => PaymentService.assertAvailable("CASH_ON_DELIVERY")).toThrow();
    expect(() => PaymentService.assertAvailable("TABBY")).toThrow();
    vi.stubEnv("PAYMENTS_ENABLED", "false");
    expect(PaymentService.availableMethods()).toEqual([]);
  });
  it("rejects captured amount tampering before payment or inventory updates", async () => {
    const tx = {
      $queryRaw: vi.fn(),
      webhookEvent: { findUnique: vi.fn().mockResolvedValue(null) },
      payment: {
        findUnique: vi
          .fn()
          .mockResolvedValue({
            id: "pay",
            orderId,
            provider: "CREDIT_CARD",
            currency: "AED",
            amount: new Prisma.Decimal(1850),
            status: "REQUIRES_ACTION",
            order: { status: "PAYMENT_PENDING" },
          }),
        update: vi.fn(),
      },
    };
    db.transaction.mockImplementation((fn: any) => fn(tx));
    const body = event(1);
    await expect(
      PaymentService.handleStripeWebhook(body, sign(body)),
    ).rejects.toMatchObject({ code: "AMOUNT_MISMATCH" });
    expect(tx.payment.update).not.toHaveBeenCalled();
    expect(inventory.commit).not.toHaveBeenCalled();
  });
  it("records a verified payment and inventory in the same transaction, then ignores replays", async () => {
    const tx = {
      $queryRaw: vi.fn(),
      webhookEvent: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn(),
      },
      payment: {
        findUnique: vi
          .fn()
          .mockResolvedValue({
            id: "pay",
            orderId,
            provider: "CREDIT_CARD",
            currency: "AED",
            amount: new Prisma.Decimal(1850),
            status: "REQUIRES_ACTION",
            order: { status: "PAYMENT_PENDING" },
          }),
        update: vi.fn(),
      },
      order: { update: vi.fn() },
    };
    db.transaction.mockImplementation((fn: any) => fn(tx));
    const body = event();
    await expect(
      PaymentService.handleStripeWebhook(body, sign(body)),
    ).resolves.toEqual({ status: "PROCESSED" });
    expect(inventory.commit).toHaveBeenCalledWith(orderId, tx);
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { status: "PAID" },
    });
    tx.webhookEvent.findUnique.mockResolvedValue({ processed: true } as any);
    await expect(
      PaymentService.handleStripeWebhook(body, sign(body)),
    ).resolves.toEqual({ status: "ALREADY_PROCESSED" });
    expect(inventory.commit).toHaveBeenCalledTimes(1);
  });
});
