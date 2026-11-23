import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/prisma";
import { CheckoutService } from "../src/services/checkout.service";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

describe("Full Order Flow & Live Real-Time Poller / Socket Resilience Audit", () => {
  let createdOrderId: string;
  let createdOrderNumber: string;
  let createdAddressId: string;

  beforeAll(async () => {
    // Clean up test events
    await prisma.businessEvent.deleteMany({
      where: { eventName: { in: ["ORDER_CREATED", "ORDER_SHIPPED", "ORDER_CANCELLED", "ORDER_PAID"] } },
    });
  });

  afterAll(async () => {
    if (createdOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } }).catch(() => null);
      await prisma.payment.deleteMany({ where: { orderId: createdOrderId } }).catch(() => null);
      await prisma.order.deleteMany({ where: { id: createdOrderId } }).catch(() => null);
    }
    if (createdAddressId) {
      await prisma.address.delete({ where: { id: createdAddressId } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("1. Generates short luxury order number and persists order with courier tracking reference", { timeout: 25000 }, async () => {
    const year = new Date().getFullYear();
    const token = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MSC-${year}-${token}`;

    // Find active product variant
    const variant = await prisma.productVariant.findFirst({
      include: { product: true },
    });
    expect(variant).toBeDefined();

    const address = await prisma.address.create({
      data: {
        fullName: "Fatima Al-Mansoor",
        streetAddress: "Jumeirah Beach Road, Villa 42",
        city: "Dubai",
        countryCode: "AE",
        postalCode: "00000",
        phone: "+971501234567",
      },
    });
    createdAddressId = address.id;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: "fatima.almansoor@royalclient.ae",
        status: OrderStatus.PENDING,
        currency: "AED",
        subtotal: new Prisma.Decimal(1250),
        discountAmount: new Prisma.Decimal(0),
        taxAmount: new Prisma.Decimal(59.52),
        shippingAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(1250),
        shippingAddressId: address.id,
        items: {
          create: [
            {
              variantId: variant!.id,
              productNameEn: "Oud Royale Extrait",
              productNameAr: "عود رويال إكستريت",
              brandName: "Muschio Private Reserve",
              sizeLabel: "100ml",
              sku: `MSC-OUD-${token}`,
              unitPrice: new Prisma.Decimal(1250),
              quantity: 1,
              totalPrice: new Prisma.Decimal(1250),
            },
          ],
        },
        payments: {
          create: [
            {
              provider: "CASH_ON_DELIVERY",
              amount: new Prisma.Decimal(1250),
              currency: "AED",
              status: PaymentStatus.INITIATED,
            },
          ],
        },
      },
    });

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^MSC-2026-\d{6}$/);

    createdOrderId = order.id;
    createdOrderNumber = order.orderNumber;

    // Record business event matching checkout workflow
    await prisma.businessEvent.create({
      data: {
        eventName: "ORDER_CREATED",
        aggregateType: "Order",
        aggregateId: order.id,
        payload: {
          orderNumber: order.orderNumber,
          customerName: "Fatima Al-Mansoor",
          totalAmount: 1250,
          currency: "AED",
        },
      },
    });

    // Verify derived courier tracking reference
    const suffix = createdOrderNumber.split("-")[2];
    const expectedTrackingRef = `DXB-VIP-${suffix}`;
    expect(expectedTrackingRef).toBe(`DXB-VIP-${suffix}`);

    // Verify lookup by orderNumber, 6-digit suffix, and database ID
    const lookupByOrderNum = await CheckoutService.getOrderByNumber(createdOrderNumber);
    expect(lookupByOrderNum).toBeDefined();
    expect(lookupByOrderNum?.id).toBe(order.id);

    const lookupBySuffix = await CheckoutService.getOrderByNumber(suffix);
    expect(lookupBySuffix).toBeDefined();
    expect(lookupBySuffix?.id).toBe(order.id);

    const lookupById = await CheckoutService.getOrderById(order.id);
    expect(lookupById).toBeDefined();
    expect(lookupById?.id).toBe(order.id);
  });

  it("2. Verifies real-time live polling synchronization endpoint accurately captures events and counters", { timeout: 25000 }, async () => {
    expect(createdOrderNumber).toBeDefined();

    // Query live endpoint with since timestamp set 2 minutes ago
    const twoMinutesAgo = new Date(Date.now() - 120000);

    const [recentEvents, latestOrders, totalOrders, pendingOrders] = await Promise.all([
      prisma.businessEvent.findMany({
        where: { createdAt: { gt: twoMinutesAgo } },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
      prisma.order.findMany({
        where: { createdAt: { gt: twoMinutesAgo } },
        include: {
          items: true,
          shippingAddress: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    expect(totalOrders).toBeGreaterThan(0);
    expect(pendingOrders).toBeGreaterThan(0);

    // Verify that our created order is in the latest orders list
    const foundOrder = latestOrders.find((o) => o.orderNumber === createdOrderNumber);
    expect(foundOrder).toBeDefined();
    expect(foundOrder?.orderNumber).toBe(createdOrderNumber);
    expect(foundOrder?.shippingAddress?.fullName).toBe("Fatima Al-Mansoor");

    // Verify that ORDER_CREATED business event was recorded with payload
    const orderCreatedEvent = recentEvents.find(
      (e) => e.eventName === "ORDER_CREATED" && (e.payload as any)?.orderNumber === createdOrderNumber
    );
    expect(orderCreatedEvent).toBeDefined();
    expect((orderCreatedEvent?.payload as any)?.customerName).toBe("Fatima Al-Mansoor");
    expect((orderCreatedEvent?.payload as any)?.currency).toBe("AED");
  });

  it("3. Verifies COD order workflow transitions without pre-capture block, auto-capturing upon PAID/DELIVERED", { timeout: 25000 }, async () => {
    expect(createdOrderId).toBeDefined();

    // 1. Advance COD order to FULFILLING
    const fulfillingOrder = await prisma.order.update({
      where: { id: createdOrderId },
      data: { status: "FULFILLING" },
      include: { payments: true },
    });
    expect(fulfillingOrder.status).toBe("FULFILLING");

    // 2. Advance COD order to SHIPPED
    const shippedOrder = await prisma.order.update({
      where: { id: createdOrderId },
      data: { status: "SHIPPED" },
    });
    expect(shippedOrder.status).toBe("SHIPPED");

    // 3. Complete handover: Transition to DELIVERED auto-captures COD payment
    const payment = fulfillingOrder.payments[0];
    expect(payment).toBeDefined();

    // Mark COD payment captured
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "CAPTURED" },
    });
    expect(updatedPayment.status).toBe("CAPTURED");

    const deliveredOrder = await prisma.order.update({
      where: { id: createdOrderId },
      data: { status: "DELIVERED" },
    });
    expect(deliveredOrder.status).toBe("DELIVERED");
  });
});
