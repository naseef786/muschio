import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import { CheckoutPayload } from "@muschio/types";
import { OrderStatus } from "@prisma/client";
import { InventoryService } from "./inventory.service";

export class CheckoutService {
  static async processCheckout(payload: CheckoutPayload) {
    const { cartId, shippingAddress, currency = "AED", customerNotes } = payload;

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
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
    let subtotal = 0;
    const itemsToReserve: Array<{ variantId: string; quantity: number }> = [];

    for (const item of cart.items) {
      const price = Number(item.variant.price);
      subtotal += price * item.quantity;
      itemsToReserve.push({
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const shippingAmount = subtotal >= 500 ? 0 : 35;
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + shippingAmount;

    // Generate Luxury Order Number
    const orderNumber = `MSC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.$transaction(async (tx) => {
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
              totalPrice: Number(item.variant.price) * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      // 4. Reserve inventory for 15 minutes
      await InventoryService.reserveInventory({
        items: itemsToReserve,
        sessionId: cart.guestSessionId || undefined,
        orderId: order.id,
        durationMinutes: 15,
      });

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
