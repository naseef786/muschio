import { z } from "zod";

export const FragranceProfileSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  preferredFamilies: z.array(z.string()).default([]),
  favoriteNotes: z.array(z.string()).default([]),
  dislikedNotes: z.array(z.string()).default([]),
  preferredSillage: z.string().optional().nullable(),
  preferredLongevity: z.string().optional().nullable(),
  signatureScentSlug: z.string().optional().nullable(),
});
export type FragranceProfile = z.infer<typeof FragranceProfileSchema>;

export const ReviewStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  customerName: z.string().optional(),
  productId: z.string().uuid(),
  orderItemId: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  body: z.string().min(1),
  longevityRating: z.number().int().min(1).max(5).optional().nullable(),
  sillageRating: z.number().int().min(1).max(5).optional().nullable(),
  isVerifiedPurchase: z.boolean().default(false),
  status: ReviewStatusSchema.default("APPROVED"),
  helpfulCount: z.number().int().default(0),
  imageUrls: z.array(z.string().url()).default([]),
  createdAt: z.string().or(z.date()),
});
export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewInputSchema = z.object({
  productId: z.string().uuid(),
  orderItemId: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
  longevityRating: z.number().int().min(1).max(5).optional(),
  sillageRating: z.number().int().min(1).max(5).optional(),
  imageUrls: z.array(z.string().url()).max(3).optional(),
});
export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;

export const ReturnStatusSchema = z.enum([
  "REQUESTED",
  "AUTHORIZED",
  "IN_TRANSIT",
  "RECEIVED_AT_WAREHOUSE",
  "INSPECTING",
  "COMPLETED",
  "REJECTED"
]);
export type ReturnStatus = z.infer<typeof ReturnStatusSchema>;

export const ReturnConditionSchema = z.enum([
  "PRISTINE_SEALED",
  "OPENED_SPRAYED",
  "DAMAGED_LEAKING",
  "DEFECTIVE_ATOMIZER",
  "COUNTERFEIT_SUSPECT"
]);
export type ReturnCondition = z.infer<typeof ReturnConditionSchema>;

export const ReturnDispositionSchema = z.enum([
  "RESTOCK_SELLABLE",
  "ALLOCATE_TESTER",
  "QUARANTINE_DISPOSAL"
]);
export type ReturnDisposition = z.infer<typeof ReturnDispositionSchema>;

export const ReturnInspectionSchema = z.object({
  id: z.string().uuid(),
  returnItemId: z.string().uuid(),
  inspectedBy: z.string(),
  condition: ReturnConditionSchema,
  disposition: ReturnDispositionSchema,
  refundApproved: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  inspectedAt: z.string().or(z.date()),
});
export type ReturnInspection = z.infer<typeof ReturnInspectionSchema>;
