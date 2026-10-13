import { z } from "zod";
import { CurrencySchema, ProductVariantSchema, ProductSchema } from "./catalog";

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  variant: ProductVariantSchema.optional(),
  product: ProductSchema.optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  guestSessionId: z.string().optional().nullable(),
  currency: CurrencySchema.default("AED"),
  items: z.array(CartItemSchema).default([]),
  subtotal: z.number().nonnegative().default(0),
  discountTotal: z.number().nonnegative().default(0),
  taxTotal: z.number().nonnegative().default(0),
  shippingTotal: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative().default(0),
  couponCode: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Cart = z.infer<typeof CartSchema>;

export const AddToCartInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99).default(1),
  guestSessionId: z.string().optional(),
});
export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

export const UpdateCartItemInputSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
});
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInputSchema>;
