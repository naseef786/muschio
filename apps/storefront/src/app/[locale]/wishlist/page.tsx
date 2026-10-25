"use client";

import React from "react";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Button, Badge, PriceDisplay } from "@muschio/ui";
import { useCart } from "../../../context/cart-context";
import { useWishlist, WishlistItem } from "../../../context/wishlist-context";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles } from "lucide-react";

export default function WishlistPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const { addItem } = useCart();
  const { items, removeItem, clearWishlist } = useWishlist();

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.variantId) return;
    await addItem({
      variantId: item.variantId,
      slug: item.slug,
      title: item.nameEn,
      titleAr: item.nameAr || item.nameEn,
      brand: item.brand,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      image: item.image,
      sizeLabel: "100ml Standard",
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-luxury-muted hover:text-luxury-text transition-colors"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          <span>{isAr ? "العودة للمتجر" : "Back to Catalog"}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-luxury-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent text-xs font-sans font-medium uppercase tracking-widest">
            <Heart size={14} className="fill-accent text-accent" />
            <span>{isAr ? "خزانتك المفضلة" : "Private Wishlist"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal">
            {isAr ? "خزانتك العطرية المختارة" : "Your Curated Fragrance Vault"}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-sans max-w-xl">
            {isAr
              ? "تحف عطرية نيش قمت بحفظها لاقتنائها أو تجربتها عبر عينات الاستكشاف الرسمية."
              : "Masterpieces curated for acquisition or sampling via official discovery vials."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans text-luxury-muted">
          <span>
            {items.length} {isAr ? "عطور محفوظة" : "saved fragrances"}
          </span>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-luxury-muted hover:text-rose-500 transition-colors underline underline-offset-4"
            >
              {isAr ? "تفريغ القائمة" : "Clear Vault"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="py-16 sm:py-24 text-center border border-luxury-border bg-luxury-surface space-y-6 max-w-lg mx-auto p-6 sm:p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Heart size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-luxury-text font-normal">
              {isAr ? "قائمة رغباتك فارغة حالياً" : "Your Wishlist is Empty"}
            </h2>
            <p className="text-xs text-luxury-muted font-sans">
              {isAr
                ? "استكشف أندر العطور النيش والخلاصات العطرية الملكية وأضفها إلى خزانتك الخاصة."
                : "Explore rare niche extraits and royal essences to build your bespoke wishlist."}
            </p>
          </div>
          <Button asChild variant="accent" size="md">
            <Link href="/shop">
              {isAr ? "استكشف المجموعة" : "Explore The Vault"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.slug}
              className="group border border-luxury-border bg-luxury-surface hover:border-luxury-borderBold transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-luxury-surface2 border-b border-luxury-border flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.nameEn}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 start-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
                  <Badge
                    variant={item.brandType === "NICHE" ? "niche" : "default"}
                    className="text-[9px]"
                  >
                    {item.brand}
                  </Badge>
                </div>
                <button
                  onClick={() => removeItem(item.slug)}
                  className="absolute top-2.5 end-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-luxury-surface/90 backdrop-blur-md border border-luxury-border text-luxury-muted hover:text-rose-500 flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm"
                  aria-label={isAr ? "إزالة من المفضلة" : "Remove item"}
                  title={isAr ? "إزالة من المفضلة" : "Remove from Private Vault"}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="p-3.5 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-wider text-luxury-muted block truncate">
                    {item.concentration}
                  </span>
                  <Link href={`/product/${item.slug}`} className="block">
                    <h3 className="font-serif text-sm sm:text-base text-luxury-text font-normal group-hover:text-accent transition-colors line-clamp-1">
                      {isAr ? item.nameAr : item.nameEn}
                    </h3>
                  </Link>
                </div>

                <div className="pt-2.5 border-t border-luxury-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <PriceDisplay
                      price={item.price}
                      locale={locale}
                      size="sm"
                    />
                    {item.compareAtPrice && (
                      <span className="text-[11px] text-luxury-muted line-through">
                        {item.compareAtPrice} AED
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      variant="accent"
                      size="sm"
                      className="w-full text-xs flex items-center justify-center gap-1 py-2 sm:py-2.5 h-auto"
                    >
                      <ShoppingBag size={13} />
                      <span>{isAr ? "أضف" : "Bag"}</span>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full text-xs py-2 sm:py-2.5 h-auto"
                    >
                      <Link href={`/product/${item.slug}`}>
                        {isAr ? "عرض" : "View"}
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
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start">
          <div className="inline-flex items-center gap-1.5 text-accent text-xs font-sans font-medium uppercase tracking-widest">
            <Sparkles size={14} />
            <span>
              {isAr ? "مجموعة العينات الملكية" : "5x2ml Bespoke Discovery Set"}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
            {isAr
              ? "جرب العطور على بشرتك قبل اقتناء الزجاجة الكاملة"
              : "Sample on Skin Before Acquiring Full Bottles"}
          </h2>
          <p className="text-xs sm:text-sm text-luxury-muted font-sans max-w-xl">
            {isAr
              ? "اختر ٥ عينات رسمية سعة ٢ مل مع قسيمة استرداد بقيمة ١٠٠٪ تخصم مباشرة من طلبك التالي."
              : "Curate 5 official 2ml atomizers with a 100% redeemable voucher toward any full bottle acquisition."}
          </p>
        </div>

        <Button asChild variant="accent" size="lg" className="whitespace-nowrap px-8">
          <Link href="/discover/sets">
            {isAr ? "صمم مجموعتك الآن" : "Build Discovery Set"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
