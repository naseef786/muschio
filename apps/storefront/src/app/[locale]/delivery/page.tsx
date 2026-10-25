"use client";

import React, { useState } from "react";
import { Link } from "../../../navigation";
import { DeliveryPanel } from "../../../components/delivery-panel";
import {
  ShieldCheck,
  Package,
  Thermometer,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DeliveryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const [country, setCountry] = useState("AE");
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const countries = [
    { code: "AE", nameEn: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", transitEn: "Same-day / Next-day", transitAr: "نفس اليوم / اليوم التالي" },
    { code: "SA", nameEn: "Saudi Arabia", nameAr: "المملكة العربية السعودية", transitEn: "2–4 Business Days", transitAr: "٢-٤ أيام عمل" },
    { code: "QA", nameEn: "Qatar", nameAr: "دولة قطر", transitEn: "2–3 Business Days", transitAr: "٢-٣ أيام عمل" },
    { code: "KW", nameEn: "Kuwait", nameAr: "دولة الكويت", transitEn: "2–4 Business Days", transitAr: "٢-٤ أيام عمل" },
    { code: "BH", nameEn: "Bahrain", nameAr: "مملكة البحرين", transitEn: "2–3 Business Days", transitAr: "٢-٣ أيام عمل" },
    { code: "OM", nameEn: "Oman", nameAr: "سلطنة عُمان", transitEn: "2–4 Business Days", transitAr: "٢-٤ أيام عمل" },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-10 sm:space-y-14">
      {/* 1. Header (Level Shoes Architectural Style) */}
      <div className="max-w-3xl space-y-3 pb-6 border-b border-luxury-border">
        <span className="eyebrow text-accent">
          {c("WHITE-GLOVE COURIER · GCC LOGISTICS", "خدمة التوصيل الفاخرة · الشحن الخليجي المعتمد")}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c(
            "Delivery, Thoughtfully Arranged.",
            "التوصيل الفاخر، برعاية خاصة تليق بمقتنياتك.",
          )}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted font-sans leading-relaxed">
          {c(
            "Every flacon dispatched from Muschio is treated as a cultural artifact. Shipped in custom climate-regulated packaging to protect delicate natural perfume oils, accompanied by official 2ml discovery vials and white-glove express tracking.",
            "تُعامل كل زجاجة عطر في موسكيو كتحفة فنية أصيلة. تُشحن في عبوات مبردة تحمي الزيوت العطرية النقية من حرارة الطقس، مرفقة بعينة تجريبية رسمية سعة ٢ مل مع تتبع فوري مباشر.",
          )}
        </p>
      </div>

      {/* 2. Interactive Destination Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Destination Selector & Live Rates (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 space-y-6">
            <div>
              <span className="eyebrow mb-1">
                {c("SELECT DESTINATION", "اختر وجهة التوصيل")}
              </span>
              <h2 className="font-serif text-2xl text-luxury-text font-normal">
                {c("Calculate GCC Delivery Estimates", "التحقق من خدمات ومواعيد الشحن")}
              </h2>
            </div>

            {/* Country Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {countries.map((item) => {
                const active = country === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setCountry(item.code)}
                    className={`p-3 text-start border transition-all ${
                      active
                        ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-sm font-medium"
                        : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold text-luxury-muted hover:text-luxury-text"
                    }`}
                  >
                    <span className="font-serif text-sm text-luxury-text block">
                      {c(item.nameEn, item.nameAr)}
                    </span>
                    <span className="text-[10px] text-accent block font-sans mt-0.5">
                      {c(item.transitEn, item.transitAr)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Delivery Panel */}
            <div className="pt-2">
              <DeliveryPanel country={country} locale={locale} subtotal={600} />
            </div>
          </div>
        </div>

        {/* Right: The 4 Muschio Guarantees (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 space-y-6">
            <span className="eyebrow text-accent">
              {c("OUR LOGISTICS STANDARDS", "معايير الشحن الفاخر")}
            </span>

            <div className="space-y-6">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
                  <Thermometer size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base text-luxury-text font-normal">
                    {c("Climate-Controlled Transit", "شحن مبرد ومحمي حرارياً")}
                  </h4>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    {c(
                      "Delicate natural extraits, Taif roses, and aged agarwood attars are insulated against extreme Arabian temperatures during transit.",
                      "تُحفظ خلاصات الإكستري وورد الطائف ودهن العود المعتق داخل عوازل حرارية لحمايتها من حرارة الصيف الخليجي.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
                  <Package size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base text-luxury-text font-normal">
                    {c("2ml Testing Vial Included", "عينة تجريبية ٢ مل مع كل زجاجة")}
                  </h4>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    {c(
                      "Every full bottle arrives with a matching 2ml sample vial. Test the scent on your skin first; returns are welcomed on unopened, sealed boxes.",
                      "تصل كل زجاجة كاملة مع عينة ٢ مل مطابقة لتجربتها أولاً على بشرتك؛ نرحب بالإرجاع طالما ظل الصندوق الخارجي مغلفاً.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
                  <ShieldCheck size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base text-luxury-text font-normal">
                    {c("All Duties & Taxes Cleared", "شامل الجمارك والضرائب الخليجية")}
                  </h4>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    {c(
                      "Orders shipped across KSA, Qatar, Kuwait, Bahrain, and Oman arrive with all customs and VAT pre-cleared. No surprise fees upon delivery.",
                      "تصل جميع الشحنات للخليج خالصّة الضرائب والرسوم الجمركية مسبقاً دون أي مبالغ إضافية عند الاستلام.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
                  <Clock size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base text-luxury-text font-normal">
                    {c("Complimentary on Orders >500 AED", "شحن مجاني للطلبات فوق ٥٠٠ د.إ")}
                  </h4>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    {c(
                      "Enjoy complimentary priority courier delivery across the GCC when your order exceeds 500 AED.",
                      "استمتع بخدمة التوصيل السريع المجاني في جميع دول مجلس التعاون الخليجي عند وصول قيمة الطلب إلى ٥٠٠ درهم.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border border-luxury-border bg-luxury-surface2 flex items-center justify-between">
            <div>
              <span className="font-serif text-base text-luxury-text font-normal block">
                {c("Looking for bespoke sampling?", "هل ترغب في تجربة العينات أولاً؟")}
              </span>
              <span className="text-xs text-luxury-muted">
                {c("Curate 5 x 2ml vials with 100% credit", "صمم صندوق ٥ عينات بقيمة مستردة ١٠٠٪")}
              </span>
            </div>
            <Link
              href="/discover/sets"
              className="text-xs font-sans font-medium text-luxury-text hover:text-accent flex items-center gap-1"
            >
              <span>{c("Discovery Sets", "صناديق العينات")}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
