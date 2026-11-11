import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Percent,
  Gift,
  Coins,
  Award,
  History,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FileText,
  ChevronRight,
  ShieldAlert,
  X,
} from "lucide-react";

interface MarketingPromotionsTabProps {
  authHeaders: Record<string, string>;
  onNotification?: (msg: string, type?: "success" | "error") => void;
}

type SubTab = "overview" | "promotions" | "coupons" | "vouchers" | "gift_cards" | "loyalty" | "ledger";

export function MarketingPromotionsTab({ authHeaders, onNotification }: MarketingPromotionsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [loading, setLoading] = useState(false);

  // Data states
  const [dashboard, setDashboard] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<{ config: any; tiers: any[] } | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  // Modals state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showLoyaltyAdjustModal, setShowLoyaltyAdjustModal] = useState(false);

  // Form states
  const [promoForm, setPromoForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    type: "PERCENTAGE",
    value: 10,
    minSpend: "",
    maxDiscount: "",
    priority: 0,
    isStackable: false,
    isActive: true,
    startsAt: "",
    endsAt: "",
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 15,
    minSpend: "",
    maxDiscount: "",
    maxUses: "",
    maxUsesPerCustomer: "1",
    firstOrderOnly: false,
    isActive: true,
    expiresAt: "",
  });

  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountAmount: "150",
    discountPercent: "",
    isDiscoveryVoucher: true,
    expiresDays: "90",
  });

  const [giftCardForm, setGiftCardForm] = useState({
    code: "",
    initialBalance: "500",
    recipientEmail: "",
    recipientName: "",
    personalMessage: "",
    expiresDays: "365",
  });

  const [adjustForm, setAdjustForm] = useState({
    customerId: "",
    customerEmail: "",
    pointsDelta: "",
    reason: "",
  });

  const [loyaltyConfigForm, setLoyaltyConfigForm] = useState({
    earningRatioAED: 10,
    redemptionRateAED: 0.5,
    welcomeBonusPoints: 100,
    birthdayBonusPoints: 200,
    pointsExpiryDays: 365,
    isActive: true,
  });

  // Fetch Dashboard & Overview
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/promotions/dashboard", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setDashboard(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch promotions dashboard:", err);
    }
  }, [authHeaders]);

  // Fetch Promotions
  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/promotions", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch promotions:", err);
    }
  }, [authHeaders]);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/coupons", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch coupons:", err);
    }
  }, [authHeaders]);

  // Fetch Vouchers
  const fetchVouchers = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/vouchers", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setVouchers(json.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch vouchers:", err);
    }
  }, [authHeaders]);

  // Fetch Gift Cards
  const fetchGiftCards = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/gift-cards", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setGiftCards(json.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch gift cards:", err);
    }
  }, [authHeaders]);

  // Fetch Loyalty Config & Tiers
  const fetchLoyaltyData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/loyalty/config", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setLoyaltyData(json.data);
        if (json.data?.config) {
          setLoyaltyConfigForm({
            earningRatioAED: json.data.config.earningRatioAED || 10,
            redemptionRateAED: json.data.config.redemptionRateAED || 0.5,
            welcomeBonusPoints: json.data.config.welcomeBonusPoints || 100,
            birthdayBonusPoints: json.data.config.birthdayBonusPoints || 200,
            pointsExpiryDays: json.data.config.pointsExpiryDays || 365,
            isActive: json.data.config.isActive ?? true,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch loyalty data:", err);
    }
  }, [authHeaders]);

  // Fetch Ledger
  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/loyalty/ledger?limit=100", { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        setLedgerEntries(json.data?.transactions || []);
      }
    } catch (err) {
      console.warn("Failed to fetch loyalty ledger:", err);
    }
  }, [authHeaders]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboard(),
      fetchPromotions(),
      fetchCoupons(),
      fetchVouchers(),
      fetchGiftCards(),
      fetchLoyaltyData(),
      fetchLedger(),
    ]).finally(() => setLoading(false));
  }, [
    fetchDashboard,
    fetchPromotions,
    fetchCoupons,
    fetchVouchers,
    fetchGiftCards,
    fetchLoyaltyData,
    fetchLedger,
  ]);

  // Handlers for Creating Promotion
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.nameEn) {
      onNotification?.("Promotion English name is required", "error");
      return;
    }
    try {
      const payload = {
        nameEn: promoForm.nameEn,
        nameAr: promoForm.nameAr || promoForm.nameEn,
        descriptionEn: promoForm.descriptionEn || undefined,
        type: promoForm.type,
        value: Number(promoForm.value),
        minSpend: promoForm.minSpend ? Number(promoForm.minSpend) : null,
        maxDiscount: promoForm.maxDiscount ? Number(promoForm.maxDiscount) : null,
        priority: Number(promoForm.priority) || 0,
        isStackable: Boolean(promoForm.isStackable),
        isActive: Boolean(promoForm.isActive),
        startsAt: promoForm.startsAt ? new Date(promoForm.startsAt).toISOString() : new Date().toISOString(),
        endsAt: promoForm.endsAt ? new Date(promoForm.endsAt).toISOString() : null,
      };

      const res = await fetch("/api/v1/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onNotification?.("Promotion created successfully", "success");
        setShowPromoModal(false);
        fetchPromotions();
        fetchDashboard();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to create promotion", "error");
      }
    } catch {
      onNotification?.("Network error while creating promotion", "error");
    }
  };

  // Delete Promotion
  const handleDeletePromo = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate and remove this promotion?")) return;
    try {
      const res = await fetch(`/api/v1/admin/promotions/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        onNotification?.("Promotion removed", "success");
        fetchPromotions();
        fetchDashboard();
      }
    } catch {
      onNotification?.("Failed to delete promotion", "error");
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) {
      onNotification?.("Coupon code is required", "error");
      return;
    }
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        value: Number(couponForm.value),
        minSpend: couponForm.minSpend ? Number(couponForm.minSpend) : null,
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
        maxUsesPerCustomer: couponForm.maxUsesPerCustomer ? Number(couponForm.maxUsesPerCustomer) : 1,
        firstOrderOnly: Boolean(couponForm.firstOrderOnly),
        isActive: Boolean(couponForm.isActive),
        expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null,
      };

      const res = await fetch("/api/v1/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onNotification?.("Coupon created successfully", "success");
        setShowCouponModal(false);
        fetchCoupons();
        fetchDashboard();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to create coupon", "error");
      }
    } catch {
      onNotification?.("Network error while creating coupon", "error");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/v1/admin/coupons/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        onNotification?.("Coupon deleted", "success");
        fetchCoupons();
        fetchDashboard();
      }
    } catch {
      onNotification?.("Failed to delete coupon", "error");
    }
  };

  // Create Discovery Voucher
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: voucherForm.code ? voucherForm.code.trim().toUpperCase() : undefined,
        discountAmount: voucherForm.discountAmount ? Number(voucherForm.discountAmount) : null,
        discountPercent: voucherForm.discountPercent ? Number(voucherForm.discountPercent) : null,
        isDiscoveryVoucher: Boolean(voucherForm.isDiscoveryVoucher),
        expiresDays: Number(voucherForm.expiresDays) || 90,
      };

      const res = await fetch("/api/v1/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onNotification?.("VIP Voucher issued successfully", "success");
        setShowVoucherModal(false);
        fetchVouchers();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to issue voucher", "error");
      }
    } catch {
      onNotification?.("Network error while issuing voucher", "error");
    }
  };

  // Delete Voucher
  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm("Revoke and delete this voucher?")) return;
    try {
      const res = await fetch(`/api/v1/admin/vouchers/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        onNotification?.("Voucher revoked", "success");
        fetchVouchers();
      }
    } catch {
      onNotification?.("Failed to delete voucher", "error");
    }
  };

  // Create Gift Card
  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expiresAt = giftCardForm.expiresDays
        ? new Date(Date.now() + Number(giftCardForm.expiresDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const payload = {
        code: giftCardForm.code ? giftCardForm.code.trim().toUpperCase() : undefined,
        initialBalance: Number(giftCardForm.initialBalance) || 500,
        currency: "AED",
        recipientEmail: giftCardForm.recipientEmail ? giftCardForm.recipientEmail.trim() : undefined,
        recipientName: giftCardForm.recipientName ? giftCardForm.recipientName.trim() : undefined,
        personalMessage: giftCardForm.personalMessage || undefined,
        expiresAt,
      };

      const res = await fetch("/api/v1/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onNotification?.("Digital Gift Card issued successfully", "success");
        setShowGiftCardModal(false);
        fetchGiftCards();
        fetchDashboard();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to issue gift card", "error");
      }
    } catch {
      onNotification?.("Network error while creating gift card", "error");
    }
  };

  // Adjust Customer Loyalty Points
  const handleAdjustLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.customerId && !adjustForm.customerEmail) {
      onNotification?.("Customer ID or Email is required", "error");
      return;
    }
    if (!adjustForm.pointsDelta || isNaN(Number(adjustForm.pointsDelta))) {
      onNotification?.("Valid points delta is required (+ or -)", "error");
      return;
    }
    if (!adjustForm.reason.trim()) {
      onNotification?.("Mandatory audit reason required for manual points adjustment", "error");
      return;
    }

    try {
      // Find customer if email given
      let targetCustomerId = adjustForm.customerId;
      if (!targetCustomerId && adjustForm.customerEmail) {
        const checkRes = await fetch(`/api/v1/admin/customers/search?email=${encodeURIComponent(adjustForm.customerEmail)}`, {
          headers: authHeaders,
        }).catch(() => null);
        if (checkRes && checkRes.ok) {
          const custData = await checkRes.json();
          targetCustomerId = custData?.data?.id || adjustForm.customerEmail;
        } else {
          targetCustomerId = adjustForm.customerEmail;
        }
      }

      const res = await fetch("/api/v1/admin/loyalty/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          customerId: targetCustomerId,
          pointsDelta: Number(adjustForm.pointsDelta),
          reason: adjustForm.reason.trim(),
        }),
      });

      if (res.ok) {
        onNotification?.("Loyalty points adjusted and ledger updated", "success");
        setShowLoyaltyAdjustModal(false);
        setAdjustForm({ customerId: "", customerEmail: "", pointsDelta: "", reason: "" });
        fetchLedger();
        fetchDashboard();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to adjust points", "error");
      }
    } catch {
      onNotification?.("Network error while adjusting loyalty points", "error");
    }
  };

  // Save Loyalty Program Settings
  const handleSaveLoyaltyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/loyalty/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(loyaltyConfigForm),
      });

      if (res.ok) {
        onNotification?.("Loyalty program rules saved successfully", "success");
        fetchLoyaltyData();
        fetchDashboard();
      } else {
        const err = await res.json();
        onNotification?.(err?.error?.message || "Failed to save loyalty configuration", "error");
      }
    } catch {
      onNotification?.("Network error while saving loyalty settings", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl text-xs font-medium">
          {[
            { id: "overview", label: "Overview & KPIs", icon: Award },
            { id: "promotions", label: "Automatic Promotions", icon: Percent, count: promotions.length },
            { id: "coupons", label: "Coupons & Codes", icon: Tag, count: coupons.length },
            { id: "vouchers", label: "VIP Discovery Vouchers", icon: FileText, count: vouchers.length },
            { id: "gift_cards", label: "Digital Gift Cards", icon: Gift, count: giftCards.length },
            { id: "loyalty", label: "Loyalty Program & Tiers", icon: Coins },
            { id: "ledger", label: "Audit Ledger", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm font-semibold"
                    : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              Promise.all([
                fetchDashboard(),
                fetchPromotions(),
                fetchCoupons(),
                fetchVouchers(),
                fetchGiftCards(),
                fetchLoyaltyData(),
                fetchLedger(),
              ]).finally(() => setLoading(false));
            }}
            title="Refresh All Marketing Data"
            className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {activeSubTab === "promotions" && (
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              <span>New Promotion</span>
            </button>
          )}

          {activeSubTab === "coupons" && (
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              <span>Create Coupon</span>
            </button>
          )}

          {activeSubTab === "vouchers" && (
            <button
              onClick={() => setShowVoucherModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              <span>Issue VIP Voucher</span>
            </button>
          )}

          {activeSubTab === "gift_cards" && (
            <button
              onClick={() => setShowGiftCardModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              <span>Issue Gift Card</span>
            </button>
          )}

          {(activeSubTab === "loyalty" || activeSubTab === "ledger") && (
            <button
              onClick={() => setShowLoyaltyAdjustModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <ShieldAlert size={14} />
              <span>Manual Points Adjustment</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: OVERVIEW & KPIS */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium uppercase tracking-wider">
                <span>Active Promotions</span>
                <Percent size={18} className="text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                {dashboard?.activePromotionsCount ?? promotions.filter((p) => p.isActive).length}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Live automatic cart and checkout promotions</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium uppercase tracking-wider">
                <span>Active Coupons</span>
                <Tag size={18} className="text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                {dashboard?.activeCouponsCount ?? coupons.filter((c) => c.isActive).length}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Redeemable coupon codes & VIP vouchers</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium uppercase tracking-wider">
                <span>Gift Card Liability</span>
                <Gift size={18} className="text-purple-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                AED {(dashboard?.totalGiftCardLiability || 0).toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Total unspent digital gift card balances</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium uppercase tracking-wider">
                <span>Loyalty Liability</span>
                <Coins size={18} className="text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                AED {(dashboard?.loyaltyLiabilityAED || 0).toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {(dashboard?.totalOutstandingLoyaltyPoints || 0).toLocaleString()} outstanding loyalty points
              </p>
            </div>
          </div>

          {/* Quick Shortcuts & Program Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <History size={16} className="text-amber-500" />
                  Recent Reward & Redemption Activity
                </h3>
                <button
                  onClick={() => setActiveSubTab("ledger")}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                >
                  <span>View All Ledger</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {ledgerEntries.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  No reward transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                  {ledgerEntries.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                            {tx.type}
                          </span>
                          <span>{tx.customer?.name || tx.customer?.email || "Customer"}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">{tx.note || tx.referenceId || "Standard transaction"}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-semibold ${
                            tx.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                        <div className="text-[10px] text-neutral-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loyalty Configuration Summary */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                Active Loyalty Rules
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Spend Earning Ratio</span>
                  <span className="font-mono font-medium">1 pt / {loyaltyConfigForm.earningRatioAED} AED</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Redemption Value</span>
                  <span className="font-mono font-medium">1 pt = {loyaltyConfigForm.redemptionRateAED} AED</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Welcome Bonus</span>
                  <span className="font-mono font-medium">+{loyaltyConfigForm.welcomeBonusPoints} pts</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Birthday Gift</span>
                  <span className="font-mono font-medium">+{loyaltyConfigForm.birthdayBonusPoints} pts</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-500">Points Validity</span>
                  <span className="font-mono font-medium">{loyaltyConfigForm.pointsExpiryDays} days</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab("loyalty")}
                className="w-full mt-2 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Configure Program & Tiers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTOMATIC PROMOTIONS */}
      {activeSubTab === "promotions" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Active Promotions</h3>
              <p className="text-xs text-neutral-500">Automatic discounts evaluated server-side at checkout</p>
            </div>
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90"
            >
              <Plus size={13} />
              <span>Add Promotion</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Name & Type</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Conditions</th>
                  <th className="py-3 px-4">Status & Validity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No automatic promotions found. Create one to reward customers.
                    </td>
                  </tr>
                ) : (
                  promotions.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.nameEn}</div>
                        <div className="text-[11px] text-neutral-400">{p.type}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {p.type === "PERCENTAGE" && `${p.value}% OFF`}
                        {p.type === "FIXED_AMOUNT" && `AED ${p.value} OFF`}
                        {p.type === "FREE_SHIPPING" && "Complimentary UAE Shipping"}
                        {p.type === "FREE_GIFT" && "Complimentary Luxury Miniature"}
                        {p.type === "BUY_X_GET_Y" && `Buy X Get Y (Val: ${p.value})`}
                        {p.type === "TIERED_DISCOUNT" && `Tiered (Max: ${p.value}%)`}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {p.minSpend ? `Min spend AED ${p.minSpend}` : "No min spend"}
                        {p.maxDiscount ? ` (Cap AED ${p.maxDiscount})` : ""}
                        {p.isStackable ? <span className="ml-1 text-emerald-600 font-medium">• Stackable</span> : ""}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            p.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-500" : "bg-neutral-400"}`} />
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {p.endsAt ? `Until ${new Date(p.endsAt).toLocaleDateString()}` : "No expiration"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">{p.priority || 0}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePromo(p.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Delete promotion"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COUPONS & DISCOUNT CODES */}
      {activeSubTab === "coupons" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Customer Coupon Codes</h3>
              <p className="text-xs text-neutral-500">Track redemptions, single-use limits, and first-order locks</p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90"
            >
              <Plus size={13} />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Benefit</th>
                  <th className="py-3 px-4">Usage & Limits</th>
                  <th className="py-3 px-4">Restrictions</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No coupon codes generated yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="py-3 px-4 font-mono font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `AED ${c.value} OFF`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium">{c.usedCount || 0}</span>
                        <span className="text-neutral-400"> / {c.maxUses ? c.maxUses : "∞"} uses</span>
                      </td>
                      <td className="py-3 px-4">
                        {c.firstOrderOnly && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-medium mr-1">
                            First Order Only
                          </span>
                        )}
                        {c.minSpend ? (
                          <span className="text-neutral-500 text-[11px]">Min AED {c.minSpend}</span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: VIP DISCOVERY VOUCHERS */}
      {activeSubTab === "vouchers" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">VIP Discovery Set Vouchers</h3>
              <p className="text-xs text-neutral-500">100% full-bottle redemption vouchers from Discovery Coffrets</p>
            </div>
            <button
              onClick={() => setShowVoucherModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90"
            >
              <Plus size={13} />
              <span>Issue Voucher</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Voucher Code</th>
                  <th className="py-3 px-4">Voucher Value</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Redemption Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No VIP vouchers issued yet.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="py-3 px-4 font-mono font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
                        {v.code}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {v.discountAmount ? `AED ${v.discountAmount}` : `${v.discountPercent}%`}
                      </td>
                      <td className="py-3 px-4">
                        {v.isDiscoveryVoucher ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-medium">
                            Discovery Coffret
                          </span>
                        ) : (
                          <span className="text-neutral-500">Bespoke VIP</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            v.usedAt
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {v.usedAt ? `Redeemed on ${new Date(v.usedAt).toLocaleDateString()}` : "Available"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteVoucher(v.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Revoke voucher"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DIGITAL GIFT CARDS */}
      {activeSubTab === "gift_cards" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Digital Gift Cards</h3>
              <p className="text-xs text-neutral-500">Audited store balance cards with atomic redemption logs</p>
            </div>
            <button
              onClick={() => setShowGiftCardModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90"
            >
              <Plus size={13} />
              <span>Issue Gift Card</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Card Code</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Initial Balance</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status & Expiry</th>
                  <th className="py-3 px-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {giftCards.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No gift cards issued yet.
                    </td>
                  </tr>
                ) : (
                  giftCards.map((gc) => (
                    <tr key={gc.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                      <td className="py-3 px-4 font-mono font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
                        {gc.code}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        AED {gc.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">AED {gc.initialBalance.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {gc.recipientName || "Anonymous"}
                        </div>
                        <div className="text-[11px] text-neutral-400">{gc.recipientEmail || "No email assigned"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            gc.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : gc.status === "DEPLETED"
                              ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {gc.status}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {gc.expiresAt ? `Exp: ${new Date(gc.expiresAt).toLocaleDateString()}` : "No expiry"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">{new Date(gc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: LOYALTY PROGRAM & TIERS */}
      {activeSubTab === "loyalty" && (
        <div className="space-y-6">
          {/* Program Config Form */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Loyalty Rules & Parameters</h3>
                <p className="text-xs text-neutral-500">Configure point acquisition, redemption, and life-cycle</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLoyaltyAdjustModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <ShieldAlert size={14} />
                <span>Manual Points Adjustment</span>
              </button>
            </div>

            <form onSubmit={handleSaveLoyaltyConfig} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Spend Earning Ratio (AED for 1 Point)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={loyaltyConfigForm.earningRatioAED}
                  onChange={(e) => setLoyaltyConfigForm({ ...loyaltyConfigForm, earningRatioAED: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-neutral-400 mt-1">E.g., 10 means 1 point earned per 10 AED spent</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Redemption Rate (AED Value of 1 Point)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.05"
                  value={loyaltyConfigForm.redemptionRateAED}
                  onChange={(e) => setLoyaltyConfigForm({ ...loyaltyConfigForm, redemptionRateAED: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-neutral-400 mt-1">E.g., 0.5 means 100 points = 50 AED checkout discount</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Welcome Registration Bonus Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={loyaltyConfigForm.welcomeBonusPoints}
                  onChange={(e) =>
                    setLoyaltyConfigForm({ ...loyaltyConfigForm, welcomeBonusPoints: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-neutral-400 mt-1">Awarded automatically to new customer accounts</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Birthday Gift Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={loyaltyConfigForm.birthdayBonusPoints}
                  onChange={(e) =>
                    setLoyaltyConfigForm({ ...loyaltyConfigForm, birthdayBonusPoints: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Points Validity Window (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  value={loyaltyConfigForm.pointsExpiryDays}
                  onChange={(e) =>
                    setLoyaltyConfigForm({ ...loyaltyConfigForm, pointsExpiryDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Save Loyalty Rules
                </button>
              </div>
            </form>
          </div>

          {/* Loyalty Tiers Matrix */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Membership Tiers Matrix</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(loyaltyData?.tiers || [
                {
                  tier: "PRIVILEGE",
                  nameEn: "Privilege Member",
                  thresholdSpend: 0,
                  multiplier: 1.0,
                  benefitsEn: ["1 pt per 10 AED", "Exclusive olfactory previews", "VIP Birthday gift"],
                },
                {
                  tier: "GOLD_SILLAGE",
                  nameEn: "Gold Sillage",
                  thresholdSpend: 2500,
                  multiplier: 1.5,
                  benefitsEn: ["1.5x points multiplier", "Complimentary express UAE delivery", "Bespoke perfumer consultations"],
                },
                {
                  tier: "ROYAL_AMBASSADOR",
                  nameEn: "Royal Ambassador",
                  thresholdSpend: 6000,
                  multiplier: 2.0,
                  benefitsEn: ["2.0x points multiplier", "Complimentary Discovery Coffret", "Dedicated luxury concierge hotline"],
                },
              ]).map((tier) => (
                <div
                  key={tier.tier}
                  className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400">
                      {tier.tier}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold">
                      {tier.multiplier}x Multiplier
                    </span>
                  </div>

                  <div className="text-base font-bold text-neutral-900 dark:text-white">{tier.nameEn}</div>

                  <div className="text-xs text-neutral-500">
                    Threshold: <span className="font-mono font-semibold text-neutral-900 dark:text-white">AED {tier.thresholdSpend}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60">
                    <div className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Tier Privileges
                    </div>
                    <ul className="space-y-1 text-xs text-neutral-500">
                      {(tier.benefitsEn || []).map((b: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: AUDIT LEDGER */}
      {activeSubTab === "ledger" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Immutable Loyalty Audit Ledger</h3>
              <p className="text-xs text-neutral-500">Comprehensive audit trail of every point earned, spent, reversed, or manually adjusted</p>
            </div>
            <button
              onClick={() => setShowLoyaltyAdjustModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <ShieldAlert size={13} />
              <span>Manual Adjustment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Points Delta</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Audit Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                {ledgerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 font-sans">
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  ledgerEntries.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 text-[11px]">
                      <td className="py-3 px-4 text-neutral-400">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {tx.customer?.name || "VIP Customer"}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">{tx.customer?.email || tx.customerId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={
                            tx.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{tx.balanceAfter} pts</td>
                      <td className="py-3 px-4 font-sans text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {tx.note || tx.referenceId || "Standard balance event"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROMOTION */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Create Automatic Promotion</h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Promotion Name (English)*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramadan Royal Gift With Purchase"
                  value={promoForm.nameEn}
                  onChange={(e) => setPromoForm({ ...promoForm, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Promotion Name (Arabic)</label>
                <input
                  type="text"
                  placeholder="e.g. هدية رمضانية فاخرة مع كل طلب"
                  value={promoForm.nameAr}
                  onChange={(e) => setPromoForm({ ...promoForm, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Promotion Type</label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value="PERCENTAGE">Percentage Discount (%)</option>
                    <option value="FIXED_AMOUNT">Fixed AED Discount</option>
                    <option value="FREE_SHIPPING">Free UAE Delivery</option>
                    <option value="FREE_GIFT">Complimentary Luxury Miniature</option>
                    <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
                    <option value="TIERED_DISCOUNT">Tiered Cart Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={promoForm.value}
                    onChange={(e) => setPromoForm({ ...promoForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Minimum Spend (AED)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={promoForm.minSpend}
                    onChange={(e) => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Max Discount Cap (AED)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 250"
                    value={promoForm.maxDiscount}
                    onChange={(e) => setPromoForm({ ...promoForm, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={promoForm.startsAt}
                    onChange={(e) => setPromoForm({ ...promoForm, startsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={promoForm.endsAt}
                    onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoForm.isStackable}
                    onChange={(e) => setPromoForm({ ...promoForm, isStackable: e.target.checked })}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Allow Stacking With Coupons</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Active Now</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold"
                >
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Create New Coupon Code</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Coupon Code (Uppercase)*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP15 or WELCOME100"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed AED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Min Spend (AED)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={couponForm.minSpend}
                    onChange={(e) => setCouponForm({ ...couponForm, minSpend: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Total Max Uses</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Empty for unlimited"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.firstOrderOnly}
                    onChange={(e) => setCouponForm({ ...couponForm, firstOrderOnly: e.target.checked })}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>First Order Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold"
                >
                  Generate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE VIP VOUCHER */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Issue VIP Voucher</h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Voucher Code (Auto-generated if blank)</label>
                <input
                  type="text"
                  placeholder="e.g. MSC-DISC-XXXX"
                  value={voucherForm.code}
                  onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Discount Amount (AED)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={voucherForm.discountAmount}
                  onChange={(e) => setVoucherForm({ ...voucherForm, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Default 150 AED for Discovery Coffret redemption</p>
              </div>

              <div>
                <label className="block font-medium mb-1">Validity (Days from issuance)</label>
                <input
                  type="number"
                  min="1"
                  value={voucherForm.expiresDays}
                  onChange={(e) => setVoucherForm({ ...voucherForm, expiresDays: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voucherForm.isDiscoveryVoucher}
                    onChange={(e) => setVoucherForm({ ...voucherForm, isDiscoveryVoucher: e.target.checked })}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Mark as Discovery Set Full-Bottle Redemption</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold"
                >
                  Issue Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE GIFT CARD */}
      {showGiftCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Issue Digital Gift Card</h3>
              <button
                onClick={() => setShowGiftCardModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGiftCard} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Gift Card Code (Leave blank for secure auto-gen)</label>
                <input
                  type="text"
                  placeholder="e.g. MSC-GC-9A82-C11D"
                  value={giftCardForm.code}
                  onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Initial Balance (AED)*</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={giftCardForm.initialBalance}
                  onChange={(e) => setGiftCardForm({ ...giftCardForm, initialBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Shaikha Al Maktoum"
                    value={giftCardForm.recipientName}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Recipient Email</label>
                  <input
                    type="email"
                    placeholder="client@luxury.ae"
                    value={giftCardForm.recipientEmail}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Personal Greeting / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional message included on the card certificate"
                  value={giftCardForm.personalMessage}
                  onChange={(e) => setGiftCardForm({ ...giftCardForm, personalMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Validity Window (Days)</label>
                <input
                  type="number"
                  min="30"
                  value={giftCardForm.expiresDays}
                  onChange={(e) => setGiftCardForm({ ...giftCardForm, expiresDays: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowGiftCardModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold"
                >
                  Issue Gift Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL LOYALTY ADJUSTMENT (MANDATORY AUDIT REASON) */}
      {showLoyaltyAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Manual Points Adjustment</h3>
              </div>
              <button
                onClick={() => setShowLoyaltyAdjustModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustLoyalty} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <span className="font-semibold">Security Audit Mandate:</span> All manual adjustments are recorded permanently in the immutable ledger alongside your administrator ID and required justification.
              </div>

              <div>
                <label className="block font-medium mb-1">Customer Email or Customer ID*</label>
                <input
                  type="text"
                  required
                  placeholder="client@luxury.ae or cust-..."
                  value={adjustForm.customerEmail}
                  onChange={(e) => setAdjustForm({ ...adjustForm, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Points Delta (+ to add, - to deduct)*</label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. +250 or -100"
                  value={adjustForm.pointsDelta}
                  onChange={(e) => setAdjustForm({ ...adjustForm, pointsDelta: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Mandatory Justification / Reason*</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. VIP goodwill compensation for delayed bespoke delivery, order #MSC-10293"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowLoyaltyAdjustModal(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Apply & Record in Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
