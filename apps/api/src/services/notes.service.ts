import { prisma } from "../prisma";
import { NoteFilterQuery } from "@muschio/types";
import { NoteStatus } from "@prisma/client";

export class NotesService {
  static async getNotes(query: Partial<NoteFilterQuery> = {}) {
    const { search, status = NoteStatus.PUBLISHED, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: status as NoteStatus,
    };

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          _count: {
            select: {
              products: {
                where: { product: { isPublished: true } },
              },
            },
          },
        },
        orderBy: { nameEn: "asc" },
        skip,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items.map((n) => ({
        ...n,
        featuredProductCount: n._count.products,
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getNoteBySlug(slug: string) {
    const note = await prisma.note.findFirst({
      where: {
        OR: [{ slugEn: slug }, { slugAr: slug }],
        status: NoteStatus.PUBLISHED,
      },
    });

    if (!note) return null;

    // Get related notes (e.g. other notes that frequently co-occur with this note)
    const coOccurringNotes = await prisma.productNote.findMany({
      where: {
        product: {
          isPublished: true,
          notes: { some: { noteId: note.id } },
        },
        noteId: { not: note.id },
      },
      include: {
        note: true,
      },
      take: 6,
    });

    // Unique related notes
    const relatedNotesMap = new Map<string, any>();
    for (const rel of coOccurringNotes) {
      if (rel.note.status === NoteStatus.PUBLISHED && !relatedNotesMap.has(rel.note.id)) {
        relatedNotesMap.set(rel.note.id, rel.note);
      }
    }

    return {
      note,
      relatedNotes: Array.from(relatedNotesMap.values()).slice(0, 4),
    };
  }

  static async getPerfumesByNoteSlug(slug: string, options: { page?: number; limit?: number; sort?: string } = {}) {
    const { page = 1, limit = 20, sort = "featured" } = options;
    const skip = (page - 1) * limit;

    const note = await prisma.note.findFirst({
      where: {
        OR: [{ slugEn: slug }, { slugAr: slug }],
        status: NoteStatus.PUBLISHED,
      },
    });

    if (!note) return null;

    const where = {
      noteId: note.id,
      product: {
        isPublished: true,
      },
    };

    let orderBy: any = [{ prominence: "desc" }];
    if (sort === "newest") orderBy = [{ product: { createdAt: "desc" } }];

    const [relations, totalItems] = await Promise.all([
      prisma.productNote.findMany({
        where,
        include: {
          product: {
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
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.productNote.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      note,
      products: relations.map((rel) => ({
        product: rel.product,
        position: rel.position,
        prominence: rel.prominence,
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
