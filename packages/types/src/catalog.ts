import { z } from "zod";

export const CurrencySchema = z.enum(["AED", "SAR", "USD", "QAR", "KWD", "OMR", "BHD"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const ConcentrationSchema = z.enum([
  "EXTRAIT_DE_PARFUM",
  "EAU_DE_PARFUM",
  "EAU_DE_TOILETTE",
  "EAU_DE_COLOGNE",
  "PARFUM_OIL",
  "ATTAR",
  "DISCOVERY_SET"
]);
export type Concentration = z.infer<typeof ConcentrationSchema>;

export const GenderCategorySchema = z.enum(["UNISEX", "MEN", "WOMEN"]);
export type GenderCategory = z.infer<typeof GenderCategorySchema>;

export const BrandTypeSchema = z.enum(["NICHE", "DESIGNER"]);
export type BrandType = z.infer<typeof BrandTypeSchema>;

export const NotePositionSchema = z.enum(["TOP", "HEART", "BASE"]);
export type NotePosition = z.infer<typeof NotePositionSchema>;

export const ProductRelationTypeSchema = z.enum([
  "SIMILAR",
  "COMPLEMENTARY_LAYERING",
  "FLANKER",
  "DISCOVERY_SAMPLE"
]);
export type ProductRelationType = z.infer<typeof ProductRelationTypeSchema>;

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: BrandTypeSchema,
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Brand = z.infer<typeof BrandSchema>;

export const ScentFamilySchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});
export type ScentFamily = z.infer<typeof ScentFamilySchema>;

export const AccordSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  colorHex: z.string().optional().nullable(),
});
export type Accord = z.infer<typeof AccordSchema>;

export const PerfumerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  bioEn: z.string().optional().nullable(),
  bioAr: z.string().optional().nullable(),
  portraitUrl: z.string().url().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
});
export type Perfumer = z.infer<typeof PerfumerSchema>;

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const OccasionSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
});
export type Occasion = z.infer<typeof OccasionSchema>;

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
});
export type Season = z.infer<typeof SeasonSchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string().optional(),
  sku: z.string().min(1),
  volume: z.string().or(z.number()).default("100ml"),
  volumeMl: z.number().positive().optional(),
  sizeLabelEn: z.string().optional(),
  sizeLabelAr: z.string().optional(),
  costPrice: z.number().nonnegative().default(0).optional(),
  regularPrice: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  salePrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  isSampleVial: z.boolean().default(false),
  stockQuantity: z.number().int().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  reservedQuantity: z.number().int().nonnegative().default(0).optional(),
  barcode: z.string().optional().nullable(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductNoteRelationSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  noteId: z.string().uuid(),
  position: NotePositionSchema,
  prominence: z.number().int().min(1).max(10).default(5),
});
export type ProductNoteRelation = z.infer<typeof ProductNoteRelationSchema>;

export const ProductAccordRelationSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  accordId: z.string().uuid(),
  prominence: z.number().int().min(1).max(10).default(5),
});
export type ProductAccordRelation = z.infer<typeof ProductAccordRelationSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  taglineEn: z.string().optional().nullable(),
  taglineAr: z.string().optional().nullable(),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  brandId: z.string().uuid(),
  brand: BrandSchema.optional(),
  scentFamilyId: z.string().uuid().optional().nullable(),
  scentFamily: ScentFamilySchema.optional().nullable(),
  concentration: ConcentrationSchema,
  gender: GenderCategorySchema,
  releaseYear: z.number().int().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  sillage: z.string().optional().nullable(),
  longevity: z.string().optional().nullable(),
  styleCharacter: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  ratingAverage: z.number().min(0).max(5).default(5.0),
  ratingCount: z.number().int().nonnegative().default(0),
  variants: z.array(ProductVariantSchema).default([]),
  notes: z.array(ProductNoteRelationSchema).default([]),
  accords: z.array(ProductAccordRelationSchema).default([]),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductFilterSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  brandSlug: z.string().optional(),
  brandType: BrandTypeSchema.optional(),
  family: z.string().optional(),
  scentFamilySlug: z.string().optional(),
  gender: GenderCategorySchema.optional(),
  concentration: ConcentrationSchema.optional(),
  note: z.string().optional(),
  noteSlug: z.string().optional(),
  accord: z.string().optional(),
  accordSlug: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "rating", "featured"]).default("featured"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

