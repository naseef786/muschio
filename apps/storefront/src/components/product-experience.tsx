"use client";
import { useState } from "react";
import Image from "next/image";
import { StorefrontProduct } from "@muschio/types";
import { PriceDisplay } from "@muschio/ui";
import { Link } from "../navigation";
import { useCart } from "../context/cart-context";
export function ProductExperience({
  product,
  locale,
  preview,
}: {
  product: StorefrontProduct;
  locale: "en" | "ar";
  preview: boolean;
}) {
  const c = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [variantId, setVariantId] = useState(
    product.variants.find((v) => !v.isSampleVial)?.id,
  );
  const [image, setImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const variant = product.variants.find((v) => v.id === variantId);
  const available =
    !preview &&
    !!variant &&
    !variant.isSampleVial &&
    variant.availableQuantity >= quantity;
  const approvedImage =
    image &&
    /^https:\/\/(images\.unsplash\.com|media\.muschio\.luxury)\//.test(image);
  async function add() {
    if (!available || !variant) return;
    await cart.addItem({
      variantId: variant.id,
      slug: product.slug,
      title: product.nameEn,
      titleAr: product.nameAr,
      brand: product.brand.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity,
      image: approvedImage ? image : "/product-placeholder.svg",
      sizeLabel: variant.sizeLabelEn,
    });
  }
  return (
    <div className="editorial-section">
      <nav className="text-xs mb-8" aria-label={c("Breadcrumb", "مسار التصفح")}>
        <Link href="/shop">{c("Collection", "المجموعة")}</Link> /{" "}
        {product.brand.name}
      </nav>
      {preview && (
        <p role="status" className="delivery-status mb-8">
          {c(
            "Collection preview. Live stock and online purchasing are unavailable for this item.",
            "معاينة المجموعة. المخزون المباشر والشراء عبر الإنترنت غير متاحين لهذا المنتج.",
          )}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-[4/5] bg-luxury-surface2">
            {approvedImage ? (
              <Image
                src={image}
                alt={c(product.nameEn, product.nameAr)}
                fill
                priority
                sizes="(max-width:760px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm">
                {c("Product image unavailable", "صورة المنتج غير متاحة")}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {product.images.map((src, i) => (
                <button
                  className="border border-luxury-border px-4 py-3 text-xs"
                  key={src}
                  onClick={() => setImage(src)}
                  aria-pressed={image === src}
                >
                  {c("View", "صورة")} {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <span className="eyebrow">{product.brand.name}</span>
          <h1 className="font-serif text-4xl sm:text-5xl">
            {c(product.nameEn, product.nameAr)}
          </h1>
          <p className="text-sm leading-relaxed">
            {product.concentration.replaceAll("_", " ")}
          </p>
          <p className="text-sm leading-7">
            {c(product.descriptionEn, product.descriptionAr)}
          </p>
          {variant && (
            <PriceDisplay
              price={variant.price}
              compareAtPrice={variant.compareAtPrice}
              locale={locale}
              size="lg"
            />
          )}
          <fieldset>
            <legend className="text-sm mb-3">
              {c("Choose your size", "اختر الحجم")}
            </legend>
            <div className="flex flex-wrap gap-3">
              {product.variants
                .filter((v) => !v.isSampleVial)
                .map((v) => (
                  <label
                    key={v.id}
                    className="flex gap-2 items-center border border-luxury-border p-3"
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={v.id}
                      checked={v.id === variantId}
                      onChange={() => {
                        setVariantId(v.id);
                        setQuantity(1);
                      }}
                    />
                    {c(v.sizeLabelEn, v.sizeLabelAr)}
                  </label>
                ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="product-quantity" className="block text-sm mb-2">
              {c("Quantity", "الكمية")}
            </label>
            <input
              id="product-quantity"
              type="number"
              min={1}
              max={Math.min(99, variant?.availableQuantity || 1)}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                )
              }
              className="glass-input p-3 w-24"
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!available}
            className="editorial-button w-full disabled:opacity-50"
          >
            {preview
              ? c("Online purchasing coming soon", "الشراء عبر الإنترنت قريباً")
              : available
                ? c("Add to bag", "أضف إلى الحقيبة")
                : c("Currently unavailable", "غير متاح حالياً")}
          </button>
          <p className="text-xs leading-6">
            {c(
              "Availability and prices are verified at checkout. Delivery details depend on your destination.",
              "يتم التحقق من التوفر والأسعار عند إتمام الشراء. تعتمد تفاصيل التوصيل على وجهتك.",
            )}
          </p>
          <Link href="/delivery" className="editorial-text-link">
            {c("Delivery information", "معلومات التوصيل")}
          </Link>
          {!!product.notes.length && (
            <section className="border-t border-luxury-border pt-5">
              <h2 className="font-serif text-2xl mb-4">
                {c("The scent notes", "نوتات العطر")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {product.notes.map((note) => (
                  <Link
                    key={note.slug + note.position}
                    className="border border-luxury-border p-3 text-sm"
                    href={`/notes/${note.slug}`}
                  >
                    {c(note.nameEn, note.nameAr)} · {note.position}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
