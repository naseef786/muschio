import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { muschioApi } from "../../../../lib/api";
import { NotesService } from "@muschio/api";
import { buildLocalizedMetadata } from "../../../../lib/page-metadata";
import { resolveNoteSlug } from "../../../../lib/seo-redirects";
import { customerCopy } from "../../../../lib/customer-copy";
import { generateBreadcrumbJsonLd, safeJsonLd } from "../../../../lib/seo";

export const dynamic = "force-dynamic";

const getNoteBySlug = cache((slug: string) => NotesService.getNoteBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cleanSlug = decodeURIComponent(slug).trim();
  const noteData = await getNoteBySlug(cleanSlug).catch(() => null);
  const note = noteData?.note;

  if (!note) {
    return buildLocalizedMetadata({
      locale,
      path: `/notes/${cleanSlug}`,
      title: locale === "ar" ? "النوتة العطرية غير متوفرة | موسكيو" : "Fragrance Note Unavailable | Muschio",
      description: locale === "ar" ? "النوتة العطرية المطلوبة غير متوفرة حالياً." : "The requested fragrance note is not currently available.",
      index: false,
    });
  }

  const name = locale === "ar" ? note.nameAr || note.nameEn : note.nameEn || note.nameAr;
  const description = locale === "ar"
    ? note.descriptionAr || note.descriptionEn
    : note.descriptionEn || note.descriptionAr;
  const canonicalSlug = note.slugEn || cleanSlug;

  return buildLocalizedMetadata({
    locale,
    path: `/notes/${canonicalSlug}`,
    title: locale === "ar" ? `${name}: نوتة عطرية | موسكيو` : `${name} Fragrance Note | Muschio`,
    description: description || (locale === "ar"
      ? `تعرف على نوتة ${name} واكتشف العطور التي تبرزها لدى موسكيو.`
      : `Learn about the ${name} fragrance note and discover Muschio perfumes that feature it.`),
    image: note.heroImageUrl || note.thumbnailUrl,
  });
}

export default async function NoteDetailPage(
  props: {
    params: Promise<{ locale: "en" | "ar"; slug: string }>;
  }
) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);

  const cleanSlug = decodeURIComponent(slug).trim();

  let noteData: any = null;
  let perfumesData: any = null;

  try {
    const [directNote, directPerfumes] = await Promise.all([
      getNoteBySlug(cleanSlug),
      NotesService.getPerfumesByNoteSlug(cleanSlug),
    ]);
    noteData = directNote;
    perfumesData = directPerfumes;
  } catch (err) {
    console.warn("Direct NotesService query failed, falling back to API:", err);
  }

  if (!noteData) {
    try {
      const [apiNote, apiPerfumes] = await Promise.all([
        muschioApi.getNoteBySlug(cleanSlug),
        muschioApi.getPerfumesByNoteSlug(cleanSlug),
      ]);
      noteData = apiNote;
      perfumesData = apiPerfumes;
    } catch (err) {
      console.warn("muschioApi note query failed:", err);
    }
  }

  if (!noteData) {
    const canonicalNoteSlug = resolveNoteSlug(cleanSlug);
    if (canonicalNoteSlug && canonicalNoteSlug !== cleanSlug) {
      permanentRedirect(`/${locale}/notes/${canonicalNoteSlug}`);
    }
    notFound();
  }

  const note = (noteData as any).note || noteData;
  const relatedNotes = (noteData as any).relatedNotes || [];
  const products = perfumesData?.products || [];

  const noteName = isAr ? note.nameAr || note.nameEn : note.nameEn || note.nameAr;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: isAr ? "الرئيسية" : "Home", url: `/${locale}` },
    { name: isAr ? "النوتات العطرية" : "Fragrance Notes", url: `/${locale}/notes` },
    { name: noteName, url: `/${locale}/notes/${note.slugEn || cleanSlug}` },
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
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
          {note.category && (
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-accent px-2.5 py-1 bg-luxury-surface2 border border-luxury-border">
              {note.category}
            </span>
          )}
          {note.origin && (
            <span className="text-xs text-luxury-muted font-sans">
              {note.origin}
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
          {c(note.nameEn, note.nameAr)}
        </h1>

        <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-3xl">
          {isAr ? note.descriptionAr || note.descriptionEn : note.descriptionEn || note.descriptionAr}
        </p>

        {/* Companion Notes */}
        {relatedNotes.length > 0 && (
          <div className="pt-3 border-t border-luxury-border flex items-center gap-2 flex-wrap">
            <span className="text-xs text-luxury-muted me-2">
              {c("Harmonious Companion Notes:", "نوتات تتناغم مع هذه الخلاصة:")}
            </span>
            {relatedNotes.map((rn: any) => (
              <Link
                key={rn.slugEn || rn.id}
                href={`/notes/${rn.slugEn}`}
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
              {c("FEATURED FRAGRANCES", "العطور المسجلة")}
            </span>
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {c(
                `Perfumes Featuring ${note.nameEn}`,
                `عطور تتضمن نوتة ${note.nameAr}`,
              )}
            </h2>
          </div>
          <span className="text-xs text-luxury-muted">
            {products.length} {c("Available", "متوفر")}
          </span>
        </div>

        {/* Level Shoes 2-col mobile / 3-col tablet / 4-col desktop product grid */}
        {products.length === 0 ? (
          <div className="py-16 text-center border border-luxury-border bg-luxury-surface">
            <p className="text-sm text-luxury-muted font-sans">
              {c(
                "No fragrances currently featured with this note.",
                "لا توجد عطور متوفرة حالياً تتضمن هذه الخلاصة العطرية.",
              )}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((item: any) => {
              const perfume = item.product || item;
              return (
                <ProductCard
                  key={perfume.slug}
                  slug={perfume.slug}
                  nameEn={perfume.nameEn}
                  nameAr={perfume.nameAr}
                  brand={perfume.brand?.name || "Haute Parfumerie"}
                  concentration={perfume.concentration}
                  price={Number(perfume.variants?.[0]?.price || 0)}
                  compareAtPrice={
                    perfume.variants?.[0]?.compareAtPrice
                      ? Number(perfume.variants[0].compareAtPrice)
                      : null
                  }
                  variants={perfume.variants}
                  image={perfume.images?.[0] || "/placeholder-flacon.png"}
                  images={perfume.images}
                  badge={item.position ? `${item.position} Note` : undefined}
                  locale={locale}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
