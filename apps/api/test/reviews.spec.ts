import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../src/prisma";
import { ReviewsService } from "../src/services/reviews.service";

describe("Product Reviews System E2E Audit", () => {
  let testProductId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    // Find or create test product
    let product = await prisma.product.findFirst({
      select: { id: true },
    });
    if (!product) {
      let brand = await prisma.brand.findFirst();
      if (!brand) {
        brand = await prisma.brand.create({
          data: {
            name: "Maison Test",
            slug: "maison-test-" + Date.now(),
          },
        });
      }
      product = await prisma.product.create({
        data: {
          brandId: brand.id,
          nameEn: "Test Extrait de Parfum",
          nameAr: "عطر تجريبي فاخر",
          slug: "test-extrait-" + Date.now(),
        },
      });
    }
    testProductId = product.id;

    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: "connoisseur-" + Date.now() + "@muschio.luxury",
          firstName: "Sultan",
          lastName: "Al Qasimi",
        },
      });
    }
    testCustomerId = customer.id;
  }, 25000);

  it("submits a new customer review and auto-moderates based on verified status", async () => {
    const review = await ReviewsService.submitReview({
      customerId: testCustomerId,
      productId: testProductId,
      rating: 5,
      title: "Majestic Sillage in Dubai",
      body: "Unrivaled longevity and projection. The amber notes linger beautifully across a 12 hour wear.",
      longevityRating: 5,
      sillageRating: 5,
    });

    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(review.productId).toBe(testProductId);
    expect(review.rating).toBe(5);
    expect(review.title).toBe("Majestic Sillage in Dubai");
    expect(["PENDING", "APPROVED"]).toContain(review.status);
  }, 35000);

  it("moderates review status via admin transition (PENDING -> APPROVED)", async () => {
    const pendingReview = await prisma.review.create({
      data: {
        customerId: testCustomerId,
        productId: testProductId,
        rating: 4,
        title: "Intriguing Leather Accord",
        body: "Dignified opening, softens to a warm amber vanilla base.",
        status: "PENDING",
        isVerifiedPurchase: false,
      },
    });

    expect(pendingReview.status).toBe("PENDING");

    const approved = await ReviewsService.updateReviewStatus(pendingReview.id, "APPROVED");
    expect(approved.status).toBe("APPROVED");

    const product = await prisma.product.findUnique({
      where: { id: testProductId },
      select: { ratingAverage: true, ratingCount: true },
    });

    expect(product).toBeDefined();
    expect(Number(product?.ratingAverage)).toBeGreaterThan(0);
    expect(product?.ratingCount).toBeGreaterThan(0);
  }, 35000);

  it("lists only APPROVED reviews on the storefront public endpoint", async () => {
    const rejectedReview = await prisma.review.create({
      data: {
        customerId: testCustomerId,
        productId: testProductId,
        rating: 1,
        title: "Spam content",
        body: "This should never be visible to genuine collectors on the storefront.",
        status: "REJECTED",
      },
    });

    const publicReviews = await ReviewsService.getProductReviews(testProductId);

    const rejectedFound = publicReviews.some((r) => r.id === rejectedReview.id);
    expect(rejectedFound).toBe(false);

    expect(publicReviews.every((r) => r.status === "APPROVED")).toBe(true);
  }, 35000);

  it("lists all reviews for administrative oversight with moderation controls", async () => {
    const allReviews = await ReviewsService.getAllReviews();
    expect(Array.isArray(allReviews)).toBe(true);
    expect(allReviews.length).toBeGreaterThan(0);

    const first = allReviews[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("rating");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("product");
  }, 35000);
});
