"use client";

import React, { useState } from "react";

export function FloatingWhatsApp({ locale = "en" }: { locale?: "en" | "ar" }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAr = locale === "ar";
  const c = (en: string, arabic: string) => (isAr ? arabic : en);

  const whatsappUrl =
    "https://wa.me/97148006872?text=" +
    encodeURIComponent(
      isAr
        ? "مرحباً بكم في مسكيو للعطور الفاخرة، أود الحصول على استشارة خاصة لاختيار عطري المفضل."
        : "Hello Muschio Concierge, I would like personal assistance with a luxury fragrance consultation.",
    );

  // 12 precision horology gear teeth for luxury mechanical aesthetic
  const gearTeeth = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div
      className="fixed bottom-6 end-6 sm:bottom-8 sm:end-8 z-40 flex items-center gap-3 pointer-events-auto select-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Floating Glassmorphic Tooltip Card (Appears on Hover/Focus) */}
      <div
        className={`transition-all duration-300 transform origin-bottom-right rtl:origin-bottom-left ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none hidden sm:block"
        }`}
      >
        <div className="ios-glass-card rounded-[20px] p-3.5 sm:p-4 w-64 sm:w-72 shadow-2xl border border-white/40 dark:border-white/10 text-start">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-accent">
              {c("VIP OLFACTORY CONCIERGE", "المستشار العطري الخاص")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{c("Online", "متصل الآن")}</span>
            </span>
          </div>

          <p className="text-xs text-luxury-muted mt-2 leading-relaxed">
            {c(
              "Direct white-glove fragrance curation, private batch reserves & GCC gift dispatch via WhatsApp.",
              "استشارة عطرية فورية، حجز الدفعات الخاصة، وتنسيق الإهداء الملكي لدول الخليج عبر واتساب.",
            )}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium tracking-wide shadow-md transition-all duration-200 active:scale-95 group/btn"
          >
            <span>{c("Start Private Consultation", "بدء المحادثة الفورية")}</span>
            <span className="group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform">
              {isAr ? "←" : "→"}
            </span>
          </a>
        </div>
      </div>

      {/* The Animated Gear WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={c("Contact VIP Concierge on WhatsApp", "تواصل مع المستشار العطري عبر واتساب")}
        title={c("WhatsApp VIP Concierge · Dubai & GCC", "المستشار العطري عبر واتساب · دبي والخليج")}
        className="group relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_28px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_36px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/40 flex-shrink-0"
      >
        {/* Animated Precision Mechanical Cogwheel / Gear Ring */}
        <div className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite] group-hover:animate-[spin_10s_linear_infinite] pointer-events-none transition-all duration-500">
          <svg
            width={56}
            height={56}
            viewBox="0 0 100 100"
            className="w-full h-full fill-[#C5A880] dark:fill-[#D4AF37] opacity-80 group-hover:opacity-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-opacity"
          >
            {/* 12 Outer Gear Teeth */}
            {gearTeeth.map((angle) => (
              <rect
                key={angle}
                x="46"
                y="1"
                width="8"
                height="10"
                rx="2"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
            {/* Gear Rim Ring */}
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="3" />
            {/* Inner Mechanical Caliber Ticks */}
            {gearTeeth.map((angle) => (
              <circle
                key={`dot-${angle}`}
                cx="50"
                cy="14"
                r="1.5"
                transform={`rotate(${angle + 15} 50 50)`}
                className="fill-[#A88B60]"
              />
            ))}
          </svg>
        </div>

        {/* Inner Core Dial: Emerald Glass Disc */}
        <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4ADE80] flex items-center justify-center shadow-inner border border-white/40 group-hover:brightness-105 transition-all flex-shrink-0 overflow-hidden">
          {/* Authentic WhatsApp Glyph */}
          <svg
            width={24}
            height={24}
            className="w-6 h-6 fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>

        {/* Live Active Pulsing Radar Indicator */}
        <span className="absolute top-0 end-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#171917]"></span>
        </span>
      </a>
    </div>
  );
}
