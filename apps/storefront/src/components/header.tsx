"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "../navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Minus,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Globe,
  Compass,
  BookOpen,
  User,
  ArrowLeftRight,
  Truck,
  Loader2,
  Clock,
  MessageSquare,
  Package,
} from "lucide-react";
import { useCart } from "../context/cart-context";
import { useWishlist } from "../context/wishlist-context";
import { muschioApi } from "../lib/api";
import { useCompare } from "../context/compare-context";
import { useAuth } from "../context/auth-context";
import { PriceDisplay } from "@muschio/ui";
import { ThemeToggle } from "./theme-toggle";
import { repairMojibake } from "../lib/customer-copy";

function SearchDialog({
  open,
  close,
  title,
  children,
}: {
  open: boolean;
  close: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    else if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="site-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-label={title}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button
          onClick={close}
          aria-label="Close"
          className="text-luxury-muted hover:text-luxury-text transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Header({
  locale,
  initialBrands = [],
  initialNotes = [],
  initialSettings,
}: {
  locale: "en" | "ar";
  initialBrands?: any[];
  initialNotes?: any[];
  initialSettings?: any;
}) {
  const ar = locale === "ar";
  const readableEn = (en: string) => ({
    "Shop Fragrance": "Shop",
    "The Collection": "Shop",
    "The Houses": "Brands",
    "Curated Haute Maisons": "Featured Brands",
    "Olfactory Tiers": "Fragrance Types",
    "Haute Niche Extraits": "Niche Fragrances",
    "Designer Privé": "Designer Fragrances",
    "Bespoke Discovery": "Find Your Scent",
    "AI Scent Sommelier": "Scent Finder",
    "Discovery Sets": "Sample Sets",
    "Explore Olfactory Compendium →": "Fragrance Guide →",
    "Discovery Vault": "Explore",
    "The Fragrance Compendium": "Fragrance Guide",
    "About The Maison": "About Us",
    "Contact & VIP Concierge": "Contact Us",
    "Track Order & Dispatch": "Track Order",
    "Client Vault & Account": "My Account",
    "Concierge & Socials": "Help & Social Media",
    "WhatsApp VIP Concierge": "WhatsApp Help",
  }[en] || en);
  const c = (en: string, arabic: string) => (ar ? repairMojibake(arabic) : readableEn(en));
  const pathname = usePathname();
  const router = useRouter();

  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    brandName: string;
    concentration: string;
    price: number;
    image: string;
    scentFamily?: string;
    topAccords: string[];
    prominentNotes: string[];
  }>>([]);

  const RECENT_SEARCHES_KEY = "muschio_recent_searches";

  // Load recent searches from localStorage on mount and when modal opens
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 6));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [search]);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // 300ms Debounce on query to prevent UI and network churn
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Live Server-Side Full-Text Search with cancellation / throttling
  useEffect(() => {
    const clean = debouncedQuery.trim();
    if (!clean) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    let active = true;
    setIsSearching(true);
    muschioApi.searchCatalog(clean, { limit: 12 }).then((results) => {
      if (!active) return;
      setSearchResults(results);
      setIsSearching(false);
    }).catch(() => {
      if (!active) return;
      setIsSearching(false);
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const { user, isLoggedIn } = useAuth();

  // Scroll lock when side drawer is open
  useEffect(() => {
    if (menu || cart.cartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, cart.cartDrawerOpen]);

  // Global ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setSearch(false);
        cart.setCartDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart]);

  // Focus trap for accessibility in sliding modal drawers
  const trapFocus = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab") return;
    const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const [navBrands, setNavBrands] = useState<Array<{ name: string; slug: string; origin?: string }>>(() =>
    initialBrands.slice(0, 6).map((b: any) => ({
      name: b.name,
      slug: b.slug,
      origin: b.countryOfOrigin || undefined,
    }))
  );
  const [navNotes, setNavNotes] = useState<Array<{ nameEn: string; nameAr: string; slug: string; categoryEn?: string; categoryAr?: string }>>(() =>
    initialNotes.slice(0, 4).map((n: any) => ({
      nameEn: n.nameEn,
      nameAr: n.nameAr,
      slug: n.slugEn || n.slug,
      categoryEn: n.categoryEn || undefined,
      categoryAr: n.categoryAr || undefined,
    }))
  );

  useEffect(() => {
    if (navBrands.length > 0 && navNotes.length > 0) return;
    let active = true;
    Promise.all([
      muschioApi.getBrands(),
      muschioApi.getNotes({ limit: 4 }),
    ]).then(([brands, notes]) => {
      if (!active) return;
      if (Array.isArray(brands) && brands.length > 0) {
        setNavBrands(
          brands.slice(0, 6).map((b: any) => ({
            name: b.name,
            slug: b.slug,
            origin: b.countryOfOrigin || undefined,
          })),
        );
      }
      if (Array.isArray(notes) && notes.length > 0) {
        setNavNotes(
          notes.slice(0, 4).map((n: any) => ({
            nameEn: n.nameEn,
            nameAr: n.nameAr,
            slug: n.slugEn || n.slug,
            categoryEn: n.categoryEn || undefined,
            categoryAr: n.categoryAr || undefined,
          })),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [navBrands.length, navNotes.length]);

  const popularSearches = useMemo(() => {
    return navBrands.slice(0, 5).map((b) => ({
      nameEn: b.name,
      nameAr: b.name,
      href: `/brands/${b.slug}`,
    }));
  }, [navBrands]);

  const announcement = {
    en: (initialSettings?.announcementBarEn || "COMPLIMENTARY GCC DELIVERY ON ORDERS OVER 500 AED · 100% AUTHENTIC LUXURY FRAGRANCES")
      .replace(/\bMAISON FLACONS\b/gi, "LUXURY FRAGRANCES")
      .replace(/\bFLACONS\b/gi, "FRAGRANCES"),
    ar: initialSettings?.announcementBarAr || "توصيل سريع مجاني في الخليج للطلبات فوق ٥٠٠ د.إ · عطور أصلية ومضمونة ١٠٠٪",
  };
  const freeShippingThreshold = Number(
    initialSettings?.freeShippingThreshold || 500
  );

  return (
    <>
      {/* 1. Restrained Announcement Bar (Adapts when cart has items or shows promo) */}
      <div className="announcement-bar">
        {cart.itemCount > 0 ? (
          cart.subtotal >= freeShippingThreshold ? (
            <button
              type="button"
              onClick={() => cart.setCartDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 hover:underline focus:outline-none"
            >
              <span className="font-semibold text-accent">
                {c("COMPLIMENTARY UAE DELIVERY UNLOCKED", "توصيل مجاني داخل الإمارات مفعّل")}
              </span>
              <span>·</span>
              <span className="font-medium hover:text-accent transition-colors">{c("CHECKOUT NOW", "إتمام الطلب الآن")} →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => cart.setCartDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 hover:underline focus:outline-none"
            >
              <span>
                {c(
                  `YOU ARE AED ${(freeShippingThreshold - cart.subtotal).toFixed(0)} AWAY FROM COMPLIMENTARY UAE DELIVERY`,
                  `أنت على بعد ${(freeShippingThreshold - cart.subtotal).toFixed(0)} د.إ من التوصيل المجاني داخل الإمارات`
                )}
              </span>
              <span>·</span>
              <span className="text-accent underline font-medium">{c("VIEW BAG", "عرض الحقيبة")}</span>
            </button>
          )
        ) : (
          c(announcement.en, announcement.ar)
        )}
      </div>

      {/* 2. Compact Sticky Luxury Header */}
      <header className="site-header">
        <div className="masthead">
          {/* Left Actions (Mobile Menu + Search + Account) */}
          <div className="header-actions">
            <button
              className="mobile-trigger text-luxury-text hover:text-accent transition-colors"
              onClick={() => {
                setSearch(false);
                cart.setCartDrawerOpen(false);
                setMenu(true);
              }}
              aria-label={c("Open menu", "فتح القائمة")}
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => {
                setMenu(false);
                cart.setCartDrawerOpen(false);
                router.push("/search");
              }}
              aria-label={c("Search fragrances", "البحث في العطور")}
              className="text-luxury-text hover:text-accent transition-colors"
            >
              <Search size={20} />
            </button>
            <Link
              className="desktop-utility text-xs tracking-wider uppercase text-luxury-text hover:text-accent font-medium transition-colors hidden md:flex items-center gap-1.5"
              href="/account"
            >
              <User size={16} className="opacity-75" />
              <span>{c("My Account", "حسابي")}</span>
            </Link>
            <Link
              className="desktop-utility text-xs tracking-wider uppercase text-luxury-text hover:text-accent font-medium transition-colors hidden lg:flex items-center gap-1.5"
              href="/orders"
              title={c("My Orders & Receipts", "طلباتي وإيصالات الشراء")}
            >
              <Package size={15} className="opacity-75" />
              <span>{c("My Orders", "طلباتي")}</span>
            </Link>
            <Link
              className="desktop-utility text-xs tracking-wider uppercase text-luxury-text hover:text-accent font-medium transition-colors hidden xl:flex items-center gap-1.5"
              href="/track"
              title={c("Track Order & Dispatch", "تتبع الطلب والشحنة")}
            >
              <Truck size={15} className="opacity-75" />
              <span>{c("Track Order", "تتبع الطلب")}</span>
            </Link>
          </div>

          {/* Centered Prominent MUSCHIO Wordmark */}
          <Link href="/" className="masthead-logo" aria-label="Muschio Home">
            MUSCHIO
          </Link>

          {/* Right Actions (Theme Switcher + Language + Wishlist + Bag) */}
          <div className="header-actions">
            {/* Desktop Theme Switcher */}
            <ThemeToggle
              locale={locale}
              className="desktop-utility hidden sm:inline-flex"
            />

            {/* Language Switch */}
            <button
              className="desktop-utility text-xs tracking-wider uppercase text-luxury-muted hover:text-luxury-text font-medium transition-colors"
              onClick={() =>
                router.replace(pathname, { locale: ar ? "en" : "ar" })
              }
              aria-label={c("Switch language", "تغيير اللغة")}
            >
              {ar ? "EN" : "عربي"}
            </button>

            {/* Wishlist */}
            <Link
              className="desktop-utility relative flex items-center text-luxury-text hover:text-accent transition-colors"
              href="/wishlist"
              aria-label={c(
                `Wishlist, ${wishlist.itemCount} items`,
                `المفضلة، ${wishlist.itemCount} عناصر`,
              )}
            >
              <Heart
                size={20}
                className={wishlist.itemCount > 0 ? "fill-accent/20 text-accent" : ""}
              />
              {wishlist.itemCount > 0 && (
                <span className="text-[10px] font-sans font-medium ms-1.5 px-1.5 py-0.2 bg-accent text-white rounded-full leading-none">
                  {wishlist.itemCount}
                </span>
              )}
            </Link>

            {/* Compare */}
            <Link
              className="desktop-utility relative flex items-center text-luxury-text hover:text-accent transition-colors"
              href="/compare"
              title={c("Compare Fragrances", "مقارنة العطور")}
              aria-label={c(
                `Compare fragrances, ${compare.itemCount} items`,
                `مقارنة العطور، ${compare.itemCount} عناصر`,
              )}
            >
              <ArrowLeftRight
                size={19}
                className={compare.itemCount > 0 ? "text-accent" : ""}
              />
              {compare.itemCount > 0 && (
                <span className="text-[10px] font-sans font-medium ms-1.5 px-1.5 py-0.2 bg-accent text-white rounded-full leading-none">
                  {compare.itemCount}
                </span>
              )}
            </Link>

            {/* Private Client Suite & Loyalty */}
            <Link
              className="desktop-utility relative flex items-center text-luxury-text hover:text-accent transition-colors"
              href="/account"
              title={
                isLoggedIn && user
                  ? c(`Private Client: ${user.name}`, `حساب العميل: ${user.name}`)
                  : c("Private Client Suite & Loyalty", "جناح العميل والمكافآت")
              }
              aria-label={
                isLoggedIn && user
                  ? c(`Private Client Suite, ${user.name}`, `حساب العميل، ${user.name}`)
                  : c("Private Client Suite", "جناح العميل")
              }
            >
              <User size={20} />
              {isLoggedIn && (
                <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-accent ring-2 ring-luxury-canvas" />
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => {
                setMenu(false);
                setSearch(false);
                cart.setCartDrawerOpen(true);
              }}
              aria-label={c(
                `Shopping bag, ${cart.itemCount} items`,
                `حقيبة التسوق، ${cart.itemCount} منتجات`,
              )}
              className={`flex items-center transition-all duration-200 ${
                cart.itemCount > 0
                  ? "text-accent hover:opacity-90"
                  : "text-luxury-text hover:text-accent"
              }`}
            >
              <div className="relative">
                <ShoppingBag size={20} className={cart.itemCount > 0 ? "text-accent" : ""} />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-accent animate-ping opacity-75" />
                )}
              </div>
              {cart.itemCount > 0 && (
                <span className="text-[11px] font-sans font-semibold ms-1.5 px-2 py-0.5 bg-accent text-white rounded-full shadow-sm ring-1 ring-accent/30">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Category Navigation Row with Luxury Dropdowns (Desktop) */}
        <nav
          className="site-nav"
          aria-label={c("Main navigation", "القائمة الرئيسية")}
        >
          {/* Item 1: Shop Fragrance (Mega Dropdown) */}
          <div className="relative group py-1">
            <Link
              href="/shop"
              aria-current={pathname === "/shop" ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("Shop Fragrance", "تسوق العطور")}
              <ChevronDown size={12} className="opacity-60 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            <div className="mega-menu-panel opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 w-[580px] grid grid-cols-2 gap-6 text-start normal-case">
              <div className="space-y-3">
                <span className="eyebrow">{c("Olfactory Tiers", "تصنيفات العطور")}</span>
                <Link
                  href="/shop?brandType=NICHE"
                  className="block p-2 rounded-sm hover:bg-luxury-surface2 transition-colors"
                >
                  <p className="text-xs font-medium text-luxury-text uppercase tracking-wider">{c("Haute Niche Extraits", "خلاصات النيش الفاخرة")}</p>
                  <p className="text-[11px] text-luxury-muted mt-0.5">{c("Rare extraits with 30–50% pure perfume oil concentration.", "خلاصات نادرة بتركيز عالي من الزيوت العطرية النقية.")}</p>
                </Link>
                <Link
                  href="/shop?brandType=DESIGNER"
                  className="block p-2 rounded-sm hover:bg-luxury-surface2 transition-colors"
                >
                  <p className="text-xs font-medium text-luxury-text uppercase tracking-wider">{c("Designer Privé", "ديزاينر برايفيت")}</p>
                  <p className="text-[11px] text-luxury-muted mt-0.5">{c("Exclusive private lines and high-fashion boutique scents.", "إصدارات حصرية ومجموعات خاصة من كبرى الدور العالمية.")}</p>
                </Link>
                <Link
                  href="/shop"
                  className="block p-2 text-xs font-medium text-accent hover:underline uppercase tracking-wider"
                >
                  {c("View All Fragrances →", "استعراض جميع العطور ←")}
                </Link>
              </div>
              <div className="space-y-3 border-s border-luxury-border ps-5">
                <span className="eyebrow">{c("Bespoke Discovery", "اكتشاف مخصص")}</span>
                <Link
                  href="/discover/sets"
                  className="block p-2 rounded-sm hover:bg-luxury-surface2 transition-colors"
                >
                  <p className="text-xs font-medium text-luxury-text uppercase tracking-wider">{c("5 x 2ml Discovery Sets", "مجموعات العينات")}</p>
                  <p className="text-[11px] text-luxury-muted mt-0.5">{c("Order 5 curated glass vial samples with voucher return.", "خمس عينات زجاجية فاخرة مع قسيمة استرداد للشراء.")}</p>
                </Link>
                <Link
                  href="/discover/ai"
                  className="block p-2 rounded-sm hover:bg-luxury-surface2 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-accent uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>{c("AI Scent Sommelier", "مستشار العطور الذكي")}</span>
                  </div>
                  <p className="text-[11px] text-luxury-muted mt-0.5">{c("Algorithmic recommendation matched to climate and taste.", "توصيات ذكية مخصصة لطقس الخليج والذوق الشخصي.")}</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Item 2: The Houses (Mega Dropdown) */}
          <div className="relative group py-1">
            <Link
              href="/brands"
              aria-current={pathname.startsWith("/brands") ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("The Houses", "دور العطور")}
              <ChevronDown size={12} className="opacity-60 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            <div className="mega-menu-panel opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 w-[420px] space-y-3 text-start normal-case">
              <span className="eyebrow">{c("Curated Haute Maisons", "دور العطور المعتمدة")}</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {navBrands.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="p-2 rounded hover:bg-luxury-surface2 flex flex-col"
                  >
                    <span className="font-medium text-luxury-text">{b.name}</span>
                    {b.origin && (
                      <span className="text-[10px] text-luxury-muted uppercase">{b.origin}</span>
                    )}
                  </Link>
                ))}
                <Link href="/brands" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col justify-center text-accent font-medium uppercase text-[11px]">
                  <span>{c("All Houses (A–Z) →", "جميع الدور (أ–ي) ←")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Item 3: Scent Notes (Mega Dropdown) */}
          <div className="relative group py-1">
            <Link
              href="/notes"
              aria-current={pathname.startsWith("/notes") ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("Scent Notes", "نوتات العطر")}
              <ChevronDown size={12} className="opacity-60 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            <div className="mega-menu-panel opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 w-[380px] space-y-3 text-start normal-case">
              <span className="eyebrow">{c("Rare Raw Materials", "مكونات نادرة")}</span>
              <div className="space-y-1.5 text-xs">
                {navNotes.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/notes/${n.slug}`}
                    className="p-2 rounded hover:bg-luxury-surface2 flex items-center justify-between"
                  >
                    <span className="font-medium text-luxury-text">{c(n.nameEn, n.nameAr)}</span>
                    <span className="text-[10px] text-luxury-muted uppercase">
                      {c(n.categoryEn || "Rare Essence", n.categoryAr || "خلاصة نادرة")}
                    </span>
                  </Link>
                ))}
                <Link href="/notes" className="pt-2 block text-xs font-medium text-accent hover:underline uppercase tracking-wider">
                  {c("Explore Olfactory Compendium →", "استكشف معجم النوتات ←")}
                </Link>
              </div>
            </div>
          </div>

          {/* Flat Links with Identical Sizing and Alignment */}
          <div className="relative group py-1">
            <Link
              href="/discover/sets"
              aria-current={pathname === "/discover/sets" ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("Discovery Sets", "مجموعات الاكتشاف")}
            </Link>
          </div>
          <div className="relative group py-1">
            <Link
              href="/guide"
              aria-current={pathname === "/guide" ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("The Guide", "دليل العطور")}
            </Link>
          </div>
          <div className="relative group py-1">
            <Link
              href="/journal"
              aria-current={pathname.startsWith("/journal") ? "page" : undefined}
              className="inline-flex items-center gap-1 font-medium transition-colors hover:text-accent"
            >
              {c("Journal", "المجلة")}
            </Link>
          </div>
        </nav>
      </header>

      {/* 4. Luxury Sliding Mobile Navigation Drawer */}
      {menu && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setMenu(false)}
            aria-hidden="true"
          />
          <aside
            className="drawer-panel-start"
            role="dialog"
            aria-modal="true"
            onKeyDown={trapFocus}
            tabIndex={-1}
            aria-label={c("Navigation Menu", "قائمة التصفح")}
          >
            {/* Drawer Top Header */}
            <div className="p-5 flex items-center justify-between border-b border-luxury-border bg-luxury-canvas">
              <Link
                href="/"
                onClick={() => setMenu(false)}
                className="masthead-logo text-2xl tracking-widest text-luxury-text"
              >
                MUSCHIO
              </Link>
              <button
                onClick={() => setMenu(false)}
                aria-label={c("Close menu", "إغلاق القائمة")}
                className="w-9 h-9 flex items-center justify-center rounded-sm text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Primary Collection Links */}
              <div>
                <span className="eyebrow mb-3">{c("The Collection", "المجموعة")}</span>
                <nav className="space-y-1 text-sm font-medium tracking-wide">
                  <Link
                    href="/shop"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Shop All Fragrances", "جميع العطور")}</span>
                    <ArrowRight size={14} className="opacity-50 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/shop?brandType=NICHE"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Haute Niche Extraits", "عطور النيش الفاخرة")}</span>
                    <span className="text-[10px] text-accent font-normal normal-case">{c("Pure Extrait", "خلاصات")}</span>
                  </Link>
                  <Link
                    href="/shop?brandType=DESIGNER"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Designer Privé", "ديزاينر برايفيت")}</span>
                    <ArrowRight size={14} className="opacity-50 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/discover/sets"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("5 x 2ml Discovery Sets", "مجموعات العينات")}</span>
                    <ArrowRight size={14} className="opacity-50 rtl:rotate-180" />
                  </Link>
                </nav>
              </div>

              {/* Houses & Notes */}
              <div className="pt-4 border-t border-luxury-border">
                <span className="eyebrow mb-3">{c("Discovery Vault", "خزانة الاكتشاف")}</span>
                <nav className="space-y-1 text-sm font-medium tracking-wide">
                  <Link
                    href="/brands"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("The Houses (A–Z)", "دور العطور")}</span>
                    <Compass size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/notes"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Scent Notes Library", "مكتبة النوتات العطرية")}</span>
                    <BookOpen size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/guide"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("The Fragrance Compendium", "دليل وخفايا العطور")}</span>
                    <ArrowRight size={14} className="opacity-50 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/journal"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Muschio Journal", "مجلة موسكيو")}</span>
                    <ArrowRight size={14} className="opacity-50 rtl:rotate-180" />
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("About The Maison", "عن الدار وقصتنا")}</span>
                    <Sparkles size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Contact & VIP Concierge", "تواصل معنا والكونسيرج")}</span>
                    <MessageSquare size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/track"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-luxury-surface text-accent hover:bg-luxury-surface2 transition-colors uppercase text-xs tracking-wider font-medium"
                  >
                    <span>{c("Track Order & Dispatch", "تتبع الطلب والشحنة")}</span>
                    <Truck size={14} className="text-accent" />
                  </Link>
                </nav>
              </div>

              {/* Bespoke AI & Personal Client Area */}
              <div className="pt-4 border-t border-luxury-border space-y-2">
                <Link
                  href="/discover/ai"
                  onClick={() => setMenu(false)}
                  className="flex items-center gap-2 p-2.5 rounded-sm bg-luxury-surface border border-luxury-border text-accent font-medium text-xs tracking-wider uppercase"
                >
                  <Sparkles size={15} />
                  <span>{c("AI Scent Sommelier", "مستشار العطور الذكي")}</span>
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between p-2.5 rounded-sm border border-luxury-border bg-luxury-surface text-xs text-luxury-text hover:text-accent font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User size={15} className="text-accent" />
                    <span>
                      {isLoggedIn && user
                        ? c(`Private Client: ${user.name}`, `حساب العميل: ${user.name}`)
                        : c("Private Client & Loyalty", "جناح العميل والمكافآت")}
                    </span>
                  </span>
                  {isLoggedIn && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-accent/15 text-accent rounded-sm">
                      {user?.tier === "GOLD_SILLAGE" ? "Gold Sillage" : "Privilege"}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between p-2.5 rounded-sm border border-luxury-border bg-luxury-surface text-xs text-luxury-text hover:text-accent font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Package size={15} className="text-accent" />
                    <span>{c("My Orders & Receipts", "طلباتي وإيصالات الشراء")}</span>
                  </span>
                  <ArrowRight size={13} className="opacity-50 rtl:rotate-180" />
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between p-2.5 text-xs text-luxury-text hover:text-accent font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{c("Wishlist", "قائمة المفضلة")}</span>
                    {wishlist.itemCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-accent/20 text-accent font-semibold rounded-full">
                        {wishlist.itemCount}
                      </span>
                    )}
                  </span>
                  <Heart
                    size={15}
                    className={wishlist.itemCount > 0 ? "fill-accent text-accent" : "opacity-60"}
                  />
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between p-2.5 text-xs text-luxury-text hover:text-accent font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{c("Fragrance Comparison", "مقارنة العطور")}</span>
                    {compare.itemCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-accent text-white font-semibold rounded-full animate-pulse">
                        {compare.itemCount}
                      </span>
                    )}
                  </span>
                  <ArrowLeftRight
                    size={15}
                    className={compare.itemCount > 0 ? "text-accent" : "opacity-60"}
                  />
                </Link>
              </div>

              {/* VIP Concierge & Social Channels */}
              <div className="pt-4 border-t border-luxury-border space-y-3">
                <span className="eyebrow">{c("Concierge & Socials", "المساعد والتواصل")}</span>
                <a
                  href="https://wa.me/97148006872?text=Hello%20Muschio%20Concierge,%20I%20would%20like%20assistance%20with%20a%20fragrance%20recommendation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-sm bg-[#1F2E23] hover:bg-[#283C2E] border border-[#3E5C46] text-[#A8E6B8] text-xs font-sans tracking-wide transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                    <span>{c("WhatsApp VIP Concierge", "المستشار عبر واتساب")}</span>
                  </span>
                  <span className="font-mono text-[11px] opacity-80">+971 4 800</span>
                </a>
                <div className="flex items-center gap-2 pt-1">
                  {[
                    {
                      name: "Instagram",
                      href: "https://www.instagram.com/muschio.parfums",
                      icon: (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                    },
                    {
                      name: "TikTok",
                      href: "https://www.tiktok.com/@muschio.haute",
                      icon: (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.05c-.01 2.21-.86 4.33-2.39 5.89-1.54 1.57-3.73 2.45-5.94 2.43-2.21-.01-4.38-.91-5.9-2.5-1.52-1.58-2.34-3.73-2.29-5.94.05-2.21.94-4.34 2.51-5.87 1.57-1.52 3.73-2.34 5.94-2.29.34.01.68.04 1.01.1v4.07c-.33-.09-.68-.13-1.02-.13-1.14-.02-2.25.43-3.05 1.25-.8.81-1.23 1.94-1.18 3.08.05 1.13.56 2.21 1.41 2.96.84.75 1.99 1.13 3.12 1.05 1.13-.07 2.19-.64 2.9-1.52.42-.51.68-1.13.73-1.78.02-1.74.01-3.48.01-5.23V.02h-.37z" />
                        </svg>
                      ),
                    },
                    {
                      name: "X (Twitter)",
                      href: "https://twitter.com/muschio_haute",
                      icon: (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                    },
                    {
                      name: "YouTube",
                      href: "https://www.youtube.com/@muschiohaute",
                      icon: (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      aria-label={s.name}
                      className="flex-1 h-9 flex items-center justify-center rounded-sm border border-luxury-border bg-luxury-surface text-luxury-muted hover:text-luxury-text hover:border-luxury-text transition-colors"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Utility Bar (Theme + Language) */}
            <div className="p-5 border-t border-luxury-border bg-luxury-surface space-y-3">
              <div className="flex items-center justify-between gap-3">
                {/* Language Switch Button */}
                <button
                  type="button"
                  onClick={() => {
                    router.replace(pathname, { locale: ar ? "en" : "ar" });
                    setMenu(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-luxury-border bg-luxury-canvas text-xs font-medium uppercase tracking-wider text-luxury-text hover:border-luxury-text transition-colors"
                >
                  <Globe size={14} />
                  <span>{ar ? "English" : "العربية"}</span>
                </button>

                {/* Theme Switcher Toggle */}
                <div className="border border-luxury-border bg-luxury-canvas px-3 py-1 flex items-center justify-center">
                  <ThemeToggle locale={locale} showLabel={false} />
                </div>
              </div>

              <p className="text-[11px] text-center text-luxury-muted">
                {c(
                  "100% Authentic Maison Flacons · Dubai & GCC",
                  "عطور نيش أصلية ومضمونة ١٠٠٪ · دبي والخليج",
                )}
              </p>
            </div>
          </aside>
        </>
      )}

      {/* 5. Search is now handled on the dedicated search screen. */}
      {false && (<SearchDialog
        open={search}
        close={() => setSearch(false)}
        title={c("Search the Vault", "البحث في المجموعة")}
      >
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const clean = query.trim();
              if (clean) {
                saveRecentSearch(clean);
                router.push(`/shop?search=${encodeURIComponent(clean)}`);
                setSearch(false);
              }
            }}
            className="space-y-3"
          >
            <div className="relative">
              <input
                id="site-search"
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c(
                  "Search fragrances, houses, or raw notes…",
                  "ابحث عن العطور، الدور، أو النوتات الخام…",
                )}
                className="w-full p-3.5 pe-12 border border-luxury-border bg-luxury-surface text-sm text-luxury-text focus:outline-none focus:border-luxury-text transition-colors"
              />
              <div className="absolute inset-y-0 end-0 px-3.5 flex items-center justify-center gap-1.5 text-luxury-muted">
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin text-neutral-900 dark:text-neutral-100" />
                ) : (
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="p-1 hover:text-luxury-text transition-colors"
                  >
                    <Search size={18} />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* When query is empty: Show Recent Searches & Popular Searches */}
          {!query.trim() && (
            <div className="space-y-5">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow flex items-center gap-1.5">
                      <Clock size={12} className="text-luxury-muted" />
                      {c("RECENT SEARCHES", "عمليات البحث الأخيرة")}
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[11px] text-luxury-muted hover:text-luxury-text underline transition-colors"
                    >
                      {c("Clear All", "مسح الكل")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group inline-flex items-center border border-luxury-border bg-luxury-surface text-xs text-luxury-text hover:border-luxury-text transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            saveRecentSearch(term);
                            router.push(`/shop?search=${encodeURIComponent(term)}`);
                            setSearch(false);
                          }}
                          className="px-3 py-1.5 text-xs text-luxury-text hover:text-accent font-sans text-start transition-colors"
                        >
                          {term}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          aria-label={`Remove ${term}`}
                          className="text-luxury-muted hover:text-rose-500 p-1.5 pe-2 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {popularSearches.length > 0 && (
                <div>
                  <span className="eyebrow mb-2.5 block">
                    {c("POPULAR SEARCHES", "عمليات البحث الشائعة")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          const term = ar ? item.nameAr : item.nameEn;
                          saveRecentSearch(term);
                          router.push(item.href);
                          setSearch(false);
                        }}
                        className="px-3 py-1.5 border border-luxury-border bg-luxury-surface text-xs text-luxury-text hover:border-luxury-text transition-colors"
                      >
                        {c(item.nameEn, item.nameAr)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* When query is present: Show Live Server-Side Search Results */}
          {query.trim() && (
            <div className="space-y-3 max-h-80 overflow-y-auto pe-1">
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  {isSearching
                    ? c("Searching olfactory vault…", "جاري البحث في المجموعة…")
                    : c(
                        `${searchResults.length} Results Found`,
                        `تم العثور على ${searchResults.length} نتيجة`,
                      )}
                </span>
                {searchResults.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      saveRecentSearch(query.trim());
                      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
                      setSearch(false);
                    }}
                    className="text-[11px] text-luxury-muted hover:text-luxury-text underline transition-colors"
                  >
                    {c("View all in catalog →", "عرض الكل في المتجر ←")}
                  </button>
                )}
              </div>

              {!isSearching && searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-luxury-muted space-y-1">
                  <p className="font-medium text-luxury-text">
                    {c(
                      `No results found for "${query}"`,
                      `لم يتم العثور على نتائج لـ "${query}"`,
                    )}
                  </p>
                  <p className="text-[11px]">
                    {c(
                      "Try searching by brand, olfactory note (e.g. Taif Rose, Oud), or fragrance family.",
                      "جرّب البحث باسم الدار، النوتة العطرية (مثل الورد الطائفي، العود)، أو العائلة العطرية.",
                    )}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-luxury-border">
                  {searchResults.map((res) => (
                    <Link
                      key={res.slug}
                      href={`/product/${res.slug}`}
                      onClick={() => {
                        saveRecentSearch(query.trim() || res.nameEn);
                        setSearch(false);
                      }}
                      className="py-3 flex items-center gap-3.5 group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 px-2 rounded-sm transition-colors"
                    >
                      <div className="w-12 h-14 bg-neutral-100 dark:bg-neutral-900 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                        {res.image ? (
                          <Image
                            src={res.image}
                            alt={res.nameEn}
                            width={48}
                            height={56}
                            sizes="48px"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest text-neutral-400">Flacon</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted block truncate">
                          {res.brandName}
                        </span>
                        <span className="block text-xs font-medium text-luxury-text group-hover:underline truncate">
                          {c(res.nameEn, res.nameAr)}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {res.concentration && (
                            <span className="text-[10px] text-neutral-500">
                              {res.concentration.replaceAll("_", " ")}
                            </span>
                          )}
                          {res.price > 0 && (
                            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              {res.price.toLocaleString()} AED
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-luxury-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SearchDialog>)}

      {/* 6. Luxury Sliding Shopping Bag Drawer */}
      {cart.cartDrawerOpen && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => cart.setCartDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="drawer-panel-end"
            role="dialog"
            aria-modal="true"
            onKeyDown={trapFocus}
            tabIndex={-1}
            aria-label={c("Your Shopping Bag", "حقيبة التسوق")}
          >
            {/* Drawer Header */}
            <div className="p-5 flex items-center justify-between border-b border-luxury-border bg-luxury-canvas">
              <h2 className="font-serif text-2xl font-medium text-luxury-text">
                {c("Your Shopping Bag", "حقيبة التسوق")}
              </h2>
              <button
                onClick={() => cart.setCartDrawerOpen(false)}
                aria-label={c("Close shopping bag", "إغلاق الحقيبة")}
                className="w-9 h-9 flex items-center justify-center rounded-sm text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Complimentary White-Glove GCC Express Delivery Indicator */}
            {cart.items.length > 0 && (
              <div className="p-3.5 sm:p-4 bg-luxury-surface2 border-b border-luxury-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-luxury-text font-medium text-[11px] sm:text-xs">
                    {cart.subtotal >= freeShippingThreshold
                      ? c("Complimentary GCC White-Glove Delivery Unlocked", "الشحن السريع المبرد المجاني مفعل لطلبك")
                      : c(
                          `Add AED ${Math.max(0, freeShippingThreshold - cart.subtotal)} for Complimentary Delivery`,
                          `أضف ${Math.max(0, freeShippingThreshold - cart.subtotal)} درهم للحصول على شحن مجاني`,
                        )}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-accent">
                    {Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100))}%
                  </span>
                </div>
                <div className="w-full h-1 bg-luxury-border overflow-hidden rounded-full">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
              {!cart.items.length ? (
                <div className="space-y-4 py-16 text-center">
                  <ShoppingBag size={40} className="mx-auto text-luxury-muted opacity-40" />
                  <p className="text-sm text-luxury-muted">
                    {c(
                      "Your bag is currently empty. Explore our curated flacons.",
                      "حقيبتك فارغة حالياً. استكشف مجموعتنا المختارة.",
                    )}
                  </p>
                  <Link
                    href="/shop"
                    className="editorial-button text-xs mt-4 inline-flex"
                    onClick={() => cart.setCartDrawerOpen(false)}
                  >
                    {c("Explore Fragrances", "استكشف العطور")}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-luxury-border">
                  {cart.items.map((item) => (
                    <div className="py-4 flex gap-3.5 sm:gap-4 items-start" key={item.id}>
                      <div className="relative w-16 h-20 bg-luxury-surface2 border border-luxury-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={ar ? item.titleAr : item.title}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <Sparkles size={16} className="text-luxury-muted/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-sans font-medium uppercase tracking-wider text-accent truncate">
                          {item.brand}
                        </p>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => cart.setCartDrawerOpen(false)}
                          className="font-serif text-base text-luxury-text hover:underline block my-0.5 truncate"
                        >
                          {ar ? item.titleAr : item.title}
                        </Link>
                        <p className="text-xs text-luxury-muted">{item.volume || item.sizeLabel}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, -1)}
                            aria-label={c("Decrease quantity", "تقليل الكمية")}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-luxury-border bg-luxury-surface hover:border-luxury-text hover:bg-luxury-surface2 transition-all active:scale-95"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-mono font-medium text-luxury-text min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, 1)}
                            aria-label={c("Increase quantity", "زيادة الكمية")}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border border-luxury-border bg-luxury-surface hover:border-luxury-text hover:bg-luxury-surface2 transition-all active:scale-95"
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            type="button"
                            className="text-xs text-luxury-muted hover:text-[#d2042d] ms-auto underline min-h-[44px] px-2 flex items-center transition-colors"
                            onClick={() => cart.removeItem(item.id)}
                          >
                            {c("Remove", "حذف")}
                          </button>
                        </div>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <PriceDisplay
                          price={item.price * item.quantity}
                          compareAtPrice={item.compareAtPrice ? item.compareAtPrice * item.quantity : null}
                          locale={locale}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer with Dual Checkout / View Bag CTAs */}
            {cart.items.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-luxury-border bg-luxury-surface space-y-3.5">
                <div className="flex justify-between text-sm font-medium text-luxury-text">
                  <span>{c("Subtotal", "المجموع الفرعي")}</span>
                  <PriceDisplay price={cart.subtotal} locale={locale} size="sm" />
                </div>
                <p className="text-[11px] text-luxury-muted leading-relaxed">
                  {c(
                    "Free return up to 7 days & Certificate of Authenticity included.",
                    "إرجاع مجاني حتى 7 أيام مع شهادة الأصالة الرسمية المعتمدة.",
                  )}
                </p>
                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    className="editorial-button w-full text-center block"
                    onClick={() => cart.setCartDrawerOpen(false)}
                  >
                    {c("Proceed to Checkout", "متابعة لإتمام الطلب")}
                  </Link>
                  <Link
                    href="/cart"
                    className="editorial-button-secondary w-full text-center block text-xs"
                    onClick={() => cart.setCartDrawerOpen(false)}
                  >
                    {c("View Full Shopping Bag", "عرض حقيبة التسوق بالتفصيل")}
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
