"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Search, Sparkles, ArrowRight } from "lucide-react";



interface NoteItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  family: string;
  origin: string;
  descriptionEn?: string;
  descriptionAr?: string;
  heroImageUrl?: string;
  featuredProductCount?: number;
}

const STATIC_NOTES: NoteItem[] = [
  {
    id: "note-1",
    nameEn: "Royal Taif Rose",
    nameAr: "ورد الطائف الملكي",
    slugEn: "taif-rose",
    slugAr: "ward-taif",
    family: "floral",
    origin: "Taif, Saudi Arabia",
    descriptionEn: "Prized for centuries across Arabia, harvested at high altitude in the mountains of Saudi Arabia. Intensely honeyed, deep, and regal floral essence.",
    descriptionAr: "يُقدّر منذ قرون في الجزيرة العربية، ويُحصد على ارتفاعات شاهقة في جبال الطائف. خلاصة زهرية ملكية غنية بنفحات العسل العميقة.",
    heroImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 4,
  },
  {
    id: "note-2",
    nameEn: "Silver Frankincense",
    nameAr: "اللبان الحوجري الفضي",
    slugEn: "silver-frankincense",
    slugAr: "luban-hojari",
    family: "resins",
    origin: "Dhofar, Sultanate of Oman",
    descriptionEn: "Harvested exclusively in the Dhofar region of Oman. Resinous, ethereal, balsamic, and sacred incense note with citrusy undertones.",
    descriptionAr: "يُحصد حصرياً من جبال ظفار في سلطنة عُمان. نوتة بخورية صمغية مقدسة مع لمحات حمضية نقية.",
    heroImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-3",
    nameEn: "Cambodian Agarwood (Oud)",
    nameAr: "دهن عود كمبودي معتق",
    slugEn: "cambodian-oud",
    slugAr: "oud-cambodi",
    family: "woods",
    origin: "Pursat, Cambodia",
    descriptionEn: "Aged wild oud heartwood delivering dark, leathery, smoky, and deeply balsamic prestige.",
    descriptionAr: "خشب عود بري معتق يمنح طابعاً داكناً وجلدياً ودخانياً مفعماً بالفخامة والهيبة.",
    heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 5,
  },
  {
    id: "note-4",
    nameEn: "Florentine Iris (Orris)",
    nameAr: "سوسن فلورنسا المخملي",
    slugEn: "florentine-iris",
    slugAr: "iris-florence",
    family: "floral",
    origin: "Tuscany, Italy",
    descriptionEn: "Among the most expensive raw materials in perfumery, aged for three years. Powdery, violet-like, sophisticated, and aristocratically soft.",
    descriptionAr: "من أثمن المواد الخام في عالم العطور، يُعتق لمدة ثلاث سنوات. بودري وناعم كالحرير بأناقة أرستقراطية.",
    heroImageUrl: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-5",
    nameEn: "Golden Ambergris",
    nameAr: "العنبر الأشهب الذهبي",
    slugEn: "golden-ambergris",
    slugAr: "anbar-dahabi",
    family: "amber",
    origin: "Arabian Sea",
    descriptionEn: "Oceanic, salty, warm, and radiant natural fixative that confers magnetic longevity and sensual radiance.",
    descriptionAr: "عنبر بحري دافئ وإشعاعي يمنح العطر ثباتاً أسطورياً وهالة مغناطيسية آسرة.",
    heroImageUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 4,
  },
  {
    id: "note-6",
    nameEn: "Calabrian Bergamot",
    nameAr: "برغموت كالابريا الإيطالي",
    slugEn: "calabrian-bergamot",
    slugAr: "bergamot-calabria",
    family: "citrus",
    origin: "Calabria, Italy",
    descriptionEn: "Cold-pressed in Southern Italy. Sparkling, crisp, sun-drenched, and elegantly zesty opening note.",
    descriptionAr: "معصور على البارد في جنوب إيطاليا. نوتة افتتاحية مشرقة ومبهجة برائحة الحمضيات المشمسة.",
    heroImageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-7",
    nameEn: "Madagascar Bourbon Vanilla",
    nameAr: "فانيليا بوربون مدغشقر",
    slugEn: "bourbon-vanilla",
    slugAr: "vanilla-bourbon",
    family: "gourmand",
    origin: "Madagascar",
    descriptionEn: "Dark, gourmand, woody, and liquor-like vanilla bean absolute with caramel and balsamic nuances.",
    descriptionAr: "خلاصة حبوب الفانيليا الداكنة ذات الطابع الخشبي اللذيذ مع لمحات الكراميل والبلسم الدافئ.",
    heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-8",
    nameEn: "Guatemalan Cardamom",
    nameAr: "هيل غواتيمالا الأخضر",
    slugEn: "guatemalan-cardamom",
    slugAr: "hail-guatemala",
    family: "spices",
    origin: "Cobán, Guatemala",
    descriptionEn: "Aromatic, cool-spicy, refined, and invigorating note that bridges freshness and warmth.",
    descriptionAr: "نوتة حارة باردة عطرية وفاخرة تمنح العطر توازناً فريداً بين الانتعاش والدفء.",
    heroImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-9",
    nameEn: "Tuscan Leather",
    nameAr: "الجلد التوسكاني الفاخر",
    slugEn: "tuscan-leather",
    slugAr: "jild-tuscany",
    family: "leather",
    origin: "Tuscany, Italy",
    descriptionEn: "Rich, supple, artisanal leather accord reminiscent of bespoke Florentine saddle-craft.",
    descriptionAr: "عبق الجلد الطبيعي الفاخر والمترف المستوحى من ورش الجلود الحرفية في فلورنسا.",
    heroImageUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 3,
  },
  {
    id: "note-10",
    nameEn: "Kashmiri Saffron",
    nameAr: "زعفران كشمير الأحمر",
    slugEn: "kashmiri-saffron",
    slugAr: "zaafaran-kashmir",
    family: "spices",
    origin: "Pampore, Kashmir",
    descriptionEn: "The red gold of spices. Bittersweet, metallic-leather, warm, and distinctly opulent.",
    descriptionAr: "الذهب الأحمر. نوتة دافئة ذات طابع جلدي حلو ومخملي تضفي طابع الفخامة الشرقية الملكية.",
    heroImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
    featuredProductCount: 2,
  },
];

export default function NotesIndexPage({ params: { locale } }: { params: { locale: "en" | "ar" } }) {
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("all");

  const families = [
    { id: "all", labelEn: "All Notes", labelAr: "كافة النوتات" },
    { id: "resins", labelEn: "Incense & Resins", labelAr: "بخور وصموغ" },
    { id: "woods", labelEn: "Precious Oud & Woods", labelAr: "أخشاب وعود" },
    { id: "floral", labelEn: "Rare Florals", labelAr: "زهور ملكية" },
    { id: "amber", labelEn: "Amber & Ambergris", labelAr: "عنبر" },
    { id: "spices", labelEn: "Warm Spices", labelAr: "توابل دافئة" },
  ];

  const filteredNotes = STATIC_NOTES.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch =
      n.nameEn.toLowerCase().includes(q) ||
      n.nameAr.includes(q) ||
      (n.descriptionEn && n.descriptionEn.toLowerCase().includes(q));

    const matchesFamily = selectedFamily === "all" || n.family === selectedFamily;
    return matchesSearch && matchesFamily;
  });

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Background glowing orbs */}
      <div className="ambient-glow-gold top-10 start-10" />
      <div className="ambient-glow-crimson top-[500px] end-10" />

      {/* Editorial Header */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-6 border border-white/20 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-accent text-xs font-sans uppercase tracking-[0.2em] font-bold">
          <Sparkles size={14} />
          <span>{isAr ? "دليل النوتات العطرية v9.0.0" : "Olfactory Library Graph v9.0.0"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-white font-light leading-tight">
          {isAr ? (
            <>
              دليل النوتات <span className="luxury-gradient-text font-normal italic">والمكونات النادرة</span>
            </>
          ) : (
            <>
              The Signature <span className="luxury-gradient-text font-normal italic">Fragrance Notes</span>
            </>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed max-w-3xl">
          {isAr
            ? "استكشف عالم العطور النيش عبر المكونات الطبيعية النادرة، وتعرّف على أسرار الهرم العطري والعطور الملكية التي ترتكز على كل نوتة معتمدة."
            : "Explore master perfumery through singular rare ingredients, from high-altitude Taif Rose to sacred Dhofari Silver Frankincense. Click any note to view only authenticated, published perfumes containing that extract."}
        </p>

        {/* Search and Category Filters */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="relative max-w-md">
            <Search size={18} className="absolute start-4 top-3.5 text-gold" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث عن نوتة عطرية (مثل: عود، لبان، سوسن)..."
                  : "Search note library (e.g. Oud, Frankincense, Iris)..."
              }
              className="w-full h-12 ps-12 pe-4 rounded-xl glass-input text-xs sm:text-sm font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {families.map((f) => {
              const active = selectedFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFamily(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-sans transition-all ${
                    active
                      ? "bg-gold text-zinc-950 font-bold shadow-md ring-2 ring-gold/40"
                      : "glass-pill text-zinc-700 dark:text-zinc-300 hover:text-gold"
                  }`}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNotes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.slugEn}`}
            className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/15 shadow-xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="relative h-64 w-full bg-zinc-950 overflow-hidden">
              {note.heroImageUrl ? (
                <Image
                  src={note.heroImageUrl}
                  alt={note.nameEn}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-gold italic">
                  ✦
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 start-4">
                <span className="px-3 py-1 rounded-full glass-pill text-[10px] font-sans font-bold text-gold uppercase tracking-wider">
                  {note.origin}
                </span>
              </div>
              <div className="absolute bottom-4 start-4 end-4">
                <span className="text-[10px] uppercase font-sans tracking-widest text-gold/80 font-medium">
                  {isAr ? "خلاصة ملكية" : "Haute Extract"}
                </span>
                <h3 className="font-serif text-2xl text-white group-hover:text-gold transition-colors">
                  {isAr ? note.nameAr : note.nameEn}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed line-clamp-3">
                {isAr ? note.descriptionAr : note.descriptionEn}
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-sans text-zinc-400 font-mono">
                  {isAr
                    ? `${note.featuredProductCount || 3} عطور مسجلة`
                    : `${note.featuredProductCount || 3} Authenticated SKUs`}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-gold font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isAr ? "استكشف العطور" : "Explore Extraits"}</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
