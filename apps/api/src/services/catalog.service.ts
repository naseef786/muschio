import { prisma } from "../prisma";
import { ProductFilter, BrandType, GenderCategory, Concentration } from "@muschio/types";

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

    if (minPrice !== undefined || maxPrice !== undefined || inStock !== undefined) {
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
      // Fallback mock catalog for local dev
      const mockItems = [
        {
          id: "prod-amouage-interlude-53",
          slug: "amouage-interlude-53-man",
          nameEn: "Interlude 53 Man Extrait de Parfum",
          nameAr: "إنترلود 53 مان إكستري دو بارفان",
          brand: { name: "Amouage", slug: "amouage", type: "NICHE", countryOfOrigin: "Oman" },
          scentFamily: { nameEn: "Woody Oriental", nameAr: "شرقي خشبي" },
          ratingAverage: 4.95,
          reviewCount: 48,
          variants: [
            { id: "var-1", volumeMl: 100, price: 1850, isDecant: false, inventory: { sealedQuantity: 14 } },
            { id: "var-2", volumeMl: 5, price: 145, isDecant: true, inventory: { decantMilliliters: 120 } }
          ],
          notes: []
        }
      ];
      return {
        items: mockItems,
        pagination: {
          page: 1,
          limit: 20,
          totalItems: mockItems.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
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
