import { z } from "zod";
import { PaymentMethodTypeSchema } from "./payment";

export const MarketCodeSchema = z.enum(["AE", "SA", "QA", "KW", "OM", "BH"]);
export type MarketCode = z.infer<typeof MarketCodeSchema>;

export const MarketSchema = z.object({
  id: z.string().uuid(),
  code: MarketCodeSchema,
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  currency: z.string().min(3),
  defaultLanguage: z.enum(["ar", "en"]).default("ar"),
  taxRatePercent: z.number().nonnegative().default(5.0),
  freeShippingThreshold: z.number().nonnegative().default(500),
  standardShippingFee: z.number().nonnegative().default(30),
  isEnabled: z.boolean().default(true),
  supportedPaymentTypes: z.array(PaymentMethodTypeSchema),
});
export type Market = z.infer<typeof MarketSchema>;

export const MarketPriceSchema = z.object({
  id: z.string().uuid(),
  marketId: z.string().uuid(),
  variantId: z.string().uuid(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
});
export type MarketPrice = z.infer<typeof MarketPriceSchema>;

export const CommercialOutcomeSchema = z.object({
  variantId: z.string().uuid(),
  sku: z.string(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  vatAmount: z.number().nonnegative(),
  vatRatePercent: z.number().nonnegative(),
  paymentFeeEstimated: z.number().nonnegative(),
  shippingFeeAllocated: z.number().nonnegative(),
  grossMarginAmount: z.number(),
  grossMarginPercent: z.number(),
});
export type CommercialOutcome = z.infer<typeof CommercialOutcomeSchema>;
