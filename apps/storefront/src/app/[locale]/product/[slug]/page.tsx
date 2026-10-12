"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "../../../../navigation";
import {
  Button,
  PriceDisplay,
  InstallmentBadge,
  ScentPyramid,
} from "@muschio/ui";
import {
  ShieldCheck,
  Truck,
  Check,
  Star,
  Clock,
  Wind,
  MessageSquare,
  X,
  Droplets,
} from "lucide-react";

import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from "../../../../lib/seo";
import { useCart } from "../../../../context/cart-context";

// Authoritative luxury catalog vault
const PRODUCT_VAULT: Record<string, any> = {
  "amouage-interlude-53-man": {
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait de Parfum",
    nameAr: "إنترلود 53 إكستري دي بارفان",
    brand: "Amouage",
    taglineEn: "The legendary Blue Beast aged to 53% perfection.",
    taglineAr: "أسطورة الوحش الأزرق معتق بتركيز 53% استثنائي.",
    descriptionEn:
      "A testament to the power of maceration. Formulated at a formidable 53% perfume oil concentration and aged for six months in Oman. Interlude 53 reveals harmony in chaos with Silver Frankincense, pimento berry, oregano, and smoky Cambodian agarwood.",
    descriptionAr:
      "شاهد على قوة التعميق العطري. بتركيز 53% من الزيوت العطرية النقية ومعتق لمدة 6 أشهر في عُمان. يجمع بين اللبان الفضي وتوت البيمنتو والأوريغانو مع خشب العود الكمبودي الفاخر.",
    concentration: "Extrait de Parfum (53%)",
    perfumer: "Pierre Negrin",
    perfumerBio: "Master French perfumer renowned for sculpting deep, architectural incense and resinous extraits for royalty.",
    origin: "Sultanate of Oman",
    gender: "Men / Unisex",
    longevity: "24+ Hours (Monolithic)",
    sillage: "Royal Projection (6+ Feet)",
    ratingAverage: 4.95,
    ratingCount: 142,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85",
    ],
    variants: [
      { id: "v1", sku: "AMO-INT53-100", volumeMl: 100, labelEn: "100ml Extrait", labelAr: "100 مل إكستري", price: 1850, compareAt: 2100, inStock: true, stockCount: 14 },
      { id: "v2", sku: "AMO-INT53-50", volumeMl: 50, labelEn: "50ml Extrait", labelAr: "50 مل إكستري", price: 1190, compareAt: null, inStock: true, stockCount: 8 },
      { id: "v3", sku: "AMO-INT53-2ML", volumeMl: 2, labelEn: "2ml Official Sample", labelAr: "عينة 2 مل رسمية", price: 65, compareAt: null, inStock: true, stockCount: 45 },
    ],
    notes: [
      { id: "n1", name: "Calabrian Bergamot", slug: "calabrian-bergamot", position: "TOP" as const },
      { id: "n2", name: "Guatemalan Cardamom", slug: "guatemalan-cardamom", position: "TOP" as const },
      { id: "n3", name: "Silver Frankincense", slug: "silver-frankincense", position: "HEART" as const },
      { id: "n4", name: "Golden Ambergris", slug: "golden-ambergris", position: "HEART" as const },
      { id: "n5", name: "Cambodian Oud", slug: "cambodian-oud", position: "BASE" as const },
      { id: "n6", name: "Tuscan Leather", slug: "tuscan-leather", position: "BASE" as const },
    ],
    accords: [
      { nameEn: "Smoky & Resinous", nameAr: "دخاني وصمغي", score: 98, color: "from-amber-500 to-amber-700" },
      { nameEn: "Warm Balsamic", nameAr: "بلسمي دافئ", score: 92, color: "from-yellow-500 to-amber-600" },
      { nameEn: "Golden Amber", nameAr: "عنبر ذهبي", score: 88, color: "from-gold to-amber-500" },
      { nameEn: "Precious Oud", nameAr: "عود نادر", score: 85, color: "from-amber-800 to-stone-900" },
      { nameEn: "Aromatic Spice", nameAr: "توابل عطرية", score: 78, color: "from-rose-500 to-amber-600" },
    ],
    reviews: [
      {
        id: "r1",
        author: "Ahmad Al Maktoum",
        rating: 5,
        title: "The True Definition of Omani Royalty",
        body: "An absolute masterpiece. The 53% concentration changes the opening entirely—the harsh smoke is smoothed into aged velvet incense with rich balsamic sweetness. Lasts over 24 hours on thobe.",
        verified: true,
        date: "September 2026",
      },
      {
        id: "r2",
        author: "Khalid B.",
        rating: 5,
        title: "Worth Every Dirham",
        body: "Monolithic sillage. Wore this to a royal wedding in Abu Dhabi and received non-stop compliments all evening.",
        verified: true,
        date: "August 2026",
      },
    ],
  },
  "mfk-baccarat-rouge-540-extrait": {
    slug: "mfk-baccarat-rouge-540-extrait",
    nameEn: "Baccarat Rouge 540 Extrait de Parfum",
    nameAr: "باكارات روج 540 إكستري دي بارفان",
    brand: "Maison Francis Kurkdjian",
    taglineEn: "The luminous alchemy of crystal and precious saffron.",
    taglineAr: "كيمياء ساحرة بين بريق الكريستال والزعفران الثمين.",
    descriptionEn:
      "Created to celebrate the 250th anniversary of crystal manufacturer Baccarat. The Extrait de Parfum intensifies the radiance of the three auras: Egyptian Grandiflorum jasmine, Moroccan bitter almond, and ambergris.",
    descriptionAr:
      "ابتُكر احتفالاً بالذكرى الـ 250 لدار باكارات للكريستال. يركز إكستري دي بارفان إشراقة الياسمين المصري واللوز المر ونفحات العنبر الأشهب.",
    concentration: "Extrait de Parfum",
    perfumer: "Francis Kurkdjian",
    perfumerBio: "Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",
    origin: "Paris, France",
    gender: "Unisex",
    longevity: "18-24 Hours",
    sillage: "Luminous & Intoxicating",
    ratingAverage: 4.98,
    ratingCount: 318,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    ],
    variants: [
      { id: "v4", sku: "MFK-BR540E-200", volumeMl: 200, labelEn: "200ml Extrait", labelAr: "200 مل إكستري", price: 3450, compareAt: 3800, inStock: true, stockCount: 6 },
      { id: "v5", sku: "MFK-BR540E-70", volumeMl: 70, labelEn: "70ml Extrait", labelAr: "70 مل إكستري", price: 1650, compareAt: null, inStock: true, stockCount: 19 },
      { id: "v6", sku: "MFK-BR540E-2ML", volumeMl: 2, labelEn: "2ml Sample", labelAr: "عينة 2 مل", price: 60, compareAt: null, inStock: true, stockCount: 60 },
    ],
    notes: [
      { id: "n7", name: "Kashmiri Saffron", slug: "kashmiri-saffron", position: "TOP" as const },
      { id: "n8", name: "Florentine Iris", slug: "florentine-iris", position: "HEART" as const },
      { id: "n9", name: "Golden Ambergris", slug: "golden-ambergris", position: "BASE" as const },
      { id: "n10", name: "Bourbon Vanilla", slug: "bourbon-vanilla", position: "BASE" as const },
    ],
    accords: [
      { nameEn: "Golden Amber", nameAr: "عنبر ذهبي", score: 96, color: "from-gold to-amber-500" },
      { nameEn: "Almond & Saffron", nameAr: "لوز وزعفران", score: 94, color: "from-rose-400 to-amber-500" },
      { nameEn: "Airy Sweetness", nameAr: "حلاوة بلورية", score: 90, color: "from-pink-400 to-gold" },
    ],
    reviews: [
      {
        id: "r3",
        author: "Sarah M.",
        rating: 5,
        title: "Pure Liquid Gold",
        body: "The almond note gives the Extrait an aristocratic density that elevates it far above the EDP. Absolutely addictive.",
        verified: true,
        date: "September 2026",
      },
    ],
  },
  "roja-parfums-elysium-pour-homme-parfum": {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    taglineEn: "A hero's journey into an ethereal paradise of citrus and ambergris.",
    taglineAr: "رحلة أسطورية نحو فردوس عطري يفيض بنقاء الحمضيات والعنبر النادر.",
    descriptionEn:
      "A legend of modern British haute perfumery. Elysium opens with an intoxicating burst of sun-drenched Calabrian bergamot and grapefruit, anchored by a rare heart of pink pepper, juniper berry, and pure ambergris that radiates commanding majesty in warm GCC climates.",
    descriptionAr:
      "أيقونة العطور البريطانية الراقية. يفتتح بنفحات منعشة ساحرة من البرغموت الكالابري والجريب فروت، ترتكز على قلب من الفلفل الوردي والتوت البري والعنبر الأشهب النقي لثبات وفخامة لا تضاهى في طقس الخليج.",
    concentration: "Parfum Pour Homme",
    perfumer: "Roja Dove",
    perfumerBio: "The premier British Master Perfumer and fragrance historian, famed for formulating without compromise on rare natural absolutes.",
    origin: "London, United Kingdom",
    gender: "Men",
    longevity: "16-20 Hours",
    sillage: "Crisp & Commanding",
    ratingAverage: 4.93,
    ratingCount: 198,
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
    ],
    variants: [
      { id: "v7", sku: "ROJA-ELY-100", volumeMl: 100, labelEn: "100ml Pure Parfum", labelAr: "100 مل بارفان نقي", price: 1950, compareAt: 2200, inStock: true, stockCount: 11 },
      { id: "v8", sku: "ROJA-ELY-50", volumeMl: 50, labelEn: "50ml Pure Parfum", labelAr: "50 مل بارفان نقي", price: 1250, compareAt: null, inStock: true, stockCount: 15 },
      { id: "v9", sku: "ROJA-ELY-2ML", volumeMl: 2, labelEn: "2ml Official Sample", labelAr: "عينة 2 مل رسمية", price: 70, compareAt: null, inStock: true, stockCount: 40 },
    ],
    notes: [
      { id: "n11", name: "Calabrian Bergamot", slug: "calabrian-bergamot", position: "TOP" as const },
      { id: "n12", name: "Pink Pepper", slug: "pink-pepper", position: "TOP" as const },
      { id: "n13", name: "Juniper Berry", slug: "juniper-berry", position: "HEART" as const },
      { id: "n14", name: "Golden Ambergris", slug: "golden-ambergris", position: "BASE" as const },
      { id: "n15", name: "Tuscan Leather", slug: "tuscan-leather", position: "BASE" as const },
    ],
    accords: [
      { nameEn: "Crisp Citrus & Bergamot", nameAr: "حمضيات منعشة وبرغموت", score: 98, color: "from-yellow-400 to-amber-500" },
      { nameEn: "Aromatic Woods", nameAr: "أخشاب عطرية", score: 91, color: "from-amber-600 to-emerald-700" },
      { nameEn: "Luminous Ambergris", nameAr: "عنبر أشهب نقي", score: 86, color: "from-gold to-amber-500" },
    ],
    reviews: [
      {
        id: "r4",
        author: "Tariq Al-Hashemi",
        rating: 5,
        title: "The Ultimate Summer Signature",
        body: "The pure parfum concentration handles Dubai summer heat effortlessly. Fresh yet deeply aristocratic.",
        verified: true,
        date: "October 2026",
      },
    ],
  },
  "xerjoff-alexandria-ii": {
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    taglineEn: "The imperial grandeur of ancient Alexandria distilled in rare aged oud.",
    taglineAr: "عظمة الإسكندرية الإمبراطورية التاريخية مقطرة في دهن العود المعتق النادر.",
    descriptionEn:
      "Inspired by the capital of ancient knowledge, Alexandria II opens with apple, lavender, and cinnamon, giving way to Bulgarian rose, cedar, and an intoxicating base of aged Laos agarwood and powdery amber.",
    descriptionAr:
      "مستوحى من عاصمة المعرفة الإسكندرية. يبدأ بنفحات التفاح والخزامى والقرفة، ثم يكشف عن الورد البلغاري والأرز، وقاعدة آسرة من دهن عود لاوس المعتق والعنبر الملكي البودري.",
    concentration: "Eau de Parfum",
    perfumer: "Chris Maurice",
    perfumerBio: "Renowned Spanish nose celebrated for bridging classical Mediterranean perfumery with opulent Middle Eastern accords.",
    origin: "Turin, Italy",
    gender: "Unisex",
    longevity: "20+ Hours",
    sillage: "Monumental Sillage",
    ratingAverage: 4.97,
    ratingCount: 264,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
    ],
    variants: [
      { id: "v10", sku: "XER-ALX2-100", volumeMl: 100, labelEn: "100ml Extrait", labelAr: "100 مل إكستري", price: 2200, compareAt: 2450, inStock: true, stockCount: 9 },
      { id: "v11", sku: "XER-ALX2-50", volumeMl: 50, labelEn: "50ml Extrait", labelAr: "50 مل إكستري", price: 1450, compareAt: null, inStock: true, stockCount: 14 },
      { id: "v12", sku: "XER-ALX2-2ML", volumeMl: 2, labelEn: "2ml Sample", labelAr: "عينة 2 مل", price: 75, compareAt: null, inStock: true, stockCount: 35 },
    ],
    notes: [
      { id: "n16", name: "Royal Taif Rose", slug: "taif-rose", position: "HEART" as const },
      { id: "n17", name: "Florentine Iris", slug: "florentine-iris", position: "HEART" as const },
      { id: "n18", name: "Cambodian Oud", slug: "cambodian-oud", position: "BASE" as const },
      { id: "n19", name: "Bourbon Vanilla", slug: "bourbon-vanilla", position: "BASE" as const },
    ],
    accords: [
      { nameEn: "Aged Oud & Woods", nameAr: "عود معتق وأخشاب", score: 97, color: "from-amber-900 to-amber-700" },
      { nameEn: "Powdery Lavender & Rose", nameAr: "لافندر وورد بودري", score: 92, color: "from-purple-500 to-pink-500" },
      { nameEn: "Warm Resins", nameAr: "صمغيات دافئة", score: 89, color: "from-gold to-amber-600" },
    ],
    reviews: [
      {
        id: "r5",
        author: "Faisal Al-Otaibi",
        rating: 5,
        title: "Regal Elegance in a Bottle",
        body: "The Laos oud in Alexandria II is so refined and creamy. It turns heads everywhere across Riyadh.",
        verified: true,
        date: "September 2026",
      },
    ],
  },
  "tom-ford-tobacco-vanille": {
    slug: "tom-ford-tobacco-vanille",
    nameEn: "Tobacco Vanille Eau de Parfum",
    nameAr: "توباكو فانيلا أو دي بارفان",
    brand: "Tom Ford",
    taglineEn: "Opulent, warm, and iconic private blend scent.",
    taglineAr: "عطر كلاسيكي دافئ ومهيب من مجموعة توم فورد الخاصة.",
    descriptionEn:
      "Tom Ford’s affection for London inspired this scent, reminiscent of an English gentleman’s club, redolent with spice. He reinvents a classic fragrance genre by adding creamy tonka bean, vanilla, cocoa, dry fruit accords, and sweet wood sap.",
    descriptionAr:
      "عطر مستوحى من أندية النخبة اللندنية العريقة. يعيد ابتكار العطور الكلاسيكية بمزيج فاخر من التبغ الغني وحبوب التونكا الكريمية والفانيليا والكاكاو وخلاصات الفواكه المجففة.",
    concentration: "Eau de Parfum (Private Blend)",
    perfumer: "Olivier Gillotin",
    perfumerBio: "Master Givaudan Perfumer celebrated for rich gourmand architectures and warm spicy accords.",
    origin: "United States",
    gender: "Unisex",
    longevity: "18-22 Hours",
    sillage: "Warm & Enveloping",
    ratingAverage: 4.91,
    ratingCount: 310,
    images: [
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
    ],
    variants: [
      { id: "v13", sku: "TF-TOBVAN-100", volumeMl: 100, labelEn: "100ml Private Blend", labelAr: "100 مل برايفيت بليند", price: 1720, compareAt: 1950, inStock: true, stockCount: 16 },
      { id: "v14", sku: "TF-TOBVAN-50", volumeMl: 50, labelEn: "50ml Private Blend", labelAr: "50 مل برايفيت بليند", price: 1150, compareAt: null, inStock: true, stockCount: 22 },
      { id: "v15", sku: "TF-TOBVAN-2ML", volumeMl: 2, labelEn: "2ml Sample", labelAr: "عينة 2 مل", price: 60, compareAt: null, inStock: true, stockCount: 50 },
    ],
    notes: [
      { id: "n20", name: "Tobacco Leaf", slug: "tobacco-leaf", position: "TOP" as const },
      { id: "n21", name: "Tonka Bean", slug: "tonka-bean", position: "HEART" as const },
      { id: "n22", name: "Bourbon Vanilla", slug: "bourbon-vanilla", position: "BASE" as const },
    ],
    accords: [
      { nameEn: "Warm Tobacco", nameAr: "تبغ دافئ", score: 97, color: "from-amber-800 to-amber-950" },
      { nameEn: "Sweet Vanilla & Tonka", nameAr: "فانيليا حلوة وتونكا", score: 94, color: "from-amber-400 to-amber-600" },
      { nameEn: "Warm Spices", nameAr: "توابل شرقية", score: 89, color: "from-rose-500 to-amber-700" },
    ],
    reviews: [
      {
        id: "r6",
        author: "Mansoor Al-Falasi",
        rating: 5,
        title: "Timeless Winter Masterpiece",
        body: "The projection in air-conditioned environments is phenomenal. The dry-down of vanilla and cocoa is legendary.",
        verified: true,
        date: "September 2026",
      },
    ],
  },
};

export default function ProductDetailPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const product = PRODUCT_VAULT[slug] || PRODUCT_VAULT["amouage-interlude-53-man"];

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [added, setAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverAccord, setHoverAccord] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setAdded(true);
    await addItem({
      variantId: selectedVariant.id,
      slug: product.slug,
      title: product.nameEn,
      titleAr: product.nameAr,
      brand: product.brand,
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAt,
      quantity: 1,
      image: selectedImage,
      sizeLabel: isAr ? selectedVariant.labelAr : selectedVariant.labelEn,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await addItem({
      variantId: selectedVariant.id,
      slug: product.slug,
      title: product.nameEn,
      titleAr: product.nameAr,
      brand: product.brand,
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAt,
      quantity: 1,
      image: selectedImage,
      sizeLabel: isAr ? selectedVariant.labelAr : selectedVariant.labelEn,
    });
    router.push("/checkout");
  };

  const handleNoteNavigate = (noteSlug: string) => {
    router.push(`/notes/${noteSlug}`);
  };

  // Structured Data JSON-LD
  const productJsonLd = generateProductJsonLd(
    {
      name: isAr ? product.nameAr : product.nameEn,
      description: isAr ? product.descriptionAr : product.descriptionEn,
      slug: product.slug,
      brand: product.brand,
      images: product.images,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      currency: "AED",
      ratingValue: product.ratingAverage,
      reviewCount: product.ratingCount,
      concentration: product.concentration,
      countryOfOrigin: product.origin,
      inStock: selectedVariant.inStock,
    },
    locale
  );

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: isAr ? "الرئيسية" : "Home", url: `/${locale}` },
    { name: isAr ? "المتجر" : "Shop", url: `/${locale}/shop` },
    { name: product.brand, url: `/${locale}/shop?brand=${encodeURIComponent(product.brand)}` },
    { name: isAr ? product.nameAr : product.nameEn, url: `/${locale}/product/${product.slug}` },
  ]);

  const faqJsonLd = generateFaqJsonLd(locale);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      {/* Background ambient halos */}
      <div className="ambient-glow-gold top-10 start-10" />
      <div className="ambient-glow-crimson top-[700px] end-10" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. HERO PRODUCT SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Frosted Glass Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl group">
            <Image
              src={selectedImage}
              alt={isAr ? product.nameAr : product.nameEn}
              fill
              priority
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-5 start-5 flex flex-col gap-2">
              <span className="px-3.5 py-1 rounded-full glass-pill text-xs font-sans font-bold tracking-wider text-gold border border-gold/40 shadow-sm">
                ✦ {product.brand}
              </span>
              <span className="px-3 py-1 rounded-full glass-panel-subtle text-[11px] font-mono text-white">
                {product.concentration}
              </span>
            </div>

            {/* Origin & Batch Verification Pill */}
            <div className="absolute bottom-5 start-5 end-5 flex items-center justify-between glass-pill px-4 py-2 text-xs font-sans text-white/90">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-gold" />
                <span>{isAr ? "دفعة أصلية معتمدة" : `Certified Batch • ${product.origin}`}</span>
              </span>
              <span className="font-mono text-[10px] text-gold">{selectedVariant.sku}</span>
            </div>
          </div>

          {/* Thumbnails row */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-2xl overflow-hidden glass-panel border transition-all ${
                  selectedImage === img
                    ? "border-gold ring-2 ring-gold/50 scale-105 shadow-md"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details & Purchasing Engine */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold font-semibold">
                {product.brand} • {product.origin}
              </span>
              <div className="flex items-center gap-1 text-gold text-xs font-bold font-mono">
                <Star size={13} fill="currentColor" />
                <span>{product.ratingAverage}</span>
                <span className="text-zinc-400 font-sans">({product.ratingCount})</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-white font-light leading-tight">
              {isAr ? product.nameAr : product.nameEn}
            </h1>

            <p className="text-xs sm:text-sm font-serif italic text-gold">
              &quot;{isAr ? product.taglineAr : product.taglineEn}&quot;
            </p>
          </div>

          {/* Live Price & Installment Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-gold/30 shadow-lg">
            <div className="flex items-baseline justify-between">
              <PriceDisplay
                price={selectedVariant.price}
                compareAtPrice={selectedVariant.compareAt}
                locale={locale}
                className="text-2xl sm:text-3xl"
              />
              <span className="text-[11px] font-sans text-emerald-500 font-semibold flex items-center gap-1">
                <Check size={13} />
                {isAr ? `متوفر (${selectedVariant.stockCount} قطعة)` : `In Stock (${selectedVariant.stockCount} units)`}
              </span>
            </div>
            <InstallmentBadge price={selectedVariant.price} locale={locale} />
          </div>

          {/* Interactive Volume Variant Picker */}
          <div className="space-y-3">
            <label className="text-xs font-sans uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-semibold block">
              {isAr ? "اختر الحجم والتركيز:" : "Select Flacon Size:"}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {product.variants.map((v: any) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-gold bg-gold/20 text-zinc-950 dark:text-white ring-1 ring-gold shadow-md font-semibold"
                        : "glass-pill text-zinc-700 dark:text-zinc-300 hover:border-gold/40"
                    }`}
                  >
                    <div className="text-xs font-sans">{isAr ? v.labelAr : v.labelEn}</div>
                    <div className="text-xs font-mono font-bold mt-1 text-gold">{v.price} AED</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAddToCart}
              size="lg"
              variant={added ? "outline" : "gold"}
              className={`w-full py-4 rounded-xl text-sm font-sans tracking-widest uppercase transition-all shadow-lg ${
                added ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "hover:scale-[1.02]"
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={18} />
                  {isAr ? "تمت الإضافة إلى الحقيبة بنجاح" : "Added to Fragrance Vault"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Droplets size={18} />
                  {isAr ? "إضافة إلى الحقيبة الملكية" : "Add to Shopping Bag"}
                </span>
              )}
            </Button>

            <Button
              onClick={handleBuyNow}
              size="lg"
              variant="outline"
              className="w-full glass-pill py-3.5 text-sm uppercase tracking-wider hover:border-gold"
            >
              {isAr ? "الشراء الفوري السريع" : "VIP Instant Express Checkout"}
            </Button>
          </div>

          {/* Luxury Promise Pills */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-sans text-zinc-600 dark:text-zinc-300">
            <div className="glass-panel-subtle p-3 rounded-xl flex items-center gap-2.5">
              <Truck size={18} className="text-gold flex-shrink-0" />
              <span>{isAr ? "شحن مجاني فوري لنفس اليوم" : "VIP Same-Day Dubai Delivery"}</span>
            </div>
            <div className="glass-panel-subtle p-3 rounded-xl flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-gold flex-shrink-0" />
              <span>{isAr ? "ضمان الأصالة 100%" : "100% Guaranteed Authentic"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OLFACTORY ARCHITECTURE & ACCORDS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Interactive Scent Pyramid */}
        <div className="lg:col-span-7">
          <ScentPyramid
            notes={product.notes}
            locale={locale}
            onNoteClick={handleNoteNavigate}
          />
        </div>

        {/* Interactive Olfactory Accords Visualizer */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/15 shadow-xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-serif text-xl text-zinc-950 dark:text-white uppercase">
              {isAr ? "الهارموني والتناغم العطري" : "Olfactory Accord Dominance"}
            </h3>
            <p className="text-[11px] font-sans text-zinc-400 mt-0.5">
              {isAr ? "مدرج التناغم والتركيز الحقيقي للخلاصات" : "Macerated chord resonance and prominence"}
            </p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            {product.accords.map((accord: any, idx: number) => {
              const isHovered = hoverAccord === accord.nameEn;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoverAccord(accord.nameEn)}
                  onMouseLeave={() => setHoverAccord(null)}
                  className={`space-y-1.5 cursor-pointer p-1.5 rounded-lg transition-all ${
                    isHovered ? "bg-white/10 dark:bg-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium transition-colors ${isHovered ? "text-gold font-bold" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {isAr ? accord.nameAr : accord.nameEn}
                    </span>
                    <span className="font-mono font-bold text-gold">{accord.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${accord.color} transition-all duration-700 rounded-full`}
                      style={{ width: `${accord.score}%` }}
                    />
                  </div>
                </div>
              );
            })}

          </div>

          {/* Sillage & Longevity Visual Meter */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1">
              <Clock size={16} className="mx-auto text-gold" />
              <div className="text-[10px] text-zinc-400 uppercase font-sans">
                {isAr ? "الثبات على البشرة" : "Longevity"}
              </div>
              <div className="text-xs font-serif font-bold text-zinc-950 dark:text-white">
                {product.longevity}
              </div>
            </div>
            <div className="p-3.5 rounded-xl glass-panel-subtle space-y-1">
              <Wind size={16} className="mx-auto text-gold" />
              <div className="text-[10px] text-zinc-400 uppercase font-sans">
                {isAr ? "الفوحان والانتشار" : "Sillage"}
              </div>
              <div className="text-xs font-serif font-bold text-zinc-950 dark:text-white">
                {product.sillage}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MASTER NOSE PROFILE CARD */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gold/30 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-gold/15 text-gold flex items-center justify-center font-serif text-3xl flex-shrink-0 border border-gold/40 shadow-inner">
          ✦
        </div>
        <div className="space-y-2 flex-1 text-center md:text-start">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-gold font-bold">
            {isAr ? "توقيع العطار المبتكر" : "Master Perfumer Formula"}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 dark:text-white font-light">
            {product.perfumer}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
            {product.perfumerBio}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="glass-pill">
          <span className="text-xs">{isAr ? "استكشف إبداعات العطار" : "View Noses Vault"}</span>
        </Button>
      </div>

      {/* 4. VERIFIED VIP CLIENT REVIEWS */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-8 border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-zinc-950 dark:text-white font-light">
              {isAr ? "تقييمات وتجارب العملاء المعتمدة" : "Verified Client Impressions"}
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-gold">
              <span>{product.ratingAverage} / 5.0</span>
              <span>•</span>
              <span>{product.ratingCount} {isAr ? "تقييم موثق" : "Verified Reviews"}</span>
            </div>
          </div>
          <Button
            onClick={() => setReviewModalOpen(true)}
            variant="gold"
            size="sm"
            className="flex items-center gap-2"
          >
            <MessageSquare size={15} />
            <span>{isAr ? "كتابة تقييم عطري" : "Write Extrait Impression"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.reviews.map((r: any) => (
            <div key={r.id} className="p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">{r.date}</span>
              </div>
              <h4 className="font-serif text-base text-zinc-950 dark:text-white font-medium">
                {r.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
                {r.body}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-medium text-zinc-300">{r.author}</span>
                {r.verified && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Check size={12} />
                    {isAr ? "مشتري معتمد" : "Verified Client"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. STICKY FLOATING GLASS PURCHASE BAR */}
      {showStickyBar && (
        <div className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto glass-panel p-4 rounded-2xl border border-gold/40 shadow-2xl z-40 animate-slide-up flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-zinc-900 flex-shrink-0 border border-white/10">
              <Image src={product.images[0]} alt="Thumbnail" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="font-serif text-sm text-zinc-950 dark:text-white truncate">
                {isAr ? product.nameAr : product.nameEn}
              </h4>
              <span className="text-xs font-mono font-bold text-gold">
                {selectedVariant.price} AED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="gold"
              className="whitespace-nowrap flex items-center gap-1.5"
            >
              <Droplets size={14} />
              <span>{isAr ? "أضف للحقيبة" : "Add to Bag"}</span>
            </Button>
            <Button
              onClick={handleBuyNow}
              size="sm"
              variant="outline"
              className="whitespace-nowrap hidden sm:inline-flex"
            >
              {isAr ? "شراء فوري" : "Checkout"}
            </Button>
          </div>
        </div>
      )}

      {/* 6. INTERACTIVE REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setReviewModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
          />
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 border border-white/20 z-10 animate-slide-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl text-zinc-950 dark:text-white">
                {isAr ? "شاركنا انطباعك العطري" : "Share Your Olfactory Impression"}
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="text-zinc-400 block mb-1.5">{isAr ? "تقييمك الإجمالي:" : "Your Rating:"}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-2 rounded-lg ${newRating >= star ? "text-gold" : "text-zinc-600"}`}
                    >
                      <Star size={20} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5">{isAr ? "عنوان التقييم:" : "Review Title:"}</label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: تجربة ملكية مع ثبات 24 ساعة" : "e.g., Aristocratic Sillage with 24h Longevity"}
                  className="w-full h-11 px-3 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5">{isAr ? "انطباعك عن الفوحان والتطور العطري:" : "Your Scent Review:"}</label>
                <textarea
                  rows={4}
                  placeholder={isAr ? "صف شعورك، الفوحان، وتطور النوتات على بشرتك..." : "Describe how the top, heart, and base notes unfolded on your skin..."}
                  className="w-full p-3 rounded-xl glass-input text-xs"
                />
              </div>

              <Button
                onClick={() => {
                  setReviewModalOpen(false);
                  alert(isAr ? "شكراً لمشاركتك انطباعك العطري!" : "Thank you for submitting your luxury review!");
                }}
                variant="gold"
                size="md"
                className="w-full"
              >
                {isAr ? "إرسال التقييم المعتمد" : "Submit Verified Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
