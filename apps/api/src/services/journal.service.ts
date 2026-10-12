import { prisma } from "../prisma";

export class JournalService {
  static async getPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        include: {
          category: true,
          featuredProducts: {
            include: {
              product: {
                include: { brand: true, variants: true },
              },
            },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: { isPublished: true } }),
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
  }

  static async getPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
      include: {
        category: true,
        featuredProducts: {
          include: {
            product: {
              include: {
                brand: true,
                variants: {
                  include: { inventory: true },
                  orderBy: { price: "asc" },
                },
              },
            },
          },
        },
      },
    });
  }
}
