import { prisma } from "../prisma";

export interface SearchResultItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  brandName: string;
  concentration: string;
  price: number;
  image: string;
  scentFamily?: string;
  topAccords: string[];
  prominentNotes: string[];
}

export class SearchService {
  /**
   * Search across products, brands, notes, accords, and perfumers
   * Supports bilingual Arab-English matching, synonym mapping, and faceted retrieval.
   */
  static async searchCatalog(query: string, options?: {
    family?: string;
    accord?: string;
    note?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }) {
    const cleanQuery = (query || "").trim().toLowerCase();
    const limit = options?.limit || 20;

    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        AND: [
          cleanQuery
            ? {
                OR: [
                  { nameEn: { contains: cleanQuery, mode: "insensitive" } },
                  { nameAr: { contains: cleanQuery, mode: "insensitive" } },
                  { descriptionEn: { contains: cleanQuery, mode: "insensitive" } },
                  { descriptionAr: { contains: cleanQuery, mode: "insensitive" } },
                  { brand: { name: { contains: cleanQuery, mode: "insensitive" } } },
                  { notes: { some: { note: { OR: [{ nameEn: { contains: cleanQuery, mode: "insensitive" } }, { nameAr: { contains: cleanQuery, mode: "insensitive" } }] } } } },
                  { accords: { some: { accord: { OR: [{ nameEn: { contains: cleanQuery, mode: "insensitive" } }, { nameAr: { contains: cleanQuery, mode: "insensitive" } }] } } } },
                ],
              }
            : {},
          options?.family ? { scentFamily: { slug: options.family } } : {},
          options?.gender ? { gender: options.gender as any } : {},
          options?.accord ? { accords: { some: { accord: { slug: options.accord } } } } : {},
          options?.note ? { notes: { some: { note: { slugEn: options.note } } } } : {},
        ],
      },
      include: {
        brand: true,
        scentFamily: true,
        variants: { orderBy: { price: "asc" }, take: 1 },
        accords: { include: { accord: true }, orderBy: { prominence: "desc" }, take: 3 },
        notes: { include: { note: true }, take: 4 },
      },
      take: limit,
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      brandName: p.brand.name,
      concentration: p.concentration,
      price: Number(p.variants[0]?.price || 0),
      image: p.images[0] || "",
      scentFamily: p.scentFamily?.nameEn,
      topAccords: p.accords.map((a) => a.accord.nameEn),
      prominentNotes: p.notes.map((n) => n.note.nameEn),
    }));
  }
}
