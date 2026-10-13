"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "../../../navigation";
import { useCart } from "../../../context/cart-context";
import { muschioApi } from "../../../lib/api";
import { DeliveryPanel } from "../../../components/delivery-panel";
import { PriceDisplay } from "@muschio/ui";
import { StorefrontOrderSchema } from "@muschio/types";

export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);
  const { items, subtotal, shipping: baseShipping } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    stateOrEmirate: "",
    country: "AE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<
    "loading" | "ready" | "unavailable"
  >("loading");
  const [delivery, setDelivery] = useState<{ id?: string; fee?: number }>({});
  const selectDelivery = useCallback(
    (id?: string, fee?: number) => setDelivery({ id, fee }),
    [],
  );
  const shipping = delivery.fee ?? baseShipping;
  const fields = [
    ["fullName", c("Full name", "الاسم الكامل"), "text", "name"],
    ["email", c("Email", "البريد الإلكتروني"), "email", "email"],
    ["phone", c("Phone", "رقم الهاتف"), "tel", "tel"],
    [
      "addressLine1",
      c("Street, building and apartment", "الشارع والمبنى والشقة"),
      "text",
      "street-address",
    ],
    ["city", c("City", "المدينة"), "text", "address-level2"],
    [
      "stateOrEmirate",
      c("State / emirate", "الإمارة / المنطقة"),
      "text",
      "address-level1",
    ],
  ] as const;
  useEffect(() => {
    let active = true;
    muschioApi.getPaymentAvailability().then((result) => {
      if (active)
        setAvailability(
          result?.methods.includes("CREDIT_CARD") ? "ready" : "unavailable",
        );
    });
    return () => {
      active = false;
    };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !items.length || availability !== "ready") return;
    setLoading(true);
    setError("");
    try {
      if (
        items.some(
          (item) =>
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              item.variantId,
            ),
        )
      )
        throw new Error("Live catalog required");
      const signature = JSON.stringify(
        items.map((item) => ({ id: item.variantId, quantity: item.quantity })),
      );
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify({ signature, form, deliveryId: delivery.id }),
        ),
      );
      const fingerprint = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const saved = localStorage.getItem("muschio_pending_order");
      let order = null;
      if (saved) {
        try {
          const pending = JSON.parse(saved);
          if (
            pending.fingerprint === fingerprint &&
            typeof pending.orderNumber === "string"
          )
            order = await muschioApi.getOrder(pending.orderNumber);
          if (order && !["PENDING", "PAYMENT_PENDING"].includes(order.status))
            throw new Error("Existing order cannot accept payment");
        } catch {
          throw new Error("Review your pending order before retrying checkout");
        }
      }
      if (!order) {
        let serverCart = await muschioApi.getCart();
        if (!serverCart) throw new Error("Checkout unavailable");
        for (const item of serverCart.items)
          if (!(await muschioApi.updateCartItem(item.id, 0)))
            throw new Error("Cart update failed");
        for (const item of items) {
          serverCart = await muschioApi.addToCart({
            variantId: item.variantId,
            quantity: item.quantity,
          });
          if (!serverCart) throw new Error("Availability not confirmed");
        }
        const result = await muschioApi.submitCheckout({
          cartId: serverCart.id,
          shippingAddress: form,
          deliveryServiceId: delivery.id,
          paymentMethod: "CREDIT_CARD",
          currency: "AED",
        });
        const parsed = StorefrontOrderSchema.safeParse(result);
        if (!parsed.success) throw new Error("Order not accepted");
        order = parsed.data;
        localStorage.setItem(
          "muschio_pending_order",
          JSON.stringify({
            orderNumber: order.orderNumber,
            fingerprint,
            signature,
          }),
        );
      }
      const origin = window.location.origin;
      const session = await muschioApi.initiatePaymentSession({
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        method: "CREDIT_CARD",
        returnUrl: `${origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}`,
        cancelUrl: `${origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}?payment=cancelled`,
        customerEmail: form.email,
        customerPhone: form.phone,
      });
      if (!session?.redirectUrl) throw new Error("Payment unavailable");
      const redirect = new URL(session.redirectUrl);
      if (
        redirect.protocol !== "https:" ||
        redirect.hostname !== "checkout.stripe.com"
      )
        throw new Error("Invalid payment redirect");
      window.location.assign(redirect.toString());
    } catch {
      setError(
        c(
          "Payment could not be started. Your bag is saved. If an order was created, use its status page before retrying.",
          "تعذر بدء الدفع. حقيبتك محفوظة. إذا تم إنشاء طلب، فتحقق من صفحة حالته قبل المحاولة مجدداً.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }
  if (!items.length)
    return (
      <div className="editorial-section text-center space-y-6">
        <h1 className="font-serif text-4xl">
          {c("Your bag is empty", "حقيبتك فارغة")}
        </h1>
        <Link className="editorial-button" href="/shop">
          {c("Explore fragrances", "استكشف العطور")}
        </Link>
      </div>
    );
  return (
    <div className="editorial-section">
      <span className="eyebrow">
        {c("YOUR NEXT DISCOVERY", "اكتشافك التالي")}
      </span>
      <h1 className="font-serif text-5xl mt-3 mb-10">
        {c("A few details, then it’s yours.", "بعض التفاصيل، ثم يصبح لك.")}
      </h1>
      <form
        onSubmit={submit}
        className="grid lg:grid-cols-12 gap-10 items-start"
      >
        <div className="lg:col-span-7 space-y-7">
          <section className="delivery-panel">
            <h2>{c("1. Contact & address", "١. بيانات الاتصال والعنوان")}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {fields.map(([key, label, type, autocomplete]) => (
                <div
                  key={key}
                  className={key === "addressLine1" ? "sm:col-span-2" : ""}
                >
                  <label htmlFor={key} className="block text-sm mb-2">
                    {label}
                  </label>
                  <input
                    id={key}
                    type={type}
                    autoComplete={autocomplete}
                    required
                    minLength={
                      key === "phone"
                        ? 8
                        : key === "fullName"
                          ? 2
                          : key === "addressLine1"
                            ? 3
                            : 1
                    }
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                    className="glass-input w-full p-3"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="country" className="block text-sm mb-2">
                  {c("Country", "الدولة")}
                </label>
                <select
                  id="country"
                  autoComplete="country"
                  value={form.country}
                  onChange={(event) => {
                    setForm({ ...form, country: event.target.value });
                    selectDelivery();
                  }}
                  className="glass-input w-full p-3"
                >
                  {[
                    ["AE", c("United Arab Emirates", "الإمارات")],
                    ["SA", c("Saudi Arabia", "السعودية")],
                    ["QA", c("Qatar", "قطر")],
                    ["KW", c("Kuwait", "الكويت")],
                    ["BH", c("Bahrain", "البحرين")],
                    ["OM", c("Oman", "عمان")],
                  ].map(([value, name]) => (
                    <option value={value} key={value}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
          <DeliveryPanel
            country={form.country}
            subtotal={subtotal}
            locale={locale}
            onSelect={selectDelivery}
          />
          <section className="delivery-panel">
            <h2>{c("2. Secure payment", "٢. دفع آمن")}</h2>
            <p className="text-sm leading-7" role="status">
              {availability === "loading"
                ? c(
                    "Checking payment availability…",
                    "جارٍ التحقق من توفر الدفع…",
                  )
                : availability === "ready"
                  ? c(
                      "You’ll continue to Stripe Checkout to enter your card details. Muschio does not collect card numbers.",
                      "ستنتقل إلى Stripe Checkout لإدخال بيانات البطاقة. لا يجمع موسكيو أرقام البطاقات.",
                    )
                  : c(
                      "Online payments are not available yet. Your bag will stay saved while payment setup is completed.",
                      "الدفع عبر الإنترنت غير متاح بعد. ستبقى حقيبتك محفوظة حتى اكتمال إعداد الدفع.",
                    )}
            </p>
          </section>
        </div>
        <aside className="lg:col-span-5 delivery-panel lg:sticky lg:top-44">
          <h2>{c("Your bag", "حقيبتك")}</h2>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 border-b border-luxury-border py-5"
            >
              <div>
                <span className="eyebrow">{item.brand}</span>
                <p className="font-serif text-xl">
                  {ar ? item.titleAr : item.title}
                </p>
                <p className="text-xs mt-2">
                  {item.sizeLabel} × {item.quantity}
                </p>
              </div>
              <PriceDisplay
                price={item.price * item.quantity}
                locale={locale}
                size="sm"
              />
            </div>
          ))}
          <div className="flex justify-between mt-6 text-sm">
            <span>{c("Subtotal", "المجموع الفرعي")}</span>
            <PriceDisplay price={subtotal} locale={locale} size="sm" />
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span>{c("Estimated delivery", "التوصيل التقديري")}</span>
            <PriceDisplay price={shipping} locale={locale} size="sm" />
          </div>
          <div className="flex justify-between mt-6 border-t border-luxury-border pt-5">
            <span>{c("Estimated total", "المجموع التقديري")}</span>
            <PriceDisplay price={subtotal + shipping} locale={locale} />
          </div>
          <p className="text-xs my-5">
            {c(
              "Prices, stock, and delivery are verified before payment. No payment is confirmed until the provider verifies it.",
              "يتم التحقق من الأسعار والمخزون والتوصيل قبل الدفع. لا يتم تأكيد الدفع حتى يتحقق منه مزود الخدمة.",
            )}
          </p>
          {error && (
            <p
              role="alert"
              className="text-red-700 dark:text-red-300 text-sm mb-5"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || availability !== "ready"}
            className="editorial-button w-full disabled:opacity-50"
          >
            {loading
              ? c("Preparing secure checkout…", "جارٍ تجهيز الدفع الآمن…")
              : c("Continue to Stripe Checkout", "متابعة إلى Stripe Checkout")}
          </button>
          <Link href="/cart" className="editorial-text-link mt-5">
            {c("Edit your bag", "تعديل الحقيبة")}
          </Link>
        </aside>
      </form>
    </div>
  );
}
