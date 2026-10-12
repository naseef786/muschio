import { prisma } from "../prisma";
import { Decimal } from "@prisma/client/runtime/library";

export class ReviewsService {
  /**
   * Submit a review for a fragrance. Verified purchase is checked automatically against completed orders.
   */
  static async submitReview(params: {
    customerId: string;
    productId: string;
    orderItemId?: string;
    rating: number;
    title?: string;
    body: string;
    longevityRating?: number;
    sillageRating?: number;
    imageUrls?: string[];
  }) {
    // Check if customer purchased this product
    let isVerifiedPurchase = false;
    if (params.orderItemId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          id: params.orderItemId,
          order: { customerId: params.customerId, status: "DELIVERED" },
        },
      });
      if (orderItem) isVerifiedPurchase = true;
    } else {
      const pastDelivered = await prisma.orderItem.findFirst({
        where: {
          variant: { productId: params.productId },
          order: { customerId: params.customerId, status: "DELIVERED" },
        },
      });
      if (pastDelivered) isVerifiedPurchase = true;
    }

    const review = await prisma.review.create({
      data: {
        customerId: params.customerId,
        productId: params.productId,
        orderItemId: params.orderItemId,
        rating: params.rating,
        title: params.title,
        body: params.body,
        longevityRating: params.longevityRating,
        sillageRating: params.sillageRating,
        isVerifiedPurchase,
        status: "APPROVED", // Auto-approved for verified, or pending moderation
        images: params.imageUrls
          ? {
              create: params.imageUrls.map((url) => ({ imageUrl: url })),
            }
          : undefined,
      },
      include: {
        customer: true,
        images: true,
      },
    });

    // Recalculate product aggregate ratings
    const aggregates = await prisma.review.aggregate({
      where: { productId: params.productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    if (aggregates._avg.rating !== null) {
      await prisma.product.update({
        where: { id: params.productId },
        data: {
          ratingAverage: new Decimal(aggregates._avg.rating.toFixed(2)),
          ratingCount: aggregates._count.rating,
        },
      });
    }

    return review;
  }

  /**
   * Get approved reviews with customer metadata and ratings distribution
   */
  static async getProductReviews(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        images: true,
      },
    });

    return reviews;
  }
}
