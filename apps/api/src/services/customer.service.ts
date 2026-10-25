import { prisma } from "../prisma";
import jwt from "jsonwebtoken";
import { signingSecret } from "../middleware/storefront-auth";
import { ApiError } from "../middleware/error-handler";
import {
  CustomerLoginInput,
  CustomerRegisterInput,
  CreateSavedAddress,
  LoyaltyTier,
} from "@muschio/types";

function calculateLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 3000) return "ROYAL_AMBASSADOR";
  if (points >= 1000) return "GOLD_SILLAGE";
  return "PRIVILEGE";
}

function formatClientProfile(customer: any) {
  const points = customer.loyaltyPoints || 0;
  const tier = calculateLoyaltyTier(points);
  // 10 loyalty points = 1 AED credit voucher
  const loyaltyCreditsAed = Math.floor(points / 10);
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || null,
    lastName: customer.lastName || null,
    name: fullName || customer.email.split("@")[0],
    phone: customer.phone || null,
    tier,
    loyaltyPoints: points,
    loyaltyCreditsAed,
    isVip: customer.isVip || tier !== "PRIVILEGE",
    joinedDate: customer.createdAt
      ? new Date(customer.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "January 2026",
    fragranceProfile: customer.fragranceProfile
      ? {
          id: customer.fragranceProfile.id,
          customerId: customer.id,
          preferredFamilies: customer.fragranceProfile.preferredFamilies || [],
          favoriteNotes: customer.fragranceProfile.favoriteNotes || [],
          dislikedNotes: customer.fragranceProfile.dislikedNotes || [],
          preferredSillage: customer.fragranceProfile.preferredSillage,
          preferredLongevity: customer.fragranceProfile.preferredLongevity,
          signatureScentSlug: customer.fragranceProfile.signatureScentSlug,
        }
      : null,
  };
}

export class CustomerService {
  static createToken(customerId: string, email: string) {
    return jwt.sign(
      {
        sub: customerId,
        customerId,
        email,
        purpose: "storefront",
        role: "CUSTOMER",
      },
      signingSecret("JWT_SECRET"),
      {
        issuer: "muschio-api",
        audience: "muschio-storefront",
        algorithm: "HS256",
        expiresIn: "60d",
      },
    );
  }

  static async login(input: CustomerLoginInput) {
    const email = input.email.trim().toLowerCase();

    let customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        fragranceProfile: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });

    // If customer doesn't exist, create an authentic private client record
    if (!customer) {
      const rawName = email.split("@")[0] || "client";
      const nameParts = rawName.replace(/[._-]/g, " ").split(" ");
      const firstName = nameParts[0]
        ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
        : "Private";
      const lastName = nameParts[1]
        ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
        : "Client";

      // Sultan demo VIP user or standard welcome tier
      const isSultan = email.includes("sultan");
      const initialPoints = isSultan ? 1450 : 100;

      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone: isSultan ? "+971 50 123 4567" : null,
          isVip: isSultan,
          loyaltyPoints: initialPoints,
          fragranceProfile: {
            create: {
              preferredFamilies: isSultan ? ["Oriental", "Woody", "Amber"] : [],
              favoriteNotes: isSultan ? ["Oud", "Taif Rose", "Amber"] : [],
              dislikedNotes: [],
              preferredSillage: "Strong & Enveloping",
              preferredLongevity: "Eternal (12+ hours)",
            },
          },
        },
        include: {
          fragranceProfile: true,
          addresses: true,
        },
      });
    }

    const token = this.createToken(customer.id, customer.email);
    return {
      customer: formatClientProfile(customer),
      addresses: customer.addresses,
      token,
    };
  }

  static async register(input: CustomerRegisterInput) {
    const email = input.email.trim().toLowerCase();
    const parts = input.name.trim().split(" ");
    const firstName = parts[0] || "Client";
    const lastName = parts.slice(1).join(" ") || "";

    let customer = await prisma.customer.findUnique({
      where: { email },
      include: { fragranceProfile: true, addresses: true },
    });

    if (customer) {
      // Update phone/name if missing
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: customer.firstName || firstName,
          lastName: customer.lastName || lastName,
          phone: customer.phone || input.phone || null,
        },
        include: { fragranceProfile: true, addresses: true },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone: input.phone || null,
          loyaltyPoints: 100, // Welcome gift of 100 points
          fragranceProfile: {
            create: {
              preferredFamilies: [],
              favoriteNotes: [],
              dislikedNotes: [],
            },
          },
        },
        include: { fragranceProfile: true, addresses: true },
      });
    }

    const token = this.createToken(customer.id, customer.email);
    return {
      customer: formatClientProfile(customer),
      addresses: customer.addresses,
      token,
    };
  }

  static async getProfile(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        fragranceProfile: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });

    if (!customer) {
      throw new ApiError(404, "CUSTOMER_NOT_FOUND", "Customer profile not found");
    }

    return {
      customer: formatClientProfile(customer),
      addresses: customer.addresses,
    };
  }

  static async updateProfile(
    customerId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      fragranceProfile?: {
        preferredFamilies?: string[];
        favoriteNotes?: string[];
        dislikedNotes?: string[];
        preferredSillage?: string;
        preferredLongevity?: string;
      };
    },
  ) {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.fragranceProfile
          ? {
              fragranceProfile: {
                upsert: {
                  create: data.fragranceProfile,
                  update: data.fragranceProfile,
                },
              },
            }
          : {}),
      },
      include: { fragranceProfile: true, addresses: true },
    });

    return formatClientProfile(customer);
  }

  // -------------------------------------------------------------
  // SAVED ADDRESSES
  // -------------------------------------------------------------

  static async getAddresses(customerId: string) {
    return prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  static async addAddress(customerId: string, input: CreateSavedAddress) {
    return prisma.$transaction(async (tx) => {
      // If this address should be default, or if it's the customer's first address, mark as default
      const existingCount = await tx.address.count({ where: { customerId } });
      const makeDefault = input.isDefault || existingCount === 0;

      if (makeDefault) {
        await tx.address.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          customerId,
          fullName: input.fullName,
          phone: input.phone,
          streetAddress: input.streetAddress,
          apartment: input.apartment,
          city: input.city,
          emirateState: input.emirateState,
          countryCode: input.countryCode || "AE",
          postalCode: input.postalCode,
          isDefault: makeDefault,
        },
      });
    });
  }

  static async updateAddress(
    customerId: string,
    addressId: string,
    input: Partial<CreateSavedAddress>,
  ) {
    return prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: addressId, customerId },
      });

      if (!address) {
        throw new ApiError(404, "ADDRESS_NOT_FOUND", "Address not found");
      }

      if (input.isDefault) {
        await tx.address.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(input.fullName ? { fullName: input.fullName } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
          ...(input.apartment !== undefined ? { apartment: input.apartment } : {}),
          ...(input.city ? { city: input.city } : {}),
          ...(input.emirateState !== undefined ? { emirateState: input.emirateState } : {}),
          ...(input.countryCode ? { countryCode: input.countryCode } : {}),
          ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
      });
    });
  }

  static async deleteAddress(customerId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new ApiError(404, "ADDRESS_NOT_FOUND", "Address not found");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, make the next one default
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  static async setDefaultAddress(customerId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: addressId, customerId },
      });

      if (!address) {
        throw new ApiError(404, "ADDRESS_NOT_FOUND", "Address not found");
      }

      await tx.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }
}
