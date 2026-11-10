"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { muschioApi } from "../../../lib/api";
import { PriceDisplay } from "@muschio/ui";
import { Link } from "../../../navigation";
import {
  Search,
  Package,
  Truck,
  Sparkles,
  Clock,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Activity,
  Printer,
  RotateCcw,
  X,
  CheckCircle2,
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
  const [recentOrderRef, setRecentOrderRef] = useState<string | null>(null);

  // 7-Day Guarantee RMA Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Pristine Sealed Flacon (Changed Mind)");
  const [returnAction, setReturnAction] = useState<"REFUND" | "STORE_CREDIT" | "REPLACEMENT">("REFUND");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccessData, setReturnSuccessData] = useState<any | null>(null);
  const [returnError, setReturnError] = useState("");

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData?.id || returnSubmitting) return;
    setReturnSubmitting(true);
    setReturnError("");

    try {
      const itemsPayload = Array.isArray(orderData.items)
        ? orderData.items.map((it: any) => ({
            orderItemId: it.id,
            quantity: it.quantity || 1,
          }))
        : [];

      const res = await fetch("/api/v1/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          customerId: orderData.customerId || "guest",
          reason: returnReason,
          requestedAction: returnAction,
          items: itemsPayload,
          notes: returnNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setReturnSuccessData(json.data);
      } else {
        throw new Error(json.error?.message || "Failed to register return request");
      }
    } catch (err: any) {
      setReturnError(
        err?.message ||
          c(
            "Unable to submit return request. Please contact our concierge.",
            "تعذر تسجيل طلب الاسترجاع. يرجى التواصل مع خدمة العملاء.",
          ),
      );
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Check localStorage for recent order reference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("muschio_last_order") || localStorage.getItem("muschio_pending_order");
      if (stored) {
        if (stored.startsWith("MSC-") || stored.startsWith("ORD-")) {
          setRecentOrderRef(stored);
        } else {
          const parsed = JSON.parse(stored);
          if (parsed?.orderNumber) {
            setRecentOrderRef(parsed.orderNumber);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
                  `تحديث فوري: تم تحديث حالة الشحنة إلى "${result.status}"!`,
                ),
              );
              setTimeout(() => setStatusToast(null), 6000);
            }
            return result;
          });
          setSecondsAgo(0);
          try {
            localStorage.setItem("muschio_last_order", result.orderNumber);
          } catch {}
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
              "Could not look up order status at this moment. Please verify your reference or contact our VIP Concierge.",
              "تعذر الاستعلام عن حالة الطلب حالياً. يرجى التحقق من الرقم أو التواصل مع كونسيرج مسكيو.",
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

  // Real-Time Background Synchronization every 4 seconds
  useEffect(() => {
    if (!orderData?.orderNumber) return;
    const currentRef = orderData.orderNumber;
    const isTerminal = ["DELIVERED", "CANCELLED"].includes(orderData.status);

    const syncTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && !isTerminal) {
        void performLookup(currentRef, undefined, true);
      }
    }, 4000);

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
      descEn: "Order confirmed & recorded",
      descAr: "تم تأكيد طلبك وتسجيله بنجاح",
      icon: Clock,
    },
    {
      num: 2,
      titleEn: "Preparing",
      titleAr: "جاري التجهيز",
      descEn: "Inspecting seals & packaging",
      descAr: "فحص الأختام والتغليف الفاخر",
      icon: Package,
    },
    {
      num: 3,
      titleEn: "Dispatched",
      titleAr: "تم الشحن",
      descEn: "En route with Climate Courier",
      descAr: "الشحنة في مسار النقل المبرد",
      icon: Truck,
    },
    {
      num: 4,
      titleEn: "Delivered",
      titleAr: "تم التوصيل",
      descEn: "Handed over to doorstep",
      descAr: "تم التسليم بنجاح إلى باب منزلك",
      icon: Sparkles,
    },
  ];

  const whatsappInquiryUrl =
    "https://wa.me/97148006872?text=" +
    encodeURIComponent(
      isAr
        ? `مرحباً، أود الاستفسار عن حالة طلبي رقم: ${orderData?.orderNumber || orderQuery}`
        : `Hello Muschio Concierge, I would like to inquire about my order #${orderData?.orderNumber || orderQuery}`,
    );

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 font-sans">
      {/* 1. Minimalist Luxury Breadcrumbs (Level Shoes Pattern) */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 font-sans">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li className="text-neutral-900 dark:text-white font-medium">
            {c("Order Tracking", "تتبع الطلب")}
          </li>
          {orderData?.orderNumber && (
            <>
              <li className="text-neutral-300 dark:text-neutral-700">/</li>
              <li className="font-mono text-neutral-500 truncate max-w-[200px]">
                {orderData.orderNumber}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* 2. Editorial Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-400">
          {c("WHITE-GLOVE CONCIERGE TRACKER", "نظام تتبع الشحنات الفاخر")}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-white font-normal">
          {c("Track Your Order", "تتبع مسار شحنتك")}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
          {c(
            "Enter your official order reference number to monitor real-time temperature-regulated transit and dispatch updates across the GCC.",
            "أدخل الرقم المرجعي لمتابعة التحديثات المباشرة ومسار التوصيل المبرد لشحنتك في كافة دول مجلس التعاون الخليجي.",
          )}
        </p>
      </div>

      {/* 3. Luxury Order Lookup Search Form */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm shadow-sm space-y-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-1.5">
                {c("Order Reference Number", "الرقم المرجعي للطلب")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. MSC-2026-XXXXX"
                  className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3.5 ps-10 text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
                />
                <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-1.5">
                {c("Email or Phone (Optional)", "البريد الإلكتروني أو الهاتف (اختياري)")}
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={c("client@example.com or +971...", "name@example.com أو +971...")}
                className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-neutral-500 shrink-0" />
              <span>
                {c(
                  "Found on your digital receipt, SMS, or WhatsApp order confirmation.",
                  "مذكور في رسالة تأكيد الطلب، البريد الإلكتروني أو رسائل واتساب.",
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !orderQuery.trim()}
              className="py-3 px-8 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[170px]"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
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

        {/* Quick Recent Order Chip */}
        {recentOrderRef && recentOrderRef !== orderData?.orderNumber && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs">
            <span className="text-neutral-400">{c("Recent acquisition:", "آخر طلب لك:")}</span>
            <button
              type="button"
              onClick={() => {
                setOrderQuery(recentOrderRef);
                void performLookup(recentOrderRef);
              }}
              className="font-mono text-xs font-medium text-neutral-900 dark:text-white underline underline-offset-4 hover:opacity-80"
            >
              {recentOrderRef}
            </button>
          </div>
        )}

        {searchError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-sm flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* 4. Live Tracking Results View */}
      {orderData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Change Toast */}
          {statusToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-sm flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-medium">{statusToast}</span>
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

          {/* Order Header Summary Banner */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block">
                  {c("ORDER REFERENCE", "الرقم المرجعي")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                    {orderData.orderNumber}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  {c(`Updated ${secondsAgo}s ago`, `تم التحديث منذ ${secondsAgo} ثانية`)}
                </span>
                <button
                    type="button"
                    onClick={() => copyText(orderData.orderNumber, "ref")}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    title={c("Copy reference", "نسخ الرقم المرجعي")}
                  >
                    {copiedRef ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1.5 text-xs font-sans uppercase tracking-[0.12em] font-semibold rounded-none border ${
                    status === "DELIVERED"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : status === "SHIPPED"
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                        : ["FULFILLING", "PAID"].includes(status)
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                          : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  {status === "DELIVERED"
                    ? c("DELIVERED", "تم التوصيل بنجاح")
                    : status === "SHIPPED"
                      ? c("DISPATCHED · IN TRANSIT", "تم الشحن · في الطريق إليك")
                      : status === "FULFILLING"
                        ? c("PREPARING ORDER", "جاري تجهيز وتغليف الطلب")
                        : status === "PAID"
                          ? c("ORDER CONFIRMED", "تم تأكيد الطلب بنجاح")
                          : c("ORDER PLACED", "تم استلام الطلب")}
                </span>

                <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  {c(`Updated ${secondsAgo}s ago`, `تم التحديث منذ ${secondsAgo} ثانية`)}
                </span>
                <button
                  type="button"
                  onClick={() => void performLookup(orderData.orderNumber, undefined, false)}
                  disabled={isSyncing || loading}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800 rounded-sm transition-colors"
                  title={c("Refresh live status", "تحديث مباشر")}
                >
                  <RefreshCw size={14} className={isSyncing ? "animate-spin text-neutral-900 dark:text-white" : ""} />
                </button>
              </div>
            </div>

            {/* Level Shoes Style Connected Progress Stepper */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-sans tracking-[0.14em] font-medium text-neutral-400">
                  {c("FULFILLMENT MILESTONES", "مراحل الشحن والتنفيذ")}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {c(`Step ${currentStep} of 4`, `المرحلة ${currentStep} من ٤`)}
                </span>
              </div>

              {/* Connected Stepper Horizontal Bar */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-4 inset-x-8 h-[2px] bg-neutral-200 dark:bg-neutral-800 z-0">
                  <div
                    className="h-full bg-neutral-950 dark:bg-white transition-all duration-700 ease-out"
                    style={{
                      width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Milestones Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                  {timelineSteps.map((step) => {
                    const isCompleted = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;

                    return (
                      <div
                        key={step.num}
                        className={`flex flex-col sm:items-center text-start sm:text-center p-3 sm:p-2 rounded-sm sm:rounded-none border sm:border-0 ${
                          isCurrent
                            ? "border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-900/50"
                            : isCompleted
                              ? "border-neutral-200 dark:border-neutral-800 bg-transparent"
                              : "border-neutral-100 dark:border-neutral-900 opacity-40 bg-transparent"
                        }`}
                      >
                        {/* Circle Node */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold mb-2.5 transition-all ${
                            isCompleted
                              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                              : isCurrent
                                ? "bg-white text-neutral-950 border-2 border-neutral-950 dark:bg-neutral-900 dark:text-white dark:border-white ring-2 ring-neutral-300 dark:ring-neutral-700"
                                : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          {isCompleted ? "✓" : step.num}
                        </div>

                        {/* Title & Desc */}
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider font-sans">
                          {c(step.titleEn, step.titleAr)}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                          {c(step.descEn, step.descAr)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Courier Dispatch, Schedule & Address (3 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {/* Carrier */}
              <div className="p-4 bg-[#FAFAFA] dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 space-y-1 rounded-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Truck size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Climate Courier", "شركة الشحن المعتمدة")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1">
                  {orderData.carrier || "Muschio GCC Climate Courier"}
                </div>
                {orderData.trackingNumber && (
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs text-neutral-900 dark:text-white">
                    <span>{orderData.trackingNumber}</span>
                    <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  {c(`Updated ${secondsAgo}s ago`, `تم التحديث منذ ${secondsAgo} ثانية`)}
                </span>
                <button
                      type="button"
                      onClick={() => copyText(orderData.trackingNumber, "tracking")}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                      title={c("Copy tracking code", "نسخ رقم الشحنة")}
                    >
                      {copiedTracking ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
                <div className="text-[10px] text-neutral-400 pt-0.5">
                  {c("Temperature-monitored sealed transit", "مسار مبرد ومحمي بختم المصنع")}
                </div>
              </div>

              {/* Handover Window */}
              <div className="p-4 bg-[#FAFAFA] dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 space-y-1 rounded-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Estimated Handover", "الموعد المتوقع للتسليم")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1">
                  {orderData.estimatedDelivery
                    ? new Date(orderData.estimatedDelivery).toLocaleDateString(isAr ? "ar-AE" : "en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : c("Next 24–48 Hours", "خلال ٢٤ إلى ٤٨ ساعة")}
                </div>
                <div className="text-[10px] text-neutral-400 pt-0.5">
                  {c("Express UAE dispatch / GCC Priority", "شحن سريع داخل الإمارات ودول الخليج")}
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 bg-[#FAFAFA] dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 space-y-1 rounded-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <MapPin size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Delivery Address", "عنوان وجهة التسليم")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1 truncate">
                  {orderData.shippingAddress
                    ? `${orderData.shippingAddress.city || "Dubai"}, ${orderData.shippingAddress.country || "United Arab Emirates"}`
                    : c("United Arab Emirates / GCC", "الإمارات العربية المتحدة / الخليج")}
                </div>
                <div className="text-[10px] text-neutral-400 truncate pt-0.5">
                  {orderData.customerName || "Muschio Client"}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Acquired Creations Breakdown (Level Shoes Style Flacon Cards with Real Images) */}
          {Array.isArray(orderData.items) && orderData.items.length > 0 && (
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 font-sans">
                  {c("ACQUIRED CREATIONS", "القطع المقتناة في هذا الطلب")}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {orderData.items.length}{" "}
                  {c(
                    orderData.items.length === 1 ? "Flacon" : "Flacons",
                    orderData.items.length === 1 ? "عطر" : "عطور",
                  )}
                </span>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {orderData.items.map((item: any) => {
                  const itemImage = item.image || "/product-placeholder.svg";
                  const itemSlug = item.slug;

                  return (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* 4:5 Flacon Image Canvas */}
                        <div className="relative w-16 h-20 bg-[#F8F8F8] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shrink-0 overflow-hidden rounded-sm flex items-center justify-center">
                          <Image
                            src={itemImage}
                            alt={item.productNameEn || "Fragrance"}
                            fill
                            sizes="80px"
                            className="object-cover object-center"
                          />
                        </div>

                        <div className="min-w-0">
                          {item.brandName && (
                            <span className="text-[10px] uppercase font-sans tracking-widest text-neutral-400 block truncate">
                              {item.brandName}
                            </span>
                          )}
                          <h3 className="font-serif text-base text-neutral-900 dark:text-white truncate">
                            {itemSlug ? (
                              <Link
                                href={`/product/${itemSlug}`}
                                className="hover:underline underline-offset-4"
                              >
                                {c(item.productNameEn, item.productNameAr)}
                              </Link>
                            ) : (
                              c(item.productNameEn, item.productNameAr)
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                            <span>{item.sizeLabel || "Standard Flacon"}</span>
                            <span>•</span>
                            <span className="font-mono text-neutral-600 dark:text-neutral-300">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end font-mono text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white shrink-0">
                        <PriceDisplay price={item.totalPrice} locale={locale} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees & Total Row */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-neutral-500">
                  <ShieldCheck size={16} className="text-neutral-900 dark:text-white shrink-0" />
                  <span>
                    {c(
                      "100% Authentic Maison Allocation · Free return up to 7 days",
                      "أصلي ١٠٠٪ مباشرة من دور العطور · إرجاع مجاني حتى 7 أيام",
                    )}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 font-sans">
                  <span className="text-xs uppercase text-neutral-400 tracking-wider">
                    {c("Total Settled:", "المجموع الكلي:")}
                  </span>
                  <PriceDisplay price={orderData.totalAmount} locale={locale} size="lg" />
                </div>
              </div>
            </div>
          )}

          {/* 6. Chronological Order Updates Feed */}
          {Array.isArray(orderData.events) && orderData.events.length > 0 && (
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-neutral-900 dark:text-white" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 dark:text-white">
                    {c("DISPATCH LOG & TIMELINE", "سجل التحديثات المباشرة")}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {orderData.events.length} {c("Milestones", "تحديثات")}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {orderData.events.map((evt: any, idx: number) => {
                  const isLatest = idx === 0;
                  const dateObj = new Date(evt.timestamp);
                  const formattedTime = dateObj.toLocaleTimeString(
                    locale === "ar" ? "ar-AE" : "en-AE",
                    { hour: "2-digit", minute: "2-digit" },
                  );
                  const formattedDate = dateObj.toLocaleDateString(
                    locale === "ar" ? "ar-AE" : "en-AE",
                    { month: "short", day: "numeric", year: "numeric" },
                  );

                  return (
                    <div
                      key={evt.id || idx}
                      className={`flex items-start gap-3.5 p-3.5 border transition-all rounded-sm ${
                        isLatest
                          ? "border-neutral-900 dark:border-white bg-[#FAFAFA] dark:bg-neutral-900/60"
                          : "border-neutral-100 dark:border-neutral-800/80 bg-transparent opacity-75"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isLatest
                              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                              : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      <div className="flex-1 space-y-0.5 text-start min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {c(evt.titleEn, evt.titleAr)}
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {formattedTime} · {formattedDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          {c(evt.descriptionEn, evt.descriptionAr)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Action Footer & Concierge Assistance (Level Shoes Minimalist Standard) */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-start">
              <span className="text-[11px] uppercase font-semibold tracking-wider text-neutral-900 dark:text-white block">
                {c("VIP OLFACTORY CONCIERGE", "المساعد العطري الخاص")}
              </span>
              <p className="text-xs text-neutral-500">
                {c(
                  "Our Dubai concierge is on standby for special delivery instructions or gift customization.",
                  "فريق كونسيرج دبي في خدمتكم لتنسيق أي تعليمات خاصة بالتسليم أو التغليف الفاخر.",
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowReturnModal(true);
                  setReturnSuccessData(null);
                  setReturnError("");
                }}
                className="py-2.5 px-4 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-sm flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={13} />
                <span>{c("Request Return (RMA)", "طلب استرجاع")}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-4 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white text-xs font-medium rounded-sm flex items-center gap-2 transition-colors"
              >
                <Printer size={13} />
                <span>{c("Print Receipt", "طباعة الإيصال")}</span>
              </button>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-medium rounded-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                <MessageSquare size={13} />
                <span>{c("WhatsApp Concierge", "محادثة المستشار")}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. 7-Day Guarantee Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl p-6 sm:p-7 space-y-5 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                  {c("WHITE-GLOVE GUARANTEE POLICY", "سياسة الاسترجاع الفاخرة")}
                </span>
                <h3 className="font-serif text-xl text-neutral-900 dark:text-white">
                  {c("Request Order Return (RMA)", "طلب استرجاع عطر")}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {c("Order:", "رقم الطلب:")} {orderData?.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {returnSuccessData ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg text-neutral-900 dark:text-white">
                    {c("Return Request Registered", "تم تسجيل طلب الاسترجاع بنجاح")}
                  </h4>
                  <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {c("RMA Tracking:", "رمز المتابعة:")} {returnSuccessData.returnNumber || "RET-PENDING"}
                  </p>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  {c(
                    "Our Dubai Atelier team has received your request. A temperature-regulated courier will contact you within 24 hours to schedule the collection of your sealed creation.",
                    "تلقى فريقنا الفني طلبك بنجاح. سيقوم مندوب التوصيل المعتمد بالتواصل معكم خلال 24 ساعة لتنسيق استلام العطر في عبوته الأصلية المختومة.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="py-2 px-6 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs uppercase tracking-wider font-medium rounded-sm"
                >
                  {c("Close Window", "إغلاق")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestReturn} className="space-y-4">
                {returnError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                    {returnError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
                    {c("Return Reason", "سبب الاسترجاع")}
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-2.5 text-xs text-neutral-900 dark:text-white rounded focus:outline-none"
                  >
                    <option value="Pristine Sealed Flacon (Changed Mind)">
                      {c("Pristine Sealed Flacon (Changed Mind)", "العبوة أصلية ومختومة (تغيير الرأي)")}
                    </option>
                    <option value="Defective Atomizer or Leakage">
                      {c("Defective Atomizer or Flacon Leakage", "خلل في الرشاش أو تسريب في الزجاجة")}
                    </option>
                    <option value="Incorrect Fragrance Received">
                      {c("Incorrect Fragrance Received", "استلام عطر مختلف عن الطلب")}
                    </option>
                    <option value="Olfactory Sensitivity or Gift Exchange">
                      {c("Olfactory Sensitivity / Gift Exchange", "حساسية عطرية / استبدال هدية")}
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
                    {c("Preferred Action", "الإجراء المطلوب")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "REFUND", labelEn: "Refund to Card", labelAr: "استرداد للبطاقة" },
                      { id: "STORE_CREDIT", labelEn: "Store Credit", labelAr: "رصيد متجر" },
                      { id: "REPLACEMENT", labelEn: "Flacon Exchange", labelAr: "استبدال العطر" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReturnAction(opt.id as any)}
                        className={`p-2 text-xs rounded border text-center transition-colors ${
                          returnAction === opt.id
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        }`}
                      >
                        {c(opt.labelEn, opt.labelAr)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
                    {c("Additional Notes (Optional)", "ملاحظات إضافية (اختياري)")}
                  </label>
                  <textarea
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder={c(
                      "Details for our warehouse inspection station...",
                      "أي تفاصيل تود إضافتها لفريق الفحص في المستودع...",
                    )}
                    className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-2.5 text-xs text-neutral-900 dark:text-white rounded focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    disabled={returnSubmitting}
                    className="py-2 px-4 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    {c("Cancel", "إلغاء")}
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="py-2 px-6 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium uppercase tracking-wider rounded flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {returnSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{c("Submitting RMA…", "جاري الإرسال…")}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} />
                        <span>{c("Submit Return Request", "تأكيد طلب الاسترجاع")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}