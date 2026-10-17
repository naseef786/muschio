import { notFound } from "next/navigation";
import { muschioApi } from "../../../../lib/api";
import { PREVIEW_CATALOG } from "../../../../lib/preview-catalog";
import { ProductExperience } from "../../../../components/product-experience";

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const live = await muschioApi.getProductBySlug(slug);
  const preview = PREVIEW_CATALOG[slug];
  if (!live && !preview) notFound();

  const brandName = live ? live.brand.name : preview.brand;
  const brandSlug = live ? (live.brand.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")) : brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const product = {
    id: live ? live.id : preview.slug,
    slug: live ? live.slug : slug,
    nameEn: live ? live.nameEn : preview.nameEn,
    nameAr: live ? live.nameAr : preview.nameAr,
    descriptionEn: live ? live.descriptionEn : preview.descriptionEn,
    descriptionAr: live ? live.descriptionAr : preview.descriptionAr,
    concentration: live ? live.concentration : preview.concentration,
    brand: { name: brandName, slug: brandSlug, type: live ? live.brand.type : "NICHE" },
    origin: preview?.origin,
    perfumer: preview?.perfumer,
    perfumerBio: preview?.perfumerBio,
    longevity: preview?.longevity,
    sillage: preview?.sillage,
    images: (live?.images && live.images.length > 0) ? live.images : (preview?.images || []),
    variants: live
      ? live.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          sizeLabelEn: v.sizeLabelEn,
          sizeLabelAr: v.sizeLabelAr,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          isSampleVial: v.isSampleVial,
          availableQuantity: v.availableQuantity,
        }))
      : preview.variants.map((variant: any) => ({
          id: variant.id,
          sku: variant.sku,
          sizeLabelEn: variant.labelEn,
          sizeLabelAr: variant.labelAr,
          price: variant.price,
          compareAtPrice: variant.compareAt ?? null,
          isSampleVial: variant.volumeMl === 2,
          availableQuantity: variant.stockCount || 0,
        })),
    notes: live
      ? live.notes.map((n) => ({
          id: n.slug,
          name: locale === "ar" ? n.nameAr : n.nameEn,
          slug: n.slug,
          position: n.position,
        }))
      : (preview.notes || []).map((n: any) => ({
          id: n.id || n.slug,
          name: n.name || (locale === "ar" ? (n.nameAr || n.nameEn) : n.nameEn),
          slug: n.slug,
          position: n.position,
        })),
  };

  // Find other products for "More from this house" and "You may also like"
  const allPreviewItems = Object.values(PREVIEW_CATALOG);
  const houseProducts = allPreviewItems
    .filter((p: any) => p.slug !== slug && p.brand === brandName)
    .map((p: any) => ({
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      brand: p.brand,
      concentration: p.concentration,
      price: p.variants?.[0]?.price || 0,
      compareAtPrice: p.variants?.[0]?.compareAt,
      images: p.images,
    }));

  const relatedProducts = allPreviewItems
    .filter((p: any) => p.slug !== slug && p.brand !== brandName)
    .slice(0, 4)
    .map((p: any) => ({
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      brand: p.brand,
      concentration: p.concentration,
      price: p.variants?.[0]?.price || 0,
      compareAtPrice: p.variants?.[0]?.compareAt,
      images: p.images,
    }));

  return (
    <ProductExperience
      product={product}
      houseProducts={houseProducts}
      relatedProducts={relatedProducts}
      locale={locale}
      preview={!live}
    />
  );
}
