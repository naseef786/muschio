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
} from "lucide-react";

type AdminTab =
  | "dashboard"
  | "products"
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

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  price: string;
  stock: number;
  testerStock: number;
  reserved: number;
  warehouse: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}

interface NoteItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  family: string;
  status: "PUBLISHED" | "DRAFT";
  perfumesCount: number;
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

  // 1. PRODUCTS
  const [products, setProducts] = usePersistentState<ProductItem[]>("products", [
    {
      id: "p1",
      sku: "AMO-INT53-100",
      name: "Interlude 53 Man Extrait de Parfum",
      brand: "Amouage",
      price: "1,850 AED",
      stock: 28,
      testerStock: 5,
      reserved: 2,
      warehouse: "DXB-MAIN",
      status: "PUBLISHED",
    },
    {
      id: "p2",
      sku: "MFK-BR540E-70",
      name: "Baccarat Rouge 540 Extrait",
      brand: "Maison Francis Kurkdjian",
      price: "1,650 AED",
      stock: 34,
      testerStock: 4,
      reserved: 1,
      warehouse: "DXB-MAIN",
      status: "PUBLISHED",
    },
    {
      id: "p3",
      sku: "ROJA-ELY-100",
      name: "Elysium Pour Homme Parfum",
      brand: "Roja Parfums",
      price: "1,950 AED",
      stock: 25,
      testerStock: 2,
      reserved: 0,
      warehouse: "RUH-HUB",
      status: "PUBLISHED",
    },
    {
      id: "p4",
      sku: "XER-ALEX2-100",
      name: "Alexandria II Eau de Parfum",
      brand: "Xerjoff",
      price: "2,200 AED",
      stock: 19,
      testerStock: 3,
      reserved: 0,
      warehouse: "DXB-MAIN",
      status: "PUBLISHED",
    },
  ]);

  const [productSearch, setProductSearch] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    brand: "Amouage",
    price: "",
    stock: 20,
    testerStock: 2,
    warehouse: "DXB-MAIN",
    status: "PUBLISHED" as const,
  });

  // 2. SCENT NOTES
  const [notes, setNotes] = usePersistentState<NoteItem[]>("notes", [
    { id: "n1", nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose", family: "Floral", status: "PUBLISHED", perfumesCount: 4 },
    { id: "n2", nameEn: "Silver Frankincense", nameAr: "اللبان الحوجري الفضي", slug: "silver-frankincense", family: "Resin", status: "PUBLISHED", perfumesCount: 3 },
    { id: "n3", nameEn: "Cambodian Agarwood (Oud)", nameAr: "دهن عود كمبودي", slug: "cambodian-oud", family: "Woody", status: "PUBLISHED", perfumesCount: 5 },
    { id: "n4", nameEn: "Florentine Iris", nameAr: "سوسن فلورنسا", slug: "florentine-iris", family: "Powdery", status: "PUBLISHED", perfumesCount: 3 },
    { id: "n5", nameEn: "Golden Ambergris", nameAr: "العنبر الأشهب", slug: "golden-ambergris", family: "Amber", status: "PUBLISHED", perfumesCount: 4 },
  ]);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    nameEn: "",
    nameAr: "",
    slug: "",
    family: "Floral",
    status: "PUBLISHED" as const,
  });

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
    const newP: ProductItem = {
      id: `p-${Date.now()}`,
      sku: productForm.sku,
      name: productForm.name,
      brand: productForm.brand,
      price: priceFormatted,
      stock: Number(productForm.stock) || 0,
      testerStock: Number(productForm.testerStock) || 0,
      reserved: 0,
      warehouse: productForm.warehouse,
      status: productForm.status,
    };
    setProducts((prev) => [newP, ...prev]);
    addAuditLog("PRODUCT_CREATED", `${newP.sku} (${newP.name})`);
    setShowProductModal(false);
    setProductForm({ sku: "", name: "", brand: "Amouage", price: "", stock: 20, testerStock: 2, warehouse: "DXB-MAIN", status: "PUBLISHED" });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("PRODUCT_DELETED", `Product ${id} (${name})`);
  };

  // Note Actions
  const handleSaveNote = () => {
    if (!noteForm.nameEn || !noteForm.slug) return;
    const newN: NoteItem = {
      id: `n-${Date.now()}`,
      nameEn: noteForm.nameEn,
      nameAr: noteForm.nameAr || noteForm.nameEn,
      slug: noteForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      family: noteForm.family,
      status: noteForm.status,
      perfumesCount: 1,
    };
    setNotes((prev) => [...prev, newN]);
    addAuditLog("NOTE_CREATED", `${newN.slug} (${newN.nameEn})`);
    setShowNoteModal(false);
    setNoteForm({ nameEn: "", nameAr: "", slug: "", family: "Floral", status: "PUBLISHED" });
  };

  const handleDeleteNote = (id: string, name: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addAuditLog("NOTE_DELETED", `Note ${id} (${name})`);
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
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent block">Enterprise Portal</span>
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
                <span>Executive Dashboard</span>
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
                <span>Products & Vault</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "notes" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers size={16} />
                <span>Scent Notes Explorer</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{notes.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "inventory" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <Warehouse size={16} />
              <span>Warehouses & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("purchasing")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                activeTab === "purchasing" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={16} />
              <span>Suppliers & POs</span>
            </button>

            <button
              onClick={() => setActiveTab("returns")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "returns" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <RotateCcw size={16} />
                <span>Returns & Quarantine</span>
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
                <span>Orders & Fulfillment</span>
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
                <span>Reviews Moderation</span>
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
              <span>Markets & GCC VAT</span>
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "banners" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <ImageIcon size={16} />
                <span>Banners & Homepage CMS</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">{banners.length}</span>
            </button>

            {/* NEW 11. SOCIAL & STOREFRONT SETTINGS */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${
                activeTab === "settings" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Share2 size={16} />
                <span>Social & Store Settings</span>
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
              <span>Security & Audit Log</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 text-[11px] space-y-1.5 rounded">
          <div className="font-semibold text-slate-200">Director of Operations</div>
          <div className="text-slate-400 font-mono text-[10px]">superadmin@muschio.luxury</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vault Online • Live State Persistent</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="font-serif text-2xl font-light text-white capitalize">
              {activeTab === "settings" ? "Social Media & Storefront Settings" : activeTab.replace("-", " ")}
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Muschio Luxury Enterprise Portal • Live State Persistence & Multi-Market Compliant
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
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Active Orders in Queue</span>
                <div className="font-serif text-3xl text-amber-400 font-light">{activeOrdersCount} Orders</div>
                <div className="text-slate-400 text-xs font-mono">GCC Express Track Active</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Physical Stock in Vaults</span>
                <div className="font-serif text-3xl text-emerald-400 font-light">{totalStockUnits} Flacons</div>
                <div className="text-slate-400 text-xs font-mono">+{totalTesterUnits} Tester Units</div>
              </div>

              <div className="p-6 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Returns in Inspection</span>
                <div className="font-serif text-3xl text-purple-400 font-light">{returns.length} Units</div>
                <div className="text-slate-400 text-xs">Quarantine Isolation Active</div>
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

        {/* 2. PRODUCTS & CATALOG */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute inset-y-0 start-3 my-auto text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by SKU, product name, or house..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-800 text-xs text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-slate-600"
                />
              </div>
              <button
                onClick={() => setShowProductModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add New Flacon</span>
              </button>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">SKU / Product</th>
                    <th className="p-4 text-start">House / Brand</th>
                    <th className="p-4 text-start">Base Price</th>
                    <th className="p-4 text-start">Warehouse Stock</th>
                    <th className="p-4 text-start">Tester Units</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products
                    .filter((p) => {
                      if (!productSearch.trim()) return true;
                      const q = productSearch.toLowerCase();
                      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <span className="font-semibold text-white block">{p.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{p.sku}</span>
                        </td>
                        <td className="p-4 text-slate-300">{p.brand}</td>
                        <td className="p-4 font-mono font-medium text-slate-100">{p.price}</td>
                        <td className="p-4 font-mono text-emerald-400">{p.stock} sealed ({p.warehouse})</td>
                        <td className="p-4 font-mono text-purple-400">{p.testerStock} testers</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-end">
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Add Product Modal */}
            {showProductModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-serif text-lg text-white font-light">Add New Luxury Flacon to Vault</h3>
                    <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">SKU Code</label>
                      <input
                        type="text"
                        placeholder="e.g. AMO-INT53-100"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Product Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Taif Extrait de Parfum"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Maison / House</label>
                        <select
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                        >
                          <option value="Amouage">Amouage</option>
                          <option value="Maison Francis Kurkdjian">Maison Francis Kurkdjian</option>
                          <option value="Roja Parfums">Roja Parfums</option>
                          <option value="Xerjoff">Xerjoff</option>
                          <option value="Tom Ford">Tom Ford</option>
                          <option value="Clive Christian">Clive Christian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Base Price (AED)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1,850"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Sealed Stock (Units)</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Tester Units</label>
                        <input
                          type="number"
                          value={productForm.testerStock}
                          onChange={(e) => setProductForm({ ...productForm, testerStock: Number(e.target.value) })}
                          className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Fulfillment Warehouse</label>
                      <select
                        value={productForm.warehouse}
                        onChange={(e) => setProductForm({ ...productForm, warehouse: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      >
                        <option value="DXB-MAIN">DXB-MAIN (Dubai Central Hub)</option>
                        <option value="RUH-HUB">RUH-HUB (Riyadh GCC Hub)</option>
                      </select>
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
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
                    >
                      Save to Vault
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DEDICATED NOTES & ACCORDS GRAPH */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">Total verified olfactory raw essences: {notes.length}</span>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add Scent Note</span>
              </button>
            </div>

            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">Note (EN / AR)</th>
                    <th className="p-4 text-start">Canonical Slug</th>
                    <th className="p-4 text-start">Scent Family</th>
                    <th className="p-4 text-start">Linked Perfumes</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {notes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-semibold text-white block">{n.nameEn}</span>
                        <span className="text-slate-400 text-xs" dir="rtl">{n.nameAr}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{n.slug}</td>
                      <td className="p-4 text-slate-300">{n.family}</td>
                      <td className="p-4 font-mono text-slate-200">{n.perfumesCount} products joined</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">
                          {n.status}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <button
                          onClick={() => handleDeleteNote(n.id, n.nameEn)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Note Modal */}
            {showNoteModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-serif text-lg text-white font-light">Add Rare Olfactory Essence</h3>
                    <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Name (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Taif Rose"
                        value={noteForm.nameEn}
                        onChange={(e) => setNoteForm({ ...noteForm, nameEn: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Name (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="e.g. ورد الطائف الملكي"
                        value={noteForm.nameAr}
                        onChange={(e) => setNoteForm({ ...noteForm, nameAr: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Canonical Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. taif-rose"
                        value={noteForm.slug}
                        onChange={(e) => setNoteForm({ ...noteForm, slug: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Scent Family</label>
                      <select
                        value={noteForm.family}
                        onChange={(e) => setNoteForm({ ...noteForm, family: e.target.value })}
                        className="w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded"
                      >
                        <option value="Floral">Floral (Rare Flowers)</option>
                        <option value="Resin">Resin & Sacred Incense</option>
                        <option value="Woody">Woody & Aged Oud</option>
                        <option value="Amber">Amber & Animalic</option>
                        <option value="Citrus">Citrus & Sparkling</option>
                        <option value="Spice">Opulent Spice</option>
                        <option value="Gourmand">Gourmand & Vanilla</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 border border-slate-800 text-slate-300 rounded">
                      Cancel
                    </button>
                    <button onClick={handleSaveNote} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded">
                      Publish Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. WAREHOUSES & STOCK LEDGER */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">DXB-MAIN (Dubai Central Hub)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">DEFAULT VAULT</span>
                </div>
                <p className="text-xs text-slate-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "DXB-MAIN").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-slate-500">Same-Day White-Glove Dispatch: Dubai, Abu Dhabi, Sharjah</div>
              </div>
              <div className="p-4 bg-[#111622] border border-slate-800 space-y-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-white">RUH-HUB (Riyadh GCC Hub)</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">REGIONAL NODE</span>
                </div>
                <p className="text-xs text-slate-400">Total Allocated Sealed Units: {products.filter(p => p.warehouse === "RUH-HUB").reduce((a, b) => a + b.stock, 0)}</p>
                <div className="text-[11px] font-mono text-slate-500">Express Delivery: Riyadh, Jeddah, Khobar, GCC</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. SUPPLIERS & POs */}
        {activeTab === "purchasing" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] p-6 space-y-3 rounded">
              <h3 className="font-serif text-lg text-white font-light">Official Maison Allocation Purchase Orders</h3>
              <p className="text-xs text-slate-400">Active agreements with authorized master distributor networks in France, Oman, and Italy.</p>
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

        {/* 6. RETURNS & QUARANTINE */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-[#111622] overflow-hidden rounded">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-start">RMA # / Customer</th>
                    <th className="p-4 text-start">Returned Item</th>
                    <th className="p-4 text-start">Inspection Condition</th>
                    <th className="p-4 text-start">Disposition Allocation</th>
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

        {/* 7. ORDERS & MULTI-SHIPMENTS */}
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
                    {mkt === "ALL" ? "All GCC Markets" : `Market: ${mkt}`}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search order or client..."
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
    </div>
  );
}
