"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Search, ArrowUpRight } from "lucide-react";

interface NoteItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  family: string;
  familyEn: string;
  familyAr: string;
  originEn: string;
  originAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  perfumeCount: number;
}

const STATIC_NOTES: NoteItem[] = [
  {
    id: "taif-rose",
    nameEn: "Royal Taif Rose",
    nameAr: "ورد الطائف الملكي",
    slug: "taif-rose",
    family: "floral",
    familyEn: "Rare Floral",
    familyAr: "زهري ملكي",
    originEn: "Taif, Saudi Arabia",
    originAr: "جبال الطائف، السعودية",
    descriptionEn: "Prized for centuries across Arabia, harvested at dawn at 2,000 meters altitude. Deep, honeyed, and intensely regal.",
    descriptionAr: "يُحصد عند الفجر على ارتفاع ألفي متر في جبال الطائف. خلاصة ملكية عريقة بنفحات عسلية دافئة.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 2,
  },
  {
    id: "silver-frankincense",
    nameEn: "Silver Frankincense",
    nameAr: "اللبان الحوجري الفضي",
    slug: "silver-frankincense",
    family: "resin",
    familyEn: "Sacred Resin",
    familyAr: "صمغ وبخور مقدس",
    originEn: "Dhofar, Sultanate of Oman",
    originAr: "ظفار، سلطنة عُمان",
    descriptionEn: "Harvested exclusively from Boswellia sacra trees in Dhofar. Sacred, ethereal, and balsamic with radiant citrus undertones.",
    descriptionAr: "يُستخرج حصرياً من أشجار اللبان في ظفار العمانية. نوتة بخورية نقية مع لمحات بلسمية حمضية مضيئة.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 1,
  },
  {
    id: "cambodian-oud",
    nameEn: "Cambodian Agarwood (Oud)",
    nameAr: "دهن عود كمبودي معتق",
    slug: "cambodian-oud",
    family: "woody",
    familyEn: "Precious Wood",
    familyAr: "أخشاب وعود نادر",
    originEn: "Pursat, Cambodia",
    originAr: "بورسات، كمبوديا",
    descriptionEn: "Aged wild agarwood heartwood delivering a dark, leathery, resinous, and monumental sillage.",
    descriptionAr: "خشب عود بري معتق يمنح حضوراً مهيباً بنفحات جلدية ودخانية دافئة لا تضاهى.",
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 2,
  },
  {
    id: "florentine-iris",
    nameEn: "Florentine Iris (Orris)",
    nameAr: "سوسن فلورنسا المخملي",
    slug: "florentine-iris",
    family: "floral",
    familyEn: "Powdery Floral",
    familyAr: "زهور بودرية",
    originEn: "Tuscany, Italy",
    originAr: "توسكانا، إيطاليا",
    descriptionEn: "Aged for three full years before distillation. Powdery, violet-like, sophisticated, and aristocratically soft.",
    descriptionAr: "تُعتق جذوره لثلاث سنوات كاملة قبل التقطير. نوتة بودرية مخملية مترفة تفيض بالنقاء.",
    image: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 2,
  },
  {
    id: "golden-ambergris",
    nameEn: "Golden Ambergris",
    nameAr: "العنبر الأشهب الذهبي",
    slug: "golden-ambergris",
    family: "amber",
    familyEn: "Oceanic Amber",
    familyAr: "عنبر بحري",
    originEn: "Arabian Sea",
    originAr: "بحر العرب",
    descriptionEn: "Oceanic, salty-warm, and solar natural fixative conferring monolithic longevity and crystalline radiance.",
    descriptionAr: "عنبر بحري شمسي أصيل يمنح التكوين العطري ثباتاً ممتداً وإشراقة بلورية جذابة.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 3,
  },
  {
    id: "calabrian-bergamot",
    nameEn: "Calabrian Bergamot",
    nameAr: "برغموت كالابريا النقي",
    slug: "calabrian-bergamot",
    family: "citrus",
    familyEn: "Sparkling Citrus",
    familyAr: "حمضيات منعشة",
    originEn: "Calabria, Italy",
    originAr: "كالابريا، إيطاليا",
    descriptionEn: "Cold-pressed in Southern Italy. Sparkling, sun-drenched, crisp, and aristocratic citrus opening.",
    descriptionAr: "معصور على البارد في مزارع جنوب إيطاليا. افتتاحية حمضية مبهجة ومشرقة كشمس الصباح.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 2,
  },
  {
    id: "bourbon-vanilla",
    nameEn: "Madagascar Bourbon Vanilla",
    nameAr: "فانيليا بوربون مدغشقر",
    slug: "bourbon-vanilla",
    family: "gourmand",
    familyEn: "Rich Gourmand",
    familyAr: "فانيليا وغورماند",
    originEn: "Madagascar",
    originAr: "مدغشقر",
    descriptionEn: "Aged black vanilla bean absolute delivering creamy, woody, and liquor-like sweetness.",
    descriptionAr: "خلاصة حبوب الفانيليا المعتقة تمنح حلاوة بلسمية خشبية كريمية ساحرة.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 2,
  },
  {
    id: "kashmiri-saffron",
    nameEn: "Kashmiri Saffron",
    nameAr: "زعفران كشمير الأحمر",
    slug: "kashmiri-saffron",
    family: "spice",
    familyEn: "Opulent Spice",
    familyAr: "توابل شرقية",
    originEn: "Pampore, Kashmir",
    originAr: "بامبور، كشمير",
    descriptionEn: "The red gold of spices. Bittersweet, metallic, warm-leathery, and distinctly opulent.",
    descriptionAr: "ذهب التوابل الأحمر. نوتة دافئة ذات طابع جلدي حلو تضفي عمقاً ملكياً آسراً.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80",
    perfumeCount: 1,
  },
];

const FAMILIES = [
  { id: "all", labelEn: "All Notes", labelAr: "كل النوتات" },
  { id: "floral", labelEn: "Floral", labelAr: "زهري" },
  { id: "woody", labelEn: "Woody & Oud", labelAr: "أخشاب وعود" },
  { id: "amber", labelEn: "Amber", labelAr: "عنبر" },
  { id: "resin", labelEn: "Resin & Incense", labelAr: "صموغ وبخور" },
  { id: "citrus", labelEn: "Citrus", labelAr: "حمضيات" },
  { id: "spice", labelEn: "Spice", labelAr: "توابل" },
  { id: "gourmand", labelEn: "Gourmand", labelAr: "غورماند" },
];

export default function NotesIndexPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("all");

  const filteredNotes = useMemo(() => {
    return STATIC_NOTES.filter((n) => {
      if (selectedFamily !== "all" && n.family !== selectedFamily) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = n.nameEn.toLowerCase().includes(q) || n.nameAr.includes(q);
        const matchesDesc = n.descriptionEn.toLowerCase().includes(q) || n.descriptionAr.includes(q);
        const matchesOrigin = n.originEn.toLowerCase().includes(q) || n.originAr.includes(q);
        if (!matchesName && !matchesDesc && !matchesOrigin) return false;
      }
      return true;
    });
  }, [selectedFamily, search]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      {/* 1. Header (Level Shoes Architectural Pattern) */}
      <div className="pb-6 border-b border-luxury-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-1">
            {c("THE OLFACTORY LIBRARY", "المكتبة العطرية والمكونات")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
            {c("Scent Notes & Raw Essences", "نوتات العطور والمكونات النادرة")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted mt-1 max-w-xl">
            {c(
              "Explore master perfumery through verified raw extracts, from Taif Mountain Rose to sacred Omani Frankincense.",
              "اكتشف أسرار تركيب العطور من خلال المواد الطبيعية النادرة المستخرجة من أخصب بيئات العالم.",
            )}
          </p>
        </div>
        <div className="text-xs text-luxury-muted">
          <span className="font-medium text-luxury-text">{filteredNotes.length}</span>{" "}
          {c("Notes", "نوتة")}
        </div>
      </div>

      {/* 2. Scent Family Navigation & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-y border-luxury-border">
        {/* Scent Family Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {FAMILIES.map((fam) => (
            <button
              key={fam.id}
              type="button"
              onClick={() => setSelectedFamily(fam.id)}
              className={`px-3 py-1.5 text-xs font-sans whitespace-nowrap transition-colors ${
                selectedFamily === fam.id
                  ? "bg-luxury-text text-luxury-canvas font-medium"
                  : "bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-borderBold"
              }`}
            >
              {c(fam.labelEn, fam.labelAr)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c("Search notes (e.g. Oud, Rose)…", "ابحث عن نوتة (عود، لبان)…")}
            className="w-full h-9 ps-8 pe-3 text-xs bg-luxury-surface border border-luxury-border text-luxury-text focus:outline-none focus:border-luxury-borderBold"
          />
          <Search size={14} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-luxury-muted" />
        </div>
      </div>

      {/* 3. Notes Grid (Level Shoes Clean Card Hierarchy) */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-xs text-luxury-muted">
          {c("No scent notes found matching your search.", "لم يتم العثور على نوتات مطابقة للبحث.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              className="group border border-luxury-border bg-luxury-surface flex flex-col justify-between hover:border-luxury-borderBold transition-all"
            >
              <div className="relative aspect-[4/3] w-full bg-luxury-surface2 border-b border-luxury-border overflow-hidden">
                <Image
                  src={note.image}
                  alt={c(note.nameEn, note.nameAr)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 inset-inline-start-2.5 text-[9px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5 bg-luxury-surface/95 text-luxury-text border border-luxury-border">
                  {c(note.familyEn, note.familyAr)}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-[0.12em] text-luxury-muted block">
                    {c(note.originEn, note.originAr)}
                  </span>
                  <h3 className="font-serif text-lg text-luxury-text font-normal group-hover:underline mt-1">
                    {c(note.nameEn, note.nameAr)}
                  </h3>
                  <p className="text-xs text-luxury-muted leading-relaxed line-clamp-2 mt-2">
                    {c(note.descriptionEn, note.descriptionAr)}
                  </p>
                </div>

                <div className="pt-3 border-t border-luxury-border flex items-center justify-between text-xs">
                  <span className="text-accent font-medium">
                    {note.perfumeCount} {c("Perfumes", "عطور")}
                  </span>
                  <span className="text-luxury-text group-hover:underline flex items-center gap-1">
                    <span>{c("Explore", "استكشف")}</span>
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
