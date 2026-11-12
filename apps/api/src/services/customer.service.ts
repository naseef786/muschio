import { prisma } from "../prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signingSecret } from "../middleware/storefront-auth";
import { ApiError } from "../middleware/error-handler";
import {
  CustomerLoginInput,
  CustomerRegisterInput,
  CreateSavedAddress,
  LoyaltyTier,
} from "@muschio/types";
import { LoyaltyService } from "./loyalty.service";

async function formatClientProfile(customer: any) {
  const points = customer.loyaltyPoints || 0;
  const tierInfo = await LoyaltyService.calculateTierForCustomer(points);
  const config = await LoyaltyService.getProgramConfig();
  const rate = config.pointsRedemptionRate || 10;
  const loyaltyCreditsAed = Math.floor(points / rate);
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName || null,
    lastName: customer.lastName || null,
    name: fullName || customer.email.split("@")[0],
    phone: customer.phone || null,
    tier: tierInfo.tierKey as LoyaltyTier,
    tierNameEn: tierInfo.tierNameEn,
    tierNameAr: tierInfo.tierNameAr,
    tierMultiplier: tierInfo.earningMultiplier,
    tierBenefitsEn: tierInfo.benefitsEn,
    tierBenefitsAr: tierInfo.benefitsAr,
    nextTier: tierInfo.nextTier,
    loyaltyPoints: points,
    loyaltyCreditsAed,
    isVip: customer.isVip || tierInfo.tierKey !== "PRIVILEGE",
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

function deduplicateAddresses<T extends { id: string; streetAddress: string; city: string; countryCode: string }>(
  addresses: T[],
): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  const duplicateIds: string[] = [];

  for (const addr of addresses) {
    const key = `${(addr.streetAddress || "").trim().toLowerCase()}|${(addr.city || "").trim().toLowerCase()}|${(addr.countryCode || "AE").trim().toUpperCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(addr);
    } else {
      duplicateIds.push(addr.id);
    }
  }

  if (duplicateIds.length > 0) {
    prisma.address
      .updateMany({
        where: { id: { in: duplicateIds } },
        data: { customerId: null, isDefault: false },
      })
      .catch(() => {});
  }

  return unique;
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
    const password = input.password;
    if (!password) {
      throw new ApiError(400, "PASSWORD_REQUIRED", "Password is required to access your account.");
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        fragranceProfile: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });

    if (!customer) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password. Access denied.",
      );
    }

    if (!customer.passwordHash) {
      throw new ApiError(
        401,
        "ACCOUNT_SETUP_REQUIRED",
        "Please create a password before accessing this account.",
      );
    }
    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password. Access denied.",
      );
    }

    const token = this.createToken(customer.id, customer.email);
    return {
      customer: await formatClientProfile(customer),
      addresses: deduplicateAddresses(customer.addresses),
      token,
    };
  }

  static async register(input: CustomerRegisterInput) {
    const email = input.email.trim().toLowerCase();
    const parts = (input.name || "Client").trim().split(" ");
    const firstName = parts[0] || "Client";
    const lastName = parts.slice(1).join(" ") || "";

    const existing = await prisma.customer.findUnique({
      where: { email },
      include: { fragranceProfile: true, addresses: true },
    });

    let passwordHash: string | null = null;
    passwordHash = await bcrypt.hash(input.password!, 12);

    let customer;
    let isNewCustomer = false;
    if (existing) {
      if (existing.passwordHash) {
        throw new ApiError(
          409,
          "ACCOUNT_EXISTS",
          "An account with this email address already exists. Please sign in.",
        );
      }
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          firstName: existing.firstName || firstName,
          lastName: existing.lastName || lastName,
          phone: existing.phone || input.phone || null,
          passwordHash: passwordHash || existing.passwordHash,
        },
        include: { fragranceProfile: true, addresses: true },
      });
    } else {
      isNewCustomer = true;
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone: input.phone || null,
          passwordHash,
          loyaltyPoints: 0,
          fragranceProfile: {
            create: {
              preferredFamilies: [],
              favoriteNotes: [],
              dislikedNotes: [],
              preferredSillage: "Strong & Enveloping",
              preferredLongevity: "Eternal (12+ hours)",
            },
          },
        },
        include: { fragranceProfile: true, addresses: true },
      });
    }

    // Award welcome bonus points with ledger transaction if new
    if (isNewCustomer) {
      await LoyaltyService.awardWelcomeBonus(customer.id);
      const refreshed = await prisma.customer.findUnique({
        where: { id: customer.id },
        include: { fragranceProfile: true, addresses: true },
      });
      if (refreshed) customer = refreshed;
    }

    const token = this.createToken(customer.id, customer.email);
    return {
      customer: await formatClientProfile(customer),
      addresses: deduplicateAddresses(customer.addresses),
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
      customer: await formatClientProfile(customer),
      addresses: deduplicateAddresses(customer.addresses),
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

    return await formatClientProfile(customer);
  }

  // -------------------------------------------------------------
  // SAVED ADDRESSES
  // -------------------------------------------------------------

  static async getAddresses(customerId: string) {
    const rawAddresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return deduplicateAddresses(rawAddresses);
  }

  static async addAddress(customerId: string, input: CreateSavedAddress) {
    return prisma.$transaction(async (tx) => {
      const normStreet = (input.streetAddress || "").trim().toLowerCase();
      const normCity = (input.city || "").trim().toLowerCase();
      const normCountry = (input.countryCode || "AE").trim().toUpperCase();

      const existingAddresses = await tx.address.findMany({
        where: { customerId },
      });

      const match = existingAddresses.find(
        (a) =>
          (a.streetAddress || "").trim().toLowerCase() === normStreet &&
          (a.city || "").trim().toLowerCase() === normCity &&
          (a.countryCode || "AE").trim().toUpperCase() === normCountry,
      );

      if (match) {
        if (input.isDefault) {
          await tx.address.updateMany({
            where: { customerId },
            data: { isDefault: false },
          });
        }
        return tx.address.update({
          where: { id: match.id },
          data: {
            fullName: input.fullName || match.fullName,
            phone: input.phone || match.phone,
            apartment: input.apartment ?? match.apartment,
            emirateState: input.emirateState ?? match.emirateState,
            postalCode: input.postalCode ?? match.postalCode,
            isDefault: input.isDefault ?? match.isDefault,
          },
        });
      }

      // If this address should be default, or if it's the customer's first address, mark as default
      const existingCount = existingAddresses.length;
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

    // Check if an existing order references this address snapshot
    const ordersCount = await prisma.order.count({
      where: { shippingAddressId: addressId },
    });

    if (ordersCount > 0) {
      // Safely unlink from customer profile so historical orders preserve shipping record
      await prisma.address.update({
        where: { id: addressId },
        data: { customerId: null, isDefault: false },
      });
    } else {
      await prisma.address.delete({
        where: { id: addressId },
      });
    }

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
