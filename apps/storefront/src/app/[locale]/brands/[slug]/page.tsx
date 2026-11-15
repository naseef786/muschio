import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { Globe, ShieldCheck } from "lucide-react";
import { muschioApi } from "../../../../lib/api";
import { CatalogService } from "@muschio/api";
import { buildLocalizedMetadata } from "../../../../lib/page-metadata";
import { resolveBrandSlug } from "../../../../lib/seo-redirects";
import { customerCopy } from "../../../../lib/customer-copy";

export const dynamic = "force-dynamic";

const getBrandBySlug = cache((slug: string) => CatalogService.getBrandBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cleanSlug = decodeURIComponent(slug).trim();
  const brand = await getBrandBySlug(cleanSlug).catch(() => null);

  if (!brand) {
    return buildLocalizedMetadata({
      locale,
      path: `/brands/${cleanSlug}`,
      title: locale === "ar" ? "دار العطور غير متوفرة | موسكيو" : "Fragrance House Unavailable | Muschio",
      description: locale === "ar" ? "دار العطور المطلوبة غير متوفرة حالياً." : "The requested fragrance house is not currently available.",
      index: false,
    });
  }

  const description = locale === "ar"
    ? brand.descriptionAr || brand.descriptionEn
    : brand.descriptionEn || brand.descriptionAr;

  return buildLocalizedMetadata({
    locale,
    path: `/brands/${brand.slug}`,
    title: locale === "ar" ? `${brand.name} للعطور | موسكيو` : `${brand.name} Perfumes | Muschio`,
    description: description || (locale === "ar"
      ? `اكتشف عطور ${brand.name} المتوفرة لدى موسكيو.`
      : `Discover ${brand.name} fragrances, the house story, and the collection available at Muschio.`),
    image: brand.heroImageUrl || brand.logoUrl,
  });
}

export default async function BrandDetailPage(
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

  let brand: any = null;
  try {
    brand = await getBrandBySlug(cleanSlug);
  } catch (err) {
    console.warn("Direct CatalogService.getBrandBySlug error, falling back to API:", err);
  }

  if (!brand) {
    try {
      brand = await muschioApi.getBrandBySlug(cleanSlug);
    } catch (err) {
      console.warn("muschioApi.getBrandBySlug error:", err);
    }
  }

  if (!brand) {
    const canonicalBrandSlug = resolveBrandSlug(cleanSlug);
    if (canonicalBrandSlug && canonicalBrandSlug !== cleanSlug) {
      permanentRedirect(`/${locale}/brands/${canonicalBrandSlug}`);
    }
    notFound();
  }

  const products = brand.products || [];

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
            <Link href="/brands" className="hover:text-luxury-text transition-colors">
              {c("The Houses", "دور العطور")}
            </Link>
          </li>
          <li>/</li>
          <li className="text-luxury-text font-medium">{brand.name}</li>
        </ol>
      </nav>

      {/* 2. Compact Maison Editorial Header */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-luxury-border">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-accent px-2.5 py-1 bg-luxury-surface2 border border-luxury-border">
              {brand.type === "NICHE" ? "Haute Niche" : "Designer Privé"}
            </span>
            {brand.countryOfOrigin && (
              <span className="flex items-center gap-1.5 text-xs text-luxury-muted">
                <Globe size={13} className="text-accent" />
                <span>{brand.countryOfOrigin}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-accent">
            <ShieldCheck size={14} />
            <span>{c("Authorized Stockist", "موزع رسمي معتمد")}</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal">
            {brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">
            {isAr
              ? brand.descriptionAr || brand.descriptionEn
              : brand.descriptionEn || brand.descriptionAr}
          </p>
        </div>
      </div>

      {/* 3. Products by This House Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between pb-4 border-b border-luxury-border">
          <div>
            <span className="eyebrow mb-1">
              {c("AUTHORIZED FLACONS", "العطور المتوفرة")}
            </span>
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {c(`Creations by ${brand.name}`, `إصدارات دار ${brand.name}`)}
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
                "New creations from this house are currently in climate-controlled transit.",
                "إصدارات جديدة من هذه الدار قيد الشحن والتبريد حالياً.",
              )}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((perfume: any) => (
              <ProductCard
                key={perfume.slug}
                slug={perfume.slug}
                nameEn={perfume.nameEn}
                nameAr={perfume.nameAr}
                brand={brand.name}
                brandType={brand.type}
                concentration={perfume.concentration}
                price={
                  perfume.variants?.find((v: any) => !v.isSampleVial)?.price ||
                  perfume.variants?.[0]?.price ||
                  perfume.price ||
                  0
                }
                compareAtPrice={
                  perfume.variants?.find((v: any) => !v.isSampleVial)?.compareAtPrice ||
                  perfume.variants?.[0]?.compareAtPrice ||
                  perfume.compareAtPrice
                }
                variants={perfume.variants}
                image={perfume.images?.[0] || "/placeholder-flacon.png"}
                secondaryImage={perfume.images?.[1]}
                images={perfume.images}
                badge={brand.type === "NICHE" ? "Haute Niche" : undefined}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
