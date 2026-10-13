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
  const product = live || {
    id: "",
    slug,
    nameEn: preview.nameEn,
    nameAr: preview.nameAr,
    descriptionEn: preview.descriptionEn,
    descriptionAr: preview.descriptionAr,
    concentration: preview.concentration,
    brand: { name: preview.brand, slug: "", type: "NICHE" },
    scentFamily: null,
    gender: "UNISEX",
    images: preview.images,
    variants: preview.variants.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      sizeLabelEn: variant.labelEn,
      sizeLabelAr: variant.labelAr,
      price: variant.price,
      compareAtPrice: variant.compareAt ?? null,
      isSampleVial: false,
      availableQuantity: 0,
    })),
    notes: [],
  };
  return (
    <ProductExperience product={product} locale={locale} preview={!live} />
  );
}
