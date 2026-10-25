"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Search, ArrowUpRight, Loader2 } from "lucide-react";
import { muschioApi } from "../../../lib/api";

interface LiveNote {
  id: string;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  categoryEn?: string | null;
  categoryAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  heroImageUrl?: string | null;
  featuredProductCount?: number;
}

export default function NotesIndexPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [notes, setNotes] = useState<LiveNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let active = true;
    muschioApi.getNotes({ limit: 100 }).then((data) => {
      if (!active) return;
      if (Array.isArray(data)) {
        setNotes(data as any);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    notes.forEach((n) => {
      if (n.categoryEn) cats.add(n.categoryEn);
    });
    return ["all", ...Array.from(cats).sort()];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedCategory !== "all" && n.categoryEn !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = n.nameEn.toLowerCase().includes(q) || n.nameAr.includes(q);
        const matchesDesc = (n.descriptionEn || "").toLowerCase().includes(q) || (n.descriptionAr || "").includes(q);
        const matchesCat = (n.categoryEn || "").toLowerCase().includes(q) || (n.categoryAr || "").includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [notes, selectedCategory, search]);

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
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-sans whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-luxury-text text-luxury-canvas font-medium"
                : "bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-borderBold"
            }`}
          >
            {c("All Notes", "كل النوتات")}
          </button>
          {categories.filter((cat) => cat !== "all").map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-sans whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-luxury-text text-luxury-canvas font-medium"
                  : "bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-borderBold"
              }`}
            >
              {cat}
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
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-xs text-luxury-muted space-y-3">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span>{c("Loading olfactory library from backend database…", "جاري تحميل المكتبة العطرية من قاعدة البيانات…")}</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-xs text-luxury-muted">
          {c("No scent notes found matching your search.", "لم يتم العثور على نوتات مطابقة للبحث.")}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredNotes.map((note) => {
            const image =
              note.heroImageUrl ||
              "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80";
            const perfumesCount = note.featuredProductCount ?? 1;
            const slug = note.slugEn;

            return (
              <Link
                key={note.id}
                href={`/notes/${encodeURIComponent(slug)}`}
                className="group border border-luxury-border bg-luxury-surface flex flex-col justify-between hover:border-luxury-borderBold transition-all"
              >
                <div className="relative aspect-[4/3] w-full bg-luxury-surface2 border-b border-luxury-border overflow-hidden">
                  <Image
                    src={image}
                    alt={c(note.nameEn, note.nameAr)}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {note.categoryEn && (
                    <span className="absolute top-2 start-2 left-2 rtl:left-auto rtl:right-2 text-[8px] sm:text-[9px] font-sans font-medium uppercase tracking-[0.12em] px-1.5 sm:px-2 py-0.5 bg-luxury-surface/95 text-luxury-text border border-luxury-border truncate max-w-[120px]">
                      {isAr ? (note.categoryAr || note.categoryEn) : note.categoryEn}
                    </span>
                  )}
                </div>

                <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.12em] text-luxury-muted block truncate">
                      {isAr ? (note.categoryAr || "خلاصة طبيعية") : (note.categoryEn || "Natural Extract")}
                    </span>
                    <h3 className="font-serif text-sm sm:text-lg text-luxury-text font-normal group-hover:underline mt-1 line-clamp-1">
                      {c(note.nameEn, note.nameAr)}
                    </h3>
                    <p className="text-xs text-luxury-muted leading-relaxed line-clamp-2 mt-1.5 hidden sm:block">
                      {c(note.descriptionEn || "", note.descriptionAr || "")}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-luxury-border flex items-center justify-between text-xs">
                    <span className="text-accent font-medium">
                      {perfumesCount} {c("Creations", "عطور")}
                    </span>
                    <span className="text-luxury-text group-hover:underline flex items-center gap-1">
                      <span>{c("Explore", "استكشف")}</span>
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
