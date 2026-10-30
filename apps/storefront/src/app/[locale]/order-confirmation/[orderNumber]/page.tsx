"use client";

import { useCallback, useEffect, useState } from "react";
import { StorefrontOrder } from "@muschio/types";
import { PriceDisplay } from "@muschio/ui";
import { Link } from "../../../../navigation";
import { muschioApi } from "../../../../lib/api";
import { useCart } from "../../../../context/cart-context";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Lock,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function OrderStatusPage({
  params: { locale, orderNumber },
}: {
  params: { locale: "en" | "ar"; orderNumber: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);
  const [order, setOrder] = useState<StorefrontOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const cart = useCart();

  // In-Place Card Payment Modal State
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [processingCard, setProcessingCard] = useState(false);

  const refresh = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const result = await muschioApi.getOrder(orderNumber);
        if (result) {
          setOrder(result);
        }
      } catch {
        if (!isSilent) setOrder(null);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [orderNumber],
  );

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  // Real-time automatic background synchronization every 3.5 seconds
  useEffect(() => {
    if (!orderNumber) return;
    const isTerminal = order?.status === "DELIVERED" || order?.status === "CANCELLED";
    if (isTerminal) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void refresh(true);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [orderNumber, order?.status, refresh]);

  const status = order?.status || "PENDING";
  const isPaid =
    order?.paymentStatus === "CAPTURED" ||
    ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(status);
  const cancelled = status === "CANCELLED" || status === "PAYMENT_FAILED";

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct In-Place Card Payment Execution
  const handleCardCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || processingCard) return;
    setProcessingCard(true);
    setPaymentError("");

    try {
      const result = await muschioApi.chargeCardPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        cardNumber,
        cardExp,
        cardCvc,
        cardHolder: cardHolder || "Sultan Al-Nuaimi",
      });

      if (result && result.success && result.order) {
        setOrder(result.order);
        setShowCardModal(false);
        setPaymentSuccess(
          c(
            "Payment of AED " +
              Number(order.totalAmount).toLocaleString() +
              " successfully captured! Your acquisition is now in Atelier preparation.",
            "تم تأكيد وسحب مبلغ " +
              Number(order.totalAmount).toLocaleString() +
              " درهم بنجاح! طلبك الآن قيد الفحص والتجهيز الملكي.",
          ),
        );
      } else {
        throw new Error(result?.error || "Card payment could not be authorized");
      }
    } catch (err: any) {
      setPaymentError(
        err?.message ||
          c(
            "Payment could not be completed. Please check your card numbers or try the instant test card.",
            "تعذر إتمام عملية الدفع. يرجى التحقق من بيانات البطاقة أو استخدام البطاقة الاختبارية.",
          ),
      );
    } finally {
      setProcessingCard(false);
    }
  };

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardExp("12/28");
    setCardCvc("123");
    setCardHolder("Sultan Al-Nuaimi");
  };

  useEffect(() => {
    if (!isPaid || !order) return;
    try {
      cart.clearCart();
      localStorage.removeItem("muschio_pending_order");
    } catch {}
  }, [isPaid, order, cart]);

  useEffect(() => {
    if (!cancelled || !order) return;
    try {
      localStorage.removeItem("muschio_pending_order");
    } catch {}
  }, [cancelled, order]);

  // Dynamic delivery progression step derived directly from order status
  const currentStep = !order
    ? 0
    : status === "DELIVERED"
      ? 4
      : status === "SHIPPED"
        ? 3
        : ["FULFILLING", "PAID"].includes(status)
          ? 2
          : 1;

  const timelineSteps = [
    {
      num: 1,
      titleEn: "Order Registered",
      titleAr: "تسجيل الطلب",
      descEn: "Atelier reservation logged",
      descAr: "حجز الطلب في الدار",
      icon: Clock,
    },
    {
      num: 2,
      titleEn: "Atelier Preparation",
      titleAr: "التجهيز والتغليف",
      descEn: "Batch verified & hand-sealed",
      descAr: "فحص الدفعة والتغليف الملكي",
      icon: PackageCheck,
    },
    {
      num: 3,
      titleEn: "Climate Transit",
      titleAr: "الشحن المبرد",
      descEn: "Temperature-controlled air express",
      descAr: "شحن جوي مبرد وسريع",
      icon: Truck,
    },
    {
      num: 4,
      titleEn: "White-Glove Handover",
      titleAr: "التسليم الفاخر",
      descEn: "GCC doorstep delivery",
      descAr: "التسليم حتى باب العميل",
      icon: Sparkles,
    },
  ];

  const whatsappInquiryUrl =
    "https://wa.me/97148006872?text=" +
    encodeURIComponent(
      isAr
        ? `مرحباً بمستشار مسكيو، أود الاستفسار عن طلبي رقم: ${order?.orderNumber || orderNumber}`
        : `Hello Muschio Concierge, I would like to inquire regarding my order #${order?.orderNumber || orderNumber}`,
    );

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10 sm:space-y-12">
      {/* Header Banner */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-10 text-start space-y-4 rounded-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-luxury-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow text-accent">
              {c("HAUTE PARFUMERIE · CLIENT RECEIPT", "دار العطور الراقية · إيصال العميل المعتمد")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              {c("LIVE SYNC ACTIVE", "تحديث مباشر نشط")}
            </span>
          </div>
          {order && (
            <div className="flex items-center gap-2 bg-luxury-surface2 px-3 py-1.5 border border-luxury-border">
              <span className="text-[11px] font-sans font-medium text-luxury-muted">
                {c("Ref:", "الرقم المرجعي:")}
              </span>
              <span className="font-mono text-xs text-luxury-text font-semibold">
                {order.orderNumber}
              </span>
              <button
                type="button"
                onClick={copyOrderNumber}
                aria-label="Copy order reference"
                className="text-luxury-muted hover:text-accent transition-colors p-0.5"
                title={c("Copy reference", "نسخ الرقم المرجعي")}
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 pt-2">
          {loading ? (
            <div className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center flex-shrink-0 animate-spin">
              <RefreshCw size={20} className="text-accent" />
            </div>
          ) : isPaid ? (
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
          ) : cancelled ? (
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-600">
              <Clock size={22} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-600">
              <Clock size={22} />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
              {loading
                ? c("Verifying your order status…", "جارٍ التحقق من تفاصيل طلبك…")
                : !order
                  ? c("Order reference not found.", "تعذر التحقق من هذا الطلب.")
                  : cancelled
                    ? c("This order is cancelled. Your bag is saved.", "هذا الطلب ملغي. حقيبتك محفوظة.")
                    : status === "DELIVERED"
                      ? c("Order Delivered. Handover confirmed.", "تم تسليم طلبك بنجاح وبأعلى معايير الخدمة.")
                      : status === "SHIPPED"
                        ? c("Acquisition in Transit. Climate courier dispatched.", "طلبك في الطريق عبر الشحن الجوي المبرد.")
                        : status === "FULFILLING"
                          ? c("Atelier Preparation. Packaging & batch sealing underway.", "يجري الآن فحص الأختام والتغليف الفاخر في الدار.")
                          : isPaid
                            ? c("Thank you. Your acquisition is confirmed & paid.", "شكراً لك. تم تأكيد ودفع طلبك بنجاح.")
                            : c("Order placed. VIP delivery reservation confirmed.", "تم تسجيل طلبك بنجاح. حجز التوصيل مؤكد.")}
            </h1>
            <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">
              {isPaid
                ? c(
                    "Your authentic flacons have been reserved at the master atelier. Quality seals and temperature-controlled dispatch are underway.",
                    "تم حجز زجاجاتك الأصلية لدى الدار المتخصصة. يجري الآن فحص الأختام والتجهيز للشحن المبرد السريع.",
                  )
                : c(
                    "Receipt details are synced with our Dubai operations center in real time. Payment authorization updates automatically.",
                    "يتم تحديث تفاصيل الإيصال مباشرة مع مركز عمليات مسكيو بدبي فور تأكيد العملية.",
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {paymentSuccess && (
        <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs rounded-sm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* Real-Time Dispatch Notice (Email & WhatsApp Active) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-luxury-surface border border-luxury-border flex items-center gap-3 rounded-sm">
          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-luxury-text shrink-0">
            <Mail size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-luxury-text">
              {c("Email Confirmation Dispatched", "تم إرسال إشعار التأكيد عبر البريد")}
            </div>
            <div className="text-[11px] text-luxury-muted truncate">
              {c("Receipt and flacon breakdown sent to your inbox", "تم إرسال الفاتورة وتفاصيل العطور إلى بريدك")}
            </div>
          </div>
        </div>

        <div className="p-4 bg-luxury-surface border border-luxury-border flex items-center justify-between gap-3 rounded-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#128C7E]/10 border border-[#128C7E]/30 flex items-center justify-center text-[#128C7E] shrink-0">
              <MessageSquare size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-luxury-text">
                {c("WhatsApp Tracking Updates", "تحديثات الشحن عبر واتساب")}
              </div>
              <div className="text-[11px] text-luxury-muted truncate">
                {c("Direct alerts sent to registered mobile", "تحديثات المسار تصل إلى رقم هاتفك")}
              </div>
            </div>
          </div>
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#128C7E] hover:bg-[#0c6b60] text-white text-[11px] font-medium rounded-sm flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>{c("Open Chat", "محادثة")}</span>
            <ArrowRight size={11} className="rtl:rotate-180" />
          </a>
        </div>
      </div>

      {/* 4-Step GCC Fulfillment Timeline */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="eyebrow text-accent">
            {c("GCC LOGISTICS & ATELIER PROGRESSION", "مراحل الشحن والتجهيز للخليج العربي")}
          </span>
          <Link
            href={`/track?ref=${encodeURIComponent(order?.orderNumber || orderNumber)}`}
            className="text-xs font-sans text-accent hover:underline flex items-center gap-1 font-medium"
          >
            <span>{c("Open Full Tracker", "فتح لوحة التتبع الكاملة")}</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
          {timelineSteps.map((step) => {
            const isCompleted = currentStep >= step.num;
            const isCurrent = currentStep === step.num;
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-4 border transition-all ${
                  isCurrent
                    ? "border-accent bg-luxury-surface2 shadow-sm"
                    : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                      : "border-luxury-border opacity-50"
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
                <h2 className="text-xs font-sans font-semibold text-luxury-text uppercase tracking-wider">
                  {c(step.titleEn, step.titleAr)}
                </h2>
                <p className="text-[11px] text-luxury-muted mt-1 leading-snug">
                  {c(step.descEn, step.descAr)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items Breakdown & Financial Summary */}
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List */}
          <div className="lg:col-span-7 border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <span className="eyebrow">
                {c("ACQUIRED CREATIONS", "القطع المقتناة")}
              </span>
              <span className="text-xs text-luxury-muted">
                {order.items.length}{" "}
                {c(
                  order.items.length === 1 ? "Item" : "Items",
                  order.items.length === 1 ? "عطر" : "عطور",
                )}
              </span>
            </div>

            <div className="divide-y divide-luxury-border">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="relative w-16 h-20 bg-luxury-surface2 border border-luxury-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Sparkles size={18} className="text-accent/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-luxury-muted block">
                      {c("Muschio Selection", "مختارات مسكيو")}
                    </span>
                    <h2 className="font-serif text-base sm:text-lg text-luxury-text truncate">
                      {c(item.productNameEn, item.productNameAr)}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-luxury-muted mt-1">
                      <span>{item.sizeLabel || "Standard Flacon"}</span>
                      <span>×</span>
                      <span className="font-mono text-luxury-text">{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <PriceDisplay price={item.totalPrice} locale={locale} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-luxury-border flex items-center gap-2 text-xs text-luxury-muted">
              <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
              <span>
                {c(
                  "Includes complimentary 2ml test vial & official Certificate of Authenticity.",
                  "مرفق عينة ٢ مل مجانية للتجربة مع شهادة الأصالة الرسمية المعتمدة.",
                )}
              </span>
            </div>
          </div>

          {/* Financial Breakdown & Concierge Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-4">
              <span className="eyebrow block border-b border-luxury-border pb-3">
                {c("RECEIPT SUMMARY", "ملخص الإيصال")}
              </span>

              <div className="space-y-3 text-xs text-luxury-muted">
                <div className="flex justify-between">
                  <span>{c("Subtotal", "المجموع الفرعي")}</span>
                  <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>{c("White-Glove GCC Express Shipping", "الشحن السريع المبرد")}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {c("Complimentary", "مجاني")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{c("Authenticity Vault Inspection", "فحص الأختام الرسمية")}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {c("Included", "مشمول")}
                  </span>
                </div>
              </div>

              <div className="border-t border-luxury-border pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-sans font-medium text-luxury-text block">
                    {isPaid ? c("Total Settled", "المجموع المدفوع") : c("Total Due", "المجموع المطلوب")}
                  </span>
                  <span className="text-[10px] text-luxury-muted">
                    {c("VAT & Custom Duties Included", "شامل ضريبة القيمة المضافة والرسوم")}
                  </span>
                </div>
                <PriceDisplay price={order.totalAmount} locale={locale} />
              </div>

              {/* Status details */}
              <div className="mt-4 pt-4 border-t border-luxury-border flex items-center justify-between text-xs">
                <span className="text-luxury-muted">{c("Payment Status", "حالة الدفع")}:</span>
                <span
                  className={`px-2 py-0.5 rounded-sm font-medium text-[11px] uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {isPaid
                    ? c("Captured & Verified", "مؤكد ومسجل")
                    : c("Pay on Delivery / Pending", "الدفع عند الاستلام / بانتظار التأكيد")}
                </span>
              </div>
            </div>

            {/* VIP Concierge Support Card */}
            <div className="border border-luxury-border bg-luxury-surface2 p-6 rounded-sm space-y-3">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-accent block">
                {c("VIP OLFACTORY CONCIERGE", "المساعد العطري الخاص")}
              </span>
              <p className="text-xs text-luxury-muted leading-relaxed">
                {c(
                  "Need custom gift wrapping, private courier scheduling, or batch certification? Our team is available directly.",
                  "هل ترغب بتغليف خاص للإهداء أو جدولة موعد التسليم؟ فريقنا في خدمتك على مدار الساعة.",
                )}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#128C7E] hover:bg-[#0c6b60] text-white text-xs font-medium rounded-sm transition-colors"
                >
                  <span>{c("WhatsApp Concierge Support", "محادثة المستشار عبر واتساب")}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification if any */}
      {paymentError && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-700 text-xs rounded-sm flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Bottom Action CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-luxury-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refresh(false)}
            disabled={loading}
            className="editorial-button-secondary inline-flex items-center gap-2 text-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>{c("Refresh Order Status", "تحديث حالة الطلب")}</span>
          </button>

          {order && !isPaid && !cancelled && (
            <button
              type="button"
              onClick={() => setShowCardModal(true)}
              className="editorial-button inline-flex items-center gap-2 text-xs"
            >
              <CreditCard size={13} />
              <span>{c("Pay Now via Card (Instant)", "الدفع الآن بالبطاقة (فوري)")}</span>
            </button>
          )}

          <Link
            href={`/track?ref=${encodeURIComponent(order?.orderNumber || orderNumber)}`}
            className="editorial-button-secondary inline-flex items-center gap-2 text-xs"
          >
            <Truck size={13} />
            <span>{c("Live Tracking Page", "صفحة التتبع المباشر")}</span>
          </Link>
        </div>

        <Link href="/shop" className="editorial-text-link text-xs inline-flex items-center gap-1">
          <span>{c("Explore More Fragrances", "استكشاف المزيد من العطور")}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* Interactive Luxury Card Payment Modal */}
      {showCardModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-surface border border-luxury-border w-full max-w-md p-6 sm:p-8 rounded-sm space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-luxury-muted hover:text-luxury-text p-1"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="eyebrow text-accent text-[10px]">
                {c("SECURE 256-BIT ENCRYPTED ACQUISITION", "إتمام الدفع المشفر والآمن")}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-luxury-text">
                {c("Card Payment Authorization", "تفويض الدفع بالبطاقة")}
              </h3>
              <p className="text-xs text-luxury-muted">
                {c("Order Ref: ", "رقم الطلب: ")}
                <span className="font-mono text-luxury-text font-semibold">{order.orderNumber}</span> ·{" "}
                <span className="text-accent font-semibold">
                  <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
                </span>
              </p>
            </div>

            <form onSubmit={handleCardCharge} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Cardholder Name", "الاسم على البطاقة")}
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Sultan Al-Nuaimi"
                  className="glass-input w-full p-2.5 text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Card Number", "رقم البطاقة")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="glass-input w-full p-2.5 text-xs font-mono tracking-wider pl-10"
                  />
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1">
                    {c("Expiry (MM/YY)", "تاريخ الانتهاء")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="12/28"
                    className="glass-input w-full p-2.5 text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1">
                    {c("CVC / CVV", "رمز الأمان")}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="•••"
                    className="glass-input w-full p-2.5 text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* 1-Click Test Card Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="w-full text-xs py-2 px-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-sm font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>{c("1-Click Auto-Fill Test Visa Card", "تعبئة سريعة ببطاقة فيزا تجريبية")}</span>
                </button>
              </div>

              {paymentError && (
                <p className="text-xs text-red-600 bg-red-500/10 p-2 rounded-sm border border-red-500/20">
                  {paymentError}
                </p>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={processingCard}
                  className="editorial-button w-full text-xs py-3 flex items-center justify-center gap-2"
                >
                  {processingCard ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>{c("Authorizing with Bank…", "جارٍ الاتصال بالبنك…")}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>
                        {c("Authorize & Pay ", "سداد فوري ")}
                        <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
                      </span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-luxury-muted flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>{c("PCI-DSS Level 1 Encrypted Payment Clearance", "دفع آمن ومعتمد بمعايير PCI-DSS")}</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
