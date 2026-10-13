import { z } from "zod";
import { CurrencySchema } from "./catalog";

export const PaymentMethodTypeSchema = z.enum([
  "TABBY",
  "TAMARA",
  "CREDIT_CARD",
  "APPLE_PAY",
  "GOOGLE_PAY",
  "CASH_ON_DELIVERY",
]);
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;

export const PaymentStatusSchema = z.enum([
  "INITIATED",
  "REQUIRES_ACTION",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const InstallmentPlanSchema = z.object({
  provider: PaymentMethodTypeSchema,
  installmentsCount: z.number().int().positive(),
  installmentAmount: z.number().positive(),
  currency: CurrencySchema,
  downpaymentAmount: z.number().nonnegative(),
  isEligible: z.boolean().default(true),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
});
export type InstallmentPlan = z.infer<typeof InstallmentPlanSchema>;

export const PaymentSessionRequestSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: CurrencySchema,
  method: PaymentMethodTypeSchema,
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});
export type PaymentSessionRequest = z.infer<typeof PaymentSessionRequestSchema>;

export const PaymentSessionResponseSchema = z.object({
  sessionId: z.string(),
  paymentId: z.string().uuid(),
  redirectUrl: z.string().url().optional(),
  clientSecret: z.string().optional(),
  status: PaymentStatusSchema,
});
export type PaymentSessionResponse = z.infer<
  typeof PaymentSessionResponseSchema
>;

export const WebhookPayloadSchema = z.object({
  provider: PaymentMethodTypeSchema,
  eventId: z.string(),
  eventType: z.string(),
  orderId: z.string().uuid().optional(),
  paymentReference: z.string(),
  status: PaymentStatusSchema,
  signature: z.string(),
  rawPayload: z.record(z.any()),
});
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
