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

export const LoyaltyTierSchema = z.enum(["PRIVILEGE", "GOLD_SILLAGE", "ROYAL_AMBASSADOR"]);
export type LoyaltyTier = z.infer<typeof LoyaltyTierSchema>;

export const ClientProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  tier: LoyaltyTierSchema.default("PRIVILEGE"),
  tierNameEn: z.string().optional(),
  tierNameAr: z.string().optional(),
  tierMultiplier: z.number().optional(),
  tierBenefitsEn: z.array(z.string()).optional(),
  tierBenefitsAr: z.array(z.string()).optional(),
  nextTier: z
    .object({
      tierKey: z.string(),
      tierNameEn: z.string(),
      tierNameAr: z.string(),
      pointsThreshold: z.number(),
      pointsNeeded: z.number(),
    })
    .nullable()
    .optional(),
  loyaltyPoints: z.number().int().default(0),
  loyaltyCreditsAed: z.number().default(0),
  isVip: z.boolean().default(false),
  joinedDate: z.string(),
  fragranceProfile: FragranceProfileSchema.optional().nullable(),
});
export type ClientProfile = z.infer<typeof ClientProfileSchema>;

export const SavedAddressSchema = z.object({
  id: z.string(),
  customerId: z.string().optional().nullable(),
  label: z.string().optional(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  streetAddress: z.string(),
  apartment: z.string().nullable().optional(),
  city: z.string(),
  emirateState: z.string().nullable().optional(),
  countryCode: z.string().default("AE"),
  postalCode: z.string().nullable().optional(),
  isDefault: z.boolean().default(false),
});
export type SavedAddress = z.infer<typeof SavedAddressSchema>;

export const CreateSavedAddressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  streetAddress: z.string().min(3),
  apartment: z.string().optional(),
  city: z.string().min(1),
  emirateState: z.string().optional(),
  countryCode: z.string().default("AE"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});
export type CreateSavedAddress = z.infer<typeof CreateSavedAddressSchema>;

export const CustomerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type CustomerLoginInput = z.infer<typeof CustomerLoginSchema>;

export const CustomerRegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  password: z.string().min(8).regex(/[A-Z]/, "Password must include an uppercase letter").regex(/[0-9]/, "Password must include a number"),
});
export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>;

