import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { Prisma, PaymentStatus, OrderStatus } from "@prisma/client";
import {
  PaymentMethodType,
  PaymentSessionRequest,
  PaymentSessionResponse,
} from "@muschio/types";
import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { InventoryService } from "./inventory.service";

const SessionSchema = z.object({
  id: z.string().startsWith("cs_"),
  url: z.string().url().nullable().optional(),
  status: z.string(),
  payment_status: z.string(),
});
const EventSchema = z.object({
  id: z.string().startsWith("evt_"),
  type: z.string(),
  livemode: z.boolean(),
  data: z.object({
    object: z.object({
      id: z.string().startsWith("cs_"),
      payment_status: z.string().optional(),
      amount_total: z.number().int().nonnegative().nullable().optional(),
      currency: z.string().nullable().optional(),
      metadata: z.object({ orderId: z.string().uuid() }),
    }),
  }),
});

/** Verify raw bytes, signed timestamp, and every v1 signature with a replay tolerance. */
export function verifyStripeSignature(
  rawBody: Buffer,
  header: string,
  secret: string,
  now = Date.now(),
) {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamps = parts
    .filter(([name]) => name === "t")
    .map(([, value]) => value);
  if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0] || ""))
    return false;
  const timestamp = Number(timestamps[0]);
  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(now / 1000 - timestamp) > 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest();
  return parts.some(
    ([name, value]) =>
      name === "v1" &&
      !!value &&
      /^[a-f0-9]{64}$/i.test(value) &&
      timingSafeEqual(expected, Buffer.from(value, "hex")),
  );
}

function configured() {
  return (
    process.env.PAYMENTS_ENABLED === "true" &&
    process.env.PAYMENT_PROVIDER === "stripe" &&
    /^sk_(test|live)_[A-Za-z0-9]+$/.test(process.env.STRIPE_SECRET_KEY || "") &&
    /^whsec_[A-Za-z0-9]+$/.test(process.env.STRIPE_WEBHOOK_SECRET || "") &&
    !/mock|replace/i.test(
      (process.env.STRIPE_SECRET_KEY || "") +
        (process.env.STRIPE_WEBHOOK_SECRET || ""),
    )
  );
}
async function stripeRequest(
  path: string,
  body?: URLSearchParams,
  idempotencyKey?: string,
) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new ApiError(
      502,
      "PAYMENT_PROVIDER_UNAVAILABLE",
      "Payment could not be started; please retry",
    );
  return SessionSchema.parse(await response.json());
}
function redirectFor(session: z.infer<typeof SessionSchema>) {
  if (!session.url || session.status !== "open")
    throw new ApiError(
      409,
      "PAYMENT_SESSION_CLOSED",
      "This payment session is closed. Check your order status.",
    );
  const url = new URL(session.url);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "checkout.stripe.com" ||
    url.username ||
    url.password
  )
    throw new ApiError(
      502,
      "INVALID_PAYMENT_REDIRECT",
      "Payment redirect could not be verified",
    );
  return session.url;
}
export class PaymentService {
  static availableMethods(): PaymentMethodType[] {
    return configured() ? ["CREDIT_CARD"] : [];
  }
  static assertAvailable(method: PaymentMethodType) {
    if (!this.availableMethods().includes(method))
      throw new ApiError(
        503,
        "PAYMENTS_UNAVAILABLE",
        "This payment method is not configured",
      );
  }
  static async initiatePayment(
    request: PaymentSessionRequest,
  ): Promise<PaymentSessionResponse> {
    this.assertAvailable(request.method);
    const origin = new URL(
      process.env.STOREFRONT_URL || "https://muschio.vercel.app",
    );
    const returns = [new URL(request.returnUrl), new URL(request.cancelUrl)];
    if (
      returns.some(
        (url) => url.origin !== origin.origin || url.username || url.password,
      )
    )
      throw new ApiError(
        400,
        "INVALID_RETURN_URL",
        "Payment return URL must belong to the storefront",
      );
    const { order, payment } = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${request.orderId} FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id: request.orderId },
        include: { shippingAddress: true },
      });
      if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
      if (!order.guestEmail)
        throw new ApiError(
          400,
          "ORDER_EMAIL_REQUIRED",
          "Order email is missing",
        );
      if (
        ![OrderStatus.PENDING, OrderStatus.PAYMENT_PENDING].includes(
          order.status as "PENDING" | "PAYMENT_PENDING",
        )
      )
        throw new ApiError(
          409,
          "ORDER_NOT_PAYABLE",
          "This order cannot accept payment",
        );
      if (
        order.currency !== "AED" ||
        order.currency !== request.currency ||
        !order.totalAmount.equals(new Prisma.Decimal(request.amount))
      )
        throw new ApiError(
          400,
          "AMOUNT_MISMATCH",
          "Payment currency and amount must match the order",
        );
      const expired = await tx.inventoryReservation.count({
        where: {
          orderId: order.id,
          OR: [{ isReleased: true }, { expiresAt: { lte: new Date() } }],
        },
      });
      const held = await tx.inventoryReservation.count({
        where: { orderId: order.id, isReleased: false },
      });
      if (expired || !held)
        throw new ApiError(
          409,
          "RESERVATION_EXPIRED",
          "The inventory hold has expired",
        );
      let payment = await tx.payment.findFirst({
        where: {
          orderId: order.id,
          provider: "CREDIT_CARD",
          status: {
            in: [PaymentStatus.INITIATED, PaymentStatus.REQUIRES_ACTION],
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (!payment)
        payment = await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "CREDIT_CARD",
            amount: order.totalAmount,
            currency: order.currency,
            status: "INITIATED",
          },
        });
      await tx.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "PAYMENT_PENDING" },
      });
      return { order, payment };
    });
    let session;
    if (payment.gatewayReference) {
      session = await stripeRequest(
        `checkout/sessions/${encodeURIComponent(payment.gatewayReference)}`,
      );
    } else {
      const body = new URLSearchParams({
        mode: "payment",
        "payment_method_types[0]": "card",
        success_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        customer_email: order.guestEmail!,
        client_reference_id: order.id,
        "metadata[orderId]": order.id,
        "line_items[0][price_data][currency]": order.currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": order.totalAmount
          .times(100)
          .toFixed(0),
        "line_items[0][price_data][product_data][name]": `Muschio order ${order.orderNumber}`,
        "line_items[0][quantity]": "1",
        expires_at: String(
          Math.floor(payment.createdAt.getTime() / 1000) + 1860,
        ),
      });
      session = await stripeRequest(
        "checkout/sessions",
        body,
        `muschio-payment-${payment.id}`,
      );
      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayReference: session.id, status: "REQUIRES_ACTION" },
      });
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "PAYMENT_PENDING" },
      });
    }
    return {
      paymentId: payment.id,
      sessionId: session.id,
      redirectUrl: redirectFor(session),
      status: "REQUIRES_ACTION",
    };
  }
  static async handleStripeWebhook(
    rawBody?: Buffer,
    signature?: string | string[],
  ) {
    if (!configured())
      throw new ApiError(
        503,
        "PAYMENTS_UNAVAILABLE",
        "Stripe is not configured",
      );
    if (
      !rawBody ||
      typeof signature !== "string" ||
      !verifyStripeSignature(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      )
    )
      throw new ApiError(400, "INVALID_SIGNATURE", "Invalid Stripe signature");
    const json: unknown = JSON.parse(rawBody.toString("utf8"));
    const envelope = z.object({ id: z.string(), type: z.string() }).parse(json);
    if (
      !["checkout.session.completed", "checkout.session.expired"].includes(
        envelope.type,
      )
    )
      return { status: "IGNORED" };
    const event = EventSchema.parse(json);
    if (
      event.livemode !== process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_")
    )
      throw new ApiError(400, "PAYMENT_MODE_MISMATCH", "Payment mode mismatch");
    return prisma.$transaction(async (tx) => {
      const session = event.data.object;
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${session.metadata.orderId} FOR UPDATE`;
      const existing = await tx.webhookEvent.findUnique({
        where: { eventId: event.id },
      });
      if (existing?.processed) return { status: "ALREADY_PROCESSED" };
      const payment = await tx.payment.findUnique({
        where: { gatewayReference: session.id },
        include: { order: true },
      });
      if (
        !payment ||
        payment.orderId !== session.metadata.orderId ||
        payment.provider !== "CREDIT_CARD"
      )
        throw new ApiError(
          400,
          "PAYMENT_REFERENCE_MISMATCH",
          "Payment reference mismatch",
        );
      if (event.type === "checkout.session.completed") {
        if (session.payment_status !== "paid") return { status: "IGNORED" };
        if (
          session.currency?.toUpperCase() !== payment.currency ||
          !payment.amount
            .times(100)
            .equals(new Prisma.Decimal(session.amount_total ?? -1))
        )
          throw new ApiError(
            400,
            "AMOUNT_MISMATCH",
            "Captured amount does not match order",
          );
        if (payment.status !== "CAPTURED") {
          if (!["PENDING", "PAYMENT_PENDING"].includes(payment.order.status))
            throw new ApiError(
              409,
              "ORDER_NOT_PAYABLE",
              "Order requires payment reconciliation",
            );
          await InventoryService.commitOrderInventory(payment.orderId, tx);
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "CAPTURED" },
          });
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
          });
        }
      } else if (payment.status !== "CAPTURED") {
        await InventoryService.releaseOrderReservations(payment.orderId, tx);
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "CANCELLED" },
        });
        await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: { in: ["PENDING", "PAYMENT_PENDING"] },
          },
          data: { status: "CANCELLED" },
        });
      }
      await tx.webhookEvent.upsert({
        where: { eventId: event.id },
        create: {
          eventId: event.id,
          provider: "CREDIT_CARD",
          payload: json as Prisma.InputJsonValue,
          processed: true,
        },
        update: { processed: true },
      });
      return { status: "PROCESSED" };
    });
  }
}
