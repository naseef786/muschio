import { prisma } from "../prisma";
import { ContentType } from "@prisma/client";

export class ContentService {
  /**
   * Get content nodes with internal graph relations
   */
  static async getContentNodes(contentType?: ContentType) {
    return prisma.contentNode.findMany({
      where: {
        isPublished: true,
        contentType: contentType || undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        note: true,
        perfumer: true,
      },
    });
  }

  /**
   * Get content node by slug for SEO landing pages
   */
  static async getContentNodeBySlug(slug: string) {
    return prisma.contentNode.findUnique({
      where: { slug },
      include: {
        brand: { include: { products: { take: 4 } } },
        note: { include: { products: { include: { product: true } } } },
        perfumer: { include: { products: { include: { product: true } } } },
      },
    });
  }
}
