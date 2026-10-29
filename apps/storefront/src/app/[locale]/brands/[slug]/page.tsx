import React from "react";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { Globe, ShieldCheck } from "lucide-react";
import { muschioApi } from "../../../../lib/api";

export const revalidate = 60;

export default async function BrandDetailPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const brand = await muschioApi.getBrandBySlug(slug);
  if (!brand) notFound();

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
                concentration={perfume.concentration}
                price={perfume.price}
                compareAtPrice={perfume.compareAtPrice}
                variants={perfume.variants}
                image={perfume.images?.[0] || "/placeholder-flacon.png"}
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
