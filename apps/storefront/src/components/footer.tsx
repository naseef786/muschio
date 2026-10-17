import React from "react";
import { Link } from "../navigation";

export function Footer({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Col 1: Muschio Identity & Brand Narrative */}
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
          <div className="pt-2 text-xs text-[#A3A39C]">
            <span>{c("Dubai · Riyadh · Doha · Kuwait City · Muscat", "دبي · الرياض · الدوحة · الكويت · مسقط")}</span>
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

        {/* Col 4: Client Care & Concierge */}
        <div>
          <h4>{c("CLIENT CARE", "خدمة العملاء")}</h4>
          <Link href="/guide">{c("The Fragrance Compendium", "دليل وخفايا العطور")}</Link>
          <Link href="/discover/ai">{c("AI Scent Sommelier", "مستشار العطور الذكي")}</Link>
          <Link href="/delivery">{c("GCC Delivery Timelines", "مواعيد الشحن والتوصيل")}</Link>
          <Link href="/account">{c("Client Vault & Account", "حساب العميل والمساعد")}</Link>
          <Link href="/journal">{c("The Muschio Journal", "مجلة موسكيو")}</Link>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Regional Indicators */}
      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} MUSCHIO HAUTE PARFUMERIE. {c("All Rights Reserved.", "جميع الحقوق محفوظة.")}
        </div>
        <div className="flex items-center gap-6">
          <span>{c("Currency: United Arab Emirates (AED)", "العملة: درهم إماراتي (AED)")}</span>
          <span>·</span>
          <span>{c("100% Verified Authentic Flacons", "عطور معتمدة وأصلية ١٠٠٪")}</span>
        </div>
      </div>
    </footer>
  );
}
