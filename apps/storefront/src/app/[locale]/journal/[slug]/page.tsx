import React from "react";
import Image from "next/image";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { ArrowLeft, Clock, User } from "lucide-react";

export default function JournalDetailPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const featuredPerfume = {
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait de Parfum",
    nameAr: "إنترلود 53 إكستري دي بارفان",
    brand: "Amouage",
    concentration: "Extrait de Parfum (53%)",
    price: 1850,
    compareAtPrice: 2100,
    image: "/amouage-placeholder.svg",
    badge: "Extrait (53%)",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-10">
      {/* 1. Back link */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-luxury-muted hover:text-luxury-text transition-colors"
      >
        <ArrowLeft size={14} className="rtl:rotate-180" />
        <span>{c("Back to Journal", "العودة للمجلة")}</span>
      </Link>

      {/* 2. Article Header */}
      <div className="space-y-4">
        <span className="eyebrow text-accent">
          {c("HAUTE LAYERING RITUALS", "فن المزج والطقوس العطرية")}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c(
            "The Sacred Alchemy: Layering Aged Omani Oud with Mountain Taif Rose",
            "الكيمياء المقدسة: فن مزج العود العُماني المعتق مع ورد الطائف الجبلي",
          )}
        </h1>

        <div className="flex items-center gap-6 text-xs text-luxury-muted font-sans border-y border-luxury-border py-3">
          <span className="flex items-center gap-1.5">
            <User size={13} />
            <span>Salim Al-Harthy</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>{c("6 min read", "٦ دقائق قراءة")}</span>
          </span>
          <span>{c("Muschio Editorial", "تحرير موسكيو")}</span>
        </div>
      </div>

      {/* 3. Hero Visual */}
      <div className="relative aspect-[16/9] w-full bg-luxury-surface2 border border-luxury-border overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85"
          alt="Layering Perfumes in the Gulf"
          fill
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover"
        />
      </div>

      {/* 4. Essay Copy */}
      <div className="text-luxury-text font-sans text-sm sm:text-base leading-relaxed space-y-6">
        <p>
          {c(
            "Across the royal majalis of the Arabian Gulf, perfumery is neither a cosmetic accessory nor an afterthought; it is an intimate language of hospitality, majesty, and enduring cultural devotion.",
            "في المجالس والقصور الملكية بالخليج العربي، ليس العطر مجرد زينة أو لمسة عابرة، بل هو لغة كرم وهيبة وأصالة متوارثة عبر الأجيال تعبر عن أرفع درجات الحفاوة والترحيب.",
          )}
        </p>
        <p>
          {c(
            "When orchestrating high-concentration extraits de parfum, the secret lies in molecular weight and thermal evaporation. Always begin with your architectural anchor: warm a single drop of wild Cambodian agarwood or resinous Silver Frankincense between your wrists and at the hollow of your neck.",
            "عند مزج خلاصات العطور النقية، يكمن السر في الوزن الجزيئي ومعدل التبخر الحراري. ابدأ دائماً بالقاعدة العميقة: دع دهن العود الكمبودي البري أو اللبان الفضي الصمغي يدفأ على نقاط النبض ومفترق الياقة.",
          )}
        </p>
        <p>
          {c(
            "Once the resinous base has fused with the skin's warmth, mist the crystalline petals of dawn-harvested Taif rose across your garments. The heat of the Arabian climate will gently elevate the floral heart while the agarwood anchor preserves its monolithic sillage through the evening.",
            "وبعد اندماج القاعدة الصمغية مع دفء البشرة، انثر أريج ورد الطائف المقطوف عند الفجر على الثوب أو الرداء. سيتولى دفء المناخ الخليجي تصعيد قلب العطر الزهري بنعومة بينما تضمن قاعدة العود ثباتاً ملكياً مهيباً يرافقك طوال الأمسية.",
          )}
        </p>
      </div>

      {/* 5. Featured Shoppable Fragrance Card (Level Shoes Style) */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 space-y-6">
        <div>
          <span className="eyebrow mb-1">
            {c("FEATURED IN THIS STORY", "عطور مذكورة في هذا المقال")}
          </span>
          <h3 className="font-serif text-2xl text-luxury-text font-normal">
            {c("The Incense & Agarwood Anchor", "القاعدة البخورية والعود")}
          </h3>
        </div>

        <div className="max-w-xs">
          <ProductCard
            slug={featuredPerfume.slug}
            nameEn={featuredPerfume.nameEn}
            nameAr={featuredPerfume.nameAr}
            brand={featuredPerfume.brand}
            concentration={featuredPerfume.concentration}
            price={featuredPerfume.price}
            compareAtPrice={featuredPerfume.compareAtPrice}
            image={featuredPerfume.image}
            badge={featuredPerfume.badge}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
