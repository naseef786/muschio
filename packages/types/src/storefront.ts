import { z } from "zod";
export const StorefrontProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  nameEn: z.string(),
  nameAr: z.string(),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
  concentration: z.string(),
  brand: z.object({ name: z.string(), slug: z.string(), type: z.string() }),
  scentFamily: z
    .object({ slug: z.string(), nameEn: z.string(), nameAr: z.string() })
    .nullable(),
  images: z.array(z.string().url()),
  gender: z.string(),
  variants: z.array(
    z.object({
      id: z.string().uuid(),
      sku: z.string(),
      sizeLabelEn: z.string(),
      sizeLabelAr: z.string(),
      price: z.number().positive(),
      compareAtPrice: z.number().nullable(),
      isSampleVial: z.boolean(),
      availableQuantity: z.number().int().nonnegative(),
    }),
  ),
  notes: z.array(
    z.object({
      nameEn: z.string(),
      nameAr: z.string(),
      position: z.enum(["TOP", "HEART", "BASE"]),
      slug: z.string(),
    }),
  ),
});
export type StorefrontProduct = z.infer<typeof StorefrontProductSchema>;
export const StorefrontOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: z.string(),
  currency: z.literal("AED"),
  totalAmount: z.number().nonnegative(),
  paymentStatus: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      productNameEn: z.string(),
      productNameAr: z.string(),
      quantity: z.number().int().positive(),
      sizeLabel: z.string(),
      totalPrice: z.number().nonnegative(),
    }),
  ),
});
export type StorefrontOrder = z.infer<typeof StorefrontOrderSchema>;
