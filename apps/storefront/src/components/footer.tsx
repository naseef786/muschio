import React from "react";
import { Link } from "../navigation";
import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, Sparkles, Award } from "lucide-react";

export function Footer({ locale }: { locale: "en" | "ar" }) {
  const t = useTranslations();
  const isAr = locale === "ar";

  return (
    <footer className="relative bg-[#070A10] text-zinc-300 border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-gold -bottom-40 start-1/4" />

      {/* Luxury Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-start">
          <div className="glass-panel p-6 rounded-2xl space-y-2 flex flex-col items-center md:items-start border-white/10 hover:border-gold/40 transition-all">
            <ShieldCheck size={28} className="text-gold mb-1" />
            <h4 className="font-serif text-base text-white tracking-wide">
              {isAr ? "أصالة مضمونة 100%" : "Guaranteed Authenticity"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {isAr ? "مستورد مباشرة من دور العطور الملكية والمصنعين المعتمدين." : "Sourced directly from verified master perfumers and royal houses."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 flex flex-col items-center md:items-start border-white/10 hover:border-gold/40 transition-all">
            <Truck size={28} className="text-gold mb-1" />
            <h4 className="font-serif text-base text-white tracking-wide">
              {isAr ? "شحن خليجي فاخر" : "Complimentary GCC Shipping"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {isAr ? "توصيل خلال 24-48 ساعة في عبوات مبردة تحافظ على نقاء الزيوت." : "Temperature-controlled delivery within 24-48 hours across UAE & GCC."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 flex flex-col items-center md:items-start border-white/10 hover:border-gold/40 transition-all">
            <Sparkles size={28} className="text-gold mb-1" />
            <h4 className="font-serif text-base text-white tracking-wide">
              {isAr ? "عينات حصرية مجانية" : "Complimentary Rare Samples"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {isAr ? "عينتان رسميتان من اختيارك مع كل طلب لتوسيع تجربتك العطرية." : "Two curated 2ml discovery vials included with every full-bottle purchase."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-2 flex flex-col items-center md:items-start border-white/10 hover:border-gold/40 transition-all">
            <Award size={28} className="text-gold mb-1" />
            <h4 className="font-serif text-base text-white tracking-wide">
              {isAr ? "تقسيط إسلامي مرن" : "Flexible Installments"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {isAr ? "قسّم مشترياتك عبر تابي وتمارا بدون أي فوائد أو رسوم إضافية." : "Pay in 4 interest-free installments via Tabby & Tamara."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-3xl tracking-[0.25em] font-light text-white uppercase group-hover:text-gold transition-colors">
              Muschio
            </span>
            <span className="block text-[9px] font-sans tracking-[0.35em] text-zinc-500 uppercase -mt-1">
              Haute Parfumerie
            </span>
          </Link>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-sm">
            {isAr
              ? "وجهتك الراقية لاكتشاف واقتناء أندر العطور النيش والخلاصات العطرية الخالدة في الخليج العربي."
              : "The definitive destination for discerning patrons of rare niche extraits, artisanal attars, and bespoke olfactory creations across the Arabian Gulf."}
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold font-semibold">
            {isAr ? "الدليل والاستكشاف" : "Discovery & Notes"}
          </h5>
          <ul className="space-y-2 text-xs text-zinc-400 font-sans">
            <li><Link href="/notes" className="hover:text-gold transition-colors text-accent">{t("nav.notes")} (Directory v9)</Link></li>
            <li><Link href="/discover/ai" className="hover:text-gold transition-colors">{t("nav.aiDiscovery")}</Link></li>
            <li><Link href="/discover/sets" className="hover:text-gold transition-colors">{t("nav.discoverySets")}</Link></li>
            <li><Link href="/shop" className="hover:text-gold transition-colors">{t("nav.fragrance")}</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold font-semibold">
            {isAr ? "المجلة والدار" : "Maison & Journal"}
          </h5>
          <ul className="space-y-2 text-xs text-zinc-400 font-sans">
            <li><Link href="/journal" className="hover:text-gold transition-colors">{t("nav.journal")}</Link></li>
            <li><Link href="/shop?brandType=NICHE" className="hover:text-gold transition-colors">Haute Niche Houses</Link></li>
            <li><Link href="/shop?brandType=DESIGNER" className="hover:text-gold transition-colors">Designer Privé</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="text-[11px] font-sans uppercase tracking-[0.2em] text-gold font-semibold">
            {isAr ? "الدفع والتقسيط" : "Payment & Installments"}
          </h5>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2.5 py-1 rounded-md glass-panel border-white/10 text-[#3EFEBA] font-bold">Tabby 4x</span>
            <span className="px-2.5 py-1 rounded-md glass-panel border-white/10 text-[#FF8F70] font-bold">Tamara 4x</span>
            <span className="px-2.5 py-1 rounded-md glass-panel border-white/10 text-white font-mono">Apple Pay</span>
            <span className="px-2.5 py-1 rounded-md glass-panel border-white/10 text-white font-mono">Visa / MC</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 text-center text-[10px] text-zinc-500 font-sans">
        © {new Date().getFullYear()} MUSCHIO HAUTE PARFUMERIE. {t("common.allRightsReserved")} • Dubai & GCC
      </div>
    </footer>
  );
}
