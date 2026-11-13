import type { Prisma } from "@prisma/client";
import { ApiError } from "../middleware/error-handler";

export interface ProductVariantInput {
  id?: string;
  sku: string;
  volume: string;
  volumeMl: number;
  sizeLabelEn: string;
  sizeLabelAr: string;
  price: number;
  compareAtPrice: number | null;
  discountPrice: number | null;
  warehouse: string;
  isDefault: boolean;
  stockQuantity: number;
}

// Run inside the product save transaction so failures never leave a partial save.
export async function syncProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: ProductVariantInput[],
  replace: boolean,
  testerQuantity = 2,
) {
  if (!variants.length) {
    throw new ApiError(400, "INVALID_VARIANTS", "At least one volume variant is required.");
  }
  const skus = variants.map((v) => v.sku.trim());
  if (skus.some((sku) => !sku) || new Set(skus).size !== skus.length) {
    throw new ApiError(400, "INVALID_SKU", "Each variant must have a non-empty, unique SKU.");
  }
  const existing = await tx.productVariant.findMany({ where: { productId } });
  const retainedIds = new Set<string>();
  const matched = variants.map((v) => {
    // The admin uses temporary var-* IDs for new rows. Persisted IDs must belong
    // to this product; never find an editable variant by a globally supplied SKU.
    const persistedId = v.id && !v.id.startsWith("var-") ? v.id : undefined;
    const match = persistedId
      ? existing.find((item) => item.id === persistedId)
      : !v.id ? existing.find((item) => item.sku === v.sku.trim()) : undefined;
    if (persistedId && !match) {
      throw new ApiError(409, "VARIANT_CHANGED", "A variant no longer belongs to this product. Reopen the product and try again.");
    }
    if (match) {
      if (retainedIds.has(match.id)) {
        throw new ApiError(400, "INVALID_VARIANTS", "A variant may only appear once.");
      }
      retainedIds.add(match.id);
    }
    return match;
  });

  try {
    if (replace) {
      await tx.productVariant.deleteMany({
        where: { productId, id: { notIn: [...retainedIds] } },
      });
    }
    const defaultIndex = Math.max(0, variants.findIndex((v) => v.isDefault));
    for (const [index, input] of variants.entries()) {
      const { stockQuantity } = input;
      const data = {
        sku: input.sku.trim(),
        volume: input.volume,
        volumeMl: input.volumeMl,
        sizeLabelEn: input.sizeLabelEn,
        sizeLabelAr: input.sizeLabelAr,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        discountPrice: input.discountPrice,
        warehouse: input.warehouse,
        isDefault: index === defaultIndex,
      };
      const match = matched[index];
      if (match) {
        await tx.productVariant.update({ where: { id: match.id }, data });
        await tx.inventory.upsert({
          where: { variantId: match.id },
          create: { variantId: match.id, sealedQuantity: stockQuantity, testerQuantity },
          update: { sealedQuantity: stockQuantity },
        });
      } else {
        await tx.productVariant.create({
          data: {
            ...data,
            productId,
            inventory: { create: { sealedQuantity: stockQuantity, testerQuantity } },
          },
        });
      }
    }
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new ApiError(409, "SKU_CONFLICT", "This SKU is already in use. Choose a unique SKU for each variant.");
    }
    if (err?.code === "P2003") {
      throw new ApiError(409, "VARIANT_IN_USE", "A removed variant is referenced by an order or purchase order and cannot be deleted.");
    }
    throw err;
  }
}
