"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { StorefrontOrder } from "@muschio/types";
import { PriceDisplay, Button } from "@muschio/ui";
import { Link } from "../../../navigation";
import { muschioApi } from "../../../lib/api";
import { useAuth } from "../../../context/auth-context";
import {
  Package,
  Truck,
  RefreshCw,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  RotateCcw,
} from "lucide-react";

type OrderFilterStatus = "ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED";

export default function MyOrdersPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr]);

  const { user, isLoggedIn } = useAuth();

  const [orders, setOrders] = useState<StorefrontOrder[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderFilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);

  // Guest lookup state (for guest buyers or instant lookup)
  const [lookupOrderNumber, setLookupOrderNumber] = useState("");
  const [lookupEmailOrPhone, setLookupEmailOrPhone] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [guestLookupOrder, setGuestLookupOrder] = useState<StorefrontOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    let serverOrders: StorefrontOrder[] | null = null;
    try {
      serverOrders = await muschioApi.getMyOrders();
    } catch {
      serverOrders = null;
    }

    if (serverOrders && serverOrders.length > 0) {
      setOrders(serverOrders);
      setLoadingOrders(false);
      return;
    }

    // Fallback: Check locally persisted recent orders (for guest acquisitions or instant view)
    try {
      const raw = localStorage.getItem("muschio_recent_orders");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed as any);
          setLoadingOrders(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setOrders(serverOrders || []);
    setLoadingOrders(false);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders, isLoggedIn]);

  const handleCopyOrderNumber = (orderNum: string) => {
    try {
      navigator.clipboard.writeText(orderNum);
      setCopiedOrderNumber(orderNum);
      setTimeout(() => setCopiedOrderNumber(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim()) return;

    setLookupLoading(true);
    setLookupError("");
    setGuestLookupOrder(null);

    try {
      const input = lookupEmailOrPhone.trim();
      const isEmail = input.includes("@");
      const res = await muschioApi.getOrderTracking(
        lookupOrderNumber.trim(),
        input ? (isEmail ? { email: input } : { phone: input }) : undefined
      );

      if (res && res.orderNumber) {
        setGuestLookupOrder(res as any);
      } else {
        setLookupError(
          c(
            "No matching acquisition found. Please verify the order number and email.",
            "لم يتم العثور على طلب مطابق. يرجى التأكد من رقم الطلب والبريد الإلكتروني."
          )
        );
      }
    } catch {
      setLookupError(
        c(
          "Unable to retrieve order details. Please try again or contact concierge.",
          "تعذر استرجاع تفاصيل الطلب. يرجى المحاولة لاحقاً أو التواصل مع الكونسيرج."
        )
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "FULFILLING":
        return {
          label: c("Processing in Atelier", "قيد التجهيز الملكي"),
          color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
          icon: <Clock size={12} className="text-amber-600" />,
        };
      case "SHIPPED":
        return {
          label: c("In Transit · GCC Courier", "في الطريق إليك · شحن جوي"),
          color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
          icon: <Truck size={12} className="text-blue-600" />,
        };
      case "DELIVERED":
        return {
          label: c("Delivered", "تم التوصيل بنجاح"),
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 size={12} className="text-emerald-600" />,
        };
      case "PAYMENT_PENDING":
        return {
          label: c("Awaiting Payment", "بانتظار تأكيد الدفع"),
          color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
          icon: <Clock size={12} className="text-orange-600" />,
        };
      case "CANCELLED":
        return {
          label: c("Cancelled", "ملغي"),
          color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
          icon: <RotateCcw size={12} className="text-zinc-500" />,
        };
      default:
        return {
          label: status,
          color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
          icon: <Package size={12} className="text-zinc-500" />,
        };
    }
  };

  // Combine authenticated orders and guest lookup order if present
  const allOrdersList = React.useMemo(() => {
    const list = [...(orders || [])];
    if (guestLookupOrder && !list.some((o) => o.orderNumber === guestLookupOrder.orderNumber)) {
      list.unshift(guestLookupOrder);
    }
    return list;
  }, [orders, guestLookupOrder]);

  // Apply status filter and search query
  const filteredOrders = React.useMemo(() => {
    return allOrdersList.filter((order) => {
      // 1. Status Filter
      if (filterStatus === "ACTIVE") {
        if (!["PENDING", "PAYMENT_PENDING", "PAID", "FULFILLING", "SHIPPED"].includes(order.status)) {
          return false;
        }
      } else if (filterStatus === "DELIVERED") {
        if (order.status !== "DELIVERED") return false;
      } else if (filterStatus === "CANCELLED") {
        if (order.status !== "CANCELLED") return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesItems = (order.items || []).some(
          (item) =>
            item.productNameEn.toLowerCase().includes(q) ||
            item.productNameAr.toLowerCase().includes(q)
        );
        if (!matchesOrderNumber && !matchesItems) return false;
      }

      return true;
    });
  }, [allOrdersList, filterStatus, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-luxury-muted hover:text-luxury-text transition-colors"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          <span>{c("Back to Private Suite", "العودة لجناح العميل")}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="text-xs font-sans text-accent hover:underline flex items-center gap-1.5 font-medium"
          >
            <Truck size={14} />
            <span>{c("Live Courier Tracking", "التتبع المباشر للشحنات")}</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="border-b border-luxury-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-accent text-xs font-sans font-medium uppercase tracking-widest">
            <Package size={15} />
            <span>{c("HAUTE PARFUMERIE · CLIENT ACQUISITIONS", "دار العطور الراقية · سجل المقتنيات الملكية")}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
            {isLoggedIn && user
              ? c(`My Orders (${user.name})`, `طلباتي (${user.name})`)
              : c("My Orders & Receipts", "طلباتي وإيصالات الشراء")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-sans leading-relaxed">
            {c(
              "Review your private archive of bespoke fragrance acquisitions, trace white-glove GCC climate-controlled courier dispatches, and access official tax invoices.",
              "استعرض أرشيف مقتنياتك العطرية الفاخرة، وتتبع شحنات البريد الملكية المبردة في الخليج، واطلع على إيصالات الشراء والفواتير الضريبية."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loadingOrders}
            className="editorial-button-secondary text-xs inline-flex items-center gap-1.5 py-2.5 px-4"
          >
            <RefreshCw size={13} className={loadingOrders ? "animate-spin" : ""} />
            <span>{c("Refresh Archive", "تحديث السجل")}</span>
          </button>
        </div>
      </div>

      {/* Guest Lookup Form (Shown if not logged in or as a quick lookup drawer) */}
      {!isLoggedIn && (
        <div className="border border-luxury-border bg-luxury-surface2 p-6 sm:p-8 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-accent text-xs font-sans font-medium uppercase tracking-wider">
            <Search size={14} />
            <span>{c("GUEST ORDER LOOKUP", "البحث عن طلب زائر")}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h3 className="font-serif text-lg text-luxury-text font-normal">
                {c("Ordered as a guest without signing in?", "أتممت طلبك كزائر دون تسجيل الدخول؟")}
              </h3>
              <p className="text-xs text-luxury-muted">
                {c(
                  "Enter your Order Reference Number (e.g. MSC-...) and email address to instantly view your order details, receipt, and live courier tracking.",
                  "أدخل رقم الطلب المرجعي (مثل MSC-...) والبريد الإلكتروني لعرض تفاصيل طلبك وإيصال الشراء وحالة الشحن فوراً."
                )}
              </p>
            </div>

            <form onSubmit={handleGuestLookup} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full lg:w-auto">
              <input
                type="text"
                required
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                placeholder={c("Order # (MSC-...)", "رقم الطلب (MSC-...)")}
                className="glass-input p-2.5 text-xs font-mono uppercase w-full sm:w-48"
              />
              <input
                type="text"
                value={lookupEmailOrPhone}
                onChange={(e) => setLookupEmailOrPhone(e.target.value)}
                placeholder={c("Email or Phone", "البريد أو الهاتف")}
                className="glass-input p-2.5 text-xs w-full sm:w-44"
              />
              <Button type="submit" variant="accent" size="sm" disabled={lookupLoading} className="whitespace-nowrap">
                {lookupLoading ? c("Searching…", "جارٍ البحث…") : c("Find Order", "استرجاع الطلب")}
              </Button>
            </form>
          </div>

          {lookupError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-sans">{lookupError}</p>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border pb-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(
            [
              { id: "ALL", labelEn: "All Orders", labelAr: "كافة الطلبات" },
              { id: "ACTIVE", labelEn: "Processing & In Transit", labelAr: "قيد التجهيز والشحن" },
              { id: "DELIVERED", labelEn: "Delivered", labelAr: "تم التوصيل" },
              { id: "CANCELLED", labelEn: "Cancelled", labelAr: "ملغاة" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`text-xs font-sans tracking-wider uppercase px-3 py-1.5 rounded-sm transition-all border ${
                filterStatus === tab.id
                  ? "bg-luxury-text text-luxury-canvas border-luxury-text font-medium"
                  : "bg-luxury-surface text-luxury-muted border-luxury-border hover:text-luxury-text hover:border-luxury-borderBold"
              }`}
            >
              {c(tab.labelEn, tab.labelAr)}
              {tab.id === "ALL" && allOrdersList.length > 0 && (
                <span className="ms-1.5 text-[10px] font-mono opacity-80">({allOrdersList.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-luxury-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={c("Search by Order # or Fragrance…", "بحث برقم الطلب أو اسم العطر…")}
            className="glass-input ps-9 pe-3 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Orders List / Empty State */}
      {loadingOrders ? (
        <div className="py-24 text-center text-xs text-luxury-muted border border-luxury-border bg-luxury-surface space-y-3">
          <RefreshCw size={24} className="mx-auto animate-spin text-accent" />
          <p className="animate-pulse">{c("Accessing private order vaults…", "جارٍ الاتصال بأرشيف الطلبات الملكية…")}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-luxury-border bg-luxury-surface p-8 sm:p-16 text-center space-y-5 max-w-xl mx-auto rounded-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-luxury-surface2 border border-luxury-border flex items-center justify-center text-luxury-muted">
            <Package size={30} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-luxury-text font-normal">
              {allOrdersList.length === 0
                ? c("No acquisitions recorded yet", "لا توجد طلبات مسجلة حتى الآن")
                : c("No orders match your filter criteria", "لا توجد طلبات مطابقة لخيارات البحث")}
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed max-w-md mx-auto">
              {allOrdersList.length === 0
                ? c(
                    "When you acquire an artisanal flacon or curate a bespoke discovery set, your tracking dossiers, digital receipts, and loyalty rewards will be preserved here.",
                    "عند اقتنائك لأي زجاجة عطر استثنائية أو تصميم مجموعة عينات، ستُحفظ تفاصيل طلباتك وإيصالاتك الرسمية ومكافآتك هنا."
                  )
                : c(
                    "Try resetting your search query or switching to another status tab to locate past acquisitions.",
                    "يرجى تجربة إعادة ضبط البحث أو التبديل إلى تبويب آخر للعثور على طلبك."
                  )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button asChild variant="accent" size="sm">
              <Link href="/shop">{c("Explore Fragrance Catalog", "استكشف خزانة العطور")}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/discover/sets">{c("Curate 5x2ml Sampling Set", "صمم صندوق العينات (٢٨٠ د.إ)")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isDelivered = order.status === "DELIVERED";
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString(isAr ? "ar-AE" : "en-AE", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : c("Recent Acquisition", "طلب حديث");

            return (
              <div
                key={order.id}
                className="border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden hover:border-luxury-borderBold transition-all shadow-sm"
              >
                {/* Order Card Header */}
                <div className="bg-luxury-surface2 p-4 sm:p-5 border-b border-luxury-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Order Number + Copy */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-semibold text-luxury-text tracking-wide">
                        {order.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderNumber(order.orderNumber)}
                        title={c("Copy Order Number", "نسخ رقم الطلب")}
                        className="text-luxury-muted hover:text-luxury-text transition-colors p-1"
                      >
                        {copiedOrderNumber === order.orderNumber ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-sans font-medium uppercase tracking-wider px-2.5 py-1 border rounded-sm flex items-center gap-1.5 ${badge.color}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Date & Destination */}
                  <div className="flex items-center gap-4 text-xs text-luxury-muted font-sans">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="opacity-70" />
                      <span>{dateStr}</span>
                    </div>
                    {order.shippingAddress?.city && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        <MapPin size={13} className="opacity-70" />
                        <span>
                          {order.shippingAddress.city}, {order.shippingAddress.country || "UAE"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Preview Gallery */}
                <div className="p-5 sm:p-6 divide-y divide-luxury-border">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Flacon Thumbnail */}
                        <div className="w-14 h-16 sm:w-16 sm:h-20 bg-luxury-surface2 border border-luxury-border rounded-sm flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={isAr ? item.productNameAr : item.productNameEn}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-[9px] uppercase tracking-widest text-luxury-muted font-serif">
                              Flacon
                            </span>
                          )}
                        </div>

                        {/* Title & Specs */}
                        <div className="space-y-1">
                          {item.brandName && (
                            <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-accent font-medium block">
                              {item.brandName}
                            </span>
                          )}
                          <h4 className="font-serif text-sm sm:text-base text-luxury-text font-normal">
                            {isAr ? item.productNameAr : item.productNameEn}
                          </h4>
                          <p className="text-xs text-luxury-muted font-sans">
                            {item.sizeLabel || "100ml Extrait"} · {c("Qty:", "الكمية:")} {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-end">
                        <PriceDisplay price={item.totalPrice} locale={locale} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Card Footer: Financials & CTAs */}
                <div className="bg-luxury-surface p-4 sm:p-5 border-t border-luxury-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Financial Summary & Payment */}
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-sans text-luxury-muted block">
                        {c("Total Consideration (Incl. VAT)", "المجموع الكلي (شامل الضريبة)")}
                      </span>
                      <PriceDisplay price={order.totalAmount} locale={locale} size="md" />
                    </div>

                    {order.paymentMethod && (
                      <div className="border-s border-luxury-border ps-5 hidden md:block">
                        <span className="text-[10px] uppercase font-sans text-luxury-muted block">
                          {c("Payment Channel", "طريقة الدفع")}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-luxury-text">
                          <CreditCard size={13} className="text-accent" />
                          <span>
                            {order.paymentDetails?.brand
                              ? `${order.paymentDetails.brand} ···· ${order.paymentDetails.last4 || "4242"}`
                              : order.paymentMethod === "CASH_ON_DELIVERY"
                              ? c("Cash on Delivery (GCC)", "الدفع عند الاستلام")
                              : c("Secure Card Payment", "بطاقة بنكية")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}`}>
                        <span>{c("View Full Receipt", "عرض الإيصال الكامل")}</span>
                      </Link>
                    </Button>

                    <Button asChild variant="accent" size="sm">
                      <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}`}>
                        <Truck size={13} />
                        <span>{c("Live Tracking", "التتبع المباشر")}</span>
                      </Link>
                    </Button>

                    {isDelivered && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}#returns`}>
                          <RotateCcw size={13} />
                          <span>{c("7-Day Return", "طلب استرجاع")}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIP Assistance Guarantee Bar */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-serif text-base text-luxury-text font-normal">
              {c("Questions regarding your dispatch or batch provenance?", "هل لديك استفسار حول شحنتك أو توثيق العطر؟")}
            </h4>
            <p className="text-xs text-luxury-muted">
              {c(
                "Our Dubai luxury fragrance concierge is available 7 days a week to assist with climate-controlled delivery schedules and bottle verifications.",
                "فريق الكونسيرج في دبي متاح ٧ أيام في الأسبوع لمساعدتك في مواعيد التسليم وتوثيق أرقام الدفعات الملكية."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
            <Link href="/contact">{c("Contact Concierge", "تواصل مع الكونسيرج")} →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
