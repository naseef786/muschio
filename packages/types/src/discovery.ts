import { z } from "zod";
import { ProductSchema } from "./catalog";

export const AIScentConsultationInputSchema = z.object({
  query: z.string().min(2),
  preferredNotes: z.array(z.string()).default([]),
  excludedNotes: z.array(z.string()).default([]),
  preferredFamilies: z.array(z.string()).default([]),
  gender: z.enum(["UNISEX", "MEN", "WOMEN"]).optional(),
  occasion: z.string().optional(),
  season: z.string().optional(),
  locale: z.enum(["en", "ar"]).default("en"),
});
export type AIScentConsultationInput = z.infer<typeof AIScentConsultationInputSchema>;

export const AIScentRecommendationItemSchema = z.object({
  sku: z.string(),
  productName: z.string(),
  brandName: z.string(),
  matchReasonEn: z.string(),
  matchReasonAr: z.string(),
  accordOverlap: z.array(z.string()),
  matchPercentage: z.number().int().min(50).max(100),
});
export type AIScentRecommendationItem = z.infer<typeof AIScentRecommendationItemSchema>;

export const AIScentConsultationResponseSchema = z.object({
  analysisEn: z.string(),
  analysisAr: z.string(),
  recommendations: z.array(AIScentRecommendationItemSchema),
  groundedProducts: z.array(ProductSchema).default([]),
});
export type AIScentConsultationResponse = z.infer<typeof AIScentConsultationResponseSchema>;

export const DiscoverySetItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  productNameEn: z.string(),
  productNameAr: z.string(),
  brandName: z.string(),
  volumeMl: z.literal(2),
});
export type DiscoverySetItem = z.infer<typeof DiscoverySetItemSchema>;

export const CustomDiscoverySetBuilderSchema = z.object({
  name: z.string().default("Custom 5x2ml Niche Discovery Set"),
  sampleVariantIds: z.array(z.string().uuid()).length(5),
});
export type CustomDiscoverySetBuilder = z.infer<typeof CustomDiscoverySetBuilderSchema>;
