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
  const images = live.images.length > 0 ? live.images : ["/product-placeholder.svg"];

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
    perfumer:
      live.perfumer ||
      ((live as any).perfumers && (live as any).perfumers.length > 0
        ? (live as any).perfumers
            .map((rel: any) => rel.perfumer?.name || rel.name)
            .filter(Boolean)
            .join(", ")
        : undefined),
    perfumerBio:
      live.perfumerBio ||
      (live as any).perfumers?.[0]?.perfumer?.bioEn ||
      undefined,
    scentFamily: live.scentFamily?.nameEn || undefined,
    longevity: "20+ Hours",
    sillage: "Royal Projection",
    images,
    variants: live.variants.map((v) => {
      const regPrice = Number(v.regularPrice ?? v.originalPrice ?? (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : v.price));
      const rawDisc = v.discountPrice !== null && v.discountPrice !== undefined
        ? Number(v.discountPrice)
        : (v.salePrice ? Number(v.salePrice) : (v.compareAtPrice && v.compareAtPrice > v.price ? v.price : null));
      const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regPrice;
      const sellingPrice = hasDisc ? rawDisc! : regPrice;
      const compareAt = hasDisc ? regPrice : null;

      return {
        id: v.id,
        sku: v.sku,
        volume: v.volume || (v.volumeMl ? `${v.volumeMl}ml` : v.sizeLabelEn || "100ml"),
        volumeMl: v.volumeMl,
        sizeLabelEn: v.sizeLabelEn || (v.volume ? `${v.volume} Flacon` : "100ml Flacon"),
        sizeLabelAr: v.sizeLabelAr || (v.volume ? `${v.volume} مل` : "100 مل"),
        regularPrice: regPrice,
        originalPrice: regPrice,
        price: sellingPrice,
        compareAtPrice: compareAt,
        discountPrice: hasDisc ? rawDisc : null,
        salePrice: hasDisc ? rawDisc : null,
        isSampleVial: v.isSampleVial,
        stockQuantity: v.stockQuantity ?? v.availableQuantity ?? 25,
        availableQuantity: v.availableQuantity ?? v.stockQuantity ?? 25,
        isDefault: Boolean(v.isDefault),
      };
    }),
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
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: p.concentration.replaceAll("_", " "),
        price: v?.price || 0,
        compareAtPrice: v?.compareAtPrice,
        variants: p.variants,
        images: p.images.length > 0 ? p.images : ["/product-placeholder.svg"],
      };
    });

  const relatedProducts = allProducts
    .filter((p) => p.slug !== slug && p.brand.name !== brandName)
    .slice(0, 4)
    .map((p) => {
      const v = p.variants.find((variant) => !variant.isSampleVial) || p.variants[0];
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: p.concentration.replaceAll("_", " "),
        price: v?.price || 0,
        compareAtPrice: v?.compareAtPrice,
        variants: p.variants,
        images: p.images.length > 0 ? p.images : ["/product-placeholder.svg"],
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
