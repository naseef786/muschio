"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "../navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Globe,
  ChevronDown,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Check,
  User,
} from "lucide-react";
import { Button, PriceDisplay } from "@muschio/ui";
import { useCart } from "../context/cart-context";

const CURRENCIES = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", vat: "5% VAT Included" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", flag: "🇸🇦", vat: "15% VAT Included" },
  { code: "OMR", symbol: "ر.ع", name: "Omani Rial", flag: "🇴🇲", vat: "Tax Included" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar", flag: "🇧🇭", vat: "Tax Included" },
];

export function Header({ locale }: { locale: "en" | "ar" }) {

  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("AED");

  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    cartDrawerOpen,
    setCartDrawerOpen,
    subtotal: cartSubtotal,
    itemCount,
  } = useCart();

  const [wishlistCount] = useState(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const freeShippingThreshold = 500;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const activeCurr = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0]!;

  return (
    <>
      {/* 1. Top Glass Regional Bar */}
      <div className="bg-zinc-950/90 text-zinc-300 text-[11px] font-sans tracking-editorial py-2 px-4 border-b border-white/[0.08] backdrop-blur-md relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-zinc-300 font-light">
              {locale === "ar"
                ? "توصيل VIP مجاني في نفس اليوم داخل دبي والخليج للطلبات فوق 500 درهم"
                : "White-Glove VIP Same-Day Dubai & GCC Express Delivery on orders > 500 AED"}
            </span>
          </div>

          <div className="flex items-center gap-4 ms-auto text-[10px]">
            {/* Currency Selector Pill */}
            <button
              onClick={() => setCurrencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 transition-all font-mono"
            >
              <span>{activeCurr.flag}</span>
              <span className="font-semibold">{activeCurr.code}</span>
              <span className="opacity-70 font-sans">({activeCurr.symbol})</span>
              <ChevronDown size={11} className="opacity-60" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="hover:text-gold transition-colors underline uppercase tracking-wider font-semibold flex items-center gap-1"
            >
              <Globe size={11} />
              <span>{locale === "en" ? "العربية (RTL)" : "English"}</span>
            </button>

            {/* Dark/Light Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:text-gold p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-40 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-gold transition-colors"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Brand Logo with Ambient Gold Sheen */}
            <div className="flex-1 lg:flex-none text-center lg:text-start">
              <Link href="/" className="inline-block group py-1">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-light text-zinc-950 dark:text-white uppercase transition-colors group-hover:text-gold">
                  Muschio
                </span>
                <span className="block text-[8px] font-sans tracking-[0.4em] text-zinc-500 dark:text-zinc-400 uppercase -mt-1 group-hover:text-zinc-300">
                  Haute Parfumerie
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links with Glass Hover Glow */}
            <nav className="hidden lg:flex items-center gap-6 text-[12px] font-sans uppercase tracking-[0.16em] text-zinc-800 dark:text-zinc-200 font-normal">
              <Link
                href="/shop"
                className="hover:text-gold transition-colors py-1 relative group"
              >
                <span>{t("nav.fragrance")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/brands"
                className="hover:text-gold transition-colors py-1 relative group"
              >
                <span>{t("nav.brands")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/notes"
                className="hover:text-gold transition-colors flex items-center gap-1.5 text-accent font-medium py-1"
              >
                <span>{t("nav.notes")}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/15 border border-accent/30 text-accent font-bold">
                  v9 Graph
                </span>
              </Link>
              <Link
                href="/guide"
                className="hover:text-gold transition-colors py-1 relative group"
              >
                <span>{t("nav.guide")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/discover/ai"
                className="hover:text-gold transition-colors flex items-center gap-1.5 text-zinc-950 dark:text-zinc-100 font-medium px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:border-accent/50 shadow-sm"
              >
                <Sparkles size={13} className="text-accent animate-pulse" />
                <span>{t("nav.aiDiscovery")}</span>
              </Link>
              <Link
                href="/discover/sets"
                className="hover:text-gold transition-colors py-1 relative group"
              >
                <span>{t("nav.discoverySets")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/journal"
                className="hover:text-gold transition-colors py-1 relative group"
              >
                <span>{t("nav.journal")}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            {/* Utility Actions with Interactive Glass Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-zinc-700 hover:text-gold dark:text-zinc-300 dark:hover:text-white glass-pill hover:scale-105 transition-all"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2.5 rounded-full text-zinc-700 hover:text-gold dark:text-zinc-300 dark:hover:text-white glass-pill hover:scale-105 transition-all relative"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* VIP Account */}
              <Link
                href="/account"
                className="hidden sm:flex p-2.5 rounded-full text-zinc-700 hover:text-gold dark:text-zinc-300 dark:hover:text-white glass-pill hover:scale-105 transition-all"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              {/* Interactive Cart Button with Slide Drawer Trigger */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="p-2.5 rounded-full text-zinc-900 dark:text-white glass-pill hover:scale-105 transition-all relative group border-gold/30 hover:border-gold"
                aria-label="Cart"
              >
                <ShoppingBag size={19} className="group-hover:text-gold transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-zinc-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Interactive Instant Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full glass-panel border-b border-zinc-200/80 dark:border-white/10 p-6 shadow-2xl animate-slide-up z-50">
            <div className="max-w-4xl mx-auto space-y-4">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={20} className="absolute start-4 text-gold" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    locale === "ar"
                      ? "ابحث عن عطر نيش، نوتة نادرة (مثل: لبان، دهن عود، ورد طائف)، أو دار عطور..."
                      : "Search by extrait name, rare note (e.g., Frankincense, Taif Rose, Oud), or perfumer..."
                  }
                  className="w-full h-14 ps-12 pe-28 rounded-xl glass-input text-base font-sans"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute end-24 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X size={16} />
                  </button>
                )}
                <Button type="submit" size="sm" variant="gold" className="absolute end-2">
                  {locale === "ar" ? "بحث" : "Explore"}
                </Button>
              </form>

              {/* Instant Search Suggestions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-zinc-400 uppercase font-sans tracking-wider text-[10px]">
                  {locale === "ar" ? "عمليات بحث شائعة:" : "Trending Searches:"}
                </span>
                {[
                  { label: "Interlude 53", href: "/product/amouage-interlude-53-man" },
                  { label: "Royal Taif Rose", href: "/notes/taif-rose" },
                  { label: "Baccarat Rouge 540", href: "/shop?search=Baccarat" },
                  { label: "Silver Frankincense", href: "/notes/silver-frankincense" },
                  { label: "5x2ml Discovery Sets", href: "/discover/sets" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(item.href);
                    }}
                    className="px-3 py-1 rounded-full glass-pill text-zinc-700 dark:text-zinc-300 hover:text-gold hover:border-gold/40 text-[11px] transition-all"
                  >
                    ✦ {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 glass-panel px-6 py-8 space-y-6 animate-fade-in">
            <div className="flex flex-col space-y-4 text-sm font-sans uppercase tracking-[0.15em]">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors"
              >
                {t("nav.fragrance")}
              </Link>
              <Link
                href="/brands"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors"
              >
                {t("nav.brands")}
              </Link>
              <Link
                href="/notes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 text-accent font-medium flex items-center justify-between"
              >
                <span>{t("nav.notes")}</span>
                <span className="text-[10px] bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                  Dedicated v9 Graph
                </span>
              </Link>
              <Link
                href="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors"
              >
                {t("nav.guide")}
              </Link>
              <Link
                href="/discover/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 flex items-center gap-2 text-gold"
              >
                <Sparkles size={16} />
                <span>{t("nav.aiDiscovery")}</span>
              </Link>
              <Link
                href="/discover/sets"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors"
              >
                {t("nav.discoverySets")}
              </Link>
              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors"
              >
                {t("nav.journal")}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors flex items-center justify-between"
              >
                <span>{t("nav.wishlist")}</span>
                <Heart size={14} className="text-accent" />
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-white/5 hover:text-gold transition-colors flex items-center justify-between text-gold"
              >
                <span>{t("nav.account")} (VIP)</span>
                <User size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 5. Interactive Slide-Over Shopping Bag Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full glass-panel border-s border-white/10 shadow-2xl flex flex-col z-10 animate-slide-up">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold" />
                <h3 className="font-serif text-xl text-zinc-950 dark:text-white uppercase tracking-wide">
                  {locale === "ar" ? "حقيبة التسوق الملكية" : "Haute Shopping Bag"}
                </h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* VIP Delivery Meter */}
            <div className="p-4 bg-gold/10 border-b border-gold/20 text-xs font-sans space-y-2">
              <div className="flex items-center justify-between text-zinc-800 dark:text-zinc-200">
                <span className="font-medium flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gold" />
                  {progressToFreeShipping >= 100
                    ? locale === "ar"
                      ? "مؤهل للتوصيل المجاني الفوري في نفس اليوم!"
                      : "Unlocked: VIP Same-Day Dubai Express Courier!"
                    : locale === "ar"
                    ? `أضف ${freeShippingThreshold - cartSubtotal} درهم للحصول على شحن مجاني`
                    : `Add ${freeShippingThreshold - cartSubtotal} AED for complimentary courier`}
                </span>
                <span className="font-mono font-bold text-gold">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold via-amber-300 to-accent transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-400">
                  <ShoppingBag size={48} className="stroke-1 opacity-40 text-gold" />
                  <p className="font-serif text-lg text-zinc-700 dark:text-zinc-300">
                    {locale === "ar" ? "حقيبتك فارغة حالياً" : "Your fragrance vault is empty"}
                  </p>
                  <Button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      router.push("/shop");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {locale === "ar" ? "استكشف العطور" : "Explore Vault"}
                  </Button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl glass-card flex gap-4 items-center relative group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden relative bg-zinc-900 flex-shrink-0 border border-white/10">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-semibold">
                        {item.brand}
                      </span>
                      <h4 className="font-serif text-sm text-zinc-950 dark:text-white truncate">
                        {locale === "ar" ? item.titleAr : item.title}
                      </h4>
                      <PriceDisplay price={item.price} locale={locale} />

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-white/10 rounded-full glass-pill px-2 py-0.5 text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2 text-zinc-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-zinc-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2 text-zinc-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-accent p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout CTA */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 glass-panel-subtle space-y-4">
                <div className="space-y-1.5 text-sm font-sans">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                    <PriceDisplay price={cartSubtotal} locale={locale} />
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 text-xs">
                    <span>{locale === "ar" ? "ضريبة القيمة المضافة (5% متضمنة)" : "GCC VAT (Included)"}</span>
                    <span>{(cartSubtotal * 0.05).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-base font-serif text-zinc-950 dark:text-white pt-2 border-t border-white/10">
                    <span>{locale === "ar" ? "الإجمالي المستحق" : "Total Amount"}</span>
                    <span className="font-mono font-bold text-gold text-lg">{cartSubtotal} AED</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    router.push("/checkout");
                  }}
                  variant="gold"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>{locale === "ar" ? "إتمام الطلب السريع" : "Proceed to VIP Checkout"}</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Interactive Currency & Market Modal */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCurrencyModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
          />
          <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl space-y-5 animate-slide-up z-10 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-xl text-zinc-950 dark:text-white">
                {locale === "ar" ? "اختر عملة التسوق والإقليم" : "Select Regional Currency"}
              </h3>
              <button
                onClick={() => setCurrencyModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto">
              {CURRENCIES.map((curr) => {
                const isSelected = selectedCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setSelectedCurrency(curr.code);
                      setCurrencyModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all ${
                      isSelected
                        ? "border-gold bg-gold/15 text-zinc-950 dark:text-white ring-1 ring-gold/40 shadow-sm"
                        : "border-white/10 bg-white/40 dark:bg-white/[0.03] hover:border-gold/40 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{curr.flag}</span>
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{curr.name}</div>
                        <div className="text-[10px] text-zinc-400">{curr.vat}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{curr.code}</span>
                      {isSelected && <Check size={16} className="text-gold" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
