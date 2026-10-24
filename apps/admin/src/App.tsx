import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Warehouse,
  RotateCcw,
  Star,
  Globe,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
  Save,
  CheckCircle2,
  Search,
  ExternalLink,
  Award,
  FileSpreadsheet,
  Download,
  Edit3,
} from "lucide-react";
import {
  BrandItem,
  NoteItem,
  ProductItem,
  slugify,
  generateProductMetaTitle,
  generateProductMetaDescription,
  PRO_SEO_CSV_TEMPLATE,
} from "./seo-utils";
import { BulkCsvModal } from "./components/BulkCsvModal";
import { BrandModal } from "./components/BrandModal";
import { NoteModal } from "./components/NoteModal";

type AdminTab =
  | "dashboard"
  | "products"
  | "brands"
  | "notes"
  | "inventory"
  | "purchasing"
  | "returns"
  | "reviews"
  | "markets"
  | "orders"
  | "banners"
  | "settings"
  | "audit";

const TAB_TITLES: Record<AdminTab, string> = {
  dashboard: "Dashboard",
  products: "Products",
  brands: "Brands",
  notes: "Notes",
  inventory: "Inventory",
  purchasing: "Purchasing",
  returns: "Returns",
  orders: "Orders",
  reviews: "Reviews",
  markets: "Markets",
  banners: "Banners",
  settings: "Settings",
  audit: "Audit Log",
};

const TAB_SUBTITLES: Record<AdminTab, string> = {
  dashboard: "Store operations, inventory, and order activity",
  products: "Manage catalog products, pricing, and stock",
  brands: "Manage perfume brands and brand profiles",
  notes: "Manage scent notes and fragrance notes pyramid",
  inventory: "Warehouse locations and stock allocation",
  purchasing: "Supplier purchase orders and incoming stock",
  returns: "Customer returns and product inspection",
  orders: "Customer orders and fulfillment status",
  reviews: "Moderate customer product ratings and reviews",
  markets: "GCC countries, currencies, and VAT rates",
  banners: "Homepage hero sliders, promos, and announcements",
  settings: "Social media links, contact info, and store settings",
  audit: "System security log and admin user activity",
};

type BannerSlot = "HERO_SLIDER" | "CAMPAIGN_MID" | "PROMO_STRIP" | "ANNOUNCEMENT_BAR";

interface BannerItem {
  id: string;
  slot: BannerSlot;
  eyebrowEn: string;
  eyebrowAr: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  ctaTextEn: string;
  ctaTextAr: string;
  ctaUrl: string;
  secondaryCtaTextEn: string;
  secondaryCtaTextAr: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  mobileImageUrl: string;
  overlayLabelEn: string;
  overlayLabelAr: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

interface HomepageSectionItem {
  id: string;
  sectionType: string;
  titleEn: string;
  titleAr: string;
  sortOrder: number;
  isVisible: boolean;
}

interface AuditLogItem {
  action: string;
  res: string;
  user: string;
  time: string;
}

interface StoreSettings {
  instagramUrl: string;
  instagramHandle: string;
  whatsappPhone: string;
  whatsappNumber: string;
  whatsappDefaultMsg: string;
  tiktokUrl: string;
  tiktokHandle: string;
  twitterUrl: string;
  twitterHandle: string;
  youtubeUrl: string;
  conciergeEmail: string;
  conciergePhone: string;
  announcementBarEn: string;
  announcementBarAr: string;
  freeShippingThreshold: number;
}

const SLOT_LABELS: Record<BannerSlot, string> = {
  HERO_SLIDER: "Hero Slider",
  CAMPAIGN_MID: "Campaign Mid-Page",
  PROMO_STRIP: "Promo Strip",
  ANNOUNCEMENT_BAR: "Announcement Bar",
};

const SLOT_COLORS: Record<BannerSlot, string> = {
  HERO_SLIDER: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  CAMPAIGN_MID: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  PROMO_STRIP: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  ANNOUNCEMENT_BAR: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
};

const SECTION_LABELS: Record<string, string> = {
  HERO_BANNER: "Hero Campaign Banner",
  DISCOVERY_STRIP: "Quick Discovery Strip",
  FEATURED_PRODUCTS: "Signature Selection Grid",
  HOUSES_GRID: "Prestige Houses",
  NOTES_GRID: "Scent Notes Explorer",
  DISCOVERY_SETS: "Discovery Sets Feature",
  JOURNAL_FEATURE: "Muschio Journal",
  TRUST_INDICATORS: "Service Guarantees",
  CUSTOM_BANNER: "Custom Campaign Banner",
};

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(`muschio_admin_${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`muschio_admin_${key}`, JSON.stringify(state));
    } catch (err) {
      console.warn(`Failed to persist muschio_admin_${key}`, err);
    }
  }, [key, state]);

  return [state, setState];
}

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // 1. PRODUCTS (PRO SEO ENHANCED)
  const [products, setProducts] = usePersistentState<ProductItem[]>("products", [
    {
      id: "p1",
      sku: "AMO-INT53-100",
      name: "Interlude 53 Man Extrait de Parfum",
      nameAr: "إنترلود 53 إكستريت دي بارفان",
      slug: "amouage-interlude-53-man-extrait",
      brand: "Amouage",
      brandSlug: "amouage",
      scentFamily: "Woody Amber",
      concentration: "EXTRAIT_DE_PARFUM",
      gender: "MEN",
      volumeMl: 100,
      price: "1,850 AED",
      costPrice: "950 AED",
      stock: 28,
      testerStock: 5,
      reserved: 2,
      warehouse: "DXB-MAIN",
      topNotes: ["Oregano", "Pimento Berry", "Bergamot"],
      heartNotes: ["Amber", "Frankincense", "Cistus", "Opoponax"],
      baseNotes: ["Leather", "Agarwood Smoke", "Patchouli", "Sandalwood"],
      taglineEn: "The Monumental Expression of Spicy Smoky Amber",
      taglineAr: "التعبير المهيب عن العنبر الدخاني الحار",
      descriptionEn: "Formulated at a monumental 53% concentration and aged for six months in Oman.",
      descriptionAr: "بتركيز أسطوري يبلغ 53% ومعتق لمدة ستة أشهر في عُمان.",
      metaTitle: "Interlude 53 Man Extrait by Amouage | Authentic Luxury Fragrance UAE",
      metaDescription: "Shop authentic Interlude 53 Man Extrait by Amouage (53% Extrait) at Muschio. Opening with oregano and pimento.",
      imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
      imageAlt: "Amouage Interlude 53 Man Extrait luxury flacon",
      status: "PUBLISHED",
    },
    {
      id: "p2",
      sku: "MFK-BR540E-70",
      name: "Baccarat Rouge 540 Extrait",
      nameAr: "باكارات روج 540 إكستريت",
      slug: "mfk-baccarat-rouge-540-extrait",
      brand: "Maison Francis Kurkdjian",
      brandSlug: "maison-francis-kurkdjian",
      scentFamily: "Amber Floral",
      concentration: "EXTRAIT_DE_PARFUM",
      gender: "UNISEX",
      volumeMl: 70,
      price: "1,650 AED",
      costPrice: "820 AED",
      stock: 34,
      testerStock: 4,
      reserved: 1,
      warehouse: "DXB-MAIN",
      topNotes: ["Bitter Almond", "Saffron"],
      heartNotes: ["Egyptian Jasmine Grandiflorum", "Cedarwood"],
      baseNotes: ["Ambergris", "Woody Musk"],
      taglineEn: "Luminous Amber Crystal and Floral Radiance",
      taglineAr: "إشراقة الكريستال العنبري والزهور الساحرة",
      descriptionEn: "Augments the strength and radiance of the perfume's amber woody floral aura.",
      descriptionAr: "يعزز هذا الإصدار الاستثنائي قوة وإشراقة النفحات الخشبية العنبرية والزهرية.",
      metaTitle: "Baccarat Rouge 540 Extrait by MFK | Authentic UAE",
      metaDescription: "Shop authentic Baccarat Rouge 540 Extrait by Maison Francis Kurkdjian at Muschio. 100% genuine guaranteed.",
      imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      imageAlt: "Baccarat Rouge 540 Extrait flacon",
      status: "PUBLISHED",
    },
    {
      id: "p3",
      sku: "ROJA-ELY-100",
      name: "Elysium Pour Homme Parfum",
      nameAr: "إليسيوم بور أوم بارفان",
      slug: "roja-elysium-pour-homme-parfum",
      brand: "Roja Parfums",
      brandSlug: "roja-parfums",
      scentFamily: "Fresh Aromatic Citrus",
      concentration: "PARFUM",
      gender: "MEN",
      volumeMl: 100,
      price: "1,950 AED",
      costPrice: "980 AED",
      stock: 25,
      testerStock: 2,
      reserved: 0,
      warehouse: "RUH-HUB",
      topNotes: ["Grapefruit", "Lemon", "Bergamot", "Lime"],
      heartNotes: ["Lily of the Valley", "Rose de Mai", "Jasmin de Grasse", "Apple"],
      baseNotes: ["Galbanum", "Pink Pepper", "Cypriol", "Vetiver", "Cedarwood", "Ambergris"],
      taglineEn: "Heroic Elysian Freshness and Royal Musk",
      taglineAr: "الانتعاش الأسطوري والمسك الملكي",
      descriptionEn: "An ultra-fresh citrus blend enriched by an opulent base of ambergris and cedar.",
      descriptionAr: "مزيج منعش وفائق الفخامة من الحمضيات النادرة مع قاعدة ثرية من العنبر وخشب الأرز.",
      metaTitle: "Elysium Pour Homme Parfum by Roja Parfums | UAE GCC",
      metaDescription: "Shop authentic Elysium Pour Homme Parfum by Roja Parfums at Muschio with fast GCC delivery.",
      imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85",
      imageAlt: "Roja Parfums Elysium luxury flacon",
      status: "PUBLISHED",
    },
    {
      id: "p4",
      sku: "XER-ALEX2-100",
      name: "Alexandria II Eau de Parfum",
      nameAr: "ألكسندريا 2 أو دي بارفان",
      slug: "xerjoff-alexandria-ii-eau-de-parfum",
      brand: "Xerjoff",
      brandSlug: "xerjoff",
      scentFamily: "Woody Amber Oud",
      concentration: "EAU_DE_PARFUM",
      gender: "UNISEX",
      volumeMl: 100,
      price: "2,200 AED",
      costPrice: "1,100 AED",
      stock: 19,
      testerStock: 3,
      reserved: 0,
      warehouse: "DXB-MAIN",
      topNotes: ["Apple", "Cinnamon", "Rosewood", "Lavender"],
      heartNotes: ["Cedarwood", "Lily of the Valley", "Bulgarian Rose"],
      baseNotes: ["Amber", "Sandalwood", "Musk", "Vanilla", "Laotian Oud"],
      taglineEn: "Aristocratic Laotian Oud and Cinnamon Majesty",
      taglineAr: "فخامة العود اللاوسي والقرفة الملكية",
      descriptionEn: "Alexandria II by Xerjoff is an olfactory legend wrapped in rare Laotian agarwood.",
      descriptionAr: "ألكسندريا 2 من زيرجوف أسطورة عطرية يمتزج فيها العود اللاوسي النادر مع نفحات الورد والقرفة.",
      metaTitle: "Alexandria II by Xerjoff | Authentic Luxury Fragrance UAE",
      metaDescription: "Shop authentic Alexandria II by Xerjoff at Muschio. Rare Laotian Oud and Bulgarian Rose.",
      imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      imageAlt: "Xerjoff Alexandria II luxury flacon",
      status: "PUBLISHED",
    },
  ]);

  const [productSearch, setProductSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    nameAr: "",
    brand: "Amouage",
    scentFamily: "Woody Amber",
    concentration: "EXTRAIT_DE_PARFUM",
    price: "",
    stock: 20,
    testerStock: 2,
    warehouse: "DXB-MAIN",
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
    status: "PUBLISHED" as const,
  });

  // 2. BRANDS & PRESTIGE MAISONS (PRO SEO)
  const [brands, setBrands] = usePersistentState<BrandItem[]>("brands", [
    {
      id: "b1",
      name: "Amouage",
      slug: "amouage",
      type: "NICHE",
      countryEn: "Sultanate of Oman",
      countryAr: "سلطنة عُمان",
      year: 1983,
      perfumer: "Pierre Negrin, Renaud Salmon, Karine Vinchon",
      storyEn:
        "Established in 1983 in the Sultanate of Oman at the request of the Royal Family, Amouage is revered as 'The Gift of Kings'. The house defines royal Arabian haute parfumerie by fusing precious Omani Silver Frankincense, wild rock rose, and aged Cambodian agarwood at monumental concentrations.",
      storyAr:
        "تأسست عام 1983 في سلطنة عُمان بطلب ملكي سامٍ، وتُعرف دار أمواج بلقب 'هدية الملوك'. تعيد الدار صياغة الفخامة العطرية الملكية بدمج اللبان الحوجري الفضي النادر والورد الجبلي وخشب العود المعتق بتراكيز أسطورية.",
      metaTitle: "Amouage Fragrances & Extraits | Authentic Royal Omani Perfumery",
      metaDescription:
        "Discover authentic royal flacons from Amouage (Sultanate of Oman). Hand-curated extraits, Silver Frankincense, and aged attars at Muschio.",
      perfumesCount: 4,
    },
    {
      id: "b2",
      name: "Maison Francis Kurkdjian",
      slug: "maison-francis-kurkdjian",
      type: "NICHE",
      countryEn: "Paris, France",
      countryAr: "باريس، فرنسا",
      year: 2009,
      perfumer: "Francis Kurkdjian",
      storyEn:
        "Co-founded in 2009 by master perfumer Francis Kurkdjian, the Maison envisions a contemporary luxury fragrance wardrobe celebrating French elegance, crystalline amber accords, and monumental sillage.",
      storyAr:
        "تأسست عام 2009 على يد العطار البارع فرانسيس كوركدجيان، وتجسد الدار مفهوم الخزانة العطرية الفرنسية المعاصرة الجامعة بين الأناقة والانتشار المهيب.",
      metaTitle: "Maison Francis Kurkdjian | Authentic French Haute Parfumerie UAE",
      metaDescription:
        "Shop authentic Baccarat Rouge 540 and Grand Soir extraits by Maison Francis Kurkdjian at Muschio. 100% verified genuine with GCC express shipping.",
      perfumesCount: 3,
    },
    {
      id: "b3",
      name: "Roja Parfums",
      slug: "roja-parfums",
      type: "NICHE",
      countryEn: "United Kingdom",
      countryAr: "المملكة المتحدة",
      year: 2011,
      perfumer: "Roja Dove",
      storyEn:
        "Crafted by the world's most respected perfumer, Roja Dove, Roja Parfums uses only the rarest raw materials on earth to sculpt fragrances of uncompromising opulence.",
      storyAr:
        "ابتكرها العطار العالمي روجا دوف باستخدام أندر المواد الأولية على وجه الأرض لصياغة عطور فائقة الفخامة.",
      metaTitle: "Roja Parfums | Haute Luxe & Elysium Extrait Parfums UAE",
      metaDescription:
        "Explore Roja Parfums by Roja Dove at Muschio. Uncompromising luxury flacons with complimentary white-glove GCC delivery.",
      perfumesCount: 2,
    },
    {
      id: "b4",
      name: "Xerjoff",
      slug: "xerjoff",
      type: "NICHE",
      countryEn: "Turin, Italy",
      countryAr: "تورينو، إيطاليا",
      year: 2003,
      perfumer: "Sergio Momo, Christian Carbonnel",
      storyEn:
        "Founded in Turin, Xerjoff merges ancient Italian artistry with the most decadent oriental essences, hand-carved quartz bottles, and certified meteorites.",
      storyAr:
        "تأسست في تورينو بإيطاليا، وتمزج زيرجوف بين الحرفية الإيطالية العريقة وأرقى الخلاصات الشرقية والعود الطبيعي النادر.",
      metaTitle: "Xerjoff Perfumes | Alexandria II & Shooting Stars UAE",
      metaDescription:
        "Discover Xerjoff Italian haute parfumerie at Muschio. Featuring Alexandria II and Oud Stars collections with white-glove GCC shipping.",
      perfumesCount: 2,
    },
    {
      id: "b5",
      name: "Tom Ford",
      slug: "tom-ford",
      type: "DESIGNER",
      countryEn: "USA",
      countryAr: "الولايات المتحدة",
      year: 2006,
      perfumer: "Various Master Noses",
      storyEn:
        "Tom Ford Private Blend represents the artisan perfumer's private laboratory, crafting provocative and timeless scent architectures.",
      storyAr:
        "يمثل خط توم فورد برايفت بليند المختبر الإبداعي لصياغة أجرأ وأرقى العطور العالمية الأيقونية.",
      metaTitle: "Tom Ford Private Blend | Authentic Fragrances UAE",
      metaDescription:
        "Explore Tom Ford Private Blend fragrances at Muschio with authentic verified provenance and GCC shipping.",
      perfumesCount: 1,
    },
    {
      id: "b6",
      name: "Clive Christian",
      slug: "clive-christian",
      type: "NICHE",
      countryEn: "United Kingdom",
      countryAr: "المملكة المتحدة",
      year: 1872,
      perfumer: "Crown Perfumery Artisans",
      storyEn:
        "The heir to the Crown Perfumery established in 1872, Clive Christian crafts the world's most concentrated royal perfumes with Queen Victoria's royal crown crest.",
      storyAr:
        "وريث دار كراون العريقة لعام 1872، تقدم كلايف كريستيان أرقى العطور بتراكيز فائقة وشعار التاج الملكي المعتمد من الملكة فيكتوريا.",
      metaTitle: "Clive Christian Perfumes | The World's Finest Perfumery UAE",
      metaDescription:
        "Shop Clive Christian pure perfume extraits at Muschio. Guaranteed royal provenance with luxury GCC shipping.",
      perfumesCount: 1,
    },
  ]);

  const [brandSearch, setBrandSearch] = useState("");
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<BrandItem | null>(null);

  // 3. SCENT NOTES (PRO SEO)
  const [notes, setNotes] = usePersistentState<NoteItem[]>("notes", [
    {
      id: "n1",
      nameEn: "Royal Taif Rose",
      nameAr: "ورد الطائف الملكي",
      slug: "taif-rose",
      family: "Floral",
      originEn: "Taif Mountains, Saudi Arabia",
      originAr: "جبال الطائف، السعودية",
      descriptionEn:
        "Harvested at dawn in the high-altitude mountains of Saudi Arabia, celebrated for its honeyed, intensely deep, and regal floral aroma.",
      descriptionAr:
        "يُحصد عند بزوغ الفجر في أعالي جبال الطائف بالمملكة العربية السعودية، ويشتهر بنفحاته العسلية الغنية وأريجه الزهري الملكي الفواح.",
      metaTitle: "Royal Taif Rose Essence | Luxury Scent Notes Guide",
      metaDescription:
        "Explore luxury perfumes composed with Royal Taif Rose harvested from the mountains of Saudi Arabia at Muschio.",
      status: "PUBLISHED",
      perfumesCount: 4,
    },
    {
      id: "n2",
      nameEn: "Silver Frankincense",
      nameAr: "اللبان الحوجري الفضي",
      slug: "silver-frankincense",
      family: "Resin",
      originEn: "Dhofar, Sultanate of Oman",
      originAr: "ظفار، سلطنة عُمان",
      descriptionEn:
        "The world's highest grade of Boswellia sacra harvested from the arid cliffs of Dhofar, exuding a luminous balsamic, citrus-peel, and sacred resinous warmth.",
      descriptionAr:
        "أندر وأجود أنواع اللبان الحوجري العُماني المنحدر من جبال ظفار، بنفحات بلسمية حمضية مقدسة.",
      metaTitle: "Omani Silver Frankincense Essence | Muschio Scent Notes",
      metaDescription:
        "Discover luxury perfumes featuring sacred Omani Silver Frankincense from Dhofar. 100% genuine niche extraits at Muschio.",
      status: "PUBLISHED",
      perfumesCount: 3,
    },
    {
      id: "n3",
      nameEn: "Cambodian Agarwood (Oud)",
      nameAr: "دهن عود كمبودي",
      slug: "cambodian-oud",
      family: "Woody",
      originEn: "Koh Kong, Cambodia",
      originAr: "كوه كونغ، كمبوديا",
      descriptionEn:
        "Rare wild-harvested agarwood oil aged for decades, delivering deep animalic leather, sweet dried fruits, and royal smoky resonance.",
      descriptionAr:
        "دهن عود كمبودي بري معتق، يتميز بنفحاته العميقة من الجلود والفاكهة المجففة والعمق الخشبي الدخاني.",
      metaTitle: "Cambodian Oud (Agarwood) | Pure Niche Fragrance Guide",
      metaDescription:
        "Explore fine perfumes featuring aged Cambodian Oud at Muschio. Pure artisanal distillation and royal provenance guaranteed.",
      status: "PUBLISHED",
      perfumesCount: 5,
    },
    {
      id: "n4",
      nameEn: "Florentine Iris",
      nameAr: "سوسن فلورنسا",
      slug: "florentine-iris",
      family: "Powdery",
      originEn: "Tuscany, Italy",
      originAr: "توسكانا، إيطاليا",
      descriptionEn:
        "Extracted from Iris pallida rhizomes aged for three years in Tuscany, Iris butter is one of perfumery's most precious materials, radiating noble powdery violet sophistication.",
      descriptionAr:
        "يُستخلص من جذامير السوسن الإيطالي المعتقة لثلاث سنوات في توسكانا، ويعد من أغلى المواد العطرية بنفحات بودرية أرستقراطية.",
      metaTitle: "Florentine Iris Butter Note | Haute Parfumerie Encyclopedia",
      metaDescription:
        "Discover aristocratic perfumes formulated with precious Florentine Iris butter from Tuscany at Muschio.",
      status: "PUBLISHED",
      perfumesCount: 3,
    },
    {
      id: "n5",
      nameEn: "Golden Ambergris",
      nameAr: "العنبر الأشهب",
      slug: "golden-ambergris",
      family: "Amber",
      originEn: "Arabian Sea Coastlines",
      originAr: "سواحل بحر العرب",
      descriptionEn:
        "Naturally cured by sun and saltwater for decades, ocean-drifted ambergris provides unmatched crystalline radiance, oceanic warmth, and legendary sillage fixative power.",
      descriptionAr:
        "عنبر أشهب طبيعي معتق بأشعة الشمس وأمواج المحيط، يمنح العطور انتشاراً وثباتاً أسطورياً وإشراقة ساحلية ساحرة.",
      metaTitle: "Golden Ambergris Essence | Royal Arabian Scent Notes",
      metaDescription:
        "Explore extraits crafted with ocean-cured golden ambergris at Muschio. Legendary fixative power and crystalline warmth.",
      status: "PUBLISHED",
      perfumesCount: 4,
    },
  ]);

  const [noteSearch, setNoteSearch] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);

  // 3. ORDERS
  const [orders, setOrders] = usePersistentState("orders", [
    {
      id: "ord-1",
      number: "MSC-2026-981245",
      customer: "H.E. Sultan Al-Nuaimi",
      amount: "1,850 AED",
      method: "TABBY (4x)",
      status: "PAID",
      market: "AE",
      date: "Today, 14:32",
    },
    {
      id: "ord-2",
      number: "MSC-2026-981244",
      customer: "Fatima Al-Zahra",
      amount: "3,500 AED",
      method: "APPLE_PAY",
      status: "FULFILLING",
      market: "AE",
      date: "Today, 12:15",
    },
    {
      id: "ord-3",
      number: "MSC-2026-981240",
      customer: "Rashid Mansoor",
      amount: "2,200 SAR",
      method: "TAMARA (4x)",
      status: "SHIPPED",
      market: "SA",
      date: "Yesterday",
    },
  ]);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderMarketFilter, setOrderMarketFilter] = useState("ALL");

  // 4. RETURNS
  const [returns, setReturns] = usePersistentState("returns", [
    {
      id: "ret-1",
      number: "RET-2026-001",
      customer: "Ahmad Al-Ghamdi",
      item: "AMO-INT53-100 (Interlude 53)",
      reason: "Ordered Extrait by mistake, wanted EDP",
      condition: "PRISTINE_SEALED",
      disposition: "RESTOCK_SELLABLE",
      status: "INSPECTING",
    },
    {
      id: "ret-2",
      number: "RET-2026-002",
      customer: "Leila H.",
      item: "MFK-BR540E-70 (Baccarat Rouge 540)",
      reason: "Sprayed once on wrist",
      condition: "OPENED_SPRAYED",
      disposition: "ALLOCATE_TESTER",
      status: "INSPECTING",
    },
  ]);

  // 5. REVIEWS
  const [reviews, setReviews] = usePersistentState("reviews", [
    {
      id: "rev-1",
      product: "Interlude 53 Man Extrait",
      customer: "Ahmad Al Maktoum",
      rating: 5,
      longevity: 5,
      sillage: 5,
      title: "The True Definition of Omani Royalty",
      verified: true,
      status: "APPROVED",
    },
    {
      id: "rev-2",
      product: "Baccarat Rouge 540 Extrait",
      customer: "Nasser Al-Qasimi",
      rating: 5,
      longevity: 5,
      sillage: 4,
      title: "Addictive and crystalline sillage",
      verified: true,
      status: "PENDING",
    },
  ]);

  // 6. BANNERS
  const [banners, setBanners] = usePersistentState<BannerItem[]>("banners", [
    {
      id: "bnr-1",
      slot: "HERO_SLIDER",
      eyebrowEn: "HAUTE PARFUMERIE · ARABIAN GULF",
      eyebrowAr: "دار العطور الراقية · الخليج العربي",
      titleEn: "The Art of | Noble Sillage.",
      titleAr: "فن | الحضور المهيب.",
      subtitleEn: "Curating the world's most formidable extraits de parfum, aged attars, and raw olfactory essences for the connoisseurs of the Gulf.",
      subtitleAr: "ننتقي أرقى خلاصات العطور العالمية المعتقة والزيوت النادرة لعشاق العطور الراقية في الخليج العربي.",
      ctaTextEn: "Shop the Collection",
      ctaTextAr: "تسوق المجموعة",
      ctaUrl: "/shop",
      secondaryCtaTextEn: "AI Sommelier",
      secondaryCtaTextAr: "مستشار العطور",
      secondaryCtaUrl: "/discover/ai",
      imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1400&q=85",
      mobileImageUrl: "",
      overlayLabelEn: "MUSCHIO SELECTION / 2026",
      overlayLabelAr: "مختارات موسكيو / ٢٠٢٦",
      sortOrder: 0,
      isActive: true,
      startsAt: "2026-01-01T00:00",
      endsAt: "2026-12-31T23:59",
    },
    {
      id: "bnr-2",
      slot: "HERO_SLIDER",
      eyebrowEn: "ROYAL HARVEST 2026",
      eyebrowAr: "المحصول الملكي ٢٠٢٦",
      titleEn: "Omani Frankincense | & Taif Rose.",
      titleAr: "لبان حوجري | وورد الطائف.",
      subtitleEn: "A limited allocation of high-altitude harvested essences direct from Dhofar and the mountains of Taif.",
      subtitleAr: "محصول محدود ونادر من خلاصات جبال الطائف وأشجار اللبان الحوجري بظفار.",
      ctaTextEn: "Explore Scent Notes",
      ctaTextAr: "استكشف النوتات",
      ctaUrl: "/notes",
      secondaryCtaTextEn: "View Houses",
      secondaryCtaTextAr: "عرض الدور",
      secondaryCtaUrl: "/brands",
      imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=85",
      mobileImageUrl: "",
      overlayLabelEn: "HARVEST ARCHIVE / LIMITED",
      overlayLabelAr: "أرشيف المحصول / حصري",
      sortOrder: 1,
      isActive: true,
      startsAt: "2026-02-18T00:00",
      endsAt: "2026-03-20T23:59",
    },
  ]);

  // 7. HOMEPAGE SECTIONS
  const [sections, setSections] = usePersistentState<HomepageSectionItem[]>("sections", [
    { id: "sec-1", sectionType: "HERO_BANNER", titleEn: "Campaign Hero", titleAr: "البانر الرئيسي", sortOrder: 0, isVisible: true },
    { id: "sec-2", sectionType: "DISCOVERY_STRIP", titleEn: "Quick Discovery Strip", titleAr: "شريط الاكتشاف السريع", sortOrder: 1, isVisible: true },
    { id: "sec-3", sectionType: "FEATURED_PRODUCTS", titleEn: "Signature Selection", titleAr: "المختارات المميزة", sortOrder: 2, isVisible: true },
    { id: "sec-4", sectionType: "HOUSES_GRID", titleEn: "Prestige Houses", titleAr: "دور العطور", sortOrder: 3, isVisible: true },
    { id: "sec-5", sectionType: "NOTES_GRID", titleEn: "Scent Notes", titleAr: "نوتات العطر", sortOrder: 4, isVisible: true },
    { id: "sec-6", sectionType: "DISCOVERY_SETS", titleEn: "Discovery Sets", titleAr: "مجموعات العينات", sortOrder: 5, isVisible: true },
    { id: "sec-7", sectionType: "JOURNAL_FEATURE", titleEn: "Muschio Journal", titleAr: "مجلة موسكيو", sortOrder: 6, isVisible: true },
    { id: "sec-8", sectionType: "TRUST_INDICATORS", titleEn: "Service Guarantees", titleAr: "ضمانات الخدمة", sortOrder: 7, isVisible: true },
  ]);

  // 8. SOCIAL & STOREFRONT SETTINGS
  const [storeSettings, setStoreSettings] = usePersistentState<StoreSettings>("settings", {
    instagramUrl: "https://www.instagram.com/muschio.parfums",
    instagramHandle: "@muschio.parfums",
    whatsappPhone: "+971 4 800 MUSCHIO",
    whatsappNumber: "97148006872",
    whatsappDefaultMsg: "Hello Muschio Concierge, I would like assistance with a fragrance recommendation.",
    tiktokUrl: "https://www.tiktok.com/@muschio.haute",
    tiktokHandle: "@muschio.haute",
    twitterUrl: "https://twitter.com/muschio_haute",
    twitterHandle: "@muschio_haute",
    youtubeUrl: "https://www.youtube.com/@muschiohaute",
    conciergeEmail: "concierge@muschio.luxury",
    conciergePhone: "+971 4 800 MUSCHIO",
    announcementBarEn: "COMPLIMENTARY WHITE-GLOVE GCC DELIVERY ON ORDERS OVER 500 AED · 100% AUTHENTIC MAISON FLACONS",
    announcementBarAr: "توصيل فاخر مجاني لكافة دول الخليج للطلبات فوق 500 درهم · عطور أصلية ومضمونة 100%",
    freeShippingThreshold: 500,
  });

  const [settingsFeedback, setSettingsFeedback] = useState("");

  // 9. AUDIT LOGS
  const [auditLogs, setAuditLogs] = usePersistentState<AuditLogItem[]>("audit", [
    { action: "SETTINGS_UPDATED", res: "SOCIAL_LINKS Instagram & WhatsApp", user: "superadmin@muschio.luxury", time: "16:40:12" },
    { action: "INVENTORY_RESERVATION_CREATED", res: "ORDER #MSC-2026-981245", user: "system (checkout)", time: "14:32:01" },
    { action: "WEBHOOK_PAYMENT_CAPTURED", res: "TABBY #tabby_sess_9812", user: "webhook-service", time: "14:32:45" },
    { action: "ORDER_STATUS_TRANSITION_PAID", res: "ORDER #MSC-2026-981245", user: "system", time: "14:32:46" },
    { action: "BANNER_CREATED", res: "HERO_SLIDER bnr-1", user: "superadmin@muschio.luxury", time: "10:15:32" },
  ]);

  const addAuditLog = (action: string, res: string) => {
    const time = new Date().toLocaleTimeString();
    setAuditLogs((prev) => [{ action, res, user: "superadmin@muschio.luxury", time }, ...prev.slice(0, 49)]);
  };

  // Banner form state
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    slot: "HERO_SLIDER" as BannerSlot,
    eyebrowEn: "",
    eyebrowAr: "",
    titleEn: "",
    titleAr: "",
    subtitleEn: "",
    subtitleAr: "",
    ctaTextEn: "",
    ctaTextAr: "",
    ctaUrl: "",
    secondaryCtaTextEn: "",
    secondaryCtaTextAr: "",
    secondaryCtaUrl: "",
    imageUrl: "",
    mobileImageUrl: "",
    overlayLabelEn: "",
    overlayLabelAr: "",
    startsAt: "",
    endsAt: "",
  });

  const resetBannerForm = () => {
    setBannerForm({
      slot: "HERO_SLIDER", eyebrowEn: "", eyebrowAr: "", titleEn: "", titleAr: "",
      subtitleEn: "", subtitleAr: "", ctaTextEn: "", ctaTextAr: "", ctaUrl: "",
      secondaryCtaTextEn: "", secondaryCtaTextAr: "", secondaryCtaUrl: "",
      imageUrl: "", mobileImageUrl: "", overlayLabelEn: "", overlayLabelAr: "",
      startsAt: "", endsAt: "",
    });
    setEditingBanner(null);
    setShowBannerForm(false);
  };

  const handleSaveBanner = () => {
    if (!bannerForm.titleEn || !bannerForm.titleAr || !bannerForm.imageUrl) return;
    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) => (b.id === editingBanner.id ? { ...b, ...bannerForm } : b))
      );
      addAuditLog("BANNER_UPDATED", `${bannerForm.slot} ${editingBanner.id}`);
    } else {
      const newBanner: BannerItem = {
        id: `bnr-${Date.now()}`,
        ...bannerForm,
        sortOrder: banners.filter((b) => b.slot === bannerForm.slot).length,
        isActive: true,
      };
      setBanners((prev) => [...prev, newBanner]);
      addAuditLog("BANNER_CREATED", `${bannerForm.slot} ${newBanner.id}`);
    }
    resetBannerForm();
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    addAuditLog("BANNER_TOGGLE", `Banner ${id}`);
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    addAuditLog("BANNER_DELETED", `Banner ${id}`);
  };

  // Section ordering with non-undefined array items
  const moveSectionUp = (idx: number) => {
    if (idx === 0) return;
    setSections((prev) => {
      const next = [...prev];
      const current = next[idx];
      const previous = next[idx - 1];
      if (current && previous) {
        next[idx - 1] = current;
        next[idx] = previous;
      }
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
    addAuditLog("HOMEPAGE_SECTION_REORDER", `Section index ${idx} moved up`);
  };

  const moveSectionDown = (idx: number) => {
    setSections((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      const current = next[idx];
      const nextItem = next[idx + 1];
      if (current && nextItem) {
        next[idx] = nextItem;
        next[idx + 1] = current;
      }
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
    addAuditLog("HOMEPAGE_SECTION_REORDER", `Section index ${idx} moved down`);
  };

  const toggleSectionVisible = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
    addAuditLog("HOMEPAGE_SECTION_VISIBILITY", `Section ${id}`);
  };

  // Product Actions
  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.sku) return;
    const priceFormatted = productForm.price.includes("AED") ? productForm.price : `${productForm.price} AED`;
    const prodSlug = slugify(`${productForm.brand}-${productForm.name}`);
    const topNotesArr = productForm.topNotes ? productForm.topNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const heartNotesArr = productForm.heartNotes ? productForm.heartNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const baseNotesArr = productForm.baseNotes ? productForm.baseNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const newP: ProductItem = {
      id: `p-${Date.now()}`,
      sku: productForm.sku,
      name: productForm.name,
      nameAr: productForm.nameAr || productForm.name,
      slug: prodSlug,
      brand: productForm.brand,
      brandSlug: slugify(productForm.brand),
      scentFamily: productForm.scentFamily || "Woody Amber",
      concentration: productForm.concentration || "EXTRAIT_DE_PARFUM",
      gender: "UNISEX",
      volumeMl: 100,
      price: priceFormatted,
      costPrice: "0 AED",
      stock: Number(productForm.stock) || 0,
      testerStock: Number(productForm.testerStock) || 0,
      reserved: 0,
      warehouse: productForm.warehouse,
      topNotes: topNotesArr,
      heartNotes: heartNotesArr,
      baseNotes: baseNotesArr,
      metaTitle: generateProductMetaTitle(productForm.name, productForm.brand),
      metaDescription: generateProductMetaDescription(productForm.name, productForm.brand, productForm.concentration, topNotesArr),
      imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
      imageAlt: `${productForm.name} by ${productForm.brand} flacon`,
      status: productForm.status,
    };
    setProducts((prev) => [newP, ...prev]);
    addAuditLog("PRODUCT_CREATED", `${newP.sku} (${newP.name}) [SEO: /product/${newP.slug}]`);
    setShowProductModal(false);
    setProductForm({
      sku: "",
      name: "",
      nameAr: "",
      brand: "Amouage",
      scentFamily: "Woody Amber",
      concentration: "EXTRAIT_DE_PARFUM",
      price: "",
      stock: 20,
      testerStock: 2,
      warehouse: "DXB-MAIN",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
      status: "PUBLISHED",
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("PRODUCT_DELETED", `Product ${id} (${name})`);
  };

  // Brand Actions
  const handleSaveBrand = (brand: BrandItem) => {
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === brand.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = brand;
        return next;
      }
      return [brand, ...prev];
    });
    addAuditLog("BRAND_SAVED", `Maison ${brand.name} [SEO: /brands/${brand.slug}]`);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    addAuditLog("BRAND_DELETED", `Maison ${id} (${name})`);
  };

  // Note Actions
  const handleSaveNoteModal = (note: NoteItem) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = note;
        return next;
      }
      return [note, ...prev];
    });
    addAuditLog("NOTE_SAVED", `Note ${note.nameEn} [SEO: /notes/${note.slug}]`);
  };

  const handleDeleteNote = (id: string, name: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addAuditLog("NOTE_DELETED", `Note ${id} (${name})`);
  };

  // Bulk CSV Import Action
  const handleBulkCsvImportSuccess = (
    newProducts: ProductItem[],
    newBrands: BrandItem[],
    newNotes: NoteItem[]
  ) => {
    setProducts((prev) => {
      const existingSkus = new Set(prev.map((p) => p.sku));
      const filteredNew = newProducts.filter((p) => !existingSkus.has(p.sku));
      return [...filteredNew, ...prev];
    });

    if (newBrands.length > 0) {
      setBrands((prev) => {
        const existingSlugs = new Set(prev.map((b) => b.slug));
        const filteredNew = newBrands.filter((b) => !existingSlugs.has(b.slug));
        return [...prev, ...filteredNew];
      });
    }

    if (newNotes.length > 0) {
      setNotes((prev) => {
        const existingSlugs = new Set(prev.map((n) => n.slug));
        const filteredNew = newNotes.filter((n) => !existingSlugs.has(n.slug));
        return [...prev, ...filteredNew];
      });
    }

    addAuditLog(
      "BULK_CSV_SEO_IMPORT",
      `Imported ${newProducts.length} flacons, created ${newBrands.length} brands, resolved ${newNotes.length} scent notes`
    );
  };

  const handleDownloadTemplateDirect = () => {
    const blob = new Blob([PRO_SEO_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "muschio_pro_seo_catalog_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Order Actions
  const updateOrderStatus = (orderId: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    addAuditLog("ORDER_STATUS_UPDATE", `${orderId} -> ${nextStatus}`);
  };

  // Return Actions
  const handleInspectReturn = (returnId: string, disposition: string) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId ? { ...r, disposition, status: "COMPLETED" } : r
      )
    );
    addAuditLog("RETURN_INSPECTION_COMPLETED", `${returnId} disposition=${disposition}`);
  };

  // Review Actions
  const handleReviewAction = (reviewId: string, status: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    addAuditLog("REVIEW_MODERATED", `${reviewId} status=${status}`);
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog("STORE_SETTINGS_SAVED", "Social handles and Concierge info persisted");
    setSettingsFeedback("Settings and Social Links saved successfully! Sync active.");
    setTimeout(() => setSettingsFeedback(""), 4000);
  };

  // Dynamic Dashboard Metrics
  const totalStockUnits = useMemo(() => products.reduce((acc, p) => acc + p.stock, 0), [products]);
  const totalTesterUnits = useMemo(() => products.reduce((acc, p) => acc + p.testerStock, 0), [products]);
  const activeOrdersCount = useMemo(() => orders.filter((o) => o.status !== "CANCELLED").length, [orders]);
  const pendingReviewsCount = useMemo(() => reviews.filter((r) => r.status === "PENDING").length, [reviews]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-200 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-e border-slate-800 bg-[#0E1420] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="font-serif text-amber-300 font-bold text-sm">M</span>
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg font-bold text-white block">MUSCHIO</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent block">Admin Panel</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-sans">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "dashboard" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "products" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package size={16} />
                <span>Products</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("brands")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "brands" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Award size={16} />
                <span>Brands</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">{brands.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "notes" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers size={16} />
                <span>Notes</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">{notes.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "inventory" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Warehouse size={16} />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab("purchasing")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "purchasing" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={16} />
              <span>Purchasing</span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "returns" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <RotateCcw size={16} />
                <span>Returns</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{returns.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "orders" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={16} />
                <span>Orders</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{orders.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "reviews" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Star size={16} />
                <span>Reviews</span>
              </span>
              {pendingReviewsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">{pendingReviewsCount}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("markets")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "markets" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe size={16} />
              <span>Markets</span>
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "banners" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <ImageIcon size={16} />
                <span>Banners</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">{banners.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "settings" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Share2 size={16} />
                <span>Settings</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "audit" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={16} />
              <span>Audit Log</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 text-[11px] space-y-1.5 rounded">
          <div className="font-semibold text-slate-200">Administrator</div>
          <div className="text-slate-400 font-mono text-[10px]">superadmin@muschio.luxury</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="font-serif text-2xl font-light text-white capitalize">
              {TAB_TITLES[activeTab] || activeTab}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {TAB_SUBTITLES[activeTab] || "Muschio Fragrance Store Management"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded">
              UAE VAT: 5.0% • KSA VAT: 15.0%
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-accent text-white text-xs font-sans hover:bg-accent-hover transition-colors flex items-center gap-1.5 rounded"
            >
              <Sparkles size={14} />
              <span>Live Storefront ↗</span>
            </a>
          </div>
        </header>

        {/* 1. EXECUTIVE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Net Revenue (MTD)</span>
                <div className="font-serif text-3xl text-white font-light">384,250 AED</div>
                <div className="text-emerald-400 text-xs flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>+28.4% vs last month</span>
                </div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Pending Orders</span>
                <div className="font-serif text-3xl text-amber-400 font-light">{activeOrdersCount} Orders</div>
                <div className="text-slate-400 text-xs font-mono">In processing & dispatch</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Total Stock</span>
                <div className="font-serif text-3xl text-emerald-400 font-light">{totalStockUnits} Units</div>
                <div className="text-slate-400 text-xs font-mono">+{totalTesterUnits} Testers</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Pending Returns</span>
                <div className="font-serif text-3xl text-purple-400 font-light">{returns.length} Units</div>
                <div className="text-slate-400 text-xs">Awaiting inspection</div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-[#111622] border border-slate-800 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Storefront Social Status:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Instagram ({storeSettings.instagramHandle}) & WhatsApp Connected
                </span>
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="text-accent hover:underline text-xs flex items-center gap-1"
              >
                <span>Edit Social Links & Hotline</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by SKU, product name, or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-800 text-xs text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleDownloadTemplateDirect}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded flex items-center gap-1.5 border border-slate-700 transition-colors"
                  title="Download clean CSV template for bulk import"
                >
                  <Download size={14} />
                  <span>Download CSV Template</span>
                </button>

                <button
                  onClick={() => setShowCsvModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-accent to-red-700 hover:from-accent-hover hover:to-red-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-all shadow-md shadow-red-950/40"
                  title="Upload products in bulk via CSV"
                >
                  <FileSpreadsheet size={14} />
                  <span className="font-semibold">Bulk CSV Upload</span>
                </button>

                <button
                  onClick={() => setShowProductModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Product (EN / AR)</th>
                    <th className="p-4 text-start">URL Slug</th>
                    <th className="p-4 text-start">Brand</th>
                    <th className="p-4 text-start">Notes</th>
                    <th className="p-4 text-start">Price</th>
                    <th className="p-4 text-start">Stock</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products
                    .filter((p) => {
                      if (!productSearch.trim()) return true;
                      const q = productSearch.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.sku.toLowerCase().includes(q) ||
                        p.brand.toLowerCase().includes(q) ||
                        (p.nameAr && p.nameAr.includes(q))
                      );
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <span className="font-semibold text-white block">{p.name}</span>
                          {p.nameAr && (
                            <span className="text-slate-400 text-xs" dir="rtl">
                              {p.nameAr}
                            </span>
                          )}
                          <span className="text-slate-500 font-mono text-[11px] block mt-0.5">{p.sku}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-slate-500">/product/</span>
                            <span className="text-emerald-400 font-medium">{p.slug}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                            {p.concentration || "Extrait de Parfum"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setActiveTab("brands");
                              setBrandSearch(p.brand);
                            }}
                            className="text-slate-200 font-medium hover:text-accent hover:underline flex items-center gap-1"
                            title="View brand details"
                          >
                            <span>{p.brand}</span>
                            <Award size={11} className="text-amber-400" />
                          </button>
                          <span className="text-[10px] text-slate-500 block">{p.scentFamily || "Woody"}</span>
                        </td>
                        <td className="p-4 text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-slate-300 block">
                              Top ({p.topNotes?.length || 0}) • Heart ({p.heartNotes?.length || 0}) • Base ({p.baseNotes?.length || 0})
                            </span>
                            {p.topNotes && p.topNotes.length > 0 && (
                              <span className="text-slate-500 text-[10px] block truncate max-w-xs">
                                Opening: {p.topNotes.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-100">{p.price}</td>
                        <td className="p-4 font-mono">
                          <span className="text-emerald-400 block">{p.stock} sealed ({p.warehouse})</span>
                          <span className="text-purple-400 text-[11px]">+{p.testerStock} testers</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                            <CheckCircle2 size={11} />
                            <span>SEO Ready</span>
                          </span>
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`http://localhost:3000/en/product/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                              title="View Storefront Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Add Product Modal */}
            {showProductModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#111622] border border-slate-800 w-full max-w-xl p-6 space-y-4 rounded max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="font-serif text-lg text-white font-light">Add Product</h3>
                      <p className="text-[11px] text-slate-400">Product details, pricing, and scent notes</p>
                    </div>
                    <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">SKU Code *</label>
                        <input
                          type="text"
                          placeholder="e.g. AMO-INT53-100"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Brand *</label>
                        <select
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        >
                          {brands.map((b) => (
                            <option key={b.id} value={b.name}>
                              {b.name} ({b.countryEn})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Product Name (English) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Taif Extrait de Parfum"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Product Name (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="e.g. ورد الطائف إكستريت دي بارفان"
                        value={productForm.nameAr}
                        onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Concentration</label>
                        <select
                          value={productForm.concentration}
                          onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        >
                          <option value="EXTRAIT_DE_PARFUM">Extrait de Parfum (30-53%)</option>
                          <option value="PARFUM">Parfum Pure (20-30%)</option>
                          <option value="EAU_DE_PARFUM">Eau de Parfum (15-20%)</option>
                          <option value="PARFUM_OIL">Pure Attar / Perfume Oil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Price (AED) *</label>
                        <input
                          type="text"
                          placeholder="e.g. 1,850"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Scent Notes Pyramid */}
                    <div className="p-3 bg-[#0E1420] border border-slate-800 rounded space-y-2">
                      <span className="text-[11px] font-medium text-purple-400 flex items-center gap-1">
                        <Layers size={13} />
                        <span>Scent Notes (comma-separated, auto-linked to note pages)</span>
                      </span>
                      <div>
                        <label className="block text-slate-500 text-[10px]">Top Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Bergamot, Pink Pepper, Taif Rose"
                          value={productForm.topNotes}
                          onChange={(e) => setProductForm({ ...productForm, topNotes: e.target.value })}
                          className="w-full bg-[#111622] border border-slate-800 text-white p-2 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">Heart Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Silver Frankincense, Jasmine, Cedarwood"
                          value={productForm.heartNotes}
                          onChange={(e) => setProductForm({ ...productForm, heartNotes: e.target.value })}
                          className="w-full bg-[#111622] border border-slate-800 text-white p-2 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">Base Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Cambodian Oud, Ambergris, Sandalwood"
                          value={productForm.baseNotes}
                          onChange={(e) => setProductForm({ ...productForm, baseNotes: e.target.value })}
                          className="w-full bg-[#111622] border border-slate-800 text-white p-2 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Sealed Stock</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Testers</label>
                        <input
                          type="number"
                          value={productForm.testerStock}
                          onChange={(e) => setProductForm({ ...productForm, testerStock: Number(e.target.value) })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Warehouse</label>
                        <select
                          value={productForm.warehouse}
                          onChange={(e) => setProductForm({ ...productForm, warehouse: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        >
                          <option value="DXB-MAIN">DXB-MAIN (Dubai)</option>
                          <option value="RUH-HUB">RUH-HUB (Riyadh)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Save Product</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2.5. BRANDS */}
        {activeTab === "brands" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by brand name, country, or perfumer..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-800 text-xs text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-slate-600"
                />
              </div>

              <button
                onClick={() => {
                  setBrandToEdit(null);
                  setShowBrandModal(true);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-md shadow-amber-950/40"
              >
                <Plus size={14} />
                <span>Add Brand</span>
              </button>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Brand Name</th>
                    <th className="p-4 text-start">URL Slug</th>
                    <th className="p-4 text-start">Category</th>
                    <th className="p-4 text-start">Country & Year</th>
                    <th className="p-4 text-start">Products</th>
                    <th className="p-4 text-start">Description</th>
                    <th className="p-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {brands
                    .filter((b) => {
                      if (!brandSearch.trim()) return true;
                      const q = brandSearch.toLowerCase();
                      return (
                        b.name.toLowerCase().includes(q) ||
                        b.countryEn.toLowerCase().includes(q) ||
                        b.slug.toLowerCase().includes(q)
                      );
                    })
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <span className="font-semibold text-white block text-sm">{b.name}</span>
                          <span className="text-slate-400 text-[11px] font-mono">{b.perfumer}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-slate-500">/brands/</span>
                            <span className="text-amber-400 font-medium">{b.slug}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              b.type === "NICHE"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {b.type === "NICHE" ? "Niche Brand" : "Designer"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-200 block">{b.countryEn}</span>
                          <span className="text-slate-500 text-[10px]">Est. {b.year}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="text-emerald-400 font-medium">
                            {products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length} products
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 max-w-sm truncate text-[11px]">
                          {b.storyEn || "Brand description available."}
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setBrandToEdit(b);
                                setShowBrandModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                              title="Edit Brand"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={`http://localhost:3000/en/brands/${b.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                              title="View Brand Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteBrand(b.id, b.name)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Brand"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by note name, Arabic title, or family..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-800 text-xs text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {notes.length} notes
                </span>
                <button
                  onClick={() => {
                    setNoteToEdit(null);
                    setShowNoteModal(true);
                  }}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950/40"
                >
                  <Plus size={14} />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Note Name (EN / AR)</th>
                    <th className="p-4 text-start">URL Slug</th>
                    <th className="p-4 text-start">Family</th>
                    <th className="p-4 text-start">Origin</th>
                    <th className="p-4 text-start">Products</th>
                    <th className="p-4 text-start">Description</th>
                    <th className="p-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {notes
                    .filter((n) => {
                      if (!noteSearch.trim()) return true;
                      const q = noteSearch.toLowerCase();
                      return (
                        n.nameEn.toLowerCase().includes(q) ||
                        n.nameAr.includes(q) ||
                        n.family.toLowerCase().includes(q) ||
                        n.slug.toLowerCase().includes(q)
                      );
                    })
                    .map((n) => (
                      <tr key={n.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <span className="font-semibold text-white block text-sm">{n.nameEn}</span>
                          <span className="text-slate-400 text-xs" dir="rtl">
                            {n.nameAr}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-slate-500">/notes/</span>
                            <span className="text-purple-400 font-medium">{n.slug}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded">
                            {n.family}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 text-[11px]">
                          {n.originEn || "Middle East"}
                        </td>
                        <td className="p-4 font-mono text-emerald-400 font-medium">
                          {n.perfumesCount} products
                        </td>
                        <td className="p-4 text-slate-400 max-w-xs truncate text-[11px]">
                          {n.descriptionEn || "Sensory description available."}
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setNoteToEdit(n);
                                setShowNoteModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
                              title="Edit Note"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={`http://localhost:3000/en/notes/${n.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                              title="View Note Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteNote(n.id, n.nameEn)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. INVENTORY & WAREHOUSES */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">DXB-MAIN (Dubai Central Hub)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">DEFAULT WAREHOUSE</span>
                </div>
                <p className="text-xs text-slate-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "DXB-MAIN").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-slate-500">Express Delivery: Dubai, Abu Dhabi, Sharjah</div>
              </div>
              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">RUH-HUB (Riyadh GCC Hub)</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">REGIONAL WAREHOUSE</span>
                </div>
                <p className="text-xs text-slate-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "RUH-HUB").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-slate-500">Express Delivery: Riyadh, Jeddah, Khobar, GCC</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PURCHASING */}
        {activeTab === "purchasing" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] p-6 space-y-3 rounded">
              <h3 className="font-serif text-lg text-white font-light">Supplier Purchase Orders</h3>
              <p className="text-xs text-slate-400">Active purchase orders with official brand distributors in France, Oman, and Italy.</p>
              <div className="divide-y divide-slate-800 text-xs font-mono pt-3">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-200">PO-2026-081 • Amouage Luxury LLC (Oman)</span>
                  <span className="text-emerald-400">DELIVERED & VERIFIED</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-200">PO-2026-082 • Roja Parfums London (UK)</span>
                  <span className="text-amber-400">IN TRANSIT (AIR FREIGHT)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. RETURNS */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Return # / Customer</th>
                    <th className="p-4 text-start">Returned Item</th>
                    <th className="p-4 text-start">Condition</th>
                    <th className="p-4 text-start">Restock Action</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-semibold text-white block">{r.number}</span>
                        <span className="text-slate-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="p-4 text-slate-300">{r.item}</td>
                      <td className="p-4 font-mono text-slate-300">{r.condition}</td>
                      <td className="p-4 font-mono text-purple-400">{r.disposition}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        {r.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleInspectReturn(r.id, "RESTOCK_SELLABLE")}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] rounded"
                          >
                            Approve Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {["ALL", "AE", "SA", "KW", "QA"].map((mkt) => (
                  <button
                    key={mkt}
                    onClick={() => setOrderMarketFilter(mkt)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      orderMarketFilter === mkt
                        ? "bg-accent border-accent text-white"
                        : "bg-[#111622] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {mkt === "ALL" ? "All Markets" : `Market: ${mkt}`}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search by order # or customer..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-[#111622] border border-slate-800 text-xs text-white px-3 py-1.5 rounded focus:outline-none"
              />
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Order ID / Client</th>
                    <th className="p-4 text-start">Total Amount</th>
                    <th className="p-4 text-start">Payment Provider</th>
                    <th className="p-4 text-start">Market</th>
                    <th className="p-4 text-start">Date / Timeline</th>
                    <th className="p-4 text-start">Status Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders
                    .filter((o) => {
                      if (orderMarketFilter !== "ALL" && o.market !== orderMarketFilter) return false;
                      if (orderSearch.trim()) {
                        const q = orderSearch.toLowerCase();
                        return o.number.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <span className="font-semibold text-white block">{o.number}</span>
                          <span className="text-slate-400 text-[11px]">{o.customer}</span>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-100">{o.amount}</td>
                        <td className="p-4 font-mono text-cyan-400">{o.method}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded">
                            {o.market}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{o.date}</td>
                        <td className="p-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="bg-[#0E1420] border border-slate-700 text-white text-xs px-2.5 py-1 rounded focus:outline-none"
                          >
                            <option value="PAID">PAID</option>
                            <option value="FULFILLING">FULFILLING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Product / Customer</th>
                    <th className="p-4 text-start">Title & Rating</th>
                    <th className="p-4 text-start">Longevity / Sillage</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-semibold text-white block">{r.product}</span>
                        <span className="text-slate-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white block font-medium">"{r.title}"</span>
                        <span className="text-amber-400">★ {r.rating} / 5</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        L: {r.longevity}/5 • S: {r.sillage}/5
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-end space-x-2">
                        {r.status !== "APPROVED" && (
                          <button
                            onClick={() => handleReviewAction(r.id, "APPROVED")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] rounded"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "REJECTED" && (
                          <button
                            onClick={() => handleReviewAction(r.id, "REJECTED")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. MARKETS & GCC VAT */}
        {activeTab === "markets" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="font-serif text-lg text-white">United Arab Emirates (AE)</span>
                <p className="text-xs text-slate-400">Currency: AED • Standard VAT: 5.0%</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">PRIMARY ACTIVE MARKET</span>
              </div>
              <div className="p-5 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="font-serif text-lg text-white">Kingdom of Saudi Arabia (SA)</span>
                <p className="text-xs text-slate-400">Currency: SAR • Standard VAT: 15.0%</p>
                <span className="inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">ACTIVE CROSS-BORDER</span>
              </div>
              <div className="p-5 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="font-serif text-lg text-white">State of Qatar (QA) & Kuwait (KW)</span>
                <p className="text-xs text-slate-400">Currencies: QAR / KWD • DDP Express</p>
                <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">WHITE-GLOVE GCC</span>
              </div>
            </div>
          </div>
        )}

        {/* 10. BANNERS & HOMEPAGE CMS */}
        {activeTab === "banners" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-serif text-lg text-white font-light">Promotional Banners & Sliders</h2>
                <p className="text-xs text-slate-400">Configure hero sliders, campaign banners, and announcements.</p>
              </div>
              <button
                onClick={() => {
                  resetBannerForm();
                  setShowBannerForm(true);
                }}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* Banners List */}
            <div className="grid grid-cols-1 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="p-4 bg-[#111622] border border-slate-800 rounded flex gap-4 items-center">
                  <img src={b.imageUrl} alt="" className="w-24 h-16 object-cover rounded border border-slate-700 bg-slate-800" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${SLOT_COLORS[b.slot] || "bg-slate-800 text-slate-300"}`}>
                        {SLOT_LABELS[b.slot] || b.slot}
                      </span>
                      <span className="font-serif text-sm text-white">{b.titleEn}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{b.subtitleEn}</p>
                    <span className="text-[10px] font-mono text-slate-500 block">Link: {b.ctaUrl || "/shop"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBannerActive(b.id)}
                      className={`p-1.5 rounded transition-colors ${b.isActive ? "text-emerald-400 hover:bg-slate-800" : "text-slate-500 hover:text-white"}`}
                      title={b.isActive ? "Deactivate" : "Activate"}
                    >
                      {b.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Banner Modal */}
            {showBannerForm && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-serif text-lg text-white font-light">Create Campaign Banner</h3>
                    <button onClick={resetBannerForm} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Banner Placement Slot</label>
                      <select
                        value={bannerForm.slot}
                        onChange={(e) => setBannerForm({ ...bannerForm, slot: e.target.value as BannerSlot })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      >
                        <option value="HERO_SLIDER">Hero Slider (Top Masthead)</option>
                        <option value="CAMPAIGN_MID">Campaign Mid-Page</option>
                        <option value="PROMO_STRIP">Promo Strip</option>
                        <option value="ANNOUNCEMENT_BAR">Announcement Bar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Headline (English)</label>
                      <input
                        type="text"
                        placeholder="The Art of | Noble Sillage."
                        value={bannerForm.titleEn}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Headline (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="فن | الحضور المهيب."
                        value={bannerForm.titleAr}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Banner Image URL</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={bannerForm.imageUrl}
                        onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">CTA Button Text (EN)</label>
                        <input
                          type="text"
                          value={bannerForm.ctaTextEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaTextEn: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Target URL</label>
                        <input
                          type="text"
                          placeholder="/shop"
                          value={bannerForm.ctaUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaUrl: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button onClick={resetBannerForm} className="px-4 py-2 border border-slate-800 text-slate-300 rounded">
                      Cancel
                    </button>
                    <button onClick={handleSaveBanner} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded">
                      Save Banner
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Homepage Section Order */}
            <div className="border border-slate-800 bg-[#111622] p-5 rounded space-y-4">
              <h3 className="font-serif text-base text-white font-light">Homepage Visual Section Reordering</h3>
              <div className="divide-y divide-slate-800">
                {sections.map((section, idx) => (
                  <div key={section.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{idx + 1}.</span>
                      <span className="text-xs text-white font-medium">{SECTION_LABELS[section.sectionType] || section.sectionType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSectionUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(idx)}
                        disabled={idx === sections.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => toggleSectionVisible(section.id)}
                        className={`p-1 ${section.isVisible ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 11. SOCIAL MEDIA & STOREFRONT SETTINGS TAB */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
            {settingsFeedback && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{settingsFeedback}</span>
              </div>
            )}

            {/* Social Media Links Section */}
            <div className="p-6 bg-[#111622] border border-slate-800 rounded space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-serif text-lg text-white font-light flex items-center gap-2">
                    <Share2 size={18} className="text-accent" />
                    <span>Official Social Media Channels</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure official links displayed across Storefront Footer, Mobile Drawer, and Schema.org.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Instagram */}
                <div className="p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">Instagram Profile</label>
                    <a
                      href={storeSettings.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Test Profile</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Handle / Username:</span>
                    <input
                      type="text"
                      value={storeSettings.instagramHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagramHandle: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Full URL:</span>
                    <input
                      type="url"
                      value={storeSettings.instagramUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagramUrl: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* WhatsApp VIP Concierge */}
                <div className="p-4 bg-[#0E1420] border border-[#25D366]/30 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#A8E6B8] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                      <span>WhatsApp VIP Concierge</span>
                    </label>
                    <a
                      href={`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(storeSettings.whatsappDefaultMsg)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Test Chat Link</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Display Hotline:</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappPhone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappPhone: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Clean International Number (No +):</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappNumber}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Default Pre-filled Greeting:</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappDefaultMsg}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappDefaultMsg: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded text-xs"
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div className="p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">TikTok Channel</label>
                    <a
                      href={storeSettings.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Test</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Handle:</span>
                    <input
                      type="text"
                      value={storeSettings.tiktokHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tiktokHandle: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">URL:</span>
                    <input
                      type="url"
                      value={storeSettings.tiktokUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tiktokUrl: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* X / Twitter */}
                <div className="p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">X / Twitter</label>
                    <a
                      href={storeSettings.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Test</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Handle:</span>
                    <input
                      type="text"
                      value={storeSettings.twitterHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twitterHandle: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">URL:</span>
                    <input
                      type="url"
                      value={storeSettings.twitterUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twitterUrl: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white">YouTube Luxury Film Atelier</label>
                    <a
                      href={storeSettings.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Test</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={storeSettings.youtubeUrl}
                    onChange={(e) => setStoreSettings({ ...storeSettings, youtubeUrl: e.target.value })}
                    className="w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar & Hotline */}
            <div className="p-6 bg-[#111622] border border-slate-800 rounded space-y-4 text-xs">
              <h3 className="font-serif text-lg text-white font-light">Storefront Announcement Bar & Client Care</h3>
              <div>
                <label className="block text-slate-400 mb-1">Announcement Bar Text (English)</label>
                <input
                  type="text"
                  value={storeSettings.announcementBarEn}
                  onChange={(e) => setStoreSettings({ ...storeSettings, announcementBarEn: e.target.value })}
                  className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-sans"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Announcement Bar Text (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={storeSettings.announcementBarAr}
                  onChange={(e) => setStoreSettings({ ...storeSettings, announcementBarAr: e.target.value })}
                  className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Concierge Email</label>
                  <input
                    type="email"
                    value={storeSettings.conciergeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, conciergeEmail: e.target.value })}
                    className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Free Delivery Minimum (AED)</label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded">
              <span className="text-xs text-slate-400">Updates are saved to persistent local state and syncable across sessions.</span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-2 transition-colors shadow-lg"
              >
                <Save size={16} />
                <span>Save & Sync All Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* 12. SECURITY & AUDIT */}
        {activeTab === "audit" && (
          <div className="border border-slate-800 bg-[#111622] p-6 space-y-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-light text-white">Immutable Administrative Audit Log</h3>
                <p className="text-xs text-slate-400">All administrative operations, creations, and transitions are tracked here.</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                {auditLogs.length} Events Logged
              </span>
            </div>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-slate-300">
                  <div className="space-x-3">
                    <span className="text-accent font-bold">{log.action}</span>
                    <span className="text-slate-400">[{log.res}]</span>
                  </div>
                  <div className="space-x-4 text-slate-500">
                    <span>{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PRO SEO MODALS */}
      <BulkCsvModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        existingBrands={brands}
        existingNotes={notes}
        onImportSuccess={handleBulkCsvImportSuccess}
      />

      <BrandModal
        isOpen={showBrandModal}
        onClose={() => {
          setShowBrandModal(false);
          setBrandToEdit(null);
        }}
        brandToEdit={brandToEdit}
        onSave={handleSaveBrand}
      />

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setNoteToEdit(null);
        }}
        noteToEdit={noteToEdit}
        onSave={handleSaveNoteModal}
      />
    </div>
  );
}
