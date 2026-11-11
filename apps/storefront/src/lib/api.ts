import {
  Note,
  Cart,
  AddToCartInput,
  CheckoutPayload,
  AIScentConsultationInput,
  AIScentConsultationResponse,
  ClientProfile,
  SavedAddress,
  CreateSavedAddress,
} from "@muschio/types";
import { z } from "zod";
import { StorefrontProductSchema, StorefrontProduct } from "@muschio/types";
import { StorefrontOrderSchema, StorefrontOrder } from "@muschio/types";

export function resolveApiBase(): string {
  // If window is defined (browser/client-side, e.g. mobile Safari / Chrome)
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (envUrl && envUrl.startsWith("http")) {
      return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl}/api/v1`;
    }
    // Always use relative /api/v1 on the client so it works on any origin
    return "/api/v1";
  }

  // Server-side (SSR in Node.js / Vercel Serverless Function)
  const envUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl}/api/v1`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const site = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    return `${site}/api/v1`;
  }

  // Canonical public custom domain (unrestricted by Vercel deployment preview SSO protection)
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://www.muschio.ae/api/v1";
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/v1`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }

  const port = process.env.PORT || 3000;
  return `http://127.0.0.1:${port}/api/v1`;
}

let sessionRequest: Promise<string | null> | null = null;
async function guestToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("muschio_session_token");
  if (token) return token;
  if (!sessionRequest) {
    sessionRequest = (async () => {
      try {
        const apiBase = resolveApiBase();
        const response = await fetch(`${apiBase}/sessions/guest`, {
          method: "POST",
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return null;
        const result = await response.json();
        if (typeof result.data?.token !== "string") return null;
        localStorage.setItem("muschio_session_token", result.data.token);
        return result.data.token as string;
      } catch {
        return null;
      } finally {
        sessionRequest = null;
      }
    })();
  }
  return sessionRequest;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  const apiBase = resolveApiBase();
  try {
    const secured = /^\/(cart|checkout|orders|payments\/session|auth\/(me|profile)|customers\/addresses)(\/|\?|$)/.test(
      endpoint,
    );
    const token = secured ? await guestToken() : null;
    if (secured && !token) return null;
    const res = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-storefront-session": token, Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      ...(secured ||
      options?.cache === "no-store" ||
      (options?.method && options.method !== "GET")
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
      signal: options?.signal ?? AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      if (res.status === 401 && secured && typeof window !== "undefined")
        localStorage.removeItem("muschio_session_token");
      console.warn(`API request to ${endpoint} returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.data as T;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`API request to ${apiBase}${endpoint} failed:`, err);
    }
    return null;
  }
}

function normalizeRawStorefrontProduct(raw: any): StorefrontProduct {
  const brandName = raw.brand?.name || "Haute Niche";
  const brandSlug = raw.brand?.slug || brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const rawVariants = Array.isArray(raw.variants) ? raw.variants : [];

  const variants = rawVariants.map((v: any, idx: number) => {
    const volNum = v.volumeMl ?? (typeof v.volume === "number" ? v.volume : parseInt(String(v.volume || "").replace(/[^0-9]/g, "")) || 100);
    const volLabel = typeof v.volume === "string" && v.volume ? v.volume : `${volNum}ml`;
    const regPrice = Number(v.basePrice ?? v.regularPrice ?? v.originalPrice ?? (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : v.price)) || 0;
    const rawDisc = v.discountPrice !== null && v.discountPrice !== undefined
      ? Number(v.discountPrice)
      : (v.salePrice ? Number(v.salePrice) : (v.compareAtPrice && v.compareAtPrice > v.price ? Number(v.price) : null));
    const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regPrice;
    const sellingPrice = hasDisc ? rawDisc! : (Number(v.price) || regPrice);
    const stock = Number(v.stock ?? v.stockQuantity ?? v.availableQuantity ?? 25);

    return {
      id: String(v.id || `v-${idx}`),
      sku: String(v.sku || `${raw.slug}-${volNum}`),
      volume: volLabel,
      volumeMl: volNum,
      sizeLabelEn: v.sizeLabelEn || `${volLabel} Flacon`,
      sizeLabelAr: v.sizeLabelAr || `${volNum} مل`,
      basePrice: regPrice,
      regularPrice: regPrice,
      originalPrice: regPrice,
      price: sellingPrice,
      compareAtPrice: hasDisc ? regPrice : (v.compareAtPrice ? Number(v.compareAtPrice) : null),
      discountPrice: hasDisc ? rawDisc : null,
      salePrice: hasDisc ? rawDisc : null,
      isSampleVial: Boolean(v.isSampleVial),
      stock,
      stockQuantity: stock,
      availableQuantity: stock,
      warehouse: v.warehouse || "DXB-MAIN",
      isDefault: Boolean(v.isDefault),
    };
  });

  return {
    id: String(raw.id || raw.slug),
    slug: String(raw.slug),
    nameEn: String(raw.nameEn || raw.name || ""),
    nameAr: String(raw.nameAr || raw.name || raw.nameEn || ""),
    descriptionEn: String(raw.descriptionEn || ""),
    descriptionAr: String(raw.descriptionAr || ""),
    concentration: String(raw.concentration || "EXTRAIT_DE_PARFUM"),
    gender: String(raw.gender || "UNISEX"),
    images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : ["/product-placeholder.svg"],
    brand: {
      name: brandName,
      slug: brandSlug,
      type: raw.brand?.type || "NICHE",
    },
    scentFamily: raw.scentFamily
      ? {
          slug: raw.scentFamily.slug || "woody-amber",
          nameEn: raw.scentFamily.nameEn || "Woody Amber",
          nameAr: raw.scentFamily.nameAr || "عنبر خشبي",
        }
      : null,
    perfumer: raw.perfumer || null,
    perfumerBio: raw.perfumerBio || null,
    variants,
    notes: Array.isArray(raw.notes)
      ? raw.notes.map((n: any) => ({
          nameEn: String(n.nameEn || n.name || ""),
          nameAr: String(n.nameAr || n.name || n.nameEn || ""),
          position: (["TOP", "HEART", "BASE"].includes(n.position) ? n.position : "TOP") as "TOP" | "HEART" | "BASE",
          slug: String(n.slug || n.slugEn || ""),
        }))
      : [],
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t: any) => ({
          id: String(t.tag?.id || t.id || ""),
          nameEn: String(t.tag?.nameEn || t.nameEn || ""),
          nameAr: String(t.tag?.nameAr || t.nameAr || t.nameEn || ""),
          slug: String(t.tag?.slug || t.slug || ""),
          colorHex: t.tag?.colorHex || t.colorHex || "#171717",
          isFeatured: Boolean(t.tag?.isFeatured ?? t.isFeatured),
        }))
      : [],
  };
}

export const muschioApi = {
  // Tags
  async getTags(params?: Record<string, any>): Promise<any[] | null> {
    try {
      const query = params ? new URLSearchParams(params).toString() : "";
      return await apiRequest<any[]>(`/tags${query ? `?${query}` : ""}`);
    } catch (e) {
      console.error("Error in getTags:", e);
      return [];
    }
  },
  async quoteDelivery(input: {
    country: string;
    subtotal: number;
    currency: "AED";
  }) {
    return apiRequest<unknown>("/delivery/quote", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },
  // Products
  async getProducts(
    params?: Record<string, any>,
  ): Promise<StorefrontProduct[] | null> {
    try {
      const query = params ? new URLSearchParams(params).toString() : "";
      const result = await apiRequest<unknown>(
        `/products${query ? `?${query}` : ""}`,
      );
      const rawList = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.items)
          ? (result as any).items
          : [];
      if (rawList.length > 0) {
        const validated: StorefrontProduct[] = [];
        for (const item of rawList) {
          const parsed = StorefrontProductSchema.safeParse(item);
          if (parsed.success) {
            validated.push(parsed.data);
          } else if (item && (item as any).slug) {
            validated.push(normalizeRawStorefrontProduct(item));
          } else {
            console.warn(`Product ${item?.slug} failed schema validation:`, parsed.error.issues);
          }
        }
        if (validated.length > 0) {
          if (params?.limit && typeof params.limit === "number") {
            return validated.slice(0, params.limit);
          }
          return validated;
        }
      }
    } catch (e) {
      console.error("Error in getProducts:", e);
    }
    return [];
  },

  // Live Catalog Search across flacons, houses, notes and olfactory accords
  async searchCatalog(
    query: string,
    options?: { limit?: number; family?: string },
  ): Promise<Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    brandName: string;
    concentration: string;
    price: number;
    image: string;
    scentFamily?: string;
    topAccords: string[];
    prominentNotes: string[];
  }>> {
    try {
      const q = (query || "").trim();
      if (!q) return [];
      const params = new URLSearchParams({ q });
      if (options?.limit) params.set("limit", String(options.limit));
      if (options?.family) params.set("family", options.family);
      const res = await apiRequest<any>(`/search?${params.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error("Error in searchCatalog:", e);
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
    try {
      const result = await apiRequest<{ product?: unknown } | unknown>(
        `/products/${encodeURIComponent(slug)}`,
      );
      const rawProduct = (result as any)?.product ?? result;
      if (rawProduct && rawProduct.slug) {
        const parsed = StorefrontProductSchema.safeParse(rawProduct);
        if (parsed.success && parsed.data) return parsed.data;
        console.warn(`Product ${slug} schema warning:`, parsed.error?.issues);
        return normalizeRawStorefrontProduct(rawProduct);
      }
    } catch (e) {
      console.error(`Error in getProductBySlug(${slug}):`, e);
    }
    return null;
  },

  // Notes
  async getNotes(params?: Record<string, any>): Promise<Note[] | null> {
    try {
      const query = params ? new URLSearchParams(params).toString() : "";
      const result = await apiRequest<Note[]>(`/notes${query ? `?${query}` : ""}`);
      if (Array.isArray(result) && result.length > 0) return result;
    } catch {
      // Fallback
    }
    return [];
  },

  async getNoteBySlug(slug: string): Promise<Note | null> {
    const res = await apiRequest<Note>(`/notes/${slug}`);
    return res || null;
  },

  async getPerfumesByNoteSlug(slug: string): Promise<any | null> {
    return apiRequest<any>(`/notes/${slug}/products`);
  },

  // Brands
  async getBrands(): Promise<any[] | null> {
    try {
      const result = await apiRequest<any[]>("/brands");
      if (Array.isArray(result) && result.length > 0) return result;
    } catch {
      // Fallback
    }
    return [];
  },

  async getBrandBySlug(slug: string): Promise<any | null> {
    const res = await apiRequest<any>(`/brands/${encodeURIComponent(slug)}`);
    return res || null;
  },

  // Scent Families
  async getScentFamilies(): Promise<any[] | null> {
    try {
      const result = await apiRequest<any[]>("/scent-families");
      if (Array.isArray(result) && result.length > 0) return result;
    } catch {
      // Fallback
    }
    return [];
  },

  // Cart
  async getCart(
    guestSessionId?: string,
    customerId?: string,
  ): Promise<Cart | null> {
    const params = new URLSearchParams();
    if (guestSessionId) params.append("guestSessionId", guestSessionId);
    if (customerId) params.append("customerId", customerId);
    return apiRequest<Cart>(`/cart?${params.toString()}`);
  },

  async addToCart(input: AddToCartInput): Promise<Cart | null> {
    return apiRequest<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateCartItem(itemId: string, quantity: number): Promise<any | null> {
    return apiRequest<any>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  // Checkout & Payments
  async submitCheckout(payload: CheckoutPayload): Promise<any | null> {
    return apiRequest<any>("/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async initiatePayment(payload: {
    orderId: string;
    amount: number | any;
    currency?: string;
    returnUrl: string;
    cancelUrl?: string;
    customerEmail?: string;
    customerPhone?: string;
  }): Promise<{ redirectUrl?: string; status?: string; id?: string } | null> {
    return apiRequest<any>("/payments/initiate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async initiatePaymentSession(request: any): Promise<any | null> {
    return apiRequest<any>("/payments/session", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async verifyPaymentSession(sessionId: string): Promise<any | null> {
    return apiRequest<any>("/payments/verify-session", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  },
  async getOrderTracking(
    orderNumber: string,
    options?: { email?: string; phone?: string },
  ): Promise<any | null> {
    const params = new URLSearchParams();
    if (options?.email) params.append("email", options.email);
    if (options?.phone) params.append("phone", options.phone);
    const queryString = params.toString();

    return apiRequest<any>(
      `/orders/lookup/${encodeURIComponent(orderNumber)}${queryString ? `?${queryString}` : ""}`,
      { cache: "no-store" },
    );
  },
  async getPaymentAvailability(): Promise<{ methods: string[] } | null> {
    return apiRequest<{ methods: string[] }>("/payments/availability", {
      cache: "no-store",
    });
  },
  async getOrder(
    orderNumber: string,
    options?: { email?: string; phone?: string },
  ): Promise<StorefrontOrder | null> {
    const params = new URLSearchParams();
    if (options?.email) params.append("email", options.email);
    if (options?.phone) params.append("phone", options.phone);
    const queryString = params.toString();

    const result = await apiRequest<unknown>(
      `/orders/lookup/${encodeURIComponent(orderNumber)}${queryString ? `?${queryString}` : ""}`,
      { cache: "no-store" },
    );
    const parsed = StorefrontOrderSchema.safeParse(result);
    return parsed.success ? parsed.data : null;
  },
  async getMyOrders(): Promise<StorefrontOrder[] | null> {
    const result = await apiRequest<unknown>("/orders", { cache: "no-store" });
    const parsed = z.array(StorefrontOrderSchema).safeParse(result);
    return parsed.success ? parsed.data : null;
  },

  // Customer Authentication & Private Client Privilege
  async loginCustomer(email: string, password?: string): Promise<{
    customer: ClientProfile;
    addresses: SavedAddress[];
    token: string;
  } | null> {
    const res = await apiRequest<{
      customer: ClientProfile;
      addresses: SavedAddress[];
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (res?.token && typeof window !== "undefined") {
      localStorage.setItem("muschio_session_token", res.token);
    }
    return res;
  },

  async registerCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  }): Promise<{
    customer: ClientProfile;
    addresses: SavedAddress[];
    token: string;
  } | null> {
    const res = await apiRequest<{
      customer: ClientProfile;
      addresses: SavedAddress[];
      token: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (res?.token && typeof window !== "undefined") {
      localStorage.setItem("muschio_session_token", res.token);
    }
    return res;
  },

  async getCustomerProfile(): Promise<{
    customer: ClientProfile;
    addresses: SavedAddress[];
  } | null> {
    return apiRequest<{
      customer: ClientProfile;
      addresses: SavedAddress[];
    }>("/auth/me", { cache: "no-store" });
  },

  async updateCustomerProfile(data: any): Promise<ClientProfile | null> {
    return apiRequest<ClientProfile>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  // Saved Addresses
  async getSavedAddresses(): Promise<SavedAddress[] | null> {
    return apiRequest<SavedAddress[]>("/customers/addresses", {
      cache: "no-store",
    });
  },

  async createSavedAddress(
    input: CreateSavedAddress,
  ): Promise<SavedAddress | null> {
    return apiRequest<SavedAddress>("/customers/addresses", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },

  async updateSavedAddress(
    id: string,
    input: Partial<CreateSavedAddress>,
  ): Promise<SavedAddress | null> {
    return apiRequest<SavedAddress>(`/customers/addresses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
      cache: "no-store",
    });
  },

  async deleteSavedAddress(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(
      `/customers/addresses/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        cache: "no-store",
      },
    );
    return Boolean(res?.success);
  },

  async setDefaultSavedAddress(id: string): Promise<SavedAddress | null> {
    return apiRequest<SavedAddress>(
      `/customers/addresses/${encodeURIComponent(id)}/default`,
      {
        method: "POST",
        cache: "no-store",
      },
    );
  },

  // AI Scent Discovery
  async consultAIScent(
    input: AIScentConsultationInput,
  ): Promise<AIScentConsultationResponse | null> {
    return apiRequest<AIScentConsultationResponse>("/ai/scent-discovery", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  // Discovery Sets
  async getDiscoverySamples(): Promise<any[] | null> {
    return apiRequest<any[]>("/discovery-sets/samples");
  },

  async validateDiscoverySet(variantIds: string[]): Promise<any | null> {
    return apiRequest<any>("/discovery-sets/validate", {
      method: "POST",
      body: JSON.stringify({ variantIds }),
    });
  },

  // Banners & Homepage CMS
  async getActiveBanners(slot?: string): Promise<any[] | null> {
    const query = slot ? `?slot=${encodeURIComponent(slot)}` : "";
    return apiRequest<any[]>(`/content/banners${query}`);
  },

  async getHomepageSections(): Promise<any[] | null> {
    return apiRequest<any[]>("/content/sections");
  },

  // Collections (Admin Curated & Managed)
  async getCollections(params?: { featured?: boolean }): Promise<any[] | null> {
    const query = params?.featured ? "?featured=true" : "";
    return apiRequest<any[]>(`/collections${query}`);
  },

  async getCollectionBySlug(slug: string): Promise<any | null> {
    return apiRequest<any>(`/collections/${encodeURIComponent(slug)}`);
  },

  // Editorial Journal
  async getBlogPosts(page = 1, limit = 10): Promise<any[] | null> {
    return apiRequest<any[]>(`/blog?page=${page}&limit=${limit}`);
  },

  async getBlogPostBySlug(slug: string): Promise<any | null> {
    return apiRequest<any>(`/blog/${encodeURIComponent(slug)}`);
  },

  // Media & Cloudinary Storage
  async uploadMedia(
    file: string,
    folder = "muschio/general",
    publicId?: string,
  ): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  } | null> {
    return apiRequest<{
      url: string;
      secureUrl: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
    }>("/media/upload", {
      method: "POST",
      body: JSON.stringify({ file, folder, publicId }),
    });
  },

  async getUploadSignature(folder = "muschio/uploads"): Promise<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  } | null> {
    return apiRequest<{
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    }>("/media/sign", {
      method: "POST",
      body: JSON.stringify({ folder }),
    });
  },

  async deleteMedia(publicId: string): Promise<boolean> {
    const res = await apiRequest<{ result: string }>("/media", {
      method: "DELETE",
      body: JSON.stringify({ publicId }),
    });
    return res?.result === "ok";
  },

  getOptimizedMediaUrl(
    publicIdOrUrl: string,
    options?: { width?: number; height?: number; crop?: string; quality?: string },
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zwkad4sz";
    if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
      if (publicIdOrUrl.includes("res.cloudinary.com") && options) {
        const parts = publicIdOrUrl.split("/image/upload/");
        if (parts.length === 2) {
          const transforms = [
            options.width ? `w_${options.width}` : null,
            options.height ? `h_${options.height}` : null,
            options.crop ? `c_${options.crop}` : "c_limit",
            options.quality || "q_auto",
            "f_auto",
          ]
            .filter(Boolean)
            .join(",");
          return `${parts[0]}/image/upload/${transforms}/${parts[1]}`;
        }
      }
      return publicIdOrUrl;
    }

    const transforms = [
      options?.width ? `w_${options.width}` : null,
      options?.height ? `h_${options.height}` : null,
      options?.crop ? `c_${options.crop}` : "c_limit",
      options?.quality || "q_auto",
      "f_auto",
    ]
      .filter(Boolean)
      .join(",");

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicIdOrUrl}`;
  },

  // --- Dynamic Centralized Promotions & Loyalty Engine ---
  async getActivePromotions(): Promise<any[] | null> {
    return apiRequest<any[]>("/promotions/active");
  },

  async quotePromotions(payload: {
    items: Array<{ productId: string; variantId?: string; quantity: number; price: number; brandId?: string; categoryId?: string }>;
    couponCode?: string;
    giftCardCode?: string;
    customerId?: string;
    customerEmail?: string;
  }): Promise<{
    originalSubtotal: number;
    subtotal: number;
    automaticDiscountTotal: number;
    couponDiscountTotal: number;
    giftCardDeduction: number;
    totalDiscount: number;
    finalTotal: number;
    appliedPromotions: Array<{ id: string; name: string; discountAmount: number; type: string }>;
    appliedCoupon?: { code: string; discountAmount: number; type: string } | null;
    appliedGiftCard?: { code: string; appliedAmount: number; remainingBalance: number } | null;
    freeShippingQualified: boolean;
    freeGifts: Array<{ productId: string; title: string; quantity: number }>;
  } | null> {
    return apiRequest("/promotions/quote", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async verifyVoucher(
    code: string,
    cartTotal?: number,
    customerId?: string,
  ): Promise<{
    valid: boolean;
    code: string;
    type?: string;
    discountAmount?: number;
    discountPercent?: number;
    minSpend?: number;
    message?: string;
    reason?: string;
  } | null> {
    const params = new URLSearchParams({ code });
    if (cartTotal !== undefined) params.append("cartTotal", String(cartTotal));
    if (customerId) params.append("customerId", customerId);
    return apiRequest(`/coupons/verify?${params.toString()}`);
  },

  async verifyGiftCard(code: string): Promise<{
    valid: boolean;
    code: string;
    balance: number;
    currency: string;
    status: string;
    expiresAt?: string | null;
  } | null> {
    return apiRequest(`/gift-cards/verify?code=${encodeURIComponent(code)}`);
  },

  async getLoyaltyTiers(): Promise<{
    config: any;
    tiers: Array<{
      id: string;
      tier: string;
      nameEn: string;
      nameAr: string;
      thresholdSpend: number;
      multiplier: number;
      benefitsEn: string[];
      benefitsAr: string[];
    }>;
  } | null> {
    return apiRequest("/loyalty/tiers");
  },

  async getLoyaltyHistory(customerId?: string): Promise<{
    points: number;
    tier: string;
    history: Array<{
      id: string;
      type: string;
      points: number;
      balanceAfter: number;
      referenceId?: string;
      note?: string;
      createdAt: string;
    }>;
  } | null> {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
    return apiRequest(`/loyalty/history${query}`);
  },
};


