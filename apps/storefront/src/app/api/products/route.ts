import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muschio/api";

export const dynamic = "force-dynamic";

function serializeVariant(v: any) {
  let volNum = 100;
  if (typeof v.volumeMl === "number" && !isNaN(v.volumeMl)) {
    volNum = v.volumeMl;
  } else if (typeof v.volume === "number" && !isNaN(v.volume)) {
    volNum = v.volume;
  } else if (v.volume) {
    const parsed = parseInt(String(v.volume).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) volNum = parsed;
  }
  const volLabel = typeof v.volume === "string" && v.volume ? v.volume : `${volNum}ml`;
  const price = Number(v.price) || 0;
  const compareAtPrice = v.compareAtPrice !== null && v.compareAtPrice !== undefined ? Number(v.compareAtPrice) : null;
  const stock = v.inventory?.sealedQuantity !== undefined ? Number(v.inventory.sealedQuantity) : (v.stockQuantity ?? 20);

  return {
    id: String(v.id),
    _id: String(v.id),
    sku: String(v.sku || `SKU-${volNum}`),
    volume: volLabel,
    volumeMl: volNum,
    sizeLabelEn: v.sizeLabelEn || `${volLabel} Flacon`,
    sizeLabelAr: v.sizeLabelAr || `${volNum} مل`,
    price,
    compareAtPrice,
    basePrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : price,
    discountPrice: compareAtPrice && compareAtPrice > price ? price : null,
    stock,
    stockQuantity: stock,
    warehouse: v.warehouse || "DXB-MAIN",
    isDefault: Boolean(v.isDefault),
    isSampleVial: Boolean(v.isSampleVial),
  };
}

function serializeProduct(p: any) {
  const variants = Array.isArray(p.variants) ? p.variants.map(serializeVariant) : [];
  const primaryVariant = variants.find((v: any) => !v.isSampleVial && v.isDefault) || variants.find((v: any) => !v.isSampleVial) || variants[0];
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/product-placeholder.svg"];

  return {
    id: String(p.id),
    _id: String(p.id), // MongoDB compatibility fallback
    slug: p.slug,
    name: p.nameEn,
    nameEn: p.nameEn,
    nameAr: p.nameAr || p.nameEn,
    descriptionEn: p.descriptionEn || "",
    descriptionAr: p.descriptionAr || p.descriptionEn || "",
    brand: p.brand
      ? {
          id: String(p.brand.id),
          name: p.brand.name,
          slug: p.brand.slug,
          type: p.brand.type,
        }
      : { id: "brand-default", name: "Haute Niche", slug: "haute-niche", type: "NICHE" },
    brandName: p.brand?.name || "Haute Niche",
    brandSlug: p.brand?.slug || "haute-niche",
    brandType: p.brand?.type || "NICHE",
    scentFamily: p.scentFamily
      ? {
          id: String(p.scentFamily.id),
          nameEn: p.scentFamily.nameEn,
          nameAr: p.scentFamily.nameAr,
          slug: p.scentFamily.slug,
        }
      : null,
    concentration: p.concentration || "EXTRAIT_DE_PARFUM",
    concentrationLabel: (p.concentration || "EXTRAIT_DE_PARFUM").replaceAll("_", " "),
    gender: p.gender || "UNISEX",
    price: primaryVariant?.price ?? 0,
    compareAtPrice: primaryVariant?.compareAtPrice ?? null,
    image: images[0],
    images,
    badge: p.brand?.type === "NICHE" ? "Haute Niche" : "Private Blend",
    variants,
    notes: Array.isArray(p.notes)
      ? p.notes.map((n: any) => ({
          nameEn: n.note?.nameEn || n.nameEn || "",
          nameAr: n.note?.nameAr || n.nameAr || n.note?.nameEn || n.nameEn || "",
          slug: n.note?.slugEn || n.slug || "",
          position: n.position || "TOP",
        }))
      : [],
    tags: Array.isArray(p.tags)
      ? p.tags.map((t: any) => ({
          id: String(t.tag?.id || t.id),
          nameEn: t.tag?.nameEn || t.nameEn,
          nameAr: t.tag?.nameAr || t.nameAr || t.tag?.nameEn || t.nameEn,
          slug: t.tag?.slug || t.slug,
          colorHex: t.tag?.colorHex || t.colorHex || "#171717",
          isFeatured: Boolean(t.tag?.isFeatured ?? t.isFeatured),
        }))
      : [],
    isPublished: Boolean(p.isPublished),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * GET /api/products
 * Supports standard query params:
 * ?page=1&limit=12&search=oud&brand=Amouage&family=woody&sort=price-asc
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "12", 10)));
    const search = url.searchParams.get("search") || url.searchParams.get("q") || undefined;
    const brand = url.searchParams.get("brand") || url.searchParams.get("brandSlug") || undefined;
    const family = url.searchParams.get("family") || url.searchParams.get("scentFamily") || undefined;
    const sort = url.searchParams.get("sort") || "featured";
    const tag = url.searchParams.get("tag") || url.searchParams.get("tagSlug") || undefined;
    const dealOnly = url.searchParams.get("deal") === "true" || url.searchParams.get("deal") === "1";

    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { nameEn: { contains: q, mode: "insensitive" } },
        { nameAr: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { descriptionEn: { contains: q, mode: "insensitive" } },
        { descriptionAr: { contains: q, mode: "insensitive" } },
        {
          notes: {
            some: {
              note: {
                OR: [
                  { nameEn: { contains: q, mode: "insensitive" } },
                  { nameAr: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    if (brand && brand.trim()) {
      const b = brand.trim();
      where.brand = {
        OR: [
          { slug: { equals: b, mode: "insensitive" } },
          { name: { equals: b, mode: "insensitive" } },
        ],
      };
    }

    if (family && family.trim()) {
      const f = family.trim();
      where.scentFamily = {
        OR: [
          { slug: { equals: f, mode: "insensitive" } },
          { nameEn: { equals: f, mode: "insensitive" } },
        ],
      };
    }

    if (tag && tag.trim()) {
      const t = tag.trim();
      where.tags = {
        some: {
          tag: {
            OR: [
              { slug: { equals: t, mode: "insensitive" } },
              { nameEn: { equals: t, mode: "insensitive" } },
              { nameAr: { equals: t, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    let orderBy: any = [{ createdAt: "desc" }];
    if (sort === "newest" || sort === "featured" || sort === "curated") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "rating") {
      orderBy = [{ ratingAverage: "desc" }, { createdAt: "desc" }];
    } else if (sort === "name") {
      orderBy = [{ nameEn: "asc" }];
    }

    const [rawProducts, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          scentFamily: true,
          variants: {
            include: { inventory: true },
            orderBy: { price: "asc" },
          },
          notes: {
            include: { note: true },
          },
          tags: {
            include: { tag: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    let products = rawProducts.map(serializeProduct);

    if (dealOnly) {
      products = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    if (sort === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    }

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json(
      {
        success: true,
        products,
        currentPage: page,
        totalPages,
        totalProducts: totalCount,
        data: {
          products,
          currentPage: page,
          totalPages,
          totalProducts: totalCount,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products from Neon PostgreSQL database",
        message: err?.message || String(err),
        products: [],
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
      },
      { status: 500 }
    );
  }
}

function normalizeConcentration(val: any): "EXTRAIT_DE_PARFUM" | "EAU_DE_PARFUM" | "EAU_DE_TOILETTE" | "EAU_DE_COLOGNE" | "PARFUM_OIL" | "ATTAR" | "DISCOVERY_SET" {
  if (!val || typeof val !== "string") return "EXTRAIT_DE_PARFUM";
  const upper = val.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (upper === "PARFUM" || upper === "EXTRAIT" || upper === "EXTRAIT_DE_PARFUM" || upper === "PURE_PARFUM" || upper === "PARFUM_PURE") {
    return "EXTRAIT_DE_PARFUM";
  }
  if (upper === "EDP" || upper === "EAU_DE_PARFUM") {
    return "EAU_DE_PARFUM";
  }
  if (upper === "EDT" || upper === "EAU_DE_TOILETTE") {
    return "EAU_DE_TOILETTE";
  }
  if (upper === "EDC" || upper === "EAU_DE_COLOGNE") {
    return "EAU_DE_COLOGNE";
  }
  if (upper === "OIL" || upper === "PARFUM_OIL" || upper === "PERFUME_OIL") {
    return "PARFUM_OIL";
  }
  if (upper === "ATTAR") {
    return "ATTAR";
  }
  if (upper === "DISCOVERY_SET" || upper === "SET" || upper === "SAMPLE_SET") {
    return "DISCOVERY_SET";
  }
  return "EXTRAIT_DE_PARFUM";
}

function normalizeGender(val: any): "UNISEX" | "MEN" | "WOMEN" {
  if (!val || typeof val !== "string") return "UNISEX";
  const upper = val.trim().toUpperCase();
  if (upper === "MEN" || upper === "MALE" || upper === "FOR MEN" || upper === "HOMME") return "MEN";
  if (upper === "WOMEN" || upper === "FEMALE" || upper === "FOR WOMEN" || upper === "FEMME") return "WOMEN";
  return "UNISEX";
}

/**
 * POST /api/products
 * Bulletproof Create or Update product in Neon DB with brand, scentFamily, variants, and inventory.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resolvedName = String(body.name || body.nameEn || "").trim();
    const resolvedNameAr = String(body.nameAr || body.nameArabic || resolvedName).trim();

    if (!resolvedName) {
      return NextResponse.json(
        { success: false, error: "Validation Error: 'name' or 'nameEn' is required" },
        { status: 400 }
      );
    }

    const rawVariants = Array.isArray(body.variants) ? body.variants : [];
    if (!body.sku && rawVariants.length === 0) {
      return NextResponse.json(
        { success: false, error: "Validation Error: 'sku' or at least one variant is required" },
        { status: 400 }
      );
    }

    const validConcentration = normalizeConcentration(body.concentration);
    const validGender = normalizeGender(body.gender);

    // 1. Resolve or create Brand in Neon DB
    let brand = null;
    const rawBrandId = body.brandId || (typeof body.brand === "object" ? body.brand?.id : undefined);
    if (rawBrandId) {
      brand = await prisma.brand.findUnique({
        where: { id: String(rawBrandId) },
      });
    }
    const resolvedBrandName = String(
      body.brandName || (typeof body.brand === "string" ? body.brand : body.brand?.name) || "Haute Niche"
    ).trim();
    if (!brand) {
      brand = await prisma.brand.findFirst({
        where: { name: { equals: resolvedBrandName, mode: "insensitive" } },
      });
    }
    if (!brand) {
      const bSlug = resolvedBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      brand = await prisma.brand.create({
        data: {
          name: resolvedBrandName,
          slug: bSlug || `brand-${Date.now()}`,
          type: "NICHE",
          countryOfOrigin: "France",
        },
      });
    }

    // 2. Resolve or create ScentFamily in Neon DB
    let scentFamily = null;
    const rawFamilyId = body.scentFamilyId || (typeof body.scentFamily === "object" ? body.scentFamily?.id : undefined);
    if (rawFamilyId) {
      scentFamily = await prisma.scentFamily.findUnique({
        where: { id: String(rawFamilyId) },
      });
    }
    const resolvedFamily = String(
      body.scentFamily || body.familyName || (typeof body.scentFamily === "object" ? body.scentFamily?.nameEn : "") || ""
    ).trim();
    if (!scentFamily && resolvedFamily) {
      scentFamily = await prisma.scentFamily.findFirst({
        where: { nameEn: { equals: resolvedFamily, mode: "insensitive" } },
      });
      if (!scentFamily) {
        const fSlug = resolvedFamily.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        scentFamily = await prisma.scentFamily.create({
          data: {
            nameEn: resolvedFamily,
            nameAr: resolvedFamily,
            slug: fSlug || `family-${Date.now()}`,
            descriptionEn: `${resolvedFamily} olfactory creation`,
            descriptionAr: `عائلة عطور ${resolvedFamily}`,
          },
        });
      }
    }

    // 3. Resolve images
    let productImages: string[] = [];
    if (Array.isArray(body.images) && body.images.length > 0) {
      productImages = body.images.map((img: any) => String(img).trim()).filter(Boolean);
    } else if (body.imageUrl) {
      productImages = [String(body.imageUrl).trim()];
    }
    if (productImages.length === 0) {
      productImages = ["/product-placeholder.svg"];
    }

    // 4. Resolve slug and target product for CREATE or UPDATE
    const baseSlug = String(body.slug || resolvedName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let targetProduct = null;
    const incomingId = body.id || body.productId;
    if (incomingId) {
      targetProduct = await prisma.product.findUnique({
        where: { id: String(incomingId) },
        include: { variants: true },
      });
    }
    if (!targetProduct && body.slug) {
      targetProduct = await prisma.product.findUnique({
        where: { slug: String(body.slug).trim() },
        include: { variants: true },
      });
    }
    if (!targetProduct && baseSlug) {
      targetProduct = await prisma.product.findUnique({
        where: { slug: baseSlug },
        include: { variants: true },
      });
    }
    if (!targetProduct && body.sku) {
      targetProduct = await prisma.product.findFirst({
        where: { variants: { some: { sku: String(body.sku).trim() } } },
        include: { variants: true },
      });
    }
    // Inspect variant SKUs to detect existing product on rename
    if (!targetProduct && rawVariants.length > 0) {
      for (const v of rawVariants) {
        if (v?.sku && String(v.sku).trim()) {
          const matchVar = await prisma.productVariant.findUnique({
            where: { sku: String(v.sku).trim() },
            include: { product: { include: { variants: true } } },
          });
          if (matchVar?.product) {
            targetProduct = matchVar.product;
            break;
          }
        }
      }
    }

    // 5. Build variants
    const numPrice = Math.max(0, Number(String(body.price || body.basePrice || 0).replace(/[^0-9.]/g, "")) || 0);
    const numBasePrice = Math.max(0, Number(String(body.basePrice || body.price || 0).replace(/[^0-9.]/g, "")) || numPrice);
    const numStock = Math.max(0, Number(body.stock) >= 0 ? Number(body.stock) : 20);
    const primarySku = String(body.sku || `${baseSlug}-${body.volumeMl || 100}`).trim();

    const variantsData = (rawVariants.length > 0)
      ? rawVariants.map((v: any, idx: number) => {
          const vVolNum = Number(v.volumeMl) || (typeof v.volume === "number" ? v.volume : parseInt(String(v.volume || "100").replace(/[^0-9]/g, ""), 10)) || 100;
          const vVol = String(v.volume || `${vVolNum}ml`).trim().endsWith("ml") ? String(v.volume || `${vVolNum}ml`).trim() : `${vVolNum}ml`;
          const rawVBase = Number(String(v.basePrice ?? v.regularPrice ?? v.price ?? numBasePrice).replace(/[^0-9.]/g, "")) || numBasePrice;
          const rawVPrice = Number(String(v.price ?? rawVBase).replace(/[^0-9.]/g, "")) || rawVBase;
          const vPrice = Math.max(0, rawVPrice);
          const vBasePrice = Math.max(vPrice, rawVBase);
          const vStock = Math.max(0, Number(v.stockQuantity ?? v.stock ?? numStock));
          const vSku = String(v.sku || `${primarySku}-${vVolNum}`).trim();

          return {
            sku: vSku,
            volume: vVol,
            volumeMl: vVolNum,
            sizeLabelEn: v.sizeLabelEn || `${vVol} Flacon`,
            sizeLabelAr: v.sizeLabelAr || `${vVolNum} مل إكستريت`,
            price: vPrice,
            compareAtPrice: vBasePrice > vPrice ? vBasePrice : null,
            discountPrice: vBasePrice > vPrice ? vPrice : null,
            warehouse: String(v.warehouse || "DXB-MAIN").trim(),
            isDefault: Boolean(v.isDefault ?? idx === 0),
            inventory: {
              create: {
                sealedQuantity: vStock,
                testerQuantity: 2,
              },
            },
          };
        })
      : [
          {
            sku: primarySku,
            volume: `${body.volumeMl || 100}ml`,
            volumeMl: Number(body.volumeMl) || 100,
            sizeLabelEn: `${body.volumeMl || 100}ml Flacon`,
            sizeLabelAr: `${body.volumeMl || 100} مل إكستريت`,
            price: numPrice,
            compareAtPrice: numBasePrice > numPrice ? numBasePrice : null,
            discountPrice: numBasePrice > numPrice ? numPrice : null,
            warehouse: "DXB-MAIN",
            isDefault: true,
            inventory: {
              create: {
                sealedQuantity: numStock,
                testerQuantity: 2,
              },
            },
          },
        ];

    // If updating an existing product:
    if (targetProduct) {
      for (const iv of variantsData) {
        const existingVar = await prisma.productVariant.findFirst({
          where: {
            OR: [
              { sku: iv.sku },
              { productId: targetProduct.id, volumeMl: iv.volumeMl },
            ],
          },
        });

        if (existingVar) {
          await prisma.productVariant.update({
            where: { id: existingVar.id },
            data: {
              sku: iv.sku,
              volume: iv.volume,
              volumeMl: iv.volumeMl,
              sizeLabelEn: iv.sizeLabelEn,
              sizeLabelAr: iv.sizeLabelAr,
              price: iv.price,
              compareAtPrice: iv.compareAtPrice,
              discountPrice: iv.discountPrice,
              warehouse: iv.warehouse,
              isDefault: iv.isDefault,
            },
          });
          await prisma.inventory.upsert({
            where: { variantId: existingVar.id },
            create: {
              variantId: existingVar.id,
              sealedQuantity: iv.inventory.create.sealedQuantity,
              testerQuantity: 2,
            },
            update: {
              sealedQuantity: iv.inventory.create.sealedQuantity,
            },
          });
        } else {
          // Check for SKU conflict with other products
          const conflicting = await prisma.productVariant.findUnique({ where: { sku: iv.sku } });
          const safeSku = conflicting ? `${iv.sku}-${Date.now().toString().slice(-4)}` : iv.sku;

          await prisma.productVariant.create({
            data: {
              productId: targetProduct.id,
              sku: safeSku,
              volume: iv.volume,
              volumeMl: iv.volumeMl,
              sizeLabelEn: iv.sizeLabelEn,
              sizeLabelAr: iv.sizeLabelAr,
              price: iv.price,
              compareAtPrice: iv.compareAtPrice,
              discountPrice: iv.discountPrice,
              warehouse: iv.warehouse,
              isDefault: iv.isDefault,
              inventory: iv.inventory,
            },
          });
        }
      }

      const updatedProduct = await prisma.product.update({
        where: { id: targetProduct.id },
        data: {
          nameEn: resolvedName,
          nameAr: resolvedNameAr,
          descriptionEn: String(body.descriptionEn || resolvedName).trim(),
          descriptionAr: String(body.descriptionAr || resolvedNameAr || resolvedName).trim(),
          brandId: brand.id,
          scentFamilyId: scentFamily?.id,
          concentration: validConcentration,
          gender: validGender,
          images: productImages,
          isPublished: body.status !== "DRAFT",
          isFeatured: true,
          updatedAt: new Date(),
        },
        include: {
          brand: true,
          scentFamily: true,
          variants: { include: { inventory: true } },
          notes: { include: { note: true } },
          tags: { include: { tag: true } },
        },
      });

      const serialized = serializeProduct(updatedProduct);
      return NextResponse.json(
        {
          success: true,
          product: serialized,
          data: serialized,
          message: "Product updated successfully in Neon PostgreSQL database.",
        },
        { status: 200 }
      );
    }

    // 6. Insert new Product into Neon PostgreSQL
    let slug = baseSlug;
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const uniqueVariantsData = [];
    for (const iv of variantsData) {
      const existingSku = await prisma.productVariant.findUnique({ where: { sku: iv.sku } });
      const safeSku = existingSku ? `${iv.sku}-${Date.now().toString().slice(-4)}` : iv.sku;
      uniqueVariantsData.push({
        ...iv,
        sku: safeSku,
      });
    }

    const createdProduct = await prisma.product.create({
      data: {
        slug,
        nameEn: resolvedName,
        nameAr: resolvedNameAr,
        descriptionEn: String(body.descriptionEn || resolvedName).trim(),
        descriptionAr: String(body.descriptionAr || resolvedNameAr || resolvedName).trim(),
        brandId: brand.id,
        scentFamilyId: scentFamily?.id,
        concentration: validConcentration,
        gender: validGender,
        images: productImages,
        isPublished: body.status !== "DRAFT",
        isFeatured: true,
        isNewArrival: true,
        variants: {
          create: uniqueVariantsData,
        },
      },
      include: {
        brand: true,
        scentFamily: true,
        variants: {
          include: { inventory: true },
        },
        notes: {
          include: { note: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    const serialized = serializeProduct(createdProduct);

    return NextResponse.json(
      {
        success: true,
        product: serialized,
        data: serialized,
        message: "Product created successfully in Neon PostgreSQL database.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to persist product into Neon PostgreSQL database",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

export const PUT = POST;
