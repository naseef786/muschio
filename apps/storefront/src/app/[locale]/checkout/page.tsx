"use client";
import { useCallback, useState } from "react";
import { Link, useRouter } from "../../../navigation";
import { useCart } from "../../../context/cart-context";
import { muschioApi } from "../../../lib/api";
import { DeliveryPanel } from "../../../components/delivery-panel";
import { PriceDisplay } from "@muschio/ui";

export default function CheckoutPage({ params: { locale } }: { params: { locale: "en" | "ar" } }) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => ar ? arabic : en;
  const router = useRouter();
  const { items, subtotal, shipping: baseShipping, clearCart } = useCart();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", addressLine1: "", city: "", stateOrEmirate: "", country: "AE" });
  const [method, setMethod] = useState<"CREDIT_CARD" | "TABBY" | "TAMARA">("CREDIT_CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<{ id?: string; fee?: number }>({});
  const selectDelivery = useCallback((id?: string, fee?: number) => setDelivery({ id, fee }), []);
  const shipping = delivery.fee ?? baseShipping;
  const fields = [
    ["fullName", c("Full name", "الاسم الكامل"), "text", "name"],
    ["email", c("Email", "البريد الإلكتروني"), "email", "email"],
    ["phone", c("Phone", "رقم الهاتف"), "tel", "tel"],
    ["addressLine1", c("Street, building and apartment", "الشارع والمبنى والشقة"), "text", "street-address"],
    ["city", c("City", "المدينة"), "text", "address-level2"],
    ["stateOrEmirate", c("State / emirate", "الإمارة / المنطقة"), "text", "address-level1"],
  ] as const;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !items.length) return;
    setLoading(true); setError("");
    try {
      if (items.some(item => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variantId))) throw new Error("Catalog unavailable");
      let session = localStorage.getItem("muschio_guest_session");
      if (!session) { session = crypto.randomUUID(); localStorage.setItem("muschio_guest_session", session); }
      let serverCart = await muschioApi.getCart(session);
      if (!serverCart) throw new Error("Checkout unavailable");
      for (const item of serverCart.items) {
        if (!await muschioApi.updateCartItem(item.id, 0)) throw new Error("Cart update failed");
      }
      for (const item of items) {
        serverCart = await muschioApi.addToCart({ guestSessionId: session, variantId: item.variantId, quantity: item.quantity });
        if (!serverCart) throw new Error("Availability not confirmed");
      }
      const result = await muschioApi.submitCheckout({ cartId: serverCart.id, shippingAddress: form, deliveryServiceId: delivery.id, paymentMethod: method, currency: "AED" });
      if (!result?.orderNumber) throw new Error("Order not confirmed");
      clearCart(); router.push(`/order-confirmation/${result.orderNumber}`);
    } catch { setError(c("Your order could not be confirmed. Your bag is saved. Please try again later.", "لم يتم تأكيد الطلب. حقيبتك محفوظة. يرجى المحاولة لاحقاً.")); }
    finally { setLoading(false); }
  }
  if (!items.length) return <div className="editorial-section text-center space-y-6"><h1 className="font-serif text-4xl">{c("Your bag is empty", "حقيبتك فارغة")}</h1><Link className="editorial-button" href="/shop">{c("Explore fragrances", "استكشف العطور")}</Link></div>;
  return <div className="editorial-section"><span className="eyebrow">{c("YOUR NEXT DISCOVERY", "اكتشافك التالي")}</span><h1 className="font-serif text-5xl mt-3 mb-10">{c("A few details, then it’s yours.", "بعض التفاصيل، ثم يصبح لك.")}</h1>
    <form onSubmit={submit} className="grid lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-7 space-y-7"><section className="delivery-panel"><h2>{c("1. Contact & address", "١. بيانات الاتصال والعنوان")}</h2><div className="grid sm:grid-cols-2 gap-5">{fields.map(([key, label, type, autocomplete]) => <div key={key} className={key === "addressLine1" ? "sm:col-span-2" : ""}><label htmlFor={key} className="block text-sm mb-2">{label}</label><input id={key} type={type} autoComplete={autocomplete} required minLength={key === "phone" ? 8 : key === "fullName" ? 2 : key === "addressLine1" ? 3 : 1} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} className="glass-input w-full p-3" /></div>)}<div className="sm:col-span-2"><label htmlFor="country" className="block text-sm mb-2">{c("Country", "الدولة")}</label><select id="country" autoComplete="country" value={form.country} onChange={event => { setForm({ ...form, country: event.target.value }); selectDelivery(); }} className="glass-input w-full p-3">{[["AE", c("United Arab Emirates", "الإمارات")], ["SA", c("Saudi Arabia", "السعودية")], ["QA", c("Qatar", "قطر")], ["KW", c("Kuwait", "الكويت")], ["BH", c("Bahrain", "البحرين")], ["OM", c("Oman", "عمان")]].map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></div></div></section>
        <DeliveryPanel country={form.country} subtotal={subtotal} locale={locale} onSelect={selectDelivery} />
        <fieldset className="delivery-panel"><legend className="font-serif text-2xl px-2">{c("2. Payment preference", "٢. طريقة الدفع")}</legend>{(["CREDIT_CARD", "TABBY", "TAMARA"] as const).map(value => <label className="flex gap-3 items-center border-b border-luxury-border py-5" key={value}><input type="radio" name="paymentMethod" value={value} checked={method === value} onChange={() => setMethod(value)} /><span>{value === "CREDIT_CARD" ? c("Credit card", "بطاقة ائتمان") : value === "TABBY" ? "Tabby" : "Tamara"}</span></label>)}<p className="text-xs mt-4">{c("Payment availability and terms are confirmed by the provider.", "يتم تأكيد توفر الدفع وشروطه من مزود الخدمة.")}</p></fieldset>
      </div>
      <aside className="lg:col-span-5 delivery-panel lg:sticky lg:top-44"><h2>{c("Your bag", "حقيبتك")}</h2>{items.map(item => <div key={item.id} className="flex justify-between gap-4 border-b border-luxury-border py-5"><div><span className="eyebrow">{item.brand}</span><p className="font-serif text-xl">{ar ? item.titleAr : item.title}</p><p className="text-xs mt-2">{item.sizeLabel} × {item.quantity}</p></div><PriceDisplay price={item.price * item.quantity} locale={locale} size="sm" /></div>)}<div className="flex justify-between mt-6 text-sm"><span>{c("Subtotal", "المجموع الفرعي")}</span><PriceDisplay price={subtotal} locale={locale} size="sm" /></div><div className="flex justify-between mt-4 text-sm"><span>{c("Estimated delivery", "التوصيل التقديري")}</span><PriceDisplay price={shipping} locale={locale} size="sm" /></div><div className="flex justify-between mt-6 border-t border-luxury-border pt-5"><span>{c("Estimated total", "المجموع التقديري")}</span><PriceDisplay price={subtotal + shipping} locale={locale} /></div><p className="text-xs my-5">{c("Prices, stock, and delivery are verified by the server when you submit.", "يتم التحقق من الأسعار والمخزون والتوصيل عند إرسال الطلب.")}</p>{error && <p role="alert" className="text-red-700 dark:text-red-300 text-sm mb-5">{error}</p>}<button type="submit" disabled={loading} className="editorial-button w-full disabled:opacity-50">{loading ? c("Confirming availability…", "جارٍ تأكيد التوفر…") : c("Submit order", "إرسال الطلب")}</button><Link href="/cart" className="editorial-text-link mt-5">{c("Edit your bag", "تعديل الحقيبة")}</Link></aside>
    </form>
  </div>;
}
