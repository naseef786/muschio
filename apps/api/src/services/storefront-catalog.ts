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
      name: product.brand.name,
      slug: product.brand.slug,
      type: product.brand.type,
    },
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
        regularPrice: regPrice,
        originalPrice: regPrice,
        price: effectiveSellingPrice,
        compareAtPrice: effectiveCompareAt,
        discountPrice: discPrice,
        salePrice: discPrice,
        isDefault: Boolean(variant.isDefault),
        stockQuantity: stock,
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
