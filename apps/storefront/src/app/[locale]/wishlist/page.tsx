"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Button, Badge, PriceDisplay } from "@muschio/ui";
import { useCart } from "../../../context/cart-context";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles } from "lucide-react";

interface WishlistItem {
  slug: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  brandType: "NICHE" | "DESIGNER";
  concentration: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  variantId: string;
}

const DEFAULT_WISHLIST: WishlistItem[] = [];

export default function WishlistPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>(DEFAULT_WISHLIST);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("muschio_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      // Local storage fallback
    }
  }, []);

  const removeItem = (slug: string) => {
    const updated = items.filter((item) => item.slug !== slug);
    setItems(updated);
    try {
      localStorage.setItem("muschio_wishlist", JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    await addItem({
      variantId: item.variantId,
      slug: item.slug,
      title: item.nameEn,
      titleAr: item.nameAr,
      brand: item.brand,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      image: item.image,
      sizeLabel: "100ml Standard",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{isAr ? "العودة للمتجر" : "Back to Catalog"}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent text-xs font-sans font-semibold uppercase tracking-widest">
            <Heart size={14} className="fill-accent text-accent" />
            <span>{isAr ? "قائمتك المفضلة" : "Private Wishlist"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light">
            {isAr ? "خزانتك العطرية المختارة" : "Your Curated Fragrance Vault"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-xl">
            {isAr
              ? "تحف عطرية نيش قمت بحفظها لاقتنائها أو تجربتها عبر عينات الاستكشاف الرسمية."
              : "Masterpieces curated for acquisition or sampling via official discovery vials."}
          </p>
        </div>

        <div className="text-xs font-sans text-zinc-500">
          <span>
            {items.length} {isAr ? "عطور محفوظة" : "saved fragrances"}
          </span>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="py-24 text-center border border-zinc-200 dark:border-zinc-800 bg-luxury-surface space-y-6 max-w-xl mx-auto p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Heart size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
              {isAr ? "قائمة رغباتك فارغة حالياً" : "Your Wishlist is Empty"}
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              {isAr
                ? "استكشف أندر العطور النيش والخلاصات العطرية الملكية وأضفها إلى خزانتك الخاصة."
                : "Explore rare niche extraits and royal essences to build your bespoke wishlist."}
            </p>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/shop">
              {isAr ? "استكشف المجموعة" : "Explore The Vault"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.slug}
              className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
            >
              <div className="relative h-80 w-full overflow-hidden bg-zinc-950">
                <Image
                  src={item.image}
                  alt={item.nameEn}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 start-3">
                  <Badge
                    variant={item.brandType === "NICHE" ? "niche" : "default"}
                  >
                    {item.brand}
                  </Badge>
                </div>
                <button
                  onClick={() => removeItem(item.slug)}
                  className="absolute top-3 end-3 p-2 rounded-full bg-black/60 text-zinc-300 hover:text-accent hover:bg-black transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-zinc-400">
                    {item.concentration}
                  </span>
                  <Link href={`/product/${item.slug}`} className="block">
                    <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                      {isAr ? item.nameAr : item.nameEn}
                    </h3>
                  </Link>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <PriceDisplay
                      price={item.price}
                      locale={locale}
                      size="md"
                    />
                    {item.compareAtPrice && (
                      <span className="text-xs text-zinc-400 line-through">
                        {item.compareAtPrice} AED
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={
                        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                          item.variantId,
                        )
                      }
                      variant="accent"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={14} />
                      <span>{isAr ? "أضف للحقيبة" : "Add to Bag"}</span>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/product/${item.slug}`}>
                        {isAr ? "التفاصيل" : "Details"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discovery Sets Banner */}
      <div className="border border-gold/40 bg-luxury-surface p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-start">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-sans font-semibold uppercase tracking-widest">
            <Sparkles size={14} />
            <span>
              {isAr ? "مجموعة العينات الملكية" : "5x2ml Bespoke Discovery Set"}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
            {isAr
              ? "جرب العطور على بشرتك قبل اقتناء الزجاجة الكاملة"
              : "Sample on Skin Before Acquiring Full Bottles"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-xl">
            {isAr
              ? "اختر 5 عينات رسمية سعة 2 مل مع قسيمة استرداد بقيمة 100% تخصم مباشرة من طلبك التالي."
              : "Curate 5 official 2ml atomizers with a 100% redeemable voucher toward any full bottle acquisition."}
          </p>
        </div>

        <Button asChild variant="gold" size="lg">
          <Link href="/discover/sets">
            {isAr ? "صمم مجموعتك الآن" : "Build Discovery Set"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
