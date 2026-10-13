"use client";

import React, { useState } from "react";
import { useRouter } from "../../../navigation";
import { Button, PriceDisplay } from "@muschio/ui";
import { Lock, CreditCard } from "lucide-react";
import { useCart } from "../../../context/cart-context";
import { muschioApi } from "../../../lib/api";

export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { items, subtotal, shipping, total: totalAmount, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"TABBY" | "TAMARA" | "CARD">("TABBY");
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    stateOrEmirate: "",
    country: "AE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setCheckoutError(isAr ? "سلة التسوق فارغة." : "Your cart is empty.");
      return;
    }
    setCheckoutError(null);
    setLoading(true);

    try {
      // 1. Attempt server-authoritative checkout via Express API
      const result = await muschioApi.submitCheckout({
        cartId: "00000000-0000-0000-0000-000000000001",
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.address,
          city: formData.city,
          stateOrEmirate: formData.stateOrEmirate,
          country: formData.country,
        },
        paymentMethod: paymentMethod === "CARD" ? "CREDIT_CARD" : paymentMethod,
        currency: "AED",
      });

      if (result && result.orderNumber) {
        clearCart();
        router.push(`/order-confirmation/${result.orderNumber}`);
        return;
      }
      throw new Error("No confirmed order was returned.");
    } catch (e) {
      setCheckoutError(isAr ? "تعذر تأكيد الطلب. لم يتم إنشاء طلب مؤكد. يرجى المحاولة مرة أخرى." : "We couldn't confirm your order. Your cart is safe; please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-sans text-emerald-600 font-semibold uppercase tracking-widest">
          <Lock size={14} />
          <span>{isAr ? "دفع مشفر وآمن 256-bit" : "256-bit Encrypted Checkout"}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "إتمام الشراء السريع" : "Express Luxury Checkout"}
        </h1>
      </div>

      {checkoutError && <p role="alert" className="border border-red-400 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-200">{checkoutError}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Checkout Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Contact & Shipping */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 space-y-6">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              {isAr ? "بيانات التوصيل" : "1. Shipping & Contact Details"}
            </h2>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                  {isAr ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                    {isAr ? "رقم الهاتف (الخليج)" : "Phone Number (GCC)"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                  {isAr ? "العنوان والشارع" : "Delivery Address & Building"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                    {isAr ? "المدينة / الإمارة" : "City / Emirate"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-zinc-500 mb-1.5">
                    {isAr ? "الدولة" : "Country"}
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-11 px-3 bg-luxury-canvas border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-accent"
                  >
                    <option value="AE">United Arab Emirates (الإمارات)</option>
                    <option value="SA">Saudi Arabia (السعودية)</option>
                    <option value="QA">Qatar (قطر)</option>
                    <option value="KW">Kuwait (الكويت)</option>
                    <option value="BH">Bahrain (البحرين)</option>
                    <option value="OM">Oman (عُمان)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 space-y-6">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              {isAr ? "طريقة الدفع" : "2. Payment Method"}
            </h2>

            <div className="space-y-3">
              {/* Tabby Option */}
              <label
                onClick={() => setPaymentMethod("TABBY")}
                className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                  paymentMethod === "TABBY"
                    ? "border-accent bg-accent/5 dark:bg-accent/10"
                    : "border-zinc-300 dark:border-zinc-700 bg-luxury-canvas hover:border-zinc-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#3EFEBA] text-zinc-950 font-bold text-xs">
                      tabby
                    </span>
                    <span className="text-xs font-semibold font-sans">
                      {isAr ? "تابي — قسّمها على 4 دفعات شهرية" : "Tabby — Split into 4 monthly payments"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {isAr
                      ? `قيمة القسط التقريبية: ${(totalAmount / 4).toFixed(2)} درهم. تخضع لشروط مقدم الخدمة.`
                      : `Estimated installment: ${(totalAmount / 4).toFixed(2)} AED. Subject to provider approval and terms.`}
                  </p>
                </div>
                <input type="radio" checked={paymentMethod === "TABBY"} readOnly className="mt-1" />
              </label>

              {/* Tamara Option */}
              <label
                onClick={() => setPaymentMethod("TAMARA")}
                className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                  paymentMethod === "TAMARA"
                    ? "border-accent bg-accent/5 dark:bg-accent/10"
                    : "border-zinc-300 dark:border-zinc-700 bg-luxury-canvas hover:border-zinc-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FF8F70] text-zinc-950 font-bold text-xs">
                      tamara
                    </span>
                    <span className="text-xs font-semibold font-sans">
                      {isAr ? "تمارا — قسّم على 4 دفعات بدون فوائد" : "Tamara — Split in 4 interest-free payments"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {isAr ? "متوافق مع أحكام الشريعة الإسلامية بالكامل." : "100% Sharia compliant installment program."}
                  </p>
                </div>
                <input type="radio" checked={paymentMethod === "TAMARA"} readOnly className="mt-1" />
              </label>

              {/* Card / Apple Pay Option */}
              <label
                onClick={() => setPaymentMethod("CARD")}
                className={`flex items-start justify-between p-4 border cursor-pointer transition-all ${
                  paymentMethod === "CARD"
                    ? "border-accent bg-accent/5 dark:bg-accent/10"
                    : "border-zinc-300 dark:border-zinc-700 bg-luxury-canvas hover:border-zinc-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-zinc-700 dark:text-zinc-300" />
                    <span className="text-xs font-semibold font-sans">
                      {isAr ? "البطاقة الائتمانية / Apple Pay" : "Credit Card / Apple Pay / Mada"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {isAr ? "دفع فوري آمن ومباشر." : "Instant and secure one-click checkout."}
                  </p>
                </div>
                <input type="radio" checked={paymentMethod === "CARD"} readOnly className="mt-1" />
              </label>
            </div>
          </div>
        </div>

        {/* Order Review & Submit (5 cols) */}
        <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 space-y-6">
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            {isAr ? "الطلب المحدد" : "Your Order"}
          </h2>

            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    {isAr ? item.titleAr : item.title}
                  </span>
                  <span className="text-zinc-500">
                    {item.sizeLabel || "Standard"} × {item.quantity}
                  </span>
                </div>
                <PriceDisplay price={item.price * item.quantity} locale={locale} size="sm" />
              </div>
            ))}

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <PriceDisplay price={subtotal} locale={locale} size="sm" />
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{isAr ? "الشحن الفاخر المبرد" : "Express GCC Delivery"}</span>
                <span className="text-emerald-600 font-medium">
                  {shipping === 0 ? (isAr ? "مجاني" : "Complimentary") : `${shipping} AED`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>{isAr ? "المجموع الكلي" : "Total Payable"}</span>
                <PriceDisplay price={totalAmount} locale={locale} size="lg" />
              </div>
            </div>

          <Button type="submit" variant="accent" size="lg" disabled={loading || items.length === 0} className="w-full h-14">
            {loading ? (
              isAr ? "جاري حجز المخزون وتأكيد الطلب..." : "Reserving Inventory & Securing Order..."
            ) : (
              isAr ? "تأكيد الطلب والدفع الفاخر" : "Confirm & Authorize Payment"
            )}
          </Button>

          <div className="text-center text-[10px] text-zinc-400 font-sans space-y-1">
            <p>{isAr ? "يتم حجز المخزون حصرياً لمدة 15 دقيقة لضمان طلبك." : "Stock is locked transactionally for 15 minutes to guarantee allocation."}</p>
          </div>
        </div>
      </form>
    </div>
  );
}
