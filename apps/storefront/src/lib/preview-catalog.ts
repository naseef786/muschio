import type { StorefrontProduct } from "@muschio/types";

export const PREVIEW_CATALOG: Record<string, any> = {
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
    perfumerBio:
      "Master French perfumer renowned for sculpting deep, architectural incense and resinous extraits for royalty.",
    origin: "Sultanate of Oman",
    gender: "Men / Unisex",
    longevity: "24+ Hours (Monolithic)",
    sillage: "Royal Projection (6+ Feet)",
    ratingAverage: 4.95,
    ratingCount: 142,
    images: [
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793203985/muschio/products/amouage-interlude-53-man-primary.jpg",
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793203986/muschio/products/amouage-interlude-53-man-lifestyle.jpg",
    ],
    variants: [
      {
        id: "v1",
        sku: "AMO-INT53-100",
        volumeMl: 100,
        labelEn: "100ml Extrait",
        labelAr: "100 مل إكستري",
        price: 1850,
        compareAt: 2100,
        inStock: true,
        stockCount: 14,
      },
      {
        id: "v2",
        sku: "AMO-INT53-50",
        volumeMl: 50,
        labelEn: "50ml Extrait",
        labelAr: "50 مل إكستري",
        price: 1190,
        compareAt: null,
        inStock: true,
        stockCount: 8,
      },
      {
        id: "v3",
        sku: "AMO-INT53-2ML",
        volumeMl: 2,
        labelEn: "2ml Official Sample",
        labelAr: "عينة 2 مل رسمية",
        price: 65,
        compareAt: null,
        inStock: true,
        stockCount: 45,
      },
    ],
    notes: [
      {
        id: "n1",
        name: "Calabrian Bergamot",
        slug: "calabrian-bergamot",
        position: "TOP" as const,
      },
      {
        id: "n2",
        name: "Guatemalan Cardamom",
        slug: "guatemalan-cardamom",
        position: "TOP" as const,
      },
      {
        id: "n3",
        name: "Silver Frankincense",
        slug: "silver-frankincense",
        position: "HEART" as const,
      },
      {
        id: "n4",
        name: "Golden Ambergris",
        slug: "golden-ambergris",
        position: "HEART" as const,
      },
      {
        id: "n5",
        name: "Cambodian Oud",
        slug: "cambodian-oud",
        position: "BASE" as const,
      },
      {
        id: "n6",
        name: "Tuscan Leather",
        slug: "tuscan-leather",
        position: "BASE" as const,
      },
    ],
    accords: [
      {
        nameEn: "Smoky & Resinous",
        nameAr: "دخاني وصمغي",
        score: 98,
        color: "from-amber-500 to-amber-700",
      },
      {
        nameEn: "Warm Balsamic",
        nameAr: "بلسمي دافئ",
        score: 92,
        color: "from-yellow-500 to-amber-600",
      },
      {
        nameEn: "Golden Amber",
        nameAr: "عنبر ذهبي",
        score: 88,
        color: "from-gold to-amber-500",
      },
      {
        nameEn: "Precious Oud",
        nameAr: "عود نادر",
        score: 85,
        color: "from-amber-800 to-stone-900",
      },
      {
        nameEn: "Aromatic Spice",
        nameAr: "توابل عطرية",
        score: 78,
        color: "from-rose-500 to-amber-600",
      },
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
    perfumerBio:
      "Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",
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
      {
        id: "v4",
        sku: "MFK-BR540E-200",
        volumeMl: 200,
        labelEn: "200ml Extrait",
        labelAr: "200 مل إكستري",
        price: 3450,
        compareAt: 3800,
        inStock: true,
        stockCount: 6,
      },
      {
        id: "v5",
        sku: "MFK-BR540E-70",
        volumeMl: 70,
        labelEn: "70ml Extrait",
        labelAr: "70 مل إكستري",
        price: 1650,
        compareAt: null,
        inStock: true,
        stockCount: 19,
      },
      {
        id: "v6",
        sku: "MFK-BR540E-2ML",
        volumeMl: 2,
        labelEn: "2ml Sample",
        labelAr: "عينة 2 مل",
        price: 60,
        compareAt: null,
        inStock: true,
        stockCount: 60,
      },
    ],
    notes: [
      {
        id: "n7",
        name: "Kashmiri Saffron",
        slug: "kashmiri-saffron",
        position: "TOP" as const,
      },
      {
        id: "n8",
        name: "Florentine Iris",
        slug: "florentine-iris",
        position: "HEART" as const,
      },
      {
        id: "n9",
        name: "Golden Ambergris",
        slug: "golden-ambergris",
        position: "BASE" as const,
      },
      {
        id: "n10",
        name: "Bourbon Vanilla",
        slug: "bourbon-vanilla",
        position: "BASE" as const,
      },
    ],
    accords: [
      {
        nameEn: "Golden Amber",
        nameAr: "عنبر ذهبي",
        score: 96,
        color: "from-gold to-amber-500",
      },
      {
        nameEn: "Almond & Saffron",
        nameAr: "لوز وزعفران",
        score: 94,
        color: "from-rose-400 to-amber-500",
      },
      {
        nameEn: "Airy Sweetness",
        nameAr: "حلاوة بلورية",
        score: 90,
        color: "from-pink-400 to-gold",
      },
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
    taglineEn:
      "A hero's journey into an ethereal paradise of citrus and ambergris.",
    taglineAr:
      "رحلة أسطورية نحو فردوس عطري يفيض بنقاء الحمضيات والعنبر النادر.",
    descriptionEn:
      "A legend of modern British haute perfumery. Elysium opens with an intoxicating burst of sun-drenched Calabrian bergamot and grapefruit, anchored by a rare heart of pink pepper, juniper berry, and pure ambergris that radiates commanding majesty in warm GCC climates.",
    descriptionAr:
      "أيقونة العطور البريطانية الراقية. يفتتح بنفحات منعشة ساحرة من البرغموت الكالابري والجريب فروت، ترتكز على قلب من الفلفل الوردي والتوت البري والعنبر الأشهب النقي لثبات وفخامة لا تضاهى في طقس الخليج.",
    concentration: "Parfum Pour Homme",
    perfumer: "Roja Dove",
    perfumerBio:
      "The premier British Master Perfumer and fragrance historian, famed for formulating without compromise on rare natural absolutes.",
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
      {
        id: "v7",
        sku: "ROJA-ELY-100",
        volumeMl: 100,
        labelEn: "100ml Pure Parfum",
        labelAr: "100 مل بارفان نقي",
        price: 1950,
        compareAt: 2200,
        inStock: true,
        stockCount: 11,
      },
      {
        id: "v8",
        sku: "ROJA-ELY-50",
        volumeMl: 50,
        labelEn: "50ml Pure Parfum",
        labelAr: "50 مل بارفان نقي",
        price: 1250,
        compareAt: null,
        inStock: true,
        stockCount: 15,
      },
      {
        id: "v9",
        sku: "ROJA-ELY-2ML",
        volumeMl: 2,
        labelEn: "2ml Official Sample",
        labelAr: "عينة 2 مل رسمية",
        price: 70,
        compareAt: null,
        inStock: true,
        stockCount: 40,
      },
    ],
    notes: [
      {
        id: "n11",
        name: "Calabrian Bergamot",
        slug: "calabrian-bergamot",
        position: "TOP" as const,
      },
      {
        id: "n12",
        name: "Pink Pepper",
        slug: "pink-pepper",
        position: "TOP" as const,
      },
      {
        id: "n13",
        name: "Juniper Berry",
        slug: "juniper-berry",
        position: "HEART" as const,
      },
      {
        id: "n14",
        name: "Golden Ambergris",
        slug: "golden-ambergris",
        position: "BASE" as const,
      },
      {
        id: "n15",
        name: "Tuscan Leather",
        slug: "tuscan-leather",
        position: "BASE" as const,
      },
    ],
    accords: [
      {
        nameEn: "Crisp Citrus & Bergamot",
        nameAr: "حمضيات منعشة وبرغموت",
        score: 98,
        color: "from-yellow-400 to-amber-500",
      },
      {
        nameEn: "Aromatic Woods",
        nameAr: "أخشاب عطرية",
        score: 91,
        color: "from-amber-600 to-emerald-700",
      },
      {
        nameEn: "Luminous Ambergris",
        nameAr: "عنبر أشهب نقي",
        score: 86,
        color: "from-gold to-amber-500",
      },
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
    taglineEn:
      "The imperial grandeur of ancient Alexandria distilled in rare aged oud.",
    taglineAr:
      "عظمة الإسكندرية الإمبراطورية التاريخية مقطرة في دهن العود المعتق النادر.",
    descriptionEn:
      "Inspired by the capital of ancient knowledge, Alexandria II opens with apple, lavender, and cinnamon, giving way to Bulgarian rose, cedar, and an intoxicating base of aged Laos agarwood and powdery amber.",
    descriptionAr:
      "مستوحى من عاصمة المعرفة الإسكندرية. يبدأ بنفحات التفاح والخزامى والقرفة، ثم يكشف عن الورد البلغاري والأرز، وقاعدة آسرة من دهن عود لاوس المعتق والعنبر الملكي البودري.",
    concentration: "Eau de Parfum",
    perfumer: "Chris Maurice",
    perfumerBio:
      "Renowned Spanish nose celebrated for bridging classical Mediterranean perfumery with opulent Middle Eastern accords.",
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
      {
        id: "v10",
        sku: "XER-ALX2-100",
        volumeMl: 100,
        labelEn: "100ml Extrait",
        labelAr: "100 مل إكستري",
        price: 2200,
        compareAt: 2450,
        inStock: true,
        stockCount: 9,
      },
      {
        id: "v11",
        sku: "XER-ALX2-50",
        volumeMl: 50,
        labelEn: "50ml Extrait",
        labelAr: "50 مل إكستري",
        price: 1450,
        compareAt: null,
        inStock: true,
        stockCount: 14,
      },
      {
        id: "v12",
        sku: "XER-ALX2-2ML",
        volumeMl: 2,
        labelEn: "2ml Sample",
        labelAr: "عينة 2 مل",
        price: 75,
        compareAt: null,
        inStock: true,
        stockCount: 35,
      },
    ],
    notes: [
      {
        id: "n16",
        name: "Royal Taif Rose",
        slug: "taif-rose",
        position: "HEART" as const,
      },
      {
        id: "n17",
        name: "Florentine Iris",
        slug: "florentine-iris",
        position: "HEART" as const,
      },
      {
        id: "n18",
        name: "Cambodian Oud",
        slug: "cambodian-oud",
        position: "BASE" as const,
      },
      {
        id: "n19",
        name: "Bourbon Vanilla",
        slug: "bourbon-vanilla",
        position: "BASE" as const,
      },
    ],
    accords: [
      {
        nameEn: "Aged Oud & Woods",
        nameAr: "عود معتق وأخشاب",
        score: 97,
        color: "from-amber-900 to-amber-700",
      },
      {
        nameEn: "Powdery Lavender & Rose",
        nameAr: "لافندر وورد بودري",
        score: 92,
        color: "from-purple-500 to-pink-500",
      },
      {
        nameEn: "Warm Resins",
        nameAr: "صمغيات دافئة",
        score: 89,
        color: "from-gold to-amber-600",
      },
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
    perfumerBio:
      "Master Givaudan Perfumer celebrated for rich gourmand architectures and warm spicy accords.",
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
      {
        id: "v13",
        sku: "TF-TOBVAN-100",
        volumeMl: 100,
        labelEn: "100ml Private Blend",
        labelAr: "100 مل برايفيت بليند",
        price: 1720,
        compareAt: 1950,
        inStock: true,
        stockCount: 16,
      },
      {
        id: "v14",
        sku: "TF-TOBVAN-50",
        volumeMl: 50,
        labelEn: "50ml Private Blend",
        labelAr: "50 مل برايفيت بليند",
        price: 1150,
        compareAt: null,
        inStock: true,
        stockCount: 22,
      },
      {
        id: "v15",
        sku: "TF-TOBVAN-2ML",
        volumeMl: 2,
        labelEn: "2ml Sample",
        labelAr: "عينة 2 مل",
        price: 60,
        compareAt: null,
        inStock: true,
        stockCount: 50,
      },
    ],
    notes: [
      {
        id: "n20",
        name: "Tobacco Leaf",
        slug: "tobacco-leaf",
        position: "TOP" as const,
      },
      {
        id: "n21",
        name: "Tonka Bean",
        slug: "tonka-bean",
        position: "HEART" as const,
      },
      {
        id: "n22",
        name: "Bourbon Vanilla",
        slug: "bourbon-vanilla",
        position: "BASE" as const,
      },
    ],
    accords: [
      {
        nameEn: "Warm Tobacco",
        nameAr: "تبغ دافئ",
        score: 97,
        color: "from-amber-800 to-amber-950",
      },
      {
        nameEn: "Sweet Vanilla & Tonka",
        nameAr: "فانيليا حلوة وتونكا",
        score: 94,
        color: "from-amber-400 to-amber-600",
      },
      {
        nameEn: "Warm Spices",
        nameAr: "توابل شرقية",
        score: 89,
        color: "from-rose-500 to-amber-700",
      },
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

function toStorefrontProduct(item: any): StorefrontProduct {
  const brandName = typeof item.brand === "string" ? item.brand : item.brand?.name || "Muschio Maison";
  const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const brandType = brandName === "Tom Ford" ? "DESIGNER" : "NICHE";

  const variants = (item.variants || []).map((v: any, idx: number) => {
    const vol = v.volume || (v.volumeMl ? `${v.volumeMl}ml` : v.labelEn ? v.labelEn.split(" ")[0] : "100ml");
    const stock = v.stockCount ?? v.stockQuantity ?? v.availableQuantity ?? 25;
    const baseCompare = v.compareAt || v.compareAtPrice || null;
    const basePrice = v.price || 0;
    const regPrice = Number(v.regularPrice ?? v.originalPrice ?? (baseCompare && baseCompare > basePrice ? baseCompare : basePrice));
    const rawDisc = v.discountPrice !== null && v.discountPrice !== undefined
      ? Number(v.discountPrice)
      : (v.salePrice ? Number(v.salePrice) : (baseCompare && baseCompare > basePrice ? basePrice : null));
    const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regPrice;
    const sellingPrice = hasDisc ? rawDisc! : regPrice;
    const compareAt = hasDisc ? regPrice : null;

    return {
      id: v.id || `var-${item.slug}-${idx}`,
      sku: v.sku || `SKU-${item.slug}-${idx}`,
      volume: vol,
      volumeMl: v.volumeMl || parseInt(vol.replace(/[^0-9]/g, "") || "100", 10),
      sizeLabelEn: v.labelEn || v.sizeLabelEn || `${vol} Flacon`,
      sizeLabelAr: v.labelAr || v.sizeLabelAr || `${vol} مل`,
      regularPrice: regPrice,
      originalPrice: regPrice,
      price: sellingPrice,
      compareAtPrice: compareAt,
      discountPrice: hasDisc ? rawDisc : null,
      salePrice: hasDisc ? rawDisc : null,
      isSampleVial: v.isSampleVial || (v.volumeMl ? v.volumeMl <= 2 : false),
      stockQuantity: stock,
      availableQuantity: stock,
      isDefault: Boolean(v.isDefault ?? idx === 0),
    };
  });

  const notes = (item.notes || []).map((n: any) => ({
    nameEn: n.name || n.nameEn || "Rare Essence",
    nameAr: n.nameAr || n.name || "خلاصة نادرة",
    position: (n.position || "HEART") as "TOP" | "HEART" | "BASE",
    slug: n.slug || (n.name ? n.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "note"),
  }));

  return {
    id: item.id || `prod-${item.slug}`,
    slug: item.slug,
    nameEn: item.nameEn,
    nameAr: item.nameAr,
    descriptionEn: item.descriptionEn || "",
    descriptionAr: item.descriptionAr || "",
    concentration: (item.concentration || "EXTRAIT_DE_PARFUM").replaceAll(" ", "_").toUpperCase(),
    brand: { name: brandName, slug: brandSlug, type: brandType },
    scentFamily: item.scentFamily || {
      slug: "woody-smoky",
      nameEn: "Woody & Smoky",
      nameAr: "خشبي ودخاني",
    },
    images: item.images && item.images.length > 0 ? item.images : ["/product-placeholder.svg"],
    gender: item.gender || "UNISEX",
    variants,
    notes,
  };
}

export function getPreviewStorefrontProducts(): StorefrontProduct[] {
  return Object.values(PREVIEW_CATALOG).map(toStorefrontProduct);
}

export function getPreviewStorefrontProductBySlug(slug: string): StorefrontProduct | null {
  const item = PREVIEW_CATALOG[slug];
  if (!item) return null;
  return toStorefrontProduct(item);
}

export function getPreviewBrands(): any[] {
  const products = getPreviewStorefrontProducts();
  const map = new Map<string, any>();
  for (const p of products) {
    if (!map.has(p.brand.slug)) {
      map.set(p.brand.slug, {
        id: `brand-${p.brand.slug}`,
        name: p.brand.name,
        slug: p.brand.slug,
        type: p.brand.type,
        countryOfOrigin:
          p.brand.name === "Amouage"
            ? "Sultanate of Oman"
            : p.brand.name === "Roja Parfums"
              ? "United Kingdom"
              : p.brand.name === "MFK Paris" || p.brand.name === "Maison Francis Kurkdjian"
                ? "France"
                : p.brand.name === "Xerjoff"
                  ? "Italy"
                  : "International",
        descriptionEn: `Official Atelier partner for ${p.brand.name}. 100% authentic sealed flacons.`,
        descriptionAr: `شريك رسمي معتمد لدار ${p.brand.name}. عطور أصلية ومختومة ١٠٠٪.`,
        _count: { products: 1 },
      });
    } else {
      map.get(p.brand.slug)._count.products += 1;
    }
  }
  return Array.from(map.values());
}

export function getPreviewNotes(): any[] {
  const products = getPreviewStorefrontProducts();
  const map = new Map<string, any>();
  for (const p of products) {
    for (const n of p.notes) {
      if (!map.has(n.slug)) {
        map.set(n.slug, {
          nameEn: n.nameEn,
          nameAr: n.nameAr,
          slug: n.slug,
          slugEn: n.slug,
          categoryEn: n.position === "TOP" ? "Top Note" : n.position === "HEART" ? "Heart Note" : "Base Note",
          categoryAr: n.position === "TOP" ? "افتتاحية" : n.position === "HEART" ? "قلب العطر" : "قاعدة العطر",
        });
      }
    }
  }
  return Array.from(map.values());
}

export function getPreviewScentFamilies(): any[] {
  return [
    { slug: "woody-smoky", nameEn: "Woody & Smoky", nameAr: "خشبي ودخاني" },
    { slug: "oriental-amber", nameEn: "Oriental & Amber", nameAr: "شرقي وعنبري" },
    { slug: "fresh-citrus-aquatic", nameEn: "Fresh & Citrus", nameAr: "حمضي ومنعش" },
    { slug: "rare-florals", nameEn: "Rare Florals", nameAr: "زهور نادرة" },
    { slug: "gourmand-leather", nameEn: "Gourmand & Leather", nameAr: "غورماند وجلدي" },
  ];
}
