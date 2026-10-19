import React from "react";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";

interface NoteDetailData {
  nameEn: string;
  nameAr: string;
  slug: string;
  familyEn: string;
  familyAr: string;
  originEn: string;
  originAr: string;
  descriptionEn: string;
  descriptionAr: string;
  relatedNotes: Array<{ nameEn: string; nameAr: string; slug: string }>;
  perfumes: Array<{
    slug: string;
    nameEn: string;
    nameAr: string;
    brand: string;
    concentration: string;
    price: number;
    compareAtPrice?: number | null;
    image: string;
    badge?: string;
  }>;
}

const NOTE_DETAILS: Record<string, NoteDetailData> = {
  "taif-rose": {
    nameEn: "Royal Taif Rose",
    nameAr: "ورد الطائف الملكي",
    slug: "taif-rose",
    familyEn: "Rare Floral",
    familyAr: "زهور نادرة",
    originEn: "Taif Mountains, Saudi Arabia",
    originAr: "جبال الطائف، السعودية",
    descriptionEn:
      "Harvested at dawn in the high-altitude mountains of Saudi Arabia, Royal Taif Rose is celebrated for its honeyed, intensely deep, and regal floral aroma. Highly prized in royal Arabian perfumery as both a majestic heart note and an aristocratic opening.",
    descriptionAr:
      "يُحصد عند بزوغ الفجر في أعالي جبال الطائف بالمملكة العربية السعودية، ويشتهر الورد الطائفي بنفحاته العسلية الغنية وأريجه الزهري الملكي الفواح.",
    relatedNotes: [
      { nameEn: "Cambodian Oud", nameAr: "دهن عود كمبودي", slug: "cambodian-oud" },
      { nameEn: "Silver Frankincense", nameAr: "لبان فضي", slug: "silver-frankincense" },
      { nameEn: "Florentine Iris", nameAr: "سوسن فلورنسا", slug: "florentine-iris" },
    ],
    perfumes: [
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        brand: "Xerjoff",
        concentration: "Eau de Parfum",
        price: 2200,
        compareAtPrice: 2450,
        image:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
        badge: "Heart Note",
      },
      {
        slug: "roja-parfums-elysium-pour-homme-parfum",
        nameEn: "Elysium Pour Homme Parfum",
        nameAr: "إليزيوم بور هوم بارفان",
        brand: "Roja Parfums",
        concentration: "Pure Parfum",
        price: 1950,
        compareAtPrice: 2200,
        image:
          "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
        badge: "Heart Note",
      },
    ],
  },
  "silver-frankincense": {
    nameEn: "Silver Frankincense (Hojari)",
    nameAr: "اللبان الحوجري الفضي",
    slug: "silver-frankincense",
    familyEn: "Sacred Resin",
    familyAr: "صمغ وبخور مقدس",
    originEn: "Dhofar Mountains, Sultanate of Oman",
    originAr: "جبال ظفار، سلطنة عُمان",
    descriptionEn:
      "Exclusively harvested from Boswellia sacra trees in the Dhofar mountains of Oman. The highest grade of frankincense in the world, radiating balsamic, ethereal incense and citrusy nuances.",
    descriptionAr:
      "يُحصد حصرياً من أشجار اللبان في جبال ظفار بسلطنة عُمان. أرقى درجات اللبان في العالم، يمنح العطر طابعاً بخورياً ملكياً مقدساً.",
    relatedNotes: [
      { nameEn: "Cambodian Oud", nameAr: "دهن عود كمبودي", slug: "cambodian-oud" },
      { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب", slug: "golden-ambergris" },
      { nameEn: "Guatemalan Cardamom", nameAr: "هيل غواتيمالا", slug: "guatemalan-cardamom" },
    ],
    perfumes: [
      {
        slug: "amouage-interlude-53-man",
        nameEn: "Interlude 53 Man Extrait de Parfum",
        nameAr: "إنترلود 53 إكستري دي بارفان",
        brand: "Amouage",
        concentration: "Extrait de Parfum (53%)",
        price: 1850,
        compareAtPrice: 2100,
        image: "/amouage-placeholder.svg",
        badge: "Heart Note",
      },
    ],
  },
  "cambodian-oud": {
    nameEn: "Cambodian Agarwood (Oud)",
    nameAr: "دهن عود كمبودي معتق",
    slug: "cambodian-oud",
    familyEn: "Precious Wood",
    familyAr: "أخشاب وعود نادر",
    originEn: "Pursat, Cambodia",
    originAr: "بورسات، كمبوديا",
    descriptionEn:
      "Aged wild heartwood distilled to yield resinous, dark, leathery, and deeply balsamic complexity. The cornerstone of Gulf high perfumery and royal hospitality.",
    descriptionAr:
      "خشب عود بري معتق مقطر ليمنح تعقيداً بلسمياً وجلدياً داكناً. الركيزة الأساسية في العطور الخليجية الملكية.",
    relatedNotes: [
      { nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose" },
      { nameEn: "Silver Frankincense", nameAr: "لبان فضي", slug: "silver-frankincense" },
      { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب", slug: "golden-ambergris" },
    ],
    perfumes: [
      {
        slug: "amouage-interlude-53-man",
        nameEn: "Interlude 53 Man Extrait de Parfum",
        nameAr: "إنترلود 53 إكستري دي بارفان",
        brand: "Amouage",
        concentration: "Extrait de Parfum (53%)",
        price: 1850,
        compareAtPrice: 2100,
        image: "/amouage-placeholder.svg",
        badge: "Base Note",
      },
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        brand: "Xerjoff",
        concentration: "Eau de Parfum",
        price: 2200,
        compareAtPrice: 2450,
        image:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
        badge: "Base Note",
      },
    ],
  },
  "florentine-iris": {
    nameEn: "Florentine Iris (Orris)",
    nameAr: "سوسن فلورنسا المخملي",
    slug: "florentine-iris",
    familyEn: "Powdery Floral",
    familyAr: "زهور بودرية",
    originEn: "Tuscany, Italy",
    originAr: "توسكانا، إيطاليا",
    descriptionEn:
      "Aged for three full years before distillation. Powdery, violet-like, sophisticated, and aristocratically soft.",
    descriptionAr:
      "تُعتق جذوره لثلاث سنوات كاملة قبل التقطير. نوتة بودرية مخملية مترفة تفيض بالنقاء.",
    relatedNotes: [
      { nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose" },
      { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب", slug: "golden-ambergris" },
    ],
    perfumes: [
      {
        slug: "mfk-baccarat-rouge-540-extrait",
        nameEn: "Baccarat Rouge 540 Extrait de Parfum",
        nameAr: "باكارات روج 540 إكستري دي بارفان",
        brand: "Maison Francis Kurkdjian",
        concentration: "Extrait de Parfum",
        price: 1650,
        compareAtPrice: null,
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
        badge: "Heart Note",
      },
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        brand: "Xerjoff",
        concentration: "Eau de Parfum",
        price: 2200,
        compareAtPrice: 2450,
        image:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
        badge: "Heart Note",
      },
    ],
  },
};

export default function NoteDetailPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const note = NOTE_DETAILS[slug] || NOTE_DETAILS["taif-rose"];
  if (!note) notFound();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-luxury-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-luxury-text transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/notes" className="hover:text-luxury-text transition-colors">
              {c("Scent Notes", "نوتات العطر")}
            </Link>
          </li>
          <li>/</li>
          <li className="text-luxury-text font-medium">{c(note.nameEn, note.nameAr)}</li>
        </ol>
      </nav>

      {/* 2. Compact Note Editorial Header */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-luxury-border">
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-accent px-2.5 py-1 bg-luxury-surface2 border border-luxury-border">
            {c(note.familyEn, note.familyAr)}
          </span>
          <span className="text-xs text-luxury-muted font-sans">
            {c(note.originEn, note.originAr)}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
          {c(note.nameEn, note.nameAr)}
        </h1>

        <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-3xl">
          {c(note.descriptionEn, note.descriptionAr)}
        </p>

        {/* Companion Notes */}
        {note.relatedNotes.length > 0 && (
          <div className="pt-3 border-t border-luxury-border flex items-center gap-2 flex-wrap">
            <span className="text-xs text-luxury-muted me-2">
              {c("Harmonious Companion Notes:", "نوتات تتناغم مع هذه الخلاصة:")}
            </span>
            {note.relatedNotes.map((rn) => (
              <Link
                key={rn.slug}
                href={`/notes/${rn.slug}`}
                className="px-2.5 py-1 text-xs border border-luxury-border bg-luxury-surface2 text-luxury-text hover:border-luxury-borderBold transition-colors"
              >
                {c(rn.nameEn, rn.nameAr)}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Perfumes Section with Shared ProductCard Grid */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between pb-4 border-b border-luxury-border">
          <div>
            <span className="eyebrow mb-1">
              {c("AUTHENTICATED FLACONS", "العطور المسجلة")}
            </span>
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {c(
                `Perfumes Featuring ${note.nameEn}`,
                `عطور تتضمن نوتة ${note.nameAr}`,
              )}
            </h2>
          </div>
          <span className="text-xs text-luxury-muted">
            {note.perfumes.length} {c("Available", "متوفر")}
          </span>
        </div>

        {/* Level Shoes 2-col mobile / 3-col tablet / 4-col desktop product grid */}
        <div className="product-grid">
          {note.perfumes.map((perfume) => (
            <ProductCard
              key={perfume.slug}
              slug={perfume.slug}
              nameEn={perfume.nameEn}
              nameAr={perfume.nameAr}
              brand={perfume.brand}
              concentration={perfume.concentration}
              price={perfume.price}
              compareAtPrice={perfume.compareAtPrice}
              image={perfume.image}
              badge={perfume.badge}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
