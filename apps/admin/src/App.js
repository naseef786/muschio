import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, Package, Layers, ShoppingBag, Sparkles, ShieldCheck, TrendingUp, Warehouse, RotateCcw, Star, Globe, FileText, ImageIcon, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, X, Share2, Save, CheckCircle2, Search, ExternalLink, } from "lucide-react";
const SLOT_LABELS = {
    HERO_SLIDER: "Hero Slider",
    CAMPAIGN_MID: "Campaign Mid-Page",
    PROMO_STRIP: "Promo Strip",
    ANNOUNCEMENT_BAR: "Announcement Bar",
};
const SLOT_COLORS = {
    HERO_SLIDER: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
    CAMPAIGN_MID: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    PROMO_STRIP: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    ANNOUNCEMENT_BAR: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
};
const SECTION_LABELS = {
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
function usePersistentState(key, initialValue) {
    const [state, setState] = useState(() => {
        if (typeof window === "undefined")
            return initialValue;
        try {
            const item = localStorage.getItem(`muschio_admin_${key}`);
            return item ? JSON.parse(item) : initialValue;
        }
        catch {
            return initialValue;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(`muschio_admin_${key}`, JSON.stringify(state));
        }
        catch (err) {
            console.warn(`Failed to persist muschio_admin_${key}`, err);
        }
    }, [key, state]);
    return [state, setState];
}
export function App() {
    const [activeTab, setActiveTab] = useState("dashboard");
    // 1. PRODUCTS
    const [products, setProducts] = usePersistentState("products", [
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
        status: "PUBLISHED",
    });
    // 2. SCENT NOTES
    const [notes, setNotes] = usePersistentState("notes", [
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
        status: "PUBLISHED",
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
    const [banners, setBanners] = usePersistentState("banners", [
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
    const [sections, setSections] = usePersistentState("sections", [
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
    const [storeSettings, setStoreSettings] = usePersistentState("settings", {
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
    const [auditLogs, setAuditLogs] = usePersistentState("audit", [
        { action: "SETTINGS_UPDATED", res: "SOCIAL_LINKS Instagram & WhatsApp", user: "superadmin@muschio.luxury", time: "16:40:12" },
        { action: "INVENTORY_RESERVATION_CREATED", res: "ORDER #MSC-2026-981245", user: "system (checkout)", time: "14:32:01" },
        { action: "WEBHOOK_PAYMENT_CAPTURED", res: "TABBY #tabby_sess_9812", user: "webhook-service", time: "14:32:45" },
        { action: "ORDER_STATUS_TRANSITION_PAID", res: "ORDER #MSC-2026-981245", user: "system", time: "14:32:46" },
        { action: "BANNER_CREATED", res: "HERO_SLIDER bnr-1", user: "superadmin@muschio.luxury", time: "10:15:32" },
    ]);
    const addAuditLog = (action, res) => {
        const time = new Date().toLocaleTimeString();
        setAuditLogs((prev) => [{ action, res, user: "superadmin@muschio.luxury", time }, ...prev.slice(0, 49)]);
    };
    // Banner form state
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [bannerForm, setBannerForm] = useState({
        slot: "HERO_SLIDER",
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
        if (!bannerForm.titleEn || !bannerForm.titleAr || !bannerForm.imageUrl)
            return;
        if (editingBanner) {
            setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...bannerForm } : b)));
            addAuditLog("BANNER_UPDATED", `${bannerForm.slot} ${editingBanner.id}`);
        }
        else {
            const newBanner = {
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
    const toggleBannerActive = (id) => {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
        addAuditLog("BANNER_TOGGLE", `Banner ${id}`);
    };
    const deleteBanner = (id) => {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        addAuditLog("BANNER_DELETED", `Banner ${id}`);
    };
    // Section ordering with non-undefined array items
    const moveSectionUp = (idx) => {
        if (idx === 0)
            return;
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
    const moveSectionDown = (idx) => {
        setSections((prev) => {
            if (idx >= prev.length - 1)
                return prev;
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
    const toggleSectionVisible = (id) => {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)));
        addAuditLog("HOMEPAGE_SECTION_VISIBILITY", `Section ${id}`);
    };
    // Product Actions
    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.sku)
            return;
        const priceFormatted = productForm.price.includes("AED") ? productForm.price : `${productForm.price} AED`;
        const newP = {
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
    const handleDeleteProduct = (id, name) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        addAuditLog("PRODUCT_DELETED", `Product ${id} (${name})`);
    };
    // Note Actions
    const handleSaveNote = () => {
        if (!noteForm.nameEn || !noteForm.slug)
            return;
        const newN = {
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
    const handleDeleteNote = (id, name) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        addAuditLog("NOTE_DELETED", `Note ${id} (${name})`);
    };
    // Order Actions
    const updateOrderStatus = (orderId, nextStatus) => {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
        addAuditLog("ORDER_STATUS_UPDATE", `${orderId} -> ${nextStatus}`);
    };
    // Return Actions
    const handleInspectReturn = (returnId, disposition) => {
        setReturns((prev) => prev.map((r) => r.id === returnId ? { ...r, disposition, status: "COMPLETED" } : r));
        addAuditLog("RETURN_INSPECTION_COMPLETED", `${returnId} disposition=${disposition}`);
    };
    // Review Actions
    const handleReviewAction = (reviewId, status) => {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
        addAuditLog("REVIEW_MODERATED", `${reviewId} status=${status}`);
    };
    // Settings Save
    const handleSaveSettings = (e) => {
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
    return (_jsxs("div", { className: "min-h-screen bg-[#0A0D14] text-slate-200 flex", children: [_jsxs("aside", { className: "w-64 border-e border-slate-800 bg-[#0E1420] flex flex-col justify-between p-4 shrink-0", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3 px-2", children: [_jsx("div", { className: "w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center", children: _jsx("span", { className: "font-serif text-amber-300 font-bold text-sm", children: "M" }) }), _jsxs("div", { children: [_jsx("span", { className: "font-serif tracking-widest text-lg font-bold text-white block", children: "MUSCHIO" }), _jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] text-accent block", children: "Enterprise Portal" })] })] }), _jsxs("nav", { className: "space-y-1 text-xs font-sans", children: [_jsx("button", { onClick: () => setActiveTab("dashboard"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "dashboard" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: _jsxs("span", { className: "flex items-center gap-3", children: [_jsx(LayoutDashboard, { size: 16 }), _jsx("span", { children: "Executive Dashboard" })] }) }), _jsxs("button", { onClick: () => setActiveTab("products"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "products" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(Package, { size: 16 }), _jsx("span", { children: "Products & Vault" })] }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300", children: products.length })] }), _jsxs("button", { onClick: () => setActiveTab("notes"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "notes" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(Layers, { size: 16 }), _jsx("span", { children: "Scent Notes Explorer" })] }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300", children: notes.length })] }), _jsxs("button", { onClick: () => setActiveTab("inventory"), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${activeTab === "inventory" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsx(Warehouse, { size: 16 }), _jsx("span", { children: "Warehouses & Stock" })] }), _jsxs("button", { onClick: () => setActiveTab("purchasing"), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${activeTab === "purchasing" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsx(FileText, { size: 16 }), _jsx("span", { children: "Suppliers & POs" })] }), _jsxs("button", { onClick: () => setActiveTab("returns"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "returns" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(RotateCcw, { size: 16 }), _jsx("span", { children: "Returns & Quarantine" })] }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400", children: returns.length })] }), _jsxs("button", { onClick: () => setActiveTab("orders"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "orders" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(ShoppingBag, { size: 16 }), _jsx("span", { children: "Orders & Fulfillment" })] }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400", children: orders.length })] }), _jsxs("button", { onClick: () => setActiveTab("reviews"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "reviews" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(Star, { size: 16 }), _jsx("span", { children: "Reviews Moderation" })] }), pendingReviewsCount > 0 && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold", children: pendingReviewsCount }))] }), _jsxs("button", { onClick: () => setActiveTab("markets"), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${activeTab === "markets" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsx(Globe, { size: 16 }), _jsx("span", { children: "Markets & GCC VAT" })] }), _jsxs("button", { onClick: () => setActiveTab("banners"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "banners" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(ImageIcon, { size: 16 }), _jsx("span", { children: "Banners & Homepage CMS" })] }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400", children: banners.length })] }), _jsxs("button", { onClick: () => setActiveTab("settings"), className: `w-full flex items-center justify-between px-3 py-2.5 rounded transition-colors ${activeTab === "settings" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(Share2, { size: 16 }), _jsx("span", { children: "Social & Store Settings" })] }), _jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" })] }), _jsxs("button", { onClick: () => setActiveTab("audit"), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${activeTab === "audit" ? "bg-accent/20 text-white font-medium border-s-2 border-accent" : "text-slate-400 hover:text-white"}`, children: [_jsx(ShieldCheck, { size: 16 }), _jsx("span", { children: "Security & Audit Log" })] })] })] }), _jsxs("div", { className: "p-3 bg-slate-900 border border-slate-800 text-[11px] space-y-1.5 rounded", children: [_jsx("div", { className: "font-semibold text-slate-200", children: "Director of Operations" }), _jsx("div", { className: "text-slate-400 font-mono text-[10px]", children: "superadmin@muschio.luxury" }), _jsxs("div", { className: "text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-800", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { children: "Vault Online \u2022 Live State Persistent" })] })] })] }), _jsxs("main", { className: "flex-1 p-8 space-y-8 overflow-y-auto", children: [_jsxs("header", { className: "flex items-center justify-between pb-6 border-b border-slate-800", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-serif text-2xl font-light text-white capitalize", children: activeTab === "settings" ? "Social Media & Storefront Settings" : activeTab.replace("-", " ") }), _jsx("p", { className: "text-xs text-slate-400 font-sans mt-0.5", children: "Muschio Luxury Enterprise Portal \u2022 Live State Persistence & Multi-Market Compliant" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "px-3 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded", children: "UAE VAT: 5.0% \u2022 KSA VAT: 15.0%" }), _jsxs("a", { href: "http://localhost:3000", target: "_blank", rel: "noreferrer", className: "px-3.5 py-1.5 bg-accent text-white text-xs font-sans hover:bg-accent-hover transition-colors flex items-center gap-1.5 rounded", children: [_jsx(Sparkles, { size: 14 }), _jsx("span", { children: "Live Storefront \u2197" })] })] })] }), activeTab === "dashboard" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wider text-slate-400", children: "Total Net Revenue (MTD)" }), _jsx("div", { className: "font-serif text-3xl text-white font-light", children: "384,250 AED" }), _jsxs("div", { className: "text-emerald-400 text-xs flex items-center gap-1", children: [_jsx(TrendingUp, { size: 12 }), _jsx("span", { children: "+28.4% vs last month" })] })] }), _jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wider text-slate-400", children: "Active Orders in Queue" }), _jsxs("div", { className: "font-serif text-3xl text-amber-400 font-light", children: [activeOrdersCount, " Orders"] }), _jsx("div", { className: "text-slate-400 text-xs font-mono", children: "GCC Express Track Active" })] }), _jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wider text-slate-400", children: "Physical Stock in Vaults" }), _jsxs("div", { className: "font-serif text-3xl text-emerald-400 font-light", children: [totalStockUnits, " Flacons"] }), _jsxs("div", { className: "text-slate-400 text-xs font-mono", children: ["+", totalTesterUnits, " Tester Units"] })] }), _jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "text-[11px] uppercase tracking-wider text-slate-400", children: "Returns in Inspection" }), _jsxs("div", { className: "font-serif text-3xl text-purple-400 font-light", children: [returns.length, " Units"] }), _jsx("div", { className: "text-slate-400 text-xs", children: "Quarantine Isolation Active" })] })] }), _jsxs("div", { className: "p-4 bg-[#111622] border border-slate-800 rounded flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-slate-400", children: "Storefront Social Status:" }), _jsxs("span", { className: "inline-flex items-center gap-1.5 text-emerald-400 font-medium", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), "Instagram (", storeSettings.instagramHandle, ") & WhatsApp Connected"] })] }), _jsxs("button", { onClick: () => setActiveTab("settings"), className: "text-accent hover:underline text-xs flex items-center gap-1", children: [_jsx("span", { children: "Edit Social Links & Hotline" }), _jsx("span", { children: "\u2192" })] })] })] })), activeTab === "products" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-sm", children: [_jsx(Search, { size: 14, className: "absolute inset-y-0 start-3 my-auto text-slate-500" }), _jsx("input", { type: "text", placeholder: "Filter by SKU, product name, or house...", value: productSearch, onChange: (e) => setProductSearch(e.target.value), className: "w-full bg-[#111622] border border-slate-800 text-xs text-white ps-9 pe-3 py-2 rounded focus:outline-none focus:border-slate-600" })] }), _jsxs("button", { onClick: () => setShowProductModal(true), className: "px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors", children: [_jsx(Plus, { size: 14 }), _jsx("span", { children: "Add New Flacon" })] })] }), _jsx("div", { className: "border border-slate-800 bg-[#111622] overflow-hidden rounded", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-start", children: "SKU / Product" }), _jsx("th", { className: "p-4 text-start", children: "House / Brand" }), _jsx("th", { className: "p-4 text-start", children: "Base Price" }), _jsx("th", { className: "p-4 text-start", children: "Warehouse Stock" }), _jsx("th", { className: "p-4 text-start", children: "Tester Units" }), _jsx("th", { className: "p-4 text-start", children: "Status" }), _jsx("th", { className: "p-4 text-end", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: products
                                                .filter((p) => {
                                                if (!productSearch.trim())
                                                    return true;
                                                const q = productSearch.toLowerCase();
                                                return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                                            })
                                                .map((p) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: "font-semibold text-white block", children: p.name }), _jsx("span", { className: "text-slate-400 font-mono text-[11px]", children: p.sku })] }), _jsx("td", { className: "p-4 text-slate-300", children: p.brand }), _jsx("td", { className: "p-4 font-mono font-medium text-slate-100", children: p.price }), _jsxs("td", { className: "p-4 font-mono text-emerald-400", children: [p.stock, " sealed (", p.warehouse, ")"] }), _jsxs("td", { className: "p-4 font-mono text-purple-400", children: [p.testerStock, " testers"] }), _jsx("td", { className: "p-4", children: _jsx("span", { className: "px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded", children: p.status }) }), _jsx("td", { className: "p-4 text-end", children: _jsx("button", { onClick: () => handleDeleteProduct(p.id, p.name), className: "p-1 text-slate-500 hover:text-rose-400 transition-colors", title: "Delete Product", children: _jsx(Trash2, { size: 14 }) }) })] }, p.id))) })] }) }), showProductModal && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsx("h3", { className: "font-serif text-lg text-white font-light", children: "Add New Luxury Flacon to Vault" }), _jsx("button", { onClick: () => setShowProductModal(false), className: "text-slate-400 hover:text-white", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "SKU Code" }), _jsx("input", { type: "text", placeholder: "e.g. AMO-INT53-100", value: productForm.sku, onChange: (e) => setProductForm({ ...productForm, sku: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Product Title" }), _jsx("input", { type: "text", placeholder: "e.g. Royal Taif Extrait de Parfum", value: productForm.name, onChange: (e) => setProductForm({ ...productForm, name: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Maison / House" }), _jsxs("select", { value: productForm.brand, onChange: (e) => setProductForm({ ...productForm, brand: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "Amouage", children: "Amouage" }), _jsx("option", { value: "Maison Francis Kurkdjian", children: "Maison Francis Kurkdjian" }), _jsx("option", { value: "Roja Parfums", children: "Roja Parfums" }), _jsx("option", { value: "Xerjoff", children: "Xerjoff" }), _jsx("option", { value: "Tom Ford", children: "Tom Ford" }), _jsx("option", { value: "Clive Christian", children: "Clive Christian" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Base Price (AED)" }), _jsx("input", { type: "text", placeholder: "e.g. 1,850", value: productForm.price, onChange: (e) => setProductForm({ ...productForm, price: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Sealed Stock (Units)" }), _jsx("input", { type: "number", value: productForm.stock, onChange: (e) => setProductForm({ ...productForm, stock: Number(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Tester Units" }), _jsx("input", { type: "number", value: productForm.testerStock, onChange: (e) => setProductForm({ ...productForm, testerStock: Number(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Fulfillment Warehouse" }), _jsxs("select", { value: productForm.warehouse, onChange: (e) => setProductForm({ ...productForm, warehouse: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "DXB-MAIN", children: "DXB-MAIN (Dubai Central Hub)" }), _jsx("option", { value: "RUH-HUB", children: "RUH-HUB (Riyadh GCC Hub)" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [_jsx("button", { onClick: () => setShowProductModal(false), className: "px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded", children: "Cancel" }), _jsx("button", { onClick: handleSaveProduct, className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded", children: "Save to Vault" })] })] }) }))] })), activeTab === "notes" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("span", { className: "text-xs text-slate-400", children: ["Total verified olfactory raw essences: ", notes.length] }), _jsxs("button", { onClick: () => setShowNoteModal(true), className: "px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors", children: [_jsx(Plus, { size: 14 }), _jsx("span", { children: "Add Scent Note" })] })] }), _jsx("div", { className: "border border-slate-800 bg-[#111622] overflow-hidden rounded", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-start", children: "Note (EN / AR)" }), _jsx("th", { className: "p-4 text-start", children: "Canonical Slug" }), _jsx("th", { className: "p-4 text-start", children: "Scent Family" }), _jsx("th", { className: "p-4 text-start", children: "Linked Perfumes" }), _jsx("th", { className: "p-4 text-start", children: "Status" }), _jsx("th", { className: "p-4 text-end", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: notes.map((n) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: "font-semibold text-white block", children: n.nameEn }), _jsx("span", { className: "text-slate-400 text-xs", dir: "rtl", children: n.nameAr })] }), _jsx("td", { className: "p-4 font-mono text-slate-400", children: n.slug }), _jsx("td", { className: "p-4 text-slate-300", children: n.family }), _jsxs("td", { className: "p-4 font-mono text-slate-200", children: [n.perfumesCount, " products joined"] }), _jsx("td", { className: "p-4", children: _jsx("span", { className: "px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded", children: n.status }) }), _jsx("td", { className: "p-4 text-end", children: _jsx("button", { onClick: () => handleDeleteNote(n.id, n.nameEn), className: "p-1 text-slate-500 hover:text-rose-400 transition-colors", title: "Delete Note", children: _jsx(Trash2, { size: 14 }) }) })] }, n.id))) })] }) }), showNoteModal && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsx("h3", { className: "font-serif text-lg text-white font-light", children: "Add Rare Olfactory Essence" }), _jsx("button", { onClick: () => setShowNoteModal(false), className: "text-slate-400 hover:text-white", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Name (English)" }), _jsx("input", { type: "text", placeholder: "e.g. Royal Taif Rose", value: noteForm.nameEn, onChange: (e) => setNoteForm({ ...noteForm, nameEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Name (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "e.g. \u0648\u0631\u062F \u0627\u0644\u0637\u0627\u0626\u0641 \u0627\u0644\u0645\u0644\u0643\u064A", value: noteForm.nameAr, onChange: (e) => setNoteForm({ ...noteForm, nameAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Canonical Slug" }), _jsx("input", { type: "text", placeholder: "e.g. taif-rose", value: noteForm.slug, onChange: (e) => setNoteForm({ ...noteForm, slug: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Scent Family" }), _jsxs("select", { value: noteForm.family, onChange: (e) => setNoteForm({ ...noteForm, family: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "Floral", children: "Floral (Rare Flowers)" }), _jsx("option", { value: "Resin", children: "Resin & Sacred Incense" }), _jsx("option", { value: "Woody", children: "Woody & Aged Oud" }), _jsx("option", { value: "Amber", children: "Amber & Animalic" }), _jsx("option", { value: "Citrus", children: "Citrus & Sparkling" }), _jsx("option", { value: "Spice", children: "Opulent Spice" }), _jsx("option", { value: "Gourmand", children: "Gourmand & Vanilla" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [_jsx("button", { onClick: () => setShowNoteModal(false), className: "px-4 py-2 border border-slate-800 text-slate-300 rounded", children: "Cancel" }), _jsx("button", { onClick: handleSaveNote, className: "px-4 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded", children: "Publish Note" })] })] }) }))] })), activeTab === "inventory" && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-serif text-lg text-white", children: "DXB-MAIN (Dubai Central Hub)" }), _jsx("span", { className: "px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded", children: "DEFAULT VAULT" })] }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Total Allocated Sealed Units: ", products.filter(p => p.warehouse === "DXB-MAIN").reduce((a, b) => a + b.stock, 0)] }), _jsx("div", { className: "text-[11px] font-mono text-slate-500", children: "Same-Day White-Glove Dispatch: Dubai, Abu Dhabi, Sharjah" })] }), _jsxs("div", { className: "p-4 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-serif text-lg text-white", children: "RUH-HUB (Riyadh GCC Hub)" }), _jsx("span", { className: "px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded", children: "REGIONAL NODE" })] }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Total Allocated Sealed Units: ", products.filter(p => p.warehouse === "RUH-HUB").reduce((a, b) => a + b.stock, 0)] }), _jsx("div", { className: "text-[11px] font-mono text-slate-500", children: "Express Delivery: Riyadh, Jeddah, Khobar, GCC" })] })] }) })), activeTab === "purchasing" && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "border border-slate-800 bg-[#111622] p-6 space-y-3 rounded", children: [_jsx("h3", { className: "font-serif text-lg text-white font-light", children: "Official Maison Allocation Purchase Orders" }), _jsx("p", { className: "text-xs text-slate-400", children: "Active agreements with authorized master distributor networks in France, Oman, and Italy." }), _jsxs("div", { className: "divide-y divide-slate-800 text-xs font-mono pt-3", children: [_jsxs("div", { className: "py-2.5 flex items-center justify-between", children: [_jsx("span", { className: "text-slate-200", children: "PO-2026-081 \u2022 Amouage Luxury LLC (Oman)" }), _jsx("span", { className: "text-emerald-400", children: "DELIVERED & VERIFIED" })] }), _jsxs("div", { className: "py-2.5 flex items-center justify-between", children: [_jsx("span", { className: "text-slate-200", children: "PO-2026-082 \u2022 Roja Parfums London (UK)" }), _jsx("span", { className: "text-amber-400", children: "IN TRANSIT (AIR FREIGHT)" })] })] })] }) })), activeTab === "returns" && (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "border border-slate-800 bg-[#111622] overflow-hidden rounded", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-start", children: "RMA # / Customer" }), _jsx("th", { className: "p-4 text-start", children: "Returned Item" }), _jsx("th", { className: "p-4 text-start", children: "Inspection Condition" }), _jsx("th", { className: "p-4 text-start", children: "Disposition Allocation" }), _jsx("th", { className: "p-4 text-start", children: "Status" }), _jsx("th", { className: "p-4 text-end", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: returns.map((r) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: "font-semibold text-white block", children: r.number }), _jsx("span", { className: "text-slate-400 text-[11px]", children: r.customer })] }), _jsx("td", { className: "p-4 text-slate-300", children: r.item }), _jsx("td", { className: "p-4 font-mono text-slate-300", children: r.condition }), _jsx("td", { className: "p-4 font-mono text-purple-400", children: r.disposition }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`, children: r.status }) }), _jsx("td", { className: "p-4 text-end", children: r.status !== "COMPLETED" && (_jsx("button", { onClick: () => handleInspectReturn(r.id, "RESTOCK_SELLABLE"), className: "px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] rounded", children: "Approve Restock" })) })] }, r.id))) })] }) }) })), activeTab === "orders" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("div", { className: "flex items-center gap-2", children: ["ALL", "AE", "SA", "KW", "QA"].map((mkt) => (_jsx("button", { onClick: () => setOrderMarketFilter(mkt), className: `px-3 py-1.5 text-xs rounded border transition-colors ${orderMarketFilter === mkt
                                                ? "bg-accent border-accent text-white"
                                                : "bg-[#111622] border-slate-800 text-slate-400 hover:text-white"}`, children: mkt === "ALL" ? "All GCC Markets" : `Market: ${mkt}` }, mkt))) }), _jsx("input", { type: "text", placeholder: "Search order or client...", value: orderSearch, onChange: (e) => setOrderSearch(e.target.value), className: "bg-[#111622] border border-slate-800 text-xs text-white px-3 py-1.5 rounded focus:outline-none" })] }), _jsx("div", { className: "border border-slate-800 bg-[#111622] overflow-hidden rounded", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-start", children: "Order ID / Client" }), _jsx("th", { className: "p-4 text-start", children: "Total Amount" }), _jsx("th", { className: "p-4 text-start", children: "Payment Provider" }), _jsx("th", { className: "p-4 text-start", children: "Market" }), _jsx("th", { className: "p-4 text-start", children: "Date / Timeline" }), _jsx("th", { className: "p-4 text-start", children: "Status Workflow" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: orders
                                                .filter((o) => {
                                                if (orderMarketFilter !== "ALL" && o.market !== orderMarketFilter)
                                                    return false;
                                                if (orderSearch.trim()) {
                                                    const q = orderSearch.toLowerCase();
                                                    return o.number.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
                                                }
                                                return true;
                                            })
                                                .map((o) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: "font-semibold text-white block", children: o.number }), _jsx("span", { className: "text-slate-400 text-[11px]", children: o.customer })] }), _jsx("td", { className: "p-4 font-mono font-medium text-slate-100", children: o.amount }), _jsx("td", { className: "p-4 font-mono text-cyan-400", children: o.method }), _jsx("td", { className: "p-4", children: _jsx("span", { className: "px-2 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded", children: o.market }) }), _jsx("td", { className: "p-4 text-slate-400", children: o.date }), _jsx("td", { className: "p-4", children: _jsxs("select", { value: o.status, onChange: (e) => updateOrderStatus(o.id, e.target.value), className: "bg-[#0E1420] border border-slate-700 text-white text-xs px-2.5 py-1 rounded focus:outline-none", children: [_jsx("option", { value: "PAID", children: "PAID" }), _jsx("option", { value: "FULFILLING", children: "FULFILLING" }), _jsx("option", { value: "SHIPPED", children: "SHIPPED" }), _jsx("option", { value: "DELIVERED", children: "DELIVERED" }), _jsx("option", { value: "CANCELLED", children: "CANCELLED" })] }) })] }, o.id))) })] }) })] })), activeTab === "reviews" && (_jsx("div", { className: "space-y-6", children: _jsx("div", { className: "border border-slate-800 bg-[#111622] overflow-hidden rounded", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-[#0E1420] text-slate-400 uppercase tracking-wider border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-start", children: "Product / Customer" }), _jsx("th", { className: "p-4 text-start", children: "Title & Rating" }), _jsx("th", { className: "p-4 text-start", children: "Longevity / Sillage" }), _jsx("th", { className: "p-4 text-start", children: "Status" }), _jsx("th", { className: "p-4 text-end", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: reviews.map((r) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsxs("td", { className: "p-4", children: [_jsx("span", { className: "font-semibold text-white block", children: r.product }), _jsx("span", { className: "text-slate-400 text-[11px]", children: r.customer })] }), _jsxs("td", { className: "p-4", children: [_jsxs("span", { className: "text-white block font-medium", children: ["\"", r.title, "\""] }), _jsxs("span", { className: "text-amber-400", children: ["\u2605 ", r.rating, " / 5"] })] }), _jsxs("td", { className: "p-4 font-mono text-slate-400", children: ["L: ", r.longevity, "/5 \u2022 S: ", r.sillage, "/5"] }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-0.5 text-[10px] font-bold rounded ${r.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`, children: r.status }) }), _jsxs("td", { className: "p-4 text-end space-x-2", children: [r.status !== "APPROVED" && (_jsx("button", { onClick: () => handleReviewAction(r.id, "APPROVED"), className: "px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] rounded", children: "Approve" })), r.status !== "REJECTED" && (_jsx("button", { onClick: () => handleReviewAction(r.id, "REJECTED"), className: "px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded", children: "Reject" }))] })] }, r.id))) })] }) }) })), activeTab === "markets" && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-5 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "font-serif text-lg text-white", children: "United Arab Emirates (AE)" }), _jsx("p", { className: "text-xs text-slate-400", children: "Currency: AED \u2022 Standard VAT: 5.0%" }), _jsx("span", { className: "inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded", children: "PRIMARY ACTIVE MARKET" })] }), _jsxs("div", { className: "p-5 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "font-serif text-lg text-white", children: "Kingdom of Saudi Arabia (SA)" }), _jsx("p", { className: "text-xs text-slate-400", children: "Currency: SAR \u2022 Standard VAT: 15.0%" }), _jsx("span", { className: "inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded", children: "ACTIVE CROSS-BORDER" })] }), _jsxs("div", { className: "p-5 bg-[#111622] border border-slate-800 space-y-2 rounded", children: [_jsx("span", { className: "font-serif text-lg text-white", children: "State of Qatar (QA) & Kuwait (KW)" }), _jsx("p", { className: "text-xs text-slate-400", children: "Currencies: QAR / KWD \u2022 DDP Express" }), _jsx("span", { className: "inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded", children: "WHITE-GLOVE GCC" })] })] }) })), activeTab === "banners" && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-800", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-serif text-lg text-white font-light", children: "Promotional Banners & Sliders" }), _jsx("p", { className: "text-xs text-slate-400", children: "Configure hero sliders, campaign banners, and announcements." })] }), _jsxs("button", { onClick: () => {
                                            resetBannerForm();
                                            setShowBannerForm(true);
                                        }, className: "px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors", children: [_jsx(Plus, { size: 14 }), _jsx("span", { children: "Add New Banner" })] })] }), _jsx("div", { className: "grid grid-cols-1 gap-4", children: banners.map((b) => (_jsxs("div", { className: "p-4 bg-[#111622] border border-slate-800 rounded flex gap-4 items-center", children: [_jsx("img", { src: b.imageUrl, alt: "", className: "w-24 h-16 object-cover rounded border border-slate-700 bg-slate-800" }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-2 py-0.5 text-[10px] font-bold rounded ${SLOT_COLORS[b.slot] || "bg-slate-800 text-slate-300"}`, children: SLOT_LABELS[b.slot] || b.slot }), _jsx("span", { className: "font-serif text-sm text-white", children: b.titleEn })] }), _jsx("p", { className: "text-xs text-slate-400 line-clamp-1", children: b.subtitleEn }), _jsxs("span", { className: "text-[10px] font-mono text-slate-500 block", children: ["Link: ", b.ctaUrl || "/shop"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => toggleBannerActive(b.id), className: `p-1.5 rounded transition-colors ${b.isActive ? "text-emerald-400 hover:bg-slate-800" : "text-slate-500 hover:text-white"}`, title: b.isActive ? "Deactivate" : "Activate", children: b.isActive ? _jsx(Eye, { size: 16 }) : _jsx(EyeOff, { size: 16 }) }), _jsx("button", { onClick: () => deleteBanner(b.id), className: "p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors", title: "Delete Banner", children: _jsx(Trash2, { size: 16 }) })] })] }, b.id))) }), showBannerForm && (_jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-[#111622] border border-slate-800 w-full max-w-lg p-6 space-y-4 rounded max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsx("h3", { className: "font-serif text-lg text-white font-light", children: "Create Campaign Banner" }), _jsx("button", { onClick: resetBannerForm, className: "text-slate-400 hover:text-white", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Banner Placement Slot" }), _jsxs("select", { value: bannerForm.slot, onChange: (e) => setBannerForm({ ...bannerForm, slot: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "HERO_SLIDER", children: "Hero Slider (Top Masthead)" }), _jsx("option", { value: "CAMPAIGN_MID", children: "Campaign Mid-Page" }), _jsx("option", { value: "PROMO_STRIP", children: "Promo Strip" }), _jsx("option", { value: "ANNOUNCEMENT_BAR", children: "Announcement Bar" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Headline (English)" }), _jsx("input", { type: "text", placeholder: "The Art of | Noble Sillage.", value: bannerForm.titleEn, onChange: (e) => setBannerForm({ ...bannerForm, titleEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Headline (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "\u0641\u0646 | \u0627\u0644\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u0647\u064A\u0628.", value: bannerForm.titleAr, onChange: (e) => setBannerForm({ ...bannerForm, titleAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Banner Image URL" }), _jsx("input", { type: "text", placeholder: "https://images.unsplash.com/...", value: bannerForm.imageUrl, onChange: (e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "CTA Button Text (EN)" }), _jsx("input", { type: "text", value: bannerForm.ctaTextEn, onChange: (e) => setBannerForm({ ...bannerForm, ctaTextEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Target URL" }), _jsx("input", { type: "text", placeholder: "/shop", value: bannerForm.ctaUrl, onChange: (e) => setBannerForm({ ...bannerForm, ctaUrl: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [_jsx("button", { onClick: resetBannerForm, className: "px-4 py-2 border border-slate-800 text-slate-300 rounded", children: "Cancel" }), _jsx("button", { onClick: handleSaveBanner, className: "px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded", children: "Save Banner" })] })] }) })), _jsxs("div", { className: "border border-slate-800 bg-[#111622] p-5 rounded space-y-4", children: [_jsx("h3", { className: "font-serif text-base text-white font-light", children: "Homepage Visual Section Reordering" }), _jsx("div", { className: "divide-y divide-slate-800", children: sections.map((section, idx) => (_jsxs("div", { className: "py-2.5 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-xs font-mono text-slate-500", children: [idx + 1, "."] }), _jsx("span", { className: "text-xs text-white font-medium", children: SECTION_LABELS[section.sectionType] || section.sectionType })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => moveSectionUp(idx), disabled: idx === 0, className: "p-1 text-slate-400 hover:text-white disabled:opacity-30", children: _jsx(ChevronUp, { size: 14 }) }), _jsx("button", { onClick: () => moveSectionDown(idx), disabled: idx === sections.length - 1, className: "p-1 text-slate-400 hover:text-white disabled:opacity-30", children: _jsx(ChevronDown, { size: 14 }) }), _jsx("button", { onClick: () => toggleSectionVisible(section.id), className: `p-1 ${section.isVisible ? "text-emerald-400" : "text-slate-500"}`, children: section.isVisible ? _jsx(Eye, { size: 14 }) : _jsx(EyeOff, { size: 14 }) })] })] }, section.id))) })] })] })), activeTab === "settings" && (_jsxs("form", { onSubmit: handleSaveSettings, className: "space-y-8 max-w-4xl", children: [settingsFeedback && (_jsxs("div", { className: "p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs rounded flex items-center gap-2", children: [_jsx(CheckCircle2, { size: 16 }), _jsx("span", { children: settingsFeedback })] })), _jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 rounded space-y-6", children: [_jsx("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: _jsxs("div", { children: [_jsxs("h3", { className: "font-serif text-lg text-white font-light flex items-center gap-2", children: [_jsx(Share2, { size: 18, className: "text-accent" }), _jsx("span", { children: "Official Social Media Channels" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Configure official links displayed across Storefront Footer, Mobile Drawer, and Schema.org." })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs", children: [_jsxs("div", { className: "p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "font-semibold text-white", children: "Instagram Profile" }), _jsxs("a", { href: storeSettings.instagramUrl, target: "_blank", rel: "noreferrer", className: "text-accent hover:underline flex items-center gap-1 font-mono text-[10px]", children: [_jsx("span", { children: "Test Profile" }), _jsx(ExternalLink, { size: 10 })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Handle / Username:" }), _jsx("input", { type: "text", value: storeSettings.instagramHandle, onChange: (e) => setStoreSettings({ ...storeSettings, instagramHandle: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Full URL:" }), _jsx("input", { type: "url", value: storeSettings.instagramUrl, onChange: (e) => setStoreSettings({ ...storeSettings, instagramUrl: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] })] }), _jsxs("div", { className: "p-4 bg-[#0E1420] border border-[#25D366]/30 rounded space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "font-semibold text-[#A8E6B8] flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[#25D366] animate-pulse" }), _jsx("span", { children: "WhatsApp VIP Concierge" })] }), _jsxs("a", { href: `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(storeSettings.whatsappDefaultMsg)}`, target: "_blank", rel: "noreferrer", className: "text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px]", children: [_jsx("span", { children: "Test Chat Link" }), _jsx(ExternalLink, { size: 10 })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Display Hotline:" }), _jsx("input", { type: "text", value: storeSettings.whatsappPhone, onChange: (e) => setStoreSettings({ ...storeSettings, whatsappPhone: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Clean International Number (No +):" }), _jsx("input", { type: "text", value: storeSettings.whatsappNumber, onChange: (e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Default Pre-filled Greeting:" }), _jsx("input", { type: "text", value: storeSettings.whatsappDefaultMsg, onChange: (e) => setStoreSettings({ ...storeSettings, whatsappDefaultMsg: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded text-xs" })] })] }), _jsxs("div", { className: "p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "font-semibold text-white", children: "TikTok Channel" }), _jsxs("a", { href: storeSettings.tiktokUrl, target: "_blank", rel: "noreferrer", className: "text-accent hover:underline flex items-center gap-1 font-mono text-[10px]", children: [_jsx("span", { children: "Test" }), _jsx(ExternalLink, { size: 10 })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Handle:" }), _jsx("input", { type: "text", value: storeSettings.tiktokHandle, onChange: (e) => setStoreSettings({ ...storeSettings, tiktokHandle: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "URL:" }), _jsx("input", { type: "url", value: storeSettings.tiktokUrl, onChange: (e) => setStoreSettings({ ...storeSettings, tiktokUrl: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] })] }), _jsxs("div", { className: "p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "font-semibold text-white", children: "X / Twitter" }), _jsxs("a", { href: storeSettings.twitterUrl, target: "_blank", rel: "noreferrer", className: "text-accent hover:underline flex items-center gap-1 font-mono text-[10px]", children: [_jsx("span", { children: "Test" }), _jsx(ExternalLink, { size: 10 })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "Handle:" }), _jsx("input", { type: "text", value: storeSettings.twitterHandle, onChange: (e) => setStoreSettings({ ...storeSettings, twitterHandle: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[11px] mb-1", children: "URL:" }), _jsx("input", { type: "url", value: storeSettings.twitterUrl, onChange: (e) => setStoreSettings({ ...storeSettings, twitterUrl: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] })] }), _jsxs("div", { className: "p-4 bg-[#0E1420] border border-slate-800 rounded space-y-2 md:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "font-semibold text-white", children: "YouTube Luxury Film Atelier" }), _jsxs("a", { href: storeSettings.youtubeUrl, target: "_blank", rel: "noreferrer", className: "text-accent hover:underline flex items-center gap-1 font-mono text-[10px]", children: [_jsx("span", { children: "Test" }), _jsx(ExternalLink, { size: 10 })] })] }), _jsx("input", { type: "url", value: storeSettings.youtubeUrl, onChange: (e) => setStoreSettings({ ...storeSettings, youtubeUrl: e.target.value }), className: "w-full bg-[#111622] border border-slate-700 text-white p-2 rounded font-mono" })] })] })] }), _jsxs("div", { className: "p-6 bg-[#111622] border border-slate-800 rounded space-y-4 text-xs", children: [_jsx("h3", { className: "font-serif text-lg text-white font-light", children: "Storefront Announcement Bar & Client Care" }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Announcement Bar Text (English)" }), _jsx("input", { type: "text", value: storeSettings.announcementBarEn, onChange: (e) => setStoreSettings({ ...storeSettings, announcementBarEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-sans" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Announcement Bar Text (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", value: storeSettings.announcementBarAr, onChange: (e) => setStoreSettings({ ...storeSettings, announcementBarAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-sans" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Concierge Email" }), _jsx("input", { type: "email", value: storeSettings.conciergeEmail, onChange: (e) => setStoreSettings({ ...storeSettings, conciergeEmail: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Free Delivery Minimum (AED)" }), _jsx("input", { type: "number", value: storeSettings.freeShippingThreshold, onChange: (e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded", children: [_jsx("span", { className: "text-xs text-slate-400", children: "Updates are saved to persistent local state and syncable across sessions." }), _jsxs("button", { type: "submit", className: "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-2 transition-colors shadow-lg", children: [_jsx(Save, { size: 16 }), _jsx("span", { children: "Save & Sync All Settings" })] })] })] })), activeTab === "audit" && (_jsxs("div", { className: "border border-slate-800 bg-[#111622] p-6 space-y-4 rounded", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-serif text-xl font-light text-white", children: "Immutable Administrative Audit Log" }), _jsx("p", { className: "text-xs text-slate-400", children: "All administrative operations, creations, and transitions are tracked here." })] }), _jsxs("span", { className: "px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-[10px] rounded", children: [auditLogs.length, " Events Logged"] })] }), _jsx("div", { className: "divide-y divide-slate-800 text-xs font-mono", children: auditLogs.map((log, idx) => (_jsxs("div", { className: "py-2.5 flex items-center justify-between text-slate-300", children: [_jsxs("div", { className: "space-x-3", children: [_jsx("span", { className: "text-accent font-bold", children: log.action }), _jsxs("span", { className: "text-slate-400", children: ["[", log.res, "]"] })] }), _jsxs("div", { className: "space-x-4 text-slate-500", children: [_jsx("span", { children: log.user }), _jsx("span", { children: log.time })] })] }, idx))) })] }))] })] }));
}
//# sourceMappingURL=App.js.map