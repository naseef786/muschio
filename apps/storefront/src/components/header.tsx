"use client";
import React, { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "../navigation";
import { Search, ShoppingBag, Heart, Menu, X, Minus, Plus } from "lucide-react";
import { useCart } from "../context/cart-context";
import { PriceDisplay } from "@muschio/ui";

function Overlay({ open, close, title, children }: { open: boolean; close: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (open && !dialog?.open) dialog?.showModal(); else if (!open && dialog?.open) dialog.close(); }, [open]);
  return <dialog ref={ref} className="site-dialog" onCancel={close} onClick={e => { if (e.target === ref.current) close(); }} aria-label={title}>
    <div className="dialog-heading"><h2>{title}</h2><button onClick={close} aria-label="Close"><X size={22} /></button></div>{children}
  </dialog>;
}
export function Header({ locale }: { locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => ar ? arabic : en;
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const cart = useCart();
  const links = [
    ["/shop", c("Shop fragrance", "تسوق العطور")],
    ["/brands", c("The houses", "دور العطور")],
    ["/notes", c("Scent notes", "نوتات العطر")],
    ["/discover/sets", c("Discovery sets", "مجموعات الاكتشاف")],
    ["/guide", c("The guide", "الدليل")],
    ["/journal", c("Journal", "المجلة")],
  ];
  const nav = links.map(([href, label]) => <Link key={href} href={href!} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenu(false)}>{label}</Link>);
  return <>
    <div className="site-topbar">{c("A considered collection. A personal discovery.", "مجموعة مختارة بعناية. اكتشاف شخصي.")}</div>
    <header className="site-header">
      <div className="masthead">
        <div className="header-actions"><button className="mobile-trigger" onClick={() => setMenu(true)} aria-label={c("Open menu", "فتح القائمة")}><Menu size={21} /></button><button onClick={() => setSearch(true)} aria-label={c("Search", "بحث")}><Search size={21} /></button><Link className="desktop-utility" href="/account">{c("My account", "حسابي")}</Link></div>
        <Link href="/" className="masthead-logo" aria-label="Muschio home">MUSCHIO</Link>
        <div className="header-actions"><button className="desktop-utility" onClick={() => router.replace(pathname, { locale: ar ? "en" : "ar" })}>{ar ? "EN" : "عربي"}</button><Link className="desktop-utility" href="/wishlist" aria-label={c("Wishlist", "المفضلة")}><Heart size={20} /></Link><button onClick={() => cart.setCartDrawerOpen(true)} aria-label={c(`Shopping bag, ${cart.itemCount} items`, `حقيبة التسوق، ${cart.itemCount} منتجات`)}><ShoppingBag size={21} /><span className="text-xs ms-1">{cart.itemCount}</span></button></div>
      </div>
      <nav className="site-nav" aria-label={c("Main navigation", "القائمة الرئيسية")}>{nav}</nav>
    </header>
    <Overlay open={menu} close={() => setMenu(false)} title={c("Explore Muschio", "استكشف موسكيو")}><nav className="mobile-links">{nav}<Link href="/discover/ai" onClick={() => setMenu(false)}>{c("Find my fragrance", "اكتشف عطري")}</Link><Link href="/account" onClick={() => setMenu(false)}>{c("My account", "حسابي")}</Link><Link href="/wishlist" onClick={() => setMenu(false)}>{c("Wishlist", "المفضلة")}</Link></nav><button className="editorial-text-link mt-6" onClick={() => { router.replace(pathname, { locale: ar ? "en" : "ar" }); setMenu(false); }}>{ar ? "English" : "العربية"}</button></Overlay>
    <Overlay open={search} close={() => setSearch(false)} title={c("Find something you love", "اكتشف ما تحب")}><form onSubmit={e => { e.preventDefault(); if (query.trim()) { router.push(`/shop?search=${encodeURIComponent(query.trim())}`); setSearch(false); } }} className="space-y-5"><label htmlFor="site-search" className="block text-sm">{c("Search fragrances, brands, or notes", "ابحث عن العطور أو الدور أو النوتات")}</label><input id="site-search" autoFocus type="search" value={query} onChange={e => setQuery(e.target.value)} className="glass-input w-full p-4" required /><button type="submit" className="editorial-button w-full">{c("Search collection", "ابحث في المجموعة")}</button></form></Overlay>
    <Overlay open={cart.cartDrawerOpen} close={() => cart.setCartDrawerOpen(false)} title={c("Your shopping bag", "حقيبة التسوق")}>
      {!cart.items.length ? <div className="space-y-5"><p>{c("Your next discovery is waiting. Your bag is empty.", "اكتشافك التالي ينتظرك. حقيبتك فارغة.")}</p><Link href="/shop" className="editorial-button" onClick={() => cart.setCartDrawerOpen(false)}>{c("Explore fragrances", "استكشف العطور")}</Link></div> : <>
        {cart.items.map(item => <div className="bag-item" key={item.id}><div className="flex-1"><p className="text-xs uppercase tracking-wider">{item.brand}</p><Link href={`/product/${item.slug}`} onClick={() => cart.setCartDrawerOpen(false)} className="font-serif text-xl">{ar ? item.titleAr : item.title}</Link><p className="text-xs my-2">{item.sizeLabel}</p><div className="flex items-center gap-4"><button type="button" onClick={() => cart.updateQuantity(item.id, -1)} aria-label={c("Decrease quantity", "تقليل الكمية")} className="p-2"><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => cart.updateQuantity(item.id, 1)} aria-label={c("Increase quantity", "زيادة الكمية")} className="p-2"><Plus size={14} /></button><button className="text-xs underline ms-auto" onClick={() => cart.removeItem(item.id)}>{c("Remove", "إزالة")}</button></div></div><PriceDisplay price={item.price * item.quantity} locale={locale} size="sm" /></div>)}
        <div className="flex justify-between py-6"><span>{c("Subtotal", "المجموع الفرعي")}</span><PriceDisplay price={cart.subtotal} locale={locale} size="sm" /></div><p className="text-xs mb-5">{c("Delivery and availability are confirmed at checkout.", "يتم تأكيد التوصيل والتوفر عند إتمام الشراء.")}</p><Link href="/checkout" className="editorial-button w-full" onClick={() => cart.setCartDrawerOpen(false)}>{c("Continue to checkout", "متابعة لإتمام الشراء")}</Link><Link href="/cart" className="editorial-text-link mt-5" onClick={() => cart.setCartDrawerOpen(false)}>{c("View shopping bag", "عرض حقيبة التسوق")}</Link>
      </>}
    </Overlay>
  </>;
}
