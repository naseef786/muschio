import React from "react";
import Image from "next/image";
import { Link } from "../../../../navigation";
import { Button, Badge, PriceDisplay } from "@muschio/ui";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function JournalDetailPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        <span>{isAr ? "العودة للمجلة" : "Back to Journal"}</span>
      </Link>

      <div className="space-y-6">
        <Badge variant="gold">{isAr ? "فن المزج والتعطير" : "Haute Technique"}</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light leading-tight">
          {isAr
            ? "الكيمياء المقدسة: فن مزج العود العُماني المعتق مع ورد الطائف الجبلي"
            : "The Sacred Alchemy: Layering Aged Omani Oud with Mountain Taif Rose"}
        </h1>

        <div className="flex items-center gap-6 text-xs text-zinc-500 font-sans border-y border-zinc-200 dark:border-zinc-800 py-3">
          <span>By Salim Al-Harthy</span>
          <span>6 min read</span>
          <span>Published in Haute Parfumerie Review</span>
        </div>
      </div>

      <div className="relative h-96 w-full bg-zinc-950 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85"
          alt="Layering Perfumes"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Editorial Content */}
      <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-sans text-sm sm:text-base leading-relaxed space-y-6">
        <p>
          {isAr
            ? "في المجالس والقصور الملكية بالخليج العربي، ليس العطر مجرد زينة أو لمسة عابرة، بل هو لغة كرم وهيبة وأصالة متوارثة عبر الأجيال."
            : "Across the royal courts of the Arabian Gulf, perfumery is neither an accessory nor an afterthought; it is an intimate language of hospitality, majesty, and devotion."}
        </p>
        <p>
          {isAr
            ? "عند مزج خلاصات العطور النقية، ابدأ دائماً بالقاعدة الأعمق: دع دهن العود أو العنبر يدفأ على المعصم ونقاط النبض قبل رش أريج ورد الطائف النبيل على الياقة لإضفاء لمسة زهرية عسلية لا تُقاوم."
            : "When layering high-concentration extraits, always begin with the deepest base: warm the wild Cambodian agarwood or golden ambergris between your wrists and pulse points before misting the regal petals of Taif rose across your collar to create an irresistible sillage."}
        </p>
      </div>

      {/* Featured in this story / Shoppable Card */}
      <div className="border border-gold/40 bg-luxury-surface p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-serif italic text-gold-dark dark:text-gold font-semibold">
          <Sparkles size={14} />
          <span>{isAr ? "عطور مميزة ذُكرت في هذا المقال" : "Featured In This Masterpiece"}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-start">
            <span className="text-[10px] uppercase font-sans tracking-widest text-zinc-400">Amouage</span>
            <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
              Interlude 53 Man Extrait de Parfum
            </h4>
            <p className="text-xs text-zinc-500 font-sans">
              Formulated at 53% perfume oil with aged Silver Frankincense and Cambodian Oud.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <PriceDisplay price={1850} locale={locale} />
            <Button asChild variant="accent" size="sm">
              <Link href="/product/amouage-interlude-53-man">{isAr ? "اقتنِ العطر" : "Acquire Scent"}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
