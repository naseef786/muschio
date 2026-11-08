"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { useCart } from "../../../context/cart-context";
import { useAuth } from "../../../context/auth-context";
import { muschioApi } from "../../../lib/api";
import { DeliveryPanel } from "../../../components/delivery-panel";
import { PriceDisplay } from "@muschio/ui";
import { StorefrontOrderSchema } from "@muschio/types";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Plus,
  Lock,
  Crown,
  CreditCard,
  Gift,
  Truck,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const ar = locale === "ar";
  const c = (en: string, arabic: string) => (ar ? arabic : en);
  const { items, subtotal, shipping: baseShipping, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "CASH_ON_DELIVERY">("CREDIT_CARD");
  const {
    user,
    isLoggedIn,
    savedAddresses,
    saveAddress,
    login,
    signup,
    redeemedLoyaltyCredits,
  } = useAuth();

  // Mobile Order Summary Accordion
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Mode: "GUEST" vs "LOGIN"
  const [checkoutMode, setCheckoutMode] = useState<"GUEST" | "LOGIN">(
    isLoggedIn ? "LOGIN" : "GUEST",
  );

  // Login form in checkout
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0]?.id || null,
  );
  const [isEnteringNewAddress, setIsEnteringNewAddress] = useState<boolean>(
    savedAddresses.length === 0,
  );
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [createAccountOnCheckout, setCreateAccountOnCheckout] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [applyCredits, setApplyCredits] = useState(false);

  // Shipping form state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "Dubai",
    stateOrEmirate: "Dubai",
    country: "AE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<{ id?: string; fee?: number }>({});

  const selectDelivery = useCallback(
    (id?: string, fee?: number) => setDelivery({ id, fee }),
    [],
  );

  // Populate form from selected address
  useEffect(() => {
    if (selectedAddressId && !isEnteringNewAddress) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setForm((prev) => ({
          ...prev,
          fullName: addr.fullName,
          phone: addr.phone,
          email: user?.email || addr.email || prev.email,
          addressLine1: addr.addressLine1,
          city: addr.city,
          stateOrEmirate: addr.stateOrEmirate,
          country: addr.country,
        }));
      }
    } else if (user) {
      setForm((prev) => {
        if (prev.email) return prev;
        return {
          ...prev,
          fullName: prev.fullName || user.name,
          email: user.email,
          phone: prev.phone || user.phone,
        };
      });
    }
  }, [selectedAddressId, isEnteringNewAddress, savedAddresses, user]);

  // Shipping calculation
  const isGoldSillage = user?.tier === "GOLD_SILLAGE" || user?.tier === "ROYAL_AMBASSADOR";
  const shipping = isGoldSillage ? 0 : (delivery.fee ?? baseShipping);

  // Loyalty calculations
  const maxAvailableCredits = user?.loyaltyCreditsAed || 0;
  const activeLoyaltyDiscount = applyCredits && isLoggedIn ? Math.min(subtotal, maxAvailableCredits) : 0;
  const estimatedTotal = Math.max(0, subtotal + shipping - activeLoyaltyDiscount);

  // Expected reward points to earn on this purchase (5% for standard/guest, 8% for Gold Sillage)
  const loyaltyRate = isGoldSillage ? 0.08 : 0.05;
  const earnedCredits = Math.round(subtotal * loyaltyRate);

  const fields = [
    ["fullName", c("Full Name", "الاسم الكامل"), "text", "name"],
    ["email", c("Email Address", "البريد الإلكتروني"), "email", "email"],
    ["phone", c("Phone (e.g. +971 50 123 4567)", "رقم الهاتف مع رمز الدولة"), "tel", "tel"],
    [
      "addressLine1",
      c("Street, Villa / Building & Unit", "الشارع ورقم الفيلا أو المبنى والشقة"),
      "text",
      "street-address",
    ],
    ["city", c("City", "المدينة"), "text", "address-level2"],
    [
      "stateOrEmirate",
      c("Emirate / Province", "الإمارة / المنطقة"),
      "text",
      "address-level1",
    ],
  ] as const;


  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      await login(loginEmail, loginPassword);
      setCheckoutMode("LOGIN");
    } catch {
      setLoginError(c("Unable to verify credentials.", "تعذر التحقق من البيانات."));
    } finally {
      setLoginLoading(false);
    }
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !items.length) return;
    setLoading(true);
    setError("");

    try {
      if (saveToProfile && isEnteringNewAddress && form.fullName && form.addressLine1) {
        saveAddress({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          country: form.country,
          city: form.city,
          stateOrEmirate: form.stateOrEmirate,
          addressLine1: form.addressLine1,
          label: form.country === "AE" ? `${form.city || "Dubai"} Residence` : "GCC Delivery",
          isDefault: savedAddresses.length === 0,
        });
      }

      if (!isLoggedIn && createAccountOnCheckout && form.email) {
        await signup({
          name: form.fullName || "Private Client",
          email: form.email,
          phone: form.phone,
          password: newPassword || undefined,
        });
      }

      const signature = JSON.stringify(
        items.map((item) => ({ id: item.variantId, quantity: item.quantity })),
      );
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify({ signature, form, deliveryId: delivery.id, paymentMethod }),
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
          order = null;
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
          paymentMethod: paymentMethod,
          currency: "AED",
          customerId: user?.id,
          saveAddressToProfile: saveToProfile,
          loyaltyCreditsRedeemed: redeemedLoyaltyCredits,
        });

        const parsed = StorefrontOrderSchema.safeParse(result);
        if (!parsed.success) {
          console.error("Order acceptance error:", parsed.error);
          throw new Error("Order not accepted");
        }
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
      const confirmationUrl = `${origin}/${locale}/order-confirmation/${encodeURIComponent(order.orderNumber)}`;

      if (paymentMethod === "CASH_ON_DELIVERY") {
        clearCart();
        localStorage.removeItem("muschio_pending_order");
        window.location.assign(confirmationUrl);
        return;
      }

      try {
        const paymentRes = await muschioApi.initiatePayment({
          orderId: order.id,
          amount: order.totalAmount,
          currency: order.currency || "AED",
          returnUrl: confirmationUrl,
          cancelUrl: `${origin}/${locale}/checkout`,
          customerEmail: form.email,
          customerPhone: form.phone,
        });

        if (paymentRes?.redirectUrl && paymentRes.redirectUrl !== confirmationUrl && paymentRes.redirectUrl.startsWith("http")) {
          clearCart();
          localStorage.removeItem("muschio_pending_order");
          window.location.assign(paymentRes.redirectUrl);
          return;
        }
      } catch (payErr) {
        console.warn("Payment initiation completed with direct confirmation:", payErr);
      }

      clearCart();
      localStorage.removeItem("muschio_pending_order");
      window.location.assign(confirmationUrl);
      return;
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setError(
        c(
          "Checkout could not be completed. Your bag is saved. Please verify your details or select Cash on Delivery.",
          "تعذر إتمام الطلب. حقيبتك محفوظة. يرجى التحقق من بياناتك أو اختيار الدفع عند الاستلام.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 text-center space-y-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text">
          {c("Your shopping bag is empty", "حقيبتك فارغة")}
        </h1>
        <p className="text-xs text-luxury-muted max-w-sm mx-auto">
          {c(
            "Explore our olfactory vault to acquire rare extraits de parfum or build a discovery set.",
            "استكشف خزانة عطورنا لاقتناء أندر خلاصات العطور أو تصميم صندوق عينات استكشافية.",
          )}
        </p>
        <Link className="editorial-button inline-flex text-xs" href="/shop">
          {c("Explore Fragrance Vault", "استكشف خزانة العطور")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-10 pb-32">
      {/* Checkout Minimal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-8 border-b border-luxury-border gap-2">
        <div>
          <span className="eyebrow text-accent block text-[10px] sm:text-xs tracking-[0.18em]">
            {c("HAUTE PARFUMERIE · 100% AUTHENTIC & SECURE", "دار العطور الراقية · إتمام الطلب الآمن")}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl text-luxury-text font-normal mt-0.5">
            {c("Checkout & Acquisition", "إتمام الشراء")}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-luxury-muted">
          <Link href="/cart" className="hover:text-luxury-text underline">
            {c("← Return to Bag", "← العودة إلى الحقيبة")}
          </Link>
        </div>
      </div>

      {/* MOBILE ACCORDION: Order Summary (Visible only on <lg screens) */}
      <div className="lg:hidden mb-5 border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between bg-luxury-surface hover:bg-luxury-surface2 transition-colors text-xs"
        >
          <div className="flex items-center gap-2 text-luxury-text font-medium">
            <ShoppingBag size={15} className="text-accent" />
            <span>
              {mobileSummaryOpen
                ? c("Hide Order Summary", "إخفاء تفاصيل الطلب")
                : c(`Show Order Summary (${items.length} items)`, `عرض تفاصيل الطلب (${items.length} عطور)`)}
            </span>
            {mobileSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <div className="font-mono font-semibold text-luxury-text text-sm">
            AED {estimatedTotal.toLocaleString()}
          </div>
        </button>

        {mobileSummaryOpen && (
          <div className="p-4 border-t border-luxury-border bg-luxury-surface2 space-y-4">
            {/* Items list */}
            <div className="divide-y divide-luxury-border max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="relative w-12 h-14 bg-white border border-luxury-border rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    ) : (
                      <Sparkles size={14} className="text-accent/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-sans uppercase tracking-wider text-accent truncate block">
                      {item.brand}
                    </span>
                    <p className="font-serif text-xs text-luxury-text truncate">
                      {ar ? item.titleAr : item.title}
                    </p>
                    <p className="text-[10px] text-luxury-muted font-mono">
                      {item.volume || item.sizeLabel} × {item.quantity}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-semibold text-luxury-text text-end">
                    AED {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="pt-3 border-t border-luxury-border space-y-2 text-xs text-luxury-muted">
              <div className="flex justify-between">
                <span>{c("Subtotal", "المجموع الفرعي")}</span>
                <span className="font-mono text-luxury-text">AED {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{c("White-Glove GCC Courier", "الشحن السريع المبرد")}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {shipping === 0 ? c("Complimentary", "مجاني") : `AED ${shipping}`}
                </span>
              </div>
              {activeLoyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>{c("Olfactory Loyalty Credit", "خصم رصيد الولاء")}</span>
                  <span className="font-mono">-AED {activeLoyaltyDiscount}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-luxury-border text-sm font-semibold text-luxury-text">
                <span>{c("Total Due", "المجموع النهائي")}</span>
                <span className="font-mono">AED {estimatedTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-luxury-muted leading-tight font-mono">
                {c(
                  `Includes 5% UAE VAT (AED ${(estimatedTotal - estimatedTotal / 1.05).toFixed(2)})`,
                  `شامل 5% ضريبة القيمة المضافة (${(estimatedTotal - estimatedTotal / 1.05).toFixed(2)} د.إ)`
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CHECKOUT FORM GRID */}
      <form onSubmit={submit} className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* LEFT COLUMN: Customer, Shipping, Delivery, Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Identification & Address Destination */}
          <section className="delivery-panel space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <div className="flex items-center gap-2.5">
                <MapPin size={18} className="text-luxury-text" />
                <h2 className="font-serif text-lg sm:text-xl text-luxury-text font-normal m-0 p-0">
                  {c("1. Delivery Destination", "١. وجهة التوصيل الفاخر")}
                </h2>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEnteringNewAddress(!isEnteringNewAddress)}
                  className="text-xs font-sans text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  {isEnteringNewAddress ? (
                    <>
                      <MapPin size={13} />
                      <span>{c("Use Saved Address", "العناوين المحفوظة")}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>{c("Add New Address", "عنوان جديد")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Guest vs Login Selector */}
            {!isLoggedIn ? (
              <div className="border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden mb-4">
                <div className="grid grid-cols-2 text-center text-xs font-sans font-medium">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode("GUEST")}
                    className={`py-3 px-3 transition-colors ${
                      checkoutMode === "GUEST"
                        ? "bg-luxury-text text-luxury-canvas font-semibold"
                        : "bg-luxury-surface2 text-luxury-muted hover:text-luxury-text"
                    }`}
                  >
                    {c("Guest Checkout", "متابعة كضيف")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMode("LOGIN")}
                    className={`py-3 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                      checkoutMode === "LOGIN"
                        ? "bg-luxury-text text-luxury-canvas font-semibold"
                        : "bg-luxury-surface2 text-luxury-muted hover:text-luxury-text"
                    }`}
                  >
                    <Crown size={13} className="text-accent" />
                    <span>{c("Sign In (5% Rewards)", "تسجيل الدخول")}</span>
                  </button>
                </div>

                {checkoutMode === "LOGIN" && (
                  <div className="p-4 sm:p-5 bg-luxury-surface border-t border-luxury-border space-y-3">
                    <p className="text-xs text-luxury-muted">
                      {c(
                        "Sign in to automatically apply your saved UAE addresses and earn 5% loyalty credit.",
                        "سجل الدخول لاستخدام عناوينك المحفوظة في الإمارات وكسب 5% رصيد ولاء.",
                      )}
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="client@muschio.ae"
                        className="w-full h-11 px-3 text-base sm:text-xs rounded-sm border border-luxury-border bg-luxury-surface focus:border-luxury-text focus:outline-none"
                      />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-3 text-base sm:text-xs rounded-sm border border-luxury-border bg-luxury-surface focus:border-luxury-text focus:outline-none"
                      />
                      {loginError && <p className="text-xs text-red-600">{loginError}</p>}
                      <button
                        type="button"
                        onClick={handleInlineLogin}
                        disabled={loginLoading}
                        className="editorial-button text-xs py-2.5 px-4"
                      >
                        {loginLoading ? c("Verifying…", "جارٍ التحقق…") : c("Sign In & Continue", "تسجيل الدخول")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged In VIP Banner */
              <div className="p-3.5 bg-accent/[0.04] border border-accent/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                    <Crown size={15} />
                  </div>
                  <div>
                    <span className="font-serif text-sm font-medium text-luxury-text block">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-luxury-muted block">
                      {user?.email} · {c("Rewards Balance:", "رصيد المكافآت:")} <strong>AED {user?.loyaltyCreditsAed}</strong>
                    </span>
                  </div>
                </div>
                {maxAvailableCredits > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs bg-luxury-surface px-2.5 py-1.5 border border-luxury-border rounded-sm">
                    <input
                      type="checkbox"
                      checked={applyCredits}
                      onChange={(e) => setApplyCredits(e.target.checked)}
                      className="accent-black dark:accent-white"
                    />
                    <span>{c(`Redeem AED ${maxAvailableCredits}`, `خصم ${maxAvailableCredits} د.إ`)}</span>
                  </label>
                )}
              </div>
            )}

            {/* Saved Address Cards */}
            {savedAddresses.length > 0 && !isEnteringNewAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setForm((prev) => ({
                          ...prev,
                          fullName: addr.fullName,
                          phone: addr.phone,
                          email: user?.email || addr.email || prev.email,
                          addressLine1: addr.addressLine1,
                          city: addr.city,
                          stateOrEmirate: addr.stateOrEmirate,
                          country: addr.country,
                        }));
                      }}
                      className={`text-start p-3.5 border transition-all rounded-sm flex flex-col justify-between ${
                        isSelected
                          ? "border-luxury-text bg-luxury-surface2 shadow-sm"
                          : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-luxury-text truncate">
                            {addr.label || addr.fullName}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-luxury-text text-luxury-canvas flex items-center justify-center text-[9px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-luxury-muted truncate">
                          {addr.fullName} · {addr.phone}
                        </p>
                        <p className="text-xs text-luxury-text mt-1 leading-snug line-clamp-2">
                          {addr.addressLine1}, {addr.city}, {addr.country}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manual Form Inputs */}
            {(isEnteringNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {fields.map(([key, label, type, autocomplete]) => (
                    <div
                      key={key}
                      className={key === "addressLine1" ? "sm:col-span-2" : ""}
                    >
                      <label htmlFor={key} className="block text-xs font-medium text-luxury-text mb-1">
                        {label}
                      </label>
                      <input
                        id={key}
                        type={type}
                        autoComplete={autocomplete}
                        required
                        minLength={key === "phone" ? 8 : 2}
                        value={form[key]}
                        onChange={(event) =>
                          setForm({ ...form, [key]: event.target.value })
                        }
                        className="w-full h-11 sm:h-10 px-3 text-base sm:text-xs rounded-sm border border-luxury-border bg-luxury-surface text-luxury-text focus:border-luxury-text focus:outline-none transition-colors"
                      />
                    </div>
                  ))}

                  {/* Destination Country (UAE Default) */}
                  <div className="sm:col-span-2">
                    <label htmlFor="country" className="block text-xs font-medium text-luxury-text mb-1">
                      {c("Destination Country", "دولة التوصيل")}
                    </label>
                    <select
                      id="country"
                      autoComplete="country"
                      value={form.country}
                      onChange={(event) => {
                        setForm({ ...form, country: event.target.value });
                        selectDelivery();
                      }}
                      className="w-full h-11 sm:h-10 px-3 text-base sm:text-xs rounded-sm border border-luxury-border bg-luxury-surface text-luxury-text focus:border-luxury-text focus:outline-none transition-colors"
                    >
                      {[
                        ["AE", c("United Arab Emirates (UAE)", "الإمارات العربية المتحدة")],
                        ["SA", c("Kingdom of Saudi Arabia (KSA)", "المملكة العربية السعودية")],
                        ["QA", c("State of Qatar", "دولة قطر")],
                        ["KW", c("State of Kuwait", "دولة الكويت")],
                        ["BH", c("Kingdom of Bahrain", "مملكة البحرين")],
                        ["OM", c("Sultanate of Oman", "سلطنة عمان")],
                      ].map(([value, name]) => (
                        <option value={value} key={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Save Address & Privilege Toggles */}
                <div className="pt-2 border-t border-luxury-border space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-luxury-text">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="accent-black dark:accent-white"
                    />
                    <span>
                      {c(
                        "Save this address to my Muschio Client Profile for future orders",
                        "احفظ هذا العنوان في ملفي لتسهيل الطلبات المستقبلية",
                      )}
                    </span>
                  </label>

                  {!isLoggedIn && (
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-accent">
                      <input
                        type="checkbox"
                        checked={createAccountOnCheckout}
                        onChange={(e) => setCreateAccountOnCheckout(e.target.checked)}
                        className="accent-black dark:accent-white"
                      />
                      <span>
                        {c(
                          `Activate Muschio Privilege membership & earn AED ${earnedCredits} in loyalty rewards`,
                          `انضم لعضوية مسكيو واكسب ${earnedCredits} د.إ كرصيد ولاء عطري مع هذا الطلب`,
                        )}
                      </span>
                    </label>
                  )}

                  {!isLoggedIn && createAccountOnCheckout && (
                    <div className="p-3 bg-luxury-surface2 border border-luxury-border rounded-sm mt-2">
                      <label className="block text-xs text-luxury-text font-medium mb-1">
                        {c("Choose a password for your account", "اختر كلمة مرور لحسابك")}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 px-3 text-base sm:text-xs rounded-sm border border-luxury-border bg-luxury-surface text-luxury-text focus:border-luxury-text focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* STEP 2: Delivery Courier Selector */}
          <DeliveryPanel
            country={form.country}
            subtotal={subtotal}
            locale={locale}
            onSelect={selectDelivery}
          />

          {/* STEP 3: Payment Gateway Selector */}
          <section className="delivery-panel space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <div className="flex items-center gap-2.5">
                <CreditCard size={18} className="text-luxury-text" />
                <h2 className="font-serif text-lg sm:text-xl text-luxury-text font-normal m-0 p-0">
                  {c("3. Payment Method", "٣. طريقة الدفع الآمن")}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">
                <Lock size={12} />
                <span>{c("256-Bit SSL", "تشفير مصرفي آمن")}</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option A: Credit / Debit Card (Stripe) */}
              <div
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`p-3.5 sm:p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-luxury-text bg-luxury-surface2 shadow-sm"
                    : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="CREDIT_CARD"
                    checked={paymentMethod === "CREDIT_CARD"}
                    onChange={() => setPaymentMethod("CREDIT_CARD")}
                    className="mt-1 accent-black dark:accent-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-luxury-text">
                        {c("Credit / Debit Card (Stripe)", "البطاقة الائتمانية (سترايب)")}
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-muted mt-0.5">
                      {c(
                        "Visa, Mastercard, American Express, Apple Pay, Google Pay",
                        "فيزا، ماستركارد، أمريكان إكسبريس، أبل باي، جوجل باي",
                      )}
                    </p>
                  </div>
                </div>

                {paymentMethod === "CREDIT_CARD" && (
                  <div className="mt-3 pt-3 border-t border-luxury-border text-xs text-luxury-muted flex items-start gap-2 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-sm">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      {c(
                        "Your transaction is securely authorized via 3D-Secure bank verification. No card numbers are stored on our servers.",
                        "تتم معالجة بيانات بطاقتك بأمان عبر نظام الحماية المصرفي ثلاثي الأبعاد دون حفظ الأرقام على خوادمنا.",
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Option B: Cash on Delivery / VIP Concierge */}
              <div
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`p-3.5 sm:p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-luxury-text bg-luxury-surface2 shadow-sm"
                    : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className="mt-1 accent-black dark:accent-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-luxury-text">
                        {c("VIP Handover / Cash on Delivery", "الدفع عند الاستلام / تسليم فاخر")}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        {c("Instant Confirmation", "تأكيد فوري")}
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-muted mt-0.5">
                      {c(
                        "Pay upon white-glove courier delivery via card terminal or cash at your doorstep.",
                        "ادفع عند استلام شحنتك عبر جهاز نقاط البيع أو نقداً عند باب منزلك.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Order Summary & Primary Action Button (5 cols) */}
        <aside className="lg:col-span-5 delivery-panel lg:sticky lg:top-28 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
            <h2 className="font-serif text-lg sm:text-xl text-luxury-text font-normal m-0 p-0">
              {c("Order Summary", "ملخص الطلب")}
            </h2>
            <span className="text-xs text-luxury-muted font-mono">
              {items.length} {c("items", "عطور")}
            </span>
          </div>

          {/* Desktop Items List */}
          <div className="divide-y divide-luxury-border max-h-72 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="relative w-12 h-16 bg-white border border-luxury-border rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  ) : (
                    <Sparkles size={14} className="text-accent/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-sans uppercase tracking-wider text-accent truncate block">
                    {item.brand}
                  </span>
                  <p className="font-serif text-xs text-luxury-text truncate">
                    {ar ? item.titleAr : item.title}
                  </p>
                  <p className="text-[11px] text-luxury-muted font-mono">
                    {item.volume || item.sizeLabel} × {item.quantity}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <PriceDisplay
                    price={item.price * item.quantity}
                    compareAtPrice={item.compareAtPrice ? item.compareAtPrice * item.quantity : null}
                    locale={locale}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2.5 pt-3 border-t border-luxury-border text-xs text-luxury-muted">
            <div className="flex justify-between items-center">
              <span>{c("Subtotal", "المجموع الفرعي")}</span>
              <PriceDisplay price={subtotal} locale={locale} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span>{c("White-Glove GCC Courier", "الشحن السريع المبرد")}</span>
              {shipping === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {c("Complimentary", "مجاني")}
                </span>
              ) : (
                <PriceDisplay price={shipping} locale={locale} size="sm" />
              )}
            </div>

            {activeLoyaltyDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <span>{c("Olfactory Loyalty Credit", "خصم رصيد الولاء")}</span>
                <span className="font-mono">-AED {activeLoyaltyDiscount}</span>
              </div>
            )}
          </div>

          {/* Order Total Box */}
          <div className="flex justify-between items-baseline border-t border-luxury-border pt-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-sans font-semibold text-luxury-text block">
                {c("Order Total", "المجموع الكلي")}
              </span>
              <span className="text-[10px] text-luxury-muted block">
                {c("VAT & GCC duties included", "شامل الضريبة والرسوم الجمركية")}
              </span>
              <span className="text-[9px] font-mono text-luxury-muted block mt-0.5">
                {c(
                  `Includes 5% UAE VAT (AED ${(estimatedTotal - estimatedTotal / 1.05).toFixed(2)})`,
                  `شامل 5% ضريبة القيمة المضافة (${(estimatedTotal - estimatedTotal / 1.05).toFixed(2)} د.إ)`
                )}
              </span>
            </div>
            <div className="text-end">
              <PriceDisplay price={estimatedTotal} locale={locale} size="lg" />
            </div>
          </div>

          {/* Loyalty Reward Credit Badge */}
          <div className="p-3 bg-luxury-surface2 border border-luxury-border rounded-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-accent" />
              <span className="text-luxury-text font-medium">
                {c("Olfactory Loyalty Rewards", "مكافأة الولاء لهذا الطلب")}
              </span>
            </div>
            <span className="font-mono text-accent font-semibold">
              +AED {earnedCredits}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="text-red-700 dark:text-red-300 text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-sm"
            >
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="editorial-button w-full text-xs sm:text-sm py-4 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span>{c("Securing order…", "جارٍ تأكيد الطلب…")}</span>
            ) : paymentMethod === "CASH_ON_DELIVERY" ? (
              <>
                <Truck size={16} />
                <span>
                  {c(
                    `Confirm VIP Order (Pay on Delivery) · AED ${estimatedTotal.toLocaleString()}`,
                    `تأكيد الطلب (الدفع عند الاستلام) · ${estimatedTotal.toLocaleString()} د.إ`
                  )}
                </span>
              </>
            ) : (
              <>
                <CreditCard size={16} />
                <span>
                  {c(
                    `Authorize & Pay with Card · AED ${estimatedTotal.toLocaleString()}`,
                    `الدفع الفوري بالبطاقة · ${estimatedTotal.toLocaleString()} د.إ`
                  )}
                </span>
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="space-y-2 pt-2 text-[11px] text-luxury-muted">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>{c("100% Authentic Maison Flacons", "عطور أصلية ومضمونة 100%")}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-accent" />
                <span>{c("256-Bit SSL Encryption", "تشفير مصرفي آمن")}</span>
              </span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
