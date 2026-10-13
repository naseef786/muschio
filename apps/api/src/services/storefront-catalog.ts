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
    variants: product.variants.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      sizeLabelEn: variant.sizeLabelEn,
      sizeLabelAr: variant.sizeLabelAr,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : null,
      isSampleVial: variant.isSampleVial,
      availableQuantity: variant.isSampleVial
        ? 0
        : Math.max(
            0,
            (variant.inventory?.sealedQuantity || 0) -
              (variant.inventory?.reservedQuantity || 0),
          ),
    })),
    notes: (product.notes || []).map((relation: any) => ({
      nameEn: relation.note.nameEn,
      nameAr: relation.note.nameAr,
      position: relation.position,
      slug: relation.note.slugEn,
    })),
  };
}
