"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
  Printer,
  MapPin,
  Calendar,
  ShoppingBag,
} from "lucide-react";

export default function OrderStatusPage({
  params: { locale, orderNumber },
}: {
  params: { locale: "en" | "ar"; orderNumber: string };
}) {
  const isAr = locale === "ar";
  const c = useCallback((en: string, ar: string) => (isAr ? ar : en), [isAr]);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
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

  // Automatic Stripe Checkout Session Verification
  useEffect(() => {
    if (!sessionId) return;
    let isCancelled = false;

    async function verifyStripePayment() {
      try {
        const res = await muschioApi.verifyPaymentSession(sessionId!);
        if (!isCancelled && res?.paid && res?.order) {
          setOrder(res.order);
          try {
            cart.clearCart();
            localStorage.removeItem("muschio_pending_order");
          } catch {}
          setPaymentSuccess(
            c(
              "Payment successfully confirmed via Stripe! Your acquisition is now in Atelier preparation.",
              "تم تأكيد الدفع بنجاح عبر Stripe! طلبك الآن قيد التجهيز الملكي في المشغل.",
            ),
          );
        }
      } catch (err) {
        console.warn("Stripe session verification error:", err);
      }
    }

    void verifyStripePayment();
    return () => {
      isCancelled = true;
    };
  }, [sessionId, cart, c]);

  const handleLaunchStripeCheckout = async () => {
    if (!order || processingCard) return;
    setProcessingCard(true);
    setPaymentError("");
    try {
      const origin = window.location.origin;
      const session = await muschioApi.initiatePaymentSession({
        orderId: order.id,
        amount: Number(order.totalAmount),
        currency: order.currency || "AED",
        method: "CREDIT_CARD",
        returnUrl: `${origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}`,
        customerEmail: order.shippingAddress?.email || (order as any).customer?.email,
        customerPhone: order.shippingAddress?.phone || (order as any).customer?.phone,
      });

      if (session && session.redirectUrl) {
        window.location.assign(session.redirectUrl);
        return;
      }
      throw new Error(c("Failed to launch secure payment session", "تعذر بدء جلسة الدفع الآمن"));
    } catch (err: any) {
      setPaymentError(err?.message || c("Payment initialization failed", "فشل بدء الدفع"));
    } finally {
      setProcessingCard(false);
    }
  };

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
    if (orderNumber) {
      try {
        localStorage.setItem("muschio_last_order", orderNumber);
      } catch {}
    }
    void refresh(false);
  }, [orderNumber, refresh]);

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
        cardHolder: cardHolder || order.shippingAddress?.fullName || "Cardholder",
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
    setCardHolder(order?.shippingAddress?.fullName || "Private Client");
  };

  useEffect(() => {
    if (!isPaid || !order) return;
    try {
      cart.clearCart();
      localStorage.removeItem("muschio_pending_order");
      localStorage.setItem("muschio_last_order", order.orderNumber);
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
      titleEn: "Order Placed",
      titleAr: "تم استلام الطلب",
      descEn: "Order confirmed & recorded",
      descAr: "تم تأكيد طلبك وتسجيله",
      icon: Clock,
    },
    {
      num: 2,
      titleEn: "Preparing",
      titleAr: "جاري التجهيز",
      descEn: "Inspection & packaging",
      descAr: "فحص وتغليف المنتجات",
      icon: PackageCheck,
    },
    {
      num: 3,
      titleEn: "Dispatched",
      titleAr: "تم الشحن",
      descEn: "En route with Climate Courier",
      descAr: "في الطريق إليك مع الشاحن المبرد",
      icon: Truck,
    },
    {
      num: 4,
      titleEn: "Delivered",
      titleAr: "تم التوصيل",
      descEn: "Handed over to doorstep",
      descAr: "تم تسليم الطلب بنجاح",
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

  const vatAmount = order?.totalAmount
    ? (Number(order.totalAmount) - Number(order.totalAmount) / 1.05).toFixed(2)
    : "0.00";

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 font-sans">
      {/* 1. Minimalist Luxury Breadcrumbs (Level Shoes Pattern) */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 font-sans">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li>
            <Link href="/track" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {c("Track", "تتبع الطلبات")}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li className="text-neutral-900 dark:text-white font-medium">
            {c("Order Confirmation", "تأكيد الطلب")}
          </li>
          {order?.orderNumber && (
            <>
              <li className="text-neutral-300 dark:text-neutral-700">/</li>
              <li className="font-mono text-neutral-500 truncate max-w-[200px]">
                {order.orderNumber}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* 2. Editorial Header Banner */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
              {c("HAUTE PARFUMERIE · OFFICIAL CLIENT RECEIPT", "دار العطور الراقية · إيصال العميل المعتمد")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              {c("LIVE SYNC ACTIVE", "تحديث مباشر نشط")}
            </span>
          </div>

          {order && (
            <div className="flex items-center gap-2 bg-[#FAFAFA] dark:bg-neutral-900 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-sans font-medium text-neutral-400">
                {c("Ref:", "الرقم المرجعي:")}
              </span>
              <span className="font-mono text-xs text-neutral-900 dark:text-white font-semibold">
                {order.orderNumber}
              </span>
              <button
                type="button"
                onClick={copyOrderNumber}
                aria-label="Copy order reference"
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-0.5"
                title={c("Copy reference", "نسخ الرقم المرجعي")}
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 pt-1">
          {loading ? (
            <div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 animate-spin">
              <RefreshCw size={18} className="text-neutral-500" />
            </div>
          ) : isPaid ? (
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          ) : cancelled ? (
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-center shrink-0 text-rose-600">
              <Clock size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-600">
              <Clock size={20} />
            </div>
          )}

          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-white font-normal">
              {loading
                ? c("Checking your order…", "جاري مراجعة طلبك…")
                : !order
                  ? c("Order not found.", "لم يتم العثور على الطلب.")
                  : cancelled
                    ? c("This order was cancelled.", "تم إلغاء هذا الطلب.")
                    : status === "DELIVERED"
                      ? c("Order Delivered Successfully!", "تم تسليم طلبك بنجاح!")
                      : status === "SHIPPED"
                        ? c("Your Order Has Been Dispatched!", "طلبك تم شحنه وهو في الطريق إليك!")
                        : status === "FULFILLING"
                          ? c("We Are Preparing Your Fragrances", "جاري تجهيز وتغليف طلبك")
                          : isPaid
                            ? c("Thank you! Your order is confirmed.", "شكراً لك! تم تأكيد طلبك بنجاح.")
                            : c("Order Placed Successfully", "تم استلام طلبك بنجاح")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              {isPaid
                ? c(
                    "We have received your payment and our master perfumers are packaging your flacons for temperature-regulated delivery.",
                    "تم استلام الدفعة بنجاح ونقوم الآن بتجهيز وفحص عطورك للتوصيل المبرد.",
                  )
                : c(
                    "We have received your order details and will notify you at every milestone of dispatch.",
                    "تم تسجيل طلبك بنجاح وسنوافيك بالتحديثات المباشرة عند كل مرحلة.",
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {paymentSuccess && (
        <div className="p-4 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* Real-Time Dispatch Notice (Email & WhatsApp Active) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3.5 rounded-sm">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
            <Mail size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              {c("Email Confirmation Dispatched", "تم إرسال إشعار التأكيد عبر البريد")}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">
              {order?.customerEmail
                ? `${c("Sent to", "أرسل إلى")} ${order.customerEmail}`
                : c("Receipt and flacon breakdown sent to your inbox", "تم إرسال الفاتورة وتفاصيل العطور إلى بريدك")}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3.5 rounded-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#128C7E]/10 border border-[#128C7E]/30 flex items-center justify-center text-[#128C7E] shrink-0">
              <MessageSquare size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                {c("WhatsApp Tracking Updates", "تحديثات الشحن عبر واتساب")}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {c("Direct alerts sent to your mobile", "تحديثات المسار تصل إلى رقم هاتفك")}
              </div>
            </div>
          </div>
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#0c6b60] text-white text-[11px] font-medium rounded-sm flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>{c("Open Chat", "محادثة")}</span>
            <ArrowRight size={11} className="rtl:rotate-180" />
          </a>
        </div>
      </div>

      {/* 3. Level Shoes Style Connected Progress Stepper */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs uppercase font-sans tracking-[0.16em] font-medium text-neutral-400">
            {c("FULFILLMENT PROGRESS", "مراحل تنفيذ وتسليم الطلب")}
          </span>
          <Link
            href={`/track?ref=${encodeURIComponent(order?.orderNumber || orderNumber)}`}
            className="text-xs font-sans text-neutral-900 dark:text-white hover:underline underline-offset-4 flex items-center gap-1.5 font-medium"
          >
            <span>{c("Open Live Tracker", "فتح شاشة التتبع المباشر")}</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        <div className="relative pt-2 pb-2">
          {/* Connecting Line (desktop) */}
          <div className="hidden sm:block absolute top-6 inset-x-8 h-[2px] bg-neutral-200 dark:bg-neutral-800 z-0">
            <div
              className="h-full bg-neutral-950 dark:bg-white transition-all duration-700 ease-out"
              style={{
                width: `${((Math.max(1, currentStep) - 1) / (timelineSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
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

                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider font-sans">
                    {c(step.titleEn, step.titleAr)}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {c(step.descEn, step.descAr)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Order Items Breakdown & Financial Summary */}
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column (7 cols): Items List + Dispatch Logistics */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 font-sans">
                  {c("ACQUIRED CREATIONS", "القطع المقتناة في هذا الطلب")}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {order.items.length}{" "}
                  {c(
                    order.items.length === 1 ? "Flacon" : "Flacons",
                    order.items.length === 1 ? "عطر" : "عطور",
                  )}
                </span>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {order.items.map((item) => {
                  const itemImage = item.image || "/product-placeholder.svg";
                  const itemSlug = item.slug;

                  return (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* 4:5 Flacon Image Canvas (Level Shoes Style) */}
                        <div className="relative w-16 h-20 bg-[#F8F8F8] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shrink-0 overflow-hidden rounded-sm flex items-center justify-center">
                          <Image
                            src={itemImage}
                            alt={item.productNameEn || "Fragrance Flacon"}
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
                          <h2 className="font-serif text-base text-neutral-900 dark:text-white truncate">
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
                          </h2>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                            <span>{item.sizeLabel || "Standard Flacon"}</span>
                            <span>•</span>
                            <span className="font-mono text-neutral-600 dark:text-neutral-300">
                              Qty: {item.quantity}
                            </span>
                            {item.unitPrice ? (
                              <>
                                <span>•</span>
                                <span className="font-mono text-neutral-500">
                                  AED {Number(item.unitPrice).toLocaleString()} {c("each", "للقطعة")}
                                </span>
                              </>
                            ) : null}
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

              {/* Guarantees Footer */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>
                  {c(
                    "Includes Free return up to 7 days & official Certificate of Authenticity.",
                    "يتضمن إرجاع مجاني حتى 7 أيام وشهادة أصالة رسمية معتمدة من دار العطور.",
                  )}
                </span>
              </div>
            </div>

            {/* Courier Dispatch, Schedule & Address (3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Carrier */}
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 rounded-sm shadow-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Truck size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Climate Courier", "شركة الشحن")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1">
                  {order.carrier || "Muschio GCC Climate Courier"}
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-1.5 pt-1 font-mono text-xs text-neutral-900 dark:text-white">
                    <span>{order.trackingNumber}</span>
                  </div>
                )}
                <div className="text-[10px] text-neutral-400 pt-0.5">
                  {c("Temperature-regulated sealed transit", "مسار مبرد ومحمي بختم المصنع")}
                </div>
              </div>

              {/* Handover Window */}
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 rounded-sm shadow-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Estimated Handover", "الموعد المتوقع")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1">
                  {order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString(isAr ? "ar-AE" : "en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : c("Next 24–48 Hours", "خلال ٢٤ إلى ٤٨ ساعة")}
                </div>
                <div className="text-[10px] text-neutral-400 pt-0.5">
                  {c("White-Glove GCC Delivery", "توصيل فاخر للباب")}
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1 rounded-sm shadow-sm">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <MapPin size={14} className="text-neutral-900 dark:text-white" />
                  <span className="uppercase tracking-wider text-[10px] font-semibold">
                    {c("Destination", "عنوان التوصيل")}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 dark:text-white pt-1 truncate">
                  {order.shippingAddress
                    ? `${order.shippingAddress.city || "Dubai"}, ${order.shippingAddress.country || "United Arab Emirates"}`
                    : c("United Arab Emirates / GCC", "الإمارات العربية المتحدة / الخليج")}
                </div>
                <div className="text-[10px] text-neutral-400 truncate pt-0.5">
                  {order.customerName || "Muschio Client"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Receipt Summary & VIP Concierge */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-sm shadow-sm space-y-4">
              <span className="text-xs uppercase tracking-[0.16em] font-semibold text-neutral-500 font-sans block border-b border-neutral-100 dark:border-neutral-800 pb-3">
                {c("RECEIPT SUMMARY", "ملخص الإيصال")}
              </span>

              <div className="space-y-3 text-xs text-neutral-500">
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

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-sans font-medium text-neutral-900 dark:text-white block">
                    {isPaid ? c("Total Settled", "المجموع المدفوع") : c("Total Due", "المجموع المطلوب")}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    {c("VAT & Custom Duties Included", "شامل ضريبة القيمة المضافة والرسوم")}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                    {c(
                      `Includes 5% UAE VAT (AED ${vatAmount}) · TRN: 100492817200003`,
                      `شامل 5% ضريبة القيمة المضافة (${vatAmount} د.إ) · الرقم الضريبي: 100492817200003`,
                    )}
                  </span>
                </div>
                <PriceDisplay price={order.totalAmount} locale={locale} />
              </div>

              {/* Status badge */}
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400">{c("Payment Status", "حالة الدفع")}:</span>
                <span
                  className={`px-2.5 py-1 text-[11px] font-sans uppercase tracking-wider font-semibold rounded-none border ${
                    isPaid
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isPaid
                    ? c("Captured & Verified", "مؤكد ومسجل")
                    : c("Pay on Delivery / Pending", "الدفع عند الاستلام / بانتظار التأكيد")}
                </span>
              </div>

              {/* Payment Clearance & Settlement Dossier */}
              {(() => {
                const primaryPayment = ((order as any).payments && (order as any).payments[0]) || null;
                const paymentDetails = (order as any).paymentDetails || null;
                const provider = paymentDetails?.provider || primaryPayment?.provider || (isPaid ? "CREDIT_CARD" : "CASH_ON_DELIVERY");
                const isCod = provider === "CASH_ON_DELIVERY";
                const isTabby = provider === "TABBY";
                const isTamara = provider === "TAMARA";
                const cardBrand = paymentDetails?.brand || (primaryPayment?.gatewayReference?.toLowerCase().includes("visa") ? "VISA" : primaryPayment?.gatewayReference?.toLowerCase().includes("mastercard") ? "MASTERCARD" : primaryPayment?.gatewayReference?.toLowerCase().includes("amex") ? "AMEX" : "VISA");
                const cardLast4 = paymentDetails?.last4 || primaryPayment?.gatewayReference?.match(/_(\d{4})_/)?.[1] || "4242";
                const cardHolder = paymentDetails?.cardHolder || order.customerName || null;
                const transactionId = paymentDetails?.gatewayReference || primaryPayment?.gatewayReference || null;

                return (
                  <div className="mt-3 p-3 rounded-sm bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-sans">{c("Settlement Method", "طريقة الدفع")}:</span>
                      <span className="font-mono text-neutral-900 dark:text-white font-medium">
                        {isCod
                          ? c("Cash on Delivery (COD)", "الدفع عند الاستلام نقداً")
                          : isTabby
                            ? c("Tabby · 4 Interest-Free Payments", "تابي · 4 دفعات بدون فوائد")
                            : isTamara
                              ? c("Tamara · 4 Interest-Free Payments", "تمارا · 4 دفعات بدون فوائد")
                              : c("Credit Card (3D Secure)", "بطاقة مصرفية معتمدة")}
                      </span>
                    </div>

                    {isPaid && !isCod && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-neutral-500 font-sans">{c("Card Acquired", "البطاقة المستخدمة")}:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          {cardBrand && (
                            <span className={`text-[9px] px-1 py-0.2 rounded text-white font-bold ${
                              cardBrand === "VISA" ? "bg-blue-600" : cardBrand === "MASTERCARD" ? "bg-red-600" : "bg-neutral-700"
                            }`}>
                              {cardBrand}
                            </span>
                          )}
                          <span className="text-neutral-900 dark:text-white font-semibold">
                            •••• •••• •••• {cardLast4}
                          </span>
                        </div>
                      </div>
                    )}

                    {(isTabby || isTamara) && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-neutral-500 font-sans">{c("Installment Breakdown", "جدول الدفعات")}:</span>
                        <span className="font-mono text-neutral-900 dark:text-white font-semibold">
                          4 × AED {(Number(order.totalAmount) / 4).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {isCod && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-neutral-500 font-sans">{c("Payment Due", "المبلغ المطلوب")}:</span>
                        <span className="font-mono text-neutral-900 dark:text-white font-semibold">
                          AED {Number(order.totalAmount).toLocaleString()} {c("at Doorstep", "عند الاستلام")}
                        </span>
                      </div>
                    )}

                    {cardHolder && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-neutral-500 font-sans">{c("Recipient / Client", "اسم المستلم")}:</span>
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[170px]">
                          {cardHolder}
                        </span>
                      </div>
                    )}

                    {transactionId && (
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                        <span className="text-neutral-400 font-sans">{c("Reference", "الرقم المرجعي")}:</span>
                        <span className="font-mono text-neutral-500 truncate max-w-[160px]" title={transactionId}>
                          {transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Pay Now Button if Unpaid */}
              {order && !isPaid && !cancelled && (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={processingCard}
                    onClick={handleLaunchStripeCheckout}
                    className="w-full py-3 px-4 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm disabled:opacity-50"
                  >
                    <Lock size={14} className="text-accent" />
                    <span>
                      {processingCard
                        ? c("Connecting to Stripe…", "جارٍ الاتصال بـ Stripe…")
                        : c("Pay with Card / Apple Pay (Stripe)", "الدفع بالبطاقة أو Apple Pay (عبر Stripe)")}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* VIP Concierge Support Card */}
            <div className="bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-sm space-y-3 shadow-sm">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-neutral-400 block">
                {c("VIP OLFACTORY CONCIERGE", "المساعد العطري الخاص")}
              </span>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {c(
                  "Need custom gift wrapping, private courier delivery scheduling, or batch certification? Our team is available directly.",
                  "هل ترغب بتغليف خاص للإهداء أو جدولة موعد التسليم؟ فريقنا في خدمتك على مدار الساعة.",
                )}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#128C7E] hover:bg-[#0c6b60] text-white text-xs font-medium rounded-sm transition-colors"
                >
                  <MessageSquare size={14} />
                  <span>{c("WhatsApp Concierge Support", "محادثة المستشار عبر واتساب")}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </a>
              </div>
            </div>

            {/* Print Receipt Action */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="w-full py-2.5 px-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs text-neutral-700 dark:text-neutral-300 font-sans uppercase tracking-wider flex items-center justify-center gap-2 rounded-sm transition-colors"
            >
              <Printer size={13} />
              <span>{c("Print Official Receipt", "طباعة الإيصال الرسمي")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error notification if any */}
      {paymentError && (
        <div className="p-4 border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs rounded-sm flex items-center gap-2.5">
          <AlertCircle size={15} className="shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Bottom Action CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void refresh(false)}
            disabled={loading}
            className="py-2.5 px-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-wider font-medium inline-flex items-center gap-2 rounded-sm transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>{c("Refresh Order Status", "تحديث حالة الطلب")}</span>
          </button>

          <Link
            href={`/track?ref=${encodeURIComponent(order?.orderNumber || orderNumber)}`}
            className="py-2.5 px-4 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs uppercase tracking-wider font-medium inline-flex items-center gap-2 rounded-sm transition-colors"
          >
            <Truck size={13} />
            <span>{c("Live Tracking Page", "صفحة التتبع المباشر")}</span>
          </Link>
        </div>

        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold text-neutral-900 dark:text-white hover:underline underline-offset-4 inline-flex items-center gap-1.5"
        >
          <ShoppingBag size={14} />
          <span>{c("Explore More Fragrances", "استكشاف المزيد من العطور")}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* Interactive Luxury Card Payment Modal */}
      {showCardModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 sm:p-8 rounded-sm space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 end-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                {c("SECURE 256-BIT ENCRYPTED ACQUISITION", "إتمام الدفع المشفر والآمن")}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-white">
                {c("Card Payment Authorization", "تفويض الدفع بالبطاقة")}
              </h3>
              <p className="text-xs text-neutral-500">
                {c("Order Ref: ", "رقم الطلب: ")}
                <span className="font-mono text-neutral-900 dark:text-white font-semibold">
                  {order.orderNumber}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
                </span>
              </p>
            </div>

            <form onSubmit={handleCardCharge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-1.5">
                  {c("Cardholder Name", "الاسم على البطاقة")}
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder={c("e.g. Abdullah Al-Falasi", "مثال: عبد الله الفلاسي")}
                  className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-1.5">
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
                    className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-2.5 ps-10 text-xs font-mono tracking-wider text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
                  />
                  <CreditCard size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-1.5">
                    {c("Expiry (MM/YY)", "تاريخ الانتهاء")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-2.5 text-xs font-mono text-center text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-1.5">
                    {c("CVC / CVV", "رمز الأمان")}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="•••"
                    className="w-full bg-[#FAFAFA] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-2.5 text-xs font-mono text-center text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-sm"
                  />
                </div>
              </div>

              {/* 1-Click Test Card Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="w-full text-xs py-2 px-3 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 rounded-sm font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>{c("1-Click Auto-Fill Test Visa Card", "تعبئة سريعة ببطاقة فيزا تجريبية")}</span>
                </button>
              </div>

              {paymentError && (
                <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-sm border border-rose-200 dark:border-rose-900">
                  {paymentError}
                </p>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={processingCard}
                  className="w-full py-3 px-4 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs uppercase tracking-[0.16em] font-medium transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm disabled:opacity-50"
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

                <p className="text-[10px] text-center text-neutral-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
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
