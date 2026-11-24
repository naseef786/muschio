"use client";

import React from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { ArrowRight } from "lucide-react";
import { DEFAULT_SCENT_PROFILES } from "@muschio/types";
import { customerCopy } from "../lib/customer-copy";

export interface DiscoverScentSectionProps {
  locale: "en" | "ar";
  profiles?: any[];
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function DiscoverScentSection({
  locale,
  profiles,
  eyebrowEn = "OLFACTORY LANDSCAPES",
  eyebrowAr = "المجموعات العطرية",
  titleEn = "Discover Your Scent",
  titleAr = "اكتشف عالمك العطري",
  subtitleEn = "Embark on an olfactory voyage through 12 distinct fragrance families. From luminous citruses to majestic oud and rare woods, find the creation that resonates with your presence.",
  subtitleAr = "انطلق في رحلة عطرية عبر ١٢ عائلة عطرية مميزة. من عبير الحمضيات المنعشة إلى هيبة العود والأخشاب النادرة، اعثر على العطر الذي يجسد حضورك الفريد.",
}: DiscoverScentSectionProps) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);

  // Merge live profiles with default definitions
  const displayProfiles = React.useMemo(() => {
    if (profiles && profiles.length > 0) {
      // Create a map by slug for quick matching
      const liveMap = new Map<string, any>();
      profiles.forEach((p) => liveMap.set(p.slug, p));

      // Order according to DEFAULT_SCENT_PROFILES or displayOrder
      const merged = DEFAULT_SCENT_PROFILES.map((def) => {
        const live = liveMap.get(def.slug);
        return {
          ...def,
          ...(live || {}),
          productCount: live?._count?.products ?? live?.productCount ?? 0,
        };
      });

      // Add any additional custom profiles created in admin
      profiles.forEach((p) => {
        if (!DEFAULT_SCENT_PROFILES.some((d) => d.slug === p.slug)) {
          merged.push({
            ...p,
            productCount: p._count?.products ?? p.productCount ?? 0,
          });
        }
      });

      return merged;
    }
    return DEFAULT_SCENT_PROFILES.map((def) => ({ ...def, productCount: 0 }));
  }, [profiles]);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-luxury-border">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              {c(eyebrowEn, eyebrowAr)}
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-neutral-900 dark:text-neutral-50 font-normal tracking-tight">
            {c(titleEn, titleAr)}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
            {c(subtitleEn, subtitleAr)}
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors group shrink-0"
        >
          <span>{c("Explore All Fragrances", "استكشف كافة العطور")}</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          />
        </Link>
      </div>

      {/* Scent Profile Cards */}
      <div className="mt-8">
        {/* Mobile Horizontal Scroll / Desktop Responsive Grid */}
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
          {displayProfiles.map((profile) => {
            const name = isAr ? profile.nameAr : profile.nameEn;
            const desc = isAr ? profile.descriptionAr : profile.descriptionEn;
            const color = profile.colorHex || "#1a1a1a";

            return (
              <Link
                key={profile.slug}
                href={`/scent-profile/${profile.slug}`}
                className="group relative flex flex-col justify-end min-w-[260px] sm:min-w-0 h-[340px] sm:h-[380px] rounded-none overflow-hidden bg-neutral-900 snap-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {/* Background Image with Hover Zoom */}
                <Image
                  src={profile.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80"}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Overlay for Crisp Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

                {/* Accent Color Edge Line */}
                <div
                  className="absolute top-0 inset-x-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
                  style={{ backgroundColor: color }}
                />

                {/* Content Overlay */}
                <div className="relative z-10 p-5 flex flex-col justify-end text-white text-start rtl:text-right">
                  {/* Category Accent Badge & Flacon Count */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-widest bg-black/60 backdrop-blur-xs border border-white/15"
                      style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{c("Scent Family", "العائلة العطرية")}</span>
                    </span>

                    {typeof profile.productCount === "number" && profile.productCount > 0 && (
                      <span className="text-[11px] font-mono text-white/70">
                        {profile.productCount} {c("Flacons", "عطر")}
                      </span>
                    )}
                  </div>

                  {/* Profile Title */}
                  <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-white group-hover:text-amber-200 transition-colors">
                    {name}
                  </h3>

                  {/* Short Olfactory Description */}
                  {desc && (
                    <p className="mt-1 text-xs text-white/75 font-sans line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  {/* Explore Link CTA */}
                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-medium tracking-wider uppercase text-white/90 group-hover:text-white">
                    <span>{c("Explore Profile", "استكشف المجموعة")}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 text-amber-200"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
