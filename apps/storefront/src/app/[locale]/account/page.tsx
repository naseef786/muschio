"use client";

import React, { useState } from "react";
import { Link } from "../../../navigation";
import { Badge, Button, PriceDisplay } from "@muschio/ui";
import {
  Gift,
  PhoneCall,
} from "lucide-react";

export default function AccountPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"orders" | "vouchers" | "profile">("orders");

  const patron = {
    name: "H.E. Sultan Al-Nuaimi",
    nameAr: "سعادة سلطان النعيمي",
    tier: "Patron Privé (Black Tier)",
    email: "sultan.alnuaimi@muschio.ae",
    phone: "+971 50 882 1994",
    city: "Dubai, United Arab Emirates",
    preferredNotes: ["Royal Taif Rose", "Silver Frankincense", "Cambodian Oud"],
  };

  const orders = [
    {
      id: "MSC-2026-981245",
      date: "October 6, 2026",
      items: "Interlude 53 Man Extrait de Parfum (100ml)",
      itemsAr: "إنترلود 53 مان إكستري دي بارفان (100 مل)",
      total: 1850,
      paymentMethod: "Tabby (4x Installments)",
      status: "PAID",
      statusLabelEn: "Secured & Out for Courier",
      statusLabelAr: "مدفوع ومُسلّم للشحن المبرد",
      trackingNumber: "DHL-MSC-7749102",
    },
    {
      id: "MSC-2026-981102",
      date: "September 24, 2026",
      items: "Custom 5x2ml Niche Discovery Set",
      itemsAr: "مجموعة استكشاف نيش مخصصة (5 × 2 مل)",
      total: 290,
      paymentMethod: "Apple Pay",
      status: "DELIVERED",
      statusLabelEn: "Delivered to Residence",
      statusLabelAr: "تم التوصيل إلى القصر",
      trackingNumber: "ARX-DXB-991204",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* 1. PATRON HEADER */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-zinc-950 text-gold flex items-center justify-center font-serif text-2xl border border-gold/40 shadow-inner">
            SN
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
                {isAr ? patron.nameAr : patron.name}
              </h1>
              <Badge variant="gold">{patron.tier}</Badge>
            </div>
            <p className="text-xs text-zinc-500 font-sans">
              {patron.email} • {patron.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs">
            <PhoneCall size={14} className="text-gold" />
            <span>{isAr ? "المستشار الشخصي الخاص" : "Private Concierge"}</span>
          </Button>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-sans uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-6 font-semibold transition-all border-b-2 ${
            activeTab === "orders"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isAr ? "الطلبات والتعقب" : "Acquisitions & Orders"}
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`pb-4 px-6 font-semibold transition-all border-b-2 ${
            activeTab === "vouchers"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isAr ? "قسائم الاستكشاف المستردة" : "Discovery Vouchers"}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-6 font-semibold transition-all border-b-2 ${
            activeTab === "profile"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isAr ? "الهوية العطرية والتفضيلات" : "Olfactory Profile"}
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
              {isAr ? "سجل الاقتناء والطلبات الفاخرة" : "Recent Orders"}
            </h2>
            <span className="text-xs text-zinc-500 font-sans">
              {orders.length} {isAr ? "طلبات مسجلة" : "orders on file"}
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">
                        {ord.id}
                      </span>
                      <Badge variant={ord.status === "PAID" ? "accent" : "gold"}>
                        {isAr ? ord.statusLabelAr : ord.statusLabelEn}
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-500 font-sans block">{ord.date}</span>
                  </div>

                  <div className="text-start sm:text-end">
                    <span className="text-[10px] uppercase font-sans tracking-widest text-zinc-400 block">
                      {ord.paymentMethod}
                    </span>
                    <PriceDisplay price={ord.total} locale={locale} size="md" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">
                      {isAr ? ord.itemsAr : ord.items}
                    </h4>
                    <p className="text-xs font-mono text-zinc-500">
                      Tracking: {ord.trackingNumber} (Temperature-Controlled Express)
                    </p>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order-confirmation/${ord.id}`}>
                      {isAr ? "تفاصيل الطلب والفاتورة" : "View Invoice & Receipt"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "vouchers" && (
        <div className="space-y-8">
          <div className="border border-gold/40 bg-gold/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-start">
              <div className="inline-flex items-center gap-2 text-gold text-xs font-sans font-semibold uppercase tracking-widest">
                <Gift size={14} />
                <span>{isAr ? "قسيمة استرداد نشطة" : "Active Voucher Credit"}</span>
              </div>
              <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
                {isAr ? "رصيد بقيمة 290 درهم متاح في حسابك" : "290 AED Redeemable Credit Available"}
              </h3>
              <p className="text-xs text-zinc-500 font-sans max-w-xl">
                {isAr
                  ? "مستردة بالكامل من صندوق عينات الاستكشاف الخاص بك. تُطبق تلقائياً عند طلب أي زجاجة عطر بالحجم الكامل."
                  : "Credited from your Discovery Set purchase. Automatically applied at checkout toward any full-bottle extrait."}
              </p>
            </div>

            <Button asChild variant="gold" size="lg">
              <Link href="/shop">{isAr ? "اقتنِ عطراً الآن" : "Redeem on Full Bottle"}</Link>
            </Button>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 space-y-8">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
              {isAr ? "البصمة العطرية المفضلة" : "Your Signature Olfactory Accords"}
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              {isAr
                ? "النوتات التي يفضلها ذوقك لتخصيص ترشيحات المستشار الذكي والطلبات المسبقة."
                : "Preferred essences used to personalize AI Scent Sommelier suggestions and rare batch allocations."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {patron.preferredNotes.map((note, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full border border-gold/40 bg-gold/10 text-gold font-serif text-sm font-medium"
              >
                ✦ {note}
              </span>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button asChild variant="accent" size="sm">
              <Link href="/discover/ai">
                {isAr ? "تحديث التفضيلات مع المستشار الذكي" : "Re-consult AI Sommelier"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
