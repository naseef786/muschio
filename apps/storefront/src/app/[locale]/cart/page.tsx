"use client";

import React from "react";
import Image from "next/image";
import { Link, useRouter } from "../../../navigation";
import { Button, PriceDisplay, InstallmentBadge } from "@muschio/ui";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../../../context/cart-context";

export default function CartPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const router = useRouter();

  const { items, updateQuantity, removeItem, subtotal, shipping, total } = useCart();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-8 sm:space-y-12">
      <div className="space-y-2 border-b border-luxury-border pb-6">
        <span className="eyebrow text-accent">
          {isAr ? "مقتنياتك الفاخرة" : "Your Selection"}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
          {isAr ? "حقيبة التسوق العطرية" : "Haute Parfumerie Bag"}
        </h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Item List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-luxury-border bg-luxury-surface p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                  <div className="relative h-24 w-20 sm:h-28 sm:w-24 bg-luxury-surface2 border border-luxury-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold block truncate">
                      {item.brand}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg text-luxury-text font-normal truncate">
                      {isAr ? item.titleAr : item.title}
                    </h3>
                    <div className="text-xs text-luxury-muted font-sans truncate">{item.sizeLabel || "Full Bottle"}</div>
                    <PriceDisplay price={item.price} compareAtPrice={item.compareAtPrice} locale={locale} size="sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-luxury-border">
                  <div className="flex items-center border border-luxury-border">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1.5 text-xs hover:bg-luxury-surface2 text-luxury-text transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-mono text-luxury-text">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1.5 text-xs hover:bg-luxury-surface2 text-luxury-text transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-luxury-muted hover:text-accent transition-colors p-1"
                    aria-label="Remove item"
                    title={isAr ? "إزالة من الحقيبة" : "Remove from bag"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary (5 cols) */}
          <div className="lg:col-span-5 border border-luxury-border bg-luxury-surface p-5 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl text-luxury-text font-normal border-b border-luxury-border pb-4">
              {isAr ? "ملخص الطلب" : "Order Summary"}
            </h2>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-luxury-muted">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <PriceDisplay price={subtotal} locale={locale} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">{isAr ? "الشحن الفاخر المبرد" : "Express GCC Shipping"}</span>
                <span className="text-emerald-600 font-medium">
                  {shipping === 0 ? (isAr ? "مجاني" : "Complimentary") : `${shipping} AED`}
                </span>
              </div>
              <div className="border-t border-luxury-border pt-3 flex justify-between text-base font-semibold">
                <span className="text-luxury-text">{isAr ? "المجموع النهائي" : "Estimated Total"}</span>
                <PriceDisplay price={total} locale={locale} size="lg" />
              </div>
            </div>

            <InstallmentBadge price={total} locale={locale} />

            <Button
              onClick={() => router.push("/checkout")}
              variant="accent"
              size="lg"
              className="w-full h-12 sm:h-14"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{isAr ? "متابعة الدفع الفاخر" : "Proceed to Secure Checkout"}</span>
                <ArrowRight size={16} className="rtl:rotate-180" />
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center border border-luxury-border bg-luxury-surface space-y-6 max-w-md mx-auto">
          <ShoppingBag size={36} className="mx-auto text-luxury-muted opacity-60" />
          <p className="text-sm text-luxury-muted font-sans">
            {isAr ? "حقيبة التسوق فارغة حالياً." : "Your olfactory bag is currently empty."}
          </p>
          <Button asChild variant="primary" size="md">
            <Link href="/shop">{isAr ? "استكشف العطور" : "Explore Vault"}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
