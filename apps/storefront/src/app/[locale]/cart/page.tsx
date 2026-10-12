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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-medium">
          {isAr ? "مقتنياتك الفاخرة" : "Your Selection"}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "حقيبة التسوق العطرية" : "Haute Parfumerie Bag"}
        </h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Item List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-6 flex items-center justify-between gap-6"
              >
                <div className="relative h-28 w-24 bg-zinc-950 flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover object-center" />
                </div>

                <div className="space-y-1 flex-1">
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">
                    {item.brand}
                  </span>
                  <h3 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">
                    {isAr ? item.titleAr : item.title}
                  </h3>
                  <div className="text-xs text-zinc-500 font-sans">{item.sizeLabel || "Full Bottle"}</div>
                  <PriceDisplay price={item.price} locale={locale} size="sm" />
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-400 hover:text-accent transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2.5 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2.5 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary (5 cols) */}
          <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 space-y-6">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              {isAr ? "ملخص الطلب" : "Order Summary"}
            </h2>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-zinc-500">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <PriceDisplay price={subtotal} locale={locale} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{isAr ? "الشحن الفاخر المبرد" : "Express GCC Shipping"}</span>
                <span className="text-emerald-600 font-medium">
                  {shipping === 0 ? (isAr ? "مجاني" : "Complimentary") : `${shipping} AED`}
                </span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between text-base font-semibold">
                <span>{isAr ? "المجموع النهائي" : "Estimated Total"}</span>
                <PriceDisplay price={total} locale={locale} size="lg" />
              </div>
            </div>

            <InstallmentBadge price={total} locale={locale} />

            <Button
              onClick={() => router.push("/checkout")}
              variant="accent"
              size="lg"
              className="w-full h-14"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{isAr ? "متابعة الدفع الفاخر" : "Proceed to Secure Checkout"}</span>
                <ArrowRight size={16} />
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center border border-zinc-200 dark:border-zinc-800 bg-luxury-surface space-y-6 max-w-md mx-auto">
          <ShoppingBag size={36} className="mx-auto text-zinc-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans">
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
