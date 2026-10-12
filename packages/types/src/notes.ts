import { z } from "zod";
import { ProductSchema, NotePositionSchema } from "./catalog";

export const NoteStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type NoteStatus = z.infer<typeof NoteStatusSchema>;

export const NoteSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slugEn: z.string().min(1),
  slugAr: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable(),
  status: NoteStatusSchema.default("PUBLISHED"),
  seoTitleEn: z.string().optional().nullable(),
  seoTitleAr: z.string().optional().nullable(),
  seoDescriptionEn: z.string().optional().nullable(),
  seoDescriptionAr: z.string().optional().nullable(),
  featuredProductCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Note = z.infer<typeof NoteSchema>;

export const NoteWithProductsSchema = NoteSchema.extend({
  products: z.array(
    z.object({
      product: ProductSchema,
      position: NotePositionSchema,
      prominence: z.number(),
    })
  ),
  relatedNotes: z.array(NoteSchema).optional(),
});
export type NoteWithProducts = z.infer<typeof NoteWithProductsSchema>;

export const NoteFilterQuerySchema = z.object({
  search: z.string().optional(),
  status: NoteStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
export type NoteFilterQuery = z.infer<typeof NoteFilterQuerySchema>;
