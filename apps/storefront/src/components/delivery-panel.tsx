"use client";
import { useEffect, useState } from "react";
import { DeliveryResponse, DeliveryResponseSchema } from "@muschio/types";
import { muschioApi } from "../lib/api";

export function DeliveryPanel({ country, subtotal = 0, locale, onSelect }: { country: string; subtotal?: number; locale: "en" | "ar"; onSelect?: (id?: string, fee?: number) => void }) {
  const [quote, setQuote] = useState<DeliveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const c = (en: string, ar: string) => locale === "ar" ? ar : en;
  useEffect(() => {
    let active = true;
    setQuote(null); setLoading(true); setSelected(""); onSelect?.();
    muschioApi.quoteDelivery({ country, subtotal, currency: "AED" }).then(result => {
      if (!active) return;
      const parsed = DeliveryResponseSchema.safeParse(result);
      setQuote(parsed.success ? parsed.data : null); setLoading(false);
    });
    return () => { active = false; };
  }, [country, subtotal, onSelect]);
  return <section className="delivery-panel" aria-busy={loading}><h2>{c("Delivery to your door", "التوصيل إلى بابك")}</h2><p className="text-sm">{c("Choose your destination to check available delivery services.", "اختر وجهتك للتحقق من خدمات التوصيل المتاحة.")}</p>
    <div className="delivery-status" role="status">{loading ? c("Checking delivery options…", "جارٍ التحقق من خيارات التوصيل…") : !quote ? c("Delivery options are unavailable right now. Please try again later.", "خيارات التوصيل غير متاحة حالياً. يرجى المحاولة لاحقاً.") : !quote.enabled ? c("Online delivery booking is coming soon. Delivery dates and courier tracking will appear here once the service launches.", "حجز التوصيل عبر الإنترنت قريباً. ستظهر مواعيد التوصيل وتتبع الشحنات هنا عند إطلاق الخدمة.") : quote.services.length === 0 ? c("No delivery service is currently configured for this destination.", "لا توجد خدمة توصيل متاحة لهذه الوجهة حالياً.") : c("Estimated business days. Final availability is confirmed when your order is accepted.", "أيام العمل تقديرية. يتم تأكيد التوفر عند قبول طلبك.")}</div>
    {quote?.enabled && quote.services.length > 0 && <fieldset className="space-y-3 mt-5"><legend className="sr-only">{c("Delivery service", "خدمة التوصيل")}</legend>{quote.services.map(service => <label key={service.id} className="flex items-center gap-3 border border-luxury-border p-4"><input type="radio" name="deliveryService" value={service.id} checked={selected === service.id} onChange={() => { setSelected(service.id); onSelect?.(service.id, service.feeFils / 100); }} /><span className="flex-1">{locale === "ar" ? service.nameAr : service.name}<small className="block">{service.minBusinessDays}–{service.maxBusinessDays} {c("business days", "أيام عمل")}</small></span><span>{service.feeFils === 0 ? c("Free", "مجاني") : `${(service.feeFils / 100).toFixed(2)} AED`}</span></label>)}</fieldset>}
  </section>;
}
