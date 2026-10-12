"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Badge, Button } from "@muschio/ui";
import { Search, Sparkles, ArrowRight, Globe } from "lucide-react";

const BRAND_DIRECTORY = [
  {
    slug: "amouage",
    name: "Amouage",
    type: "NICHE",
    countryEn: "Sultanate of Oman",
    countryAr: "سلطنة عُمان",
    year: 1983,
    descriptionEn: "The Gift of Kings. Celebrated for iconic royal Frankincense, Mountain Rock Rose, and aged Cambodian Oud formulated at up to 53% concentration.",
    descriptionAr: "هدية الملوك. تشتهر باللبان الحوجري الفضي والورد الجبلي والعود الكمبودي المعتق بتركيز يصل إلى 53%.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 14,
    featuredPerfume: "Interlude 53 Man Extrait",
  },
  {
    slug: "maison-francis-kurkdjian",
    name: "Maison Francis Kurkdjian",
    type: "NICHE",
    countryEn: "Paris, France",
    countryAr: "باريس، فرنسا",
    year: 2009,
    descriptionEn: "L'art du parfum. Parisian craftsmanship expressing contemporary luxury with exceptional materials and crystal-clear olfactory architecture.",
    descriptionAr: "فن العطور الباريسي الرفيع يجسد الفخامة المعاصرة بمكونات استثنائية وبناء عطري بلوري متقن.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 11,
    featuredPerfume: "Baccarat Rouge 540 Extrait",
  },
  {
    slug: "roja-parfums",
    name: "Roja Parfums",
    type: "NICHE",
    countryEn: "London, United Kingdom",
    countryAr: "لندن، المملكة المتحدة",
    year: 2011,
    descriptionEn: "The finest fragrances in the world. Master Perfumer Roja Dove crafts unapologetic extraits using natural absolutes without cost constraints.",
    descriptionAr: "أرقى عطور العالم بإمضاء صانع العطور روجا دوف، صُنعت بأندر الخلاصات الطبيعية دون أي قيود على التكلفة.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 9,
    featuredPerfume: "Elysium Pour Homme Parfum",
  },
  {
    slug: "xerjoff",
    name: "Xerjoff",
    type: "NICHE",
    countryEn: "Turin, Italy",
    countryAr: "تورينو، إيطاليا",
    year: 2003,
    descriptionEn: "Italian luxury perfumes combining classical craftsmanship, aged oud absolutes, and breathtaking sculptural flacons.",
    descriptionAr: "دار العطور الإيطالية الفاخرة التي تجمع بين الحرفية العريقة وأندر خلاصات العود في زجاجات منحوتة ساحرة.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 12,
    featuredPerfume: "Alexandria II Eau de Parfum",
  },
  {
    slug: "tom-ford",
    name: "Tom Ford",
    type: "DESIGNER",
    countryEn: "New York, USA",
    countryAr: "نيويورك، الولايات المتحدة",
    year: 2005,
    descriptionEn: "The Private Blend Collection. Artisanal scent lab creations designed for true connoisseurs with opulent amber and spice accords.",
    descriptionAr: "مجموعة برايفيت بليند الخاصة. ابتكارات عطرية استثنائية صُممت لعشاق التميز بنفحات العنبر والتوابل الغنية.",
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 8,
    featuredPerfume: "Tobacco Vanille Eau de Parfum",
  },
  {
    slug: "clive-christian",
    name: "Clive Christian",
    type: "NICHE",
    countryEn: "London, United Kingdom",
    countryAr: "لندن، المملكة المتحدة",
    year: 1872,
    descriptionEn: "Custodian of the Crown Perfumery Company, bearing royal warrant and Queen Victoria's crown on each crystal stopper.",
    descriptionAr: "وريثة دار العطور الملكية البريطانية، الوحيدة الممنوحة إذناً ملكياً بوضع تاج الملكة فيكتوريا على زجاجاتها.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 6,
    featuredPerfume: "No. 1 Masculine Edition",
  },
  {
    slug: "creed",
    name: "Creed",
    type: "NICHE",
    countryEn: "Paris, France",
    countryAr: "باريس، فرنسا",
    year: 1760,
    descriptionEn: "Royal legacy perfumery renowned for artisanal infusion methods and legendary historical royal clientele.",
    descriptionAr: "إرث عطري ملكي ممتد منذ 1760، يشتهر بأساليب التعتيق اليدوية وخدمة البلاط الملكي الأوروبي.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 10,
    featuredPerfume: "Aventus Millésime",
  },
];

export default function BrandsDirectoryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = BRAND_DIRECTORY.filter((brand) => {
    if (selectedType !== "ALL" && brand.type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = brand.name.toLowerCase().includes(q);
      const matchCountry = (brand.countryEn + brand.countryAr).toLowerCase().includes(q);
      if (!matchName && !matchCountry) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-accent text-xs font-sans font-semibold uppercase tracking-widest">
          <Sparkles size={14} />
          <span>{isAr ? "دليل الدور العطرية العالمية" : "Haute Maison Directory"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "أعرق الدور العطرية الملكية والنيش" : "The Prestigious Perfume Houses"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed">
          {isAr
            ? "استكشف أساطين صناعة العطور المستوردة مباشرة من دورهم الرسمية في عُمان، باريس، لندن، وتورينو، مع ضمان أصالة بنسبة 100%."
            : "Explore master houses sourced directly from verified ateliers in Oman, Paris, London, and Turin with 100% certified provenance."}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "ALL", labelEn: "All Houses", labelAr: "كافة الدور" },
            { id: "NICHE", labelEn: "Haute Niche", labelAr: "دور النيش الفاخرة" },
            { id: "DESIGNER", labelEn: "Designer Privé", labelAr: "المصممون الحصريون" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-4 py-2 text-xs font-sans uppercase tracking-wider transition-all ${
                selectedType === tab.id
                  ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold"
                  : "bg-luxury-canvas border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث باسم الدار أو الدولة..." : "Filter by house or country..."}
            className="w-full h-10 ps-9 pe-3 text-xs bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((brand) => (
          <div
            key={brand.slug}
            className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-gold/60 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-64 w-full overflow-hidden bg-zinc-950">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute top-4 start-4">
                <Badge variant={brand.type === "NICHE" ? "niche" : "default"}>
                  {brand.type === "NICHE" ? (isAr ? "نيش فاخر" : "Haute Niche") : (isAr ? "مجموعة خاصة" : "Designer Privé")}
                </Badge>
              </div>
              <div className="absolute bottom-4 start-4 end-4">
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-gold font-semibold flex items-center gap-1.5 mb-1">
                  <Globe size={12} />
                  <span>{isAr ? brand.countryAr : brand.countryEn} • Est. {brand.year}</span>
                </span>
                <h3 className="font-serif text-2xl text-white font-light">{brand.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                {isAr ? brand.descriptionAr : brand.descriptionEn}
              </p>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-sans block">
                    {isAr ? "العطر الأيقوني:" : "Signature Scent:"}
                  </span>
                  <span className="text-xs font-serif text-zinc-800 dark:text-zinc-200 font-medium">
                    {brand.featuredPerfume}
                  </span>
                </div>

                <Button asChild variant="outline" size="sm" className="group-hover:border-gold group-hover:text-gold transition-colors">
                  <Link href={`/brands/${brand.slug}`} className="flex items-center gap-1.5">
                    <span>{isAr ? "اكتشف الدار" : "Explore House"}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
