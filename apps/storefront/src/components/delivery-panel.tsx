"use client";

import { useEffect, useState } from "react";
import { DeliveryResponse, DeliveryResponseSchema } from "@muschio/types";
import { muschioApi } from "../lib/api";
import { Truck, ShieldCheck, Clock } from "lucide-react";

export function DeliveryPanel({
  country,
  subtotal = 0,
  locale,
  onSelect,
}: {
  country: string;
  subtotal?: number;
  locale: "en" | "ar";
  onSelect?: (id?: string, fee?: number) => void;
}) {
  const [quote, setQuote] = useState<DeliveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  useEffect(() => {
    let active = true;
    setLoading(true);

    muschioApi.quoteDelivery({ country, subtotal, currency: "AED" }).then((result) => {
      if (!active) return;
      const parsed = DeliveryResponseSchema.safeParse(result);
      if (parsed.success && parsed.data.enabled && parsed.data.services.length > 0) {
        setQuote(parsed.data);
        const defaultService = parsed.data.services[0];
        if (defaultService) {
          setSelected(defaultService.id);
          onSelect?.(defaultService.id, defaultService.feeFils / 100);
        }
      } else {
        setQuote(null);
        onSelect?.(undefined, undefined);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setQuote(null);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [country, subtotal, onSelect]);

  return (
    <div className="delivery-panel space-y-4" aria-busy={loading}>
      <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
        <div className="flex items-center gap-2.5">
          <Truck size={18} className="text-luxury-text" />
          <h2 className="font-serif text-lg sm:text-xl text-luxury-text font-normal m-0 p-0">
            {c("2. Delivery Method", "٢. طريقة التوصيل الفاخر")}
          </h2>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheck size={12} />
          <span>{c("Guaranteed GCC Delivery", "توصيل مضمون لدول الخليج")}</span>
        </span>
      </div>

      <p className="text-xs text-luxury-muted">
        {c(
          "All orders are dispatched in climate-controlled luxury packaging sealed with tamper-evident Maison tape.",
          "تُشحن كافة الطلبات داخل صناديق فاخرة مبردة ومحكمة الإغلاق بشريط الدار الأمني.",
        )}
      </p>

      {loading ? (
        <div className="p-4 bg-luxury-surface2 border border-luxury-border rounded-sm text-xs text-luxury-muted flex items-center gap-2">
          <Clock size={14} className="animate-spin text-accent" />
          <span>{c("Calculating real-time courier availability…", "جارٍ التحقق من خدمات التوصيل المتاحة…")}</span>
        </div>
      ) : !quote || quote.services.length === 0 ? (
        <div className="p-4 bg-luxury-surface2 border border-luxury-border rounded-sm text-xs text-luxury-muted">
          {c(
            "Complimentary white-glove courier is available for this destination. Final scheduling will be confirmed upon order dispatch.",
            "خدمة التوصيل بالقفاز الأبيض متاحة لهذه الوجهة. سيتم تأكيد الموعد النهائي فور خروج الشحنة.",
          )}
        </div>
      ) : (
        <fieldset className="space-y-2.5">
          <legend className="sr-only">{c("Delivery service", "خدمة التوصيل")}</legend>
          {quote.services.map((service) => {
            const isSelected = selected === service.id;
            const feeAed = service.feeFils / 100;
            return (
              <label
                key={service.id}
                className={`relative flex items-start gap-3 p-3.5 sm:p-4 border rounded-sm cursor-pointer transition-all ${
                  isSelected
                    ? "border-luxury-text bg-luxury-surface2 shadow-sm"
                    : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryService"
                  value={service.id}
                  checked={isSelected}
                  onChange={() => {
                    setSelected(service.id);
                    onSelect?.(service.id, feeAed);
                  }}
                  className="mt-1 accent-black dark:accent-white shrink-0"
                />

                <div className="flex-1 min-w-0 pe-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold text-luxury-text">
                      {isAr ? service.nameAr : service.name}
                    </span>
                    {feeAed === 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        {c("Complimentary", "مجاني")}
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-luxury-muted mt-0.5">
                    {c(
                      `Estimated delivery: ${service.minBusinessDays}–${service.maxBusinessDays} business days`,
                      `موعد التوصيل المتوقع: ${service.minBusinessDays}–${service.maxBusinessDays} أيام عمل`
                    )}
                  </span>
                </div>

                <div className="text-end shrink-0">
                  <span className="font-mono text-xs font-semibold text-luxury-text">
                    {feeAed === 0 ? c("FREE", "مجاناً") : `${feeAed.toFixed(0)} AED`}
                  </span>
                </div>
              </label>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
