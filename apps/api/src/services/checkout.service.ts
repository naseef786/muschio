import { prisma } from "../prisma";
import { DeliveryService } from "./delivery.service";
import { DeliveryRequestSchema } from "@muschio/types";
import { ApiError } from "../middleware/error-handler";
import { CheckoutPayload } from "@muschio/types";
import { OrderStatus, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { InventoryService } from "./inventory.service";

export class CheckoutService {
  static async processCheckout(payload: CheckoutPayload, sessionId: string) {
    const {
      cartId,
      shippingAddress,
      currency = "AED",
      customerNotes,
    } = payload;

    if (currency !== "AED")
      throw new ApiError(
        400,
        "UNSUPPORTED_CURRENCY",
        "Checkout currently supports AED only",
      );
    if (!payload.deliveryServiceId && shippingAddress.country !== "AE")
      throw new ApiError(
        400,
        "DELIVERY_UNAVAILABLE",
        "Configure delivery for this destination before checkout",
      );
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
      const cart = await tx.cart.findFirst({
        where: { id: cartId, guestSessionId: sessionId, customerId: null },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: { include: { brand: true } },
                  inventory: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "EMPTY_CART", "Cart is empty or not found");
      }

      // 1. Revalidate price & inventory server-side
      let subtotal = new Prisma.Decimal(0);
      const itemsToReserve: Array<{ variantId: string; quantity: number }> = [];

      for (const item of cart.items) {
        if (
          !item.variant.product.isPublished ||
          item.variant.isSampleVial ||
          item.quantity < 1 ||
          item.quantity > 99
        )
          throw new ApiError(
            409,
            "VARIANT_UNAVAILABLE",
            "An item in your bag is unavailable",
          );
        subtotal = subtotal.plus(item.variant.price.times(item.quantity));
        itemsToReserve.push({
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      let shippingAmount = subtotal.greaterThanOrEqualTo(500) ? 0 : 35;
      if (payload.deliveryServiceId) {
        const input = DeliveryRequestSchema.parse({
          country: shippingAddress.country,
          subtotal: subtotal.toNumber(),
          currency,
        });
        const quote = DeliveryService.quote(input);
        const service = quote.services.find(
          (service) => service.id === payload.deliveryServiceId,
        );
        if (!quote.enabled || !service)
          throw new ApiError(
            409,
            "DELIVERY_UNAVAILABLE",
            "Selected delivery service is unavailable",
          );
        shippingAmount = service.feeFils / 100;
      } else if (process.env.DELIVERY_ENABLED === "true") {
        throw new ApiError(
          400,
          "DELIVERY_REQUIRED",
          "Select an available delivery service",
        );
      }
      const taxAmount = subtotal
        .minus(subtotal.dividedBy(1.05))
        .toDecimalPlaces(2);
      const totalAmount = subtotal.plus(shippingAmount);

      // Generate Luxury Order Number
      const orderNumber = `MSC-${new Date().getFullYear()}-${randomUUID().slice(0, 18).toUpperCase()}`;
      // 2. Create Address record
      const address = await tx.address.create({
        data: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          streetAddress: shippingAddress.addressLine1 || "Dubai",
          apartment: shippingAddress.addressLine2,
          city: shippingAddress.city,
          emirateState: shippingAddress.stateOrEmirate,
          countryCode: shippingAddress.country || "AE",
          postalCode: shippingAddress.postalCode,
        },
      });

      // 3. Create Order in PENDING status
      const order = await tx.order.create({
        data: {
          orderNumber,
          guestEmail: shippingAddress.email,
          status: OrderStatus.PENDING,
          currency,
          subtotal,
          discountAmount: 0,
          taxAmount,
          shippingAmount,
          totalAmount,
          shippingAddressId: address.id,
          customerNotes,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              productNameEn: item.variant.product.nameEn,
              productNameAr: item.variant.product.nameAr,
              brandName: item.variant.product.brand.name,
              sizeLabel: item.variant.sizeLabelEn,
              sku: item.variant.sku,
              unitPrice: item.variant.price,
              quantity: item.quantity,
              totalPrice: item.variant.price.times(item.quantity),
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      // 4. Reserve inventory for 15 minutes
      await InventoryService.reserveInventory(
        {
          items: itemsToReserve,
          sessionId: cart.guestSessionId || undefined,
          orderId: order.id,
          durationMinutes: 35,
        },
        tx,
      );

      // 5. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  static async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
    });
  }
  static async getSessionOrders(sessionId: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { sessionId, orderId: { not: null } },
      distinct: ["orderId"],
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { orderId: true },
    });
    return prisma.order.findMany({
      where: {
        id: {
          in: reservations.flatMap((res) => (res.orderId ? [res.orderId] : [])),
        },
      },
      orderBy: { createdAt: "desc" },
      include: { items: true, payments: { orderBy: { createdAt: "desc" } } },
    });
  }

  static async getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
    });
  }
}
