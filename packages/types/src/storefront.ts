import { z } from "zod";
export const StorefrontProductSchema = z.object({
  id: z.string(),
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
  perfumer: z.string().nullable().optional(),
  perfumerBio: z.string().nullable().optional(),
  images: z.array(z.string()),
  gender: z.string(),
  variants: z.array(
    z.object({
      id: z.string(),
      sku: z.string(),
      volume: z.string().optional(),
      volumeMl: z.number().nullable().optional(),
      sizeLabelEn: z.string().optional(),
      sizeLabelAr: z.string().optional(),
      basePrice: z.number().nonnegative().optional().nullable(),
      regularPrice: z.number().nonnegative().optional(),
      originalPrice: z.number().nonnegative().optional(),
      price: z.number().nonnegative(),
      discountPrice: z.number().nullable().optional(),
      salePrice: z.number().nullable().optional(),
      compareAtPrice: z.number().nullable().optional(),
      isSampleVial: z.boolean().default(false),
      stock: z.number().int().nonnegative().optional(),
      stockQuantity: z.number().int().nonnegative().optional(),
      availableQuantity: z.number().int().nonnegative().default(10),
      warehouse: z.string().optional(),
      isDefault: z.boolean().default(false),
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
