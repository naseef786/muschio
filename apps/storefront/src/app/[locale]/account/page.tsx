"use client";

import React, { useCallback, useEffect, useState } from "react";
import { StorefrontOrder } from "@muschio/types";
import { PriceDisplay, Button } from "@muschio/ui";
import { Link } from "../../../navigation";
import { muschioApi } from "../../../lib/api";
import { useCart } from "../../../context/cart-context";
import { useWishlist } from "../../../context/wishlist-context";
import { useAuth } from "../../../context/auth-context";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Package,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Gift,
  Crown,
  MapPin,
  Plus,
  Trash2,
  Check,
  LogOut,
  X,
} from "lucide-react";

export default function AccountPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const {
    user,
    isLoggedIn,
    login,
    signup,
    logout,
    savedAddresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const [orders, setOrders] = useState<StorefrontOrder[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Authentication tabs if not logged in
  const [authTab, setAuthTab] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Add address modal / toggle
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    country: "AE",
    city: "",
    stateOrEmirate: "",
    addressLine1: "",
    isDefault: false,
  });

  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await muschioApi.getMyOrders();
      setOrders(res);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders, isLoggedIn]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await login(authEmail, authPassword);
    } catch {
      setAuthError(c("Failed to authenticate.", "تعذر تسجيل الدخول."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authName.trim()) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      await signup({
        name: authName,
        email: authEmail,
        phone: authPhone,
        password: authPassword,
      });
    } catch {
      setAuthError(c("Failed to register profile.", "تعذر إنشاء الحساب."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoVipLogin = async () => {
    setAuthLoading(true);
    try {
      await login("sultan@muschio.client", "vip");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.fullName.trim() || !newAddressForm.addressLine1.trim()) return;

    saveAddress({
      label: newAddressForm.label || (newAddressForm.country === "AE" ? "Dubai Address" : "GCC Residence"),
      fullName: newAddressForm.fullName,
      phone: newAddressForm.phone || user?.phone || "+971 50 000 0000",
      country: newAddressForm.country,
      city: newAddressForm.city || "Dubai",
      stateOrEmirate: newAddressForm.stateOrEmirate || "Dubai",
      addressLine1: newAddressForm.addressLine1,
      isDefault: newAddressForm.isDefault || savedAddresses.length === 0,
    });

    setShowAddAddress(false);
    setNewAddressForm({
      label: "",
      fullName: "",
      phone: "",
      country: "AE",
      city: "",
      stateOrEmirate: "",
      addressLine1: "",
      isDefault: false,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "FULFILLING":
        return { label: c("Processing", "قيد التجهيز"), color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" };
      case "SHIPPED":
        return { label: c("In Transit", "في الطريق إليك"), color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30" };
      case "DELIVERED":
        return { label: c("Delivered", "تم التوصيل"), color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" };
      case "CANCELLED":
        return { label: c("Cancelled", "ملغي"), color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30" };
      default:
        return { label: status, color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30" };
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-10 sm:space-y-14">
      {/* 1. Header (Level Shoes Private Client Suite) */}
      <div className="border-b border-luxury-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="eyebrow text-accent">
            {c("HAUTE PARFUMERIE · PRIVATE CLIENT SUITE", "دار العطور الراقية · جناح العميل الخاص")}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
            {isLoggedIn && user
              ? c(`Welcome, ${user.name}.`, `أهلاً بك، ${user.name}.`)
              : c("Your Muschio Space.", "مساحتك الخاصة لدى موسكيو.")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-sans leading-relaxed">
            {isLoggedIn
              ? c(
                  "Manage your saved GCC addresses, view your exclusive Olfactory Loyalty balance, track ongoing orders, and access personalized fragrance recommendations.",
                  "إدارة عناوين التوصيل في الخليج، ومتابعة رصيد الولاء العطري الحصري، وتتبع طلباتك، والاطلاع على التوصيات المخصصة لك.",
                )
              : c(
                  "Access your recent orders, private vault wishlist, and bespoke discovery sets. Join Muschio Privilege to unlock saved address books and 5% olfactory loyalty rewards.",
                  "استعرض أحدث طلباتك وخزانتك المفضلة. انضم لعضوية مسكيو بريفيلج لتفعيل دفتر العناوين المحفوظة وكسب ٥٪ رصيد ولاء عطري.",
                )}
          </p>
        </div>

        {isLoggedIn && (
          <button
            type="button"
            onClick={logout}
            className="editorial-button-secondary text-xs inline-flex items-center gap-1.5 self-start md:self-end"
          >
            <LogOut size={13} />
            <span>{c("Sign Out", "تسجيل الخروج")}</span>
          </button>
        )}
      </div>

      {/* 2. Customer Ownership & Loyalty Card / Login Form */}
      {isLoggedIn && user ? (
        /* Member Loyalty & Ownership Status Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden shadow-sm">
          {/* Left: Tier Badge & Member Identity (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-luxury-surface2 border-b lg:border-b-0 lg:border-e border-luxury-border flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-accent" />
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
                  {user.tier === "GOLD_SILLAGE"
                    ? c("GOLD SILLAGE VIP MEMBER", "عضوية السيلّاج الذهبي الملكية")
                    : c("MUSCHIO PRIVILEGE MEMBER", "عضوية مسكيو بريفيلج")}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
                {user.name}
              </h2>
              <p className="text-xs text-luxury-muted">
                {user.email} · {user.phone}
              </p>
              <span className="inline-block text-[11px] font-mono text-luxury-muted">
                {c(`Member since ${user.joinedDate}`, `عضو منذ ${user.joinedDate}`)}
              </span>
            </div>

            <div className="p-4 border border-luxury-border bg-luxury-surface rounded-sm space-y-1.5">
              <span className="text-[10px] uppercase font-sans font-medium tracking-wider text-luxury-muted block">
                {c("VIP Privilege Tier Benefit", "مزايا الفئة الحصرية")}
              </span>
              <p className="text-xs text-luxury-text leading-relaxed">
                {user.tier === "GOLD_SILLAGE"
                  ? c(
                      "Complimentary climate-controlled GCC air courier on all orders, private batch reserve priority, and dedicated sommelier advisory.",
                      "شحن جوي مبرد مجاني لكافة الطلبات، وأولوية حجز الدفعات الخاصة، ومستشار عطري مخصص.",
                    )
                  : c(
                      "Earn 5% Olfactory Loyalty credits on every acquisition, complimentary 2ml sample vial, and priority dispatch.",
                      "كسب ٥٪ رصيد ولاء عطري على كل عملية شراء، وعينة ٢ مل مجانية، وأولوية في التجهيز.",
                    )}
              </p>
            </div>
          </div>

          {/* Right: Loyalty Olfactory Balance & Tier Progress (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="eyebrow text-accent mb-2">
                {c("OLFACTORY LOYALTY BALANCE", "رصيد الولاء العطري")}
              </span>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="font-serif text-4xl sm:text-5xl text-luxury-text font-medium">
                  AED {user.loyaltyCreditsAed}
                </span>
                <span className="text-xs text-luxury-muted font-mono">
                  ({user.loyaltyPoints} {c("reward points", "نقطة ولاء")})
                </span>
              </div>
              <p className="text-xs text-luxury-muted mt-2 leading-relaxed">
                {c(
                  "Your credits can be applied directly at checkout toward any luxury flacon or bespoke discovery set. Every 100 points equals 10 AED.",
                  "يمكنك استخدام هذا الرصيد مباشرة عند الدفع لخصمه من أي زجاجة عطر أو مجموعة عينات. كل ١٠٠ نقطة تعادل ١٠ دراهم.",
                )}
              </p>
            </div>

            {/* Loyalty Tier Progress Bar */}
            <div className="space-y-2 pt-4 border-t border-luxury-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-luxury-text font-medium">
                  {c("Tier Progress: Gold Sillage", "التقدم نحو فئة السيلّاج الذهبي")}
                </span>
                <span className="font-mono text-accent">1,450 / 3,000 Points</span>
              </div>
              <div className="w-full h-1.5 bg-luxury-surface2 border border-luxury-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: "48%" }}
                />
              </div>
              <span className="text-[10px] text-luxury-muted block">
                {c(
                  "Accumulate 1,550 more points to upgrade to Royal Ambassador Tier.",
                  "اجمع ١,٥٥٠ نقطة إضافية للترقية إلى فئة السفير الملكي.",
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Guest / Sign In & Registration Card */
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-luxury-border bg-luxury-surface rounded-sm overflow-hidden">
          <div className="lg:col-span-5 p-6 sm:p-10 bg-luxury-surface2 border-b lg:border-b-0 lg:border-e border-luxury-border flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-accent" />
                <span className="eyebrow text-accent">
                  {c("MUSCHIO PRIVILEGE CLUB", "نادي مسكيو للعضوية الحصرية")}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal leading-tight">
                {c("Acquire with Privilege.", "اقتنِ عطورك بمزايا حصرية.")}
              </h2>
              <p className="text-xs text-luxury-muted leading-relaxed">
                {c(
                  "Join our circle of Gulf fragrance connoisseurs. Save multiple delivery addresses for 1-click checkout, earn 5% olfactory rewards, and receive invitations to private atelier batches.",
                  "انضم لدائرة متذوقي العطور الراقية في الخليج. احفظ عناوين التوصيل المتعددة لتسهيل الشراء بضغطة زر، واكسب ٥٪ رصيد ولاء عطري، واحصل على دعوات حصرية لأندر الدفعات.",
                )}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-luxury-border text-xs text-luxury-text">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{c("Saved GCC Address Book (UAE, KSA, Qatar, Kuwait, Bahrain, Oman)", "دفتر عناوين محفوظ لكافة دول الخليج")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{c("Earn 5% Olfactory Loyalty credits on every purchase", "كسب ٥٪ رصيد ولاء عطري على كل طلب")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{c("1-Click Checkout & Private Order History", "إتمام الطلب بضغطة واحدة وسجل خاص")}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoVipLogin}
                disabled={authLoading}
                className="w-full editorial-button-secondary text-xs py-3 flex items-center justify-center gap-2"
              >
                <Crown size={14} className="text-accent" />
                <span>{c("Instant Demo: Sultan Al-Nuaimi (Gold VIP)", "تجربة سريعة: سلطان النعيمي (Gold VIP)")}</span>
              </button>
            </div>
          </div>

          {/* Right Form: Login or Register */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-2 border border-luxury-border text-center text-xs font-sans uppercase tracking-wider font-medium">
              <button
                type="button"
                onClick={() => setAuthTab("LOGIN")}
                className={`py-3 transition-colors ${
                  authTab === "LOGIN"
                    ? "bg-luxury-text text-luxury-canvas"
                    : "bg-luxury-surface text-luxury-muted hover:text-luxury-text"
                }`}
              >
                {c("Sign In", "تسجيل الدخول")}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("SIGNUP")}
                className={`py-3 transition-colors ${
                  authTab === "SIGNUP"
                    ? "bg-luxury-text text-luxury-canvas"
                    : "bg-luxury-surface text-luxury-muted hover:text-luxury-text"
                }`}
              >
                {c("Create Account", "إنشاء حساب جديد")}
              </button>
            </div>

            {authTab === "LOGIN" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1.5">
                    {c("Email Address", "البريد الإلكتروني")}
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="client@muschio.luxury"
                    className="glass-input w-full p-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1.5">
                    {c("Password", "كلمة المرور")}
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full p-3 text-xs"
                  />
                </div>

                {authError && <p className="text-xs text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="editorial-button w-full text-xs py-3.5"
                >
                  {authLoading ? c("Verifying…", "جارٍ التحقق…") : c("Sign In to Suite", "تسجيل الدخول")}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1.5">
                    {c("Full Name", "الاسم الكامل")}
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Sultan Al-Nuaimi"
                    className="glass-input w-full p-3 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-luxury-text mb-1.5">
                      {c("Email Address", "البريد الإلكتروني")}
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="client@muschio.luxury"
                      className="glass-input w-full p-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-luxury-text mb-1.5">
                      {c("Phone Number", "رقم الهاتف")}
                    </label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="glass-input w-full p-3 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-luxury-text mb-1.5">
                    {c("Choose Password", "كلمة المرور")}
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full p-3 text-xs"
                  />
                </div>

                {authError && <p className="text-xs text-red-600">{authError}</p>}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="editorial-button w-full text-xs py-3.5"
                >
                  {authLoading
                    ? c("Registering…", "جارٍ إنشاء الحساب…")
                    : c("Join Muschio Privilege (+100 Welcome Points)", "انضم لمسكيو بريفيلج (+١٠٠ نقطة ترحيبية)")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Dedicated Saved Addresses Section (Level Shoes Pattern) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-luxury-border">
          <div>
            <span className="eyebrow mb-1">
              {c("GCC DELIVERY ADDRESSES", "دفتر العناوين المعتمد")}
            </span>
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {c("Saved Addresses", "العناوين المحفوظة")}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="editorial-button text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
          >
            {showAddAddress ? (
              <>
                <X size={13} />
                <span>{c("Cancel", "إلغاء")}</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>{c("Add New Address", "إضافة عنوان جديد")}</span>
              </>
            )}
          </button>
        </div>

        {/* Add Address Slide-down Form */}
        {showAddAddress && (
          <form
            onSubmit={handleCreateAddress}
            className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 rounded-sm space-y-5"
          >
            <span className="eyebrow text-accent">
              {c("NEW GCC DELIVERY DESTINATION", "وجهة توصيل خليجية جديدة")}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Address Label / Nickname", "اسم العنوان (فيلا، مكتب، إلخ)")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={c("e.g. Palm Jumeirah Villa", "مثال: فيلا نخلة جميرا")}
                  value={newAddressForm.label}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Recipient Full Name", "اسم المستلم الكامل")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sultan Al-Nuaimi"
                  value={newAddressForm.fullName}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Phone (with Country Code)", "رقم الهاتف مع الرمز")}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 123 4567"
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Country", "الدولة")}
                </label>
                <select
                  value={newAddressForm.country}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                >
                  <option value="AE">{c("United Arab Emirates", "الإمارات العربية المتحدة")}</option>
                  <option value="SA">{c("Saudi Arabia", "المملكة العربية السعودية")}</option>
                  <option value="QA">{c("Qatar", "دولة قطر")}</option>
                  <option value="KW">{c("Kuwait", "دولة الكويت")}</option>
                  <option value="BH">{c("Bahrain", "مملكة البحرين")}</option>
                  <option value="OM">{c("Oman", "سلطنة عمان")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("City", "المدينة")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={c("Dubai / Riyadh / Doha", "دبي / الرياض / الدوحة")}
                  value={newAddressForm.city}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("State / Emirate / Province", "الإمارة / المنطقة")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={c("Dubai Emirate / Central Region", "إمارة دبي / المنطقة الوسطى")}
                  value={newAddressForm.stateOrEmirate}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, stateOrEmirate: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-luxury-text mb-1">
                  {c("Street, Villa / Building, Unit Number", "الشارع ورقم الفيلا أو المبنى والشقة")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={c("Frond N, Villa 14 / Al Wasl Road", "السعفة N، فيلا ١٤ / شارع الوصل")}
                  value={newAddressForm.addressLine1}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })}
                  className="glass-input w-full p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-luxury-border">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-luxury-text">
                <input
                  type="checkbox"
                  checked={newAddressForm.isDefault}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                  className="accent-accent"
                />
                <span>{c("Set as default delivery address", "تعيين كعنوان توصيل افتراضي")}</span>
              </label>

              <button type="submit" className="editorial-button text-xs py-2 px-5">
                {c("Save to Address Book", "حفظ في دفتر العناوين")}
              </button>
            </div>
          </form>
        )}

        {/* Saved Addresses Grid */}
        {savedAddresses.length === 0 ? (
          <div className="border border-luxury-border bg-luxury-surface p-8 text-center space-y-3">
            <MapPin size={28} className="mx-auto text-luxury-muted opacity-70" />
            <h3 className="font-serif text-lg text-luxury-text font-normal">
              {c("No saved addresses yet", "لا توجد عناوين محفوظة حالياً")}
            </h3>
            <p className="text-xs text-luxury-muted max-w-sm mx-auto">
              {c(
                "Add your home or office address to enjoy instant 1-click checkout on all future fragrance acquisitions.",
                "أضف عنوان منزلك أو مكتبك للتمتع بتجربة شراء سريعة بضغطة زر واحدة.",
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-luxury-border bg-luxury-surface p-5 rounded-sm flex flex-col justify-between space-y-4 hover:border-luxury-borderBold transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-luxury-border">
                    <span className="font-sans font-semibold text-xs text-luxury-text">
                      {addr.label}
                    </span>
                    {addr.isDefault ? (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-accent/15 text-accent rounded-sm">
                        {c("Default", "افتراضي")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] text-luxury-muted hover:text-accent transition-colors"
                      >
                        {c("Set Default", "جعله افتراضي")}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 mt-3 text-xs">
                    <p className="font-medium text-luxury-text">{addr.fullName}</p>
                    <p className="text-luxury-muted font-mono">{addr.phone}</p>
                    <p className="text-luxury-text leading-snug pt-1">
                      {addr.addressLine1}
                    </p>
                    <p className="text-luxury-muted">
                      {addr.city}, {addr.stateOrEmirate}, {addr.country}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-luxury-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-luxury-muted font-mono uppercase">
                    {addr.country === "AE" ? "UAE Courier" : "GCC Transit"}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteAddress(addr.id)}
                    aria-label="Delete address"
                    className="text-luxury-muted hover:text-rose-600 transition-colors inline-flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 size={12} />
                    <span>{c("Delete", "حذف")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Vault Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/wishlist"
          className="border border-luxury-border bg-luxury-surface p-5 flex flex-col justify-between hover:border-luxury-borderBold transition-all group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">
              {c("PRIVATE VAULT", "المفضلة")}
            </span>
            <Heart size={16} className="text-luxury-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <span className="font-serif text-lg text-luxury-text font-normal block">
              {c("Wishlist", "قائمتك المفضلة")}
            </span>
            <span className="text-[11px] text-accent font-medium">
              {wishlistCount} {c("Saved Flacons", "عطور محفوظة")} →
            </span>
          </div>
        </Link>

        <Link
          href="/cart"
          className="border border-luxury-border bg-luxury-surface p-5 flex flex-col justify-between hover:border-luxury-borderBold transition-all group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">
              {c("YOUR BAG", "الحقيبة")}
            </span>
            <ShoppingBag size={16} className="text-luxury-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <span className="font-serif text-lg text-luxury-text font-normal block">
              {c("Shopping Bag", "حقيبة التسوق")}
            </span>
            <span className="text-[11px] text-accent font-medium">
              {cartCount} {c("Items", "منتجات")} →
            </span>
          </div>
        </Link>

        <Link
          href="/discover/sets"
          className="border border-luxury-border bg-luxury-surface p-5 flex flex-col justify-between hover:border-luxury-borderBold transition-all group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">
              {c("SAMPLING BOX", "العينات")}
            </span>
            <Gift size={16} className="text-luxury-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <span className="font-serif text-lg text-luxury-text font-normal block">
              {c("Discovery Sets", "صناديق العينات")}
            </span>
            <span className="text-[11px] text-accent font-medium">
              {c("5 x 2ml Boxes", "٥ عينات بـ ٢٨٠ د.إ")} →
            </span>
          </div>
        </Link>

        <Link
          href="/discover/ai"
          className="border border-luxury-border bg-luxury-surface p-5 flex flex-col justify-between hover:border-luxury-borderBold transition-all group min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">
              {c("SOMMELIER", "المستشار")}
            </span>
            <Sparkles size={16} className="text-luxury-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <span className="font-serif text-lg text-luxury-text font-normal block">
              {c("AI Consultation", "الاستشارة الذكية")}
            </span>
            <span className="text-[11px] text-accent font-medium">
              {c("Bespoke Diagnosis", "تشخيص عطور مخصص")} →
            </span>
          </div>
        </Link>
      </div>

      {/* 5. Orders Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-luxury-border">
          <div>
            <span className="eyebrow mb-1">
              {c("PURCHASE HISTORY", "سجل المشتريات")}
            </span>
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {c("Your Orders", "طلباتك الأخيرة")}
            </h2>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loadingOrders}
            className="text-xs font-sans text-luxury-muted hover:text-luxury-text flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loadingOrders ? "animate-spin" : ""} />
            <span>{c("Refresh", "تحديث")}</span>
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-16 text-center text-xs text-luxury-muted border border-luxury-border bg-luxury-surface">
            <span className="inline-block animate-pulse">
              {c("Verifying order history…", "جارٍ التحقق من سجل الطلبات…")}
            </span>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="border border-luxury-border bg-luxury-surface p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
            <Package size={36} className="mx-auto text-luxury-muted opacity-70" />
            <h3 className="font-serif text-xl text-luxury-text font-normal">
              {c("No orders placed yet", "لم يتم إنشاء طلبات في هذه الجلسة")}
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              {c(
                "When you acquire a flacon or curate a discovery set, your receipt and live tracking details will appear here.",
                "عند اقتنائك لأي زجاجة عطر أو تصميم صندوق عينات، ستظهر تفاصيل طلبك وروابط التتبع المباشر هنا.",
              )}
            </p>
            <div className="pt-2">
              <Button asChild variant="accent" size="sm">
                <Link href="/shop">{c("Explore Fragrance Vault", "استكشف خزانة العطور")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/order-confirmation/${encodeURIComponent(order.orderNumber)}`}
                  className="border border-luxury-border bg-luxury-surface p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-luxury-borderBold transition-all group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-luxury-text">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-luxury-muted">
                      {order.items?.length || 1} {c("Creation(s)", "إصدارات")} · {(order as any).createdAt ? new Date((order as any).createdAt).toLocaleDateString(isAr ? "ar-AE" : "en-AE", { year: "numeric", month: "short", day: "numeric" }) : c("Recent Order", "طلب حديث")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-luxury-border">
                    <div className="text-start sm:text-end">
                      <span className="text-[10px] text-luxury-muted block">
                        {c("Total Amount", "المجموع")}
                      </span>
                      <PriceDisplay price={order.totalAmount} locale={locale} size="sm" />
                    </div>

                    <span className="text-xs font-sans text-luxury-text group-hover:text-accent group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all flex items-center gap-1">
                      <span>{c("View Details", "التفاصيل")}</span>
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. VIP Client Guarantees Bar */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-serif text-base text-luxury-text font-normal">
              {c("Need Private Fragrance Concierge Assistance?", "هل تحتاج لمساعدة مستشارك العطري الخاص؟")}
            </h4>
            <p className="text-xs text-luxury-muted">
              {c(
                "Our Dubai sommelier team is available daily for bespoke recommendations and rare batch sourcing.",
                "فريق المستشارين العطريين في دبي متاح يومياً لتزويدك بالتوصيات وتوفير أندر الإصدارات الملكية.",
              )}
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
          <Link href="/discover/ai">
            {c("Private Sommelier", "استشارة المستشار")} →
          </Link>
        </Button>
      </div>
    </div>
  );
}
