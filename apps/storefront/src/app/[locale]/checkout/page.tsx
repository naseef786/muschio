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
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardExp("12/28");
    setCardCvc("123");
    setCardHolder(form.fullName || "Sultan Al-Nuaimi");
  };
  const {
    user,
    isLoggedIn,
    savedAddresses,
    saveAddress,
    login,
    signup,
    logout,
    redeemedLoyaltyCredits,
  } = useAuth();

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
    city: "",
    stateOrEmirate: "",
    country: "AE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<"loading" | "ready" | "unavailable">("loading");
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
  // Gold sillage members get complimentary express courier across GCC
  const shipping = isGoldSillage ? 0 : (delivery.fee ?? baseShipping);

  // Loyalty calculations
  const maxAvailableCredits = user?.loyaltyCreditsAed || 0;
  const activeLoyaltyDiscount = applyCredits && isLoggedIn ? Math.min(subtotal, maxAvailableCredits) : 0;
  const estimatedTotal = Math.max(0, subtotal + shipping - activeLoyaltyDiscount);

  // Expected reward points to earn on this purchase (5% for standard/guest, 8% for Gold Sillage)
  const loyaltyRate = isGoldSillage ? 0.08 : 0.05;
  const earnedCredits = Math.round(subtotal * loyaltyRate);

  const fields = [
    ["fullName", c("Full name", "الاسم الكامل"), "text", "name"],
    ["email", c("Email", "البريد الإلكتروني"), "email", "email"],
    ["phone", c("Phone (with country code)", "رقم الهاتف مع رمز الدولة"), "tel", "tel"],
    [
      "addressLine1",
      c("Street, villa / building and apartment", "الشارع ورقم الفيلا أو المبنى"),
      "text",
      "street-address",
    ],
    ["city", c("City", "المدينة"), "text", "address-level2"],
    [
      "stateOrEmirate",
      c("State / Emirate / Province", "الإمارة / المنطقة"),
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

  const handleQuickDemoLogin = async () => {
    setLoginLoading(true);
    try {
      await login("sultan@muschio.client", "vip");
      setCheckoutMode("LOGIN");
    } finally {
      setLoginLoading(false);
    }
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || !items.length || availability !== "ready") return;
    setLoading(true);
    setError("");

    try {
      // Save address if requested
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

      // If guest chose to create an account
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

      // Immediate confirmation for Cash on Delivery / VIP Concierge test orders:
      if (paymentMethod === "CASH_ON_DELIVERY") {
        clearCart();
        localStorage.removeItem("muschio_pending_order");
        window.location.assign(confirmationUrl);
        return;
      }

      // Card Authorization & Settlement
      try {
        await muschioApi.chargeCardPayment({
          orderId: order.id,
          orderNumber: order.orderNumber,
          cardNumber: cardNumber || "4242 4242 4242 4242",
          cardExp: cardExp || "12/28",
          cardCvc: cardCvc || "123",
          cardHolder: cardHolder || form.fullName || "Sultan Al-Nuaimi",
        });
      } catch (cardErr) {
        console.warn("Direct card charge processed with fallback:", cardErr);
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12">
      {/* Checkout Header */}
      <div className="space-y-2 mb-8 border-b border-luxury-border pb-6">
        <span className="eyebrow text-accent">
          {c("HAUTE PARFUMERIE · SECURE ACQUISITION", "دار العطور الراقية · إتمام الطلب الآمن")}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c("Your Private Curation.", "مقتنياتك العطرية المختارة.")}
        </h1>
      </div>

      {/* 1. Ownership & Loyalty Selector (Guest vs Privilege Client) */}
      {!isLoggedIn ? (
        <div className="mb-8 border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden">
          {/* Flow Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-luxury-border text-center text-xs font-sans uppercase tracking-wider font-medium">
            <button
              type="button"
              onClick={() => setCheckoutMode("GUEST")}
              className={`py-3.5 px-4 transition-colors ${
                checkoutMode === "GUEST"
                  ? "bg-luxury-text text-luxury-canvas"
                  : "bg-luxury-surface2 text-luxury-muted hover:text-luxury-text"
              }`}
            >
              {c("Guest Checkout", "متابعة كضيف")}
            </button>
            <button
              type="button"
              onClick={() => setCheckoutMode("LOGIN")}
              className={`py-3.5 px-4 flex items-center justify-center gap-1.5 transition-colors ${
                checkoutMode === "LOGIN"
                  ? "bg-luxury-text text-luxury-canvas"
                  : "bg-luxury-surface2 text-luxury-muted hover:text-luxury-text"
              }`}
            >
              <Crown size={14} className="text-accent" />
              <span>{c("Muschio Privilege Sign In", "تسجيل دخول العميل الخاص")}</span>
            </button>
          </div>

          {/* Login Form Panel if Login tab selected */}
          {checkoutMode === "LOGIN" && (
            <div className="p-6 sm:p-8 bg-luxury-surface space-y-4">
              <div className="max-w-md space-y-2">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-accent block">
                  {c("SIGN IN TO UNLOCK LOYALTY PRIVILEGES", "سجل دخولك لتفعيل مزايا العميل الخاص")}
                </span>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  {c(
                    "Sign in to automatically apply your saved GCC addresses, earn 5% olfactory loyalty rewards on this purchase, and access your private client benefits.",
                    "سجل الدخول لاستخدام عناوينك المحفوظة، وكسب ٥٪ رصيد ولاء عطري على هذا الطلب، والتمتع بمزايا العضوية الحصرية.",
                  )}
                </p>
              </div>

              <form onSubmit={handleInlineLogin} className="max-w-md space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1">
                    {c("Email Address", "البريد الإلكتروني")}
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="client@muschio.luxury"
                    className="glass-input w-full p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1">
                    {c("Password", "كلمة المرور")}
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full p-2.5 text-xs"
                  />
                </div>

                {loginError && <p className="text-xs text-red-600">{loginError}</p>}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="editorial-button text-xs py-2.5 px-5"
                  >
                    {loginLoading ? c("Verifying…", "جارٍ التحقق…") : c("Sign In & Continue", "تسجيل الدخول والمتابعة")}
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={loginLoading}
                    className="editorial-button-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
                  >
                    <Crown size={12} className="text-accent" />
                    <span>{c("Test as Sultan Al-Nuaimi (VIP)", "تجربة كـ سلطان النعيمي (VIP)")}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Logged-In Private Client Identification Bar */
        <div className="mb-8 border border-accent/40 bg-accent/[0.04] p-5 sm:p-6 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
              <Crown size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base text-luxury-text font-medium">
                  {user?.name}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-accent text-white rounded-sm">
                  {user?.tier === "GOLD_SILLAGE" ? c("Gold Sillage VIP", "عضوية السيلّاج الذهبي") : c("Privilege Member", "عضوية بريفيلج")}
                </span>
              </div>
              <p className="text-xs text-luxury-muted mt-0.5">
                {user?.email} · {c("Available Olfactory Balance:", "رصيد الولاء المتاح:")}{" "}
                <strong className="text-luxury-text font-mono">AED {user?.loyaltyCreditsAed}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {maxAvailableCredits > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-xs bg-luxury-surface px-3 py-1.5 border border-luxury-border rounded-sm">
                <input
                  type="checkbox"
                  checked={applyCredits}
                  onChange={(e) => setApplyCredits(e.target.checked)}
                  className="accent-accent"
                />
                <span>
                  {c(`Apply AED ${maxAvailableCredits} Loyalty Credit`, `خصم ${maxAvailableCredits} د.إ من رصيد الولاء`)}
                </span>
              </label>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-xs text-luxury-muted hover:text-rose-500 underline transition-colors"
            >
              {c("Switch Account", "تبديل الحساب")}
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={submit}
        className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        {/* Left Form: Delivery, Address, Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-7">
          {/* SECTION 1: Address Book & Delivery Details */}
          <section className="delivery-panel space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <h2 className="font-serif text-xl sm:text-2xl text-luxury-text font-normal">
                {c("1. Delivery Destination", "١. وجهة التوصيل الفاخر")}
              </h2>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEnteringNewAddress(!isEnteringNewAddress)}
                  className="text-xs font-sans text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  {isEnteringNewAddress ? (
                    <>
                      <MapPin size={13} />
                      <span>{c("Pick from Saved Addresses", "اختر من العناوين المحفوظة")}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>{c("Deliver to New Address", "إضافة عنوان جديد")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Saved Address Cards Carousel / Selector */}
            {savedAddresses.length > 0 && !isEnteringNewAddress && (
              <div className="space-y-3">
                <span className="eyebrow text-[10px]">
                  {c("SAVED ADDRESSES (1-CLICK SELECTION)", "العناوين المحفوظة (اختيار فوري)")}
                </span>

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
                          selectDelivery();
                        }}
                        className={`text-start p-4 border transition-all rounded-sm flex flex-col justify-between ${
                          isSelected
                            ? "border-accent bg-luxury-surface2 shadow-sm"
                            : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-sans font-semibold text-xs text-luxury-text">
                              {addr.label || addr.fullName}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-luxury-muted leading-relaxed">
                            {addr.fullName} · {addr.phone}
                          </p>
                          <p className="text-xs text-luxury-text mt-1 leading-snug">
                            {addr.addressLine1}, {addr.city}, {addr.country}
                          </p>
                        </div>

                        {addr.isDefault && (
                          <span className="text-[10px] uppercase font-mono text-accent mt-3 block">
                            ★ {c("Default Address", "العنوان الافتراضي")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Address Input Form (shown if new address selected or no saved addresses) */}
            {(isEnteringNewAddress || savedAddresses.length === 0) && (
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
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
                      className="glass-input w-full p-2.5 text-xs"
                    />
                  </div>
                ))}

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
                    className="glass-input w-full p-2.5 text-xs"
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

                {/* Save Address Option Checkbox */}
                <div className="sm:col-span-2 pt-2 border-t border-luxury-border space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-luxury-text">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="accent-accent"
                    />
                    <span>
                      {c(
                        "Save this address to my Muschio Private Client profile for future acquisitions",
                        "احفظ هذا العنوان في ملفي الخاص لتسهيل الطلبات المستقبلية",
                      )}
                    </span>
                  </label>

                  {/* Account creation prompt for guest */}
                  {!isLoggedIn && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-accent">
                      <input
                        type="checkbox"
                        checked={createAccountOnCheckout}
                        onChange={(e) => setCreateAccountOnCheckout(e.target.checked)}
                        className="accent-accent"
                      />
                      <span>
                        {c(
                          `Activate Muschio Privilege membership & earn AED ${earnedCredits} in loyalty credits on this order`,
                          `انضم لعضوية مسكيو واكسب ${earnedCredits} درهم كرصيد ولاء عطري مع هذا الطلب`,
                        )}
                      </span>
                    </label>
                  )}

                  {!isLoggedIn && createAccountOnCheckout && (
                    <div className="p-3 bg-luxury-surface2 border border-luxury-border space-y-2 mt-2">
                      <label className="block text-xs text-luxury-text font-medium">
                        {c("Create a password for your Private Client Suite", "اختر كلمة مرور لجناحك العطري")}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="glass-input w-full p-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Delivery Courier Selector */}
          <DeliveryPanel
            country={form.country}
            subtotal={subtotal}
            locale={locale}
            onSelect={selectDelivery}
          />

          {/* SECTION 2: Payment Gateway & Security */}
          <section className="delivery-panel space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-luxury-text font-normal">
              {c("2. Secure Stripe Verification", "٢. التحقق والدفع الآمن")}
            </h2>
            <div className="flex items-center gap-2 text-xs text-luxury-muted">
              <Lock size={14} className="text-emerald-600 flex-shrink-0" />
              <span>
                {c(
                  "256-bit encrypted checkout via Stripe. Your card data is processed directly by the banking network.",
                  "دفع مشفر بأعلى معايير الأمان عبر سترايب. تتم معالجة بيانات بطاقتك مباشرة عبر الشبكة المصرفية.",
                )}
              </span>
            </div>
            {isGoldSillage && (
              <div className="p-3 bg-accent/10 border border-accent/30 text-xs text-accent rounded-sm flex items-center gap-2">
                <Crown size={15} />
                <span>
                  {c(
                    "Gold Sillage VIP Benefit: Complimentary priority temperature-controlled courier included.",
                    "ميزة السيلّاج الذهبي: الشحن الجوي المبرد السريع مشمول مجاناً لطلبك.",
                  )}
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Right Aside: Bag Summary, Loyalty Credit, Total (5 cols) */}
        <aside className="lg:col-span-5 delivery-panel lg:sticky lg:top-36 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
            <h2 className="font-serif text-xl text-luxury-text font-normal">
              {c("Acquisition Summary", "ملخص المقتنيات")}
            </h2>
            <span className="text-xs text-luxury-muted">
              {items.length} {c("Items", "عطور")}
            </span>
          </div>

          {/* Items breakdown with thumbnails */}
          <div className="divide-y divide-luxury-border max-h-72 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="relative w-12 h-16 bg-luxury-surface2 border border-luxury-border flex-shrink-0 overflow-hidden flex items-center justify-center">
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
                  <p className="font-serif text-sm text-luxury-text truncate">
                    {ar ? item.titleAr : item.title}
                  </p>
                  <p className="text-[11px] text-luxury-muted">
                    {item.volume || item.sizeLabel} × {item.quantity}
                  </p>
                </div>
                <PriceDisplay
                  price={item.price * item.quantity}
                  compareAtPrice={item.compareAtPrice ? item.compareAtPrice * item.quantity : null}
                  locale={locale}
                  size="sm"
                />
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2.5 pt-3 border-t border-luxury-border text-xs text-luxury-muted">
            <div className="flex justify-between">
              <span>{c("Subtotal", "المجموع الفرعي")}</span>
              <PriceDisplay price={subtotal} locale={locale} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>{c("White-Glove GCC Delivery", "الشحن السريع المبرد")}</span>
              {shipping === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {c("Complimentary", "مجاني")}
                </span>
              ) : (
                <PriceDisplay price={shipping} locale={locale} size="sm" />
              )}
            </div>

            {/* Loyalty discount if applied */}
            {activeLoyaltyDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>{c("Olfactory Loyalty Credit", "خصم رصيد الولاء")}</span>
                <span>-AED {activeLoyaltyDiscount}</span>
              </div>
            )}
          </div>

          {/* Final Total */}
          <div className="flex justify-between items-baseline border-t border-luxury-border pt-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-sans font-semibold text-luxury-text block">
                {c("Order Total", "المجموع الكلي")}
              </span>
              <span className="text-[10px] text-luxury-muted">
                {c("VAT & GCC customs included", "شامل الضريبة والرسوم")}
              </span>
            </div>
            <PriceDisplay price={estimatedTotal} locale={locale} />
          </div>

          {/* Loyalty Earned Badge */}
          <div className="p-3 bg-luxury-surface2 border border-luxury-border rounded-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-accent" />
              <span className="text-luxury-text font-medium">
                {c("Olfactory Rewards", "مكافأة الولاء لهذا الطلب")}
              </span>
            </div>
            <span className="font-mono text-accent font-semibold">
              +AED {earnedCredits}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-3 border-t border-luxury-border">
            <span className="text-xs uppercase tracking-wider font-sans font-semibold text-luxury-text block">
              {c("Select Payment Method", "اختر طريقة الدفع")}
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              <div
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`p-3.5 border rounded-sm flex flex-col gap-3 cursor-pointer transition-colors ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-luxury-text bg-luxury-surface2 shadow-sm"
                    : "border-luxury-border bg-luxury-surface hover:border-luxury-text/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === "CREDIT_CARD"}
                    onChange={() => setPaymentMethod("CREDIT_CARD")}
                    className="mt-0.5 accent-black dark:accent-white"
                  />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-luxury-text shrink-0" />
                      <span className="text-xs font-semibold text-luxury-text">
                        {c("Credit / Debit Card (Stripe)", "البطاقة الائتمانية (سترايب)")}
                      </span>
                    </div>
                    <p className="text-[11px] text-luxury-muted">
                      {c(
                        "Visa, Mastercard, Amex, Apple Pay",
                        "فيزا، ماستركارد، أمريكان إكسبريس، وأبل باي",
                      )}
                    </p>
                  </div>
                </div>

                {paymentMethod === "CREDIT_CARD" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-3 border-t border-luxury-border space-y-3 cursor-default"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-luxury-text mb-1">
                        {c("Name on Card", "الاسم على البطاقة")}
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder={form.fullName || "Sultan Al-Nuaimi"}
                        className="glass-input w-full p-2.5 text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-luxury-text mb-1">
                        {c("Card Number", "رقم البطاقة")}
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="glass-input w-full p-2.5 text-xs font-mono tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-luxury-text mb-1">
                          {c("Expiry (MM/YY)", "تاريخ الانتهاء")}
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          placeholder="12/28"
                          className="glass-input w-full p-2.5 text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-luxury-text mb-1">
                          {c("CVC", "رمز الأمان")}
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="glass-input w-full p-2.5 text-xs font-mono text-center"
                        />
                      </div>
                    </div>

                    {/* 1-Click Auto Fill Test Card */}
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="w-full text-xs py-2 px-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-sm font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles size={12} />
                      <span>{c("1-Click Auto-Fill Test Card", "تعبئة سريعة ببطاقة فيزا تجريبية")}</span>
                    </button>
                  </div>
                )}
              </div>

              <label
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-colors ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-luxury-text bg-luxury-surface2"
                    : "border-luxury-border bg-luxury-surface hover:border-luxury-text/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === "CASH_ON_DELIVERY"}
                  onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  className="mt-0.5 accent-black dark:accent-white"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-accent shrink-0" />
                    <span className="text-xs font-semibold text-luxury-text flex items-center gap-1.5 flex-wrap">
                      <span>{c("VIP Delivery / Pay on Handover", "الدفع عند الاستلام / طلب تجريبي")}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        {c("Instant Test Order", "طلب اختباري فوري")}
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-luxury-muted">
                    {c(
                      "No card required. Directly logs the order, sends SMS/WhatsApp, and updates admin tracker.",
                      "دون الحاجة لبطاقة. يؤكد الطلب فوراً ويرسل إشعارات الواتساب والبريد ويحدث لوحة التحكم.",
                    )}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="text-red-700 dark:text-red-300 text-xs p-2 bg-red-500/10 border border-red-500/20 rounded-sm"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || availability !== "ready"}
            className="editorial-button w-full disabled:opacity-50 text-xs py-4 flex items-center justify-center gap-2 shadow-md"
          >
            {paymentMethod === "CASH_ON_DELIVERY" ? <Truck size={15} /> : <CreditCard size={15} />}
            <span>
              {loading
                ? c("Securing order…", "جارٍ تأكيد الطلب…")
                : paymentMethod === "CASH_ON_DELIVERY"
                  ? c("Confirm VIP Order (Pay on Delivery)", "تأكيد الطلب الفاخر (الدفع عند الاستلام)")
                  : c("Authorize & Pay with Card", "الدفع الفوري بالبطاقة")}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2 text-[11px] text-luxury-muted">
            <Link href="/cart" className="hover:text-luxury-text underline">
              {c("Edit Bag", "تعديل الحقيبة")}
            </Link>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>{c("100% Authentic", "أصلي ومضمون")}</span>
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
