import { z } from "zod";
import { DeliveryRequest, DeliveryResponse, DeliveryRuleSchema } from "@muschio/types";

const DEFAULT_GCC_DELIVERY_RULES = [
  {
    id: "AE-WHITE-GLOVE",
    country: "AE",
    name: "Muschio White Glove Courier",
    nameAr: "توصيل مسكيو الفاخر المباشر",
    feeFils: 3500, // 35 AED
    freeAboveFils: 50000, // Free above 500 AED
    minBusinessDays: 1,
    maxBusinessDays: 2,
  },
  {
    id: "AE-SAME-DAY",
    country: "AE",
    name: "Dubai VIP Same-Day Courier",
    nameAr: "توصيل فوري كبار الشخصيات في نفس اليوم - دبي",
    feeFils: 5000, // 50 AED
    freeAboveFils: 100000, // Free above 1000 AED
    minBusinessDays: 0,
    maxBusinessDays: 1,
  },
  {
    id: "SA-EXPRESS",
    country: "SA",
    name: "KSA Express Air Delivery",
    nameAr: "شحن جوي سريع للمملكة العربية السعودية",
    feeFils: 4500, // 45 AED
    freeAboveFils: 75000, // Free above 750 AED
    minBusinessDays: 2,
    maxBusinessDays: 4,
  },
  {
    id: "QA-EXPRESS",
    country: "QA",
    name: "Qatar Priority Courier",
    nameAr: "شحن سريع أولوي لدولة قطر",
    feeFils: 5500,
    freeAboveFils: 75000,
    minBusinessDays: 2,
    maxBusinessDays: 4,
  },
  {
    id: "KW-EXPRESS",
    country: "KW",
    name: "Kuwait Express Courier",
    nameAr: "شحن سريع لدولة الكويت",
    feeFils: 5000,
    freeAboveFils: 75000,
    minBusinessDays: 2,
    maxBusinessDays: 4,
  },
  {
    id: "BH-EXPRESS",
    country: "BH",
    name: "Bahrain Express Courier",
    nameAr: "شحن سريع لمملكة البحرين",
    feeFils: 4500,
    freeAboveFils: 75000,
    minBusinessDays: 2,
    maxBusinessDays: 4,
  },
  {
    id: "OM-EXPRESS",
    country: "OM",
    name: "Oman Express Courier",
    nameAr: "شحن سريع لسلطنة عمان",
    feeFils: 4500,
    freeAboveFils: 75000,
    minBusinessDays: 2,
    maxBusinessDays: 4,
  },
];

export function quoteDelivery(
  input: DeliveryRequest,
  enabled: boolean,
  rules: unknown,
): DeliveryResponse {
  if (!enabled) return { enabled: false, currency: "AED", services: [] };

  const parsed = z.array(DeliveryRuleSchema).safeParse(rules);
  const activeRules =
    parsed.success && parsed.data.length > 0
      ? parsed.data
      : DEFAULT_GCC_DELIVERY_RULES;

  const subtotalFils = Math.round(input.subtotal * 100);
  const matchedServices = activeRules
    .filter((rule) => rule.country === input.country)
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      nameAr: rule.nameAr,
      feeFils:
        rule.freeAboveFils !== undefined && subtotalFils >= rule.freeAboveFils
          ? 0
          : rule.feeFils,
      minBusinessDays: rule.minBusinessDays,
      maxBusinessDays: rule.maxBusinessDays,
    }));

  return {
    enabled: true,
    currency: "AED",
    services: matchedServices,
  };
}

export class DeliveryService {
  static quote(input: DeliveryRequest) {
    const isExplicitlyDisabled = process.env.DELIVERY_ENABLED === "false";
    if (isExplicitlyDisabled) {
      return { enabled: false, currency: "AED", services: [] };
    }

    let rules: unknown = null;
    if (process.env.DELIVERY_RULES_JSON) {
      try {
        rules = JSON.parse(process.env.DELIVERY_RULES_JSON);
      } catch {
        rules = null;
      }
    }

    return quoteDelivery(input, true, rules || DEFAULT_GCC_DELIVERY_RULES);
  }
}
