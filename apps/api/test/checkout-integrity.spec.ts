import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  checkoutCartWhere,
  effectiveVariantPrice,
} from "../src/services/checkout.service";

describe("checkout integrity", () => {
  it("uses a valid discounted price throughout checkout", () => {
    expect(
      effectiveVariantPrice({
        price: new Prisma.Decimal(420),
        discountPrice: new Prisma.Decimal(315),
      }).toNumber(),
    ).toBe(315);
  });

  it.each([null, new Prisma.Decimal(0), new Prisma.Decimal(420), new Prisma.Decimal(500)])(
    "falls back to the base price for a missing or invalid discount",
    (discountPrice) => {
      expect(
        effectiveVariantPrice({
          price: new Prisma.Decimal(420),
          discountPrice,
        }).toNumber(),
      ).toBe(420);
    },
  );

  it("requires cart ownership in addition to the cart ID", () => {
    expect(checkoutCartWhere("cart-1", "guest-1", "customer-1")).toEqual({
      id: "cart-1",
      OR: [
        { guestSessionId: "guest-1" },
        { customerId: "customer-1" },
      ],
    });
    expect(checkoutCartWhere("cart-1", "guest-1")).toEqual({
      id: "cart-1",
      OR: [{ guestSessionId: "guest-1" }],
    });
  });
});
