import { z } from "zod";
export const DeliveryCountrySchema = z.enum(["AE", "SA", "QA", "KW", "BH", "OM"]);
export const DeliveryRequestSchema = z.object({
  country: DeliveryCountrySchema,
  subtotal: z.number().finite().nonnegative().max(10000000),
  currency: z.literal("AED").default("AED"),
});
export const DeliveryRuleSchema = z.object({
  id: z.string().min(1).max(60),
  country: DeliveryCountrySchema,
  name: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  feeFils: z.number().int().nonnegative(),
  freeAboveFils: z.number().int().nonnegative().optional(),
  minBusinessDays: z.number().int().min(1),
  maxBusinessDays: z.number().int().min(1),
}).refine(rule => rule.maxBusinessDays >= rule.minBusinessDays, "Invalid delivery window");
export const DeliveryResponseSchema = z.object({
  enabled: z.boolean(),
  currency: z.literal("AED"),
  services: z.array(z.object({
    id: z.string(), name: z.string(), nameAr: z.string(),
    feeFils: z.number().int().nonnegative(),
    minBusinessDays: z.number().int(), maxBusinessDays: z.number().int(),
  })),
});
export type DeliveryRequest = z.infer<typeof DeliveryRequestSchema>;
export type DeliveryResponse = z.infer<typeof DeliveryResponseSchema>;
export type DeliveryRule = z.infer<typeof DeliveryRuleSchema>;

/** Courier implementations must be server-side and supply authenticated, idempotent events. */
export interface DeliveryProvider {
  createShipment(input: { fulfillmentId: string; idempotencyKey: string }): Promise<{ trackingNumber: string; trackingUrl?: string }>;
  trackShipment(trackingNumber: string): Promise<{ status: "LABEL_CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION" | "FAILED"; occurredAt: string }>;
}
