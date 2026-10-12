import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { Badge, Button, PriceDisplay, NoteChip } from "@muschio/ui";
import { Sparkles, ArrowLeft } from "lucide-react";

// Mock catalog lookup fallback for server component demo
const NOTE_DETAILS: Record<string, any> = {
  "taif-rose": {
    nameEn: "Royal Taif Rose",
    nameAr: "ورد الطائف الملكي",
    slugEn: "taif-rose",
    descriptionEn: "Harvested at dawn in the high-altitude mountains of Saudi Arabia, Royal Taif Rose is celebrated for its honeyed, intensely deep, and regal floral aroma. Highly prized in royal Arabian perfumery as both a majestic heart note and an aristocratic opening.",
    descriptionAr: "يُحصد عند بزوغ الفجر في أعالي جبال الطائف بالمملكة العربية السعودية، ويشتهر الورد الطائفي بنفحاته العسلية الغنية وأريجه الزهري الملكي الفواح.",
    heroImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
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
        position: "HEART" as const,
        prominence: 9,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
      },
      {
        slug: "roja-parfums-elysium-pour-homme-parfum",
        nameEn: "Elysium Pour Homme Parfum",
        nameAr: "إليزيوم بور هوم بارفان",
        brand: "Roja Parfums",
        concentration: "Extrait de Parfum",
        price: 1950,
        position: "HEART" as const,
        prominence: 6,
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
      },
    ],
  },
  "silver-frankincense": {
    nameEn: "Silver Frankincense (Hojari)",
    nameAr: "اللبان الحوجري الفضي",
    slugEn: "silver-frankincense",
    descriptionEn: "Exclusively harvested from Boswellia sacra trees in the Dhofar mountains of Oman. The highest grade of frankincense in the world, radiating balsamic, ethereal incense and citrusy nuances.",
    descriptionAr: "يُحصد حصرياً من أشجار اللبان في جبال ظفار بسلطنة عُمان. أرقى درجات اللبان في العالم، يمنح العطر طابعاً بخورياً ملكياً مقدساً.",
    heroImage: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85",
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
        position: "HEART" as const,
        prominence: 10,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
      },
    ],
  },
  "cambodian-oud": {
    nameEn: "Cambodian Agarwood (Oud)",
    nameAr: "دهن عود كمبودي معتق",
    slugEn: "cambodian-oud",
    descriptionEn: "Aged wild heartwood distilled to yield resinous, dark, leathery, and deeply balsamic complexity. The cornerstone of Gulf high perfumery and royal hospitality.",
    descriptionAr: "خشب عود بري معتق مقطر ليمنح تعقيداً بلسمياً وجلدياً داكناً. الركيزة الأساسية في العطور الخليجية الملكية.",
    heroImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
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
        position: "BASE" as const,
        prominence: 10,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
      },
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        brand: "Xerjoff",
        concentration: "Eau de Parfum",
        price: 2200,
        position: "BASE" as const,
        prominence: 10,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
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
  const note = NOTE_DETAILS[slug] || NOTE_DETAILS["taif-rose"];

  if (!note) notFound();

  return (
    <div className="space-y-16 pb-24">
      {/* 1. NOTE HERO */}
      <section className="relative min-h-[50vh] flex items-end bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 pb-12 pt-20">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={note.heroImage}
            alt={note.nameEn}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-0" />

        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center gap-2">
            <Link
              href="/notes"
              className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-zinc-300 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>{isAr ? "دليل النوتات" : "All Notes"}</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 text-gold text-[10px] uppercase font-sans tracking-[0.2em]">
            <Sparkles size={12} />
            <span>{isAr ? "خلاصة أولية نادرة" : "Authoritative Raw Essence"}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-white font-light">
            {isAr ? note.nameAr : note.nameEn}
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
            {isAr ? note.descriptionAr : note.descriptionEn}
          </p>
        </div>
      </section>

      {/* 2. RELATED NOTES CHIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-start">
            <h4 className="font-serif text-base text-zinc-900 dark:text-zinc-100">
              {isAr ? "نوتات تتناغم بامتياز مع هذه الخلاصة" : "Harmonious Companion Notes"}
            </h4>
            <p className="text-xs text-zinc-500 font-sans">
              {isAr ? "خلاصات شائعة في التراكيب الملكية جنباً إلى جنب" : "Essences frequently orchestrated alongside this accord"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.relatedNotes.map((rn: any, idx: number) => (
              <Link key={idx} href={`/notes/${rn.slug}`}>
                <NoteChip name={isAr ? rn.nameAr : rn.nameEn} locale={locale} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PERFUMES FEATURING THIS NOTE (Authoritative ProductNote relations) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent font-medium">
              {isAr ? "عطور أصلية مسجلة" : "Authoritative Catalog"}
            </span>
            <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100">
              {isAr ? `عطور تتضمن نوتة ${note.nameAr}` : `Perfumes Featuring ${note.nameEn}`}
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-sans">
            {isAr ? `${note.perfumes.length} عطور منشورة` : `${note.perfumes.length} published fragrances`}
          </span>
        </div>

        {note.perfumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {note.perfumes.map((perfume: any, idx: number) => (
              <div
                key={idx}
                className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-80 w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={perfume.image}
                    alt={perfume.nameEn}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 start-3">
                    <Badge variant="niche">{perfume.brand}</Badge>
                  </div>
                  <div className="absolute bottom-3 start-3">
                    <Badge variant="accent">
                      {isAr ? `موضع النوتة: ${perfume.position}` : `Position: ${perfume.position}`}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-zinc-400">
                      {perfume.concentration}
                    </span>
                    <Link href={`/product/${perfume.slug}`} className="block">
                      <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                        {isAr ? perfume.nameAr : perfume.nameEn}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <PriceDisplay price={perfume.price} locale={locale} />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/product/${perfume.slug}`}>{isAr ? "اكتشف" : "Discover"}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-zinc-200 dark:border-zinc-800 bg-luxury-surface space-y-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans">
              {isAr
                ? "لا توجد عطور منشورة تحتوي على هذه النوتة حالياً في الخزانة."
                : "No published fragrances featuring this note are currently available in the vault."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
