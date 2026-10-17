"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, usePathname, useRouter } from "../navigation";
import { Search, ShoppingBag, Heart, Menu, X, Minus, Plus, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "../context/cart-context";
import { PriceDisplay } from "@muschio/ui";

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

function Overlay({
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
        <button onClick={close} aria-label="Close">
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

  const links = [
    ["/shop", c("Shop Fragrance", "تسوق العطور")],
    ["/brands", c("The Houses", "دور العطور")],
    ["/notes", c("Scent Notes", "نوتات العطر")],
    ["/discover/sets", c("Discovery Sets", "مجموعات الاكتشاف")],
    ["/guide", c("The Guide", "دليل العطور")],
    ["/journal", c("Journal", "المجلة")],
  ];

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCHABLE_ITEMS.filter((item) =>
      [item.nameEn, item.nameAr, item.brand].some((field) =>
        field.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  const nav = links.map(([href, label]) => (
    <Link
      key={href}
      href={href!}
      aria-current={pathname === href ? "page" : undefined}
      onClick={() => setMenu(false)}
    >
      {label}
    </Link>
  ));

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
              className="mobile-trigger"
              onClick={() => setMenu(true)}
              aria-label={c("Open menu", "فتح القائمة")}
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => setSearch(true)}
              aria-label={c("Search fragrances", "البحث في العطور")}
            >
              <Search size={20} />
            </button>
            <Link
              className="desktop-utility text-xs tracking-wider uppercase text-[#171917] hover:text-[#46513B] font-medium transition-colors"
              href="/account"
            >
              {c("My Account", "حسابي")}
            </Link>
          </div>

          {/* Centered Prominent MUSCHIO Wordmark */}
          <Link href="/" className="masthead-logo" aria-label="Muschio Home">
            MUSCHIO
          </Link>

          {/* Right Actions (Language + Wishlist + Bag) */}
          <div className="header-actions">
            <button
              className="desktop-utility text-xs tracking-wider uppercase text-[#77776F] hover:text-[#171917] font-medium transition-colors"
              onClick={() =>
                router.replace(pathname, { locale: ar ? "en" : "ar" })
              }
              aria-label={c("Switch language", "تغيير اللغة")}
            >
              {ar ? "EN" : "عربي"}
            </button>
            <Link
              className="desktop-utility"
              href="/wishlist"
              aria-label={c("Wishlist", "المفضلة")}
            >
              <Heart size={20} />
            </Link>
            <button
              onClick={() => cart.setCartDrawerOpen(true)}
              aria-label={c(
                `Shopping bag, ${cart.itemCount} items`,
                `حقيبة التسوق، ${cart.itemCount} منتجات`,
              )}
              className="flex items-center"
            >
              <ShoppingBag size={20} />
              {cart.itemCount > 0 && (
                <span className="text-[11px] font-sans font-medium ms-1.5 px-1.5 py-0.2 bg-[#171917] text-white rounded-full">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Category Navigation Row (Desktop) */}
        <nav
          className="site-nav"
          aria-label={c("Main navigation", "القائمة الرئيسية")}
        >
          {nav}
        </nav>
      </header>

      {/* 4. Mobile Drawer Navigation */}
      <Overlay
        open={menu}
        close={() => setMenu(false)}
        title={c("Explore Muschio", "استكشف موسكيو")}
      >
        <nav className="space-y-4 text-sm font-medium uppercase tracking-wider">
          {nav}
          <div className="pt-4 border-t border-[#E6E4DE] space-y-3 font-normal normal-case text-xs tracking-normal">
            <Link
              href="/discover/ai"
              onClick={() => setMenu(false)}
              className="flex items-center gap-2 text-[#46513B] font-medium"
            >
              <Sparkles size={14} />
              {c("AI Scent Sommelier", "مستشار العطور الذكي")}
            </Link>
            <Link
              href="/account"
              onClick={() => setMenu(false)}
              className="block text-[#171917]"
            >
              {c("My Account & Concierge", "حسابي والمساعد الشخصي")}
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMenu(false)}
              className="block text-[#171917]"
            >
              {c("Wishlist", "قائمة المفضلة")}
            </Link>
          </div>
        </nav>
        <div className="pt-6 mt-6 border-t border-[#E6E4DE]">
          <button
            type="button"
            className="editorial-text-link"
            onClick={() => {
              router.replace(pathname, { locale: ar ? "en" : "ar" });
              setMenu(false);
            }}
          >
            {ar ? "Switch to English" : "التحويل إلى العربية"}
          </button>
        </div>
      </Overlay>

      {/* 5. Search Overlay (Products, Brands, Notes, with Empty/Loading States) */}
      <Overlay
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
                className="w-full p-3.5 pe-10 border border-[#E6E4DE] bg-white text-sm text-[#171917] focus:outline-none focus:border-[#171917]"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute inset-y-0 inset-inline-end-0 px-3 flex items-center justify-center text-[#77776F] hover:text-[#171917]"
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
                    className="px-3 py-1.5 border border-[#E6E4DE] bg-white text-xs text-[#171917] hover:border-[#171917] transition-colors"
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
                <div className="py-6 text-center text-xs text-[#77776F]">
                  {c(
                    "No matching fragrances, brands, or notes found.",
                    "لم يتم العثور على نتائج مطابقة.",
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#E6E4DE]">
                  {searchResults.map((res) => (
                    <Link
                      key={res.href}
                      href={res.href}
                      onClick={() => setSearch(false)}
                      className="py-2.5 flex items-center justify-between text-xs hover:text-[#46513B] group"
                    >
                      <div>
                        <span className="block font-medium text-[#171917] group-hover:underline">
                          {c(res.nameEn, res.nameAr)}
                        </span>
                        <span className="text-[11px] text-[#77776F]">
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
      </Overlay>

      {/* 6. Shopping Bag Drawer */}
      <Overlay
        open={cart.cartDrawerOpen}
        close={() => cart.setCartDrawerOpen(false)}
        title={c("Your Shopping Bag", "حقيبة التسوق")}
      >
        {!cart.items.length ? (
          <div className="space-y-4 py-8 text-center">
            <p className="text-sm text-[#77776F]">
              {c(
                "Your bag is currently empty. Explore our curated flacons.",
                "حقيبتك فارغة حالياً. استكشف مجموعتنا المختارة.",
              )}
            </p>
            <Link
              href="/shop"
              className="editorial-button text-xs"
              onClick={() => cart.setCartDrawerOpen(false)}
            >
              {c("Explore Fragrances", "استكشف العطور")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-[#E6E4DE] max-h-72 overflow-y-auto">
              {cart.items.map((item) => (
                <div className="py-4 flex gap-4" key={item.id}>
                  <div className="flex-1">
                    <p className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#77776F]">
                      {item.brand}
                    </p>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => cart.setCartDrawerOpen(false)}
                      className="font-serif text-lg text-[#171917] hover:underline"
                    >
                      {ar ? item.titleAr : item.title}
                    </Link>
                    <p className="text-xs text-[#77776F] my-1">{item.sizeLabel}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(item.id, -1)}
                        aria-label={c("Decrease quantity", "تقليل الكمية")}
                        className="p-1 border border-[#E6E4DE]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(item.id, 1)}
                        aria-label={c("Increase quantity", "زيادة الكمية")}
                        className="p-1 border border-[#E6E4DE]"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="text-xs text-[#77776F] hover:text-[#d2042d] ms-auto underline"
                        onClick={() => cart.removeItem(item.id)}
                      >
                        {c("Remove", "حذف")}
                      </button>
                    </div>
                  </div>
                  <PriceDisplay
                    price={item.price * item.quantity}
                    locale={locale}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E6E4DE] space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>{c("Subtotal", "المجموع الفرعي")}</span>
                <PriceDisplay price={cart.subtotal} locale={locale} size="sm" />
              </div>
              <p className="text-[11px] text-[#77776F]">
                {c(
                  "Taxes, delivery, and authenticity verified at checkout.",
                  "يتم تأكيد التوصيل والضرائب والأصالة عند إتمام الطلب.",
                )}
              </p>
              <Link
                href="/checkout"
                className="editorial-button w-full text-center"
                onClick={() => cart.setCartDrawerOpen(false)}
              >
                {c("Proceed to Checkout", "متابعة لإتمام الطلب")}
              </Link>
            </div>
          </div>
        )}
      </Overlay>
    </>
  );
}
