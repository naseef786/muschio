import { notFound, permanentRedirect } from "next/navigation";
import { CatalogService, storefrontProduct } from "@muschio/api";
import { ProductExperience } from "../../../../components/product-experience";
import { resolveProductSlug } from "../../../../lib/seo-redirects";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  // Directly query the catalog in-process for instant, 100% live database data
  let result = await CatalogService.getProductBySlug(slug);

  if (!result || !result.product) {
    // Attempt alias resolution for legacy Google links
    const canonicalSlug = resolveProductSlug(slug);
    if (canonicalSlug && canonicalSlug !== slug) {
      permanentRedirect(`/${locale}/product/${canonicalSlug}`);
    }
    notFound();
  }

  const live = storefrontProduct(result.product);

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
    concentration: (live.concentration || "").replaceAll("_", " "),
    brand: { name: brandName, slug: brandSlug, type: live.brand.type },
    origin: (live as any).countryOfOrigin || (live.brand as any)?.countryOfOrigin || undefined,
    perfumer: (live as any).perfumer || undefined,
    perfumerBio: (live as any).perfumerBio || undefined,
    scentFamily: live.scentFamily?.nameEn || undefined,
    longevity: (live as any).longevity || undefined,
    sillage: (live as any).sillage || undefined,
    images,
    variants: [...live.variants]
      .sort((a, b) => {
        const volA = a.volumeMl ?? (typeof a.volume === "number" ? a.volume : parseInt(String(a.volume || "").replace(/[^0-9]/g, "")) || 0);
        const volB = b.volumeMl ?? (typeof b.volume === "number" ? b.volume : parseInt(String(b.volume || "").replace(/[^0-9]/g, "")) || 0);
        return volA - volB;
      })
      .map((v) => {
        const volNum = v.volumeMl ?? (typeof v.volume === "number" ? v.volume : parseInt(String(v.volume || "").replace(/[^0-9]/g, "")) || 100);
        const volStr = typeof v.volume === "string" && v.volume ? v.volume : `${volNum}ml`;
        const regPrice = Number(v.basePrice ?? v.regularPrice ?? v.originalPrice ?? (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : v.price));
        const rawDisc = v.discountPrice !== null && v.discountPrice !== undefined
          ? Number(v.discountPrice)
          : (v.salePrice ? Number(v.salePrice) : (v.compareAtPrice && v.compareAtPrice > v.price ? v.price : null));
        const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regPrice;
        const sellingPrice = hasDisc ? rawDisc! : regPrice;
        const compareAt = hasDisc ? regPrice : null;
        const stock = v.stock ?? v.stockQuantity ?? v.availableQuantity ?? 0;

        return {
          id: v.id,
          sku: v.sku,
          volume: volStr,
          volumeMl: volNum,
          sizeLabelEn: v.sizeLabelEn || `${volStr} Flacon`,
          sizeLabelAr: v.sizeLabelAr || `${volNum} مل`,
          basePrice: regPrice,
          regularPrice: regPrice,
          originalPrice: regPrice,
          price: sellingPrice,
          compareAtPrice: compareAt,
          discountPrice: hasDisc ? rawDisc : null,
          salePrice: hasDisc ? rawDisc : null,
          isSampleVial: Boolean(v.isSampleVial),
          stock: stock,
          stockQuantity: stock,
          availableQuantity: stock,
          warehouse: v.warehouse || "DXB-MAIN",
          isDefault: Boolean(v.isDefault),
        };
      }),
    notes: (live.notes || []).map((n: any) => ({
      id: n.slug,
      name: locale === "ar" ? n.nameAr : n.nameEn,
      slug: n.slug,
      position: n.position,
    })),
    tags: live.tags || [],
  };

  const rawRelated = (result.relatedProducts || []).map((rp: any) => storefrontProduct(rp));

  const houseProducts = rawRelated
    .filter((p: any) => p.slug !== slug && p.brand.name === brandName)
    .map((p: any) => {
      const v = p.variants.find((variant: any) => !variant.isSampleVial) || p.variants[0];
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: (p.concentration || "").replaceAll("_", " "),
        price: v?.price || 0,
        compareAtPrice: v?.compareAtPrice,
        variants: p.variants,
        images: p.images.length > 0 ? p.images : ["/product-placeholder.svg"],
      };
    });

  const relatedProducts = rawRelated
    .filter((p: any) => p.slug !== slug && p.brand.name !== brandName)
    .slice(0, 10)
    .map((p: any) => {
      const v = p.variants.find((variant: any) => !variant.isSampleVial) || p.variants[0];
      return {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        brand: p.brand.name,
        concentration: (p.concentration || "").replaceAll("_", " "),
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
    />
  );
}
