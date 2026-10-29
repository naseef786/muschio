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
  const [startingPayment, setStartingPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const cart = useCart();

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await muschioApi.getOrder(orderNumber);
    setOrder(result);
    setLoading(false);
  }, [orderNumber]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const paid =
    order?.paymentStatus === "CAPTURED" &&
    ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(order.status);
  const cancelled =
    order?.status === "CANCELLED" || order?.status === "PAYMENT_FAILED";

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function resumePayment() {
    if (!order || startingPayment) return;
    setStartingPayment(true);
    setPaymentError("");
    try {
      const returnUrl = `${window.location.origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}`;
      const result = await muschioApi.initiatePaymentSession({
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        method: "CREDIT_CARD",
        returnUrl,
        cancelUrl: returnUrl + "?payment=cancelled",
      });
      const redirect = new URL(result?.redirectUrl || "");
      if (
        redirect.protocol !== "https:" ||
        redirect.hostname !== "checkout.stripe.com"
      )
        throw new Error("Payment unavailable");
      window.location.assign(redirect.toString());
    } catch {
      setPaymentError(
        c(
          "Payment is unavailable or the inventory hold has expired. Please refresh the order status.",
          "الدفع غير متاح أو انتهت مدة حجز المخزون. يرجى تحديث حالة الطلب.",
        ),
      );
    } finally {
      setStartingPayment(false);
    }
  }

  useEffect(() => {
    if (!paid || !order) return;
    try {
      const pending = JSON.parse(
        localStorage.getItem("muschio_pending_order") || "null",
      );
      const signature = JSON.stringify(
        cart.items.map((item) => ({
          id: item.variantId,
          quantity: item.quantity,
        })),
      );
      if (
        pending?.orderNumber === order.orderNumber &&
        pending?.signature === signature
      ) {
        cart.clearCart();
        localStorage.removeItem("muschio_pending_order");
      }
    } catch {
      /* Storage failures never alter the verified order status. */
    }
  }, [paid, order, cart]);

  useEffect(() => {
    if (!cancelled || !order) return;
    try {
      const pending = JSON.parse(
        localStorage.getItem("muschio_pending_order") || "null",
      );
      if (pending?.orderNumber === order.orderNumber)
        localStorage.removeItem("muschio_pending_order");
    } catch {}
  }, [cancelled, order]);

  // Delivery status step calculator
  const currentStep = !order
    ? 0
    : paid
      ? order.status === "DELIVERED"
        ? 4
        : order.status === "SHIPPED"
          ? 3
          : 2
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
          <div className="flex items-center gap-2">
            <span className="eyebrow text-accent">
              {c("HAUTE PARFUMERIE · CLIENT RECEIPT", "دار العطور الراقية · إيصال العميل المعتمد")}
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
          ) : paid ? (
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
                  : paid
                    ? c("Thank you. Your acquisition is confirmed.", "شكراً لك. تم تأكيد طلبك بنجاح.")
                    : cancelled
                      ? c("This order is closed. Your bag is saved.", "هذا الطلب مغلق. حقيبتك محفوظة.")
                      : c("Order placed. Awaiting payment confirmation.", "تم تسجيل طلبك. بانتظار استكمال عملية الدفع.")}
            </h1>
            <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">
              {paid
                ? c(
                    "Your authentic flacons have been reserved at the master atelier. Quality seals and temperature-controlled dispatch are underway.",
                    "تم حجز زجاجاتك الأصلية لدى الدار المتخصصة. يجري الآن فحص الأختام والتجهيز للشحن المبرد السريع.",
                  )
                : c(
                    "Receipt details are synced in real time. Payment authorization updates automatically upon gateway confirmation.",
                    "يتم تحديث تفاصيل الإيصال مباشرة عند تأكيد البنك لعملية الدفع.",
                  )}
            </p>
          </div>
        </div>
      </div>

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
        <span className="eyebrow block mb-6 text-accent">
          {c("GCC LOGISTICS & ATELIER PROGRESSION", "مراحل الشحن والتجهيز للخليج العربي")}
        </span>

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

            {/* Level Shoes Guarantees in Receipt */}
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
                    {paid ? c("Total Settled", "المجموع المدفوع") : c("Total Due", "المجموع المطلوب")}
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
                    paid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {paid ? c("Captured & Verified", "مؤكد ومدفوع") : c("Pending Authorization", "بانتظار التأكيد")}
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
        <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-700 text-xs rounded-sm">
          {paymentError}
        </div>
      )}

      {/* Bottom Action CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-luxury-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="editorial-button-secondary inline-flex items-center gap-2 text-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>{c("Refresh Order Status", "تحديث حالة الطلب")}</span>
          </button>

          {order && !paid && !cancelled && (
            <button
              type="button"
              onClick={resumePayment}
              disabled={startingPayment}
              className="editorial-button inline-flex items-center gap-2 text-xs"
            >
              <CreditCard size={13} />
              <span>{c("Complete Payment via Stripe", "إتمام الدفع عبر سترايب")}</span>
            </button>
          )}
        </div>

        <Link href="/shop" className="editorial-text-link text-xs inline-flex items-center gap-1">
          <span>{c("Explore More Fragrances", "استكشاف المزيد من العطور")}</span>
          <span>↗</span>
        </Link>
      </div>
    </div>
  );
}

