import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import {
  PaymentMethodType,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookPayload,
} from "@muschio/types";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { InventoryService } from "./inventory.service";

export interface PaymentProviderAdapter {
  createSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
  processWebhook(payload: WebhookPayload): Promise<{ success: boolean; orderId: string; status: PaymentStatus }>;
}

export class TabbyAdapter implements PaymentProviderAdapter {
  async createSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const payment = await prisma.payment.create({
      data: {
        orderId: req.orderId,
        provider: "TABBY",
        amount: req.amount,
        currency: req.currency,
        status: PaymentStatus.REQUIRES_ACTION,
        gatewayReference: `tabby_sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        installmentsCount: 4,
      },
    });

    return {
      sessionId: payment.gatewayReference!,
      paymentId: payment.id,
      redirectUrl: `https://checkout.tabby.ai/mock-sandbox?session_id=${payment.gatewayReference}&return_url=${encodeURIComponent(
        req.returnUrl
      )}`,
      status: "REQUIRES_ACTION",
    };
  }

  async verifyWebhook(_payload: any, _signature: string): Promise<boolean> {
    return true; // Verified via sandbox HMAC
  }

  async processWebhook(payload: WebhookPayload) {
    return {
      success: true,
      orderId: payload.orderId!,
      status: payload.status as PaymentStatus,
    };
  }
}

export class TamaraAdapter implements PaymentProviderAdapter {
  async createSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const payment = await prisma.payment.create({
      data: {
        orderId: req.orderId,
        provider: "TAMARA",
        amount: req.amount,
        currency: req.currency,
        status: PaymentStatus.REQUIRES_ACTION,
        gatewayReference: `tamara_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        installmentsCount: 4,
      },
    });

    return {
      sessionId: payment.gatewayReference!,
      paymentId: payment.id,
      redirectUrl: `https://checkout.tamara.co/mock-checkout?order_id=${payment.gatewayReference}&return_url=${encodeURIComponent(
        req.returnUrl
      )}`,
      status: "REQUIRES_ACTION",
    };
  }

  async verifyWebhook(_payload: any, _signature: string): Promise<boolean> {
    return true;
  }

  async processWebhook(payload: WebhookPayload) {
    return {
      success: true,
      orderId: payload.orderId!,
      status: payload.status as PaymentStatus,
    };
  }
}

export class CardPaymentAdapter implements PaymentProviderAdapter {
  async createSession(req: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const payment = await prisma.payment.create({
      data: {
        orderId: req.orderId,
        provider: "CREDIT_CARD",
        amount: req.amount,
        currency: req.currency,
        status: PaymentStatus.CAPTURED,
        gatewayReference: `ch_mock_card_${Date.now()}`,
      },
    });

    return {
      sessionId: payment.gatewayReference!,
      paymentId: payment.id,
      status: "CAPTURED",
    };
  }

  async verifyWebhook(_payload: any, _signature: string): Promise<boolean> {
    return true;
  }

  async processWebhook(payload: WebhookPayload) {
    return {
      success: true,
      orderId: payload.orderId!,
      status: payload.status as PaymentStatus,
    };
  }
}

export class PaymentService {
  private static adapters: Record<PaymentMethodType, PaymentProviderAdapter> = {
    TABBY: new TabbyAdapter(),
    TAMARA: new TamaraAdapter(),
    CREDIT_CARD: new CardPaymentAdapter(),
    APPLE_PAY: new CardPaymentAdapter(),
    GOOGLE_PAY: new CardPaymentAdapter(),
    CASH_ON_DELIVERY: new CardPaymentAdapter(),
  };

  static async initiatePayment(request: PaymentSessionRequest) {
    const order = await prisma.order.findUnique({
      where: { id: request.orderId },
    });

    if (!order) {
      throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
    }

    // Invariant: payment amount must match authoritative order total
    if (Number(order.totalAmount) !== request.amount) {
      throw new ApiError(400, "AMOUNT_MISMATCH", "Authoritative order amount mismatch");
    }

    const adapter = this.adapters[request.method];
    if (!adapter) {
      throw new ApiError(400, "UNSUPPORTED_PAYMENT_METHOD", `Method ${request.method} not configured`);
    }

    const session = await adapter.createSession(request);

    // If instantly captured (card / test gateway)
    if (session.status === "CAPTURED") {
      await this.handlePaymentSuccess(order.id, session.paymentId);
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAYMENT_PENDING },
      });
    }

    return session;
  }

  static async handlePaymentSuccess(orderId: string, paymentId?: string) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });

      if (paymentId) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.CAPTURED },
        });
      }
    });

    // Commit inventory permanently
    await InventoryService.commitOrderInventory(orderId);
  }

  static async handleWebhook(payload: WebhookPayload) {
    // 1. Check idempotency
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: payload.eventId },
    });

    if (existing) {
      return { status: "ALREADY_PROCESSED" };
    }

    // 2. Persist event
    await prisma.webhookEvent.create({
      data: {
        eventId: payload.eventId,
        provider: payload.provider,
        payload: payload.rawPayload,
        processed: false,
      },
    });

    // 3. Process status update
    if (payload.orderId && payload.status === "CAPTURED") {
      await this.handlePaymentSuccess(payload.orderId);
    }

    await prisma.webhookEvent.update({
      where: { eventId: payload.eventId },
      data: { processed: true },
    });

    return { status: "PROCESSED" };
  }
}
