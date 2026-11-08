const { PrismaClient, BrandType, Concentration, GenderCategory, NotePosition } = require('@prisma/client');
const prisma = new PrismaClient();

const BRANDS = [
  {
    name: "Parfums de Marly",
    slug: "parfums-de-marly",
    type: BrandType.NICHE,
    countryOfOrigin: "France",
    descriptionEn: "Haute Parfumerie inspired by the splendour of the 18th century French royal court and legendary thoroughbred horses.",
    descriptionAr: "دار عطور فاخرة مستوحاة من فخامة البلاط الملكي الفرنسي في القرن الثامن عشر والخيول الأصيلة.",
    logoUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
    isFeatured: true
  },
  {
    name: "Kilian",
    slug: "kilian",
    type: BrandType.NICHE,
    countryOfOrigin: "France",
    descriptionEn: "Created by Kilian Hennessy, heir to the renowned French cognac-making dynasty, crafting intoxicating luxury fragrances.",
    descriptionAr: "أسسها كيليان هينيسي وريث عائلة صناعة الكونياك الفرنسية الشهيرة، لابتكار أروع العطور الآسرة.",
    logoUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80",
    isFeatured: true
  },
  {
    name: "Initio Parfums Privés",
    slug: "initio-parfums-prives",
    type: BrandType.NICHE,
    countryOfOrigin: "France",
    descriptionEn: "Perfumes infused with the power of sacred geometry and pheromonic science to awaken instinct and grandeur.",
    descriptionAr: "عطور تسخر قوى الهندسة المقدسة ونقاء المكونات لإيقاظ المشاعر الملكية والحضور الاستثنائي.",
    logoUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=400&q=80",
    isFeatured: true
  },
  {
    name: "Nishane",
    slug: "nishane",
    type: BrandType.NICHE,
    countryOfOrigin: "Turkey",
    descriptionEn: "The first niche perfume house from Istanbul, celebrated worldwide for sophisticated extraits and rich storytelling.",
    descriptionAr: "أول دار عطور نيش من إسطنبول، تشتهر عالمياً بالخلاصات العطرية الفاخرة وسرد القصص الملحمية.",
    logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    isFeatured: true
  },
  {
    name: "Frederic Malle",
    slug: "frederic-malle",
    type: BrandType.NICHE,
    countryOfOrigin: "France",
    descriptionEn: "Editions de Parfums Frederic Malle grants total artistic freedom to the world's greatest master perfumers.",
    descriptionAr: "دار تحرير العطور فريدريك مال تمنح حرية إبداعية مطلقة لأعظم صانعي العطور في العالم.",
    logoUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=400&q=80",
    isFeatured: true
  }
];

const EXTRA_NOTES = [
  {
    nameEn: "French Lavender",
    nameAr: "اللافندر الفرنسي النقي",
    slugEn: "french-lavender",
    slugAr: "french-lavender-ar",
    categoryEn: "Aromatics",
    categoryAr: "العطريات"
  },
  {
    nameEn: "Ceylon Cinnamon Bark",
    nameAr: "لحاء قرفة سيلان",
    slugEn: "ceylon-cinnamon",
    slugAr: "ceylon-cinnamon-ar",
    categoryEn: "Spices",
    categoryAr: "التوابل"
  },
  {
    nameEn: "Hennessy Cognac Accord",
    nameAr: "نفحات الكونياك المعتق",
    slugEn: "cognac-accord",
    slugAr: "cognac-accord-ar",
    categoryEn: "Gourmand",
    categoryAr: "غورماند"
  },
  {
    nameEn: "Tuscan Leather Accord",
    nameAr: "الجلد التوسكاني الفاخر",
    slugEn: "tuscan-leather",
    slugAr: "tuscan-leather-ar",
    categoryEn: "Leather",
    categoryAr: "الجلود"
  },
  {
    nameEn: "Indonesian Patchouli",
    nameAr: "باتشولي إندونيسيا المعتق",
    slugEn: "indonesian-patchouli",
    slugAr: "indonesian-patchouli-ar",
    categoryEn: "Woods & Resins",
    categoryAr: "الأخشاب والعود"
  },
  {
    nameEn: "Nutmeg & Cardamom",
    nameAr: "جوزة الطيب والهيل الملكي",
    slugEn: "nutmeg-cardamom",
    slugAr: "nutmeg-cardamom-ar",
    categoryEn: "Spices",
    categoryAr: "التوابل"
  },
  {
    nameEn: "Turkish Damascena Rose",
    nameAr: "الورد الجوري الدمشقي",
    slugEn: "turkish-damascena-rose",
    slugAr: "turkish-damascena-rose-ar",
    categoryEn: "Rare Florals",
    categoryAr: "الزهور الملكية"
  },
  {
    nameEn: "Sparkling Pineapple",
    nameAr: "الأناناس الملكي المنعش",
    slugEn: "sparkling-pineapple",
    slugAr: "sparkling-pineapple-ar",
    categoryEn: "Citrus & Fruits",
    categoryAr: "الفواكه والحمضيات"
  },
  {
    nameEn: "White Musks",
    nameAr: "المسك الأبيض الصافي",
    slugEn: "white-musks",
    slugAr: "white-musks-ar",
    categoryEn: "Musk",
    categoryAr: "المسك"
  },
  {
    nameEn: "Haitian Vetiver",
    nameAr: "نجيل الهند الهايتي",
    slugEn: "haitian-vetiver",
    slugAr: "haitian-vetiver-ar",
    categoryEn: "Woods & Resins",
    categoryAr: "الأخشاب والعود"
  }
];

const PRODUCTS_TO_ADD = [
  {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    taglineEn: "The paradise of aristocratic citrus and amber depth.",
    taglineAr: "فردوس الحمضيات الأرستقراطية وعمق العنبر النادر.",
    descriptionEn: "A heroic blend of sparkling Calabrian citrus accords, pink pepper, juniper berry, and a deep leather-amber base crafted without compromise.",
    descriptionAr: "مزيج بطولي من أرقى حمضيات كالابريا والفلفل الوردي وحبوب العرعر مع قاعدة جلدية عنبرية مهيبة صُنعت بدون أي قيود.",
    brandSlug: "roja-parfums",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2017,
    countryOfOrigin: "United Kingdom",
    sillage: "Radiant & Commanding",
    longevity: "16-20 Hours",
    styleCharacter: "Noble & Invigorating",
    images: [
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793203996/muschio/products/roja-elysium-pour-homme-primary.jpg",
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793203997/muschio/products/roja-elysium-pour-homme-lifestyle.jpg"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.94,
    ratingCount: 198,
    tags: ["signature-scent", "summer-fresh"],
    notes: [
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 10 },
      { slug: "golden-ambergris", pos: NotePosition.BASE, prominence: 8 },
      { slug: "haitian-vetiver", pos: NotePosition.HEART, prominence: 7 }
    ],
    variants: [
      {
        sku: "ROJ-ELY-PARFUM-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Pure Parfum Bottle",
        labelAr: "زجاجة 100 مل بارفان نقي",
        cost: 880,
        price: 1950,
        compareAt: 2200,
        stock: 32,
        isDefault: true
      },
      {
        sku: "ROJ-ELY-PARFUM-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Pure Parfum Bottle",
        labelAr: "زجاجة 50 مل بارفان نقي",
        cost: 580,
        price: 1250,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  },
  {
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    taglineEn: "Ancient royal Alexandrian libraries rendered in aged Laos oud.",
    taglineAr: "مكتبات الإسكندرية الملكية القديمة مجسدة بعود لاوس المعتق.",
    descriptionEn: "Sublime combination of sweet lavender, crisp green apple, rosewood, and aged wild Laotian agarwood. Enclosed in an exquisite sculptural flacon.",
    descriptionAr: "مزيج أسطوري يجمع اللافندر النقي والتفاح الأخضر وخشب الورد مع أندر خلاصات عود لاوس البري في زجاجة منحوتة فائقة الجمال.",
    brandSlug: "xerjoff",
    familySlug: "woody-smoky",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2012,
    countryOfOrigin: "Italy",
    sillage: "Enveloping & Majestic",
    longevity: "20+ Hours",
    styleCharacter: "Aristocratic & Timeless",
    images: [
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204000/muschio/products/xerjoff-alexandria-ii-primary.jpg",
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204001/muschio/products/xerjoff-alexandria-ii-lifestyle.jpg"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.96,
    ratingCount: 175,
    tags: ["royal-oud", "evening-black-tie"],
    notes: [
      { slug: "cambodian-oud", pos: NotePosition.BASE, prominence: 10 },
      { slug: "french-lavender", pos: NotePosition.TOP, prominence: 9 },
      { slug: "royal-taif-rose", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "XER-ALEX2-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Eau de Parfum Flacon",
        labelAr: "زجاجة 100 مل أو دي بارفان",
        cost: 950,
        price: 2200,
        compareAt: 2450,
        stock: 28,
        isDefault: true
      },
      {
        sku: "XER-ALEX2-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Eau de Parfum Flacon",
        labelAr: "زجاجة 50 مل أو دي بارفان",
        cost: 650,
        price: 1450,
        compareAt: null,
        stock: 20,
        isDefault: false
      }
    ]
  },
  {
    slug: "tom-ford-tobacco-vanille",
    nameEn: "Tobacco Vanille Eau de Parfum",
    nameAr: "توباكو فانيلا أو دي بارفان",
    taglineEn: "The iconic private club aroma of tobacco leaf and rich spices.",
    taglineAr: "رائحة أندية النخبة الخاصة من أوراق التبغ والتوابل الغنية.",
    descriptionEn: "Opulent, warm, and iconic. Tom Ford reinvents classic tobacco with creamy tonka bean, Madagascar vanilla, cocoa, dry fruit accords, and sweet wood sap.",
    descriptionAr: "عطر مترف ومميز يعيد فيه توم فورد ابتكار التبغ الكلاسيكي بحبوب التونكا الكريمية وفانيليا مدغشقر والكاكاو والأخشاب الحلوة.",
    brandSlug: "tom-ford",
    familySlug: "gourmand-leather",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2007,
    countryOfOrigin: "USA",
    sillage: "Warm & Powerful",
    longevity: "18+ Hours",
    styleCharacter: "Decadent & Warm",
    images: [
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204003/muschio/products/tom-ford-tobacco-vanille-primary.jpg",
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204004/muschio/products/tom-ford-tobacco-vanille-lifestyle.jpg"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.89,
    ratingCount: 310,
    tags: ["signature-scent", "sensual-amber"],
    notes: [
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 10 },
      { slug: "kashmiri-saffron", pos: NotePosition.TOP, prominence: 7 },
      { slug: "nutmeg-cardamom", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "TF-TOB-VAN-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Private Blend Flacon",
        labelAr: "زجاجة 100 مل برايفيت بليند",
        cost: 780,
        price: 1720,
        compareAt: 1950,
        stock: 35,
        isDefault: true
      },
      {
        sku: "TF-TOB-VAN-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Private Blend Flacon",
        labelAr: "زجاجة 50 مل برايفيت بليند",
        cost: 520,
        price: 1150,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  },
  {
    slug: "clive-christian-no-1-masculine",
    nameEn: "No. 1 Masculine Edition",
    nameAr: "نمبر 1 الإصدار الرجالي الفاخر",
    taglineEn: "The culmination of rare ingredients and royal heritage.",
    taglineAr: "قمة الفخامة العطرية بأندر المكونات والإرث الملكي البريطاني.",
    descriptionEn: "Created without reference to cost. Contains 50-year-old aged Indian sandalwood, powdery Florentine orris, and royal Tahitian vanilla.",
    descriptionAr: "صُنع دون أي اعتبار للتكلفة، ويحتوي على خشب الصندل الهندي المعتق لخمسين عاماً، وسوسن فلورنسا البودري، وفانيليا تاهيتي الملكية.",
    brandSlug: "clive-christian",
    familySlug: "rare-florals",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2001,
    countryOfOrigin: "United Kingdom",
    sillage: "Sublime Royal Presence",
    longevity: "20+ Hours",
    styleCharacter: "Sovereign & Rare",
    images: [
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204007/muschio/products/clive-christian-no1-primary.jpg",
      "https://res.cloudinary.com/zwkad4sz/image/upload/v1793204008/muschio/products/clive-christian-no1-lifestyle.jpg"
    ],
    isFeatured: true,
    isBestSeller: false,
    ratingAverage: 4.97,
    ratingCount: 88,
    tags: ["dubai-exclusive", "rare-vintage"],
    notes: [
      { slug: "florentine-iris", pos: NotePosition.HEART, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 8 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 7 }
    ],
    variants: [
      {
        sku: "CC-NO1-MASC-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Crown Flacon",
        labelAr: "زجاجة 50 مل التاج الملكي",
        cost: 1250,
        price: 2850,
        compareAt: 3200,
        stock: 18,
        isDefault: true
      }
    ]
  },
  {
    slug: "mfk-grand-soir",
    nameEn: "Grand Soir Eau de Parfum",
    nameAr: "جراند سوار أو دي بارفان",
    taglineEn: "The luminous golden glow of a grand Parisian night.",
    taglineAr: "البريق الذهبي المتوهج لليالي باريس الملكية الساحرة.",
    descriptionEn: "Dress in your finest attire and polish your look. Experience the luminous energy of a grand night out in Paris with deep Siam benzoin, Brazilian tonka bean, and Spanish cistus labdanum.",
    descriptionAr: "تألق بأبهى إطلالة وانغمس في سحر ليلة باريسية متوهجة مع صمغ بنزوين سيام النادر وحبوب التونكا البرازيلية وعنبر اللابدانوم الإسباني الآسر.",
    brandSlug: "maison-francis-kurkdjian",
    familySlug: "oriental-amber",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2016,
    countryOfOrigin: "France",
    sillage: "Warm & Enveloping",
    longevity: "16+ Hours",
    styleCharacter: "Golden & Captivating",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.93,
    ratingCount: 240,
    tags: ["sensual-amber", "evening-black-tie"],
    notes: [
      { slug: "golden-ambergris", pos: NotePosition.BASE, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.HEART, prominence: 8 },
      { slug: "ceylon-cinnamon", pos: NotePosition.TOP, prominence: 7 }
    ],
    variants: [
      {
        sku: "MFK-GSOIR-70ML",
        volume: "70ml",
        volumeMl: 70,
        labelEn: "70ml Signature Bottle",
        labelAr: "زجاجة 70 مل التوقيع",
        cost: 480,
        price: 1050,
        compareAt: 1200,
        stock: 45,
        isDefault: true
      },
      {
        sku: "MFK-GSOIR-200ML",
        volume: "200ml",
        volumeMl: 200,
        labelEn: "200ml Grand Decanter",
        labelAr: "زجاجة 200 مل العائلية الفاخرة",
        cost: 950,
        price: 2100,
        compareAt: null,
        stock: 15,
        isDefault: false
      }
    ]
  },
  {
    slug: "mfk-oud-satin-mood-extrait",
    nameEn: "Oud Satin Mood Extrait de Parfum",
    nameAr: "عود ساتان مود إكستري دي بارفان",
    taglineEn: "The shimmering richness of raw Laotian oud veiled in satin.",
    taglineAr: "فخامة عود لاوس الخام المتلألئ بحرير الساتان الناعم.",
    descriptionEn: "An amplified concentration where precious Laotian agarwood blends with violet accords, Bulgarian and Turkish rose, and rich vanilla amber for a silken tactile sensation.",
    descriptionAr: "تركيز معزز فائق الفخامة يمتزج فيه عود لاوس النادر بالبنفسج والورد البلغاري والتركي مع العنبر والفانيليا ليمنح إحساساً كحرير الساتان.",
    brandSlug: "maison-francis-kurkdjian",
    familySlug: "oriental-amber",
    concentration: Concentration.EXTRAIT_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2017,
    countryOfOrigin: "France",
    sillage: "Monolithic & Intoxicating",
    longevity: "24+ Hours",
    styleCharacter: "Silken & Majestic",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.97,
    ratingCount: 185,
    tags: ["royal-oud", "extrait-concentration"],
    notes: [
      { slug: "cambodian-oud", pos: NotePosition.BASE, prominence: 10 },
      { slug: "turkish-damascena-rose", pos: NotePosition.HEART, prominence: 9 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "MFK-OSAT-EXT-70ML",
        volume: "70ml",
        volumeMl: 70,
        labelEn: "70ml Extrait Bottle",
        labelAr: "زجاجة 70 مل إكستري",
        cost: 820,
        price: 1850,
        compareAt: 2050,
        stock: 30,
        isDefault: true
      }
    ]
  },
  {
    slug: "amouage-reflection-45-man",
    nameEn: "Reflection 45 Man Extrait de Parfum",
    nameAr: "رفلكشن 45 مان إكستري دي بارفان",
    taglineEn: "Aged for four months at 45% concentration to monumental majesty.",
    taglineAr: "معتق لأربعة أشهر بتركيز 45% ليصل إلى أعلى مراتب الفخامة.",
    descriptionEn: "Elevating the iconic floral-woody signature into monumental heights. Formulated at 45% concentration with red pepper berries, clary sage, Florentine orris, and rich cedarwood.",
    descriptionAr: "يرتقي بالبصمة الزهرية الخشبية إلى قمة الفخامة. صيغ بتركيز 45% مع توت الفلفل الأحمر والميرمية وسوسن فلورنسا وأخشاب الأرز.",
    brandSlug: "amouage",
    familySlug: "woody-smoky",
    concentration: Concentration.EXTRAIT_DE_PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2021,
    countryOfOrigin: "Oman",
    sillage: "Regal & Expansive",
    longevity: "20+ Hours",
    styleCharacter: "Aristocratic & Polished",
    images: [
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.95,
    ratingCount: 160,
    tags: ["extrait-concentration", "signature-scent"],
    notes: [
      { slug: "florentine-iris", pos: NotePosition.HEART, prominence: 10 },
      { slug: "silver-frankincense", pos: NotePosition.BASE, prominence: 9 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 8 }
    ],
    variants: [
      {
        sku: "AMO-REFL45-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Extrait Bottle",
        labelAr: "زجاجة 100 مل إكستري",
        cost: 890,
        price: 2100,
        compareAt: 2350,
        stock: 25,
        isDefault: true
      }
    ]
  },
  {
    slug: "amouage-jubilation-40-man",
    nameEn: "Jubilation 40 Man Extrait de Parfum",
    nameAr: "جوبيليشن 40 مان إكستري دي بارفان",
    taglineEn: "The sovereign extrait of kings, aged for ten weeks to perfection.",
    taglineAr: "خلاصة الملوك الاستثنائية، معتق لعشرة أسابيع بكمال فائق.",
    descriptionEn: "Formulated at an opulent 40% concentration. Ripe tart blackberry, frankincense from Dhofar, bay leaf, cinnamon, and aged Omani agarwood create a grand royal aura.",
    descriptionAr: "صيغ بتركيز 40% غني ومبهر. التوت الأسود الحامض واللبان الحوجري وورق الغار والقرفة والعود العماني المعتق لحضور ملكي ساحر.",
    brandSlug: "amouage",
    familySlug: "oriental-amber",
    concentration: Concentration.EXTRAIT_DE_PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2023,
    countryOfOrigin: "Oman",
    sillage: "Dominant & Enveloping",
    longevity: "24+ Hours",
    styleCharacter: "Imperial & Majestic",
    images: [
      "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.96,
    ratingCount: 140,
    tags: ["royal-oud", "dubai-exclusive"],
    notes: [
      { slug: "silver-frankincense", pos: NotePosition.HEART, prominence: 10 },
      { slug: "cambodian-oud", pos: NotePosition.BASE, prominence: 10 },
      { slug: "ceylon-cinnamon", pos: NotePosition.TOP, prominence: 8 }
    ],
    variants: [
      {
        sku: "AMO-JUB40-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Extrait Bottle",
        labelAr: "زجاجة 100 مل إكستري",
        cost: 920,
        price: 2100,
        compareAt: 2350,
        stock: 22,
        isDefault: true
      }
    ]
  },
  {
    slug: "amouage-royal-tobacco",
    nameEn: "Opus XIV Royal Tobacco",
    nameAr: "أوبوس 14 رويال توباكو",
    taglineEn: "A visionary voyage along the Tropic of Cancer with aged tobacco and frankincense.",
    taglineAr: "رحلة استكشافية مهيبة على طول مدار السرطان مع التبغ واللبان المعتق.",
    descriptionEn: "Created by Cecile Zarokian. An uncompromising marriage between royal Omani frankincense and rich Cuban tobacco leaf absolute, sweetened with licorice and prunol.",
    descriptionAr: "إبداع العطارة سيسيل زاروكيان. تزاوج أسطوري بين اللبان الحوجري العماني وأوراق التبغ الكوبية مع العرقسوس ولمسات البرونول الفاخرة.",
    brandSlug: "amouage",
    familySlug: "woody-smoky",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2022,
    countryOfOrigin: "Oman",
    sillage: "Monolithic & Smoky",
    longevity: "20+ Hours",
    styleCharacter: "Profound & Intellectual",
    images: [
      "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    ratingAverage: 4.92,
    ratingCount: 115,
    tags: ["signature-scent", "evening-black-tie"],
    notes: [
      { slug: "silver-frankincense", pos: NotePosition.TOP, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 9 },
      { slug: "kashmiri-saffron", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "AMO-OPUS14-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Library Flacon",
        labelAr: "زجاجة 100 مل المكتبة العطرية",
        cost: 720,
        price: 1650,
        compareAt: null,
        stock: 30,
        isDefault: true
      }
    ]
  },
  {
    slug: "roja-amber-aoud-parfum",
    nameEn: "Amber Aoud Parfum",
    nameAr: "عنبر عود بارفان",
    taglineEn: "The undisputed reference for Middle Eastern haute perfumery.",
    taglineAr: "المرجع الذي لا يُعلى عليه في فنون العطور الشرقية الملكية.",
    descriptionEn: "Roja Dove's definitive Middle Eastern creation. Pure Rose de Mai, rich agarwood, cinnamon, saffron, and sweet benzoin laced with lime and lemon.",
    descriptionAr: "تحفة روجا دوف الشرقية الخالدة. ورد دي ماي النادر مع خشب العود والقرفة والزعفران وصمغ الجاوي المعزز بلمسات الليمون والزيزفون.",
    brandSlug: "roja-parfums",
    familySlug: "oriental-amber",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2012,
    countryOfOrigin: "United Kingdom",
    sillage: "Extravagant & Regal",
    longevity: "24+ Hours",
    styleCharacter: "Opulent & Supreme",
    images: [
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.98,
    ratingCount: 220,
    tags: ["royal-oud", "dubai-exclusive"],
    notes: [
      { slug: "cambodian-oud", pos: NotePosition.BASE, prominence: 10 },
      { slug: "royal-taif-rose", pos: NotePosition.HEART, prominence: 10 },
      { slug: "kashmiri-saffron", pos: NotePosition.TOP, prominence: 8 }
    ],
    variants: [
      {
        sku: "ROJ-AAOUD-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Crystal Flacon",
        labelAr: "زجاجة 100 مل كريستال",
        cost: 1350,
        price: 2850,
        compareAt: 3100,
        stock: 20,
        isDefault: true
      },
      {
        sku: "ROJ-AAOUD-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Crystal Flacon",
        labelAr: "زجاجة 50 مل كريستال",
        cost: 850,
        price: 1850,
        compareAt: null,
        stock: 15,
        isDefault: false
      }
    ]
  },
  {
    slug: "roja-enigma-pour-homme-parfum",
    nameEn: "Enigma Pour Homme Parfum",
    nameAr: "إنيغما بور هوم بارفان",
    taglineEn: "The mysterious allure of a gentleman's club with cognac and warm tobacco.",
    taglineAr: "الجاذبية الغامضة لأندية النخبة الخاصة بنفحات الكونياك والتبغ الدافئ.",
    descriptionEn: "A whisper of cognac, aromatic geranium, heliotrope, Madagascar vanilla, and benzoin mingling with tobacco leaf and warm cedarwood.",
    descriptionAr: "نفحات الكونياك الآسرة والغرنوقي وفانيليا مدغشقر والجاوي تمتزج بأوراق التبغ الفاخرة وخشب الأرز الدافئ لهيبة أرستقراطية غامضة.",
    brandSlug: "roja-parfums",
    familySlug: "gourmand-leather",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2013,
    countryOfOrigin: "United Kingdom",
    sillage: "Hypnotic & Enveloping",
    longevity: "18+ Hours",
    styleCharacter: "Enigmatic & Aristocratic",
    images: [
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    ratingAverage: 4.91,
    ratingCount: 130,
    tags: ["evening-black-tie", "sensual-amber"],
    notes: [
      { slug: "cognac-accord", pos: NotePosition.TOP, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 9 },
      { slug: "ceylon-cinnamon", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "ROJ-ENIGMA-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Pure Parfum Flacon",
        labelAr: "زجاجة 100 مل بارفان نقي",
        cost: 880,
        price: 1950,
        compareAt: null,
        stock: 25,
        isDefault: true
      },
      {
        sku: "ROJ-ENIGMA-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Pure Parfum Flacon",
        labelAr: "زجاجة 50 مل بارفان نقي",
        cost: 580,
        price: 1250,
        compareAt: null,
        stock: 20,
        isDefault: false
      }
    ]
  },
  {
    slug: "xerjoff-naxos-1861",
    nameEn: "XJ 1861 Naxos Eau de Parfum",
    nameAr: "إكس جيه 1861 ناكسوس أو دي بارفان",
    taglineEn: "The sun-kissed spirit of Sicily with honey, lavender, and rich tobacco.",
    taglineAr: "روح صقلية المشمسة مفعمة بالعسل واللافندر وأوراق التبغ الغنية.",
    descriptionEn: "Naxos celebrates Sicily's profound heart with sparkling bergamot and lemon, sweet honey, lavender, cinnamon, and warm cashmere-tobacco base.",
    descriptionAr: "يحتفي ناكسوس بقلب صقلية العريق مع البرغموت والليمون المنعش، والعسل الحلو واللافندر والقرفة مع قاعدة كشميرية وتبغية دافئة.",
    brandSlug: "xerjoff",
    familySlug: "gourmand-leather",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2015,
    countryOfOrigin: "Italy",
    sillage: "Warm & Radiating",
    longevity: "16+ Hours",
    styleCharacter: "Celebratory & Golden",
    images: [
      "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.95,
    ratingCount: 380,
    tags: ["signature-scent", "summer-fresh"],
    notes: [
      { slug: "french-lavender", pos: NotePosition.HEART, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 9 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 8 }
    ],
    variants: [
      {
        sku: "XER-NAXOS-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Eau de Parfum Bottle",
        labelAr: "زجاجة 100 مل أو دي بارفان",
        cost: 520,
        price: 1150,
        compareAt: 1300,
        stock: 45,
        isDefault: true
      }
    ]
  },
  {
    slug: "xerjoff-erba-pura",
    nameEn: "Erba Pura Eau de Parfum",
    nameAr: "إربا بورا أو دي بارفان",
    taglineEn: "A joyful basket of luminous Mediterranean fruits and velvet white musk.",
    taglineAr: "سلة بهيجة من أشهى الفواكه المتوسطية والمسك الأبيض المخملي.",
    descriptionEn: "A mouthwatering burst of Sicilian citrus and sweet fruits resting on an opulent base of Madagascar vanilla, amber, and sensual white musk.",
    descriptionAr: "انفجار منعش من حمضيات صقلية والفواكه المتوسطية المشرقة ترتكز على قاعدة فاخرة من فانيليا مدغشقر والعنبر والمسك الأبيض الآسر.",
    brandSlug: "xerjoff",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2019,
    countryOfOrigin: "Italy",
    sillage: "Massive & Joyful",
    longevity: "18+ Hours",
    styleCharacter: "Vibrant & Seductive",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.88,
    ratingCount: 320,
    tags: ["summer-fresh", "gift-idea"],
    notes: [
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 10 },
      { slug: "white-musks", pos: NotePosition.BASE, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "XER-ERBAPURA-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Velvet Flacon",
        labelAr: "زجاجة 100 مل مخملية",
        cost: 480,
        price: 1050,
        compareAt: null,
        stock: 50,
        isDefault: true
      },
      {
        sku: "XER-ERBAPURA-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Velvet Flacon",
        labelAr: "زجاجة 50 مل مخملية",
        cost: 320,
        price: 720,
        compareAt: null,
        stock: 35,
        isDefault: false
      }
    ]
  },
  {
    slug: "tom-ford-oud-wood",
    nameEn: "Oud Wood Eau de Parfum",
    nameAr: "عود وود أو دي بارفان",
    taglineEn: "Smoky, exotic oud wood wrapped in rosewood and warm cardamom.",
    taglineAr: "خشب عود غامض ودخاني محاط بخشب الورد والهيل الدافئ.",
    descriptionEn: "One of the most rare, precious, and expensive ingredients in a perfumer's arsenal. Exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood, and vetiver.",
    descriptionAr: "أحد أندر وأغلى مكونات العطور العالمية. خشب الورد النادر والهيل يمهدان لمزيج دخاني ملكي من خشب العود وصندل الهند ونجيل الهند.",
    brandSlug: "tom-ford",
    familySlug: "woody-smoky",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2007,
    countryOfOrigin: "USA",
    sillage: "Sophisticated & Intimate",
    longevity: "14-16 Hours",
    styleCharacter: "Architectural & Smooth",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.90,
    ratingCount: 350,
    tags: ["signature-scent", "royal-oud"],
    notes: [
      { slug: "cambodian-oud", pos: NotePosition.HEART, prominence: 10 },
      { slug: "nutmeg-cardamom", pos: NotePosition.TOP, prominence: 9 },
      { slug: "haitian-vetiver", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "TF-OUD-WOOD-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Private Blend Bottle",
        labelAr: "زجاجة 100 مل برايفيت بليند",
        cost: 750,
        price: 1680,
        compareAt: null,
        stock: 40,
        isDefault: true
      },
      {
        sku: "TF-OUD-WOOD-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Private Blend Bottle",
        labelAr: "زجاجة 50 مل برايفيت بليند",
        cost: 510,
        price: 1120,
        compareAt: null,
        stock: 30,
        isDefault: false
      }
    ]
  },
  {
    slug: "tom-ford-tuscan-leather",
    nameEn: "Tuscan Leather Eau de Parfum",
    nameAr: "توسكان ليزر أو دي بارفان",
    taglineEn: "Supple primal leather touched with black raspberry and herbal thyme.",
    taglineAr: "نفحات جلدية أصيلة تفيض بالرجولة مع توت العليق الأسود والزعتر.",
    descriptionEn: "Inspired by Tom Ford's love of fine leather. A raw yet refined fragrance featuring Tuscan leather, black raspberry, saffron, and night-blooming jasmine.",
    descriptionAr: "مستوحى من شغف توم فورد بالجلود الفاخرة. عطر جلدي أصيل يجمع الجلد التوسكاني وتوت العليق الأسود والزعفران وياسمين الليل الفواح.",
    brandSlug: "tom-ford",
    familySlug: "gourmand-leather",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2007,
    countryOfOrigin: "USA",
    sillage: "Bold & Distinctive",
    longevity: "18+ Hours",
    styleCharacter: "Primal & High-Fashion",
    images: [
      "https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.89,
    ratingCount: 290,
    tags: ["signature-scent", "evening-black-tie"],
    notes: [
      { slug: "tuscan-leather", pos: NotePosition.BASE, prominence: 10 },
      { slug: "kashmiri-saffron", pos: NotePosition.TOP, prominence: 8 },
      { slug: "silver-frankincense", pos: NotePosition.HEART, prominence: 7 }
    ],
    variants: [
      {
        sku: "TF-TUSC-LTHR-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Private Blend Bottle",
        labelAr: "زجاجة 100 مل برايفيت بليند",
        cost: 780,
        price: 1720,
        compareAt: 1900,
        stock: 35,
        isDefault: true
      },
      {
        sku: "TF-TUSC-LTHR-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Private Blend Bottle",
        labelAr: "زجاجة 50 مل برايفيت بليند",
        cost: 520,
        price: 1150,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  },
  {
    slug: "clive-christian-town-country",
    nameEn: "Crown Collection Town & Country",
    nameAr: "كراون كولكشن تاون أند كانتري",
    taglineEn: "The legendary heritage fragrance favored by Sir Winston Churchill.",
    taglineAr: "العطر التراثي الأسطوري المفضل للسير ونستون تشرشل.",
    descriptionEn: "First formulated in 1925. A tribute to British countryside estates with aromatic clary sage, herbal juniper berry, dry cedarwood, and shimmering grey ambergris.",
    descriptionAr: "ابتُكر لأول مرة عام 1925. تحفة بريطانية نبيلة تفيض بالميرمية وحبوب العرعر العطرية وأخشاب الأرز الجافة مع العنبر الأشهب الملكي.",
    brandSlug: "clive-christian",
    familySlug: "woody-smoky",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2023,
    countryOfOrigin: "United Kingdom",
    sillage: "Crisp & Sovereign",
    longevity: "18+ Hours",
    styleCharacter: "Distinguished & Heritage",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    ratingAverage: 4.94,
    ratingCount: 75,
    tags: ["rare-vintage", "signature-scent"],
    notes: [
      { slug: "golden-ambergris", pos: NotePosition.BASE, prominence: 10 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 8 },
      { slug: "haitian-vetiver", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "CC-TC-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Crown Stopper Bottle",
        labelAr: "زجاجة 50 مل التاج الملكي",
        cost: 890,
        price: 1950,
        compareAt: 2150,
        stock: 20,
        isDefault: true
      }
    ]
  },
  {
    slug: "clive-christian-1872-masculine",
    nameEn: "1872 Masculine Edition",
    nameAr: "1872 الإصدار الرجالي الكلاسيكي",
    taglineEn: "The quintessence of British royal distinction crafted with 219 ingredients.",
    taglineAr: "خلاصة التميز الملكي البريطاني مصاغ بـ 219 مكوناً نادراً.",
    descriptionEn: "Named in honor of Queen Victoria's grant of the royal crown. A complex symphony of petitgrain, clary sage, black pepper, and aged cedarwood.",
    descriptionAr: "سُمي تكريماً لإذن الملكة فيكتوريا بوضع التاج الملكي. سيمفونية معقدة من البيتيغرين والميرمية والفلفل الأسود وأخشاب الأرز المعتقة.",
    brandSlug: "clive-christian",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2001,
    countryOfOrigin: "United Kingdom",
    sillage: "Sophisticated & Crisp",
    longevity: "16+ Hours",
    styleCharacter: "Peerless & Timeless",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: false,
    ratingAverage: 4.92,
    ratingCount: 95,
    tags: ["signature-scent", "summer-fresh"],
    notes: [
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 10 },
      { slug: "florentine-iris", pos: NotePosition.HEART, prominence: 9 },
      { slug: "haitian-vetiver", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "CC-1872-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Crown Bottle",
        labelAr: "زجاجة 50 مل التاج الملكي",
        cost: 750,
        price: 1650,
        compareAt: null,
        stock: 22,
        isDefault: true
      }
    ]
  },
  {
    slug: "creed-silver-mountain-water",
    nameEn: "Silver Mountain Water",
    nameAr: "سيلفر ماونتن ووتر",
    taglineEn: "The crystalline purity of snow-capped Swiss alpine springs.",
    taglineAr: "نقاء كريستالي جليدي مستوحى من ينابيع جبال الألب السويسرية.",
    descriptionEn: "Evoking sparkling streams coursing through the snow-capped Alps. Green tea accords, juicy blackcurrant, Italian bergamot, galbanum, and pure white musk.",
    descriptionAr: "يجسد الجداول الجليدية المتدفقة عبر جبال الألب. الشاي الأخضر والكشمش الأسود النضر والبرغموت الإيطالي مع المسك الأبيض الصافي.",
    brandSlug: "creed",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 1995,
    countryOfOrigin: "France",
    sillage: "Crisp & Luminous",
    longevity: "14+ Hours",
    styleCharacter: "Effortless & Pure",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.88,
    ratingCount: 280,
    tags: ["summer-fresh", "signature-scent"],
    notes: [
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 10 },
      { slug: "white-musks", pos: NotePosition.BASE, prominence: 9 },
      { slug: "golden-ambergris", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "CRD-SMW-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Millésime Flacon",
        labelAr: "زجاجة 100 مل ميليزيم",
        cost: 650,
        price: 1450,
        compareAt: 1600,
        stock: 40,
        isDefault: true
      },
      {
        sku: "CRD-SMW-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Millésime Flacon",
        labelAr: "زجاجة 50 مل ميليزيم",
        cost: 440,
        price: 980,
        compareAt: null,
        stock: 30,
        isDefault: false
      }
    ]
  },
  {
    slug: "creed-green-irish-tweed",
    nameEn: "Green Irish Tweed",
    nameAr: "جرين آيريش تويد",
    taglineEn: "The quintessential gentleman's scent favored by royalty and cinema legends.",
    taglineAr: "العطر الأرستقراطي الأيقوني المفضل لدى ملوك وأساطير السينما.",
    descriptionEn: "Like a stroll through the Irish countryside. Vibrant lemon verbena, peppermint, Florentine iris, violet leaves, and warm Mysore sandalwood.",
    descriptionAr: "كنزهة في ريف أيرلندا الأخضر. رعي الحمام الليموني والنعناع النضر وسوسن فلورنسا وأوراق البنفسج مع خشب صندل ميسور الفاخر.",
    brandSlug: "creed",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 1985,
    countryOfOrigin: "France",
    sillage: "Magnetic & Refined",
    longevity: "14+ Hours",
    styleCharacter: "Stately & Aristocratic",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.92,
    ratingCount: 310,
    tags: ["signature-scent", "rare-vintage"],
    notes: [
      { slug: "florentine-iris", pos: NotePosition.HEART, prominence: 10 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 9 },
      { slug: "golden-ambergris", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "CRD-GIT-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Millésime Flacon",
        labelAr: "زجاجة 100 مل ميليزيم",
        cost: 650,
        price: 1450,
        compareAt: null,
        stock: 35,
        isDefault: true
      },
      {
        sku: "CRD-GIT-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Millésime Flacon",
        labelAr: "زجاجة 50 مل ميليزيم",
        cost: 440,
        price: 980,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  },
  {
    slug: "parfums-de-marly-layton",
    nameEn: "Layton Eau de Parfum",
    nameAr: "لايتون أو دي بارفان",
    taglineEn: "Addictive and intoxicating elegance with crisp apple and warm vanilla.",
    taglineAr: "أناقة آسرة وجاذبية مطلقة بنفحات التفاح المقرمش والفانيليا الدافئة.",
    descriptionEn: "A sensual and fragrant composition which infuses ease and nobility into the festive and harmonious atmosphere of the Versailles court. Bergamot, crisp apple, lavender, geranium, and rich vanilla.",
    descriptionAr: "تركيبة حسية فاخرة تبعث على النبل في أجواء قصر فرساي الملكي. البرغموت والتفاح واللافندر والغرنوقي مع الفانيليا والأخشاب النبيلة.",
    brandSlug: "parfums-de-marly",
    familySlug: "oriental-amber",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.MEN,
    releaseYear: 2016,
    countryOfOrigin: "France",
    sillage: "Potent & Magnetic",
    longevity: "18+ Hours",
    styleCharacter: "Addictive & Noble",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.95,
    ratingCount: 390,
    tags: ["signature-scent", "evening-black-tie"],
    notes: [
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 10 },
      { slug: "french-lavender", pos: NotePosition.HEART, prominence: 8 },
      { slug: "nutmeg-cardamom", pos: NotePosition.TOP, prominence: 8 }
    ],
    variants: [
      {
        sku: "PDM-LAYTON-125ML",
        volume: "125ml",
        volumeMl: 125,
        labelEn: "125ml Royal Flacon",
        labelAr: "زجاجة 125 مل الملكية",
        cost: 560,
        price: 1250,
        compareAt: 1400,
        stock: 50,
        isDefault: true
      },
      {
        sku: "PDM-LAYTON-75ML",
        volume: "75ml",
        volumeMl: 75,
        labelEn: "75ml Royal Flacon",
        labelAr: "زجاجة 75 مل الملكية",
        cost: 420,
        price: 950,
        compareAt: null,
        stock: 35,
        isDefault: false
      }
    ]
  },
  {
    slug: "parfums-de-marly-delina-exclusif",
    nameEn: "Delina Exclusif Parfum",
    nameAr: "ديلينا إكسكلوسيف بارفان",
    taglineEn: "The supreme manifestation of Turkish rose, incense, and glowing amber.",
    taglineAr: "التجسيد الأسمى للورد التركي الفاخر والبخور والعنبر المتوهج.",
    descriptionEn: "A captivating floral creation that envelops the wearer in a velvet mantle of Turkish rose, incense, burning amber, lychee, and Bourbon vanilla.",
    descriptionAr: "إبداع زهري ساحر يحيط من يرتديه برداء مخملي من الورد التركي والبخور والعنبر المتوهج وفانيليا بوربون الفاخرة.",
    brandSlug: "parfums-de-marly",
    familySlug: "rare-florals",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.WOMEN,
    releaseYear: 2018,
    countryOfOrigin: "France",
    sillage: "Extravagant & Enchanting",
    longevity: "20+ Hours",
    styleCharacter: "Regal & Hypnotic",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.96,
    ratingCount: 340,
    tags: ["extrait-concentration", "gift-idea"],
    notes: [
      { slug: "turkish-damascena-rose", pos: NotePosition.HEART, prominence: 10 },
      { slug: "silver-frankincense", pos: NotePosition.BASE, prominence: 9 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 9 }
    ],
    variants: [
      {
        sku: "PDM-DELINA-EXC-75ML",
        volume: "75ml",
        volumeMl: 75,
        labelEn: "75ml Royal Pink Flacon",
        labelAr: "زجاجة 75 مل الوردية الملكية",
        cost: 650,
        price: 1450,
        compareAt: 1600,
        stock: 35,
        isDefault: true
      }
    ]
  },
  {
    slug: "kilian-angels-share",
    nameEn: "Angels' Share Eau de Parfum",
    nameAr: "إنجلز شير أو دي بارفان",
    taglineEn: "The sacred oak barrels of Hennessy cognac masterfully distilled into perfume.",
    taglineAr: "براميل البلوط المعتقة لكونياك هينيسي مجسدة ببراعة في عطر أسطوري.",
    descriptionEn: "Contains the essence of Cognac derived from the liquor to lend it a natural caramel color. Opening with cognac oil upon a blend of oak absolute, cinnamon essence, and Tonka bean absolute.",
    descriptionAr: "يحتوي على خلاصة الكونياك الطبيعية بلونها الكراميلي الساحر. يفتتح بزيت الكونياك مع خشب البلوط ولحاء القرفة وخلاصة حبوب التونكا.",
    brandSlug: "kilian",
    familySlug: "gourmand-leather",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2020,
    countryOfOrigin: "France",
    sillage: "Warm & Delicious",
    longevity: "18+ Hours",
    styleCharacter: "Decadent & Intoxicating",
    images: [
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.97,
    ratingCount: 410,
    tags: ["signature-scent", "evening-black-tie"],
    notes: [
      { slug: "cognac-accord", pos: NotePosition.TOP, prominence: 10 },
      { slug: "ceylon-cinnamon", pos: NotePosition.HEART, prominence: 10 },
      { slug: "bourbon-vanilla", pos: NotePosition.BASE, prominence: 9 }
    ],
    variants: [
      {
        sku: "KIL-ANGELS-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Crystal Carafe",
        labelAr: "زجاجة 50 مل كريستال كاراف",
        cost: 510,
        price: 1150,
        compareAt: 1300,
        stock: 45,
        isDefault: true
      },
      {
        sku: "KIL-ANGELS-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Crystal Carafe",
        labelAr: "زجاجة 100 مل كريستال كاراف",
        cost: 820,
        price: 1850,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  },
  {
    slug: "initio-oud-for-greatness",
    nameEn: "Oud for Greatness Eau de Parfum",
    nameAr: "عود فور جريتنس أو دي بارفان",
    taglineEn: "The vibrational frequency of pure natural oud and sacred geometry.",
    taglineAr: "التردد الطاقي لأندر خلاصات العود الطبيعي والهندسة المقدسة.",
    descriptionEn: "Draws its energy from the sources of sacred geometry. Natural agarwood of sublime quality, nutmeg, saffron, and lavender create an intoxicating and boldly regal projection.",
    descriptionAr: "يستمد طاقته من أسرار الهندسة المقدسة. خشب العود الطبيعي الاستثنائي مع جوزة الطيب والزعفران واللافندر لهالة ساحرة من العظمة الملكية.",
    brandSlug: "initio-parfums-prives",
    familySlug: "woody-smoky",
    concentration: Concentration.EAU_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2018,
    countryOfOrigin: "France",
    sillage: "Colossal & Magnetic",
    longevity: "24+ Hours",
    styleCharacter: "Dominant & Mystical",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.96,
    ratingCount: 370,
    tags: ["royal-oud", "signature-scent"],
    notes: [
      { slug: "cambodian-oud", pos: NotePosition.BASE, prominence: 10 },
      { slug: "kashmiri-saffron", pos: NotePosition.TOP, prominence: 9 },
      { slug: "nutmeg-cardamom", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "INI-OFG-90ML",
        volume: "90ml",
        volumeMl: 90,
        labelEn: "90ml Black Gold Flacon",
        labelAr: "زجاجة 90 مل الذهب الأسود",
        cost: 740,
        price: 1650,
        compareAt: 1850,
        stock: 38,
        isDefault: true
      }
    ]
  },
  {
    slug: "nishane-hacivat-extrait",
    nameEn: "Hacivat Extrait de Parfum",
    nameAr: "هاسيفات إكستري دي بارفان",
    taglineEn: "A celebration of aristocratic elegance, bright citrus, and noble oakmoss.",
    taglineAr: "احتفال بالأناقة الأرستقراطية والحمضيات المشرقة وطحلب البلوط النبيل.",
    descriptionEn: "A tribute to elegance, kindness, and love of art. Inspired by the traditional shadow play character. Juicy pineapple, bergamot, grapefruit, jasmine, patchouli, and cedarwood.",
    descriptionAr: "تحية راقية للأناقة والذوق الرفيع. مستوحى من شخصيات مسرح الظل العثماني التقليدي. أناناس مشرق وبرغموت وجريب فروت مع الياسمين والباتشولي وخشب الأرز.",
    brandSlug: "nishane",
    familySlug: "fresh-citrus-aquatic",
    concentration: Concentration.EXTRAIT_DE_PARFUM,
    gender: GenderCategory.UNISEX,
    releaseYear: 2017,
    countryOfOrigin: "Turkey",
    sillage: "Monolithic & Sparkling",
    longevity: "20+ Hours",
    styleCharacter: "Radiant & Triumphant",
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.93,
    ratingCount: 310,
    tags: ["summer-fresh", "extrait-concentration"],
    notes: [
      { slug: "sparkling-pineapple", pos: NotePosition.TOP, prominence: 10 },
      { slug: "calabrian-bergamot", pos: NotePosition.TOP, prominence: 9 },
      { slug: "indonesian-patchouli", pos: NotePosition.HEART, prominence: 8 }
    ],
    variants: [
      {
        sku: "NIS-HAC-EXT-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Extrait Bottle",
        labelAr: "زجاجة 100 مل إكستري",
        cost: 560,
        price: 1250,
        compareAt: 1400,
        stock: 45,
        isDefault: true
      },
      {
        sku: "NIS-HAC-EXT-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Extrait Bottle",
        labelAr: "زجاجة 50 مل إكستري",
        cost: 380,
        price: 850,
        compareAt: null,
        stock: 30,
        isDefault: false
      }
    ]
  },
  {
    slug: "frederic-malle-portrait-of-a-lady",
    nameEn: "Portrait of a Lady Parfum",
    nameAr: "بورتريت أوف أ ليدي بارفان",
    taglineEn: "Dominique Ropion's monumental rose masterpiece containing 400 Turkish roses per flacon.",
    taglineAr: "تحفة دومينيك روبيون الخالدة التي تضم 400 وردة تركية في كل زجاجة.",
    descriptionEn: "An exuberant dose of Turkish rose—no less than 400 flowers per 100ml bottle. Beneath rests a bed of patchouli heart soaked in sandalwood, frankincense, cinnamon, and clove.",
    descriptionAr: "جرعة فائقة من الورد التركي الملكي بما لا يقل عن 400 زهرة لكل 100 مل. ترتكز على سرير غني من الباتشولي وصندل الهند واللبان والقرفة والقرنفل.",
    brandSlug: "frederic-malle",
    familySlug: "rare-florals",
    concentration: Concentration.PARFUM,
    gender: GenderCategory.WOMEN,
    releaseYear: 2010,
    countryOfOrigin: "France",
    sillage: "Monolithic & Unforgettable",
    longevity: "24+ Hours",
    styleCharacter: "Sovereign & Dramatic",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"
    ],
    isFeatured: true,
    isBestSeller: true,
    ratingAverage: 4.97,
    ratingCount: 360,
    tags: ["signature-scent", "bespoke-layering"],
    notes: [
      { slug: "turkish-damascena-rose", pos: NotePosition.HEART, prominence: 10 },
      { slug: "indonesian-patchouli", pos: NotePosition.BASE, prominence: 10 },
      { slug: "silver-frankincense", pos: NotePosition.BASE, prominence: 8 }
    ],
    variants: [
      {
        sku: "FM-POAL-100ML",
        volume: "100ml",
        volumeMl: 100,
        labelEn: "100ml Editions de Parfums Flacon",
        labelAr: "زجاجة 100 مل إديسيون دي بارفان",
        cost: 780,
        price: 1750,
        compareAt: 1950,
        stock: 35,
        isDefault: true
      },
      {
        sku: "FM-POAL-50ML",
        volume: "50ml",
        volumeMl: 50,
        labelEn: "50ml Editions de Parfums Flacon",
        labelAr: "زجاجة 50 مل إديسيون دي بارفان",
        cost: 540,
        price: 1200,
        compareAt: null,
        stock: 25,
        isDefault: false
      }
    ]
  }
];

async function main() {
  console.log("💎 Seeding 25 Luxury Fragrances into Neon Database...");

  // 1. Ensure Brands
  console.log("Step 1: Checking and creating brands...");
  for (const b of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        type: b.type,
        countryOfOrigin: b.countryOfOrigin,
        descriptionEn: b.descriptionEn,
        descriptionAr: b.descriptionAr,
        logoUrl: b.logoUrl,
        isFeatured: b.isFeatured
      },
      create: {
        name: b.name,
        slug: b.slug,
        type: b.type,
        countryOfOrigin: b.countryOfOrigin,
        descriptionEn: b.descriptionEn,
        descriptionAr: b.descriptionAr,
        logoUrl: b.logoUrl,
        isFeatured: b.isFeatured
      }
    });
  }

  // 2. Ensure Extra Notes
  console.log("Step 2: Checking and creating notes compendium...");
  for (const n of EXTRA_NOTES) {
    await prisma.note.upsert({
      where: { slugEn: n.slugEn },
      update: {
        nameEn: n.nameEn,
        nameAr: n.nameAr,
        categoryEn: n.categoryEn,
        categoryAr: n.categoryAr
      },
      create: {
        nameEn: n.nameEn,
        nameAr: n.nameAr,
        slugEn: n.slugEn,
        slugAr: n.slugAr,
        categoryEn: n.categoryEn,
        categoryAr: n.categoryAr
      }
    });
  }

  // Pre-fetch brands, scent families, tags, and notes map
  const allBrands = await prisma.brand.findMany();
  const brandMap = new Map(allBrands.map(b => [b.slug, b.id]));

  const allFamilies = await prisma.scentFamily.findMany();
  const familyMap = new Map(allFamilies.map(f => [f.slug, f.id]));

  const allTags = await prisma.tag.findMany();
  const tagMap = new Map(allTags.map(t => [t.slug, t.id]));

  const allNotes = await prisma.note.findMany();
  const noteMap = new Map(allNotes.map(n => [n.slugEn, n.id]));

  console.log(`Step 3: Creating ${PRODUCTS_TO_ADD.length} products with variants & inventory...`);

  let addedCount = 0;
  for (const item of PRODUCTS_TO_ADD) {
    const brandId = brandMap.get(item.brandSlug);
    if (!brandId) {
      console.warn(`Brand not found for ${item.brandSlug}, skipping ${item.slug}`);
      continue;
    }

    const familyId = familyMap.get(item.familySlug) || null;

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        taglineEn: item.taglineEn,
        taglineAr: item.taglineAr,
        descriptionEn: item.descriptionEn,
        descriptionAr: item.descriptionAr,
        brandId,
        scentFamilyId: familyId,
        concentration: item.concentration,
        gender: item.gender,
        releaseYear: item.releaseYear,
        countryOfOrigin: item.countryOfOrigin,
        sillage: item.sillage,
        longevity: item.longevity,
        styleCharacter: item.styleCharacter,
        images: item.images,
        isPublished: true,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount
      },
      create: {
        slug: item.slug,
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        taglineEn: item.taglineEn,
        taglineAr: item.taglineAr,
        descriptionEn: item.descriptionEn,
        descriptionAr: item.descriptionAr,
        brandId,
        scentFamilyId: familyId,
        concentration: item.concentration,
        gender: item.gender,
        releaseYear: item.releaseYear,
        countryOfOrigin: item.countryOfOrigin,
        sillage: item.sillage,
        longevity: item.longevity,
        styleCharacter: item.styleCharacter,
        images: item.images,
        isPublished: true,
        isFeatured: item.isFeatured,
        isBestSeller: item.isBestSeller,
        ratingAverage: item.ratingAverage,
        ratingCount: item.ratingCount
      }
    });

    // Connect Product Tags
    for (const tagSlug of item.tags) {
      const tagId = tagMap.get(tagSlug);
      if (tagId) {
        await prisma.productTag.upsert({
          where: {
            productId_tagId: {
              productId: product.id,
              tagId
            }
          },
          update: {},
          create: {
            productId: product.id,
            tagId
          }
        });
      }
    }

    // Connect Product Notes
    for (const noteDef of item.notes) {
      const noteId = noteMap.get(noteDef.slug);
      if (noteId) {
        await prisma.productNote.upsert({
          where: {
            productId_noteId_position: {
              productId: product.id,
              noteId,
              position: noteDef.pos
            }
          },
          update: {
            prominence: noteDef.prominence
          },
          create: {
            productId: product.id,
            noteId,
            position: noteDef.pos,
            prominence: noteDef.prominence
          }
        });
      }
    }

    // Create / Update Variants and Inventory
    for (const v of item.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          volume: v.volume,
          volumeMl: v.volumeMl,
          sizeLabelEn: v.labelEn,
          sizeLabelAr: v.labelAr,
          costPrice: v.cost,
          price: v.price,
          compareAtPrice: v.compareAt,
          isDefault: v.isDefault,
          warehouse: "DXB-MAIN"
        },
        create: {
          productId: product.id,
          sku: v.sku,
          volume: v.volume,
          volumeMl: v.volumeMl,
          sizeLabelEn: v.labelEn,
          sizeLabelAr: v.labelAr,
          costPrice: v.cost,
          price: v.price,
          compareAtPrice: v.compareAt,
          isDefault: v.isDefault,
          warehouse: "DXB-MAIN"
        }
      });

      // Upsert Inventory
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {
          sealedQuantity: v.stock,
          testerQuantity: 5,
          reservedQuantity: 0
        },
        create: {
          variantId: variant.id,
          sealedQuantity: v.stock,
          testerQuantity: 5,
          reservedQuantity: 0
        }
      });
    }

    addedCount++;
    console.log(`[${addedCount}/${PRODUCTS_TO_ADD.length}] Seeded: ${product.nameEn} (${product.slug})`);
  }

  const finalCount = await prisma.product.count();
  console.log(`\n🎉 Total Products now in DB: ${finalCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

