import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";

const include = {
  items: {
    include: {
      variant: {
        include: { product: { include: { brand: true } }, inventory: true },
      },
    },
  },
} as const;

export class CartService {
  static async getOrCreateCart(guestSessionId?: string, customerId?: string) {
    if (!guestSessionId && !customerId) {
      throw new ApiError(401, "SESSION_REQUIRED", "Session or customer ID required");
    }

    let cart = null;

    if (customerId) {
      cart = await prisma.cart.findFirst({
        where: { customerId },
        include,
      });

      if (!cart && guestSessionId) {
        cart = await prisma.cart.findUnique({
          where: { guestSessionId },
          include,
        });

        if (cart) {
          cart = await prisma.cart.update({
            where: { id: cart.id },
            data: { customerId },
            include,
          });
        }
      }

      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId, guestSessionId: guestSessionId || null },
          include,
        });
      }
    } else if (guestSessionId) {
      cart = await prisma.cart.upsert({
        where: { guestSessionId },
        create: { guestSessionId },
        update: {},
        include,
      });
    }

    if (!cart) {
      throw new ApiError(404, "CART_NOT_FOUND", "Cart not found");
    }

    return this.calculateCartTotals(cart);
  }

  static async addItem(params: {
    guestSessionId?: string;
    customerId?: string;
    variantId: string;
    quantity: number;
  }) {
    if (
      !Number.isInteger(params.quantity) ||
      params.quantity < 1 ||
      params.quantity > 99
    ) {
      throw new ApiError(400, "INVALID_QUANTITY", "Invalid quantity");
    }

    const cart = await this.getOrCreateCart(params.guestSessionId, params.customerId);

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cart.id} FOR UPDATE`;
      const variant = await tx.productVariant.findUnique({
        where: { id: params.variantId },
        include: {
          inventory: true,
          product: { select: { isPublished: true } },
        },
      });

      if (
        !variant?.inventory ||
        !variant.product.isPublished ||
        variant.isSampleVial
      ) {
        throw new ApiError(
          404,
          "VARIANT_NOT_FOUND",
          "Selected variant is unavailable",
        );
      }

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_variantId: { cartId: cart.id, variantId: params.variantId },
        },
      });

      const quantity = params.quantity + (existing?.quantity || 0);
      if (
        quantity > 99 ||
        quantity >
          variant.inventory.sealedQuantity - variant.inventory.reservedQuantity
      ) {
        throw new ApiError(
          409,
          "OUT_OF_STOCK",
          "Requested quantity is unavailable",
        );
      }

      await tx.cartItem.upsert({
        where: {
          cartId_variantId: { cartId: cart.id, variantId: params.variantId },
        },
        create: { cartId: cart.id, variantId: params.variantId, quantity },
        update: { quantity },
      });

      return this.calculateCartTotals(
        await tx.cart.findUniqueOrThrow({ where: { id: cart.id }, include }),
      );
    });
  }

  static async updateItem(
    itemId: string,
    quantity: number,
    sessionId: string,
    customerId?: string,
  ) {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
      throw new ApiError(400, "INVALID_QUANTITY", "Invalid quantity");
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            OR: [
              { guestSessionId: sessionId },
              ...(customerId ? [{ customerId }] : []),
            ],
          },
        },
        select: { cartId: true },
      });

      if (!item) {
        throw new ApiError(404, "CART_ITEM_NOT_FOUND", "Cart item not found");
      }

      await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${item.cartId} FOR UPDATE`;
      const current = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: { variant: { include: { inventory: true, product: true } } },
      });

      if (!current) {
        throw new ApiError(404, "CART_ITEM_NOT_FOUND", "Cart item not found");
      }

      if (quantity === 0) {
        await tx.cartItem.delete({ where: { id: itemId } });
      } else {
        const inventory = current.variant.inventory;
        if (
          !current.variant.product.isPublished ||
          current.variant.isSampleVial ||
          !inventory ||
          quantity > inventory.sealedQuantity - inventory.reservedQuantity
        ) {
          throw new ApiError(
            409,
            "OUT_OF_STOCK",
            "Requested quantity is unavailable",
          );
        }
        await tx.cartItem.update({ where: { id: itemId }, data: { quantity } });
      }

      return { success: true };
    });
  }

  static calculateCartTotals(cart: any) {
    const amount = cart.items.reduce(
      (sum: Prisma.Decimal, item: any) => {
        const itemPrice = item.variant.discountPrice && new Prisma.Decimal(item.variant.discountPrice).greaterThan(0) && new Prisma.Decimal(item.variant.discountPrice).lessThan(item.variant.price)
          ? item.variant.discountPrice
          : item.variant.price;
        return sum.plus(new Prisma.Decimal(itemPrice).times(item.quantity));
      },
      new Prisma.Decimal(0),
    ) as Prisma.Decimal;
    const shipping =
      amount.greaterThanOrEqualTo(500) || amount.isZero() ? 0 : 35;

    return {
      id: cart.id,
      currency: "AED",
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map((item: any) => ({
        id: item.id,
        cartId: cart.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      subtotal: amount.toNumber(),
      shippingTotal: shipping,
      discountTotal: 0,
      taxTotal: amount
        .minus(amount.dividedBy(1.05))
        .toDecimalPlaces(2)
        .toNumber(),
      grandTotal: amount.plus(shipping).toNumber(),
    };
  }
}
