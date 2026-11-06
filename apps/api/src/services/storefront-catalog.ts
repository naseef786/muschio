/** Public catalog projection: no cost prices, warehouse counts, or reservation records. */
export function storefrontProduct(product: any) {
  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    descriptionEn: product.descriptionEn,
    descriptionAr: product.descriptionAr,
    concentration: product.concentration,
    gender: product.gender,
    images: product.images || [],
    brand: {
      name: product.brand?.name || "Haute Niche",
      slug: product.brand?.slug || "niche",
      type: product.brand?.type || "NICHE",
      countryOfOrigin: product.brand?.countryOfOrigin || null,
    },
    countryOfOrigin: product.countryOfOrigin || product.brand?.countryOfOrigin || null,
    origin: product.countryOfOrigin || product.brand?.countryOfOrigin || null,
    sillage: product.sillage || null,
    longevity: product.longevity || null,
    perfumer: product.perfumer || null,
    perfumerBio: product.perfumerBio || null,
    ratingAverage: product.ratingAverage ? Number(product.ratingAverage) : 5.0,
    ratingCount: product.ratingCount ? Number(product.ratingCount) : 0,
    scentFamily: product.scentFamily
      ? {
          slug: product.scentFamily.slug,
          nameEn: product.scentFamily.nameEn,
          nameAr: product.scentFamily.nameAr,
        }
      : null,
    variants: product.variants.map((variant: any) => {
      const stock = Math.max(
        0,
        (variant.inventory?.sealedQuantity || 0) -
          (variant.inventory?.reservedQuantity || 0),
      );
      const regPrice = variant.compareAtPrice ? Number(variant.compareAtPrice) : Number(variant.price);
      const discPrice = variant.discountPrice
        ? Number(variant.discountPrice)
        : (variant.compareAtPrice ? Number(variant.price) : null);
      const effectiveSellingPrice = (discPrice && discPrice < regPrice) ? discPrice : Number(variant.price);
      const effectiveCompareAt = (discPrice && discPrice < regPrice) ? regPrice : (variant.compareAtPrice ? Number(variant.compareAtPrice) : null);

      return {
        id: variant.id,
        sku: variant.sku,
        volume: variant.volume || (variant.volumeMl ? `${variant.volumeMl}ml` : variant.sizeLabelEn),
        volumeMl: variant.volumeMl || null,
        sizeLabelEn: variant.sizeLabelEn,
        sizeLabelAr: variant.sizeLabelAr,
        basePrice: effectiveCompareAt || regPrice,
        regularPrice: regPrice,
        originalPrice: regPrice,
        price: effectiveSellingPrice,
        compareAtPrice: effectiveCompareAt,
        discountPrice: discPrice,
        salePrice: discPrice,
        stock: stock,
        stockQuantity: stock,
        warehouse: variant.warehouse || "DXB-MAIN",
        isDefault: Boolean(variant.isDefault),
        isSampleVial: variant.isSampleVial,
        availableQuantity: variant.isSampleVial ? 0 : stock,
      };
    }),
    notes: (product.notes || []).map((relation: any) => ({
      nameEn: relation.note.nameEn,
      nameAr: relation.note.nameAr,
      position: relation.position,
      slug: relation.note.slugEn,
    })),
  };
}
