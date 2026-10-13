import { z } from "zod";
import { DeliveryRequest, DeliveryResponse, DeliveryRuleSchema } from "@muschio/types";

/** No courier or rate is active until explicitly configured by the operator. */
export function quoteDelivery(input: DeliveryRequest, enabled: boolean, rules: unknown): DeliveryResponse {
  if (!enabled) return { enabled: false, currency: "AED", services: [] };
  const parsed = z.array(DeliveryRuleSchema).safeParse(rules);
  if (!parsed.success || new Set(parsed.data.map(rule => rule.id)).size !== parsed.data.length) {
    return { enabled: false, currency: "AED", services: [] };
  }
  const subtotalFils = Math.round(input.subtotal * 100);
  return {
    enabled: true, currency: "AED",
    services: parsed.data.filter(rule => rule.country === input.country).map(rule => ({
      id: rule.id, name: rule.name, nameAr: rule.nameAr,
      feeFils: rule.freeAboveFils !== undefined && subtotalFils >= rule.freeAboveFils ? 0 : rule.feeFils,
      minBusinessDays: rule.minBusinessDays, maxBusinessDays: rule.maxBusinessDays,
    })),
  };
}
export class DeliveryService {
  static quote(input: DeliveryRequest) {
    let rules: unknown = [];
    try { rules = JSON.parse(process.env.DELIVERY_RULES_JSON || "[]"); } catch { return quoteDelivery(input, false, []); }
    return quoteDelivery(input, process.env.DELIVERY_ENABLED === "true", rules);
  }
}
