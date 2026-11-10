import React from "react";
import { prisma } from "@muschio/api";
import { ShopClient } from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopCatalogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: "en" | "ar" };
  searchParams: {
    search?: string;
    brandType?: string;
    family?: string;
    brand?: string;
    tag?: string;
    tagSlug?: string;
    page?: string;
    deal?: string;
  };
}) {
  let initialProducts: any[] = [];
  let initialFamilies: any[] = [];
  let initialTags: any[] = [];

  try {
    const [rawProducts, rawFamilies, rawTags] = await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true },
        include: {
          brand: true,
          scentFamily: true,
          variants: {
            include: { inventory: true },
            orderBy: { price: "asc" },
          },
          notes: { include: { note: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.scentFamily.findMany({ orderBy: { nameEn: "asc" } }),
      prisma.tag.findMany({ orderBy: { nameEn: "asc" } }),
    ]);

    initialProducts = rawProducts.map((p) => {
      const variants = (p.variants || []).map((v) => ({
        id: String(v.id),
        sku: v.sku,
        volume: v.volume || (v.volumeMl ? `${v.volumeMl}ml` : "100ml"),
        volumeMl: v.volumeMl || 100,
        price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        isSampleVial: Boolean(v.isSampleVial),
        stock: v.inventory?.sealedQuantity ?? 20,
      }));
      const primaryVariant = variants.find((v) => !v.isSampleVial) || variants[0];
      const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/product-placeholder.svg"];

      return {
        id: String(p.id),
        _id: String(p.id),
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr || p.nameEn,
        brand: p.brand?.name || "Haute Niche",
        brandType: p.brand?.type || "NICHE",
        family: p.scentFamily?.slug || "",
        gender: p.gender || "UNISEX",
        concentration: (p.concentration || "EXTRAIT_DE_PARFUM").replaceAll("_", " "),
        price: primaryVariant?.price || 0,
        compareAtPrice: primaryVariant?.compareAtPrice,
        image: images[0] || "/product-placeholder.svg",
        secondaryImage: images[1],
        images,
        badge: p.brand?.type === "NICHE" ? "Haute Niche" : "Private Blend",
        notes: (p.notes || []).map((n: any) => n.note?.nameEn || ""),
        tags: (p.tags || []).map((t: any) => ({
          id: String(t.tag?.id || t.id),
          nameEn: t.tag?.nameEn || t.nameEn,
          nameAr: t.tag?.nameAr || t.nameAr || t.tag?.nameEn || t.nameEn,
          slug: t.tag?.slug || t.slug,
          colorHex: t.tag?.colorHex || t.colorHex || "#171717",
          isFeatured: Boolean(t.tag?.isFeatured ?? t.isFeatured),
        })),
        variants,
      };
    });

    initialFamilies = rawFamilies.map((f) => ({
      id: String(f.id),
      slug: f.slug,
      nameEn: f.nameEn,
      nameAr: f.nameAr || f.nameEn,
    }));

    initialTags = rawTags.map((t) => ({
      id: String(t.id),
      slug: t.slug,
      nameEn: t.nameEn,
      nameAr: t.nameAr || t.nameEn,
      colorHex: t.colorHex || "#171717",
      isFeatured: Boolean(t.isFeatured),
    }));
  } catch (err) {
    console.error("Shop SSR query failed:", err);
  }

  return (
    <ShopClient
      locale={locale}
      searchParams={searchParams}
      initialProducts={initialProducts}
      initialFamilies={initialFamilies}
      initialTags={initialTags}
    />
  );
}
