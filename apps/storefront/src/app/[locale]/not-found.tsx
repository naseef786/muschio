"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Link } from "../../navigation";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function LocaleNotFound() {
  const params = useParams();
  const isAr = params?.locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="max-w-xl space-y-6">
        <span className="eyebrow text-accent">{c("OLFACTORY VAULT 404", "الخزانة العطرية ٤٠٤")}</span>
        <h1 className="font-serif text-4xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c("This Creation Remains Elusive.", "هذه التحفة العطرية غير متوفرة حالياً.")}
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-luxury-muted font-light italic">
          {c("The flacon or note you seek has moved.", "العطر أو الصفحة التي تبحث عنها لم نتمكن من العثور عليها.")}
        </p>
        <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-md mx-auto">
          {c(
            "The flacon or olfactory note you are seeking may have moved to our private archive, or the link has changed. Explore our curated maison collection below.",
            "ربما تم نقل العطر أو الصفحة إلى أرشيفنا الخاص أو تم تحديث الرابط. ندعوكم لاستكشاف مختاراتنا الفاخرة أو دليل الدور العالمية أدناه.",
          )}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="editorial-button flex items-center gap-2 text-xs"
          >
            <span>{c("Explore Collection", "استكشف المجموعة")}</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
          <Link
            href="/brands"
            className="editorial-button-secondary flex items-center gap-2 text-xs"
          >
            <Compass size={14} />
            <span>{c("The Houses", "دور العطور")}</span>
          </Link>
          <Link
            href="/"
            className="editorial-button-secondary flex items-center gap-2 text-xs"
          >
            <Home size={14} />
            <span>{c("Home", "الرئيسية")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
