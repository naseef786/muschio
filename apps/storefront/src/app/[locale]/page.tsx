import React from "react";
import Image from "next/image";
import { Link } from "../../navigation";
import { ArrowUpRight, ShieldCheck, Truck, RotateCcw, Sparkles, Tag } from "lucide-react";
import { CollectionSlider } from "../../components/collection-slider";
import { muschioApi } from "../../lib/api";
import { BannerService, CatalogService, NotesService, storefrontProduct, prisma } from "@muschio/api";

export const dynamic = "force-dynamic";

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// Default hero banner fallback (used when no CMS banners are configured)
const DEFAULT_HERO = {
  eyebrowEn: "HAUTE PARFUMERIE · ARABIAN GULF",
  eyebrowAr: "دار العطور الراقية · الخليج العربي",
  titleEn: "The Art of",
  titleAr: "فن",
  titleEmEn: "Noble Sillage.",
  titleEmAr: "الحضور المهيب.",
  subtitleEn: "Curating the world's most formidable extraits de parfum, aged attars, and raw olfactory essences for the connoisseurs of the Gulf.",
  subtitleAr: "ننتقي أرقى خلاصات العطور العالمية المعتقة والزيوت النادرة لعشاق العطور الراقية في الخليج العربي.",
  ctaTextEn: "Shop the Collection",
  ctaTextAr: "تسوق المجموعة",
  ctaUrl: "/shop",
  secondaryCtaTextEn: "AI Sommelier",
  secondaryCtaTextAr: "مستشار العطور",
  secondaryCtaUrl: "/discover/ai",
  imageUrl: photo("photo-1547887537-6158d64c35b3", 1400),
  overlayLabelEn: "MUSCHIO SELECTION / 2026",
  overlayLabelAr: "مختارات موسكيو / ٢٠٢٦",
};

// Default offer / deal banner fallback
const DEFAULT_OFFER_BANNER = {
  eyebrowEn: "LIMITED PROMOTIONAL OFFER · EXCLUSIVE DEALS",
  eyebrowAr: "عرض ترويجي حصري · صفقات خاصة",
  titleEn: "Private Client Reserve | Up to 20% Off",
  titleAr: "مختارات كبار الشخصيات | خصم حتى ٢٠٪",
  subtitleEn: "Acquire rare artisanal extraits and pure parfums with complimentary white-glove courier delivery across the GCC.",
  subtitleAr: "اقتنِ أنقى خلاصات العطور النيش النادرة مع توصيل مبرد مجاني لكافة مدن الخليج العربي.",
  ctaTextEn: "Explore Privé Deals",
  ctaTextAr: "استكشف العروض الحصرية",
  ctaUrl: "/shop?deal=true",
  overlayLabelEn: "VIP DEAL CODE: MUSCHIO20",
  overlayLabelAr: "رمز العرض: MUSCHIO20",
  imageUrl: photo("photo-1592945403244-b3fbafd7f539", 1400),
};

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);

  // Fetch live CMS banners, sections & catalog data directly from services with API fallback
  let heroBanners: any = null;
  let midCampaignBanners: any = null;
  let promoStripBanners: any = null;
  let liveSections: any = null;
  let liveProducts: any = null;
  let liveBrands: any = null;
  let liveNotes: any = null;
  let liveCollections: any = null;

  try {
    [
      heroBanners,
      midCampaignBanners,
      promoStripBanners,
      liveSections,
      liveProducts,
      liveBrands,
      liveNotes,
      liveCollections,
    ] = await Promise.all([
      BannerService.getActiveBanners("HERO_SLIDER").catch(() => muschioApi.getActiveBanners("HERO_SLIDER")),
      BannerService.getActiveBanners("CAMPAIGN_MID").catch(() => muschioApi.getActiveBanners("CAMPAIGN_MID")),
      BannerService.getActiveBanners("PROMO_STRIP").catch(() => muschioApi.getActiveBanners("PROMO_STRIP")),
      BannerService.getVisibleSections().catch(() => muschioApi.getHomepageSections()),
      CatalogService.getProducts({ page: 1, limit: 16, sort: "featured" }).then((res: any) => (res?.items || res || []).map(storefrontProduct)).catch(() => muschioApi.getProducts({ limit: 16 })),
      CatalogService.getBrands().catch(() => muschioApi.getBrands()),
      NotesService.getNotes({ limit: 6 }).then((res: any) => res?.items || res || []).catch(() => muschioApi.getNotes({ limit: 6 })),
      prisma.collection.findMany({
        where: { isFeatured: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          products: {
            orderBy: { displayOrder: "asc" },
            include: {
              product: {
                include: {
                  brand: true,
                  variants: { orderBy: { price: "asc" } },
                },
              },
            },
          },
        },
      }).catch(() => muschioApi.getCollections({ featured: true })),
    ]);
  } catch (err) {
    console.warn("In-process home fetch fell back to muschioApi:", err);
    [
      heroBanners,
      midCampaignBanners,
      promoStripBanners,
      liveSections,
      liveProducts,
      liveBrands,
      liveNotes,
      liveCollections,
    ] = await Promise.all([
      muschioApi.getActiveBanners("HERO_SLIDER"),
      muschioApi.getActiveBanners("CAMPAIGN_MID"),
      muschioApi.getActiveBanners("PROMO_STRIP"),
      muschioApi.getHomepageSections(),
      muschioApi.getProducts({ limit: 16 }),
      muschioApi.getBrands(),
      muschioApi.getNotes({ limit: 6 }),
      muschioApi.getCollections({ featured: true }),
    ]);
  }

  // Resolve active sections (respecting admin sortOrder and isVisible)
  let rawSections = liveSections && liveSections.length > 0 ? liveSections : null;
  if (!rawSections) {
    try {
      rawSections = await BannerService.getVisibleSections();
    } catch {
      rawSections = BannerService.DEFAULT_SECTIONS.filter((s) => s.isVisible);
    }
  }

  const visibleSections = [...(rawSections || [])]
    .filter((s: any) => s.isVisible !== false)
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Resolve hero banner
  const hero = heroBanners?.[0] ?? null;
  const heroEyebrow = hero
    ? c(hero.eyebrowEn || "", hero.eyebrowAr || "")
    : c(DEFAULT_HERO.eyebrowEn, DEFAULT_HERO.eyebrowAr);

  const rawTitleEn = hero?.titleEn || `${DEFAULT_HERO.titleEn} | ${DEFAULT_HERO.titleEmEn}`;
  const rawTitleAr = hero?.titleAr || `${DEFAULT_HERO.titleAr} | ${DEFAULT_HERO.titleEmAr}`;
  const rawTitle = ar ? rawTitleAr : rawTitleEn;
  const titleParts = rawTitle.split("|").map((s: string) => s.trim());
  const titleMain = titleParts[0] || "";
  const titleEm = titleParts[1] || "";

  const heroSubtitle = hero
    ? c(hero.subtitleEn || "", hero.subtitleAr || "")
    : c(DEFAULT_HERO.subtitleEn, DEFAULT_HERO.subtitleAr);

  const heroCtaText = hero
    ? c(hero.ctaTextEn || "", hero.ctaTextAr || "")
    : c(DEFAULT_HERO.ctaTextEn, DEFAULT_HERO.ctaTextAr);
  const heroCtaUrl = hero?.ctaUrl || DEFAULT_HERO.ctaUrl;

  const heroSecondaryCtaText = hero
    ? c(hero.secondaryCtaTextEn || "", hero.secondaryCtaTextAr || "")
    : c(DEFAULT_HERO.secondaryCtaTextEn, DEFAULT_HERO.secondaryCtaTextAr);
  const heroSecondaryCtaUrl = hero?.secondaryCtaUrl || DEFAULT_HERO.secondaryCtaUrl;

  const heroImageUrl = hero?.imageUrl || DEFAULT_HERO.imageUrl;
  const heroOverlay = hero
    ? c(hero.overlayLabelEn || "", hero.overlayLabelAr || "")
    : c(DEFAULT_HERO.overlayLabelEn, DEFAULT_HERO.overlayLabelAr);

  // Resolve promotional offer banner (CAMPAIGN_MID)
  const offerBanner = midCampaignBanners?.[0] || DEFAULT_OFFER_BANNER;
  const promoStrip = promoStripBanners?.[0] || null;

  // Format live products
  const featuredProducts = (liveProducts || []).map((p: any) => {
    const v = p.variants?.find((variant: any) => !variant.isSampleVial) || p.variants?.[0];
    return {
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      brand: p.brand?.name || p.brand || "",
      concentration: (p.concentration || "").replaceAll("_", " "),
      price: v?.price || p.price || 0,
      compareAtPrice: v?.compareAtPrice,
      image: p.images?.[0] || p.image || "/product-placeholder.svg",
      secondaryImage: p.images?.[1],
      badge: p.brand?.type === "NICHE" ? "Haute Niche" : "Private Blend",
      variants: p.variants || [],
    };
  });

  // Filter deal products for promotional showcase
  const dealProducts = featuredProducts.filter(
    (p: any) => p.compareAtPrice && p.compareAtPrice > p.price,
  );

  const formattedCollections = (liveCollections || []).map((col: any) => ({
    id: col.id,
    nameEn: col.nameEn,
    nameAr: col.nameAr,
    slug: col.slug,
    descriptionEn: col.descriptionEn,
    descriptionAr: col.descriptionAr,
    products: (col.products || []).map((item: any) => {
      const p = item.product || item;
      const v = p.variants?.find((variant: any) => !variant.isSampleVial) || p.variants?.[0];
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand?.name || p.brand || "",
        concentration: (p.concentration || "").replaceAll("_", " "),
        price: v?.price || p.price || 0,
        compareAtPrice: v?.compareAtPrice,
        image: p.images?.[0] || p.image || "/product-placeholder.svg",
        secondaryImage: p.images?.[1],
        badge: p.brand?.type === "NICHE" ? "Haute Niche" : "Private Blend",
        variants: p.variants || [],
      };
    }),
  }));

  const prestigeHouses = (liveBrands || []).slice(0, 5).map((b: any) => ({
    name: b.name,
    origin: b.countryOfOrigin || "Haute Parfumerie",
    slug: b.slug,
    descEn: b.descriptionEn || "Official Atelier Partner",
    descAr: b.descriptionAr || "شريك رسمي معتمد",
  }));

  const rawNotes = (liveNotes || []).slice(0, 4).map((n: any) => ({
    nameEn: n.nameEn,
    nameAr: n.nameAr,
    slug: n.slugEn || n.slug,
    familyEn: n.categoryEn || "Natural Note",
    familyAr: n.categoryAr || "نوتة طبيعية",
  }));

  // ─── SECTION RENDERERS ──────────────────────────────────────

  const renderHeroBanner = () => (
    <section key="HERO_BANNER" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-luxury-border bg-luxury-surface overflow-hidden">
        {/* Hero Copy */}
        <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start space-y-6">
          {heroEyebrow && (
            <span className="eyebrow text-accent">{heroEyebrow}</span>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-luxury-text font-normal leading-[1.05]">
            {titleMain}{titleEm ? " " : ""}
            {titleEm && <em className="italic font-serif">{titleEm}</em>}
          </h1>
          {heroSubtitle && (
            <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-md">
              {heroSubtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {heroCtaText && (
              <Link href={heroCtaUrl} className="editorial-button">
                <span>{heroCtaText}</span>
                <ArrowUpRight size={16} />
              </Link>
            )}
            {heroSecondaryCtaText && (
              <Link href={heroSecondaryCtaUrl} className="editorial-button-secondary">
                <Sparkles size={14} className="text-accent" />
                <span>{heroSecondaryCtaText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] bg-luxury-surface2">
          <Image
            src={heroImageUrl}
            alt="Muschio Haute Parfumerie Flacon"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          {heroOverlay && (
            <div className="absolute bottom-4 start-4 left-4 rtl:left-auto rtl:right-4 bg-luxury-surface/90 px-3 py-1.5 text-[10px] font-sans uppercase tracking-[0.16em] text-luxury-text border border-luxury-border">
              {heroOverlay}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderDiscoveryStrip = () => (
    <section key="DISCOVERY_STRIP" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          ["/shop", c("Shop Fragrance", "تسوق العطور"), c("All Extraits", "جميع العطور")],
          ["/brands", c("The Houses", "دور العطور"), c("A–Z Directory", "دليل الدور")],
          ["/notes", c("Scent Notes", "نوتات العطر"), c("Raw Ingredients", "المكونات الخام")],
          ["/discover/sets", c("Discovery Sets", "مجموعات العينات"), c("5 x 2ml Boxes", "صناديق ٥ عينات")],
        ].map(([href, title, subtitle]) => (
          <Link
            key={href}
            href={href!}
            className="border border-luxury-border bg-luxury-surface hover:border-luxury-muted hover:bg-luxury-surface2 p-5 sm:p-6 flex flex-col justify-between group h-32 transition-all duration-300 rounded-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow text-[10px]">{subtitle}</span>
              <ArrowUpRight size={14} className="text-luxury-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <span className="font-serif text-lg text-luxury-text font-medium group-hover:text-accent transition-colors">
              {title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );

  const renderFeaturedProducts = () => (
    <section key="FEATURED_PRODUCTS" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <CollectionSlider
        eyebrow={c("SIGNATURE SELECTION", "المختارات المميزة")}
        title={c("Curated Masterpieces", "تحف عطرية مختارة")}
        subtitle={c(
          "Explore our rare extraits de parfum, aged attars, and private collections hand-curated for olfactory connoisseurs.",
          "استكشف أنقى خلاصات العطور العالمية والأدهان المعتقة المنتقاة بعناية لصفوة عشاق العطور.",
        )}
        viewAllHref="/shop"
        viewAllText={c("Shop All Flacons", "تسوق جميع العطور")}
        products={featuredProducts}
        collections={formattedCollections}
        locale={locale}
        enableTabs={true}
      />
    </section>
  );

  const renderHousesGrid = () => (
    <section key="HOUSES_GRID" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between pb-6 border-b border-luxury-border mb-8">
        <div>
          <span className="eyebrow mb-1">
            {c("THE HOUSES", "دور العطور")}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
            {c("Shop by Fragrance House", "تسوق حسب الدار")}
          </h2>
        </div>
        <Link href="/brands" className="editorial-text-link">
          {c("View All Houses", "عرض جميع الدور")} ↗
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 pb-2">
        {prestigeHouses.map((house: any) => (
          <Link
            key={house.slug}
            href={`/brands/${house.slug}`}
            className="w-[260px] shrink-0 snap-start sm:w-auto border border-luxury-border bg-luxury-surface hover:border-luxury-muted hover:bg-luxury-surface2 p-6 flex flex-col justify-between group h-44 transition-all duration-300 rounded-sm"
          >
            <div>
              <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-luxury-muted block">
                {house.origin}
              </span>
              <h3 className="font-serif text-xl text-luxury-text font-medium mt-2 group-hover:text-accent transition-colors">
                {house.name}
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs text-luxury-muted pt-4 border-t border-luxury-border">
              <span>{c(house.descEn, house.descAr)}</span>
              <ArrowUpRight size={14} className="text-luxury-text group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  const renderNotesGrid = () => (
    <section key="NOTES_GRID" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between pb-6 border-b border-luxury-border mb-8">
        <div>
          <span className="eyebrow mb-1">
            {c("THE OLFACTORY LIBRARY", "المكتبة العطرية")}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
            {c("Explore by Key Notes", "استكشف حسب النوتات")}
          </h2>
        </div>
        <Link href="/notes" className="editorial-text-link">
          {c("All Scent Notes", "جميع النوتات")} ↗
        </Link>
      </div>

      <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 pb-2">
        {rawNotes.map((n: any) => (
          <Link
            key={n.slug}
            href={`/notes/${n.slug}`}
            className="w-[240px] shrink-0 snap-start sm:w-auto border border-luxury-border bg-luxury-surface hover:border-luxury-muted hover:bg-luxury-surface2 p-5 flex flex-col justify-between group h-36 transition-all duration-300 rounded-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-accent font-medium">
                {c(n.familyEn, n.familyAr)}
              </span>
              <ArrowUpRight size={14} className="text-luxury-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-luxury-text font-medium group-hover:text-accent transition-colors">
                {c(n.nameEn, n.nameAr)}
              </h3>
              <span className="text-xs text-luxury-muted mt-1 block">
                {c("View Perfumes", "عرض العطور")} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  const renderCustomBanner = () => (
    <section key="CUSTOM_BANNER" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      {/* Promotional Campaign & Offer Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-luxury-border bg-luxury-surface overflow-hidden rounded-sm">
        <div className="lg:col-span-7 relative min-h-[340px] lg:min-h-[460px] bg-luxury-surface2 order-2 lg:order-1">
          <Image
            src={offerBanner.imageUrl}
            alt={c(offerBanner.titleEn, offerBanner.titleAr)}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          {(offerBanner.overlayLabelEn || offerBanner.overlayLabelAr) && (
            <div className="absolute top-4 start-4 left-4 rtl:left-auto rtl:right-4 bg-luxury-surface/95 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-accent border border-luxury-border font-semibold shadow-sm">
              {c(offerBanner.overlayLabelEn || "", offerBanner.overlayLabelAr || "")}
            </div>
          )}
        </div>
        <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start space-y-5 order-1 lg:order-2">
          <span className="eyebrow text-accent">
            {c(
              offerBanner.eyebrowEn || "LIMITED PROMOTIONAL OFFER · EXCLUSIVE DEALS",
              offerBanner.eyebrowAr || "عرض ترويجي حصري · صفقات خاصة",
            )}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal leading-tight">
            {c(offerBanner.titleEn, offerBanner.titleAr)}
          </h2>
          {offerBanner.subtitleEn && (
            <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-md">
              {c(offerBanner.subtitleEn, offerBanner.subtitleAr || offerBanner.subtitleEn)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={offerBanner.ctaUrl || "/shop?deal=true"} className="editorial-button">
              <span>{c(offerBanner.ctaTextEn || "Explore Privé Deals", offerBanner.ctaTextAr || "استكشف العروض الحصرية")}</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Special Offers & Discounted Flacons Showcase */}
      {dealProducts.length > 0 && (
        <div className="mt-6 p-4 sm:p-6 border border-luxury-border bg-luxury-surface/50 rounded-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-luxury-border">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-accent" />
              <h3 className="font-serif text-sm sm:text-base text-luxury-text font-medium">
                {c("Featured Privé Reductions", "تخفيضات وعروض حصرية")}
              </h3>
            </div>
            <Link href="/shop?deal=true" className="editorial-text-link text-xs">
              {c("View All Deals", "عرض كل العروض")} ↗
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dealProducts.slice(0, 4).map((p: any) => {
              const savingsPct = p.compareAtPrice
                ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
                : 0;
              return (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="group border border-luxury-border bg-luxury-surface hover:border-luxury-muted p-3 flex flex-col justify-between transition-all rounded-sm"
                >
                  <div className="relative aspect-[3/4] w-full bg-luxury-surface2 mb-2 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={c(p.nameEn, p.nameAr)}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {savingsPct > 0 && (
                      <span className="absolute top-2 start-2 left-2 rtl:left-auto rtl:right-2 bg-rose-950/80 text-rose-300 border border-rose-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        -{savingsPct}%
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-luxury-muted uppercase block truncate">{p.brand}</span>
                    <h4 className="font-serif text-xs font-medium text-luxury-text truncate group-hover:text-accent transition-colors">
                      {c(p.nameEn, p.nameAr)}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-semibold text-luxury-text font-mono">{p.price} AED</span>
                      {p.compareAtPrice && (
                        <span className="text-[10px] text-luxury-muted line-through font-mono">{p.compareAtPrice} AED</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );

  const renderDiscoverySets = () => (
    <section key="DISCOVERY_SETS" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 border border-luxury-border bg-luxury-surface overflow-hidden rounded-sm">
        <div className="md:col-span-5 relative min-h-[340px] bg-luxury-surface2">
          <Image
            src={photo("photo-1592945403244-b3fbafd7f539", 1000)}
            alt="Muschio 5x2ml Discovery Set"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="md:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start space-y-5">
          <span className="eyebrow text-accent">
            {c("CURATED SAMPLING · 5 X 2ML", "مجموعة العينات المخصصة · ٥ × ٢ مل")}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal leading-tight">
            {c("A Signature Scent Starts with Discovery.", "عطرك المميز يبدأ بتجربة حقيقية.")}
          </h2>
          <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed max-w-lg">
            {c(
              "Build your personal box of 5 official maison discovery vials (2ml each). Experience each flacon across multiple days on your skin before acquiring a full bottle. Includes a redeemable voucher toward any full bottle.",
              "صمّم صندوقك الخاص المكون من ٥ عينات رسمية (٢ مل لكل عينة). جرّب كل عطر على بشرتك لعدة أيام قبل اختيار زجاجتك الكاملة، مع قسيمة شرائية تُخصم بالكامل عند شراء أي زجاجة.",
            )}
          </p>
          <div className="pt-2">
            <Link href="/discover/sets" className="editorial-button">
              <span>{c("Build Discovery Set", "صمّم مجموعة العينات")}</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const renderJournalFeature = () => (
    <section key="JOURNAL_FEATURE" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex items-end justify-between pb-6 border-b border-luxury-border mb-8">
        <div>
          <span className="eyebrow mb-1">
            {c("EDITORIAL & ESSAYS", "المقالات والطقوس العطرية")}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
            {c("The Muschio Journal", "مجلة موسكيو")}
          </h2>
        </div>
        <Link href="/journal" className="editorial-text-link">
          {c("Visit Journal", "تصفح المجلة")} ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-luxury-border bg-luxury-surface p-6 sm:p-10 lg:p-12 overflow-hidden rounded-sm">
        <div className="md:col-span-7 space-y-4 flex flex-col justify-center">
          <span className="eyebrow text-accent">{c("RITUALS OF THE GULF", "طقوس الخليج")}</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal leading-snug">
            {c(
              "The Ancient Chemistry of Layering: When Cambodian Oud Meets Royal Taif Rose",
              "فن مزج العطور التاريخي: لقاء العود الكمبودي بورد الطائف الملكي",
            )}
          </h3>
          <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">
            {c(
              "Explore the revered heritage of fragrance layering across the Arabian Gulf—from selecting the dense woody anchor to misting delicate crystalline florals.",
              "اكتشف التقاليد الخليجية العريقة في مزج العطور وطبقاتها—من اختيار القاعدة الخشبية الدافئة إلى نثر النفحات الوردية الكريستالية.",
            )}
          </p>
          <div className="pt-2">
            <Link
              href="/journal/art-of-layering-oud-and-taif-rose"
              className="editorial-text-link"
            >
              {c("Read the Essay", "اقرأ المقال الكامل")} ↗
            </Link>
          </div>
        </div>
        <div className="md:col-span-5 relative min-h-[260px] bg-luxury-surface2 border border-luxury-border overflow-hidden rounded-sm">
          <Image
            src={photo("photo-1594035910387-fea47794261f", 800)}
            alt="Fragrance Layering Ritual"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );

  const renderTrustIndicators = () => (
    <section key="TRUST_INDICATORS" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 border border-luxury-border bg-luxury-surface text-center rounded-sm">
        <div className="flex flex-col items-center space-y-2 p-4">
          <ShieldCheck size={24} className="text-accent" />
          <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-luxury-text">
            {c("100% Authentic Flacons", "عطور أصلية ومضمونة ١٠٠٪")}
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed">
            {c(
              "Sourced authoritatively and directly from master perfume houses and official brand ateliers.",
              "مستوردة مباشرة من دور العطور العالمية ومرخصة رسمياً بأعلى معايير الجودة.",
            )}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 p-4 border-t sm:border-t-0 sm:border-s border-luxury-border">
          <Truck size={24} className="text-accent" />
          <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-luxury-text">
            {c("GCC White-Glove Delivery", "شحن سريع لكافة دول الخليج")}
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed">
            {c(
              "Temperature-controlled express courier dispatch across UAE, KSA, Qatar, Kuwait, Bahrain, and Oman.",
              "شحن مبرد وسريع عبر أفضل شركات الشحن لضمان سلامة وثبات العطور.",
            )}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 p-4 border-t lg:border-t-0 lg:border-s border-luxury-border">
          <RotateCcw size={24} className="text-accent" />
          <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-luxury-text">
            {c("Free Returns up to 7 Days", "إرجاع مجاني حتى ٧ أيام")}
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed">
            {c(
              "Complimentary white-glove courier returns within 7 days on all unopened, factory-sealed flacons.",
              "استلام مجاني وإرجاع سلس خلال ٧ أيام لكافة الزجاجات المغلفة والمحفوظة بحالتها الأصلية.",
            )}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 p-4 border-t sm:border-t-0 sm:border-s border-luxury-border">
          <Sparkles size={24} className="text-accent" />
          <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-luxury-text">
            {c("Fragrance Concierge", "مستشار العطور الخاص")}
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed">
            {c(
              "Bespoke olfactory consultations via our AI Sommelier and private client advisory service.",
              "استشارات عطرية خاصة عبر مستشار العطور الذكي ومستشارينا المعتمدين.",
            )}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* Top Promotional Announcement Strip if active */}
      {promoStrip && (
        <div className="bg-luxury-surface2 border-b border-luxury-border py-2.5 px-4 text-center">
          <Link
            href={promoStrip.ctaUrl || "/shop"}
            className="inline-flex items-center gap-2 text-xs font-sans text-luxury-text hover:text-accent transition-colors"
          >
            <span className="bg-accent/20 text-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded">
              {c(promoStrip.eyebrowEn || "OFFER", promoStrip.eyebrowAr || "عرض")}
            </span>
            <span className="font-medium">{c(promoStrip.titleEn, promoStrip.titleAr)}</span>
            <ArrowUpRight size={12} className="text-luxury-muted" />
          </Link>
        </div>
      )}

      {/* Dynamic Sections (rendered in exact sortOrder from Neon DB) */}
      {visibleSections.map((sec: any) => {
        switch (sec.sectionType) {
          case "HERO_BANNER":
            return renderHeroBanner();
          case "DISCOVERY_STRIP":
            return renderDiscoveryStrip();
          case "FEATURED_PRODUCTS":
            return renderFeaturedProducts();
          case "HOUSES_GRID":
            return renderHousesGrid();
          case "NOTES_GRID":
            return renderNotesGrid();
          case "CUSTOM_BANNER":
            return renderCustomBanner();
          case "DISCOVERY_SETS":
            return renderDiscoverySets();
          case "JOURNAL_FEATURE":
            return renderJournalFeature();
          case "TRUST_INDICATORS":
            return renderTrustIndicators();
          default:
            return null;
        }
      })}
    </div>
  );
}
