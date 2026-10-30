import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  Edit3,
  LogOut,
  Menu,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  MessageSquare,
  Mail,
  Send,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  BrandItem,
  NoteItem,
  ProductItem,
  ProductVariantItem,
  slugify,
  generateProductMetaTitle,
  generateProductMetaDescription,
  downloadExcelTemplate,
} from "./seo-utils";
import { BulkCsvModal } from "./components/BulkCsvModal";
import { BrandModal } from "./components/BrandModal";
import { NoteModal } from "./components/NoteModal";
import { AdminLoginGate, AdminAuthSession } from "./components/AdminLoginGate";
import { MediaUploadField } from "./components/MediaUploadField";
import { MultiImageUploadField } from "./components/MultiImageUploadField";

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
  | "enquiries"
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
  orders: "Orders & Real-Time Tracking",
  enquiries: "VIP Enquiries & Concierge",
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
  orders: "Live customer orders, real-time cancellations, and dispatch workflow",
  enquiries: "Live concierge consultations, bespoke inquiries, and VIP messages",
  reviews: "Moderate customer product ratings and reviews",
  markets: "GCC countries, currencies, and VAT rates",
  banners: "Homepage hero sliders, promos, and announcements",
  settings: "Social media links, contact info, and store settings",
  audit: "System security log and admin user activity",
};

interface LiveEventItem {
  id: string;
  eventName: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  createdAt: string;
  read?: boolean;
}

interface EnquiryItem {
  id: string;
  aggregateId?: string;
  enquiryId?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  fragranceInterest?: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";
  receivedAt?: string;
  createdAt?: string;
  lastAdminNote?: string;
}

interface LiveToast {
  id: string;
  type: "order" | "cancel" | "enquiry";
  title: string;
  message: string;
  time: string;
}

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
  HERO_SLIDER: "bg-black text-white dark:bg-white dark:text-black",
  CAMPAIGN_MID: "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700",
  PROMO_STRIP: "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800",
  ANNOUNCEMENT_BAR: "border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400",
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
  const [adminTheme, setAdminTheme] = usePersistentState<"light" | "dark">("theme", "light");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Admin Security Authentication Session
  const [authSession, setAuthSession] = useState<AdminAuthSession | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved =
        localStorage.getItem("muschio_admin_auth") ||
        sessionStorage.getItem("muschio_admin_auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem("muschio_admin_auth");
      sessionStorage.removeItem("muschio_admin_auth");
    } catch {}
    setAuthSession(null);
  };

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
      perfumer: "Pierre Negrin",
      perfumerBio: "Master French perfumer renowned for sculpting deep, architectural incense and resinous extraits for royalty.",
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
      images: [
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      ],
      imageAlt: "Amouage Interlude 53 Man Extrait luxury flacon",
      status: "PUBLISHED",
      variants: [
        { id: "p1-v100", sku: "AMO-INT53-100", volume: "100ml", volumeMl: 100, regularPrice: 1850, price: 1850, discountPrice: null, salePrice: null, stockQuantity: 28, isDefault: true },
        { id: "p1-v50", sku: "AMO-INT53-50", volume: "50ml", volumeMl: 50, regularPrice: 1290, price: 1190, discountPrice: 1190, salePrice: 1190, stockQuantity: 15, isDefault: false },
        { id: "p1-v30", sku: "AMO-INT53-30", volume: "30ml", volumeMl: 30, regularPrice: 790, price: 790, discountPrice: null, salePrice: null, stockQuantity: 10, isDefault: false },
      ],
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
      perfumer: "Francis Kurkdjian",
      perfumerBio: "Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",
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
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      ],
      imageAlt: "Baccarat Rouge 540 Extrait flacon",
      status: "PUBLISHED",
      variants: [
        { id: "p2-v70", sku: "MFK-BR540E-70", volume: "70ml", volumeMl: 70, regularPrice: 1850, price: 1650, discountPrice: 1650, salePrice: 1650, stockQuantity: 34, isDefault: true },
        { id: "p2-v200", sku: "MFK-BR540E-200", volume: "200ml", volumeMl: 200, regularPrice: 3500, price: 3200, discountPrice: 3200, salePrice: 3200, stockQuantity: 12, isDefault: false },
        { id: "p2-v35", sku: "MFK-BR540E-35", volume: "35ml", volumeMl: 35, regularPrice: 990, price: 990, discountPrice: null, salePrice: null, stockQuantity: 20, isDefault: false },
      ],
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
      perfumer: "Roja Dove",
      perfumerBio: "The premier British Master Perfumer and fragrance historian, famed for formulating without compromise on rare natural absolutes.",
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
      images: [
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85",
      ],
      imageAlt: "Roja Parfums Elysium luxury flacon",
      status: "PUBLISHED",
      variants: [
        { id: "p3-v100", sku: "ROJA-ELY-100", volume: "100ml", volumeMl: 100, regularPrice: 2200, price: 1950, discountPrice: 1950, salePrice: 1950, stockQuantity: 25, isDefault: true },
        { id: "p3-v50", sku: "ROJA-ELY-50", volume: "50ml", volumeMl: 50, regularPrice: 1250, price: 1250, discountPrice: null, salePrice: null, stockQuantity: 14, isDefault: false },
      ],
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
      perfumer: "Chris Maurice",
      perfumerBio: "Renowned Spanish nose celebrated for bridging classical Mediterranean perfumery with opulent Middle Eastern accords.",
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
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      ],
      imageAlt: "Xerjoff Alexandria II luxury flacon",
      status: "PUBLISHED",
      variants: [
        { id: "p4-v100", sku: "XER-ALEX2-100", volume: "100ml", volumeMl: 100, price: 2200, discountPrice: null, stockQuantity: 19, isDefault: true },
        { id: "p4-v50", sku: "XER-ALEX2-50", volume: "50ml", volumeMl: 50, price: 1420, discountPrice: null, stockQuantity: 11, isDefault: false },
      ],
    },
  ]);

  const [productSearch, setProductSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    nameAr: "",
    brand: "Amouage",
    scentFamily: "Woody Amber",
    perfumer: "",
    perfumerBio: "",
    concentration: "EXTRAIT_DE_PARFUM",
    volumeMl: 100,
    price: "",
    imageUrl: "",
    images: [] as string[],
    stock: 20,
    testerStock: 2,
    warehouse: "DXB-MAIN",
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
    descriptionEn: "",
    descriptionAr: "",
    metaTitle: "",
    metaDescription: "",
    status: "PUBLISHED" as const,
    variants: [
      {
        id: "var-init-1",
        sku: "AMO-INT53-100",
        volume: "100ml",
        volumeMl: 100,
        price: 1850,
        discountPrice: null as number | null,
        stockQuantity: 20,
        isDefault: true,
      },
    ] as ProductVariantItem[],
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
      heroImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=150&q=80",
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
      heroImageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=150&q=80",
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
      heroImageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=150&q=80",
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
      heroImageUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=150&q=80",
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
      heroImageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=150&q=80",
      status: "PUBLISHED",
      perfumesCount: 4,
    },
  ]);

  const [noteSearch, setNoteSearch] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);

  // Sync live products, brands, and notes from Neon PostgreSQL database
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/v1/admin/products").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/brands").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/notes").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([prodRes, brandRes, noteRes]) => {
      if (!active) return;
      if (prodRes?.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        const dbProducts: ProductItem[] = prodRes.data.map((p: any) => {
          const variantsList: ProductVariantItem[] = Array.isArray(p.variants) && p.variants.length > 0
            ? p.variants.map((v: any, idx: number) => {
                const regPrice = v.compareAtPrice ? Number(v.compareAtPrice) : Number(v.price) || 0;
                const discPrice = v.discountPrice ? Number(v.discountPrice) : (v.compareAtPrice ? Number(v.price) : null);
                return {
                  id: v.id,
                  sku: v.sku,
                  volume: v.volume || (v.volumeMl ? `${v.volumeMl}ml` : v.sizeLabelEn || "100ml"),
                  volumeMl: v.volumeMl || 100,
                  regularPrice: regPrice,
                  originalPrice: regPrice,
                  price: regPrice,
                  discountPrice: discPrice,
                  salePrice: discPrice,
                  stockQuantity: v.inventory?.sealedQuantity ?? v.stockQuantity ?? 20,
                  isDefault: v.isDefault ?? idx === 0,
                };
              })
            : [
                {
                  id: `var-${p.id}`,
                  sku: `SKU-${p.slug}`,
                  volume: "100ml",
                  volumeMl: 100,
                  regularPrice: 1000,
                  originalPrice: 1000,
                  price: 1000,
                  discountPrice: null,
                  salePrice: null,
                  stockQuantity: 20,
                  isDefault: true,
                },
              ];
          const defaultV = variantsList.find((v) => v.isDefault) || variantsList[0] || {
            sku: p.slug || "SKU-DEF",
            volumeMl: 100,
            price: 1000,
            stockQuantity: 20,
          };
          return {
            id: p.id,
            sku: defaultV.sku,
            name: p.nameEn,
            nameAr: p.nameAr,
            slug: p.slug,
            brand: p.brand?.name || "Haute Niche",
            brandSlug: p.brand?.slug || "brand",
            scentFamily: p.scentFamily?.nameEn || "Woody Amber",
            perfumer: (p.perfumers && p.perfumers.length > 0)
              ? p.perfumers.map((rel: any) => rel.perfumer?.name || rel.name).filter(Boolean).join(", ")
              : p.perfumer || "",
            perfumers: p.perfumers?.map((rel: any) => rel.perfumer?.name || rel.name).filter(Boolean) || [],
            perfumerBio: p.perfumers?.[0]?.perfumer?.bioEn || p.perfumerBio || "",
            concentration: p.concentration || "EXTRAIT_DE_PARFUM",
            gender: p.gender || "UNISEX",
            volumeMl: defaultV.volumeMl || 100,
            price: `${defaultV.price} AED`,
            costPrice: "0 AED",
            stock: defaultV.stockQuantity,
            testerStock: p.variants?.[0]?.inventory?.testerQuantity ?? 2,
            reserved: 0,
            warehouse: "DXB-MAIN",
            topNotes: p.notes?.filter((n: any) => n.position === "TOP").map((n: any) => n.note?.nameEn || n.nameEn) || [],
            heartNotes: p.notes?.filter((n: any) => n.position === "HEART").map((n: any) => n.note?.nameEn || n.nameEn) || [],
            baseNotes: p.notes?.filter((n: any) => n.position === "BASE").map((n: any) => n.note?.nameEn || n.nameEn) || [],
            taglineEn: p.taglineEn || "",
            taglineAr: p.taglineAr || "",
            descriptionEn: p.descriptionEn || "",
            descriptionAr: p.descriptionAr || "",
            metaTitle: `${p.nameEn} | Muschio`,
            metaDescription: p.descriptionEn || "",
            imageUrl: p.images?.[0] || p.imageUrl || "/product-placeholder.svg",
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
            imageAlt: p.nameEn,
            status: p.isPublished ? "PUBLISHED" : "DRAFT",
            variants: variantsList,
          };
        });
        setProducts(dbProducts);
      }
      if (brandRes?.data && Array.isArray(brandRes.data) && brandRes.data.length > 0) {
        setBrands(brandRes.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          type: b.type,
          countryEn: b.countryOfOrigin || "France",
          countryAr: b.countryOfOrigin || "فرنسا",
          year: 1983,
          perfumer: "Master Perfumer",
          storyEn: b.descriptionEn || "",
          storyAr: b.descriptionAr || "",
          metaTitle: `${b.name} | Muschio`,
          metaDescription: b.descriptionEn || "",
          perfumesCount: b._count?.products || 1,
        })));
      }
      if (noteRes?.data && Array.isArray(noteRes.data) && noteRes.data.length > 0) {
        setNotes(noteRes.data.map((n: any) => ({
          id: n.id,
          nameEn: n.nameEn,
          nameAr: n.nameAr,
          slug: n.slugEn || n.slug,
          family: n.categoryEn || "General",
          heroImageUrl: n.heroImageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
          status: "PUBLISHED" as const,
          descriptionEn: n.descriptionEn || "",
          descriptionAr: n.descriptionAr || "",
          metaTitle: `${n.nameEn} Note | Muschio`,
          metaDescription: n.descriptionEn || "",
          perfumesCount: 2,
        })));
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  // Real-Time Notification & Live Event State
  const [liveEvents, setLiveEvents] = useState<LiveEventItem[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = usePersistentState<boolean>("admin_audio_notifications", true);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([
    {
      id: "enq-demo-1",
      enquiryId: "ENQ-DEMO-01",
      name: "Sheikha Maryam Al-Maktoum",
      email: "maryam.m@dubai.priv",
      phone: "+971501234567",
      subject: "Private Sillage Consultation",
      message: "Seeking a private VIP olfactory presentation of Amouage Guidance 46 and bespoke Attars for a royal wedding celebration.",
      fragranceInterest: "Amouage Guidance 46 / Bespoke Attars",
      status: "NEW",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "enq-demo-2",
      enquiryId: "ENQ-DEMO-02",
      name: "Tariq Bin Laden",
      email: "tariq.bl@holding.sa",
      phone: "+966555123456",
      subject: "Baccarat Rouge Extrait 500ml Flacon Availability",
      message: "Do you offer private warehouse courier delivery to Riyadh Diplomatic Quarter for 2 flacons this week?",
      fragranceInterest: "Maison Francis Kurkdjian Baccarat Rouge 540",
      status: "IN_PROGRESS",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>("ALL");
  const [enquirySearch, setEnquirySearch] = useState<string>("");
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const lastPollTimeRef = useRef<string>(new Date(Date.now() - 60000).toISOString());

  // Web Audio API Luxury Ambient Chime Synthesizer
  const playLuxuryChime = (toneType: "order" | "cancel" | "enquiry" = "order") => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      if (toneType === "order") {
        // Dual Bell Sine: E5 (659.25Hz) -> A5 (880Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.12);
        gain2.gain.setValueAtTime(0.1, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.8);
      } else if (toneType === "cancel") {
        // Descending Tone: F5 (698.46Hz) down to D5 (587.33Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(698.46, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.45);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Soft Single Sine: C5 (523.25Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio autoplay policy
    }
  };

  // Toast notification dispatcher
  const addToast = (type: "order" | "cancel" | "enquiry", title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [{ id, type, title, message, time: "Just now" }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  // Load initial orders and enquiries from live database
  useEffect(() => {
    let active = true;
    const fetchLiveDbData = async () => {
      try {
        const [ordersRes, enquiriesRes] = await Promise.all([
          fetch("/api/v1/admin/orders").catch(() => null),
          fetch("/api/v1/admin/enquiries").catch(() => null),
        ]);

        if (ordersRes && ordersRes.ok) {
          const json = await ordersRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && active) {
            setOrders(
              json.data.map((o: any) => ({
                id: o.id,
                number: o.orderNumber,
                customer: o.shippingAddress?.fullName || o.customer?.firstName || o.guestEmail || "Client",
                amount: `${Number(o.totalAmount).toLocaleString()} ${o.currency || "AED"}`,
                method: o.payments?.[0]?.provider || "CARD",
                status: o.status,
                market: o.marketId || o.shippingAddress?.countryCode || "AE",
                date: new Date(o.createdAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }))
            );
          }
        }

        if (enquiriesRes && enquiriesRes.ok) {
          const json = await enquiriesRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setEnquiries(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not load initial live admin data:", err);
      }
    };

    fetchLiveDbData();
    return () => {
      active = false;
    };
  }, []);

  // Real-time live poller (polls every 4.5 seconds)
  useEffect(() => {
    if (!isLiveActive) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/admin/orders/live?since=${encodeURIComponent(lastPollTimeRef.current)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!json.success || !json.data) return;

        const { events, orders: newOrders, serverTime } = json.data;
        if (serverTime) {
          lastPollTimeRef.current = serverTime;
        }

        if (Array.isArray(events) && events.length > 0) {
          setLiveEvents((prev) => [...events.map((e: any) => ({ ...e, read: false })), ...prev].slice(0, 50));

          events.forEach((evt: any) => {
            const p = evt.payload || {};
            if (evt.eventName === "ORDER_CREATED") {
              playLuxuryChime("order");
              addToast(
                "order",
                "New Order Received",
                `${p.orderNumber || "Order"} • ${p.totalAmount ? Number(p.totalAmount).toLocaleString() : ""} ${p.currency || "AED"} (${p.customerName || "Client"})`
              );
            } else if (evt.eventName === "ORDER_CANCELLED") {
              playLuxuryChime("cancel");
              addToast(
                "cancel",
                "Order Cancelled",
                `${p.orderNumber || "Order"} cancelled: ${p.reason || "Client/Admin update"}`
              );
            } else if (evt.eventName === "ENQUIRY_CREATED") {
              playLuxuryChime("enquiry");
              addToast(
                "enquiry",
                "New VIP Concierge Enquiry",
                `${p.name || "Client"}: ${p.subject || "Fragrance Consultation"}`
              );
              setEnquiries((prev) => [
                {
                  id: evt.id,
                  aggregateId: evt.aggregateId,
                  ...p,
                },
                ...prev,
              ]);
            }
          });
        }

        if (Array.isArray(newOrders) && newOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map(prev.map((o) => [o.id, o]));
            newOrders.forEach((o: any) => {
              map.set(o.id, {
                id: o.id,
                number: o.orderNumber,
                customer: o.shippingAddress?.fullName || o.customer?.firstName || o.guestEmail || "Client",
                amount: `${Number(o.totalAmount).toLocaleString()} ${o.currency || "AED"}`,
                method: o.payments?.[0]?.provider || "CARD",
                status: o.status,
                market: o.marketId || o.shippingAddress?.countryCode || "AE",
                date: new Date(o.createdAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // Silently continue
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [isLiveActive, isAudioEnabled]);

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

  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerForm({
      slot: b.slot,
      eyebrowEn: b.eyebrowEn || "",
      eyebrowAr: b.eyebrowAr || "",
      titleEn: b.titleEn || "",
      titleAr: b.titleAr || "",
      subtitleEn: b.subtitleEn || "",
      subtitleAr: b.subtitleAr || "",
      ctaTextEn: b.ctaTextEn || "",
      ctaTextAr: b.ctaTextAr || "",
      ctaUrl: b.ctaUrl || "",
      secondaryCtaTextEn: b.secondaryCtaTextEn || "",
      secondaryCtaTextAr: b.secondaryCtaTextAr || "",
      secondaryCtaUrl: b.secondaryCtaUrl || "",
      imageUrl: b.imageUrl || "",
      mobileImageUrl: b.mobileImageUrl || "",
      overlayLabelEn: b.overlayLabelEn || "",
      overlayLabelAr: b.overlayLabelAr || "",
      startsAt: b.startsAt || "",
      endsAt: b.endsAt || "",
    });
    setShowBannerForm(true);
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
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      sku: "",
      name: "",
      nameAr: "",
      brand: brands[0]?.name || "Amouage",
      scentFamily: "Woody Amber",
      perfumer: "",
      perfumerBio: "",
      concentration: "EXTRAIT_DE_PARFUM",
      volumeMl: 100,
      price: "",
      imageUrl: "",
      images: [] as string[],
      stock: 20,
      testerStock: 2,
      warehouse: "DXB-MAIN",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
      descriptionEn: "",
      descriptionAr: "",
      metaTitle: "",
      metaDescription: "",
      status: "PUBLISHED",
      variants: [
        {
          id: `var-${Date.now()}-1`,
          sku: "",
          volume: 100,
          volumeMl: 100,
          basePrice: 1850,
          regularPrice: 1850,
          originalPrice: 1850,
          price: 1590,
          discountPrice: 1590,
          salePrice: 1590,
          stock: 20,
          stockQuantity: 20,
          warehouse: "DXB-MAIN",
          isDefault: true,
        },
      ],
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    if (!p) return;
    setEditingProductId(p.id);

    // Extract product fields with comprehensive property alias support
    const pName = p.name || (p as any).nameEn || (p as any).title || "";
    const pNameAr = p.nameAr || (p as any).name_ar || (p as any).nameArabic || "";
    const pSku = p.sku || (p as any).skuCode || "";
    const pBrand = p.brand || (typeof (p as any).brand === "object" ? (p as any).brand?.name : "") || "Amouage";
    const pScentFamily = p.scentFamily || (typeof (p as any).scentFamily === "object" ? (p as any).scentFamily?.nameEn : "") || "Woody Amber";
    const pConcentration = p.concentration || "EXTRAIT_DE_PARFUM";
    const pVolumeMl = typeof p.volumeMl === "number" ? p.volumeMl : (parseInt(String(p.volumeMl || "100").replace(/[^0-9]/g, "") || "100", 10) || 100);

    // Notes normalization (supports array of strings, comma-separated string, or note objects)
    const normalizeNotes = (notes: any): string[] => {
      if (Array.isArray(notes)) {
        return notes
          .map((n: any) => (typeof n === "string" ? n : n?.nameEn || n?.name || ""))
          .filter(Boolean);
      }
      if (typeof notes === "string") {
        return notes.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const topNotesArr = normalizeNotes(p.topNotes);
    const heartNotesArr = normalizeNotes(p.heartNotes);
    const baseNotesArr = normalizeNotes(p.baseNotes);

    const prodImages: string[] = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.imageUrl ? [p.imageUrl] : []);

    const perfumerStr = p.perfumer || (Array.isArray(p.perfumers) ? p.perfumers.join(", ") : "") || (p as any).nose || "";
    const perfumerBioStr = p.perfumerBio || "";

    // Numeric price clean (handles number, "1,850 AED", "1850", or undefined without throwing)
    const rawPriceClean = p.price !== undefined && p.price !== null
      ? String(p.price).replace(/[^0-9.]/g, "")
      : "";
    const defaultPriceNum = Number(rawPriceClean) || 1000;

    const rawVariants: any[] = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [];
    const initialVariants: ProductVariantItem[] = rawVariants.length > 0
      ? rawVariants.map((v, i) => {
          const rawBaseNum = Number(
            v.basePrice ??
            v.regularPrice ??
            v.originalPrice ??
            (typeof v.price === "string" ? Number(v.price.replace(/[^0-9.]/g, "")) : v.price)
          ) || defaultPriceNum;

          const rawSellingNum = Number(
            v.price !== undefined && v.price !== null
              ? (typeof v.price === "string" ? Number(v.price.replace(/[^0-9.]/g, "")) : v.price)
              : (v.discountPrice ?? rawBaseNum)
          ) || rawBaseNum;

          const volNum = typeof v.volume === "number"
            ? v.volume
            : (v.volumeMl || parseInt(String(v.volume || "100").replace(/[^0-9]/g, "") || "100", 10) || 100);

          const stockNum = v.stock !== undefined
            ? Number(v.stock)
            : (v.stockQuantity !== undefined ? Number(v.stockQuantity) : (p.stock || 20));

          const wh = v.warehouse || p.warehouse || "DXB-MAIN";

          return {
            id: v.id || `var-${p.id}-${i}-${Date.now()}`,
            sku: v.sku || (i === 0 ? (pSku || `SKU-${volNum}`) : `${pSku || "SKU"}-${volNum}`),
            volume: volNum,
            volumeMl: volNum,
            basePrice: rawBaseNum,
            regularPrice: rawBaseNum,
            originalPrice: rawBaseNum,
            price: rawSellingNum,
            discountPrice: rawSellingNum < rawBaseNum ? rawSellingNum : null,
            salePrice: rawSellingNum < rawBaseNum ? rawSellingNum : null,
            stock: stockNum,
            stockQuantity: stockNum,
            warehouse: wh,
            isDefault: v.isDefault !== undefined ? Boolean(v.isDefault) : i === 0,
          };
        })
      : [
          {
            id: `var-${p.id}-1`,
            sku: pSku || "AMO-INT53-100",
            volume: pVolumeMl,
            volumeMl: pVolumeMl,
            basePrice: defaultPriceNum,
            regularPrice: defaultPriceNum,
            originalPrice: defaultPriceNum,
            price: defaultPriceNum,
            discountPrice: null,
            salePrice: null,
            stock: p.stock !== undefined ? Number(p.stock) : 20,
            stockQuantity: p.stock !== undefined ? Number(p.stock) : 20,
            warehouse: p.warehouse || "DXB-MAIN",
            isDefault: true,
          },
        ];

    setProductForm({
      sku: pSku,
      name: pName,
      nameAr: pNameAr,
      brand: pBrand,
      scentFamily: pScentFamily,
      perfumer: perfumerStr,
      perfumerBio: perfumerBioStr,
      concentration: pConcentration,
      volumeMl: pVolumeMl,
      price: rawPriceClean,
      imageUrl: prodImages[0] || p.imageUrl || "",
      images: prodImages,
      stock: p.stock !== undefined ? Number(p.stock) : 20,
      testerStock: p.testerStock !== undefined ? Number(p.testerStock) : 2,
      warehouse: p.warehouse || "DXB-MAIN",
      topNotes: topNotesArr.join(", "),
      heartNotes: heartNotesArr.join(", "),
      baseNotes: baseNotesArr.join(", "),
      descriptionEn: p.descriptionEn || (p as any).description || "",
      descriptionAr: p.descriptionAr || (p as any).descAr || "",
      metaTitle: p.metaTitle || generateProductMetaTitle(pName || "Fragrance", pBrand),
      metaDescription:
        p.metaDescription ||
        generateProductMetaDescription(pName || "Fragrance", pBrand, pConcentration, topNotesArr),
      status: (p.status as any) || "PUBLISHED",
      variants: initialVariants,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name) {
      alert("Product name is required.");
      return;
    }
    if (!productForm.variants || productForm.variants.length === 0) {
      alert("At least one volume variant row must be added before saving.");
      return;
    }
    for (let i = 0; i < productForm.variants.length; i++) {
      const v = productForm.variants[i];
      if (!v) continue;
      const vol = typeof v.volume === "number" ? v.volume : Number(String(v.volume).replace(/[^0-9.]/g, ""));
      if (isNaN(vol) || vol <= 0) {
        alert(`Variant #${i + 1}: Volume (ml) must be a positive number greater than 0.`);
        return;
      }
      const basePrice = Number(v.basePrice ?? v.regularPrice);
      if (isNaN(basePrice) || basePrice <= 0) {
        alert(`Variant #${i + 1} (${vol}ml): Base Price / Regular Price must be a positive number greater than 0 AED.`);
        return;
      }
      const sellingPrice = Number(v.price);
      if (isNaN(sellingPrice) || sellingPrice <= 0) {
        alert(`Variant #${i + 1} (${vol}ml): Selling Price must be a positive number greater than 0 AED.`);
        return;
      }
      if (sellingPrice > basePrice) {
        alert(`Variant #${i + 1} (${vol}ml): Selling Price (${sellingPrice} AED) cannot exceed Base Price (${basePrice} AED).`);
        return;
      }
      const stock = Number(v.stock ?? v.stockQuantity);
      if (isNaN(stock) || stock < 0) {
        alert(`Variant #${i + 1} (${vol}ml): Stock quantity must be 0 or greater.`);
        return;
      }
    }

    let activeVariants = productForm.variants.map((v, i) => {
      const volNum = typeof v.volume === "number" ? v.volume : (Number(String(v.volume).replace(/[^0-9.]/g, "")) || 100);
      const basePrice = Number(v.basePrice ?? v.regularPrice ?? v.price);
      const sellingPrice = Number(v.price ?? basePrice);
      const stock = Number(v.stock ?? v.stockQuantity) >= 0 ? Number(v.stock ?? v.stockQuantity) : 0;
      const warehouse = v.warehouse || productForm.warehouse || "DXB-MAIN";
      const sku = v.sku?.trim() || `${productForm.sku || "SKU"}-${volNum}`;

      return {
        ...v,
        id: v.id || `var-${Date.now()}-${i}`,
        sku,
        volume: volNum,
        volumeMl: volNum,
        basePrice,
        regularPrice: basePrice,
        originalPrice: basePrice,
        price: sellingPrice,
        compareAtPrice: basePrice > sellingPrice ? basePrice : null,
        discountPrice: sellingPrice < basePrice ? sellingPrice : null,
        salePrice: sellingPrice < basePrice ? sellingPrice : null,
        stock,
        stockQuantity: stock,
        warehouse,
      };
    });

    if (activeVariants.length > 0 && !activeVariants.some((v) => v.isDefault)) {
      const first = activeVariants[0];
      if (first) first.isDefault = true;
    }
    const defaultVariant = activeVariants.find((v) => v.isDefault) || activeVariants[0];
    if (!defaultVariant) {
      alert("Invalid variant configuration.");
      return;
    }
    const primarySku = defaultVariant.sku || productForm.sku || `SKU-${slugify(productForm.name)}`;
    const primaryPrice = `${defaultVariant.price} AED`;
    const primaryVolumeMl = defaultVariant.volumeMl || 100;
    const primaryStock = defaultVariant.stock;

    const prodSlug = slugify(`${productForm.brand}-${productForm.name}`);
    const topNotesArr = productForm.topNotes ? productForm.topNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const heartNotesArr = productForm.heartNotes ? productForm.heartNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const baseNotesArr = productForm.baseNotes ? productForm.baseNotes.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const finalMetaTitle =
      productForm.metaTitle.trim() ||
      generateProductMetaTitle(productForm.name, productForm.brand);
    const finalMetaDesc =
      productForm.metaDescription.trim() ||
      generateProductMetaDescription(
        productForm.name,
        productForm.brand,
        productForm.concentration,
        topNotesArr
      );
    const finalDescEn = productForm.descriptionEn.trim() || productForm.name;
    const finalDescAr = productForm.descriptionAr.trim() || productForm.nameAr || productForm.name;

    const productImages = productForm.images && productForm.images.length > 0
      ? productForm.images
      : (productForm.imageUrl ? [productForm.imageUrl] : ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"]);

    const perfumerArray = productForm.perfumer
      ? productForm.perfumer.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newP: ProductItem = {
      id: editingProductId || `p-${Date.now()}`,
      sku: primarySku,
      name: productForm.name,
      nameAr: productForm.nameAr || productForm.name,
      slug: prodSlug,
      brand: productForm.brand,
      brandSlug: slugify(productForm.brand),
      scentFamily: productForm.scentFamily || "Woody Amber",
      perfumer: productForm.perfumer.trim() || undefined,
      perfumers: perfumerArray.length > 0 ? perfumerArray : undefined,
      perfumerBio: productForm.perfumerBio.trim() || undefined,
      concentration: productForm.concentration || "EXTRAIT_DE_PARFUM",
      gender: "UNISEX",
      volumeMl: primaryVolumeMl,
      price: primaryPrice,
      costPrice: "0 AED",
      stock: Number(primaryStock) || 0,
      testerStock: Number(productForm.testerStock) || 0,
      reserved: 0,
      warehouse: productForm.warehouse,
      topNotes: topNotesArr,
      heartNotes: heartNotesArr,
      baseNotes: baseNotesArr,
      descriptionEn: finalDescEn,
      descriptionAr: finalDescAr,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDesc,
      imageUrl: productImages[0] || productForm.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
      images: productImages,
      imageAlt: `${productForm.name} by ${productForm.brand} flacon`,
      status: productForm.status,
      variants: activeVariants,
    };
    // Persist directly to Neon PostgreSQL database via API
    try {
      const token = authSession?.token;
      await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...productForm,
          sku: primarySku,
          price: defaultVariant.price,
          volumeMl: primaryVolumeMl,
          stock: primaryStock,
          variants: activeVariants,
          id: editingProductId || undefined,
          scentFamily: productForm.scentFamily || "Woody Amber",
          perfumer: productForm.perfumer.trim() || undefined,
          perfumers: perfumerArray,
          perfumerBio: productForm.perfumerBio.trim() || undefined,
          images: productImages,
          imageUrl: productImages[0] || productForm.imageUrl,
          descriptionEn: finalDescEn,
          descriptionAr: finalDescAr,
          metaTitle: finalMetaTitle,
          metaDescription: finalMetaDesc,
        }),
      });
    } catch (err) {
      console.warn("DB product creation failed, saved to local state:", err);
    }

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProductId ? { ...item, ...newP, id: editingProductId } : item
        )
      );
      addAuditLog("PRODUCT_UPDATED", `${newP.sku} (${newP.name})`);
    } else {
      setProducts((prev) => [newP, ...prev]);
      addAuditLog("PRODUCT_CREATED", `${newP.sku} (${newP.name}) [SEO: /product/${newP.slug}]`);
    }
    setShowProductModal(false);
    setEditingProductId(null);
    setProductForm({
      sku: "",
      name: "",
      nameAr: "",
      brand: "Amouage",
      scentFamily: "Woody Amber",
      perfumer: "",
      perfumerBio: "",
      concentration: "EXTRAIT_DE_PARFUM",
      volumeMl: 100,
      price: "",
      imageUrl: "",
      images: [] as string[],
      stock: 20,
      testerStock: 2,
      warehouse: "DXB-MAIN",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
      descriptionEn: "",
      descriptionAr: "",
      metaTitle: "",
      metaDescription: "",
      status: "PUBLISHED",
      variants: [
        {
          id: `var-${Date.now()}-1`,
          sku: "",
          volume: "100ml",
          volumeMl: 100,
          price: 1850,
          discountPrice: null,
          stockQuantity: 20,
          isDefault: true,
        },
      ],
    });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      const token = authSession?.token;
      await fetch(`/api/v1/admin/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn("DB product deletion failed:", err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("PRODUCT_DELETED", `Product ${id} (${name})`);
  };

  // Brand Actions
  const handleSaveBrand = async (brand: BrandItem) => {
    try {
      const token = authSession?.token;
      await fetch("/api/v1/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(brand),
      });
    } catch (err) {
      console.warn("DB brand creation failed:", err);
    }
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
  const handleSaveNoteModal = async (note: NoteItem) => {
    try {
      const token = authSession?.token;
      await fetch("/api/v1/admin/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: note.nameEn,
          nameAr: note.nameAr,
          categoryEn: note.family || "General",
          categoryAr: "عام",
          descriptionEn: note.descriptionEn,
          descriptionAr: note.descriptionAr,
          heroImageUrl: note.heroImageUrl,
        }),
      });
    } catch (err) {
      console.warn("DB note creation failed:", err);
    }
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
    downloadExcelTemplate("muschio_luxury_catalog_template.xlsx");
  };

  // Order Actions with Backend Synchronization & Email Trigger
  const updateOrderStatus = async (orderId: string, nextStatus: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    addAuditLog("ORDER_STATUS_UPDATE", `${orderId} -> ${nextStatus}`);

    try {
      const res = await fetch("/api/v1/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: nextStatus,
          reason: reason || (nextStatus === "CANCELLED" ? "Admin cancelled via control panel" : undefined),
        }),
      });
      if (res.ok) {
        if (nextStatus === "CANCELLED") {
          playLuxuryChime("cancel");
          addToast("cancel", "Order Cancelled", `Order ${orderId} status set to CANCELLED. Notification email sent.`);
        } else {
          addToast("order", "Status Updated", `Order ${orderId} set to ${nextStatus}`);
        }
      }
    } catch (err) {
      console.warn("Could not sync order status to server:", err);
    }
  };

  // Dispatch / Resend Order Notifications (WhatsApp & Email)
  const handleResendNotification = async (orderId: string, channel: "whatsapp" | "email") => {
    try {
      const res = await fetch("/api/v1/admin/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, channels: [channel] }),
      });
      if (res.ok) {
        addToast(
          "order",
          `${channel === "whatsapp" ? "WhatsApp" : "Email"} Sent`,
          `Order confirmation re-dispatched to client via ${channel.toUpperCase()}`
        );
      }
    } catch {
      addToast("cancel", "Dispatch Error", "Failed to contact dispatch server");
    }
  };

  // Enquiry Workflow Actions
  const updateEnquiryStatus = async (enquiryId: string, nextStatus: "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED") => {
    setEnquiries((prev) =>
      prev.map((e) =>
        (e.enquiryId === enquiryId || e.id === enquiryId || e.aggregateId === enquiryId)
          ? { ...e, status: nextStatus }
          : e
      )
    );
    addAuditLog("ENQUIRY_STATUS_UPDATE", `${enquiryId} -> ${nextStatus}`);

    try {
      await fetch("/api/v1/admin/enquiries/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiryId, status: nextStatus }),
      });
      addToast("enquiry", "Enquiry Updated", `Status marked as ${nextStatus}`);
    } catch (err) {
      console.warn("Could not update enquiry status on server:", err);
    }
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

  if (!authSession) {
    return <AdminLoginGate onLoginSuccess={(session) => setAuthSession(session)} />;
  }

  return (
    <div
      className={`min-h-screen ${
        adminTheme === "light" ? "bg-neutral-100 text-neutral-900" : "bg-black text-white"
      } flex flex-col md:flex-row font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}
    >
      {/* MOBILE TOP NAVIGATION BAR (< md) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="p-1.5 -ms-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-widest text-base font-bold text-neutral-900 dark:text-white">MUSCHIO</span>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-mono">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize hidden xs:inline">
            {TAB_TITLES[activeTab]}
          </span>
          <button
            onClick={() => setAdminTheme(adminTheme === "light" ? "dark" : "light")}
            className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            title="Toggle Light / Dark"
          >
            {adminTheme === "light" ? "DARK" : "LIGHT"}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Open Live Storefront"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR NAVIGATION (Drawer on Mobile, Static on Desktop) */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-black border-e border-neutral-200 dark:border-neutral-800 flex flex-col justify-between p-4 transform transition-transform duration-200 ease-in-out md:static md:w-64 md:translate-x-0 md:shrink-0 ${
          isMobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-serif font-bold text-sm">
                M
              </div>
              <div>
                <span className="font-serif tracking-widest text-lg font-bold text-neutral-900 dark:text-white block">MUSCHIO</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 block font-mono">Admin Panel</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-sans">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package, count: products.length },
              { id: "brands", label: "Brands", icon: Award, count: brands.length },
              { id: "notes", label: "Notes", icon: Layers, count: notes.length },
              { id: "inventory", label: "Inventory", icon: Warehouse },
              { id: "purchasing", label: "Purchasing", icon: FileText },
              { id: "returns", label: "Returns", icon: RotateCcw, count: returns.length },
              { id: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
              { id: "enquiries", label: "VIP Enquiries", icon: MessageSquare, count: enquiries.filter(e => e.status === "NEW").length || undefined },
              { id: "reviews", label: "Reviews", icon: Star, count: pendingReviewsCount > 0 ? pendingReviewsCount : undefined },
              { id: "markets", label: "Markets", icon: Globe },
              { id: "banners", label: "Banners", icon: ImageIcon, count: banners.length },
              { id: "settings", label: "Settings", icon: Share2 },
              { id: "audit", label: "Audit Log", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-2 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0">
                {authSession.user.name.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-neutral-900 dark:text-white truncate">{authSession.user.name}</div>
                <div className="text-neutral-500 font-mono text-[9px] truncate">{authSession.user.email}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200 dark:border-neutral-800 text-[10px]">
            <span className="font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
              {authSession.user.role.replace("_", " ")}
            </span>
            <div className="text-neutral-900 dark:text-white flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              <span>Active</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              handleLogout();
            }}
            className="w-full py-1.5 px-2 rounded-lg bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut size={12} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto overflow-x-hidden">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 md:pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="font-serif text-2xl font-light text-neutral-900 dark:text-white capitalize">
              {TAB_TITLES[activeTab] || activeTab}
            </h1>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              {TAB_SUBTITLES[activeTab] || "Muschio Fragrance Store Management"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Sync Status Toggle */}
            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              title={isLiveActive ? "Live sync active (Click to pause)" : "Live sync paused (Click to resume)"}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-[11px] font-mono transition-colors ${
                isLiveActive
                  ? "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                  : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isLiveActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveActive ? "bg-emerald-500" : "bg-neutral-400"}`}></span>
              </span>
              <span className="hidden md:inline">{isLiveActive ? "Real-Time Sync" : "Sync Paused"}</span>
            </button>

            {/* Audio Ambient Alert Toggle */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? "Audio chimes active (Click to mute)" : "Audio muted (Click to enable luxury chime)"}
              className={`p-2 border rounded-md transition-colors ${
                isAudioEnabled
                  ? "bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  : "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400"
              }`}
            >
              {isAudioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Notification Bell with Live Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Real-Time Orders & Concierge Notifications"
                className="relative p-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shadow-sm"
              >
                {liveEvents.filter((e) => !e.read).length > 0 ? (
                  <BellRing size={15} className="text-amber-500 animate-pulse" />
                ) : (
                  <Bell size={15} />
                )}
                {liveEvents.filter((e) => !e.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-neutral-400">
                    {liveEvents.filter((e) => !e.read).length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-lg shadow-2xl z-50 overflow-hidden font-sans">
                  <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white">Live Activity Stream</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {liveEvents.length} events
                      </span>
                    </div>
                    {liveEvents.length > 0 && (
                      <button
                        onClick={() => {
                          setLiveEvents((prev) => prev.map((e) => ({ ...e, read: true })));
                        }}
                        className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                    {liveEvents.length === 0 ? (
                      <div className="p-6 text-center text-neutral-400 text-xs space-y-1">
                        <Clock size={20} className="mx-auto mb-1 opacity-50" />
                        <div>No new events received yet.</div>
                        <div className="text-[10px] text-neutral-500">Live tracker is listening for orders, cancellations, and enquiries.</div>
                      </div>
                    ) : (
                      liveEvents.map((evt) => {
                        const p = evt.payload || {};
                        const isOrder = evt.eventName.startsWith("ORDER_");
                        const isCancel = evt.eventName === "ORDER_CANCELLED";
                        return (
                          <div
                            key={evt.id}
                            className={`p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                              !evt.read ? "bg-neutral-50/50 dark:bg-neutral-900/50" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded font-mono ${
                                  isCancel
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : isOrder
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                }`}
                              >
                                {evt.eventName.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                              </span>
                            </div>
                            <div className="font-medium text-neutral-900 dark:text-white mt-1">
                              {p.orderNumber || p.name || "Event Alert"}
                            </div>
                            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-0.5">
                              {p.reason || p.message || `Total: ${p.totalAmount || 0} ${p.currency || "AED"} • ${p.customerName || ""}`}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setActiveTab(isOrder ? "orders" : "enquiries");
                                  setIsNotificationOpen(false);
                                }}
                                className="text-[10px] underline text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                              >
                                View in {isOrder ? "Orders" : "Enquiries"} →
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setAdminTheme(adminTheme === "light" ? "dark" : "light")}
              className="px-3 py-1.5 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-md flex items-center gap-2 transition-colors shadow-sm"
              title="Toggle Monochromatic Black & White Theme"
            >
              <span
                className={`w-2 h-2 rounded-full border border-neutral-400 ${
                  adminTheme === "light" ? "bg-white" : "bg-black"
                }`}
              />
              <span className="capitalize">{adminTheme} (B&W)</span>
            </button>

            <div className="hidden sm:block px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400 rounded-md">
              UAE: 5.0% • KSA: 15.0%
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium text-xs font-sans transition-all flex items-center gap-1.5 rounded-md shadow-sm"
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
              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Net Revenue (MTD)</span>
                <div className="font-serif text-3xl text-neutral-900 dark:text-white font-light">384,250 AED</div>
                <div className="text-emerald-400 text-xs flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>+28.4% vs last month</span>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Pending Orders</span>
                <div className="font-serif text-3xl text-amber-400 font-light">{activeOrdersCount} Orders</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs font-mono">In processing & dispatch</div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Stock</span>
                <div className="font-serif text-3xl text-emerald-400 font-light">{totalStockUnits} Units</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs font-mono">+{totalTesterUnits} Testers</div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Pending Returns</span>
                <div className="font-serif text-3xl text-purple-400 font-light">{returns.length} Units</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs">Awaiting inspection</div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Storefront Social Status:</span>
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
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by SKU, product name, or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600 shadow-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadTemplateDirect}
                  className="px-3.5 py-2 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-medium rounded flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 transition-colors shadow-sm"
                  title="Download clean Excel (.xlsx) template for bulk import"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Download Excel Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCsvModal(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-medium rounded flex items-center gap-2 transition-all shadow-sm"
                  title="Upload products in bulk via Excel (.xlsx) or CSV"
                >
                  <Upload size={14} />
                  <span className="font-semibold">Bulk Excel Upload</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-neutral-300 dark:border-neutral-700 bg-slate-900/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package size={16} className="text-slate-600" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-white block">{p.name}</span>
                              {p.nameAr && (
                                <span className="text-neutral-500 dark:text-neutral-400 text-xs" dir="rtl">
                                  {p.nameAr}
                                </span>
                              )}
                              <span className="text-neutral-500 font-mono text-[11px] block mt-0.5">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                            <span className="text-neutral-500">/product/</span>
                            <span className="text-emerald-400 font-medium">{p.slug}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-sans block mt-0.5">
                            {p.concentration || "Extrait de Parfum"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setActiveTab("brands");
                              setBrandSearch(p.brand);
                            }}
                            className="text-neutral-900 dark:text-neutral-100 font-medium hover:text-accent hover:underline flex items-center gap-1"
                            title="View brand details"
                          >
                            <span>{p.brand}</span>
                            <Award size={11} className="text-amber-400" />
                          </button>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-mono">{p.scentFamily || "Woody Amber"}</span>
                          {p.perfumer && (
                            <span className="text-[10px] text-amber-400/90 flex items-center gap-1 mt-0.5" title={`Master Perfumer: ${p.perfumer}`}>
                              <Sparkles size={10} className="text-amber-400 flex-shrink-0" />
                              <span className="truncate max-w-[130px] font-sans">Nose: {p.perfumer}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-neutral-700 dark:text-neutral-300 block">
                              Top ({p.topNotes?.length || 0}) • Heart ({p.heartNotes?.length || 0}) • Base ({p.baseNotes?.length || 0})
                            </span>
                            {p.topNotes && p.topNotes.length > 0 && (
                              <span className="text-neutral-500 text-[10px] block truncate max-w-xs">
                                Opening: {p.topNotes.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="font-medium text-neutral-900 dark:text-white">{p.price}</div>
                          {p.variants && p.variants.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.variants.map((v, i) => {
                                const orig = Number(v.regularPrice ?? v.price);
                                const hasDisc = v.discountPrice && Number(v.discountPrice) < orig;
                                return (
                                  <span
                                    key={v.id || i}
                                    className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                                      v.isDefault
                                        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                                        : "bg-slate-800 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                                    }`}
                                    title={`${v.sku} - ${v.volume}: ${hasDisc ? `${v.discountPrice} AED (MRP: ${orig} AED)` : `${orig} AED`} | Stock: ${v.stockQuantity}`}
                                  >
                                    {v.volume}
                                    {hasDisc && <span className="ms-0.5 text-emerald-400 font-bold">%</span>}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-500 block">{p.volumeMl || 100}ml</span>
                          )}
                        </td>
                        <td className="p-4 font-mono">
                          <span className="text-emerald-400 block">{p.stock} sealed ({p.warehouse})</span>
                          {p.variants && p.variants.length > 1 && (
                            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block">
                              Total across {p.variants.length} sizes: {p.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)}
                            </span>
                          )}
                          <span className="text-purple-400 text-[11px]">+{p.testerStock} testers</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                            <CheckCircle2 size={11} />
                            <span>SEO Ready</span>
                          </span>
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-emerald-400 transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={`/en/product/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-emerald-400 transition-colors"
                              title="View Storefront Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
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

            {showProductModal && (
              <div
                className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
                onClick={() => setShowProductModal(false)}
              >
                <div
                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl p-6 space-y-4 rounded-lg shadow-2xl max-h-[92vh] overflow-y-auto my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-medium">
                        {editingProductId ? "Edit Product" : "Add Product"}
                      </h3>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {editingProductId ? "Update product details, pricing, descriptions, and SEO meta tags" : "Product details, pricing, descriptions, and SEO meta tags"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProductModal(false);
                        setEditingProductId(null);
                      }}
                      className="text-neutral-500 hover:text-black dark:hover:text-white p-1 rounded transition-colors"
                      title="Close Modal"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">SKU Code *</label>
                        <input
                          type="text"
                          placeholder="e.g. AMO-INT53-100"
                          value={productForm.sku || ""}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono focus:outline-none focus:border-black dark:focus:border-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Brand *</label>
                        <select
                          value={productForm.brand || ""}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
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
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Product Name (English) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Taif Extrait de Parfum"
                        value={productForm.name || ""}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Product Name (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="e.g. ورد الطائف إكستريت دي بارفان"
                        value={productForm.nameAr || ""}
                        onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>

                    {/* Olfactory Scent Family & Concentration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Scent Family (Olfactory Classification) *</label>
                        <select
                          value={productForm.scentFamily || "Woody Amber"}
                          onChange={(e) => setProductForm({ ...productForm, scentFamily: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        >
                          <option value="Woody Amber">Woody Amber (خشب العنبر)</option>
                          <option value="Amber Floral">Amber Floral (عنبر زهري)</option>
                          <option value="Fresh Aromatic Citrus">Fresh Aromatic Citrus (حمضيات أروماتية)</option>
                          <option value="Woody Amber Oud">Woody Amber Oud (عود خشب العنبر)</option>
                          <option value="Leather & Smoke">Leather & Smoke (جلدي دخاني)</option>
                          <option value="Oriental Spicy">Oriental Spicy (شرقي حار)</option>
                          <option value="Gourmand & Vanilla">Gourmand & Vanilla (غورماند وفانيليا)</option>
                          <option value="Chypre Floral">Chypre Floral (شبر زهري)</option>
                          <option value="Aquatic & Fresh">Aquatic & Fresh (مائي منعش)</option>
                          <option value="Floral">Floral (زهري)</option>
                          <option value="Woody">Woody (خشبي)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Concentration *</label>
                        <select
                          value={productForm.concentration || "EXTRAIT_DE_PARFUM"}
                          onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        >
                          <option value="EXTRAIT_DE_PARFUM">Extrait de Parfum (30-53%)</option>
                          <option value="PARFUM">Parfum Pure (20-30%)</option>
                          <option value="EAU_DE_PARFUM">Eau de Parfum (15-20%)</option>
                          <option value="PARFUM_OIL">Pure Attar / Perfume Oil</option>
                        </select>
                      </div>
                    </div>

                    {/* Master Perfumer(s) / Nose Details */}
                    <div className="p-3.5 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                          <Award size={13} />
                          <span>Master Perfumer(s) / Nose (الأنف العطري)</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">Storefront: Maison & Perfumer Details</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-neutral-700 dark:text-neutral-300 text-[10px] font-medium">
                            Perfumer Names (multiple names can be written separated by commas)
                          </label>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">Multiple Noses Supported</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Pierre Negrin, Renaud Salmon, Karine Vinchon"
                          value={productForm.perfumer || ""}
                          onChange={(e) => setProductForm({ ...productForm, perfumer: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>

                      {/* Interactive Perfumer Badges */}
                      {(productForm.perfumer || "").trim() && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Tagged Perfumers:</span>
                          {productForm.perfumer
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((name, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium"
                              >
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = productForm.perfumer
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter((s) => s && s.toLowerCase() !== name.toLowerCase());
                                    setProductForm({ ...productForm, perfumer: filtered.join(", ") });
                                  }}
                                  className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors ml-0.5"
                                  title={`Remove ${name}`}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Quick-Add Renowned Noses */}
                      <div className="pt-1 border-t border-neutral-200 dark:border-neutral-800/80">
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mb-1.5">Quick-Add Master Perfumer:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            "Pierre Negrin",
                            "Francis Kurkdjian",
                            "Quentin Bisch",
                            "Dominique Ropion",
                            "Roja Dove",
                            "Chris Maurice",
                            "Alberto Morillas",
                            "Renaud Salmon",
                            "Karine Vinchon",
                          ].map((perfumerSuggestion) => {
                            const currentPerfumers = (productForm.perfumer || "")
                              .split(",")
                              .map((s) => s.trim().toLowerCase())
                              .filter(Boolean);
                            const isAlreadyAdded = currentPerfumers.includes(perfumerSuggestion.toLowerCase());
                            return (
                              <button
                                key={perfumerSuggestion}
                                type="button"
                                onClick={() => {
                                  if (isAlreadyAdded) return;
                                  const currentList = (productForm.perfumer || "")
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const updated = [...currentList, perfumerSuggestion].join(", ");
                                  setProductForm({ ...productForm, perfumer: updated });
                                }}
                                disabled={isAlreadyAdded}
                                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                                  isAlreadyAdded
                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700 cursor-default"
                                    : "bg-white dark:bg-neutral-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-300 border border-neutral-300 dark:border-neutral-700"
                                }`}
                              >
                                {isAlreadyAdded ? `✓ ${perfumerSuggestion}` : `+ ${perfumerSuggestion}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 text-[10px] mb-1 font-medium">Perfumer Heritage / Bio Note</label>
                        <input
                          type="text"
                          placeholder="e.g. Master French perfumer famed for architectural incense and royal extraits"
                          value={productForm.perfumerBio || ""}
                          onChange={(e) => setProductForm({ ...productForm, perfumerBio: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    {/* Editorial Product Descriptions */}
                    <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <FileText size={13} className="text-amber-500 dark:text-amber-400" />
                          <span>Product Editorial Descriptions</span>
                        </span>
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Product Description (English)</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Formulated at a monumental 53% concentration and aged for six months in Oman. Opening with spicy oregano..."
                          value={productForm.descriptionEn || ""}
                          onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs leading-relaxed focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Product Description (Arabic)</label>
                        <textarea
                          rows={3}
                          dir="rtl"
                          placeholder="e.g. بتركيز أسطوري يبلغ 53% ومعتق لمدة ستة أشهر في عُمان. يفتتح بنفحات الأوريغانو والفلفل الحار..."
                          value={productForm.descriptionAr || ""}
                          onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs leading-relaxed focus:outline-none focus:border-black dark:focus:border-white font-sans"
                        />
                      </div>
                    </div>

                    {/* Dynamic Bottle Volume Variants & Warehouse Inventory Table */}
                    <div className="p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Layers size={14} className="text-amber-500 dark:text-amber-400" />
                            <span className="text-xs font-semibold text-neutral-900 dark:text-white tracking-wide">
                              Multi-Volume Variants & Warehouse Inventory (أحجام العطور والمستودعات) *
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                              Dynamic Builder
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                            Configure multiple volume options per product (e.g. 30ml, 50ml, 100ml) with dual pricing (Selling Price vs. Base MRP) and warehouse inventory.
                          </p>
                        </div>
                        {/* Quick-add buttons */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Quick Add:</span>
                          {[30, 50, 100, 200].map((volNum) => (
                            <button
                              key={volNum}
                              type="button"
                              onClick={() => {
                                const exists = productForm.variants.some((v) => Number(v.volume) === volNum || Number(v.volumeMl) === volNum);
                                if (exists) return;
                                const baseSku = productForm.sku || "FRAG";
                                const suggestedSku = `${baseSku}-${volNum}`;
                                const refBase = Number(productForm.variants[0]?.basePrice || productForm.variants[0]?.price) || 1500;
                                const ratio = volNum / 100;
                                const approxBase = Math.round((refBase * (ratio < 1 ? ratio * 1.15 : ratio * 0.95)) / 10) * 10;
                                const approxSelling = Math.round((approxBase * 0.88) / 10) * 10;
                                const newVariant: ProductVariantItem = {
                                  id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                  sku: suggestedSku,
                                  volume: volNum,
                                  volumeMl: volNum,
                                  basePrice: approxBase,
                                  regularPrice: approxBase,
                                  price: approxSelling,
                                  stock: 15,
                                  stockQuantity: 15,
                                  warehouse: "DXB-MAIN",
                                  isDefault: false,
                                };
                                setProductForm({
                                  ...productForm,
                                  variants: [...productForm.variants, newVariant],
                                });
                              }}
                              className="px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-300 border border-neutral-300 dark:border-neutral-700 rounded transition-colors"
                            >
                              + {volNum}ml
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variant Table */}
                      <div className="overflow-x-auto border border-neutral-300 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
                        <table className="w-full text-start text-xs font-sans">
                          <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[10px] border-b border-neutral-300 dark:border-neutral-800">
                            <tr>
                              <th className="p-2.5 text-start font-medium">Volume (ml) *</th>
                              <th className="p-2.5 text-start font-medium">Selling Price (AED) *</th>
                              <th className="p-2.5 text-start font-medium">Base Price / Regular (AED) *</th>
                              <th className="p-2.5 text-start font-medium">Stock Quantity *</th>
                              <th className="p-2.5 text-start font-medium">Warehouse Location *</th>
                              <th className="p-2.5 text-center font-medium w-16">Default</th>
                              <th className="p-2.5 text-end font-medium w-12">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {productForm.variants.map((v, index) => {
                              const selling = Number(v.price) || 0;
                              const base = Number(v.basePrice ?? v.regularPrice) || 0;
                              const isOverpriced = selling > base && base > 0;
                              const isDiscounted = selling < base && base > 0 && selling > 0;
                              const savingsPct = isDiscounted ? Math.round(((base - selling) / base) * 100) : 0;
                              const currentVol = v.volume !== undefined && v.volume !== null
                                ? (typeof v.volume === "number" ? v.volume : (parseInt(String(v.volume).replace(/[^0-9]/g, "") || "100", 10) || ""))
                                : "";
                              const currentSelling = v.price !== undefined && v.price !== null
                                ? (typeof v.price === "number" ? v.price : (Number(String(v.price).replace(/[^0-9.]/g, "")) || ""))
                                : "";
                              const currentBase = v.basePrice !== undefined && v.basePrice !== null
                                ? (typeof v.basePrice === "number" ? v.basePrice : (Number(String(v.basePrice).replace(/[^0-9.]/g, "")) || ""))
                                : (v.regularPrice !== undefined && v.regularPrice !== null
                                    ? (typeof v.regularPrice === "number" ? v.regularPrice : (Number(String(v.regularPrice).replace(/[^0-9.]/g, "")) || ""))
                                    : "");
                              const currentStock = v.stock !== undefined && v.stock !== null
                                ? Number(v.stock)
                                : (v.stockQuantity !== undefined ? Number(v.stockQuantity) : 0);

                              return (
                                <tr
                                  key={v.id || index}
                                  className={`transition-colors ${
                                    v.isDefault ? "bg-amber-500/10 hover:bg-amber-500/15" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                  }`}
                                >
                                  {/* Volume (ml) */}
                                  <td className="p-2.5">
                                    <div className="space-y-1">
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="1"
                                          step="1"
                                          placeholder="100"
                                          value={currentVol}
                                          onChange={(e) => {
                                            const val = Number(e.target.value) || 0;
                                            const updated = [...productForm.variants];
                                            updated[index] = {
                                              ...v,
                                              volume: val,
                                              volumeMl: val,
                                            };
                                            setProductForm({ ...productForm, variants: updated });
                                          }}
                                          className="w-24 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono focus:border-black dark:focus:border-white focus:outline-none"
                                          required
                                        />
                                        <span className="absolute end-2 top-2 text-[10px] text-neutral-500 pointer-events-none">ml</span>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder={v.sku || `${productForm.sku || "SKU"}-${v.volume || 100}`}
                                        value={v.sku || ""}
                                        onChange={(e) => {
                                          const updated = [...productForm.variants];
                                          updated[index] = { ...v, sku: e.target.value };
                                          setProductForm({ ...productForm, variants: updated });
                                        }}
                                        className="w-24 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] px-1.5 py-0.5 rounded font-mono focus:text-neutral-900 dark:focus:text-white focus:outline-none"
                                        title="Variant SKU (optional / auto-generated)"
                                      />
                                    </div>
                                  </td>

                                  {/* Selling Price (AED) */}
                                  <td className="p-2.5">
                                    <div className="space-y-1">
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="1590"
                                        value={currentSelling}
                                        onChange={(e) => {
                                          const val = Number(e.target.value) || 0;
                                          const updated = [...productForm.variants];
                                          updated[index] = {
                                            ...v,
                                            price: val,
                                            discountPrice: val,
                                            salePrice: val,
                                          };
                                          setProductForm({ ...productForm, variants: updated });
                                        }}
                                        className={`w-32 bg-white dark:bg-neutral-900 border px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none ${
                                          isOverpriced
                                            ? "border-rose-500 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/30"
                                            : isDiscounted
                                            ? "border-emerald-500/60 text-emerald-600 dark:text-emerald-300"
                                            : "border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-black dark:focus:border-white"
                                        }`}
                                        required
                                      />
                                      {isOverpriced && (
                                        <div className="text-[9px] text-rose-500 font-mono">
                                          ⚠ Exceeds Base ({base} AED)
                                        </div>
                                      )}
                                      {isDiscounted && (
                                        <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                                          Save {savingsPct}% ({base - selling} AED off)
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Base Price / Regular Price (AED) */}
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      placeholder="1850"
                                      value={currentBase}
                                      onChange={(e) => {
                                        const val = Number(e.target.value) || 0;
                                        const updated = [...productForm.variants];
                                        updated[index] = {
                                          ...v,
                                          basePrice: val,
                                          regularPrice: val,
                                          originalPrice: val,
                                        };
                                        setProductForm({ ...productForm, variants: updated });
                                      }}
                                      className="w-32 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono focus:border-black dark:focus:border-white focus:outline-none"
                                      required
                                    />
                                  </td>

                                  {/* Stock Quantity */}
                                  <td className="p-2.5">
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      placeholder="20"
                                      value={currentStock}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value) || 0);
                                        const updated = [...productForm.variants];
                                        updated[index] = {
                                          ...v,
                                          stock: val,
                                          stockQuantity: val,
                                        };
                                        setProductForm({ ...productForm, variants: updated });
                                      }}
                                      className="w-24 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-2.5 py-1.5 rounded text-xs font-mono focus:border-black dark:focus:border-white focus:outline-none"
                                      required
                                    />
                                  </td>

                                  {/* Warehouse Location */}
                                  <td className="p-2.5">
                                    <select
                                      value={v.warehouse || "DXB-MAIN"}
                                      onChange={(e) => {
                                        const updated = [...productForm.variants];
                                        updated[index] = {
                                          ...v,
                                          warehouse: e.target.value,
                                        };
                                        setProductForm({ ...productForm, variants: updated });
                                      }}
                                      className="w-36 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-2.5 py-1.5 rounded text-xs focus:border-black dark:focus:border-white focus:outline-none"
                                    >
                                      <option value="DXB-MAIN">DXB-MAIN (Dubai)</option>
                                      <option value="RUH-HUB">RUH-HUB (Riyadh)</option>
                                      <option value="AUH-VAULT">AUH-VAULT (Abu Dhabi)</option>
                                      <option value="JED-STORE">JED-STORE (Jeddah)</option>
                                    </select>
                                  </td>

                                  {/* Default Variant Indicator */}
                                  <td className="p-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = productForm.variants.map((item, i) => ({
                                          ...item,
                                          isDefault: i === index,
                                        }));
                                        setProductForm({ ...productForm, variants: updated });
                                      }}
                                      title={v.isDefault ? "Default bottle variant (active on PDP)" : "Click to set as default bottle variant"}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        v.isDefault
                                          ? "text-amber-700 dark:text-amber-400 bg-amber-500/20 font-bold border border-amber-500/40"
                                          : "text-neutral-500 hover:text-black dark:hover:text-white border border-transparent"
                                      }`}
                                    >
                                      {v.isDefault ? "★ Primary" : "Set"}
                                    </button>
                                  </td>

                                  {/* Remove Action */}
                                  <td className="p-2.5 text-end">
                                    <button
                                      type="button"
                                      disabled={productForm.variants.length <= 1}
                                      onClick={() => {
                                        if (productForm.variants.length <= 1) return;
                                        const filtered = productForm.variants.filter((_, i) => i !== index);
                                        if (v.isDefault && filtered.length > 0 && filtered[0]) {
                                          filtered[0].isDefault = true;
                                        }
                                        setProductForm({ ...productForm, variants: filtered });
                                      }}
                                      title={productForm.variants.length <= 1 ? "At least one volume variant is required" : "Remove variant"}
                                      className={`p-1.5 rounded transition-colors ${
                                        productForm.variants.length <= 1
                                          ? "text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                                          : "text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10"
                                      }`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Button & Footer info */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const count = productForm.variants.length + 1;
                            const defaultVol = count === 2 ? 50 : count === 3 ? 30 : 200;
                            const baseRef = Number(productForm.variants[0]?.basePrice || 1500);
                            const approxBase = Math.round((baseRef * (defaultVol / 100)) / 10) * 10 || 800;
                            const approxSelling = Math.round((approxBase * 0.9) / 10) * 10 || 720;
                            const newVariant: ProductVariantItem = {
                              id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              sku: productForm.sku ? `${productForm.sku}-${defaultVol}` : `SKU-${defaultVol}`,
                              volume: defaultVol,
                              volumeMl: defaultVol,
                              basePrice: approxBase,
                              regularPrice: approxBase,
                              price: approxSelling,
                              stock: 10,
                              stockQuantity: 10,
                              warehouse: productForm.warehouse || "DXB-MAIN",
                              isDefault: false,
                            };
                            setProductForm({
                              ...productForm,
                              variants: [...productForm.variants, newVariant],
                            });
                          }}
                          className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium text-xs rounded shadow flex items-center gap-1.5 transition-all"
                        >
                          <Plus size={13} />
                          <span>+ Add Volume Variant</span>
                        </button>
                        <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                          {productForm.variants.length} variant{productForm.variants.length === 1 ? "" : "s"} configured · Total Stock:{" "}
                          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {productForm.variants.reduce((sum, v) => sum + (Number(v.stock ?? v.stockQuantity) || 0), 0)} units
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Scent Notes Pyramid */}
                    <div className="p-3 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-2">
                      <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Layers size={13} />
                        <span>Scent Notes (comma-separated, auto-linked to note pages)</span>
                      </span>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 text-[10px] font-medium">Top Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Bergamot, Pink Pepper, Taif Rose"
                          value={productForm.topNotes || ""}
                          onChange={(e) => setProductForm({ ...productForm, topNotes: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 text-[10px] font-medium">Heart Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Silver Frankincense, Jasmine, Cedarwood"
                          value={productForm.heartNotes || ""}
                          onChange={(e) => setProductForm({ ...productForm, heartNotes: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 text-[10px] font-medium">Base Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Cambodian Oud, Ambergris, Sandalwood"
                          value={productForm.baseNotes || ""}
                          onChange={(e) => setProductForm({ ...productForm, baseNotes: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    <MultiImageUploadField
                      label="Product Flacon & Gallery Photography (Cloudinary)"
                      images={productForm.images && productForm.images.length > 0 ? productForm.images : (productForm.imageUrl ? [productForm.imageUrl] : [])}
                      onChange={(urls) => {
                        setProductForm({
                          ...productForm,
                          images: urls,
                          imageUrl: urls[0] || "",
                        });
                      }}
                      folder="muschio/products"
                      hint="Upload multiple luxury photos (bottle flacon, packaging box, lifestyle presentation). The first photo with ★ is the primary storefront cover."
                    />

                    {/* Google SERP SEO Meta Title & Meta Description */}
                    <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <Globe size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Search Engine Optimization (SEO) & Google SERP</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const topNotesArr = productForm.topNotes
                              ? productForm.topNotes.split(",").map((s) => s.trim()).filter(Boolean)
                              : [];
                            setProductForm({
                              ...productForm,
                              metaTitle: generateProductMetaTitle(productForm.name || "Fragrance", productForm.brand || "Brand"),
                              metaDescription: generateProductMetaDescription(
                                productForm.name || "Fragrance",
                                productForm.brand || "Brand",
                                productForm.concentration,
                                topNotesArr
                              ),
                            });
                          }}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                          title="Auto-generate SEO title and description based on current name, brand, concentration, and notes"
                        >
                          <Sparkles size={11} />
                          <span>Auto-Generate SEO Tags</span>
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-neutral-700 dark:text-neutral-300 font-medium">Meta Title (Google)</label>
                          <span
                            className={`text-[10px] font-mono ${
                              (productForm.metaTitle || "").length > 60 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-neutral-500"
                            }`}
                          >
                            {(productForm.metaTitle || "").length}/60 chars
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder={generateProductMetaTitle(productForm.name || "Fragrance", productForm.brand || "Brand")}
                          value={productForm.metaTitle || ""}
                          onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-neutral-700 dark:text-neutral-300 font-medium">Meta Description (Google)</label>
                          <span
                            className={`text-[10px] font-mono ${
                              (productForm.metaDescription || "").length > 160 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-neutral-500"
                            }`}
                          >
                            {(productForm.metaDescription || "").length}/160 chars
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder={generateProductMetaDescription(
                            productForm.name || "Fragrance",
                            productForm.brand || "Brand",
                            productForm.concentration
                          )}
                          value={productForm.metaDescription || ""}
                          onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs leading-relaxed focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>

                      {/* Live Google Search Preview Box */}
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded space-y-1 font-sans">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Globe size={11} />
                          <span>Google Search Preview</span>
                        </span>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 overflow-x-auto text-[11px]">
                          <span>https://muschio.luxury</span>
                          <span>›</span>
                          <span>en</span>
                          <span>›</span>
                          <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate">
                            product › {slugify(`${productForm.brand || "brand"}-${productForm.name || "product"}`)}
                          </span>
                        </div>
                        <div className="text-sm text-blue-600 dark:text-[#8AB4F8] hover:underline font-medium line-clamp-1">
                          {productForm.metaTitle || generateProductMetaTitle(productForm.name || "Fragrance", productForm.brand || "Brand")}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                          {productForm.metaDescription ||
                            generateProductMetaDescription(
                              productForm.name || "Fragrance",
                              productForm.brand || "Brand",
                              productForm.concentration
                            )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Showroom & Boutique Testers (Units)</label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.testerStock ?? 0}
                          onChange={(e) => setProductForm({ ...productForm, testerStock: Number(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white"
                          placeholder="2"
                        />
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded flex flex-col justify-center text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">Primary Warehouse Fulfillment:</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {productForm.variants[0]?.warehouse || "DXB-MAIN (Dubai Hub)"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => {
                        setShowProductModal(false);
                        setEditingProductId(null);
                      }}
                      className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 size={14} />
                      <span>{editingProductId ? "Update Product" : "Save Product"}</span>
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
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by brand name or country..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600"
                />
              </div>

              <button
                onClick={() => {
                  setBrandToEdit(null);
                  setShowBrandModal(true);
                }}
                className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-md shadow-amber-950/40"
              >
                <Plus size={14} />
                <span>Add Brand</span>
              </button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-neutral-300 dark:border-neutral-700/80 shrink-0 flex items-center justify-center p-1">
                              {b.logoUrl || b.heroImageUrl ? (
                                <img
                                  src={b.logoUrl || b.heroImageUrl}
                                  alt={b.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="font-serif text-amber-300 font-bold text-sm">
                                  {b.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-white block text-sm">{b.name}</span>
                              <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{b.countryEn || "Prestige House"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                            <span className="text-neutral-500">/brands/</span>
                            <span className="text-amber-400 font-medium">{b.slug}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              b.type === "NICHE"
                                ? "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {b.type === "NICHE" ? "Niche Brand" : "Designer"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-neutral-900 dark:text-neutral-100 block">{b.countryEn}</span>
                          <span className="text-neutral-500 text-[10px]">Est. {b.year}</span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="text-emerald-400 font-medium">
                            {products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length} products
                          </span>
                        </td>
                        <td className="p-4 text-neutral-500 dark:text-neutral-400 max-w-sm truncate text-[11px]">
                          {b.storyEn || "Brand description available."}
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setBrandToEdit(b);
                                setShowBrandModal(true);
                              }}
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-amber-400 transition-colors"
                              title="Edit Brand"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={`/en/brands/${b.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-emerald-400 transition-colors"
                              title="View Brand Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteBrand(b.id, b.name)}
                              className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
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

        {/* 7.5 VIP CONCIERGE & CLIENT ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Total Requests</span>
                <div className="font-serif text-2xl font-light text-neutral-900 dark:text-white mt-1">
                  {enquiries.length}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">New Pending</span>
                <div className="font-serif text-2xl font-light text-amber-500 mt-1">
                  {enquiries.filter((e) => e.status === "NEW").length}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">In Progress</span>
                <div className="font-serif text-2xl font-light text-blue-500 mt-1">
                  {enquiries.filter((e) => e.status === "IN_PROGRESS").length}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Resolved</span>
                <div className="font-serif text-2xl font-light text-emerald-500 mt-1">
                  {enquiries.filter((e) => e.status === "RESOLVED").length}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {["ALL", "NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setEnquiryStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors font-mono ${
                      enquiryStatusFilter === st
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-medium"
                        : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "All Requests" : st}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search by client, scent, email..."
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                className="w-full sm:w-72 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white px-3 py-1.5 rounded focus:outline-none"
              />
            </div>

            {/* Enquiries List */}
            <div className="space-y-3">
              {enquiries
                .filter((e) => {
                  if (enquiryStatusFilter !== "ALL" && e.status !== enquiryStatusFilter) return false;
                  if (enquirySearch.trim()) {
                    const q = enquirySearch.toLowerCase();
                    return (
                      e.name.toLowerCase().includes(q) ||
                      e.email.toLowerCase().includes(q) ||
                      (e.subject && e.subject.toLowerCase().includes(q)) ||
                      (e.fragranceInterest && e.fragranceInterest.toLowerCase().includes(q))
                    );
                  }
                  return true;
                })
                .map((enq) => {
                  const id = enq.enquiryId || enq.aggregateId || enq.id;
                  const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, "") : "";
                  return (
                    <div
                      key={id}
                      className="p-5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-900">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-neutral-900 dark:text-white">{enq.name}</span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                                enq.status === "NEW"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : enq.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                  : enq.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                              }`}
                            >
                              {enq.status}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">
                            {enq.email} {enq.phone && `• ${enq.phone}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={enq.status}
                            onChange={(e) => updateEnquiryStatus(id, e.target.value as any)}
                            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1.5 rounded focus:outline-none"
                          >
                            <option value="NEW">NEW</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${enq.name}, thank you for contacting Muschio Haute Parfumerie Concierge.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs rounded flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <a
                            href={`mailto:${enq.email}?subject=${encodeURIComponent(`Muschio Concierge: ${enq.subject || "VIP Fragrance Consultation"}`)}`}
                            className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs rounded flex items-center gap-1.5 transition-colors"
                          >
                            <Send size={13} />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>

                      {enq.fragranceInterest && (
                        <div className="text-xs">
                          <span className="text-neutral-500 font-mono text-[11px] uppercase tracking-wider block">
                            Fragrance / Maison of Interest:
                          </span>
                          <span className="font-serif text-sm text-neutral-900 dark:text-white mt-0.5 block">
                            {enq.fragranceInterest}
                          </span>
                        </div>
                      )}

                      <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <strong className="block text-neutral-900 dark:text-white mb-1 font-sans">{enq.subject || "Message"}:</strong>
                        {enq.message}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
                        <span>ID: {id}</span>
                        <span>
                          {enq.createdAt
                            ? new Date(enq.createdAt).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {enquiries.length === 0 && (
                <div className="p-12 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                  <div className="font-serif text-lg text-neutral-800 dark:text-neutral-200">No VIP Enquiries Yet</div>
                  <div className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    When customers submit bespoke fragrance consultations on the storefront, they appear here live with instant alerts.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by note name, Arabic title, or family..."
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {notes.length} notes
                </span>
                <button
                  onClick={() => {
                    setNoteToEdit(null);
                    setShowNoteModal(true);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950/40"
                >
                  <Plus size={14} />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-neutral-300 dark:border-neutral-700/80 shrink-0 flex items-center justify-center">
                              {n.heroImageUrl || n.thumbnailUrl ? (
                                <img
                                  src={n.heroImageUrl || n.thumbnailUrl}
                                  alt={n.nameEn}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-serif text-purple-400 font-bold text-sm">
                                  {n.nameEn.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-neutral-900 dark:text-white block text-sm">{n.nameEn}</span>
                              <span className="text-neutral-500 dark:text-neutral-400 text-xs" dir="rtl">
                                {n.nameAr}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                            <span className="text-neutral-500">/notes/</span>
                            <span className="text-purple-400 font-medium">{n.slug}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded">
                            {n.family}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-700 dark:text-neutral-300 text-[11px]">
                          {n.originEn || "Middle East"}
                        </td>
                        <td className="p-4 font-mono text-emerald-400 font-medium">
                          {n.perfumesCount} products
                        </td>
                        <td className="p-4 text-neutral-500 dark:text-neutral-400 max-w-xs truncate text-[11px]">
                          {n.descriptionEn || "Sensory description available."}
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setNoteToEdit(n);
                                setShowNoteModal(true);
                              }}
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-purple-400 transition-colors"
                              title="Edit Note"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={`/en/notes/${n.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-emerald-400 transition-colors"
                              title="View Note Page"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteNote(n.id, n.nameEn)}
                              className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
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
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-neutral-900 dark:text-white">DXB-MAIN (Dubai Central Hub)</span>
                  <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold rounded">DEFAULT WAREHOUSE</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "DXB-MAIN").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-neutral-500">Express Delivery: Dubai, Abu Dhabi, Sharjah</div>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-neutral-900 dark:text-white">RUH-HUB (Riyadh GCC Hub)</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">REGIONAL WAREHOUSE</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "RUH-HUB").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-neutral-500">Express Delivery: Riyadh, Jeddah, Khobar, GCC</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PURCHASING */}
        {activeTab === "purchasing" && (
          <div className="space-y-6">
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 space-y-3 rounded">
              <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Supplier Purchase Orders</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Active purchase orders with official brand distributors in France, Oman, and Italy.</p>
              <div className="divide-y divide-slate-800 text-xs font-mono pt-3">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-900 dark:text-neutral-100">PO-2026-081 • Amouage Luxury LLC (Oman)</span>
                  <span className="text-emerald-400">DELIVERED & VERIFIED</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-900 dark:text-neutral-100">PO-2026-082 • Roja Parfums London (UK)</span>
                  <span className="text-amber-400">IN TRANSIT (AIR FREIGHT)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. RETURNS */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
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
                        <span className="font-semibold text-neutral-900 dark:text-white block">{r.number}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="p-4 text-neutral-700 dark:text-neutral-300">{r.item}</td>
                      <td className="p-4 font-mono text-neutral-700 dark:text-neutral-300">{r.condition}</td>
                      <td className="p-4 font-mono text-purple-400">{r.disposition}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "COMPLETED" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        {r.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleInspectReturn(r.id, "RESTOCK_SELLABLE")}
                            className="px-2.5 py-1 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-[11px] rounded"
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
            {/* Status & Market Filters + Real-Time Live Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-2">
                {["ALL", "PAID", "FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors font-mono ${
                      orderStatusFilter === st
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold"
                        : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "All Statuses" : st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Database Orders: {orders.length}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {["ALL", "AE", "SA", "KW", "QA"].map((mkt) => (
                  <button
                    key={mkt}
                    onClick={() => setOrderMarketFilter(mkt)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      orderMarketFilter === mkt
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
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
                className="w-full sm:w-72 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white px-3 py-1.5 rounded focus:outline-none"
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="p-4 text-start">Order ID / Client</th>
                    <th className="p-4 text-start">Total Amount</th>
                    <th className="p-4 text-start">Payment Provider</th>
                    <th className="p-4 text-start">Market</th>
                    <th className="p-4 text-start">Date / Timeline</th>
                    <th className="p-4 text-start">Status Workflow</th>
                    <th className="p-4 text-end">Dispatch Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders
                    .filter((o) => {
                      if (orderMarketFilter !== "ALL" && o.market !== orderMarketFilter) return false;
                      if (orderStatusFilter !== "ALL" && o.status !== orderStatusFilter) return false;
                      if (orderSearch.trim()) {
                        const q = orderSearch.toLowerCase();
                        return o.number.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <span className="font-semibold text-neutral-900 dark:text-white block">{o.number}</span>
                          <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{o.customer}</span>
                        </td>
                        <td className="p-4 font-mono font-medium text-neutral-900 dark:text-white">{o.amount}</td>
                        <td className="p-4 font-mono text-cyan-400">{o.method}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-800 text-neutral-900 dark:text-neutral-100 text-[10px] font-bold rounded">
                            {o.market}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-500 dark:text-neutral-400">{o.date}</td>
                        <td className="p-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1 rounded focus:outline-none"
                          >
                            <option value="PAID">PAID</option>
                            <option value="FULFILLING">FULFILLING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResendNotification(o.id, "whatsapp")}
                              title="Send / Resend WhatsApp Notification to Client"
                              className="px-2 py-1 rounded bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <MessageSquare size={12} />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResendNotification(o.id, "email")}
                              title="Send / Resend Email Notification to Client"
                              className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <Mail size={12} />
                              <span className="hidden sm:inline">Email</span>
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

        {/* 8. REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-white dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
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
                        <span className="font-semibold text-neutral-900 dark:text-white block">{r.product}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-neutral-900 dark:text-white block font-medium">"{r.title}"</span>
                        <span className="text-amber-400">★ {r.rating} / 5</span>
                      </td>
                      <td className="p-4 font-mono text-neutral-500 dark:text-neutral-400">
                        L: {r.longevity}/5 • S: {r.sillage}/5
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "APPROVED" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-end space-x-2">
                        {r.status !== "APPROVED" && (
                          <button
                            onClick={() => handleReviewAction(r.id, "APPROVED")}
                            className="px-2.5 py-1 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-[11px] rounded"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "REJECTED" && (
                          <button
                            onClick={() => handleReviewAction(r.id, "REJECTED")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-neutral-700 dark:text-neutral-300 text-[11px] rounded"
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
              <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="font-serif text-lg text-neutral-900 dark:text-white">United Arab Emirates (AE)</span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Currency: AED • Standard VAT: 5.0%</p>
                <span className="inline-block px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold rounded">PRIMARY ACTIVE MARKET</span>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="font-serif text-lg text-neutral-900 dark:text-white">Kingdom of Saudi Arabia (SA)</span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Currency: SAR • Standard VAT: 15.0%</p>
                <span className="inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">ACTIVE CROSS-BORDER</span>
              </div>
              <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="font-serif text-lg text-neutral-900 dark:text-white">State of Qatar (QA) & Kuwait (KW)</span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Currencies: QAR / KWD • DDP Express</p>
                <span className="inline-block px-2 py-0.5 bg-slate-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold rounded">WHITE-GLOVE GCC</span>
              </div>
            </div>
          </div>
        )}

        {/* 10. BANNERS & HOMEPAGE CMS */}
        {activeTab === "banners" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Promotional Banners & Sliders</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure hero sliders, campaign banners, and announcements.</p>
              </div>
              <button
                onClick={() => {
                  resetBannerForm();
                  setShowBannerForm(true);
                }}
                className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* Banners List */}
            <div className="grid grid-cols-1 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded flex gap-4 items-center">
                  <img src={b.imageUrl} alt="" className="w-24 h-16 object-cover rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${SLOT_COLORS[b.slot] || "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"}`}>
                        {SLOT_LABELS[b.slot] || b.slot}
                      </span>
                      <span className="font-serif text-sm text-neutral-900 dark:text-white font-medium">{b.titleEn}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">{b.subtitleEn}</p>
                    <span className="text-[10px] font-mono text-neutral-500 block">Link: {b.ctaUrl || "/shop"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditBanner(b)}
                      className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded transition-colors"
                      title="Edit Banner"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => toggleBannerActive(b.id)}
                      className={`p-1.5 rounded transition-colors ${b.isActive ? "text-emerald-600 dark:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" : "text-neutral-400 hover:text-black dark:hover:text-white"}`}
                      title={b.isActive ? "Deactivate" : "Activate"}
                    >
                      {b.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-500 dark:hover:text-rose-400 rounded transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Banner Modal */}
            {showBannerForm && (
              <div
                className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
                onClick={resetBannerForm}
              >
                <div
                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-lg p-6 space-y-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-medium">
                      {editingBanner ? "Edit Campaign Banner" : "Create Campaign Banner"}
                    </h3>
                    <button onClick={resetBannerForm} className="text-neutral-500 hover:text-black dark:hover:text-white p-1 rounded transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Banner Placement Slot</label>
                      <select
                        value={bannerForm.slot}
                        onChange={(e) => setBannerForm({ ...bannerForm, slot: e.target.value as BannerSlot })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                      >
                        <option value="HERO_SLIDER">Hero Slider (Top Masthead)</option>
                        <option value="CAMPAIGN_MID">Campaign Mid-Page</option>
                        <option value="PROMO_STRIP">Promo Strip</option>
                        <option value="ANNOUNCEMENT_BAR">Announcement Bar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Headline (English)</label>
                      <input
                        type="text"
                        placeholder="The Art of | Noble Sillage."
                        value={bannerForm.titleEn}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Headline (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="فن | الحضور المهيب."
                        value={bannerForm.titleAr}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    <MediaUploadField
                      label="Desktop Campaign Banner Artwork (1920x800)"
                      value={bannerForm.imageUrl}
                      onChange={(url) => setBannerForm({ ...bannerForm, imageUrl: url })}
                      folder="muschio/banners/desktop"
                      hint="Upload wide luxury campaign creative or hero visual"
                    />

                    <MediaUploadField
                      label="Mobile Portrait Artwork (Optional - 800x1000)"
                      value={bannerForm.mobileImageUrl}
                      onChange={(url) => setBannerForm({ ...bannerForm, mobileImageUrl: url })}
                      folder="muschio/banners/mobile"
                      hint="Mobile-optimized portrait crop for smartphones"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">CTA Button Text (EN)</label>
                        <input
                          type="text"
                          value={bannerForm.ctaTextEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaTextEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Target URL</label>
                        <input
                          type="text"
                          placeholder="/shop"
                          value={bannerForm.ctaUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaUrl: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={resetBannerForm} className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveBanner} className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded transition-colors">
                      {editingBanner ? "Update Banner" : "Save Banner"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Homepage Section Order */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 rounded space-y-4">
              <h3 className="font-serif text-base text-neutral-900 dark:text-white font-medium">Homepage Visual Section Reordering</h3>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {sections.map((section, idx) => (
                  <div key={section.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-500">{idx + 1}.</span>
                      <span className="text-xs text-neutral-900 dark:text-white font-medium">{SECTION_LABELS[section.sectionType] || section.sectionType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSectionUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSectionDown(idx)}
                        disabled={idx === sections.length - 1}
                        className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => toggleSectionVisible(section.id)}
                        className={`p-1 ${section.isVisible ? "text-emerald-400" : "text-neutral-500"}`}
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
            <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-light flex items-center gap-2">
                    <Share2 size={18} className="text-accent" />
                    <span>Official Social Media Channels</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Configure official links displayed across Storefront Footer, Mobile Drawer, and Schema.org.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Instagram */}
                <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-900 dark:text-white">Instagram Profile</label>
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
                    <span className="text-neutral-500 block text-[11px] mb-1">Handle / Username:</span>
                    <input
                      type="text"
                      value={storeSettings.instagramHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagramHandle: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] mb-1">Full URL:</span>
                    <input
                      type="url"
                      value={storeSettings.instagramUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagramUrl: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* WhatsApp VIP Concierge */}
                <div className="p-4 bg-white dark:bg-black border border-[#25D366]/30 rounded space-y-2">
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
                    <span className="text-neutral-500 block text-[11px] mb-1">Display Hotline:</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappPhone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappPhone: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] mb-1">Clean International Number (No +):</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappNumber}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] mb-1">Default Pre-filled Greeting:</span>
                    <input
                      type="text"
                      value={storeSettings.whatsappDefaultMsg}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsappDefaultMsg: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded text-xs"
                    />
                  </div>
                </div>

                {/* TikTok */}
                <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-900 dark:text-white">TikTok Channel</label>
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
                    <span className="text-neutral-500 block text-[11px] mb-1">Handle:</span>
                    <input
                      type="text"
                      value={storeSettings.tiktokHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tiktokHandle: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] mb-1">URL:</span>
                    <input
                      type="url"
                      value={storeSettings.tiktokUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tiktokUrl: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* X / Twitter */}
                <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-900 dark:text-white">X / Twitter</label>
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
                    <span className="text-neutral-500 block text-[11px] mb-1">Handle:</span>
                    <input
                      type="text"
                      value={storeSettings.twitterHandle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twitterHandle: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px] mb-1">URL:</span>
                    <input
                      type="url"
                      value={storeSettings.twitterUrl}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twitterUrl: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-900 dark:text-white">YouTube Luxury Film Atelier</label>
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
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-2 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar & Hotline */}
            <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded space-y-4 text-xs">
              <h3 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Storefront Announcement Bar & Client Care</h3>
              <div>
                <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Announcement Bar Text (English)</label>
                <input
                  type="text"
                  value={storeSettings.announcementBarEn}
                  onChange={(e) => setStoreSettings({ ...storeSettings, announcementBarEn: e.target.value })}
                  className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-sans"
                />
              </div>
              <div>
                <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Announcement Bar Text (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={storeSettings.announcementBarAr}
                  onChange={(e) => setStoreSettings({ ...storeSettings, announcementBarAr: e.target.value })}
                  className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-sans"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Concierge Email</label>
                  <input
                    type="email"
                    value={storeSettings.conciergeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, conciergeEmail: e.target.value })}
                    className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Free Delivery Minimum (AED)</label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Updates are saved to persistent local state and syncable across sessions.</span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded flex items-center gap-2 transition-colors shadow-lg"
              >
                <Save size={16} />
                <span>Save & Sync All Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* 12. SECURITY & AUDIT */}
        {activeTab === "audit" && (
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 space-y-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-light text-neutral-900 dark:text-white">Immutable Administrative Audit Log</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">All administrative operations, creations, and transitions are tracked here.</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] rounded">
                {auditLogs.length} Events Logged
              </span>
            </div>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <div className="space-x-3">
                    <span className="text-accent font-bold">{log.action}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">[{log.res}]</span>
                  </div>
                  <div className="space-x-4 text-neutral-500">
                    <span>{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* LIVE TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto p-4 bg-white dark:bg-black text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 shrink-0 mt-0.5">
              {t.type === "cancel" ? (
                <AlertTriangle size={15} className="text-rose-500" />
              ) : t.type === "enquiry" ? (
                <MessageSquare size={15} className="text-blue-500" />
              ) : (
                <ShoppingBag size={15} className="text-emerald-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs">{t.title}</span>
                <span className="text-[10px] text-neutral-400 font-mono">{t.time}</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-neutral-400 hover:text-black dark:hover:text-white p-1"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

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
