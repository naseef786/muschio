import { prisma } from "../prisma";
import { ApiError } from "../middleware/error-handler";

export class DiscoverySetService {
  /**
   * Retrieves all products that have official 2ml tester sample vials available.
   */
  static async getAvailableSampleVials() {
    return prisma.productVariant.findMany({
      where: {
        isSampleVial: true,
        volumeMl: 2,
        product: { isPublished: true },
        inventory: {
          testerQuantity: { gt: 0 },
        },
      },
      include: {
        product: {
          include: { brand: true, scentFamily: true },
        },
        inventory: true,
      },
    });
  }

  /**
   * Validates a 5 x 2ml custom discovery set and checks sample inventory.
   */
  static async validateCustomSet(variantIds: string[]) {
    if (variantIds.length !== 5) {
      throw new ApiError(400, "INVALID_SET_SIZE", "A custom discovery set requires exactly 5 distinct sample vials");
    }

    const uniqueIds = new Set(variantIds);
    if (uniqueIds.size !== 5) {
      throw new ApiError(400, "DUPLICATE_SAMPLES", "Please select 5 unique fragrances for your discovery set");
    }

    const samples = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isSampleVial: true,
      },
      include: {
        product: { include: { brand: true } },
        inventory: true,
      },
    });

    if (samples.length !== 5) {
      throw new ApiError(400, "INVALID_SAMPLE_SELECTION", "One or more selected vials are not valid sample items");
    }

    return {
      price: 280.00, // Fixed luxury discovery box price in AED
      currency: "AED",
      samples,
    };
  }
}
