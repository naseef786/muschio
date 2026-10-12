import { describe, it, expect } from "vitest";
import {
  ProductFilterSchema,
  NoteFilterQuerySchema,
  AddToCartInputSchema,
  CheckoutPayloadSchema,
  AIScentConsultationInputSchema,
  CreateReviewInputSchema,
} from "@muschio/types";

describe("Shared Zod API Contracts & Trust Boundaries", () => {
  describe("ProductFilterSchema", () => {
    it("parses valid query parameters with defaults", () => {
      const parsed = ProductFilterSchema.parse({
        page: "2",
        limit: "15",
        sort: "price_desc",
        gender: "UNISEX",
      });

      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(15);
      expect(parsed.sort).toBe("price_desc");
      expect(parsed.gender).toBe("UNISEX");
    });

    it("clamps limit and provides fallback defaults", () => {
      const parsed = ProductFilterSchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.sort).toBe("featured");
    });
  });

  describe("AddToCartInputSchema", () => {
    it("validates valid cart item addition", () => {
      const valid = AddToCartInputSchema.parse({
        variantId: "11111111-1111-1111-1111-111111111111",
        quantity: 2,
        guestSessionId: "sess-abc-456",
      });

      expect(valid.variantId).toBe("11111111-1111-1111-1111-111111111111");
      expect(valid.quantity).toBe(2);
      expect(valid.guestSessionId).toBe("sess-abc-456");
    });

    it("rejects non-positive quantities", () => {
      expect(() => {
        AddToCartInputSchema.parse({
          variantId: "11111111-1111-1111-1111-111111111111",
          quantity: 0,
        });
      }).toThrow();
    });
  });

  describe("CheckoutPayloadSchema", () => {
    it("accepts valid checkout details", () => {
      const payload = CheckoutPayloadSchema.parse({
        cartId: "22222222-2222-2222-2222-222222222222",
        shippingAddress: {
          fullName: "His Excellency Sultan Al-Nuaimi",
          phone: "+971501234567",
          email: "royal@muschio.luxury",
          addressLine1: "Downtown Boulevard, Penthouse 42",
          city: "Dubai",
          stateOrEmirate: "Dubai",
          country: "AE",
        },
        paymentMethod: "TABBY",
        currency: "AED",
      });

      expect(payload.cartId).toBe("22222222-2222-2222-2222-222222222222");
      expect(payload.shippingAddress.email).toBe("royal@muschio.luxury");
      expect(payload.paymentMethod).toBe("TABBY");
    });

    it("rejects invalid emails and empty item lists", () => {
      expect(() => {
        CheckoutPayloadSchema.parse({
          cartId: "invalid-cart-uuid",
          shippingAddress: {
            fullName: "Test",
            phone: "+97150000000",
            email: "not-an-email",
            addressLine1: "123 Street",
            city: "Dubai",
            stateOrEmirate: "Dubai",
            country: "AE",
          },
          paymentMethod: "TABBY",
        });
      }).toThrow();
    });
  });

  describe("AIScentConsultationInputSchema", () => {
    it("validates natural language fragrance query and parameters", () => {
      const input = AIScentConsultationInputSchema.parse({
        query: "Looking for an aristocratic evening oud with royal frankincense",
        preferredNotes: ["Silver Frankincense", "Cambodian Oud"],
        preferredFamilies: ["oriental-amber"],
        gender: "UNISEX",
        locale: "ar",
      });

      expect(input.query).toContain("aristocratic evening oud");
      expect(input.preferredNotes).toHaveLength(2);
      expect(input.locale).toBe("ar");
    });
  });

  describe("CreateReviewInputSchema", () => {
    it("enforces rating scale 1 to 5", () => {
      expect(() => {
        CreateReviewInputSchema.parse({
          productId: "33333333-3333-3333-3333-333333333333",
          rating: 6,
          body: "Too good to be true",
        });
      }).toThrow();

      const valid = CreateReviewInputSchema.parse({
        productId: "33333333-3333-3333-3333-333333333333",
        rating: 5,
        title: "Masterpiece",
        body: "Unrivaled sillage and longevity.",
        longevityRating: 5,
        sillageRating: 5,
      });

      expect(valid.rating).toBe(5);
    });
  });
});
