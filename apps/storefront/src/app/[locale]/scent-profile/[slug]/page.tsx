import React, { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { muschioApi } from "../../../../lib/api";
import { CatalogService, storefrontProduct, prisma } from "@muschio/api";
import { DEFAULT_SCENT_PROFILES } from "@muschio/types";
import { buildLocalizedMetadata } from "../../../../lib/page-metadata";
import { customerCopy } from "../../../../lib/customer-copy";
import { generateBreadcrumbJsonLd } from "../../../../lib/seo";
import { ArrowRight, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

const getScentProfile = cache(async (slug: string) => {
  try {
    const direct = await CatalogService.getScentProfileBySlug(slug);
    if (direct) return direct;
  } catch (e) {
    console.warn(`Direct CatalogService query failed for scent profile ${slug}:`, e);
  }
  try {
    const apiRes = await muschioApi.getScentProfileBySlug(slug);
    if (apiRes) return apiRes;
  } catch (e) {
    console.warn(`muschioApi scent profile query failed for ${slug}:`, e);
  }
  // Fallback to static definition
  const fallback = DEFAULT_SCENT_PROFILES.find((p) => p.slug === slug);
  return fallback || null;
});

const getProfileProducts = cache(async (profileSlug: string) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        scentProfiles: {
          some: {
            scentProfile: {
              slug: profileSlug,
            },
          },
        },
      },
      include: {
        brand: true,
        scentFamily: true,
        variants: {
          include: { inventory: true },
          orderBy: { price: "asc" },
        },
        notes: { include: { note: true } },
        tags: { include: { tag: true } },
        scentProfiles: { include: { scentProfile: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return products.map(storefrontProduct);
  } catch (err) {
    console.warn(`Direct product query failed for scent profile ${profileSlug}:`, err);
    try {
      const apiRes = await muschioApi.getProductsByScentProfile(profileSlug);
      if (Array.isArray(apiRes)) return apiRes;
    } catch {
      // Fallback
    }
    return [];
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
  const profile = await getScentProfile(cleanSlug);

  if (!profile) {
    return buildLocalizedMetadata({
      locale,
      path: `/scent-profile/${cleanSlug}`,
      title: locale === "ar" ? "المجموعة العطرية غير متوفرة | موسكيو" : "Scent Profile Unavailable | Muschio",
      description: locale === "ar" ? "المجموعة العطرية المطلوبة غير متوفرة حالياً." : "The requested olfactory profile is not currently available.",
      index: false,
    });
  }

  const name = locale === "ar" ? profile.nameAr || profile.nameEn : profile.nameEn || profile.nameAr;
  const description = locale === "ar"
    ? profile.descriptionAr || profile.descriptionEn
    : profile.descriptionEn || profile.descriptionAr;

  return buildLocalizedMetadata({
    locale,
    path: `/scent-profile/${cleanSlug}`,
    title: locale === "ar"
      ? `عطور ${name}: استكشف المجموعة العطرية | موسكيو الخليج`
      : `${name} Perfumes & Scent Profile | Muschio Haute Parfumerie`,
    description: description || (locale === "ar"
      ? `استكشف أرقى العطور ذات الطابع العطري ${name}. ننتقي أفخم إبداعات النيش والخلطات الخاصة في الخليج العربي.`
      : `Explore fine fragrances defined by the ${name} scent profile. Curated luxury niche and private blend flacons across the Arabian Gulf.`),
    image: profile.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
  });
}

export default async function ScentProfilePage(props: {
  params: Promise<{ locale: "en" | "ar"; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  const [profile, products, allProfiles] = await Promise.all([
    getScentProfile(cleanSlug),
    getProfileProducts(cleanSlug),
    CatalogService.getScentProfiles().catch(() => DEFAULT_SCENT_PROFILES),
  ]);

  if (!profile) {
    notFound();
  }

  const profileName = isAr ? profile.nameAr || profile.nameEn : profile.nameEn || profile.nameAr;
  const profileDesc = isAr ? profile.descriptionAr || profile.descriptionEn : profile.descriptionEn || profile.descriptionAr;
  const color = profile.colorHex || "#1a1a1a";

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: isAr ? "الرئيسية" : "Home", url: `/${locale}` },
    { name: isAr ? "المجموعات العطرية" : "Scent Profiles", url: `/${locale}/shop` },
    { name: profileName, url: `/${locale}/scent-profile/${cleanSlug}` },
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${profileName} Perfumes & Fragrance Collection`,
    description: profileDesc,
    url: `https://www.muschio.ae/${locale}/scent-profile/${cleanSlug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((p: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://www.muschio.ae/${locale}/product/${p.slug}`,
        name: isAr && p.nameAr ? p.nameAr : p.nameEn,
      })),
    },
  };

  // Other sibling profiles for cross-navigation
  const siblingProfiles = (allProfiles || DEFAULT_SCENT_PROFILES)
    .filter((p: any) => p.slug !== cleanSlug)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-luxury-canvas text-luxury-text pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* 1. Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-2">
        <nav aria-label="Breadcrumb" className="text-xs text-luxury-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-luxury-text transition-colors">
                {c("Home", "الرئيسية")}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/shop" className="hover:text-luxury-text transition-colors">
                {c("Scent Profiles", "المجموعات العطرية")}
              </Link>
            </li>
            <li>/</li>
            <li className="text-luxury-text font-medium">{profileName}</li>
          </ol>
        </nav>
      </div>

      {/* 2. Editorial Hero Banner */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-2">
        <div className="relative rounded-none overflow-hidden bg-neutral-950 border border-luxury-border min-h-[320px] sm:min-h-[380px] flex flex-col justify-end p-6 sm:p-12 text-white">
          {/* Cover Image */}
          <Image
            src={profile.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1600&q=85"}
            alt={profileName}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-45"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />

          {/* Color Accent Indicator Strip */}
          <div
            className="absolute top-0 inset-x-0 h-[4px]"
            style={{ backgroundColor: color }}
          />

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-black/70 backdrop-blur-xs border border-white/20"
                style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{c("Olfactory Family", "العائلة العطرية")}</span>
              </span>

              <span className="text-[11px] font-mono text-white/75 bg-white/10 px-2 py-0.5">
                {products.length} {c(products.length === 1 ? "Flacon" : "Flacons", "عطر")}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white">
              {profileName}
            </h1>

            {profileDesc && (
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed max-w-2xl">
                {profileDesc}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <Link
                href={`/shop?profile=${cleanSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                <span>{c("Filter in Shop", "تصفية في المتجر")}</span>
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fragrance Catalog Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-10 space-y-6">
        <div className="flex items-end justify-between pb-4 border-b border-luxury-border">
          <div>
            <span className="eyebrow mb-1">
              {c("CURATED SELECTIONS", "المختارات المسجلة")}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-luxury-text font-normal">
              {c(`${profileName} Creations`, `إبداعات مجموعة ${profileName}`)}
            </h2>
          </div>
          <span className="text-xs text-luxury-muted font-mono">
            {products.length} {c("Available", "متوفر")}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center border border-luxury-border bg-luxury-surface p-8 space-y-4">
            <Compass size={32} className="mx-auto text-neutral-400 stroke-[1.2]" />
            <h3 className="font-serif text-lg text-luxury-text">
              {c("New Creations Arriving Soon", "إبداعات جديدة قريباً")}
            </h3>
            <p className="text-xs text-luxury-muted max-w-md mx-auto">
              {c(
                "Our olfactory curators are currently aging and archiving new flacons for this profile.",
                "يقوم خبراء العطور في موسكيو حالياً بأرشفة وإعداد إصدارات جديدة تليق بهذه المجموعة.",
              )}
            </p>
            <Link
              href="/shop"
              className="inline-block mt-2 px-5 py-2 text-xs font-medium uppercase tracking-wider border border-luxury-border hover:border-black dark:hover:border-white transition-colors"
            >
              {c("Browse All Fragrances", "تصفح كافة العطور")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {products.map((p: any) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                nameEn={p.nameEn}
                nameAr={p.nameAr}
                brand={p.brand?.name || p.brand || "Haute Parfumerie"}
                brandType={p.brand?.type || p.brandType || "NICHE"}
                concentration={p.concentration}
                price={Number(p.variants?.[0]?.price || p.price || 0)}
                compareAtPrice={
                  p.variants?.[0]?.compareAtPrice
                    ? Number(p.variants[0].compareAtPrice)
                    : p.compareAtPrice
                      ? Number(p.compareAtPrice)
                      : null
                }
                variants={p.variants}
                image={p.images?.[0] || p.image || "/product-placeholder.svg"}
                secondaryImage={p.images?.[1]}
                images={p.images}
                badge={profileName}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Explore Sibling Scent Profiles */}
      {siblingProfiles.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-16 pt-10 border-t border-luxury-border space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow mb-1">
                {c("CONTINUE YOUR JOURNEY", "واصل استكشافك")}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-luxury-text font-normal">
                {c("Other Olfactory Landscapes", "مجموعات عطرية أخرى")}
              </h3>
            </div>
            <Link href="/shop" className="editorial-text-link text-xs">
              {c("View All", "عرض الكل")} ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {siblingProfiles.map((sib: any) => {
              const sibName = isAr ? sib.nameAr : sib.nameEn;
              const sibColor = sib.colorHex || "#1a1a1a";
              return (
                <Link
                  key={sib.slug}
                  href={`/scent-profile/${sib.slug}`}
                  className="group relative h-28 sm:h-32 border border-luxury-border bg-luxury-surface hover:border-black dark:hover:border-white p-4 flex flex-col justify-between transition-all overflow-hidden"
                >
                  <div
                    className="absolute top-0 inset-x-0 h-1 transition-all group-hover:h-1.5"
                    style={{ backgroundColor: sibColor }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sibColor }}
                    />
                    <ArrowRight
                      size={14}
                      className="text-luxury-muted group-hover:text-luxury-text transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-base text-luxury-text font-medium group-hover:text-black dark:group-hover:text-white transition-colors">
                      {sibName}
                    </h4>
                    <span className="text-[11px] text-luxury-muted">
                      {c("Explore Family", "استكشف العائلة")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
