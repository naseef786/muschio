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
} from "lucide-react";
import { useCart } from "../context/cart-context";
import { useWishlist } from "../context/wishlist-context";
import { useCompare } from "../context/compare-context";
import { useAuth } from "../context/auth-context";
import { PriceDisplay } from "@muschio/ui";
import { ThemeToggle } from "./theme-toggle";

const POPULAR_SEARCHES = [
  { nameEn: "Amouage", nameAr: "أمواج", href: "/shop?search=Amouage" },
  { nameEn: "Baccarat Rouge", nameAr: "باكارات روج", href: "/shop?search=Baccarat" },
  { nameEn: "Oud", nameAr: "عود", href: "/notes/cambodian-oud" },
  { nameEn: "Taif Rose", nameAr: "ورد الطائف", href: "/notes/taif-rose" },
  { nameEn: "Roja Parfums", nameAr: "روجا دوف", href: "/shop?search=Roja" },
];

const SEARCHABLE_ITEMS = [
  { type: "product", nameEn: "Interlude 53 Man Extrait", nameAr: "إنترلود 53 إكستري", brand: "Amouage", href: "/product/amouage-interlude-53-man" },
  { type: "product", nameEn: "Baccarat Rouge 540 Extrait", nameAr: "باكارات روج 540 إكستري", brand: "Maison Francis Kurkdjian", href: "/product/mfk-baccarat-rouge-540-extrait" },
  { type: "product", nameEn: "Elysium Pour Homme Parfum", nameAr: "إليزيوم بور هوم بارفان", brand: "Roja Parfums", href: "/product/roja-parfums-elysium-pour-homme-parfum" },
  { type: "product", nameEn: "Alexandria II Eau de Parfum", nameAr: "ألكسندريا 2 أو دي بارفان", brand: "Xerjoff", href: "/product/xerjoff-alexandria-ii" },
  { type: "product", nameEn: "Tobacco Vanille Eau de Parfum", nameAr: "توباكو فانيلا أو دي بارفان", brand: "Tom Ford", href: "/product/tom-ford-tobacco-vanille" },
  { type: "note", nameEn: "Cambodian Oud", nameAr: "عود كمبودي", brand: "Base Note", href: "/notes/cambodian-oud" },
  { type: "note", nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", brand: "Heart Note", href: "/notes/taif-rose" },
  { type: "note", nameEn: "Silver Frankincense", nameAr: "لبان حوجري فضي", brand: "Heart Note", href: "/notes/silver-frankincense" },
  { type: "house", nameEn: "Amouage (Oman)", nameAr: "أمواج (عُمان)", brand: "Haute Niche", href: "/brands/amouage" },
  { type: "house", nameEn: "Roja Parfums (London)", nameAr: "روجا دوف (لندن)", brand: "Haute Niche", href: "/brands/roja-parfums" },
];

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

export function Header({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);
  const pathname = usePathname();
  const router = useRouter();

  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
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

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCHABLE_ITEMS.filter((item) =>
      [item.nameEn, item.nameAr, item.brand].some((field) =>
        field.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  return (
    <>
      {/* 1. Restrained Announcement Bar */}
      <div className="announcement-bar">
        {c(
          "COMPLIMENTARY WHITE-GLOVE GCC DELIVERY ON ORDERS OVER 500 AED · 100% AUTHENTIC MAISON FLACONS",
          "توصيل سريع مجاني في الخليج للطلبات فوق ٥٠٠ د.إ · عطور نيش أصلية ومضمونة ١٠٠٪",
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
                setSearch(true);
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
                <span className="text-[10px] font-sans font-medium ms-1.5 px-1.5 py-0.2 bg-accent text-white rounded-full leading-none animate-pulse">
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
              className="flex items-center text-luxury-text hover:text-accent transition-colors"
            >
              <ShoppingBag size={20} />
              {cart.itemCount > 0 && (
                <span className="text-[11px] font-sans font-medium ms-1.5 px-1.5 py-0.2 bg-luxury-text text-luxury-canvas rounded-full">
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
                <Link href="/brands/amouage" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col">
                  <span className="font-medium text-luxury-text">Amouage</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Sultanate of Oman", "سلطنة عمان")}</span>
                </Link>
                <Link href="/brands/roja-parfums" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col">
                  <span className="font-medium text-luxury-text">Roja Parfums</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("London, Mayfair", "لندن، مايفير")}</span>
                </Link>
                <Link href="/brands/maison-francis-kurkdjian" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col">
                  <span className="font-medium text-luxury-text">MFK Paris</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Paris, France", "باريس، فرنسا")}</span>
                </Link>
                <Link href="/brands/xerjoff" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col">
                  <span className="font-medium text-luxury-text">Xerjoff</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Turin, Italy", "تورينو، إيطاليا")}</span>
                </Link>
                <Link href="/brands/tom-ford" className="p-2 rounded hover:bg-luxury-surface2 flex flex-col">
                  <span className="font-medium text-luxury-text">Tom Ford Privé</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("New York", "نيويورك")}</span>
                </Link>
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
                <Link href="/notes/cambodian-oud" className="p-2 rounded hover:bg-luxury-surface2 flex items-center justify-between">
                  <span className="font-medium text-luxury-text">{c("Cambodian Oud", "عود كمبودي معتق")}</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Base Note", "نوتة قاعدة")}</span>
                </Link>
                <Link href="/notes/taif-rose" className="p-2 rounded hover:bg-luxury-surface2 flex items-center justify-between">
                  <span className="font-medium text-luxury-text">{c("Royal Taif Rose", "ورد الطائف الملكي")}</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Heart Note", "نوتة قلب")}</span>
                </Link>
                <Link href="/notes/silver-frankincense" className="p-2 rounded hover:bg-luxury-surface2 flex items-center justify-between">
                  <span className="font-medium text-luxury-text">{c("Silver Frankincense", "لبان حوجري فضي")}</span>
                  <span className="text-[10px] text-luxury-muted uppercase">{c("Sacred Resin", "صمغ مقدس")}</span>
                </Link>
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
                    <ArrowRight size={14} className="opacity-50" />
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
                    <ArrowRight size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/discover/sets"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("5 x 2ml Discovery Sets", "مجموعات العينات")}</span>
                    <ArrowRight size={14} className="opacity-50" />
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
                    <ArrowRight size={14} className="opacity-50" />
                  </Link>
                  <Link
                    href="/journal"
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between p-2.5 rounded-sm text-luxury-text hover:bg-luxury-surface transition-colors uppercase text-xs tracking-wider"
                  >
                    <span>{c("Muschio Journal", "مجلة موسكيو")}</span>
                    <ArrowRight size={14} className="opacity-50" />
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
                    { name: "Instagram", href: "https://www.instagram.com/muschio.parfums", label: "IG" },
                    { name: "TikTok", href: "https://www.tiktok.com/@muschio.haute", label: "TT" },
                    { name: "X / Twitter", href: "https://twitter.com/muschio_haute", label: "X" },
                    { name: "YouTube", href: "https://www.youtube.com/@muschiohaute", label: "YT" },
                  ].map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      className="flex-1 py-1.5 text-center text-[11px] font-mono rounded-sm border border-luxury-border bg-luxury-surface text-luxury-muted hover:text-luxury-text hover:border-luxury-text transition-colors"
                    >
                      {s.label}
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
                  <ThemeToggle locale={locale} showLabel={true} />
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

      {/* 5. Live Search Modal Overlay */}
      <SearchDialog
        open={search}
        close={() => setSearch(false)}
        title={c("Search the Vault", "البحث في المجموعة")}
      >
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
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
                className="w-full p-3.5 pe-10 border border-luxury-border bg-luxury-surface text-sm text-luxury-text focus:outline-none focus:border-luxury-text"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute inset-y-0 end-0 right-0 rtl:right-auto rtl:left-0 px-3 flex items-center justify-center text-luxury-muted hover:text-luxury-text"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Quick Popular Searches */}
          {!query.trim() && (
            <div>
              <span className="eyebrow mb-2.5">
                {c("POPULAR SEARCHES", "عمليات البحث الشائعة")}
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
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

          {/* Live Search Results List */}
          {query.trim() && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <span className="eyebrow">
                {c(
                  `${searchResults.length} Results Found`,
                  `تم العثور على ${searchResults.length} نتيجة`,
                )}
              </span>
              {searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-luxury-muted">
                  {c(
                    "No matching fragrances, brands, or notes found.",
                    "لم يتم العثور على نتائج مطابقة.",
                  )}
                </div>
              ) : (
                <div className="divide-y divide-luxury-border">
                  {searchResults.map((res) => (
                    <Link
                      key={res.href}
                      href={res.href}
                      onClick={() => setSearch(false)}
                      className="py-2.5 flex items-center justify-between text-xs hover:text-accent group"
                    >
                      <div>
                        <span className="block font-medium text-luxury-text group-hover:underline">
                          {c(res.nameEn, res.nameAr)}
                        </span>
                        <span className="text-[11px] text-luxury-muted">
                          {res.brand}
                        </span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SearchDialog>

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
                    {cart.subtotal >= 500
                      ? c("Complimentary GCC White-Glove Delivery Unlocked", "الشحن السريع المبرد المجاني مفعل لطلبك")
                      : c(
                          `Add AED ${Math.max(0, 500 - cart.subtotal)} for Complimentary Delivery`,
                          `أضف ${Math.max(0, 500 - cart.subtotal)} درهم للحصول على شحن مجاني`,
                        )}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-accent">
                    {Math.min(100, Math.round((cart.subtotal / 500) * 100))}%
                  </span>
                </div>
                <div className="w-full h-1 bg-luxury-border overflow-hidden rounded-full">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((cart.subtotal / 500) * 100))}%` }}
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
                        <div className="flex items-center gap-2.5 mt-2.5">
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, -1)}
                            aria-label={c("Decrease quantity", "تقليل الكمية")}
                            className="w-6 h-6 flex items-center justify-center border border-luxury-border bg-luxury-surface hover:border-luxury-text transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-mono font-medium text-luxury-text">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => cart.updateQuantity(item.id, 1)}
                            aria-label={c("Increase quantity", "زيادة الكمية")}
                            className="w-6 h-6 flex items-center justify-center border border-luxury-border bg-luxury-surface hover:border-luxury-text transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            className="text-[11px] text-luxury-muted hover:text-[#d2042d] ms-auto underline"
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
                    "Complimentary 2ml discovery vial & Certificate of Authenticity included.",
                    "مرفق عينة ٢ مل مجانية للتجربة مع شهادة الأصالة الرسمية المعتمدة.",
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
