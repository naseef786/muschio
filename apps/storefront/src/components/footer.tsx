import React from "react";
import { Link } from "../navigation";
import { ThemeToggle } from "./theme-toggle";
import { ShieldCheck, Phone, Mail } from "lucide-react";

export function Footer({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);

  const socialLinks = [
    {
      name: "Instagram",
      handle: "@muschio.parfums",
      href: "https://www.instagram.com/muschio.parfums",
      icon: (
        <svg className="w-4 h-4 fill-current block m-auto" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      handle: "@muschio.haute",
      href: "https://www.tiktok.com/@muschio.haute",
      icon: (
        <svg className="w-4 h-4 fill-current block m-auto" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.05c-.01 2.21-.86 4.33-2.39 5.89-1.54 1.57-3.73 2.45-5.94 2.43-2.21-.01-4.38-.91-5.9-2.5-1.52-1.58-2.34-3.73-2.29-5.94.05-2.21.94-4.34 2.51-5.87 1.57-1.52 3.73-2.34 5.94-2.29.34.01.68.04 1.01.1v4.07c-.33-.09-.68-.13-1.02-.13-1.14-.02-2.25.43-3.05 1.25-.8.81-1.23 1.94-1.18 3.08.05 1.13.56 2.21 1.41 2.96.84.75 1.99 1.13 3.12 1.05 1.13-.07 2.19-.64 2.9-1.52.42-.51.68-1.13.73-1.78.02-1.74.01-3.48.01-5.23V.02h-.37z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      handle: "@muschio_haute",
      href: "https://twitter.com/muschio_haute",
      icon: (
        <svg className="w-4 h-4 fill-current block m-auto" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "Muschio Haute Parfumerie",
      href: "https://www.youtube.com/@muschiohaute",
      icon: (
        <svg className="w-4 h-4 fill-current block m-auto" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Col 1: Muschio Identity & Regional Presence */}
        <div className="flex flex-col justify-start">
          <div className="h-10 flex flex-col justify-end">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-accent block">
              {c("Haute Parfumerie", "دار العطور النادرة")}
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="font-serif text-3xl sm:text-4xl tracking-[0.16em] text-white hover:opacity-85 transition-opacity inline-block font-medium leading-none"
            >
              MUSCHIO
            </Link>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed text-[#A3A39C] mt-3">
            {c(
              "Haute Parfumerie & Niche Fragrance Platform dedicated to the connoisseurs of the Arabian Gulf. Curating rare extraits de parfum, aged attars, and crystalline olfactory creations.",
              "دار العطور الفاخرة المكرسة لعشاق العطور الراقية في الخليج العربي. ننتقي خلاصات العطور النادرة والزيوت المعتقة من أرقى الدور العالمية المعتمدة.",
            )}
          </p>

          <div className="text-[11px] text-[#8E8E87] tracking-wide pt-2">
            <span>{c("Dubai · Abu Dhabi · Riyadh · Doha · Kuwait · Muscat", "دبي · أبوظبي · الرياض · الدوحة · الكويت · مسقط")}</span>
          </div>

          {/* Social Media Channels Row */}
          <div className="pt-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8E8E87] block mb-2 font-sans font-semibold">
              {c("Official Maisons", "الحسابات الرسمية")}
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={`${item.name} (${item.handle})`}
                  className="social-card-link w-9 h-9 rounded-sm bg-white/[0.06] hover:bg-white/[0.16] text-[#D4D1C8] hover:text-white border border-white/10 hover:border-white/25 flex items-center justify-center transition-all duration-200 group"
                >
                  <span className="flex items-center justify-center w-full h-full group-hover:scale-110 transition-transform duration-150 leading-none">
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: The Collection */}
        <div className="flex flex-col justify-start">
          <div className="h-10 flex flex-col justify-end">
            <h4 className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-white m-0">
              {c("THE COLLECTION", "المجموعة")}
            </h4>
          </div>
          <ul className="pt-4 space-y-3 text-xs sm:text-[13px]">
            <li>
              <Link href="/shop" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("All Fragrances", "جميع العطور")}
              </Link>
            </li>
            <li>
              <Link href="/shop?brandType=NICHE" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("Haute Niche Extraits", "عطور النيش الفاخرة")}
              </Link>
            </li>
            <li>
              <Link href="/shop?brandType=DESIGNER" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("Designer Privé", "ديزاينر برايفيت")}
              </Link>
            </li>
            <li>
              <Link href="/discover/sets" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("5 x 2ml Discovery Sets", "مجموعات العينات")}
              </Link>
            </li>
            <li>
              <Link href="/notes" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("Olfactory Notes Library", "مكتبة النوتات العطرية")}
              </Link>
            </li>
            <li>
              <Link href="/discover/ai" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block text-accent font-medium">
                {c("AI Scent Sommelier", "مستشار العطور الذكي")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: The Houses */}
        <div className="flex flex-col justify-start">
          <div className="h-10 flex flex-col justify-end">
            <h4 className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-white m-0">
              {c("THE HOUSES", "دور العطور")}
            </h4>
          </div>
          <ul className="pt-4 space-y-3 text-xs sm:text-[13px]">
            <li>
              <Link href="/brands/amouage" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                Amouage (Oman)
              </Link>
            </li>
            <li>
              <Link href="/brands/maison-francis-kurkdjian" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                Maison Francis Kurkdjian (Paris)
              </Link>
            </li>
            <li>
              <Link href="/brands/roja-parfums" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                Roja Parfums (London)
              </Link>
            </li>
            <li>
              <Link href="/brands/xerjoff" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                Xerjoff (Turin)
              </Link>
            </li>
            <li>
              <Link href="/brands/tom-ford" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                Tom Ford Private Blend
              </Link>
            </li>
            <li>
              <Link href="/brands" className="text-accent hover:underline inline-block font-medium">
                {c("View All Houses (A–Z) →", "عرض جميع الدور (أ–ي) ←")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Client Care & Contact Channels */}
        <div className="flex flex-col justify-start">
          <div className="h-10 flex flex-col justify-end">
            <h4 className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-white m-0">
              {c("CLIENT CARE & CONCIERGE", "خدمة العملاء والاتصال")}
            </h4>
          </div>
          <ul className="pt-4 space-y-3 text-xs sm:text-[13px]">
            <li>
              <Link href="/track" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block text-accent font-medium">
                {c("Track Order & Dispatch", "تتبع الطلب والشحنة")}
              </Link>
            </li>
            <li>
              <Link href="/guide" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("The Fragrance Compendium", "دليل وخفايا العطور")}
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("GCC Delivery Timelines", "مواعيد الشحن والتوصيل")}
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("Client Vault & Account", "حساب العميل والمساعد")}
              </Link>
            </li>
            <li>
              <Link href="/journal" className="hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform inline-block">
                {c("The Muschio Journal", "مجلة موسكيو")}
              </Link>
            </li>
          </ul>

          {/* Integrated Direct Contact Block */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-3 text-xs text-[#A3A39C]">
            <div className="flex items-center">
              <a
                href="tel:+97148006872"
                className="footer-contact-link inline-flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-accent group-hover:scale-110 transition-transform">
                  <Phone size={13} className="block" />
                </span>
                <span className="font-mono text-[#E5E3DC] inline-block">+971 4 800 MUSCHIO</span>
              </a>
            </div>
            <div className="flex items-center">
              <a
                href="mailto:concierge@muschio.luxury"
                className="footer-contact-link inline-flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-accent group-hover:scale-110 transition-transform">
                  <Mail size={13} className="block" />
                </span>
                <span className="inline-block">concierge@muschio.luxury</span>
              </a>
            </div>
            <div className="flex items-center pt-0.5">
              <a
                href="https://wa.me/97148006872?text=Hello%20Muschio%20Concierge,%20I%20would%20like%20assistance%20with%20a%20fragrance%20recommendation."
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link inline-flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors group"
              >
                <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </span>
                <span className="inline-block">{c("WhatsApp VIP Concierge", "مستشار واتساب المباشر")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Theme Switcher & Regional Indicators */}
      <div className="footer-bottom">
        <div className="text-[#8E8E87] text-xs leading-relaxed self-center">
          © {new Date().getFullYear()} MUSCHIO HAUTE PARFUMERIE. {c("All Rights Reserved.", "جميع الحقوق محفوظة.")}
        </div>
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap text-xs text-[#A3A39C] pe-16 lg:pe-24">
          <ThemeToggle locale={locale} showLabel={true} className="!p-0 text-[#A3A39C] hover:text-white self-center" />
          <span className="text-white/20 select-none self-center">|</span>
          <span className="self-center">{c("United Arab Emirates (AED)", "الإمارات العربية المتحدة (AED)")}</span>
          <span className="text-white/20 select-none self-center">|</span>
          <span className="inline-flex items-center gap-1.5 text-white/90 self-center">
            <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
            <span>{c("100% Authentic Flacons", "عطور معتمدة وأصلية ١٠٠٪")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
