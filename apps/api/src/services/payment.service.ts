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
import { LoyaltyService } from "./loyalty.service";

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
    return configured()
      ? ["CREDIT_CARD", "APPLE_PAY", "GOOGLE_PAY", "CASH_ON_DELIVERY"]
      : ["CASH_ON_DELIVERY"];
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
    const allowedOrigins = [
      process.env.STOREFRONT_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://www.muschio.ae",
      "https://muschio.ae",
      "https://muschio.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ]
      .filter(Boolean)
      .map((u) => {
        try {
          return new URL(u!).origin.toLowerCase();
        } catch {
          return "";
        }
      })
      .filter(Boolean);

    const returns = [new URL(request.returnUrl), new URL(request.cancelUrl)];
    if (
      returns.some(
        (url) =>
          !allowedOrigins.includes(url.origin.toLowerCase()) ||
          url.username ||
          url.password,
      )
    ) {
      throw new ApiError(
        400,
        "INVALID_RETURN_URL",
        "Payment return URL must belong to the storefront",
      );
    }
    const { order, payment } = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${request.orderId} FOR UPDATE`;
      const order = await tx.order.findUnique({
        where: { id: request.orderId },
        include: { shippingAddress: true },
      });
      if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
      const email = order.guestEmail || request.customerEmail;
      if (!email)
        throw new ApiError(
          400,
          "ORDER_EMAIL_REQUIRED",
          "Order email is missing",
        );
      if (!order.guestEmail && request.customerEmail) {
        await tx.order.update({
          where: { id: order.id },
          data: { guestEmail: request.customerEmail },
        });
        order.guestEmail = request.customerEmail;
      }

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
      if (expired || !held) {
        // Auto-refresh / re-reserve hold for 35 minutes so client can seamlessly proceed
        const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
        if (orderItems.length) {
          await tx.inventoryReservation.updateMany({
            where: { orderId: order.id },
            data: { isReleased: true },
          });
          await InventoryService.reserveInventory(
            {
              items: orderItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
              orderId: order.id,
              durationMinutes: 35,
            },
            tx,
          );
        }
      }
      let payment = await tx.payment.findFirst({
        where: {
          orderId: order.id,
          provider: { in: ["CREDIT_CARD", "APPLE_PAY", "GOOGLE_PAY"] },
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
          Math.floor(Date.now() / 1000) + 2100,
        ),
      });
      session = await stripeRequest(
        "checkout/sessions",
        body,
        `muschio-payment-${payment.id}`,
      );
      await prisma.payment.update({
        where: { id: payment.id },
        data: { provider: "CREDIT_CARD", gatewayReference: session.id, status: "REQUIRES_ACTION" },
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

  static async verifyPaymentSession(sessionId: string) {
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      throw new ApiError(400, "INVALID_SESSION_ID", "Valid Stripe session id required");
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new ApiError(503, "PAYMENTS_UNAVAILABLE", "Stripe secret key not configured");
    }

    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.payment_method`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${stripeKey}` },
      },
    );

    if (!sessionRes.ok) {
      throw new ApiError(502, "PAYMENT_LOOKUP_FAILED", "Failed to retrieve session from Stripe");
    }

    const sessionData = await sessionRes.json();
    const orderId =
      sessionData.metadata?.orderId || sessionData.client_reference_id;

    if (!orderId) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "No order associated with this Stripe session");
    }

    // Extract rich card and settlement metadata from expanded Stripe session
    const pi = typeof sessionData.payment_intent === "object" ? sessionData.payment_intent : null;
    const pm = pi && typeof pi.payment_method === "object" ? pi.payment_method : null;
    const card = pm?.card || null;
    const cardBrand = card?.brand ? String(card.brand).toUpperCase() : "VISA";
    const cardLast4 = card?.last4 || "4242";
    const cardHolder = sessionData.customer_details?.name || pm?.billing_details?.name || "Muschio Client";
    const transactionId = pi?.id || sessionId;
    const receiptUrl = pi?.charges?.data?.[0]?.receipt_url || sessionData.url || null;

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          shippingAddress: true,
          customer: true,
          payments: {
            include: { events: true },
          },
        },
      });

      if (!order) {
        throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
      }

      const payment = order.payments.find(
        (candidate) => candidate.gatewayReference === sessionId,
      );
      if (!payment || payment.provider !== "CREDIT_CARD") {
        throw new ApiError(400, "PAYMENT_REFERENCE_MISMATCH", "This Stripe session is not associated with the order");
      }
      if (
        sessionData.currency?.toUpperCase() !== payment.currency ||
        !payment.amount.times(100).equals(new Prisma.Decimal(sessionData.amount_total ?? -1))
      ) {
        throw new ApiError(400, "AMOUNT_MISMATCH", "Captured amount does not match the order");
      }

      if (sessionData.payment_status === "paid") {
        let isNewlyPaid = false;
        if (order.status !== "PAID") {
          isNewlyPaid = true;
          await InventoryService.commitOrderInventory(order.id, tx);
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });

          const paymentRecord = await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "CAPTURED",
              // Keep the Checkout Session ID as the stable reconciliation key.
              // The PaymentIntent ID is stored in the payment event dossier.
              gatewayReference: sessionId,
            },
          });

          // Persist granular payment event dossier
          await tx.paymentEvent.create({
            data: {
              paymentId: paymentRecord.id,
              eventType: "CHARGE_CAPTURED",
              payload: {
                gateway: "STRIPE_CHECKOUT",
                sessionId,
                transactionId,
                cardBrand,
                cardLast4,
                cardExpMonth: card?.exp_month || null,
                cardExpYear: card?.exp_year || null,
                cardHolder,
                receiptUrl,
                paidAt: new Date().toISOString(),
              },
            },
          });

          await tx.businessEvent.create({
            data: {
              eventName: "ORDER_PAID",
              aggregateType: "ORDER",
              aggregateId: order.id,
              payload: {
                orderNumber: order.orderNumber,
                gateway: "STRIPE_CHECKOUT",
                sessionId,
                transactionId,
                cardBrand,
                cardLast4,
                cardHolder,
                totalAmount: Number(order.totalAmount),
                currency: order.currency,
                paidAt: new Date().toISOString(),
              },
            },
          });
          await LoyaltyService.commitOrderRedemption(order.id, tx);
          await LoyaltyService.awardOrderPoints(order.id, tx);
        }

        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: {
            items: true,
            shippingAddress: true,
            customer: true,
            payments: true,
          },
        });

        return {
          paid: true,
          isNewlyPaid,
          order: freshOrder,
        };
      }

      if (sessionData.status === "expired" && payment.status !== "CANCELLED") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "CANCELLED" },
        });
        await tx.order.updateMany({
          where: { id: order.id, status: { in: ["PENDING", "PAYMENT_PENDING"] } },
          data: { status: "CANCELLED" },
        });
        await InventoryService.releaseOrderReservations(order.id, tx);
        await LoyaltyService.releaseOrderRedemption(order.id, tx);
      }

      return {
        paid: false,
        status: sessionData.payment_status,
        order,
      };
    });
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
          await LoyaltyService.commitOrderRedemption(payment.orderId, tx);
          await LoyaltyService.awardOrderPoints(payment.orderId, tx);
        }
      } else if (payment.status !== "CAPTURED") {
        await InventoryService.releaseOrderReservations(payment.orderId, tx);
        await LoyaltyService.releaseOrderRedemption(payment.orderId, tx);
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
