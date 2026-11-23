import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../src/prisma";
import { ReturnsService } from "../src/services/returns.service";
import { PaymentService } from "../src/services/payment.service";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

describe("Returns Tracking & Refund Issuing Workflow", { timeout: 35000 }, () => {
  const createdOrderIds: string[] = [];
  const createdReturnIds: string[] = [];
  const createdVoucherCodes: string[] = [];

  afterAll(async () => {
    if (createdReturnIds.length > 0) {
      await prisma.returnInspection.deleteMany({
        where: { returnItem: { returnRequestId: { in: createdReturnIds } } },
      }).catch(() => null);
      await prisma.returnItem.deleteMany({
        where: { returnRequestId: { in: createdReturnIds } },
      }).catch(() => null);
      await prisma.returnRequest.deleteMany({
        where: { id: { in: createdReturnIds } },
      }).catch(() => null);
    }

    if (createdOrderIds.length > 0) {
      await prisma.paymentEvent.deleteMany({
        where: { payment: { orderId: { in: createdOrderIds } } },
      }).catch(() => null);
      await prisma.payment.deleteMany({
        where: { orderId: { in: createdOrderIds } },
      }).catch(() => null);
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: createdOrderIds } },
      }).catch(() => null);
      await prisma.businessEvent.deleteMany({
        where: { aggregateId: { in: createdOrderIds } },
      }).catch(() => null);
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } },
      }).catch(() => null);
    }

    if (createdVoucherCodes.length > 0) {
      await prisma.voucher.deleteMany({
        where: { code: { in: createdVoucherCodes } },
      }).catch(() => null);
    }

    await prisma.$disconnect();
  });

  async function createTestOrder(customTotal = 850) {
    const year = new Date().getFullYear();
    const token = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MSC-${year}-${token}`;

    const variant = await prisma.productVariant.findFirst({
      include: { product: { include: { brand: true } } },
    });
    if (!variant) throw new Error("No product variant found for returns test");

    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: `fatima.${token}@muschio.luxury`,
          firstName: "Fatima",
          lastName: "Al-Zahra",
        },
      });
    }
    const customerId = customer.id;

    const address = await prisma.address.create({
      data: {
        fullName: "Fatima Al-Zahra",
        phone: "+971509988776",
        streetAddress: "Jumeirah Bay Island, Villa 8",
        city: "Dubai",
        countryCode: "AE",
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        guestEmail: "fatima@muschio.ae",
        status: OrderStatus.DELIVERED,
        currency: "AED",
        subtotal: new Prisma.Decimal(customTotal),
        totalAmount: new Prisma.Decimal(customTotal),
        shippingAddressId: address.id,
      },
    });
    createdOrderIds.push(order.id);

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        variantId: variant.id,
        quantity: 1,
        unitPrice: new Prisma.Decimal(customTotal),
        totalPrice: new Prisma.Decimal(customTotal),
        productNameEn: variant.product.nameEn,
        productNameAr: variant.product.nameAr,
        brandName: variant.product.brand?.nameEn || "Amouage",
        sizeLabel: variant.sizeLabel || "100ml Flacon",
        sku: variant.sku || "MSC-SKU-TEST-100",
      },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "CREDIT_CARD",
        status: PaymentStatus.CAPTURED,
        amount: new Prisma.Decimal(customTotal),
        currency: "AED",
        gatewayReference: `ch_test_${token}`,
      },
    });

    return { order, orderItem, payment, variant, customerId };
  }

  it("submits a 7-day guarantee return request generating an RMA number (RET-YYYY-XXXX)", async () => {
    const { order, orderItem, customerId } = await createTestOrder(1250);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: order.id,
      customerId,
      reason: "Unopened sealed flacon - trial vial sampled and decided on another fragrance",
      requestedAction: "STORE_CREDIT",
      items: [{ orderItemId: orderItem.id, quantity: 1, reason: "Sealed flacon return" }],
    });

    createdReturnIds.push(returnRequest.id);

    expect(returnRequest.id).toBeDefined();
    expect(returnRequest.returnNumber).toMatch(/^RET-\d{4}-\d+$/);
    expect(returnRequest.status).toBe("REQUESTED");
    expect(returnRequest.requestedAction).toBe("STORE_CREDIT");
    expect(returnRequest.items.length).toBe(1);

    // Business event emitted for live admin notification
    const event = await prisma.businessEvent.findFirst({
      where: {
        eventName: "RETURN_REQUESTED",
        aggregateId: returnRequest.id,
      },
    });
    expect(event).toBeDefined();
    expect((event?.payload as any)?.returnNumber).toBe(returnRequest.returnNumber);
  });

  it("advances return workflow status through logistics stages", async () => {
    const { order, orderItem, customerId } = await createTestOrder(950);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: order.id,
      customerId,
      reason: "Pristine sealed flacon",
      requestedAction: "REFUND",
      items: [{ orderItemId: orderItem.id, quantity: 1 }],
    });
    createdReturnIds.push(returnRequest.id);

    // Stage 1: AUTHORIZED (courier dispatched)
    const authorized = await ReturnsService.updateReturnStatus({
      returnRequestId: returnRequest.id,
      status: "AUTHORIZED",
      trackingNumber: `DXB-RET-${returnRequest.returnNumber.slice(-6)}`,
      carrier: "Muschio GCC Climate Courier",
      notes: "Courier assigned for doorstep white-glove collection",
    });
    expect(authorized.status).toBe("AUTHORIZED");

    // Stage 2: IN_TRANSIT (in courier vehicle)
    const inTransit = await ReturnsService.updateReturnStatus({
      returnRequestId: returnRequest.id,
      status: "IN_TRANSIT",
      notes: "Package collected and sealed in temperature-controlled bag",
    });
    expect(inTransit.status).toBe("IN_TRANSIT");

    // Stage 3: RECEIVED_AT_WAREHOUSE (arrived at Atelier for physical inspection)
    const received = await ReturnsService.updateReturnStatus({
      returnRequestId: returnRequest.id,
      status: "RECEIVED_AT_WAREHOUSE",
      notes: "Flacon safely delivered to Dubai Atelier QA cleanroom",
    });
    expect(received.status).toBe("RECEIVED_AT_WAREHOUSE");
  });

  it("performs physical return inspection with RESTOCK_SELLABLE disposition", async () => {
    const { order, orderItem, customerId } = await createTestOrder(780);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: order.id,
      customerId,
      reason: "Pristine Sealed Flacon",
      requestedAction: "REFUND",
      items: [{ orderItemId: orderItem.id, quantity: 1 }],
    });
    createdReturnIds.push(returnRequest.id);

    const inspected = await ReturnsService.inspectReturnRequest({
      returnRequestId: returnRequest.id,
      condition: "PRISTINE_SEALED",
      disposition: "RESTOCK_SELLABLE",
      notes: "Cellophane intact, serial matched, flacon weight verified via precision scale",
    });

    expect(inspected.status).toBe("COMPLETED");

    // Inspection record created for return item
    const itemInspection = await prisma.returnInspection.findFirst({
      where: { returnItem: { returnRequestId: returnRequest.id } },
    });
    expect(itemInspection).toBeDefined();
    expect(itemInspection?.condition).toBe("PRISTINE_SEALED");
    expect(itemInspection?.disposition).toBe("RESTOCK_SELLABLE");
    expect(itemInspection?.refundApproved).toBe(true);
  });

  it("issues luxury store credit voucher valid for 12 months when requested", async () => {
    const { order, orderItem, customerId } = await createTestOrder(1450);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: order.id,
      customerId,
      reason: "Exchanging for private collection extrait",
      requestedAction: "STORE_CREDIT",
      items: [{ orderItemId: orderItem.id, quantity: 1 }],
    });
    createdReturnIds.push(returnRequest.id);

    const resolution = await ReturnsService.issueReturnRefund({
      returnRequestId: returnRequest.id,
      action: "STORE_CREDIT",
      refundAmount: 1450,
      reason: "Client chose luxury store voucher under 7-day guarantee",
    });

    expect(resolution.success).toBe(true);
    expect(resolution.method).toBe("STORE_CREDIT");
    expect(resolution.voucherCode).toMatch(/^CREDIT-RET-\d{6}$/);
    expect(resolution.amount).toBe(1450);

    createdVoucherCodes.push(resolution.voucherCode);

    // Verify voucher exists in Voucher table
    const voucher = await prisma.voucher.findUnique({
      where: { code: resolution.voucherCode },
    });
    expect(voucher).toBeDefined();
    expect(Number(voucher?.discountAmount)).toBe(1450);
    expect(voucher?.expiresAt).toBeDefined();
    // Expiration should be roughly 1 year in the future
    const oneYearFromNow = Date.now() + 360 * 24 * 60 * 60 * 1000;
    expect(voucher!.expiresAt!.getTime()).toBeGreaterThan(oneYearFromNow);

    // Return request is COMPLETED
    const updatedReturn = await prisma.returnRequest.findUnique({
      where: { id: returnRequest.id },
    });
    expect(updatedReturn?.status).toBe("COMPLETED");
    expect(updatedReturn?.reason).toContain(resolution.voucherCode);
  });

  it("reconciles payment refund and marks order REFUNDED when original payment refund is selected", async () => {
    const { order, orderItem, customerId } = await createTestOrder(890);

    const returnRequest = await ReturnsService.requestReturn({
      orderId: order.id,
      customerId,
      reason: "Client requested refund to original card",
      requestedAction: "REFUND",
      items: [{ orderItemId: orderItem.id, quantity: 1 }],
    });
    createdReturnIds.push(returnRequest.id);

    const resolution = await ReturnsService.issueReturnRefund({
      returnRequestId: returnRequest.id,
      action: "REFUND",
      refundAmount: 890,
      reason: "Client 7-day guarantee refund approved",
    });

    expect(resolution.success).toBe(true);
    expect(resolution.method).toBe("ORIGINAL_PAYMENT");

    // Order status is now REFUNDED
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { payments: true },
    });
    expect(updatedOrder?.status).toBe(OrderStatus.REFUNDED);
    expect(updatedOrder?.payments[0]?.status).toBe(PaymentStatus.REFUNDED);

    // Business event emitted
    const refundEvent = await prisma.businessEvent.findFirst({
      where: {
        eventName: "RETURN_REFUNDED",
        aggregateId: returnRequest.id,
      },
    });
    expect(refundEvent).toBeDefined();
  });
});
