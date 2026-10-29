import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";
import {
  ProductFilter,
  BrandType,
  GenderCategory,
  Concentration,
} from "@muschio/types";

export class CatalogService {
  static async getProducts(filters: ProductFilter) {
    const {
      search,
      brandSlug,
      scentFamilySlug,
      noteSlug,
      brandType,
      gender,
      concentration,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isNewArrival,
      isBestSeller,
      sort = "featured",
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (brandType) {
      where.brand = { ...where.brand, type: brandType as BrandType };
    }

    if (scentFamilySlug) {
      where.scentFamily = { slug: scentFamilySlug };
    }

    if (noteSlug) {
      where.notes = {
        some: {
          note: {
            OR: [{ slugEn: noteSlug }, { slugAr: noteSlug }],
          },
        },
      };
    }

    if (gender) {
      where.gender = gender as GenderCategory;
    }

    if (concentration) {
      where.concentration = concentration as Concentration;
    }

    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
    if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

    if (
      minPrice !== undefined ||
      maxPrice !== undefined ||
      inStock !== undefined
    ) {
      where.variants = {
        some: {
          ...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
          ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
          ...(inStock ? { inventory: { sealedQuantity: { gt: 0 } } } : {}),
        },
      };
    }

    let orderBy: any = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    if (sort === "newest") orderBy = { createdAt: "desc" };
    if (sort === "rating") orderBy = { ratingAverage: "desc" };

    try {
      const [items, totalItems] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            brand: true,
            scentFamily: true,
            variants: {
              include: {
                inventory: true,
              },
              orderBy: { price: "asc" },
            },
            notes: {
              include: {
                note: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (e) {
      throw new ApiError(
        503,
        "CATALOG_UNAVAILABLE",
        "The live catalog is temporarily unavailable",
      );
    }
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isPublished: true },
      include: {
        brand: true,
        scentFamily: true,
        variants: {
          include: {
            inventory: true,
          },
          orderBy: { volumeMl: "asc" },
        },
        notes: {
          include: {
            note: true,
          },
          orderBy: { prominence: "desc" },
        },
      },
    });

    if (!product) return null;

    // Get related products from the same brand or same scent family
    const relatedProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        id: { not: product.id },
        OR: [
          { brandId: product.brandId },
          { scentFamilyId: product.scentFamilyId },
        ],
      },
      include: {
        brand: true,
        variants: {
          include: { inventory: true },
          orderBy: { price: "asc" },
        },
      },
      take: 4,
    });

    return {
      product,
      relatedProducts,
    };
  }

  static async getBrands() {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });
  }

  static async getBrandBySlug(slug: string) {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isPublished: true },
          include: {
            brand: true,
            scentFamily: true,
            variants: {
              include: {
                inventory: true,
              },
              orderBy: { volumeMl: "asc" },
            },
            notes: {
              include: {
                note: true,
              },
              orderBy: { prominence: "desc" },
            },
          },
        },
      },
    });

    if (!brand) return null;

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      type: brand.type,
      descriptionEn: brand.descriptionEn,
      descriptionAr: brand.descriptionAr,
      logoUrl: brand.logoUrl,
      heroImageUrl: brand.heroImageUrl,
      countryOfOrigin: brand.countryOfOrigin,
      isFeatured: brand.isFeatured,
      products: brand.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        concentration: p.concentration,
        gender: p.gender,
        images: p.images,
        brand: brand.name,
        ...(() => {
          const defaultVar = p.variants.find((v: any) => v.isDefault) || p.variants[0];
          return {
            price: Number(defaultVar?.price || 0),
            compareAtPrice: defaultVar?.compareAtPrice ? Number(defaultVar.compareAtPrice) : null,
          };
        })(),
      })),
    };
  }

  static async getScentFamilies() {
    return prisma.scentFamily.findMany({
      orderBy: { nameEn: "asc" },
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });
  }
}

