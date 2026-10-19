"use client";

import React, { useState, useMemo } from "react";
import { Link } from "../../../navigation";
import { Search, ArrowUpRight, Globe } from "lucide-react";

const BRAND_DIRECTORY = [
  {
    slug: "amouage",
    name: "Amouage",
    type: "NICHE",
    letter: "A",
    countryEn: "Sultanate of Oman",
    countryAr: "سلطنة عُمان",
    year: 1983,
    descriptionEn: "The Gift of Kings. Celebrated for royal Silver Frankincense, wild mountain rock rose, and aged Cambodian Oud formulated at up to 53% concentration.",
    descriptionAr: "هدية الملوك. تشتهر باللبان الحوجري الفضي النادر والورد الجبلي وخشب العود المعتق بتركيز يصل إلى 53%.",
    image: "/amouage-placeholder.svg",
    perfumesCount: 14,
    featuredPerfume: "Interlude 53 Man Extrait",
  },
  {
    slug: "clive-christian",
    name: "Clive Christian",
    type: "NICHE",
    letter: "C",
    countryEn: "London, United Kingdom",
    countryAr: "لندن، المملكة المتحدة",
    year: 1872,
    descriptionEn: "Custodian of the Crown Perfumery Company, bearing royal warrant and Queen Victoria's crown on each crystal stopper.",
    descriptionAr: "وريثة دار العطور الملكية البريطانية، الممنوحة إذناً ملكياً بوضع تاج الملكة فيكتوريا على زجاجاتها.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 6,
    featuredPerfume: "No. 1 Masculine Edition",
  },
  {
    slug: "creed",
    name: "Creed",
    type: "NICHE",
    letter: "C",
    countryEn: "Paris, France",
    countryAr: "باريس، فرنسا",
    year: 1760,
    descriptionEn: "Royal legacy perfumery renowned for artisanal infusion methods and legendary historical royal clientele.",
    descriptionAr: "إرث عطري ملكي ممتد منذ 1760، يشتهر بأساليب التعتيق اليدوية وخدمة البلاط الملكي الأوروبي.",
    image: "/product-placeholder.svg",
    perfumesCount: 10,
    featuredPerfume: "Aventus Millésime",
  },
  {
    slug: "maison-francis-kurkdjian",
    name: "Maison Francis Kurkdjian",
    type: "NICHE",
    letter: "M",
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
    letter: "R",
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
    slug: "tom-ford",
    name: "Tom Ford",
    type: "DESIGNER",
    letter: "T",
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
    slug: "xerjoff",
    name: "Xerjoff",
    type: "NICHE",
    letter: "X",
    countryEn: "Turin, Italy",
    countryAr: "تورينو، إيطاليا",
    year: 2003,
    descriptionEn: "Italian luxury perfumes combining classical craftsmanship, aged oud absolutes, and breathtaking sculptural flacons.",
    descriptionAr: "دار العطور الإيطالية الفاخرة التي تجمع بين الحرفية العريقة وأندر خلاصات العود في زجاجات منحوتة ساحرة.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    perfumesCount: 12,
    featuredPerfume: "Alexandria II Eau de Parfum",
  },
];

const ALPHABET = ["ALL", "A", "C", "M", "R", "T", "X"];

export default function BrandsDirectoryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return BRAND_DIRECTORY.filter((brand) => {
      if (selectedLetter !== "ALL" && brand.letter !== selectedLetter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = brand.name.toLowerCase().includes(q);
        const matchCountry = (brand.countryEn + brand.countryAr).toLowerCase().includes(q);
        if (!matchName && !matchCountry) return false;
      }
      return true;
    });
  }, [selectedLetter, search]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      {/* 1. Header (Level Shoes Architectural Compact Pattern) */}
      <div className="pb-6 border-b border-luxury-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-1">
            {c("HAUTE MAISON DIRECTORY", "دليل دور العطور العالمية")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
            {c("The Fragrance Houses", "دور العطور")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted mt-1 max-w-xl">
            {c(
              "Explore master perfume houses sourced directly from official ateliers in Oman, Paris, London, and Turin.",
              "استكشف أعرق دور العطور العالمية المستوردة مباشرة من أتيلييهاتها الرسمية في عُمان، باريس، لندن، وتورينو.",
            )}
          </p>
        </div>
        <div className="text-xs text-luxury-muted">
          <span className="font-medium text-luxury-text">{filtered.length}</span>{" "}
          {c("Houses", "دور عطور")}
        </div>
      </div>

      {/* 2. Alphabet Bar & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-y border-luxury-border">
          {/* Alphabet Index */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`min-w-[32px] h-8 px-2 text-xs font-sans transition-colors ${
                  selectedLetter === letter
                    ? "bg-luxury-text text-luxury-canvas font-medium"
                    : "text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface2"
                }`}
              >
                {letter === "ALL" ? c("All", "الكل") : letter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c("Search houses…", "ابحث عن دار…")}
              className="w-full h-9 ps-8 pe-3 text-xs bg-luxury-surface border border-luxury-border text-luxury-text focus:outline-none focus:border-luxury-borderBold"
            />
            <Search size={14} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-luxury-muted" />
          </div>
        </div>
      </div>

      {/* 3. Brands Grid (Clean Luxury Presentation) */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-luxury-muted">
          {c("No fragrance houses found matching your search.", "لم يتم العثور على دور عطور مطابقة للبحث.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group border border-luxury-border bg-luxury-surface p-6 flex flex-col justify-between hover:border-luxury-borderBold transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.14em] text-luxury-muted pb-3 border-b border-luxury-border">
                  <span className="flex items-center gap-1.5">
                    <Globe size={11} className="text-accent" />
                    <span>{isAr ? brand.countryAr : brand.countryEn}</span>
                  </span>
                  <span>Est. {brand.year}</span>
                </div>

                <div className="py-6 flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-luxury-text font-normal group-hover:underline">
                    {brand.name}
                  </h3>
                  <ArrowUpRight size={18} className="text-luxury-muted group-hover:text-luxury-text transition-colors" />
                </div>

                <p className="text-xs text-luxury-muted leading-relaxed line-clamp-3">
                  {isAr ? brand.descriptionAr : brand.descriptionEn}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-luxury-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase text-luxury-muted block">
                    {c("Signature Creation", "العطر الأيقوني")}
                  </span>
                  <span className="font-medium text-luxury-text">
                    {brand.featuredPerfume}
                  </span>
                </div>
                <span className="text-[11px] text-accent font-medium">
                  {brand.perfumesCount} {c("Creations", "إصدارات")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
