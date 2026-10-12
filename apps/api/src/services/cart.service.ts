import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";

export class CartService {
  static async getOrCreateCart(guestSessionId?: string, customerId?: string) {
    if (!guestSessionId && !customerId) {
      throw new ApiError(400, "BAD_REQUEST", "Session or Customer ID required");
    }

    let cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(guestSessionId ? [{ guestSessionId }] : []),
          ...(customerId ? [{ customerId }] : []),
        ],
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { brand: true },
                },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          guestSessionId,
          customerId,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { brand: true },
                  },
                  inventory: true,
                },
              },
            },
          },
        },
      });
    }

    return this.calculateCartTotals(cart);
  }

  static async addItem(params: { guestSessionId?: string; customerId?: string; variantId: string; quantity: number }) {
    const { guestSessionId, customerId, variantId, quantity } = params;

    // Verify variant and stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true },
    });

    if (!variant || !variant.inventory) {
      throw new ApiError(404, "VARIANT_NOT_FOUND", "Selected fragrance size is unavailable");
    }

    const available = variant.inventory.sealedQuantity - variant.inventory.reservedQuantity;
    if (available < quantity) {
      throw new ApiError(409, "OUT_OF_STOCK", `Only ${Math.max(0, available)} units available in stock`);
    }

    const cart = await this.getOrCreateCart(guestSessionId, customerId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getOrCreateCart(guestSessionId, customerId);
  }

  static async updateItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }
    return { success: true };
  }

  static calculateCartTotals(cart: any) {
    let subtotal = 0;
    for (const item of cart.items) {
      const price = Number(item.variant.price);
      subtotal += price * item.quantity;
    }

    // Free luxury shipping over 500 AED, otherwise 35 AED
    const shippingTotal = subtotal >= 500 || subtotal === 0 ? 0 : 35;
    const taxTotal = Math.round(subtotal * 0.05 * 100) / 100; // 5% UAE VAT included / calculated
    const grandTotal = subtotal + shippingTotal;

    return {
      ...cart,
      subtotal,
      discountTotal: 0,
      taxTotal,
      shippingTotal,
      grandTotal,
    };
  }
}
