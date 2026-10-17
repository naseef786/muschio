import React from "react";
import Image from "next/image";
import { Link } from "../../navigation";
import { ArrowUpRight, ShieldCheck, Truck, Package, Sparkles } from "lucide-react";
import { ProductCard } from "../../components/product-card";

const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

const CURATED_FEATURED = [
  {
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait",
    nameAr: "إنترلود 53 إكستري",
    brand: "Amouage",
    concentration: "Extrait de Parfum (53%)",
    price: 1850,
    compareAtPrice: 2100,
    image: "/amouage-placeholder.svg",
    badge: "Extrait (53%)",
  },
  {
    slug: "mfk-baccarat-rouge-540-extrait",
    nameEn: "Baccarat Rouge 540 Extrait",
    nameAr: "باكارات روج 540 إكستري",
    brand: "Maison Francis Kurkdjian",
    concentration: "Extrait de Parfum",
    price: 1650,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
    secondaryImage:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    badge: "Haute Niche",
  },
  {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    concentration: "Pure Parfum",
    price: 1950,
    compareAtPrice: 2200,
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
    badge: "Pure Parfum",
  },
  {
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    concentration: "Eau de Parfum",
    price: 2200,
    compareAtPrice: 2450,
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    badge: "Rare Batch",
  },
];

const PRESTIGE_HOUSES = [
  { name: "Amouage", origin: "Sultanate of Oman", slug: "amouage", descEn: "The Gift of Kings", descAr: "هدية الملوك" },
  { name: "Maison Francis Kurkdjian", origin: "Paris, France", slug: "maison-francis-kurkdjian", descEn: "Crystalline Modernity", descAr: "إشراقة عصرية" },
  { name: "Roja Parfums", origin: "London, UK", slug: "roja-parfums", descEn: "Haute Luxe English Perfumery", descAr: "فخامة إنجليزية نادرة" },
  { name: "Xerjoff", origin: "Turin, Italy", slug: "xerjoff", descEn: "Italian Royal Renaissance", descAr: "إبداع إيطالي استثنائي" },
  { name: "Tom Ford", origin: "United States", slug: "tom-ford", descEn: "Private Blend Atelier", descAr: "مجموعة برايفيت بليند" },
];

const RAW_NOTES = [
  { nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose", familyEn: "Floral", familyAr: "زهري" },
  { nameEn: "Silver Frankincense", nameAr: "لبان حوجري فضي", slug: "silver-frankincense", familyEn: "Resinous", familyAr: "صمغي" },
  { nameEn: "Cambodian Oud", nameAr: "عود كمبودي معتق", slug: "cambodian-oud", familyEn: "Oud & Woods", familyAr: "أخشاب وعود" },
  { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب نقي", slug: "golden-ambergris", familyEn: "Amber", familyAr: "عنبري" },
];

export default function HomePage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. Campaign Hero (Refined Editorial Balance) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#E6E4DE] bg-white overflow-hidden">
          {/* Hero Copy */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start space-y-6">
            <span className="eyebrow text-[#46513B]">
              {c("HAUTE PARFUMERIE · ARABIAN GULF", "دار العطور الراقية · الخليج العربي")}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#171917] font-normal leading-[1.05]">
              {c("The Art of", "فن")}{" "}
              <em className="italic font-serif">{c("Noble Sillage.", "الحضور المهيب.")}</em>
            </h1>
            <p className="text-xs sm:text-sm text-[#77776F] leading-relaxed max-w-md">
              {c(
                "Curating the world's most formidable extraits de parfum, aged attars, and raw olfactory essences for the connoisseurs of the Gulf.",
                "ننتقي أرقى خلاصات العطور العالمية المعتقة والزيوت النادرة لعشاق العطور الراقية في الخليج العربي.",
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop" className="editorial-button">
                <span>{c("Shop the Collection", "تسوق المجموعة")}</span>
                <ArrowUpRight size={16} />
              </Link>
              <Link href="/discover/ai" className="editorial-button-secondary">
                <Sparkles size={14} className="text-[#46513B]" />
                <span>{c("AI Sommelier", "مستشار العطور")}</span>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] bg-[#F3F1EC]">
            <Image
              src={photo("photo-1547887537-6158d64c35b3", 1400)}
              alt="Muschio Haute Parfumerie Flacon"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 inset-inline-start-4 bg-white/90 px-3 py-1.5 text-[10px] font-sans uppercase tracking-[0.16em] text-[#171917] border border-[#E6E4DE]">
              {c("MUSCHIO SELECTION / 2026", "مختارات موسكيو / ٢٠٢٦")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Discovery Strip (4 Column Category Jump) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-[#E6E4DE] bg-white divide-x divide-y md:divide-y-0 divide-[#E6E4DE]">
          {[
            ["/shop", c("Shop Fragrance", "تسوق العطور"), c("All Extraits", "جميع العطور")],
            ["/brands", c("The Houses", "دور العطور"), c("A–Z Directory", "دليل الدور")],
            ["/notes", c("Scent Notes", "نوتات العطر"), c("Raw Ingredients", "المكونات الخام")],
            ["/discover/sets", c("Discovery Sets", "مجموعات العينات"), c("5 x 2ml Boxes", "صناديق ٥ عينات")],
          ].map(([href, title, subtitle]) => (
            <Link
              key={href}
              href={href!}
              className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#F8F7F3] transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow text-[10px]">{subtitle}</span>
                <ArrowUpRight size={14} className="text-[#77776F] group-hover:text-[#171917] transition-colors" />
              </div>
              <span className="font-serif text-lg text-[#171917] font-medium group-hover:underline">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Level Shoes Curated Product Selection Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between pb-6 border-b border-[#E6E4DE] mb-8">
          <div>
            <span className="eyebrow mb-1">
              {c("SIGNATURE SELECTION", "المختارات المميزة")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#171917] font-normal">
              {c("Curated Masterpieces", "تحف عطرية مختارة")}
            </h2>
          </div>
          <Link href="/shop" className="editorial-text-link">
            {c("Shop All", "تسوق الكل")} ↗
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        <div className="product-grid">
          {CURATED_FEATURED.map((product) => (
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
        <div className="flex items-end justify-between pb-6 border-b border-[#E6E4DE] mb-8">
          <div>
            <span className="eyebrow mb-1">
              {c("THE HOUSES", "دور العطور")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#171917] font-normal">
              {c("Shop by Fragrance House", "تسوق حسب الدار")}
            </h2>
          </div>
          <Link href="/brands" className="editorial-text-link">
            {c("View All Houses", "عرض جميع الدور")} ↗
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PRESTIGE_HOUSES.map((house) => (
            <Link
              key={house.slug}
              href={`/brands/${house.slug}`}
              className="p-6 border border-[#E6E4DE] bg-white hover:border-[#171917] transition-all flex flex-col justify-between group h-44"
            >
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-[#77776F] block">
                  {house.origin}
                </span>
                <h3 className="font-serif text-xl text-[#171917] font-medium mt-2 group-hover:underline">
                  {house.name}
                </h3>
              </div>
              <div className="flex items-center justify-between text-xs text-[#77776F] pt-4 border-t border-[#E6E4DE]">
                <span>{c(house.descEn, house.descAr)}</span>
                <ArrowUpRight size={14} className="text-[#171917]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Discover by Scent Notes */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between pb-6 border-b border-[#E6E4DE] mb-8">
          <div>
            <span className="eyebrow mb-1">
              {c("THE OLFACTORY LIBRARY", "المكتبة العطرية")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#171917] font-normal">
              {c("Explore by Key Notes", "استكشف حسب النوتات")}
            </h2>
          </div>
          <Link href="/notes" className="editorial-text-link">
            {c("All Scent Notes", "جميع النوتات")} ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RAW_NOTES.map((n) => (
            <Link
              key={n.slug}
              href={`/notes/${n.slug}`}
              className="p-5 border border-[#E6E4DE] bg-white hover:bg-[#F8F7F3] transition-colors group flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-[#46513B] font-medium">
                  {c(n.familyEn, n.familyAr)}
                </span>
                <ArrowUpRight size={14} className="text-[#77776F] group-hover:text-[#171917]" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#171917] font-medium group-hover:underline">
                  {c(n.nameEn, n.nameAr)}
                </h3>
                <span className="text-xs text-[#77776F] mt-1 block">
                  {c("View Perfumes", "عرض العطور")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Bespoke Discovery Sets Feature */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 border border-[#E6E4DE] bg-white overflow-hidden">
          <div className="md:col-span-5 relative min-h-[340px] bg-[#F3F1EC]">
            <Image
              src={photo("photo-1592945403244-b3fbafd7f539", 1000)}
              alt="Muschio 5x2ml Discovery Set"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="md:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start space-y-5">
            <span className="eyebrow text-[#46513B]">
              {c("CURATED SAMPLING · 5 X 2ML", "مجموعة العينات المخصصة · ٥ × ٢ مل")}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#171917] font-normal leading-tight">
              {c("A Signature Scent Starts with Discovery.", "عطرك المميز يبدأ بتجربة حقيقية.")}
            </h2>
            <p className="text-xs sm:text-sm text-[#77776F] leading-relaxed max-w-lg">
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
        <div className="flex items-end justify-between pb-6 border-b border-[#E6E4DE] mb-8">
          <div>
            <span className="eyebrow mb-1">
              {c("EDITORIAL & ESSAYS", "المقالات والطقوس العطرية")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#171917] font-normal">
              {c("The Muschio Journal", "مجلة موسكيو")}
            </h2>
          </div>
          <Link href="/journal" className="editorial-text-link">
            {c("Visit Journal", "تصفح المجلة")} ↗
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-[#E6E4DE] bg-white p-6 sm:p-10">
          <div className="md:col-span-7 space-y-4 flex flex-col justify-center">
            <span className="eyebrow text-[#46513B]">{c("RITUALS OF THE GULF", "طقوس الخليج")}</span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#171917] font-normal leading-snug">
              {c(
                "The Ancient Chemistry of Layering: When Cambodian Oud Meets Royal Taif Rose",
                "فن مزج العطور التاريخي: لقاء العود الكمبودي بورد الطائف الملكي",
              )}
            </h3>
            <p className="text-xs sm:text-sm text-[#77776F] leading-relaxed">
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
          <div className="md:col-span-5 relative min-h-[260px] bg-[#F3F1EC] border border-[#E6E4DE]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 border border-[#E6E4DE] bg-white text-center">
          <div className="flex flex-col items-center space-y-2 p-4">
            <ShieldCheck size={24} className="text-[#46513B]" />
            <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-[#171917]">
              {c("100% Authentic Flacons", "عطور أصلية ومضمونة ١٠٠٪")}
            </h4>
            <p className="text-xs text-[#77776F] leading-relaxed">
              {c(
                "Sourced authoritatively and directly from master perfume houses and official brand ateliers.",
                "مستوردة مباشرة من دور العطور العالمية ومرخصة رسمياً بأعلى معايير الجودة.",
              )}
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border-t sm:border-t-0 sm:border-s border-[#E6E4DE]">
            <Truck size={24} className="text-[#46513B]" />
            <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-[#171917]">
              {c("GCC White-Glove Delivery", "شحن سريع لكافة دول الخليج")}
            </h4>
            <p className="text-xs text-[#77776F] leading-relaxed">
              {c(
                "Temperature-controlled express courier dispatch across UAE, KSA, Qatar, Kuwait, Bahrain, and Oman.",
                "شحن مبرد وسريع عبر أفضل شركات الشحن لضمان سلامة وثبات العطور.",
              )}
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border-t lg:border-t-0 lg:border-s border-[#E6E4DE]">
            <Package size={24} className="text-[#46513B]" />
            <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-[#171917]">
              {c("Complimentary 2ml Sample", "عينة ٢ مل مجانية مع كل طلب")}
            </h4>
            <p className="text-xs text-[#77776F] leading-relaxed">
              {c(
                "Every sealed full bottle arrives with an official 2ml discovery vial to test before breaking seals.",
                "كل زجاجة مغلفة تأتي مع عينة ٢ مل لتجربتها أولاً مع ضمان الإرجاع للعبوات غير المفتوحة.",
              )}
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 border-t sm:border-t-0 sm:border-s border-[#E6E4DE]">
            <Sparkles size={24} className="text-[#46513B]" />
            <h4 className="text-xs font-sans font-medium uppercase tracking-wider text-[#171917]">
              {c("Fragrance Concierge", "مستشار العطور الخاص")}
            </h4>
            <p className="text-xs text-[#77776F] leading-relaxed">
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
