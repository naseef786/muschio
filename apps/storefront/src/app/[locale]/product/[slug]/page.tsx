import { notFound } from "next/navigation";
import { muschioApi } from "../../../../lib/api";
import { ProductExperience } from "../../../../components/product-experience";

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const [live, allProductsData] = await Promise.all([
    muschioApi.getProductBySlug(slug),
    muschioApi.getProducts({ limit: 12 }),
  ]);

  if (!live) {
    notFound();
  }

  const brandName = live.brand.name;
  const brandSlug = live.brand.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const isAmouage = live.slug === "amouage-interlude-53-man";
  const images = isAmouage
    ? ["/amouage-placeholder.svg", ...(live.images.slice(1))]
    : (live.images.length > 0 ? live.images : ["/product-placeholder.svg"]);

  const product = {
    id: live.id,
    slug: live.slug,
    nameEn: live.nameEn,
    nameAr: live.nameAr,
    descriptionEn: live.descriptionEn,
    descriptionAr: live.descriptionAr,
    concentration: live.concentration.replaceAll("_", " "),
    brand: { name: brandName, slug: brandSlug, type: live.brand.type },
    origin: (live.brand as any)?.countryOfOrigin || undefined,
    perfumer: undefined,
    perfumerBio: undefined,
    longevity: "20+ Hours",
    sillage: "Royal Projection",
    images,
    variants: live.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      sizeLabelEn: v.sizeLabelEn,
      sizeLabelAr: v.sizeLabelAr,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      isSampleVial: v.isSampleVial,
      availableQuantity: v.availableQuantity,
    })),
    notes: live.notes.map((n) => ({
      id: n.slug,
      name: locale === "ar" ? n.nameAr : n.nameEn,
      slug: n.slug,
      position: n.position,
    })),
  };

  const allProducts = allProductsData || [];

  const houseProducts = allProducts
    .filter((p) => p.slug !== slug && p.brand.name === brandName)
    .map((p) => {
      const v = p.variants.find((variant) => !variant.isSampleVial) || p.variants[0];
      const isAmo = p.slug === "amouage-interlude-53-man";
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: p.concentration.replaceAll("_", " "),
        price: v?.price || 0,
        compareAtPrice: v?.compareAtPrice,
        images: isAmo ? ["/amouage-placeholder.svg", ...p.images] : p.images,
      };
    });

  const relatedProducts = allProducts
    .filter((p) => p.slug !== slug && p.brand.name !== brandName)
    .slice(0, 4)
    .map((p) => {
      const v = p.variants.find((variant) => !variant.isSampleVial) || p.variants[0];
      const isAmo = p.slug === "amouage-interlude-53-man";
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: p.concentration.replaceAll("_", " "),
        price: v?.price || 0,
        compareAtPrice: v?.compareAtPrice,
        images: isAmo ? ["/amouage-placeholder.svg", ...p.images] : p.images,
      };
    });

  return (
    <ProductExperience
      product={product}
      houseProducts={houseProducts}
      relatedProducts={relatedProducts}
      locale={locale}
      preview={false}
    />
  );
}
