"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { muschioApi } from "../../../lib/api";
import { PriceDisplay } from "@muschio/ui";
import {
  Search,
  Package,
  Truck,
  Sparkles,
  Clock,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Activity,
} from "lucide-react";

export default function OrderTrackingPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr]);

  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || searchParams.get("order") || "";

  const [orderQuery, setOrderQuery] = useState(initialRef);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const performLookup = useCallback(
    async (ref: string, contact?: string, isSilent = false) => {
      const cleanRef = ref.trim();
      if (!cleanRef) return;
      if (!isSilent) {
        setLoading(true);
        setSearchError("");
      } else {
        setIsSyncing(true);
      }

      try {
        const result = await muschioApi.getOrderTracking(cleanRef, {
          email: contact?.includes("@") ? contact.trim() : undefined,
          phone: !contact?.includes("@") && contact ? contact.trim() : undefined,
        });

        if (result && result.orderNumber) {
          setOrderData((prev: any) => {
            if (prev && prev.status !== result.status) {
              setStatusToast(
                c(
                  `Real-Time Update: Order status updated to "${result.status}"!`,
                  `تحديث مباشر: تم تحديث حالة الشحنة إلى "${result.status}"!`,
                ),
              );
              setTimeout(() => setStatusToast(null), 7000);
            }
            return result;
          });
          setSecondsAgo(0);
        } else if (!isSilent) {
          setOrderData(null);
          setSearchError(
            c(
              "No order found matching this reference. Please check your order reference number and try again.",
              "لم يتم العثور على طلب بهذا الرقم المرجعي. يرجى التحقق من الرقم والمحاولة مرة أخرى.",
            ),
          );
        }
      } catch {
        if (!isSilent) {
          setOrderData(null);
          setSearchError(
            c(
              "Could not look up order status at this moment. Please verify your reference or reach out to our VIP Concierge.",
              "تعذر الاستعلام عن حالة الطلب حالياً. يرجى التحقق من الرقم أو التواصل مع خدمة كونسيرج مسكيو.",
            ),
          );
        }
      } finally {
        if (!isSilent) setLoading(false);
        setIsSyncing(false);
      }
    },
    [c],
  );

  // Initial lookup on mount or param change
  useEffect(() => {
    if (initialRef) {
      void performLookup(initialRef);
    }
  }, [initialRef, performLookup]);

  // Real-Time Background Synchronization every 3.5 seconds
  useEffect(() => {
    if (!orderData?.orderNumber) return;
    const currentRef = orderData.orderNumber;
    const isTerminal = ["DELIVERED", "CANCELLED"].includes(orderData.status);

    const syncTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && !isTerminal) {
        void performLookup(currentRef, undefined, true);
      }
    }, 3500);

    const secondsTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(syncTimer);
      clearInterval(secondsTimer);
    };
  }, [orderData?.orderNumber, orderData?.status, performLookup]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    void performLookup(orderQuery, emailOrPhone);
  };

  const copyText = (text: string, type: "ref" | "tracking") => {
    navigator.clipboard.writeText(text);
    if (type === "ref") {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  // Timeline Step calculation
  const status = orderData?.status || "PENDING";
  const currentStep =
    status === "DELIVERED"
      ? 4
      : status === "SHIPPED"
        ? 3
        : ["FULFILLING", "PAID"].includes(status)
          ? 2
          : 1;

  const timelineSteps = [
    {
      num: 1,
      titleEn: "Order Placed",
      titleAr: "تم استلام الطلب",
      descEn: "Order confirmed and received",
      descAr: "تم تأكيد طلبك بنجاح",
      icon: Clock,
    },
    {
      num: 2,
      titleEn: "Preparing",
      titleAr: "جاري التجهيز",
      descEn: "Checking & packaging your items",
      descAr: "فحص وتغليف المنتجات بعناية",
      icon: Package,
    },
    {
      num: 3,
      titleEn: "Shipped",
      titleAr: "تم الشحن",
      descEn: "On the way with courier",
      descAr: "الشحنة في الطريق إليك",
      icon: Truck,
    },
    {
      num: 4,
      titleEn: "Delivered",
      titleAr: "تم التوصيل",
      descEn: "Delivered to your address",
      descAr: "تم تسليم الطلب بنجاح",
      icon: Sparkles,
    },
  ];

  const whatsappInquiryUrl =
    "https://wa.me/97148006872?text=" +
    encodeURIComponent(
      isAr
        ? `مرحباً، أود الاستفسار عن حالة طلبي رقم: ${orderData?.orderNumber || orderQuery}`
        : `Hello, I would like to check the status of my order #${orderData?.orderNumber || orderQuery}`,
    );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10 sm:space-y-12">
      {/* 1. Header Banner */}
      <div className="border-b border-luxury-border pb-6 space-y-3">
        <span className="eyebrow text-accent">
          {c("ORDER TRACKING", "تتبع الطلب")}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c("Track Your Order", "تتبع مسار طلبك")}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted max-w-2xl leading-relaxed">
          {c(
            "See live updates on your order from preparation to delivery at your doorstep.",
            "تابع مسار طلبك خطوة بخطوة من التجهيز وحتى التوصيل إلى باب منزلك.",
          )}
        </p>
      </div>

      {/* 2. Tracking Input Search Box */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <label className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider font-sans">
                {c("Order Number", "رقم الطلب")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="MSC-2026-XXXXX"
                  className="glass-input w-full p-3.5 text-xs font-mono uppercase tracking-wider pl-10"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-muted" />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-luxury-text mb-1.5 uppercase tracking-wider font-sans">
                {c("Email or Phone (Optional)", "البريد أو الهاتف (اختياري)")}
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={c("example@email.com or +971...", "بريدك الإلكتروني أو رقم هاتفك")}
                className="glass-input w-full p-3.5 text-xs font-sans"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-luxury-muted flex items-center gap-1.5">
              <HelpCircle size={13} className="text-accent shrink-0" />
              <span>
                {c(
                  "Found in your confirmation email or WhatsApp message.",
                  "ستجد رقم الطلب في رسالة التأكيد عبر البريد أو واتساب.",
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !orderQuery.trim()}
              className="editorial-button text-xs py-3 px-8 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>{c("Searching…", "جاري البحث…")}</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>{c("Track Order", "تتبع الطلب")}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mt-4 p-4 border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-xs rounded-sm flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* 3. Live Tracking Results Screen */}
      {orderData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Real-time Status Change Toast */}
          {statusToast && (
            <div className="p-4 border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs rounded-sm flex items-center justify-between gap-3 animate-pulse shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-medium text-xs">{statusToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusToast(null)}
                className="text-xs opacity-70 hover:opacity-100 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Live Radar Sync Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-luxury-surface border border-luxury-border rounded-sm text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold text-luxury-text uppercase tracking-wider">
                {c("LIVE UPDATES ACTIVE", "تحديث مباشر لحالة الطلب")}
              </span>
              <span className="text-luxury-muted text-[11px]">
                · {c(`Updated ${secondsAgo}s ago`, `تم التحديث منذ ${secondsAgo} ثانية`)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void performLookup(orderData.orderNumber, undefined, false)}
              disabled={isSyncing || loading}
              className="text-[11px] font-medium text-accent hover:text-luxury-text flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin text-accent" : ""} />
              <span>{isSyncing ? c("Updating…", "جاري التحديث…") : c("Refresh", "تحديث")}</span>
            </button>
          </div>

          {/* Top Status & Summary Bar */}
          <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-luxury-border pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm sm:text-base font-semibold text-luxury-text">
                  {orderData.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyText(orderData.orderNumber, "ref")}
                  className="text-luxury-muted hover:text-accent p-1 transition-colors"
                  title={c("Copy reference", "نسخ الرقم المرجعي")}
                >
                  {copiedRef ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-sm border ${
                    status === "DELIVERED"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : status === "SHIPPED"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : ["FULFILLING", "PAID"].includes(status)
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-neutral-500/10 text-neutral-600 border-neutral-500/30"
                  }`}
                >
                  {status === "DELIVERED"
                    ? c("DELIVERED", "تم التوصيل بنجاح")
                    : status === "SHIPPED"
                      ? c("SHIPPED · ON THE WAY", "تم الشحن · في الطريق إليك")
                      : status === "FULFILLING"
                        ? c("PREPARING YOUR ORDER", "جاري تجهيز وتغليف الطلب")
                        : status === "PAID"
                          ? c("PAID · PREPARING SOON", "تم استلام الدفعة بنجاح")
                          : c("ORDER PLACED", "تم استلام الطلب")}
                </span>
              </div>
            </div>

            {/* Order Progression */}
            <div className="space-y-4 pt-2">
              <span className="eyebrow block text-accent text-[11px]">
                {c("ORDER PROGRESS", "مراحل تنفيذ الطلب")}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {timelineSteps.map((step) => {
                  const isCompleted = currentStep >= step.num;
                  const isCurrent = currentStep === step.num;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className={`p-4 border transition-all rounded-sm ${
                        isCurrent
                          ? "border-accent bg-luxury-surface2 shadow-sm"
                          : isCompleted
                            ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                            : "border-luxury-border opacity-50 bg-luxury-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-medium ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-luxury-surface border border-luxury-border text-luxury-muted"
                          }`}
                        >
                          {isCompleted ? "✓" : step.num}
                        </span>
                        <Icon
                          size={16}
                          className={isCompleted ? "text-emerald-500" : "text-luxury-muted"}
                        />
                      </div>
                      <h3 className="text-xs font-sans font-semibold text-luxury-text uppercase tracking-wider">
                        {c(step.titleEn, step.titleAr)}
                      </h3>
                      <p className="text-[11px] text-luxury-muted mt-1 leading-snug">
                        {c(step.descEn, step.descAr)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Dispatch & Recipient Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-luxury-border">
              <div className="p-4 bg-luxury-surface2 border border-luxury-border rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-muted">
                  <Truck size={14} className="text-accent" />
                  <span>{c("Courier Carrier", "شركة الشحن المعتمدة")}</span>
                </div>
                <div className="font-semibold text-xs text-luxury-text font-sans">
                  {orderData.carrier || "Muschio GCC Climate Courier"}
                </div>
                {orderData.trackingNumber && (
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs text-accent">
                    <span>{orderData.trackingNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyText(orderData.trackingNumber, "tracking")}
                      className="hover:opacity-75"
                      title={c("Copy tracking code", "نسخ رقم الشحنة")}
                    >
                      {copiedTracking ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-luxury-surface2 border border-luxury-border rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-muted">
                  <Calendar size={14} className="text-accent" />
                  <span>{c("Estimated Handover", "الموعد المتوقع للتسليم")}</span>
                </div>
                <div className="font-semibold text-xs text-luxury-text font-sans">
                  {orderData.estimatedDelivery
                    ? new Date(orderData.estimatedDelivery).toLocaleDateString(isAr ? "ar-AE" : "en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : c("Next 24–48 Hours", "خلال ٢٤ إلى ٤٨ ساعة")}
                </div>
                <div className="text-[11px] text-luxury-muted">
                  {c("Temperature-monitored direct route", "مسار مبرد ومراقب حرارياً")}
                </div>
              </div>

              <div className="p-4 bg-luxury-surface2 border border-luxury-border rounded-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-muted">
                  <MapPin size={14} className="text-accent" />
                  <span>{c("Delivery Destination", "عنوان وجهة التسليم")}</span>
                </div>
                <div className="font-semibold text-xs text-luxury-text font-sans truncate">
                  {orderData.shippingAddress
                    ? `${orderData.shippingAddress.city || "Dubai"}, ${orderData.shippingAddress.country || "United Arab Emirates"}`
                    : c("United Arab Emirates / GCC", "الإمارات العربية المتحدة / الخليج")}
                </div>
                <div className="text-[11px] text-luxury-muted truncate">
                  {orderData.customerName || "Muschio Client"}
                </div>
              </div>
            </div>
          </div>

          {/* Acquired Creations Breakdown */}
          {Array.isArray(orderData.items) && orderData.items.length > 0 && (
            <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-4">
              <span className="eyebrow block border-b border-luxury-border pb-3">
                {c("ITEMS IN THIS ORDER", "منتجات الطلب")}
              </span>

              <div className="divide-y divide-luxury-border">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-luxury-surface2 border border-luxury-border flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-accent/50" />
                      </div>
                      <div>
                        <div className="font-serif text-sm text-luxury-text">
                          {c(item.productNameEn, item.productNameAr)}
                        </div>
                        <div className="text-[11px] text-luxury-muted">
                          {item.sizeLabel || "Standard Flacon"} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="text-end font-mono text-xs text-luxury-text font-medium">
                      <PriceDisplay price={item.totalPrice} locale={locale} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-luxury-border flex flex-wrap items-center justify-between text-xs text-luxury-muted">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{c("100% Genuine & Authentic Products Guaranteed", "منتجات أصلية ومضمونة ١٠٠٪")}</span>
                </div>
                <div className="font-semibold text-luxury-text font-sans">
                  {c("Total Amount", "المجموع الكلي")}:{" "}
                  <PriceDisplay price={orderData.totalAmount} locale={locale} />
                </div>
              </div>
            </div>
          )}

          {/* 4. Real-time Order Updates Feed */}
          {Array.isArray(orderData.events) && orderData.events.length > 0 && (
            <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-accent" />
                  <span className="eyebrow text-luxury-text text-xs">
                    {c("ORDER UPDATES & HISTORY", "سجل تحديثات الطلب")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                    {c("LIVE UPDATES", "تحديث مباشر")}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {orderData.events.map((evt: any, idx: number) => {
                  const isLatest = idx === 0;
                  const dateObj = new Date(evt.timestamp);
                  const formattedTime = dateObj.toLocaleTimeString(
                    locale === "ar" ? "ar-AE" : "en-AE",
                    { hour: "2-digit", minute: "2-digit", second: "2-digit" },
                  );
                  const formattedDate = dateObj.toLocaleDateString(
                    locale === "ar" ? "ar-AE" : "en-AE",
                    { month: "short", day: "numeric", year: "numeric" },
                  );

                  return (
                    <div
                      key={evt.id || idx}
                      className={`relative flex items-start gap-4 p-3.5 border transition-all rounded-sm ${
                        isLatest
                          ? "border-accent/60 bg-luxury-surface2/80 shadow-sm"
                          : "border-luxury-border bg-luxury-surface2/30 opacity-85"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                            isLatest
                              ? "bg-accent text-luxury-bg shadow-sm"
                              : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      <div className="flex-1 space-y-1 text-start">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-luxury-text font-sans">
                            {c(evt.titleEn, evt.titleAr)}
                          </h4>
                          <span className="text-[10px] font-mono text-luxury-muted">
                            {formattedTime} · {formattedDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-luxury-muted leading-relaxed">
                          {c(evt.descriptionEn, evt.descriptionAr)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer Support CTA */}
          <div className="border border-luxury-border bg-luxury-surface2 p-6 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-start">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-accent block">
                {c("NEED HELP WITH YOUR ORDER?", "هل تحتاج مساعدة في طلبك؟")}
              </span>
              <p className="text-xs text-luxury-muted">
                {c(
                  "Contact our customer support team anytime on WhatsApp for fast help with delivery.",
                  "تواصل معنا مباشرة عبر واتساب للمساعدة السريعة في أي وقت.",
                )}
              </p>
            </div>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#128C7E] hover:bg-[#0c6b60] text-white text-xs font-medium rounded-sm flex items-center gap-2 shrink-0 transition-colors"
            >
              <MessageSquare size={14} />
              <span>{c("Chat on WhatsApp", "محادثة عبر واتساب")}</span>
              <ArrowRight size={12} className="rtl:rotate-180" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
