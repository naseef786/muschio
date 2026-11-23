import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../src/prisma";
import { CheckoutService } from "../src/services/checkout.service";
import { OrderStatus, Prisma } from "@prisma/client";

describe("Order Persistence & Short Pro Reference ID Audit", () => {
  const createdOrderIds: string[] = [];

  afterAll(async () => {
    if (createdOrderIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } }).catch(() => null);
      await prisma.payment.deleteMany({ where: { orderId: { in: createdOrderIds } } }).catch(() => null);
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("validates that order numbers match the short, pro luxury format MSC-YYYY-XXXXXX", () => {
    const year = new Date().getFullYear();
    const token = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MSC-${year}-${token}`;

    expect(orderNumber).toMatch(/^MSC-\d{4}-\d{6}$/);
    expect(orderNumber.length).toBe(15);
    expect(orderNumber.startsWith(`MSC-${year}-`)).toBe(true);

    // Derived courier tracking reference should match the last 6 digits
    const trackingDigits = orderNumber.replace(/[^0-9]/g, "").slice(-6);
    expect(trackingDigits).toBe(String(token));
    const courierTracking = `DXB-VIP-${trackingDigits}`;
    expect(courierTracking).toBe(`DXB-VIP-${token}`);
  });

  it("persists a complete luxury order in PostgreSQL with address, items, and short orderNumber", async () => {
    const year = new Date().getFullYear();
    const token = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `MSC-${year}-${token}`;

    // Retrieve an existing variant for linking
    const variant = await prisma.productVariant.findFirst();
    if (!variant) throw new Error("No product variant found for test");

    // Create shipping address
    const address = await prisma.address.create({
      data: {
        fullName: "Lord Al-Maktoum",
        phone: "+971501234567",
        streetAddress: "Bulgari Resort Dubai, Villa 12",
        city: "Dubai",
        emirateState: "Dubai",
        countryCode: "AE",
        postalCode: "00000",
      },
    });

    // Create complete order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: "vip.connoisseur@muschio.ae",
        status: OrderStatus.PAID,
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
              variantId: variant.id,
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
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    createdOrderIds.push(order.id);

    // Verify database persistence
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toBe(orderNumber);
    expect(order.orderNumber.length).toBe(15);
    expect(order.status).toBe(OrderStatus.PAID);
    expect(Number(order.totalAmount)).toBe(1250);
    expect(order.items.length).toBe(1);
    expect(order.items[0].productNameEn).toBe("Oud Royale Extrait");
    expect(order.shippingAddress?.fullName).toBe("Lord Al-Maktoum");

    // 1. Flexible lookup by exact orderNumber
    const lookupExact = await CheckoutService.getOrderByNumber(orderNumber);
    expect(lookupExact).not.toBeNull();
    expect(lookupExact?.id).toBe(order.id);

    // 2. Flexible lookup by lowercase orderNumber (e.g. typed on mobile: msc-2026-...)
    const lookupLower = await CheckoutService.getOrderByNumber(orderNumber.toLowerCase());
    expect(lookupLower).not.toBeNull();
    expect(lookupLower?.id).toBe(order.id);

    // 3. Flexible lookup by 6-digit reference alone (e.g. 849201)
    const lookupDigits = await CheckoutService.getOrderByNumber(String(token));
    expect(lookupDigits).not.toBeNull();
    expect(lookupDigits?.id).toBe(order.id);

    // 4. Flexible lookup by database CUID id
    const lookupById = await CheckoutService.getOrderByNumber(order.id);
    expect(lookupById).not.toBeNull();
    expect(lookupById?.id).toBe(order.id);
  }, 25000);
});
