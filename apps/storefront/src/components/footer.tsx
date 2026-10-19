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
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      handle: "@muschio.haute",
      href: "https://www.tiktok.com/@muschio.haute",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.05c-.01 2.21-.86 4.33-2.39 5.89-1.54 1.57-3.73 2.45-5.94 2.43-2.21-.01-4.38-.91-5.9-2.5-1.52-1.58-2.34-3.73-2.29-5.94.05-2.21.94-4.34 2.51-5.87 1.57-1.52 3.73-2.34 5.94-2.29.34.01.68.04 1.01.1v4.07c-.33-.09-.68-.13-1.02-.13-1.14-.02-2.25.43-3.05 1.25-.8.81-1.23 1.94-1.18 3.08.05 1.13.56 2.21 1.41 2.96.84.75 1.99 1.13 3.12 1.05 1.13-.07 2.19-.64 2.9-1.52.42-.51.68-1.13.73-1.78.02-1.74.01-3.48.01-5.23V.02h-.37z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      handle: "@muschio_haute",
      href: "https://twitter.com/muschio_haute",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "Muschio Haute Parfumerie",
      href: "https://www.youtube.com/@muschiohaute",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Col 1: Muschio Identity, Brand Narrative & VIP Concierge */}
        <div className="space-y-4">
          <Link href="/" className="masthead-logo text-white inline-block">
            MUSCHIO
          </Link>
          <p>
            {c(
              "Haute Parfumerie & Niche Fragrance Platform dedicated to the connoisseurs of the Arabian Gulf. Curating rare extraits de parfum, aged attars, and crystalline olfactory creations.",
              "دار العطور الفاخرة المكرسة لعشاق العطور الراقية في الخليج العربي. ننتقي خلاصات العطور النادرة والزيوت المعتقة من أرقى الدور العالمية المعتمدة.",
            )}
          </p>
          <div className="pt-1 text-xs text-[#A3A39C]">
            <span>{c("Dubai · Riyadh · Doha · Kuwait City · Muscat", "دبي · الرياض · الدوحة · الكويت · مسقط")}</span>
          </div>

          {/* VIP WhatsApp Concierge Direct Action */}
          <div className="pt-2">
            <a
              href="https://wa.me/97148006872?text=Hello%20Muschio%20Concierge,%20I%20would%20like%20assistance%20with%20a%20fragrance%20recommendation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-sm bg-[#1F2E23] hover:bg-[#283C2E] border border-[#3E5C46] text-[#A8E6B8] text-xs font-sans tracking-wide transition-colors group"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{c("WhatsApp VIP Concierge", "المستشار العطري عبر واتساب")}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
            </a>
          </div>

          {/* Social Media Channels Row */}
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#A3A39C] block mb-2 font-sans font-medium">
              {c("Follow Our Maisons", "تابع حساباتنا الرسمية")}
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
                  className="w-8 h-8 rounded-sm bg-white/5 hover:bg-white/15 text-[#D4D1C8] hover:text-white border border-white/10 hover:border-white/25 flex items-center justify-center transition-all duration-200 group"
                >
                  <span className="group-hover:scale-110 transition-transform duration-150">
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: The Collection */}
        <div>
          <h4>{c("THE COLLECTION", "المجموعة")}</h4>
          <Link href="/shop">{c("All Fragrances", "جميع العطور")}</Link>
          <Link href="/shop?brandType=NICHE">{c("Haute Niche Extraits", "عطور النيش الفاخرة")}</Link>
          <Link href="/shop?brandType=DESIGNER">{c("Designer Privé", "ديزاينر برايفيت")}</Link>
          <Link href="/discover/sets">{c("5 x 2ml Discovery Sets", "مجموعات العينات")}</Link>
          <Link href="/notes">{c("Olfactory Notes Library", "مكتبة النوتات العطرية")}</Link>
        </div>

        {/* Col 3: The Houses */}
        <div>
          <h4>{c("THE HOUSES", "دور العطور")}</h4>
          <Link href="/brands/amouage">Amouage (Oman)</Link>
          <Link href="/brands/maison-francis-kurkdjian">Maison Francis Kurkdjian (Paris)</Link>
          <Link href="/brands/roja-parfums">Roja Parfums (London)</Link>
          <Link href="/brands/xerjoff">Xerjoff (Turin)</Link>
          <Link href="/brands/tom-ford">Tom Ford Private Blend</Link>
          <Link href="/brands">{c("View All Houses (A–Z)", "عرض جميع الدور (أ–ي)")}</Link>
        </div>

        {/* Col 4: Client Care & Contact */}
        <div>
          <h4>{c("CLIENT CARE & CONCIERGE", "خدمة العملاء والاتصال")}</h4>
          <Link href="/guide">{c("The Fragrance Compendium", "دليل وخفايا العطور")}</Link>
          <Link href="/discover/ai">{c("AI Scent Sommelier", "مستشار العطور الذكي")}</Link>
          <Link href="/delivery">{c("GCC Delivery Timelines", "مواعيد الشحن والتوصيل")}</Link>
          <Link href="/account">{c("Client Vault & Account", "حساب العميل والمساعد")}</Link>
          <Link href="/journal">{c("The Muschio Journal", "مجلة موسكيو")}</Link>
          
          <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-[#A3A39C]">
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#A8E6B8]" />
              <span className="font-mono text-[#D4D1C8]">+971 4 800 MUSCHIO</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-[#A8E6B8]" />
              <span>concierge@muschio.luxury</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Social Tag, Theme Switcher & Regional Indicators */}
      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} MUSCHIO HAUTE PARFUMERIE. {c("All Rights Reserved.", "جميع الحقوق محفوظة.")}
        </div>
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <ThemeToggle locale={locale} showLabel={true} className="text-[#A3A39C] hover:text-white" />
          <span>·</span>
          <span>{c("Currency: United Arab Emirates (AED)", "العملة: درهم إماراتي (AED)")}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>{c("100% Verified Authentic Flacons", "عطور معتمدة وأصلية ١٠٠٪")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
