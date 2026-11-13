import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncProductVariants, type ProductVariantInput } from "../src/services/product-variants";

const variant = (overrides: Partial<ProductVariantInput> = {}): ProductVariantInput => ({
  id: "existing-100",
  sku: "FRAG-100",
  volume: "100ml",
  volumeMl: 100,
  sizeLabelEn: "100ml Flacon",
  sizeLabelAr: "100 مل",
  price: 200,
  compareAtPrice: null,
  discountPrice: null,
  warehouse: "DXB-MAIN",
  isDefault: true,
  stockQuantity: 10,
  ...overrides,
});

let tx: any;
beforeEach(() => {
  tx = {
    productVariant: {
      findMany: vi.fn().mockResolvedValue([
        { id: "existing-100", sku: "FRAG-100", volumeMl: 100 },
        { id: "existing-50", sku: "FRAG-50", volumeMl: 50 },
      ]),
      update: vi.fn(), create: vi.fn(), deleteMany: vi.fn(),
    },
    inventory: { upsert: vi.fn() },
  };
});

describe("product variant synchronization", () => {
  it("adds a volume, removes omitted volumes, and preserves the retained variant ID", async () => {
    await syncProductVariants(tx, "product", [variant(), variant({ id: "var-new", sku: "FRAG-30", volumeMl: 30, volume: "30ml", isDefault: false })], true);
    expect(tx.productVariant.deleteMany).toHaveBeenCalledWith({ where: { productId: "product", id: { notIn: ["existing-100"] } } });
    expect(tx.productVariant.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "existing-100" } }));
    const created = tx.productVariant.create.mock.calls[0][0].data;
    expect(created).toMatchObject({ productId: "product", sku: "FRAG-30", volumeMl: 30 });
    expect(created.id).toBeUndefined();
  });

  it("saves SKU and volume edits on the same row and leaves reservation/tester counts alone", async () => {
    await syncProductVariants(tx, "product", [variant({ sku: " NEW-SKU ", volumeMl: 90 })], true);
    expect(tx.productVariant.update).toHaveBeenCalledWith({ where: { id: "existing-100" }, data: expect.objectContaining({ sku: "NEW-SKU", volumeMl: 90 }) });
    expect(tx.inventory.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { variantId: "existing-100" }, update: { sealedQuantity: 10 } }));
    expect(tx.productVariant.create).not.toHaveBeenCalled();
  });

  it("does not match a new volume row to an existing row just because volumes coincide", async () => {
    await syncProductVariants(tx, "product", [variant({ id: "var-new", sku: "REPLACEMENT" })], true);
    expect(tx.productVariant.update).not.toHaveBeenCalled();
    expect(tx.productVariant.create).toHaveBeenCalledTimes(1);
  });

  it("rejects another product's ID before any mutation", async () => {
    await expect(syncProductVariants(tx, "product", [variant({ id: "other-product-variant" })], true)).rejects.toMatchObject({ statusCode: 409, code: "VARIANT_CHANGED" });
    expect(tx.productVariant.deleteMany).not.toHaveBeenCalled();
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });

  it.each([[], [variant({ sku: " " })], [variant(), variant({ id: "existing-50", sku: " FRAG-100 " })]].map((variants) => ({ variants })))("rejects empty or duplicate SKU submissions", async ({ variants }) => {
    await expect(syncProductVariants(tx, "product", variants, true)).rejects.toMatchObject({ statusCode: 400 });
    expect(tx.productVariant.deleteMany).not.toHaveBeenCalled();
  });

  it("does not delete volumes for legacy single-variant updates", async () => {
    await syncProductVariants(tx, "product", [variant({ id: undefined })], false);
    expect(tx.productVariant.deleteMany).not.toHaveBeenCalled();
    expect(tx.productVariant.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "existing-100" } }));
  });

  it("returns a conflict without inventing a SKU when the database rejects a duplicate", async () => {
    tx.productVariant.update.mockRejectedValue({ code: "P2002" });
    await expect(syncProductVariants(tx, "product", [variant({ sku: "OTHER-PRODUCT-SKU" })], true)).rejects.toMatchObject({ code: "SKU_CONFLICT", statusCode: 409 });
    expect(tx.productVariant.create).not.toHaveBeenCalled();
  });

  it("surfaces historical reference restrictions so the enclosing transaction rolls back", async () => {
    tx.productVariant.deleteMany.mockRejectedValue({ code: "P2003" });
    await expect(syncProductVariants(tx, "product", [variant()], true)).rejects.toMatchObject({ code: "VARIANT_IN_USE", statusCode: 409 });
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });
});
