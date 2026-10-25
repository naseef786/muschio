import React from "react";
import Image from "next/image";
import { Link } from "../../navigation";
import { ArrowUpRight, ShieldCheck, Truck, Package, Sparkles } from "lucide-react";
import { ProductCard } from "../../components/product-card";
import { muschioApi } from "../../lib/api";

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


export default async function HomePage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);

  // Fetch hero banners from CMS (SSR, revalidated every 60s via apiRequest)
  const heroBanners = await muschioApi.getActiveBanners("HERO_SLIDER");
  const hero = heroBanners?.[0] ?? null;

  // Resolve hero fields: CMS data → fallback defaults
  const heroEyebrow = hero
    ? c(hero.eyebrowEn || "", hero.eyebrowAr || "")
    : c(DEFAULT_HERO.eyebrowEn, DEFAULT_HERO.eyebrowAr);

  // Support "Title | Italic Part" format from CMS titleEn/titleAr
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

  // Dynamic live data from backend API
  const [liveProducts, liveBrands, liveNotes] = await Promise.all([
    muschioApi.getProducts({ limit: 4 }),
    muschioApi.getBrands(),
    muschioApi.getNotes({ limit: 4 }),
  ]);

  const featuredProducts = (liveProducts || []).map((p) => {
    const v = p.variants.find((variant) => !variant.isSampleVial) || p.variants[0];
    const isAmouage = p.slug === "amouage-interlude-53-man";
    return {
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      brand: p.brand.name,
      concentration: p.concentration.replaceAll("_", " "),
      price: v?.price || 0,
      compareAtPrice: v?.compareAtPrice,
      image: isAmouage ? "/amouage-placeholder.svg" : (p.images[0] || "/product-placeholder.svg"),
      secondaryImage: p.images[1],
      badge: p.brand.type === "NICHE" ? "Haute Niche" : "Private Blend",
    };
  });

  const prestigeHouses = (liveBrands || []).slice(0, 5).map((b) => ({
    name: b.name,
    origin: b.countryOfOrigin || "Haute Parfumerie",
    slug: b.slug,
    descEn: b.descriptionEn || "Official Atelier Partner",
    descAr: b.descriptionAr || "شريك رسمي معتمد",
  }));

  const rawNotes = (liveNotes || []).slice(0, 4).map((n: any) => ({
    nameEn: n.nameEn,
    nameAr: n.nameAr,
    slug: n.slugEn,
    familyEn: n.categoryEn || "Natural Note",
    familyAr: n.categoryAr || "نوتة طبيعية",
  }));

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. Campaign Hero (Dynamic from CMS with fallback) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-8">
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

      {/* 2. Quick Discovery Strip (4 Column Category Jump) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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

      {/* 3. Level Shoes Curated Product Selection Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between pb-6 border-b border-luxury-border mb-8">
          <div>
            <span className="eyebrow mb-1">
              {c("SIGNATURE SELECTION", "المختارات المميزة")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
              {c("Curated Masterpieces", "تحف عطرية مختارة")}
            </h2>
          </div>
          <Link href="/shop" className="editorial-text-link">
            {c("Shop All", "تسوق الكل")} ↗
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              nameEn={product.nameEn}
              nameAr={product.nameAr}
              brand={product.brand}
              concentration={product.concentration}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              image={product.image}
              secondaryImage={product.secondaryImage}
              badge={product.badge}
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* 4. Shop By Fragrance House */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {prestigeHouses.map((house) => (
            <Link
              key={house.slug}
              href={`/brands/${house.slug}`}
              className="border border-luxury-border bg-luxury-surface hover:border-luxury-muted hover:bg-luxury-surface2 p-6 flex flex-col justify-between group h-44 transition-all duration-300 rounded-sm"
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

      {/* 5. Discover by Scent Notes */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rawNotes.map((n) => (
            <Link
              key={n.slug}
              href={`/notes/${n.slug}`}
              className="border border-luxury-border bg-luxury-surface hover:border-luxury-muted hover:bg-luxury-surface2 p-5 flex flex-col justify-between group h-36 transition-all duration-300 rounded-sm"
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

      {/* 6. Bespoke Discovery Sets Feature */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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

      {/* 7. Muschio Journal Feature */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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

      {/* 8. Service Guarantees (Verified Level Shoes Client Trust Bar) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
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
            <Package size={24} className="text-accent" />
            <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-luxury-text">
              {c("Complimentary 2ml Sample", "عينة ٢ مل مجانية مع كل طلب")}
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              {c(
                "Every sealed full bottle arrives with an official 2ml discovery vial to test before breaking seals.",
                "كل زجاجة مغلفة تأتي مع عينة ٢ مل لتجربتها أولاً مع ضمان الإرجاع للعبوات غير المفتوحة.",
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
    </div>
  );
}
