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
  PanelLeft,
  PanelLeftClose,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  MessageSquare,
  Mail,
  Send,
  Clock,
  AlertTriangle,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  BrandItem,
  NoteItem,
  ProductItem,
  ProductVariantItem,
  CollectionItem,
  TagItem,
  slugify,
  generateProductMetaTitle,
  generateProductMetaDescription,
  downloadExcelTemplate,
} from "./seo-utils";
import { BulkCsvModal } from "./components/BulkCsvModal";
import { BrandModal } from "./components/BrandModal";
import { NoteModal } from "./components/NoteModal";
import { CollectionModal } from "./components/CollectionModal";
import { TagModal } from "./components/TagModal";
import { SearchableTagSelect } from "./components/SearchableTagSelect";
import { AdminLoginGate, AdminAuthSession } from "./components/AdminLoginGate";
import { MediaUploadField } from "./components/MediaUploadField";
import { MultiImageUploadField } from "./components/MultiImageUploadField";
import { OrderDetailModal } from "./components/OrderDetailModal";

type AdminTab =
  | "dashboard"
  | "products"
  | "collections"
  | "tags"
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
  collections: "Collections",
  tags: "Tags & Curations",
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
  collections: "Curate fragrance collections and showcase them in storefront sliders according to your preference",
  tags: "Curate fragrance tags, olfactory classifications, and storefront filter badges",
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
  type: "order" | "cancel" | "enquiry" | "review" | "return" | "settings";
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
  CUSTOM_BANNER: "Promotional Offer & Deal Banner",
  DISCOVERY_SETS: "Discovery Sets Feature",
  JOURNAL_FEATURE: "Muschio Journal",
  TRUST_INDICATORS: "Service Guarantees",
};

const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionItem[] = [
  { id: "sec-1", sectionType: "HERO_BANNER", titleEn: "Campaign Hero", titleAr: "الواجهة الرئيسية", sortOrder: 0, isVisible: true },
  { id: "sec-2", sectionType: "DISCOVERY_STRIP", titleEn: "Quick Category Jump", titleAr: "الاستكشاف السريع", sortOrder: 1, isVisible: true },
  { id: "sec-3", sectionType: "FEATURED_PRODUCTS", titleEn: "Curated Masterpieces", titleAr: "المختارات المميزة", sortOrder: 2, isVisible: true },
  { id: "sec-4", sectionType: "HOUSES_GRID", titleEn: "Shop by Fragrance House", titleAr: "تسوق حسب الدار", sortOrder: 3, isVisible: true },
  { id: "sec-5", sectionType: "NOTES_GRID", titleEn: "Explore by Key Notes", titleAr: "المكتبة العطرية", sortOrder: 4, isVisible: true },
  { id: "sec-6", sectionType: "CUSTOM_BANNER", titleEn: "Promotional Offer & Deal Banner", titleAr: "عروض وحملات خاصة", sortOrder: 5, isVisible: true },
  { id: "sec-7", sectionType: "DISCOVERY_SETS", titleEn: "Bespoke Discovery Sets", titleAr: "مجموعات العينات", sortOrder: 6, isVisible: true },
  { id: "sec-8", sectionType: "JOURNAL_FEATURE", titleEn: "The Muschio Journal", titleAr: "مجلة موسكيو", sortOrder: 7, isVisible: true },
  { id: "sec-9", sectionType: "TRUST_INDICATORS", titleEn: "Service Guarantees & Trust Bar", titleAr: "ضمانات الخدمة والفخامة", sortOrder: 8, isVisible: true },
];

function isMockItem(item: any): boolean {
  if (!item || typeof item !== "object") return false;
  const id = String(item.id || "");
  if ([
    "p1", "p2", "p3", "p4",
    "b1", "b2", "b3", "b4", "b5", "b6",
    "n1", "n2", "n3", "n4", "n5",
    "col-signature", "col-oriental", "col-1", "col-2", "col-3",
    "ord-1", "ord-2", "ord-3",
    "enq-demo-1", "enq-demo-2",
    "ret-1", "ret-2",
    "rev-1", "rev-2",
    "bnr-1", "bnr-2",
    "sec-1", "sec-2", "sec-3", "sec-4", "sec-5", "sec-6", "sec-7", "sec-8",
  ].includes(id)) {
    return true;
  }
  const num = String(item.number || item.orderNumber || "");
  if (["MSC-2026-981245", "MSC-2026-981244", "MSC-2026-981240", "RET-2026-001", "RET-2026-002", "ENQ-DEMO-01", "ENQ-DEMO-02"].includes(num)) {
    return true;
  }
  if (typeof item.customer === "string" && (
    item.customer.includes("Sultan Al-Nuaimi") ||
    item.customer.includes("Fatima Al-Zahra") ||
    item.customer.includes("Rashid Mansoor") ||
    item.customer.includes("Ahmad Al-Ghamdi") ||
    item.customer.includes("Leila H.") ||
    item.customer.includes("Ahmad Al Maktoum") ||
    item.customer.includes("Nasser Al-Qasimi")
  )) {
    return true;
  }
  if (typeof item.name === "string" && (
    item.name.includes("Sheikha Maryam") ||
    item.name.includes("Tariq Bin Laden")
  )) {
    return true;
  }
  return false;
}

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(`muschio_admin_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter((it) => !isMockItem(it));
          try {
            localStorage.setItem(`muschio_admin_${key}`, JSON.stringify(sanitized));
          } catch {}
          return sanitized as unknown as T;
        }
        return parsed;
      }
      return initialValue;
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentState<boolean>(
    "sidebar_collapsed",
    false
  );

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
  const [products, setProducts] = usePersistentState<ProductItem[]>("products", []);

  const [productSearch, setProductSearch] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("ALL");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [adminProductPage, setAdminProductPage] = useState(1);
  const ADMIN_PRODUCTS_PER_PAGE = 15;

  // 1b. TAGS STATE
  const [tags, setTags] = usePersistentState<TagItem[]>("tags", []);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedTagFilter !== "ALL") {
        const hasTag =
          (p.tags || []).some((t) => t.id === selectedTagFilter || t.slug === selectedTagFilter) ||
          (p.tagIds || []).includes(selectedTagFilter);
        if (!hasTag) return false;
      }
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.includes(q))
      );
    });
  }, [products, productSearch, selectedTagFilter]);

  const totalAdminProductPages = Math.ceil(filteredProducts.length / ADMIN_PRODUCTS_PER_PAGE) || 1;

  const paginatedAdminProducts = useMemo(() => {
    const safePage = Math.min(Math.max(1, adminProductPage), totalAdminProductPages);
    const start = (safePage - 1) * ADMIN_PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + ADMIN_PRODUCTS_PER_PAGE);
  }, [filteredProducts, adminProductPage, totalAdminProductPages]);

  useEffect(() => {
    setAdminProductPage(1);
  }, [productSearch]);

  const catalogDeals = useMemo(() => {
    return products.flatMap((p) => {
      const dealVariants = (p.variants || []).filter((v: any) => {
        const reg = Number(v.compareAtPrice || v.regularPrice || v.basePrice || 0);
        const sell = Number(v.price || 0);
        return reg > sell && sell > 0;
      });
      return dealVariants.map((v: any) => {
        const reg = Number(v.compareAtPrice || v.regularPrice || v.basePrice || 0);
        const sell = Number(v.price || 0);
        const savings = reg - sell;
        const pct = Math.round((savings / reg) * 100);
        return {
          productId: p.id,
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          image: p.images?.[0] || "/product-placeholder.svg",
          volume: v.volume || (v.volumeMl ? `${v.volumeMl}ml` : "100ml"),
          regularPrice: reg,
          dealPrice: sell,
          savings,
          discountPct: pct,
        };
      });
    });
  }, [products]);
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
    tagIds: [] as string[],
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

  // 1.5. COLLECTIONS & PREFERENCE CURATIONS
  const [collections, setCollections] = usePersistentState<CollectionItem[]>("admin_collections", []);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<CollectionItem | null>(null);

  // 2. BRANDS & PRESTIGE MAISONS (PRO SEO)
  const [brands, setBrands] = usePersistentState<BrandItem[]>("brands", []);

  const [brandSearch, setBrandSearch] = useState("");
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<BrandItem | null>(null);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.countryEn.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
    );
  }, [brands, brandSearch]);

  // 3. SCENT NOTES (PRO SEO)
  const [notes, setNotes] = usePersistentState<NoteItem[]>("notes", []);

  const [noteSearch, setNoteSearch] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);

  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return notes;
    const q = noteSearch.toLowerCase();
    return notes.filter(
      (n) =>
        n.nameEn.toLowerCase().includes(q) ||
        n.nameAr.includes(q) ||
        n.family.toLowerCase().includes(q) ||
        n.slug.toLowerCase().includes(q)
    );
  }, [notes, noteSearch]);

  // Live Dashboard Metrics
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    totalProducts?: number;
    totalOrders?: number;
    totalRevenue?: number;
    lowStockCount?: number;
    lowStockItems?: any[];
    recentOrders?: any[];
  } | null>(null);

  // Sync live products, brands, notes, and collections from Neon PostgreSQL database
  useEffect(() => {
    let active = true;
    const token = authSession?.token;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch("/api/v1/admin/products", { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/brands").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/notes").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/admin/collections", { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/admin/dashboard", { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/v1/admin/tags", { headers: authHeaders }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([prodRes, brandRes, noteRes, colRes, dashRes, tagRes]) => {
      if (!active) return;
      if (dashRes?.success && dashRes.data) {
        setDashboardMetrics(dashRes.data);
      }
      if (prodRes?.data && Array.isArray(prodRes.data)) {
        const dbProducts: ProductItem[] = prodRes.data.filter((p: any) => !isMockItem(p)).map((p: any) => {
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
            tags: Array.isArray(p.tags) ? p.tags.map((pt: any) => pt.tag || pt) : [],
            tagIds: Array.isArray(p.tags) ? p.tags.map((pt: any) => (pt.tag ? pt.tag.id : pt.id)) : [],
            variants: variantsList,
          };
        });
        setProducts(dbProducts);
      }
      if (tagRes?.data && Array.isArray(tagRes.data)) {
        setTags(tagRes.data.filter((t: any) => !isMockItem(t)).map((t: any) => ({
          id: t.id,
          nameEn: t.nameEn,
          nameAr: t.nameAr || t.nameEn,
          slug: t.slug,
          description: t.description || "",
          colorHex: t.colorHex || "#D4AF37",
          isFeatured: Boolean(t.isFeatured),
          productCount: t._count?.products ?? t.productCount ?? 0,
        })));
      }
      if (brandRes?.data && Array.isArray(brandRes.data)) {
        setBrands(brandRes.data.filter((b: any) => !isMockItem(b)).map((b: any) => ({
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
      if (noteRes?.data && Array.isArray(noteRes.data)) {
        setNotes(noteRes.data.filter((n: any) => !isMockItem(n)).map((n: any) => ({
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
      if (colRes?.data && Array.isArray(colRes.data)) {
        setCollections(colRes.data.filter((c: any) => !isMockItem(c)).map((c: any) => ({
          id: c.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          slug: c.slug,
          descriptionEn: c.descriptionEn || "",
          descriptionAr: c.descriptionAr || "",
          heroImageUrl: c.heroImageUrl || "",
          isFeatured: Boolean(c.isFeatured),
          productCount: c.productCount || (c.productIds ? c.productIds.length : (c.products ? c.products.length : 0)),
          productIds: c.productIds || c.products?.map((p: any) => p.id) || [],
          products: c.products || [],
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })));
      }
    });
    return () => {
      active = false;
    };
  }, [authSession?.token]);

  // 3. ORDERS
  const [orders, setOrders] = usePersistentState<any[]>("orders", []);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderMarketFilter, setOrderMarketFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any | null>(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderMarketFilter !== "ALL" && o.market !== orderMarketFilter) return false;
      if (orderStatusFilter !== "ALL" && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          (o.number && o.number.toLowerCase().includes(q)) ||
          (o.customer && o.customer.toLowerCase().includes(q)) ||
          (o.email && o.email.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, orderMarketFilter, orderStatusFilter, orderSearch]);

  // Real-Time Notification & Live Event State
  const [liveEvents, setLiveEvents] = useState<LiveEventItem[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = usePersistentState<boolean>("admin_audio_notifications", true);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Auto-collapse notifications popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationOpen]);

  // Keyboard shortcuts: Ctrl+B / Cmd+B to toggle sidebar collapse, Esc to close overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsNotificationOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSidebarCollapsed]);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
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
  const addToast = (type: "order" | "cancel" | "enquiry" | "review" | "return" | "settings", title: string, message: string) => {
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
        const token = authSession?.token;
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const [ordersRes, enquiriesRes, bannersRes, sectionsRes, settingsRes, reviewsRes, returnsRes, auditRes] = await Promise.all([
          fetch("/api/v1/admin/orders", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/enquiries", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/banners", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/sections", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/settings", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/reviews", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/returns", { headers: authHeaders }).catch(() => null),
          fetch("/api/v1/admin/audit-logs", { headers: authHeaders }).catch(() => null),
        ]);

        if (ordersRes && ordersRes.ok) {
          const json = await ordersRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setOrders(
              json.data.filter((o: any) => !isMockItem(o)).map((o: any) => ({
                ...o,
                id: o.id,
                number: o.orderNumber,
                orderNumber: o.orderNumber,
                customer: o.shippingAddress?.fullName || o.customer?.firstName || o.guestEmail || "Client",
                amount: `${Number(o.totalAmount).toLocaleString()} ${o.currency || "AED"}`,
                method: o.payments?.[0]?.provider || "CARD",
                status: o.status,
                market: o.marketId || o.shippingAddress?.country || o.shippingAddress?.countryCode || "AE",
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
            setEnquiries(json.data.filter((e: any) => !isMockItem(e)));
          }
        }

        if (bannersRes && bannersRes.ok) {
          const json = await bannersRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setBanners(json.data);
          }
        }

        if (sectionsRes && sectionsRes.ok) {
          const json = await sectionsRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setSections(json.data);
          }
        }

        if (settingsRes && settingsRes.ok) {
          const json = await settingsRes.json();
          if (json.success && json.data && active) {
            setStoreSettings(json.data);
          }
        }

        if (reviewsRes && reviewsRes.ok) {
          const json = await reviewsRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setReviews(
              json.data.map((r: any) => ({
                id: r.id,
                customer: r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "Collector",
                product: r.product?.nameEn || "Fragrance Flacon",
                rating: r.rating,
                review: r.body,
                title: r.title,
                status: r.status,
                date: new Date(r.createdAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              }))
            );
          }
        }

        if (returnsRes && returnsRes.ok) {
          const json = await returnsRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setReturns(
              json.data.map((r: any) => {
                const firstItem = r.items?.[0];
                const prodName = firstItem?.orderItem?.variant?.product?.nameEn || "Complimentary Flacon";
                const disposition = firstItem?.inspection?.disposition || (r.status === "COMPLETED" ? "RESTOCK_SELLABLE" : "PENDING_INSPECTION");
                const condition = firstItem?.inspection?.condition || "PENDING";
                return {
                  id: r.id,
                  number: r.returnNumber,
                  customer: r.customer ? `${r.customer.firstName} ${r.customer.lastName || ""}`.trim() : "Client",
                  item: prodName,
                  condition,
                  disposition,
                  status: r.status,
                  date: new Date(r.createdAt).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                };
              })
            );
          }
        }

        if (auditRes && auditRes.ok) {
          const json = await auditRes.json();
          if (json.success && Array.isArray(json.data) && active) {
            setAuditLogs(
              json.data.map((a: any) => ({
                action: a.action,
                res: typeof a.diff === "string" ? a.diff : JSON.stringify(a.diff || a.resourceType),
                user: a.adminUser?.email || "superadmin@muschio.luxury",
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }))
            );
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
  }, [authSession?.token]);

  // Real-time live poller (polls every 4.5 seconds)
  useEffect(() => {
    if (!isLiveActive || !authSession?.token) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/admin/orders/live?since=${encodeURIComponent(lastPollTimeRef.current)}`, {
          headers: { Authorization: `Bearer ${authSession.token}` },
        });
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
            const cleanPrev = prev.filter((o) => !isMockItem(o));
            const map = new Map(cleanPrev.map((o) => [o.id, o]));
            newOrders.filter((o: any) => !isMockItem(o)).forEach((o: any) => {
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
  const [returns, setReturns] = usePersistentState<any[]>("returns", []);

  // 5. REVIEWS
  const [reviews, setReviews] = usePersistentState<any[]>("reviews", []);

  // 6. BANNERS
  const [banners, setBanners] = usePersistentState<BannerItem[]>("banners", []);

  // 7. HOMEPAGE SECTIONS
  const [sections, setSections] = usePersistentState<HomepageSectionItem[]>("sections", DEFAULT_HOMEPAGE_SECTIONS);

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
  const [auditLogs, setAuditLogs] = usePersistentState<AuditLogItem[]>("audit", []);

  const addAuditLog = (action: string, res: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAuditLogs((prev) => [{ action, res, user: authSession?.user?.email || "superadmin@muschio.luxury", time }, ...prev.slice(0, 49)]);
    try {
      const token = authSession?.token;
      fetch("/api/v1/admin/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, diff: res }),
      }).catch(() => null);
    } catch {}
  };

  // Banner form state
  const [bannerSlotFilter, setBannerSlotFilter] = useState<string>("ALL");
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

  const handleOpenAddBanner = () => {
    resetBannerForm();
    setActiveTab("banners");
    setShowBannerForm(true);
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

  const handleSaveBanner = async () => {
    if (!bannerForm.titleEn?.trim()) {
      addToast("order", "Title Required", "Please enter a banner headline / title (English).");
      return;
    }
    if (!bannerForm.imageUrl?.trim()) {
      addToast("order", "Image Required", "Please upload or provide a desktop banner image URL.");
      return;
    }

    const payload = {
      ...bannerForm,
      titleEn: bannerForm.titleEn.trim(),
      titleAr: bannerForm.titleAr?.trim() || bannerForm.titleEn.trim(),
      subtitleEn: bannerForm.subtitleEn?.trim() || "",
      subtitleAr: bannerForm.subtitleAr?.trim() || bannerForm.subtitleEn?.trim() || "",
      eyebrowEn: bannerForm.eyebrowEn?.trim() || "",
      eyebrowAr: bannerForm.eyebrowAr?.trim() || bannerForm.eyebrowEn?.trim() || "",
      ctaTextEn: bannerForm.ctaTextEn?.trim() || "Explore Now",
      ctaTextAr: bannerForm.ctaTextAr?.trim() || "استكشف الآن",
      ctaUrl: bannerForm.ctaUrl?.trim() || "/shop",
      imageUrl: bannerForm.imageUrl.trim(),
      mobileImageUrl: bannerForm.mobileImageUrl?.trim() || bannerForm.imageUrl.trim(),
    };

    try {
      const token = authSession?.token;
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (editingBanner) {
        const res = await fetch(`/api/v1/admin/banners/${editingBanner.id}`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setBanners((prev) =>
            prev.map((b) => (b.id === editingBanner.id ? json.data : b))
          );
        } else {
          setBanners((prev) =>
            prev.map((b) => (b.id === editingBanner.id ? { ...b, ...payload } : b))
          );
        }
        addAuditLog("BANNER_UPDATED", `${payload.slot} ${editingBanner.id}`);
        addToast("order", "Banner Updated", "Promotional offer banner saved to live database.");
      } else {
        const res = await fetch("/api/v1/admin/banners", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setBanners((prev) => [...prev, json.data]);
        } else {
          const newBanner: BannerItem = {
            id: `bnr-${Date.now()}`,
            ...payload,
            sortOrder: banners.filter((b) => b.slot === payload.slot).length,
            isActive: true,
          };
          setBanners((prev) => [...prev, newBanner]);
        }
        addAuditLog("BANNER_CREATED", `${payload.slot} banner published`);
        addToast("order", "Banner Published", "New promotional banner published to storefront.");
      }
    } catch (e) {
      console.error("Error saving banner:", e);
      addToast("order", "Save Error", "Failed to communicate with banner service.");
    }
    resetBannerForm();
  };

  const toggleBannerActive = async (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    try {
      const token = authSession?.token;
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await fetch(`/api/v1/admin/banners/${id}/toggle`, {
        method: "POST",
        headers: authHeaders,
      });
      addToast("order", "Banner Updated", "Banner status updated in live database.");
    } catch (e) {
      console.error("Error toggling banner:", e);
    }
    addAuditLog("BANNER_TOGGLE", `Banner ${id}`);
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      const token = authSession?.token;
      const authHeaders: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await fetch(`/api/v1/admin/banners/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      addToast("cancel", "Banner Removed", "Banner removed from database.");
    } catch (e) {
      console.error("Error deleting banner:", e);
    }
    addAuditLog("BANNER_DELETED", `Banner ${id}`);
  };

  // Section ordering with non-undefined array items and API persistence
  const saveSectionsOrder = async (updatedList: HomepageSectionItem[]) => {
    try {
      const token = authSession?.token;
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const ordering = updatedList.map((s, idx) => ({
        sectionType: s.sectionType,
        sortOrder: idx,
      }));
      await fetch("/api/v1/admin/sections/reorder", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ordering }),
      });
      addToast("order", "Storefront Reordered", "Homepage section order saved to live database.");
    } catch (e) {
      console.error("Failed to persist section reordering:", e);
    }
  };

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
      const updated = next.map((s, i) => ({ ...s, sortOrder: i }));
      saveSectionsOrder(updated);
      return updated;
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
      const updated = next.map((s, i) => ({ ...s, sortOrder: i }));
      saveSectionsOrder(updated);
      return updated;
    });
    addAuditLog("HOMEPAGE_SECTION_REORDER", `Section index ${idx} moved down`);
  };

  const toggleSectionVisible = async (idOrType: string) => {
    const targetSection = sections.find((s) => s.id === idOrType || s.sectionType === idOrType);
    if (!targetSection) return;
    const newVisible = !targetSection.isVisible;
    const sectionType = targetSection.sectionType;

    setSections((prev) =>
      prev.map((s) => (s.id === targetSection.id || s.sectionType === sectionType ? { ...s, isVisible: newVisible } : s))
    );

    try {
      const token = authSession?.token;
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      await fetch(`/api/v1/admin/sections/${sectionType}/toggle`, {
        method: "POST",
        headers: authHeaders,
      });
      addToast("order", "Section Visibility Changed", `${SECTION_LABELS[sectionType] || sectionType} is now ${newVisible ? "visible" : "hidden"}`);
    } catch (e) {
      console.error("Failed to toggle section visibility:", e);
    }
    addAuditLog("HOMEPAGE_SECTION_VISIBILITY", `Section ${sectionType} set to ${newVisible ? "visible" : "hidden"}`);
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
      tagIds: [] as string[],
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
      tagIds: p.tags?.map((t: any) => t.id) || p.tagIds || [],
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
      tags: tags.filter((t) => (productForm.tagIds || []).includes(t.id)),
      tagIds: productForm.tagIds || [],
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
      tagIds: [] as string[],
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

  // Tag Actions (CRUD & Inline Searchable Selector)
  const handleSaveTag = async (tagData: TagItem) => {
    try {
      const token = authSession?.token;
      const isEditing = tags.some((t) => t.id === tagData.id);
      const url = isEditing ? `/api/v1/admin/tags/${tagData.id}` : "/api/v1/admin/tags";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nameEn: tagData.nameEn,
          nameAr: tagData.nameAr,
          slug: tagData.slug,
          description: tagData.description,
          colorHex: tagData.colorHex,
          isFeatured: tagData.isFeatured,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const savedTag: TagItem = json.data || tagData;
        setTags((prev) => {
          const exists = prev.some((t) => t.id === savedTag.id);
          if (exists) {
            return prev.map((t) => (t.id === savedTag.id ? { ...t, ...savedTag } : t));
          }
          return [savedTag, ...prev];
        });
        addAuditLog(isEditing ? "TAG_UPDATED" : "TAG_CREATED", `${savedTag.nameEn} (${savedTag.slug})`);
        addToast("settings", isEditing ? "Tag Updated" : "Tag Created", `Tag "${savedTag.nameEn}" successfully saved to database.`);
      } else {
        throw new Error("Failed to save tag");
      }
    } catch (err) {
      console.warn("API tag save failed, updating local state:", err);
      setTags((prev) => {
        const exists = prev.some((t) => t.id === tagData.id);
        if (exists) return prev.map((t) => (t.id === tagData.id ? tagData : t));
        return [tagData, ...prev];
      });
      addToast("settings", "Tag Saved Locally", `Tag "${tagData.nameEn}" saved in administrative state.`);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete tag "${tagName}"? This will unlink it from all products.`)) {
      return;
    }
    try {
      const token = authSession?.token;
      await fetch(`/api/v1/admin/tags/${tagId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      addAuditLog("TAG_DELETED", `Tag ${tagName} (${tagId}) deleted`);
      addToast("settings", "Tag Deleted", `Tag "${tagName}" has been removed from database.`);
    } catch (err) {
      console.warn("Failed to delete tag:", err);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    }
  };

  const handleInlineCreateTag = async (nameEn: string): Promise<TagItem | null> => {
    try {
      const token = authSession?.token;
      const res = await fetch("/api/v1/admin/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nameEn: nameEn.trim(),
          nameAr: nameEn.trim(),
          slug: slugify(nameEn),
          colorHex: "#D4AF37",
          isFeatured: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const created: TagItem = json.data;
        setTags((prev) => [created, ...prev]);
        addAuditLog("TAG_CREATED", `Inline tag created: ${created.nameEn}`);
        addToast("settings", "Tag Created", `Tag "${created.nameEn}" created and selected.`);
        return created;
      }
    } catch (err) {
      console.warn("Failed inline tag creation:", err);
    }
    const fallback: TagItem = {
      id: `tag-${Date.now()}`,
      nameEn: nameEn.trim(),
      nameAr: nameEn.trim(),
      slug: slugify(nameEn),
      colorHex: "#D4AF37",
      isFeatured: true,
      productCount: 0,
    };
    setTags((prev) => [fallback, ...prev]);
    return fallback;
  };

  // Collection Actions
  const handleSaveCollection = async (collectionData: Partial<CollectionItem>) => {
    try {
      const token = authSession?.token;
      const res = await fetch("/api/v1/admin/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(collectionData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || `Failed to save collection (status ${res.status})`);
      }

      const json = await res.json();
      const saved = json.data;
      if (saved) {
        const orderedProducts = (collectionData.productIds || []).map((pId) => {
          const prod = products.find((p) => p.id === pId || p.slug === pId);
          return {
            id: pId,
            slug: prod?.slug || pId,
            nameEn: prod?.name || pId,
            nameAr: prod?.nameAr,
            brand: prod?.brand || "",
            price: prod?.price || 0,
            image: prod?.imageUrl || prod?.images?.[0] || "/product-placeholder.svg",
            concentration: prod?.concentration,
          };
        });

        const fullItem: CollectionItem = {
          id: saved.id,
          nameEn: saved.nameEn,
          nameAr: saved.nameAr,
          slug: saved.slug,
          descriptionEn: saved.descriptionEn || "",
          descriptionAr: saved.descriptionAr || "",
          heroImageUrl: saved.heroImageUrl || "",
          isFeatured: Boolean(saved.isFeatured),
          productIds: collectionData.productIds || [],
          productCount: (collectionData.productIds || []).length,
          products: orderedProducts,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        };

        setCollections((prev) => {
          const idx = prev.findIndex((c) => c.id === saved.id || (collectionData.id && (c.id === collectionData.id || c.slug === collectionData.slug)));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = fullItem;
            return next;
          }
          return [fullItem, ...prev];
        });
        setShowCollectionModal(false);
        setCollectionToEdit(null);
        addAuditLog("COLLECTION_SAVED", `Collection "${saved.nameEn}" [${saved.isFeatured ? "Featured" : "Standard"}]`);
        return;
      }
    } catch (err: any) {
      console.error("DB collection save failed:", err);
      throw err;
    }
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    try {
      const token = authSession?.token;
      await fetch(`/api/v1/admin/collections/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn("DB collection delete failed:", err);
    }
    setCollections((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
    addAuditLog("COLLECTION_DELETED", `Collection ${id} (${name})`);
  };

  const handleToggleFeaturedCollection = async (collection: CollectionItem) => {
    try {
      const token = authSession?.token;
      await fetch(`/api/v1/admin/collections/${collection.id}/toggle`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn("DB collection toggle failed:", err);
    }
    setCollections((prev) =>
      prev.map((c) => (c.id === collection.id ? { ...c, isFeatured: !c.isFeatured } : c))
    );
    addAuditLog("COLLECTION_FEATURED_TOGGLED", `Collection "${collection.nameEn}" featured: ${!collection.isFeatured}`);
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
  const updateOrderStatus = async (
    orderId: string,
    nextStatus: string,
    trackingNumber?: string,
    carrier?: string,
    reason?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.number === orderId
          ? {
              ...o,
              status: nextStatus,
              ...(trackingNumber
                ? {
                    fulfillments: [
                      {
                        ...(o.fulfillments?.[0] || {}),
                        shipments: [
                          {
                            carrier: carrier || "DHL_EXPRESS",
                            trackingNumber,
                            status: "IN_TRANSIT",
                          },
                        ],
                      },
                    ],
                  }
                : {}),
            }
          : o
      )
    );

    if (
      selectedOrderForDetail &&
      (selectedOrderForDetail.id === orderId || selectedOrderForDetail.number === orderId)
    ) {
      setSelectedOrderForDetail((prev: any) => ({
        ...prev,
        status: nextStatus,
        ...(trackingNumber
          ? {
              fulfillments: [
                {
                  ...(prev?.fulfillments?.[0] || {}),
                  shipments: [
                    {
                      carrier: carrier || "DHL_EXPRESS",
                      trackingNumber,
                      status: "IN_TRANSIT",
                    },
                  ],
                },
              ],
            }
          : {}),
      }));
    }

    addAuditLog("ORDER_STATUS_UPDATE", `${orderId} -> ${nextStatus}`);

    try {
      const token = authSession?.token;
      const targetOrder = orders.find((o) => o.id === orderId || o.number === orderId);
      const res = await fetch("/api/v1/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          orderNumber: targetOrder?.number || targetOrder?.id,
          status: nextStatus,
          trackingNumber,
          carrier,
          reason: reason || (nextStatus === "CANCELLED" ? "Admin cancelled via control panel" : undefined),
        }),
      });
      if (res.ok) {
        if (nextStatus === "CANCELLED") {
          playLuxuryChime("cancel");
          addToast("cancel", "Order Cancelled", `Order ${orderId} status set to CANCELLED.`);
        } else {
          addToast("order", "Status Updated", `Order ${orderId} set to ${nextStatus}`);
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn("Server responded with error on order status update:", errJson);
      }
    } catch (err) {
      console.warn("Could not sync order status to server:", err);
    }
  };

  // Dispatch / Resend Order Notifications (WhatsApp & Email)
  const handleResendNotification = async (orderId: string, channel: "whatsapp" | "email") => {
    try {
      const token = authSession?.token;
      const res = await fetch("/api/v1/admin/orders/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
      const token = authSession?.token;
      await fetch("/api/v1/admin/enquiries/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enquiryId, status: nextStatus }),
      });
      addToast("enquiry", "Enquiry Updated", `Status marked as ${nextStatus}`);
    } catch (err) {
      console.warn("Could not update enquiry status on server:", err);
    }
  };

  // Return Actions
  const handleInspectReturn = async (returnId: string, disposition: string) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId ? { ...r, disposition, status: "COMPLETED" } : r
      )
    );
    addAuditLog("RETURN_INSPECTION_COMPLETED", `${returnId} disposition=${disposition}`);
    try {
      const token = authSession?.token;
      await fetch("/api/v1/admin/returns/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ returnRequestId: returnId, disposition }),
      });
      addToast("return", "Return Inspection Completed", `Disposition set to ${disposition}`);
    } catch (err) {
      console.warn("Could not save return inspection to server:", err);
    }
  };

  // Review Actions
  const handleReviewAction = async (reviewId: string, status: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    addAuditLog("REVIEW_MODERATED", `${reviewId} status=${status}`);
    try {
      const token = authSession?.token;
      await fetch("/api/v1/admin/reviews/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reviewId, status }),
      });
      addToast("review", "Review Moderated", `Status updated to ${status}`);
    } catch (err) {
      console.warn("Could not update review status on server:", err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback("Persisting configuration to Neon PostgreSQL...");
    try {
      const token = authSession?.token;
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(storeSettings),
      });
      if (res.ok) {
        addAuditLog("STORE_SETTINGS_SAVED", "Social handles and Concierge info persisted to DB");
        setSettingsFeedback("Settings and Social Links saved successfully to PostgreSQL! Sync active.");
        addToast("settings", "Store Settings Saved", "All store configuration active on storefront");
      } else {
        setSettingsFeedback("Settings updated locally, but server returned an error.");
      }
    } catch (err) {
      console.warn("Could not persist settings to server:", err);
      setSettingsFeedback("Network issue: settings saved locally.");
    }
    setTimeout(() => setSettingsFeedback(""), 4500);
  };

  // Dynamic Dashboard Metrics
  const totalStockUnits = useMemo(() => products.reduce((acc, p) => acc + (p.stock || 0), 0), [products]);
  const totalTesterUnits = useMemo(() => products.reduce((acc, p) => acc + (p.testerStock || 0), 0), [products]);
  const activeOrdersCount = useMemo(() => orders.filter((o) => o.status !== "CANCELLED").length, [orders]);
  const pendingReviewsCount = useMemo(() => reviews.filter((r) => r.status === "PENDING").length, [reviews]);
  const totalRevenueFromOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === "PAID" || o.status === "FULFILLING" || o.status === "SHIPPED" || o.status === "DELIVERED")
      .reduce((sum, o) => {
        const amt = typeof o.amount === "string" ? parseFloat(o.amount.replace(/[^0-9.]/g, "")) : Number(o.totalAmount || 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);
  }, [orders]);

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
          {/* Quick Add Banner Shortcut for Mobile Viewport */}
          <button
            type="button"
            onClick={handleOpenAddBanner}
            className="px-2.5 py-1 text-xs rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1 font-medium shadow-sm transition-colors shrink-0"
            title="Add New Campaign Banner"
          >
            <Plus size={13} />
            <span>Banner</span>
          </button>
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

      {/* SIDEBAR NAVIGATION (Drawer on Mobile, Collapsible Sticky on Desktop) */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 ${
          isSidebarCollapsed ? "md:w-20" : "md:w-64"
        } w-72 max-w-[85vw] h-screen md:sticky md:top-0 bg-white dark:bg-black border-e border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto ${
          isSidebarCollapsed ? "p-3" : "p-4"
        } transform transition-all duration-300 ease-in-out md:translate-x-0 md:shrink-0 ${
          isMobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6 flex-1 min-h-0 flex flex-col">
          <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between px-2"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                M
              </div>
              {!isSidebarCollapsed && (
                <div className="transition-opacity duration-200 overflow-hidden">
                  <span className="font-serif tracking-widest text-lg font-bold text-neutral-900 dark:text-white block whitespace-nowrap">MUSCHIO</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 block font-mono whitespace-nowrap">Admin Panel</span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Close Navigation"
            >
              <X size={18} />
            </button>

            {/* Desktop Collapse Toggle in Sidebar */}
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden md:flex p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shrink-0"
                title="Collapse Sidebar (Ctrl+B)"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>

          {/* Desktop Expand Icon Button when collapsed */}
          {isSidebarCollapsed && (
            <div className="hidden md:flex justify-center -mt-2">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                title="Expand Sidebar (Ctrl+B)"
                aria-label="Expand Sidebar"
              >
                <PanelLeft size={16} />
              </button>
            </div>
          )}

          <nav className="space-y-1 text-xs font-sans">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package, count: products.length },
              { id: "collections", label: "Collections", icon: Sparkles, count: collections.length },
              { id: "tags", label: "Tags", icon: Tag, count: tags.length },
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
                  title={`${item.label}${item.count !== undefined ? ` (${item.count})` : ""}`}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5"
                  } rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <span className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                    <div className="relative flex items-center justify-center">
                      <Icon size={16} />
                      {isSidebarCollapsed && item.count !== undefined && (
                        <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-0.5 text-[8px] rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold ring-2 ring-white dark:ring-black">
                          {item.count > 99 ? "99+" : item.count}
                        </span>
                      )}
                    </div>
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </span>
                  {!isSidebarCollapsed && item.count !== undefined && (
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

        {/* User Session Footer */}
        {isSidebarCollapsed ? (
          <div className="shrink-0 mt-auto p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] rounded-xl flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 cursor-default"
              title={`${authSession.user.name} (${authSession.user.role})`}
            >
              {authSession.user.name.charAt(0) || "A"}
            </div>
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                handleLogout();
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              title="Sign Out Session"
              aria-label="Sign Out Session"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <div className="shrink-0 mt-auto p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-2 rounded-xl">
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
        )}
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-7 space-y-6 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 md:pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
              aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <div>
              <h1 className="font-serif text-2xl font-light text-neutral-900 dark:text-white capitalize">
                {TAB_TITLES[activeTab] || activeTab}
              </h1>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                {TAB_SUBTITLES[activeTab] || "Muschio Fragrance Store Management"}
              </p>
            </div>
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
            <div className="relative" ref={notificationRef}>
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

            {/* Quick Add Banner Button (Desktop Navigation Header) */}
            <button
              type="button"
              onClick={handleOpenAddBanner}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black dark:bg-neutral-100 dark:text-black dark:hover:bg-white text-white font-medium text-xs font-sans transition-all flex items-center gap-1.5 rounded-md shadow-sm shrink-0"
              title="Add New Campaign Banner or Hero Slider"
            >
              <Plus size={14} />
              <span>Add Banner</span>
            </button>

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
                <div className="font-serif text-3xl text-neutral-900 dark:text-white font-light">
                  {Number(dashboardMetrics?.totalRevenue ?? totalRevenueFromOrders).toLocaleString()} AED
                </div>
                <div className="text-emerald-500 text-xs flex items-center gap-1 font-mono">
                  <TrendingUp size={12} />
                  <span>Verified captured sales</span>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Active Orders</span>
                <div className="font-serif text-3xl text-amber-500 dark:text-amber-400 font-light">
                  {dashboardMetrics?.totalOrders ?? activeOrdersCount} Orders
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs font-mono">In processing & dispatch</div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Catalog Inventory</span>
                <div className="font-serif text-3xl text-emerald-500 dark:text-emerald-400 font-light">
                  {dashboardMetrics?.totalProducts ?? products.length} Flacons
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs font-mono">{totalStockUnits} Sealed + {totalTesterUnits} Testers in vault</div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Pending Returns</span>
                <div className="font-serif text-3xl text-purple-400 font-light">{returns.length} Cases</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs">Awaiting inspection</div>
              </div>
            </div>

            {/* Executive Quick Actions & Storefront Management */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded p-5 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-900 pb-3">
                <div>
                  <h3 className="font-serif text-sm font-semibold text-neutral-900 dark:text-white tracking-wide">
                    Executive Quick Actions & Campaign Launch
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Direct shortcuts to launch hero campaigns, publish new flacons, and manage inventory.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {banners.length} active banners · {products.length} products
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* 1. Add Banner Shortcut */}
                <button
                  type="button"
                  onClick={handleOpenAddBanner}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded text-left transition-all group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                      <ImageIcon size={15} />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Campaigns
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white flex items-center gap-1">
                      <span>+ Add New Banner</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      Hero slider, offer deal, or promo bar
                    </p>
                  </div>
                </button>

                {/* 2. Add Product Shortcut */}
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded text-left transition-all group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                      <Package size={15} />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      Catalog
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white flex items-center gap-1">
                      <span>+ Add New Product</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      Publish single fragrance flacon
                    </p>
                  </div>
                </button>

                {/* 3. Bulk Excel Upload */}
                <button
                  type="button"
                  onClick={() => setShowCsvModal(true)}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded text-left transition-all group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center">
                      <Upload size={15} />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Bulk Import
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white flex items-center gap-1">
                      <span>Bulk Excel Upload</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      Import multiple products via XLSX / CSV
                    </p>
                  </div>
                </button>

                {/* 4. Manage Banners CMS */}
                <button
                  type="button"
                  onClick={() => setActiveTab("banners")}
                  className="p-3.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded text-left transition-all group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center">
                      <Sparkles size={15} />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      CMS
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white flex items-center gap-1">
                      <span>Manage All Banners</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      Reorder sections & edit active sliders
                    </p>
                  </div>
                </button>
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
              <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search by SKU, product name, or brand..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600 shadow-sm"
                  />
                </div>

                {/* Filter by Tag Dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Tag size={13} className="text-neutral-500" />
                  <select
                    value={selectedTagFilter}
                    onChange={(e) => setSelectedTagFilter(e.target.value)}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white px-2.5 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600 shadow-sm"
                  >
                    <option value="ALL">All Tags ({tags.length})</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
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

            {/* MOBILE PRODUCTS CARDS (< md) */}
            <div className="space-y-3 md:hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  No products matching your search criteria.
                </div>
              ) : (
                paginatedAdminProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package size={20} className="text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate block">
                            {p.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {p.brand}
                          </span>
                        </div>
                        {p.nameAr && (
                          <span className="text-neutral-500 text-xs block truncate mt-0.5" dir="rtl">
                            {p.nameAr}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                          SKU: {p.sku}
                        </span>
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {p.tags.slice(0, 3).map((tg) => (
                              <span
                                key={tg.id || tg.slug}
                                className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                              >
                                {tg.colorHex && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: tg.colorHex }}
                                  />
                                )}
                                <span>{tg.nameEn}</span>
                              </span>
                            ))}
                            {p.tags.length > 3 && (
                              <span className="text-[9px] text-neutral-400 font-mono">+{p.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                      <div>
                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white block">
                          {p.price}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {p.variants?.length ? `${p.variants.length} volume sizes` : `${p.volumeMl || 100}ml`}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold block text-xs">
                          {p.stock} sealed ({p.warehouse || "DXB-MAIN"})
                        </span>
                        <span className="text-[10px] text-purple-500 font-mono">
                          +{p.testerStock || 0} testers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 gap-2">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-[10px] font-medium rounded flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span>SEO Ready</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(p)}
                          className="px-2.5 py-1.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/en/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                          title="View Live Page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP PRODUCTS TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[1100px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[260px]">Product (EN / AR)</th>
                    <th className="py-3.5 px-4 text-start min-w-[160px]">URL Slug</th>
                    <th className="py-3.5 px-4 text-start min-w-[160px]">Brand & House</th>
                    <th className="py-3.5 px-4 text-start min-w-[150px]">Scent Notes</th>
                    <th className="py-3.5 px-4 text-start min-w-[140px]">Price & Sizes</th>
                    <th className="py-3.5 px-4 text-start min-w-[160px]">Stock & Warehouse</th>
                    <th className="py-3.5 px-4 text-start min-w-[110px]">Status</th>
                    <th className="py-3.5 px-4 text-end min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500 font-sans">
                        No products found in the catalog. Click "Add Product" or "Bulk Excel Upload" to add items.
                      </td>
                    </tr>
                  ) : (
                    paginatedAdminProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package size={16} className="text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-white block">{p.name}</span>
                            {p.nameAr && (
                              <span className="text-neutral-500 dark:text-neutral-400 text-xs block" dir="rtl">
                                {p.nameAr}
                              </span>
                            )}
                            <span className="text-neutral-400 font-mono text-[11px] block mt-0.5">{p.sku}</span>
                            {p.tags && p.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {p.tags.slice(0, 3).map((tg) => (
                                  <span
                                    key={tg.id || tg.slug}
                                    className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                                  >
                                    {tg.colorHex && (
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: tg.colorHex }}
                                      />
                                    )}
                                    <span>{tg.nameEn}</span>
                                  </span>
                                ))}
                                {p.tags.length > 3 && (
                                  <span className="text-[9px] text-neutral-400 font-mono">+{p.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <span className="text-neutral-400">/product/</span>
                          <span className="text-emerald-500 font-medium">{p.slug}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-sans block mt-0.5">
                          {p.concentration || "Extrait de Parfum"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
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
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-mono mt-0.5">
                          {p.scentFamily || "Woody Amber"}
                        </span>
                        {p.perfumer && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5" title={`Master Perfumer: ${p.perfumer}`}>
                            <Sparkles size={10} className="text-amber-400 shrink-0" />
                            <span className="truncate max-w-[130px] font-sans">Nose: {p.perfumer}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="space-y-0.5">
                          <span className="text-neutral-700 dark:text-neutral-300 block">
                            Top ({p.topNotes?.length || 0}) • Heart ({p.heartNotes?.length || 0}) • Base ({p.baseNotes?.length || 0})
                          </span>
                          {p.topNotes && p.topNotes.length > 0 && (
                            <span className="text-neutral-400 text-[10px] block truncate max-w-xs">
                              Opening: {p.topNotes.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-neutral-900 dark:text-white">{p.price}</div>
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
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40"
                                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                                  }`}
                                  title={`${v.sku} - ${v.volume}: ${hasDisc ? `${v.discountPrice} AED (MRP: ${orig} AED)` : `${orig} AED`} | Stock: ${v.stockQuantity}`}
                                >
                                  {v.volume}
                                  {hasDisc && <span className="ms-0.5 text-emerald-500 font-bold">%</span>}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-500 block">{p.volumeMl || 100}ml</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium block">
                          {p.stock} sealed ({p.warehouse || "DXB-MAIN"})
                        </span>
                        {p.variants && p.variants.length > 1 && (
                          <span className="text-neutral-500 text-[10px] block">
                            Total: {p.variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)} flacons
                          </span>
                        )}
                        <span className="text-purple-500 dark:text-purple-400 text-[11px] block mt-0.5">
                          +{p.testerStock} testers
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                          <CheckCircle2 size={11} className="text-emerald-500" />
                          <span>SEO Ready</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          <a
                            href={`/en/product/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="View Storefront Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-neutral-500 hover:text-rose-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

            {/* Admin Product Pagination Bar */}
            {totalAdminProductPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-sans shadow-sm">
                <div className="text-neutral-500">
                  Showing {(adminProductPage - 1) * ADMIN_PRODUCTS_PER_PAGE + 1}–{Math.min(adminProductPage * ADMIN_PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={adminProductPage <= 1}
                    onClick={() => setAdminProductPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-neutral-600 dark:text-neutral-400 font-medium">
                    Page {adminProductPage} of {totalAdminProductPages}
                  </span>
                  <button
                    type="button"
                    disabled={adminProductPage >= totalAdminProductPages}
                    onClick={() => setAdminProductPage((p) => Math.min(totalAdminProductPages, p + 1))}
                    className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

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

                    {/* Searchable Tags & Curations Multi-Select */}
                    <div className="p-3.5 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded">
                      <SearchableTagSelect
                        allTags={tags}
                        selectedTagIds={productForm.tagIds || []}
                        onChange={(newIds) => setProductForm({ ...productForm, tagIds: newIds })}
                        onCreateTag={handleInlineCreateTag}
                      />
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
                        <table className="w-full text-start text-xs font-sans min-w-[720px]">
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

        {/* 2. COLLECTIONS & PREFERENCE CURATIONS */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search collections by name or slug..."
                  value={collectionSearch}
                  onChange={(e) => setCollectionSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  {collections.filter((c) => c.isFeatured).length} of {collections.length} featured on slider
                </span>
                <button
                  onClick={() => {
                    setCollectionToEdit(null);
                    setShowCollectionModal(true);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Create Collection</span>
                </button>
              </div>
            </div>

            {/* Collections Grid */}
            {collections.length === 0 ? (
              <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-12 text-center bg-white dark:bg-neutral-950">
                <Sparkles size={36} className="mx-auto text-amber-500/60 mb-3" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  No Curated Collections Yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Create custom collections and order products according to your preference to showcase them directly on the storefront slider.
                </p>
                <button
                  onClick={() => {
                    setCollectionToEdit(null);
                    setShowCollectionModal(true);
                  }}
                  className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white text-xs font-medium rounded hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create First Collection</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections
                  .filter((col) => {
                    if (!collectionSearch.trim()) return true;
                    const q = collectionSearch.toLowerCase();
                    return (
                      col.nameEn.toLowerCase().includes(q) ||
                      (col.nameAr && col.nameAr.toLowerCase().includes(q)) ||
                      col.slug.toLowerCase().includes(q)
                    );
                  })
                  .map((col) => {
                    // Resolve products for this collection in exact preferred order
                    const colProductIds = col.productIds || col.products?.map((p) => p.id) || [];
                    const resolvedProducts = colProductIds
                      .map((pId) => {
                        const direct = col.products?.find((p) => p.id === pId || p.slug === pId);
                        if (direct) {
                          return {
                            id: direct.id,
                            slug: direct.slug,
                            nameEn: direct.nameEn || pId,
                            nameAr: direct.nameAr,
                            brand: direct.brand || "",
                            price: direct.price || 0,
                            image: direct.image || "/product-placeholder.svg",
                            concentration: direct.concentration,
                          };
                        }
                        const fromCatalog = products.find((p) => p.id === pId || p.slug === pId);
                        if (fromCatalog) {
                          return {
                            id: fromCatalog.id,
                            slug: fromCatalog.slug,
                            nameEn: fromCatalog.name,
                            nameAr: fromCatalog.nameAr,
                            brand: fromCatalog.brand,
                            price: fromCatalog.price,
                            image: fromCatalog.imageUrl || fromCatalog.images?.[0] || "/product-placeholder.svg",
                            concentration: fromCatalog.concentration,
                          };
                        }
                        return null;
                      })
                      .filter(Boolean) as Array<{
                        id: string;
                        slug: string;
                        nameEn: string;
                        nameAr?: string;
                        brand: string;
                        price: number | string;
                        image: string;
                        concentration?: string;
                      }>;

                    return (
                      <div
                        key={col.id}
                        className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg overflow-hidden flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-all shadow-sm"
                      >
                        <div>
                          {/* Card Banner / Hero */}
                          <div className="relative h-36 bg-gradient-to-r from-neutral-900 to-neutral-800 overflow-hidden flex items-center justify-center">
                            {col.heroImageUrl ? (
                              <img
                                src={col.heroImageUrl}
                                alt={col.nameEn}
                                className="w-full h-full object-cover opacity-80"
                              />
                            ) : (
                              <div className="text-center p-4">
                                <Sparkles size={24} className="mx-auto text-amber-400/50 mb-1" />
                                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                                  Muschio Curation
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleToggleFeaturedCollection(col)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 transition-colors shadow-sm backdrop-blur-md ${
                                  col.isFeatured
                                    ? "bg-amber-500/90 text-black hover:bg-amber-400"
                                    : "bg-black/60 text-neutral-300 hover:text-white hover:bg-black/80 border border-white/10"
                                }`}
                                title="Click to toggle display on storefront slider"
                              >
                                <Sparkles size={11} className={col.isFeatured ? "fill-black" : ""} />
                                <span>{col.isFeatured ? "Featured on Slider" : "Standard"}</span>
                              </button>

                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-white backdrop-blur-md border border-white/10">
                                {resolvedProducts.length} Flacons
                              </span>
                            </div>

                            {/* Title & Slug in Banner */}
                            <div className="absolute bottom-3 inset-x-3">
                              <h3 className="font-serif text-base text-white font-medium line-clamp-1">
                                {col.nameEn}
                              </h3>
                              {col.nameAr && (
                                <p className="text-[11px] text-amber-200/90 font-serif line-clamp-1" dir="rtl">
                                  {col.nameAr}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Body: Details & Preferred Product Order */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-500 font-mono">/collections/{col.slug}</span>
                              <span className="text-[10px] text-neutral-400">
                                Priority Ordered
                              </span>
                            </div>

                            {col.descriptionEn && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                {col.descriptionEn}
                              </p>
                            )}

                            {/* Ordered Product Previews */}
                            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                                  Admin Slide Sequence
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  Exact Preference
                                </span>
                              </div>

                              {resolvedProducts.length === 0 ? (
                                <p className="text-xs text-neutral-400 italic py-2">
                                  No products added yet. Click edit to curate flacons.
                                </p>
                              ) : (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {resolvedProducts.slice(0, 6).map((p, idx) => (
                                    <div
                                      key={p.id}
                                      className="flex items-center gap-2 p-1.5 rounded bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 text-xs"
                                    >
                                      <span className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold text-[9px] shrink-0">
                                        {idx + 1}
                                      </span>
                                      <div className="w-7 h-7 rounded bg-white dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                                        <img
                                          src={p.image}
                                          alt={p.nameEn}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-neutral-900 dark:text-white truncate text-[11px]">
                                          {p.nameEn}
                                        </p>
                                        <p className="text-[9px] text-neutral-500 truncate">
                                          {p.brand} {p.concentration ? `· ${p.concentration}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                  {resolvedProducts.length > 6 && (
                                    <div className="text-[10px] text-center text-neutral-500 py-1 font-mono">
                                      +{resolvedProducts.length - 6} more flacons in sequence
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-3 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setCollectionToEdit(col);
                              setShowCollectionModal(true);
                            }}
                            className="px-3 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 size={12} />
                            <span>Edit & Order</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleFeaturedCollection(col)}
                              title={col.isFeatured ? "Unfeature from storefront slider" : "Feature on storefront slider"}
                              className={`p-1.5 rounded transition-colors ${
                                col.isFeatured
                                  ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                  : "text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                              }`}
                            >
                              <Sparkles size={14} className={col.isFeatured ? "fill-current" : ""} />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete collection "${col.nameEn}"?`)) {
                                  handleDeleteCollection(col.id, col.nameEn);
                                }
                              }}
                              title="Delete collection"
                              className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 2.3. TAGS MANAGEMENT */}
        {activeTab === "tags" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search tags by name, slug or description..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  {tags.filter((t) => t.isFeatured).length} of {tags.length} featured on storefront
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTag(null);
                    setShowTagModal(true);
                  }}
                  className="px-3.5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Create Tag</span>
                </button>
              </div>
            </div>

            {/* Tags Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[800px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start">Tag Name (EN / AR)</th>
                    <th className="py-3.5 px-4 text-start">Color Badge</th>
                    <th className="py-3.5 px-4 text-start">Slug & URL</th>
                    <th className="py-3.5 px-4 text-start">Storefront Display</th>
                    <th className="py-3.5 px-4 text-start">Associated Products</th>
                    <th className="py-3.5 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {tags.filter((t) => {
                    if (!tagSearch.trim()) return true;
                    const q = tagSearch.toLowerCase();
                    return (
                      t.nameEn.toLowerCase().includes(q) ||
                      (t.nameAr && t.nameAr.toLowerCase().includes(q)) ||
                      t.slug.toLowerCase().includes(q) ||
                      (t.description && t.description.toLowerCase().includes(q))
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500 font-sans">
                        No tags found matching your search. Click "Create Tag" to add one.
                      </td>
                    </tr>
                  ) : (
                    tags
                      .filter((t) => {
                        if (!tagSearch.trim()) return true;
                        const q = tagSearch.toLowerCase();
                        return (
                          t.nameEn.toLowerCase().includes(q) ||
                          (t.nameAr && t.nameAr.toLowerCase().includes(q)) ||
                          t.slug.toLowerCase().includes(q) ||
                          (t.description && t.description.toLowerCase().includes(q))
                        );
                      })
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {t.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: t.colorHex }}
                                />
                              )}
                              <div>
                                <span className="font-semibold text-neutral-900 dark:text-white block">{t.nameEn}</span>
                                {t.nameAr && (
                                  <span className="text-neutral-500 dark:text-neutral-400 text-xs block" dir="rtl">
                                    {t.nameAr}
                                  </span>
                                )}
                                {t.description && (
                                  <span className="text-[11px] text-neutral-400 block max-w-xs truncate mt-0.5">
                                    {t.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.colorHex || "#D4AF37" }} />
                              <span className="text-neutral-700 dark:text-neutral-300">{t.colorHex || "#D4AF37"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="text-neutral-500">/shop?tag=</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.slug}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                                t.isFeatured
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                              }`}
                            >
                              {t.isFeatured ? "Featured Filter" : "Standard Tag"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
                              {t.productCount ?? (t._count?.products ?? products.filter((p) => (p.tags || []).some((pt) => pt.id === t.id || pt.slug === t.slug) || (p.tagIds || []).includes(t.id)).length)}
                            </span>{" "}
                            <span className="text-neutral-400">products</span>
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTag(t);
                                  setShowTagModal(true);
                                }}
                                className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                title="Edit Tag"
                              >
                                <Edit3 size={14} />
                              </button>
                              <a
                                href={`/en/shop?tag=${t.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                                title="View on Storefront"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(t.id, t.nameEn)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete Tag"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
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

            {/* MOBILE BRANDS CARDS (< md) */}
            <div className="space-y-3 md:hidden">
              {filteredBrands.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  No brands matching your search criteria.
                </div>
              ) : (
                filteredBrands.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center p-1">
                        {b.logoUrl || b.heroImageUrl ? (
                          <img src={b.logoUrl || b.heroImageUrl} alt={b.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-serif text-amber-500 font-bold text-base">{b.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate block">
                            {b.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                              b.type === "NICHE"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {b.type === "NICHE" ? "Niche" : "Designer"}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 block mt-0.5">
                          {b.countryEn || "Prestige House"} • Est. {b.year}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length} products cataloged
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBrandToEdit(b);
                            setShowBrandModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/en/brands/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                          title="View Live Page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(b.id, b.name)}
                          className="p-1.5 rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Brand"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP BRANDS TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[920px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[220px]">Brand Name</th>
                    <th className="py-3.5 px-4 text-start min-w-[150px]">URL Slug</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Category</th>
                    <th className="py-3.5 px-4 text-start min-w-[130px]">Country & Year</th>
                    <th className="py-3.5 px-4 text-start min-w-[110px]">Products</th>
                    <th className="py-3.5 px-4 text-start min-w-[190px]">Description</th>
                    <th className="py-3.5 px-4 text-end min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 font-sans">
                        No brands found in the catalog. Click "Add Brand" above to register a prestige house.
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center p-1">
                            {b.logoUrl || b.heroImageUrl ? (
                              <img
                                src={b.logoUrl || b.heroImageUrl}
                                alt={b.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="font-serif text-amber-500 font-bold text-sm">
                                {b.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-white block text-sm">{b.name}</span>
                            <span className="text-neutral-500 text-[11px]">{b.countryEn || "Prestige House"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <span className="text-neutral-400">/brands/</span>
                          <span className="text-amber-500 font-medium">{b.slug}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            b.type === "NICHE"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {b.type === "NICHE" ? "Niche Brand" : "Designer"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-neutral-900 dark:text-neutral-100 block">{b.countryEn}</span>
                        <span className="text-neutral-500 text-[10px]">Est. {b.year}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase()).length} products
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 max-w-sm truncate text-[11px]">
                        {b.storyEn || "Brand description available."}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setBrandToEdit(b);
                              setShowBrandModal(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Edit Brand"
                          >
                            <Edit3 size={14} />
                          </button>
                          <a
                            href={`/en/brands/${b.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="View Brand Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => handleDeleteBrand(b.id, b.name)}
                            className="p-1.5 text-neutral-500 hover:text-rose-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Delete Brand"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

            {/* MOBILE NOTES CARDS (< md) */}
            <div className="space-y-3 md:hidden">
              {filteredNotes.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  No scent notes matching your search criteria.
                </div>
              ) : (
                filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center">
                        {n.heroImageUrl || n.thumbnailUrl ? (
                          <img src={n.heroImageUrl || n.thumbnailUrl} alt={n.nameEn} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-purple-500 font-bold text-base">{n.nameEn.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate block">
                            {n.nameEn}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[9px] font-bold rounded">
                            {n.family}
                          </span>
                        </div>
                        {n.nameAr && (
                          <span className="text-neutral-500 text-xs block truncate mt-0.5" dir="rtl">
                            {n.nameAr}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          Origin: {n.originEn || "Middle East"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {n.perfumesCount} products featured
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNoteToEdit(n);
                            setShowNoteModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/en/notes/${n.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                          title="View Note Page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id, n.nameEn)}
                          className="p-1.5 rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Note"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP NOTES TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[920px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[220px]">Note Name (EN / AR)</th>
                    <th className="py-3.5 px-4 text-start min-w-[150px]">URL Slug</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Family</th>
                    <th className="py-3.5 px-4 text-start min-w-[130px]">Origin</th>
                    <th className="py-3.5 px-4 text-start min-w-[110px]">Products</th>
                    <th className="py-3.5 px-4 text-start min-w-[190px]">Description</th>
                    <th className="py-3.5 px-4 text-end min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredNotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 font-sans">
                        No olfactory notes found. Click "Add Note" above to define scent pyramid ingredients.
                      </td>
                    </tr>
                  ) : (
                    filteredNotes.map((n) => (
                    <tr key={n.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center">
                            {n.heroImageUrl || n.thumbnailUrl ? (
                              <img
                                src={n.heroImageUrl || n.thumbnailUrl}
                                alt={n.nameEn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-serif text-purple-500 font-bold text-sm">
                                {n.nameEn.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-white block text-sm">{n.nameEn}</span>
                            <span className="text-neutral-500 text-xs block" dir="rtl">
                              {n.nameAr}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <span className="text-neutral-400">/notes/</span>
                          <span className="text-purple-500 font-medium">{n.slug}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded">
                          {n.family}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 text-[11px]">
                        {n.originEn || "Middle East"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        {n.perfumesCount} products
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 max-w-xs truncate text-[11px]">
                        {n.descriptionEn || "Sensory description available."}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setNoteToEdit(n);
                              setShowNoteModal(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Edit Note"
                          >
                            <Edit3 size={14} />
                          </button>
                          <a
                            href={`/en/notes/${n.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="View Note Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => handleDeleteNote(n.id, n.nameEn)}
                            className="p-1.5 text-neutral-500 hover:text-rose-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
              <div className="py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-500 font-sans">
                No active supplier purchase orders pending. Inbound consignments from perfume houses will appear here.
              </div>
            </div>
          </div>
        )}

        {/* 6. RETURNS */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Returns & Reverse Logistics</h2>
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 rounded">
                {returns.length} Return Cases
              </span>
            </div>

            {/* MOBILE RETURNS CARDS (hidden on md+, visible on mobile) */}
            <div className="block md:hidden space-y-3">
              {returns.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg text-xs text-neutral-500">
                  No return requests in queue.
                </div>
              ) : (
                returns.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-semibold text-xs text-neutral-900 dark:text-white block">
                          {r.number}
                        </span>
                        <span className="text-[11px] text-neutral-500">{r.customer}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          r.status === "COMPLETED"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">Returned Item:</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{r.item}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">Inspection Condition:</span>
                        <span className="font-mono text-neutral-700 dark:text-neutral-300">{r.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">Disposition Action:</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">{r.disposition}</span>
                      </div>
                    </div>

                    {r.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => handleInspectReturn(r.id, "RESTOCK_SELLABLE")}
                        className="w-full py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded shadow-sm transition-colors text-center"
                      >
                        Approve Restock
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP RETURNS TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[850px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[180px]">Return # / Customer</th>
                    <th className="py-3.5 px-4 text-start min-w-[200px]">Returned Item</th>
                    <th className="py-3.5 px-4 text-start min-w-[140px]">Condition</th>
                    <th className="py-3.5 px-4 text-start min-w-[160px]">Restock Action</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Status</th>
                    <th className="py-3.5 px-4 text-end min-w-[130px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500 font-sans">
                        No return requests in queue. 7-day guarantee returns submitted by customers will be logged here for physical inspection.
                      </td>
                    </tr>
                  ) : (
                    returns.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 dark:text-white block">{r.number}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-800 dark:text-neutral-200 font-medium">{r.item}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">{r.condition}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-600 dark:text-purple-400 font-semibold">{r.disposition}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "COMPLETED" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        {r.status !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => handleInspectReturn(r.id, "RESTOCK_SELLABLE")}
                            className="px-3 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-[11px] font-medium rounded shadow-sm"
                          >
                            Approve Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
                {["ALL", "PENDING", "PAID", "FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
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

            {/* MOBILE ORDERS CARDS (< md) */}
            <div className="space-y-3 md:hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  No orders matching the current filter.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderForDetail(o);
                      setShowOrderDetailModal(true);
                    }}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer space-y-3"
                  >
                    {/* Top Row: Order #, Status, Market */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                          {o.number}
                        </span>
                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono font-bold rounded">
                          {o.market}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded ${
                          o.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                            : o.status === "SHIPPED"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                            : o.status === "FULFILLING"
                            ? "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                            : o.status === "PAID"
                            ? "bg-cyan-500/10 text-cyan-600 border border-cyan-500/30"
                            : o.status === "CANCELLED"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    {/* Customer & Date */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                          {o.customer}
                        </span>
                        {o.email && (
                          <span className="text-[11px] text-neutral-500 font-mono block">
                            {o.email}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">{o.date}</span>
                    </div>

                    {/* Financials & Line Items */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-neutral-900 dark:text-white">
                          {o.amount}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase">
                          {o.method}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                        <Package size={10} />
                        {o.items?.length || 1} {(o.items?.length || 1) === 1 ? "flacon" : "flacons"}
                      </span>
                    </div>

                    {/* Action Controls */}
                    <div
                      className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1.5 rounded focus:outline-none font-medium flex-1 max-w-[130px]"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FULFILLING">FULFILLING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForDetail(o);
                            setShowOrderDetailModal(true);
                          }}
                          className="px-3 py-1.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResendNotification(o.id, "whatsapp")}
                          title="Send WhatsApp"
                          className="p-1.5 rounded bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]/30"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResendNotification(o.id, "email")}
                          title="Send Email"
                          className="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700"
                        >
                          <Mail size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP ORDERS TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[980px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[200px]">Order ID / Client</th>
                    <th className="py-3.5 px-4 text-start min-w-[110px]">Line Items</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Total Amount</th>
                    <th className="py-3.5 px-4 text-start min-w-[130px]">Payment Provider</th>
                    <th className="py-3.5 px-4 text-start min-w-[80px]">Market</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Date / Timeline</th>
                    <th className="py-3.5 px-4 text-start min-w-[140px]">Status Workflow</th>
                    <th className="py-3.5 px-4 text-end min-w-[180px]">Inspect & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-500 font-sans">
                        No orders currently placed in this view. Completed storefront acquisitions will stream here live.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => {
                        setSelectedOrderForDetail(o);
                        setShowOrderDetailModal(true);
                      }}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 dark:text-white block hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                          {o.number}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400 text-[11px] block mt-0.5">
                          {o.customer}
                        </span>
                        {o.email && (
                          <span className="text-neutral-400 dark:text-neutral-500 text-[10px] block font-mono">
                            {o.email}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                          <Package size={11} className="text-neutral-400" />
                          {o.items?.length || 1} {(o.items?.length || 1) === 1 ? "flacon" : "flacons"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900 dark:text-white">
                        {o.amount}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400">
                        {o.method}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-bold rounded">
                          {o.market}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {o.date}
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1 rounded focus:outline-none font-medium"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="FULFILLING">FULFILLING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForDetail(o);
                              setShowOrderDetailModal(true);
                            }}
                            title="Inspect Full Order Dossier & Tracking"
                            className="px-2.5 py-1 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-[11px] flex items-center gap-1 hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendNotification(o.id, "whatsapp")}
                            title="Send WhatsApp"
                            className="px-2 py-1 rounded bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare size={12} />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendNotification(o.id, "email")}
                            title="Send Email"
                            className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
                          >
                            <Mail size={12} />
                            <span className="hidden xl:inline">Email</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Fragrance Reviews Moderation</h2>
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 rounded">
                {reviews.length} Verified Reviews
              </span>
            </div>

            {/* MOBILE REVIEWS CARDS (hidden on md+, visible on mobile) */}
            <div className="block md:hidden space-y-3">
              {reviews.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg text-xs text-neutral-500">
                  No customer reviews waiting for moderation.
                </div>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white block">
                          {r.product}
                        </span>
                        <span className="text-[11px] text-neutral-500">By {r.customer}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                          r.status === "APPROVED"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : r.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-900"
                            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-semibold text-xs">★ {r.rating} / 5</span>
                        <span className="text-neutral-900 dark:text-white font-medium text-xs">"{r.title}"</span>
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 flex items-center gap-3">
                        <span>Longevity: <strong className="text-neutral-700 dark:text-neutral-300">{r.longevity}/5</strong></span>
                        <span>•</span>
                        <span>Sillage: <strong className="text-neutral-700 dark:text-neutral-300">{r.sillage}/5</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {r.status !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, "APPROVED")}
                          className="flex-1 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded shadow-sm text-center"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => handleReviewAction(r.id, "REJECTED")}
                          className="flex-1 py-1.5 border border-rose-300 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded text-center"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP & LAPTOP REVIEWS TABLE (hidden on mobile, visible md+) */}
            <div className="hidden md:block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full text-start text-xs font-sans min-w-[850px]">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-4 text-start min-w-[200px]">Product / Customer</th>
                    <th className="py-3.5 px-4 text-start min-w-[240px]">Title & Rating</th>
                    <th className="py-3.5 px-4 text-start min-w-[170px]">Longevity / Sillage</th>
                    <th className="py-3.5 px-4 text-start min-w-[120px]">Status</th>
                    <th className="py-3.5 px-4 text-end min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500 font-sans">
                        No customer reviews waiting for moderation. Verified client reviews submitted on the storefront will appear here.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-900 dark:text-white block">{r.product}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{r.customer}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-neutral-900 dark:text-white block font-medium">"{r.title}"</span>
                        <span className="text-amber-500 font-medium">★ {r.rating} / 5</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                        L: {r.longevity}/5 • S: {r.sillage}/5
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            r.status === "APPROVED"
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : r.status === "REJECTED"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-900"
                              : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {r.status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => handleReviewAction(r.id, "APPROVED")}
                              className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-[11px] font-medium rounded shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => handleReviewAction(r.id, "REJECTED")}
                              className="px-2.5 py-1.5 border border-rose-300 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px] rounded"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="font-serif text-lg text-neutral-900 dark:text-white font-light">Promotional Banners & Sliders</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure hero sliders, campaign banners, and announcements.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddBanner}
                className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={15} />
                <span>+ Add New Banner</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: `All Banners (${banners.length})` },
                { id: "HERO_SLIDER", label: `Hero Sliders (${banners.filter((b) => b.slot === "HERO_SLIDER").length})` },
                { id: "DEALS", label: `Offer & Deal Banners (${banners.filter((b) => b.slot === "CAMPAIGN_MID" || b.slot === "PROMO_STRIP").length})` },
                { id: "ANNOUNCEMENT_BAR", label: `Announcement Bars (${banners.filter((b) => b.slot === "ANNOUNCEMENT_BAR").length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setBannerSlotFilter(pill.id)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    bannerSlotFilter === pill.id
                      ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Banners List */}
            <div className="grid grid-cols-1 gap-4">
              {banners.filter((b) => {
                if (bannerSlotFilter === "ALL") return true;
                if (bannerSlotFilter === "DEALS") return b.slot === "CAMPAIGN_MID" || b.slot === "PROMO_STRIP";
                return b.slot === bannerSlotFilter;
              }).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg text-xs text-neutral-500 font-sans space-y-3">
                  <p>No promotional banners found in this view. Click "Add New Banner" to publish hero campaigns, special offers, or announcements.</p>
                  <div>
                    <button
                      type="button"
                      onClick={handleOpenAddBanner}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      <span>+ Add New Banner</span>
                    </button>
                  </div>
                </div>
              ) : (
                banners
                  .filter((b) => {
                    if (bannerSlotFilter === "ALL") return true;
                    if (bannerSlotFilter === "DEALS") return b.slot === "CAMPAIGN_MID" || b.slot === "PROMO_STRIP";
                    return b.slot === bannerSlotFilter;
                  })
                  .map((b) => (
                <div key={b.id} className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded flex gap-4 items-center">
                  <img src={b.imageUrl} alt="" className="w-24 h-16 object-cover rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${SLOT_COLORS[b.slot] || "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700"}`}>
                        {SLOT_LABELS[b.slot] || b.slot}
                      </span>
                      {b.eyebrowEn && (
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">
                          {b.eyebrowEn}
                        </span>
                      )}
                      <span className="font-serif text-sm text-neutral-900 dark:text-white font-medium">{b.titleEn}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">{b.subtitleEn}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-neutral-500 block">Link: {b.ctaUrl || "/shop"}</span>
                      {b.overlayLabelEn && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700">
                          {b.overlayLabelEn}
                        </span>
                      )}
                    </div>
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
              ))
              )}
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
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white font-medium"
                      >
                        <option value="HERO_SLIDER">Hero Slider (Top Masthead Campaign)</option>
                        <option value="CAMPAIGN_MID">Campaign Mid-Page (Special Offer & Deal Banner)</option>
                        <option value="PROMO_STRIP">Promo Strip (Promotional Offer Strip)</option>
                        <option value="ANNOUNCEMENT_BAR">Announcement Bar (Top Site Header)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Offer Tag / Eyebrow (EN)</label>
                        <input
                          type="text"
                          placeholder="LIMITED PROMOTIONAL OFFER · EXCLUSIVE DEALS"
                          value={bannerForm.eyebrowEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, eyebrowEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Offer Tag / Eyebrow (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="عرض ترويجي حصري · صفقات خاصة"
                          value={bannerForm.eyebrowAr}
                          onChange={(e) => setBannerForm({ ...bannerForm, eyebrowAr: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Headline / Deal Title (English)</label>
                      <input
                        type="text"
                        placeholder="Private Client Reserve | Up to 20% Off"
                        value={bannerForm.titleEn}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Headline / Deal Title (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مختارات كبار الشخصيات | خصم حتى ٢٠٪"
                        value={bannerForm.titleAr}
                        onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Subtitle / Deal Terms (EN)</label>
                        <textarea
                          rows={2}
                          placeholder="Acquire rare artisanal extraits and pure parfums with complimentary delivery..."
                          value={bannerForm.subtitleEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, subtitleEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Subtitle / Deal Terms (AR)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          placeholder="اقتنِ أنقى خلاصات العطور النيش النادرة مع توصيل مبرد مجاني..."
                          value={bannerForm.subtitleAr}
                          onChange={(e) => setBannerForm({ ...bannerForm, subtitleAr: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Promo Code / Deal Badge (EN)</label>
                        <input
                          type="text"
                          placeholder="VIP DEAL CODE: MUSCHIO20"
                          value={bannerForm.overlayLabelEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, overlayLabelEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Promo Code / Deal Badge (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="رمز العرض: MUSCHIO20"
                          value={bannerForm.overlayLabelAr}
                          onChange={(e) => setBannerForm({ ...bannerForm, overlayLabelAr: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                    </div>

                    <MediaUploadField
                      label="Desktop Campaign Banner Artwork (1920x800)"
                      value={bannerForm.imageUrl}
                      onChange={(url) => setBannerForm({ ...bannerForm, imageUrl: url })}
                      folder="muschio/banners/desktop"
                      hint="Upload wide luxury campaign creative or promotional offer visual"
                    />

                    <MediaUploadField
                      label="Mobile Portrait Artwork (Optional - 800x1000)"
                      value={bannerForm.mobileImageUrl}
                      onChange={(url) => setBannerForm({ ...bannerForm, mobileImageUrl: url })}
                      folder="muschio/banners/mobile"
                      hint="Mobile-optimized portrait crop for smartphones"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">CTA Button (EN)</label>
                        <input
                          type="text"
                          placeholder="Explore Privé Deals"
                          value={bannerForm.ctaTextEn}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaTextEn: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">CTA Button (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="استكشف العروض الحصرية"
                          value={bannerForm.ctaTextAr}
                          onChange={(e) => setBannerForm({ ...bannerForm, ctaTextAr: e.target.value })}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Target URL</label>
                        <input
                          type="text"
                          placeholder="/shop?deal=true"
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

            {/* Active Catalog Deals & Special Offers Showcase */}
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 rounded space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h3 className="font-serif text-base text-neutral-900 dark:text-white font-medium flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Catalog Deals & Active Reductions ({catalogDeals.length})</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Flacons with promotional pricing (Compare-At Price &gt; Selling Price). These appear automatically under deals and special promotions.
                  </p>
                </div>
                <a
                  href="/shop?deal=true"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Preview Deals on Storefront</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {catalogDeals.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded text-xs text-neutral-500 font-sans">
                  No products currently discounted. In the Products tab, edit any product variant and set "Base / Regular Price" higher than "Selling Price" to create an active deal discount.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catalogDeals.map((deal, idx) => (
                    <div
                      key={`${deal.productId}-${deal.volume}-${idx}`}
                      className="p-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded flex gap-3 items-center"
                    >
                      <img src={deal.image} alt="" className="w-12 h-14 object-cover rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-sans text-neutral-500 block truncate">{deal.brand} · {deal.volume}</span>
                        <h4 className="text-xs font-serif font-medium text-neutral-900 dark:text-white truncate">{deal.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{deal.dealPrice} AED</span>
                          <span className="text-[10px] text-neutral-400 line-through font-mono">{deal.regularPrice} AED</span>
                          <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold rounded">
                            -{deal.discountPct}% OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-6 space-y-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="font-serif text-xl font-light text-neutral-900 dark:text-white">Immutable Administrative Audit Log</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">All administrative operations, creations, and transitions are tracked here.</p>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] rounded">
                {auditLogs.length} Events Logged
              </span>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs font-mono">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 font-sans text-xs">
                  No administrative actions recorded in current session. Operations like product edits, status updates, and order dispatches will appear here.
                </div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{log.action}</span>
                      <span className="text-neutral-500 dark:text-neutral-400">[{log.res}]</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{log.user}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))
              )}
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
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => {
          setShowCollectionModal(false);
          setCollectionToEdit(null);
        }}
        collectionToEdit={collectionToEdit}
        onSave={handleSaveCollection}
        allProducts={products}
      />

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

      <TagModal
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setEditingTag(null);
        }}
        tagToEdit={editingTag}
        onSave={handleSaveTag}
      />

      <OrderDetailModal
        isOpen={showOrderDetailModal}
        order={selectedOrderForDetail}
        onClose={() => {
          setShowOrderDetailModal(false);
          setSelectedOrderForDetail(null);
        }}
        onUpdateStatus={updateOrderStatus}
        onResendNotification={handleResendNotification}
      />
    </div>
  );
}
