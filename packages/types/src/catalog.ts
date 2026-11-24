import { z } from "zod/v3";

export const CurrencySchema = z.enum(["AED", "SAR", "USD", "QAR", "KWD", "OMR", "BHD"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const ConcentrationSchema = z.enum([
  "EXTRAIT_DE_PARFUM",
  "EAU_DE_PARFUM",
  "EAU_DE_TOILETTE",
  "EAU_DE_COLOGNE",
  "PARFUM_OIL",
  "ATTAR",
  "DISCOVERY_SET"
]);
export type Concentration = z.infer<typeof ConcentrationSchema>;

export const GenderCategorySchema = z.enum(["UNISEX", "MEN", "WOMEN"]);
export type GenderCategory = z.infer<typeof GenderCategorySchema>;

export const BrandTypeSchema = z.enum(["NICHE", "DESIGNER"]);
export type BrandType = z.infer<typeof BrandTypeSchema>;

export const NotePositionSchema = z.enum(["TOP", "HEART", "BASE"]);
export type NotePosition = z.infer<typeof NotePositionSchema>;

export const ProductRelationTypeSchema = z.enum([
  "SIMILAR",
  "COMPLEMENTARY_LAYERING",
  "FLANKER",
  "DISCOVERY_SAMPLE"
]);
export type ProductRelationType = z.infer<typeof ProductRelationTypeSchema>;

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  type: BrandTypeSchema,
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Brand = z.infer<typeof BrandSchema>;

export const ScentFamilySchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});
export type ScentFamily = z.infer<typeof ScentFamilySchema>;

export const AccordSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  colorHex: z.string().optional().nullable(),
});
export type Accord = z.infer<typeof AccordSchema>;

export const PerfumerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  bioEn: z.string().optional().nullable(),
  bioAr: z.string().optional().nullable(),
  portraitUrl: z.string().url().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
});
export type Perfumer = z.infer<typeof PerfumerSchema>;

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  heroImageUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const OccasionSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
});
export type Occasion = z.infer<typeof OccasionSchema>;

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
});
export type Season = z.infer<typeof SeasonSchema>;

export const TagSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  colorHex: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  productCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type Tag = z.infer<typeof TagSchema>;

export const ScentProfileSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  colorHex: z.string().optional().nullable(),
  isFeatured: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  productCount: z.number().int().nonnegative().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type ScentProfile = z.infer<typeof ScentProfileSchema>;

export const DEFAULT_SCENT_PROFILES: Array<Omit<ScentProfile, "id" | "createdAt" | "updatedAt">> = [
  {
    nameEn: "Fresh",
    nameAr: "منعش",
    slug: "fresh",
    descriptionEn: "Crisp, airy, and aquatic compositions featuring mineral ozonic accords, sea breezes, and invigorating clean notes.",
    descriptionAr: "توليفات هوائية ومائية نقية تنبض بالانتعاش البحري والنسمات الجبلية الصافية.",
    colorHex: "#0284c7",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    nameEn: "Citrus",
    nameAr: "حمضي",
    slug: "citrus",
    descriptionEn: "Radiant, zesty bursts of Calabrian bergamot, Sicilian lemon, bitter orange, and sun-drenched mandarin.",
    descriptionAr: "نفحات مشرقة وحيوية من البرغموت الإيطالي والليمون الصقلي واليوسفي المشمس.",
    colorHex: "#eab308",
    imageUrl: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    nameEn: "Floral",
    nameAr: "زهري",
    slug: "floral",
    descriptionEn: "Opulent bouquets of Taif rose, jasmine sambac, iris concrete, and exotic white blossoms.",
    descriptionAr: "باقات ساحرة من الورد الطائفي والياسمين والسوسن الملكي الفاخر.",
    colorHex: "#ec4899",
    imageUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 3,
  },
  {
    nameEn: "Fruity",
    nameAr: "فاكهي",
    slug: "fruity",
    descriptionEn: "Luscious, succulent accords of blackcurrant, dark plum, crisp pear, and ripe velvety figs.",
    descriptionAr: "توليفات شهية من الكشمش الأسود والخوخ والكمثرى والتين المخملي الناضج.",
    colorHex: "#f97316",
    imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 4,
  },
  {
    nameEn: "Woody",
    nameAr: "خشبي",
    slug: "woody",
    descriptionEn: "Noble structures of Mysore sandalwood, Atlas cedarwood, Haitian vetiver, and smoky cypress.",
    descriptionAr: "نفحات أصيلة من خشب الصندل وأرز الأطلس ونجيل الهند والسرور الدخاني.",
    colorHex: "#78350f",
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 5,
  },
  {
    nameEn: "Amber",
    nameAr: "عنبري",
    slug: "amber",
    descriptionEn: "Warm, golden resinous depths enriched with labdanum, benzoin, Madagascar vanilla, and frankincense.",
    descriptionAr: "دفء ذهبي غني بالراتنجات الطبيعية واللبان العماني والفانيليا البوربون الساحرة.",
    colorHex: "#d97706",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 6,
  },
  {
    nameEn: "Oud",
    nameAr: "عود",
    slug: "oud",
    descriptionEn: "Precious royal agarwood distilled from aged wild reserves across Cambodia, Assam, and Kalbar.",
    descriptionAr: "خلاصات دهن العود الملكي المعتق المستخرج من أندر الغابات في كمبوديا وآسام.",
    colorHex: "#451a03",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 7,
  },
  {
    nameEn: "Gourmand",
    nameAr: "جورماند",
    slug: "gourmand",
    descriptionEn: "Decadent dessert accords of toasted tonka bean, dark roasted cocoa, caramelized sugar, and rich praline.",
    descriptionAr: "نغمات عطرية غنية بحبوب التونكا المحمصة والكاكاو الداكن والكراميل الفاخر.",
    colorHex: "#a16207",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 8,
  },
  {
    nameEn: "Spicy",
    nameAr: "تابلي",
    slug: "spicy",
    descriptionEn: "Exotic aromatic heat composed of royal saffron, crushed cardamom, clove buds, and fiery pink pepper.",
    descriptionAr: "دفء عطري مثير يمزج بين الزعفران الأصيل والهيل والقرنفل والفلفل الوردي.",
    colorHex: "#dc2626",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 9,
  },
  {
    nameEn: "Aromatic",
    nameAr: "أروماتك",
    slug: "aromatic",
    descriptionEn: "Herbaceous vitality blending Mediterranean lavender, clary sage, wild rosemary, and green thyme.",
    descriptionAr: "حيوية عشبية مميزة تجمع الخزامى والمرمية وإكليل الجبل البري المنعش.",
    colorHex: "#059669",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 10,
  },
  {
    nameEn: "Musky",
    nameAr: "مسكي",
    slug: "musky",
    descriptionEn: "Silky, sensual clean white musk wrapped in soft cashmere woods and powdery velvet accords.",
    descriptionAr: "نعومة حسية حريرية من المسك الأبيض النقي وخشب الكشمير واللمسات البودرية.",
    colorHex: "#64748b",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 11,
  },
  {
    nameEn: "Leather",
    nameAr: "جلدي",
    slug: "leather",
    descriptionEn: "Sovereign saddle leather and smoky birch tar juxtaposed with supple suede and vintage accords.",
    descriptionAr: "فخامة الجلود الملكية وخشب البتولا الدخاني ممزوجة بالجلد المدبوغ واللمسات الكلاسيكية.",
    colorHex: "#292524",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    sortOrder: 12,
  },
];

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string().optional(),
  sku: z.string().min(1),
  volume: z.string().or(z.number()).default("100ml"),
  volumeMl: z.number().positive().optional(),
  sizeLabelEn: z.string().optional(),
  sizeLabelAr: z.string().optional(),
  costPrice: z.number().nonnegative().default(0).optional(),
  basePrice: z.number().positive().optional().nullable(),
  regularPrice: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  salePrice: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  isSampleVial: z.boolean().default(false),
  stock: z.number().int().nonnegative().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  warehouse: z.string().default("DXB-MAIN").optional(),
  isDefault: z.boolean().default(false),
  reservedQuantity: z.number().int().nonnegative().default(0).optional(),
  barcode: z.string().optional().nullable(),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductNoteRelationSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  noteId: z.string().uuid(),
  position: NotePositionSchema,
  prominence: z.number().int().min(1).max(10).default(5),
});
export type ProductNoteRelation = z.infer<typeof ProductNoteRelationSchema>;

export const ProductAccordRelationSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  accordId: z.string().uuid(),
  prominence: z.number().int().min(1).max(10).default(5),
});
export type ProductAccordRelation = z.infer<typeof ProductAccordRelationSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  taglineEn: z.string().optional().nullable(),
  taglineAr: z.string().optional().nullable(),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  brandId: z.string().uuid(),
  brand: BrandSchema.optional(),
  scentFamilyId: z.string().uuid().optional().nullable(),
  scentFamily: ScentFamilySchema.optional().nullable(),
  concentration: ConcentrationSchema,
  gender: GenderCategorySchema,
  releaseYear: z.number().int().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  sillage: z.string().optional().nullable(),
  longevity: z.string().optional().nullable(),
  styleCharacter: z.string().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  ratingAverage: z.number().min(0).max(5).default(5.0),
  ratingCount: z.number().int().nonnegative().default(0),
  variants: z.array(ProductVariantSchema).default([]),
  notes: z.array(ProductNoteRelationSchema).default([]),
  accords: z.array(ProductAccordRelationSchema).default([]),
  tags: z.array(TagSchema).default([]),
  scentProfiles: z.array(ScentProfileSchema).default([]),
  scentProfileIds: z.array(z.string()).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductFilterSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  scentProfile: z.string().optional(),
  profile: z.string().optional(),
  brandSlug: z.string().optional(),
  brandType: BrandTypeSchema.optional(),
  family: z.string().optional(),
  scentFamilySlug: z.string().optional(),
  gender: GenderCategorySchema.optional(),
  concentration: ConcentrationSchema.optional(),
  note: z.string().optional(),
  noteSlug: z.string().optional(),
  accord: z.string().optional(),
  accordSlug: z.string().optional(),
  tag: z.string().optional(),
  tagSlug: z.string().optional(),
  collection: z.string().optional(),
  collectionSlug: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "rating", "featured"]).default("featured"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

