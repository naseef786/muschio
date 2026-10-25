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

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_BASE = API_ORIGIN
  ? API_ORIGIN.endsWith("/api/v1")
    ? API_ORIGIN
    : `${API_ORIGIN}/api/v1`
  : "http://localhost:4000/api/v1";
let sessionRequest: Promise<string | null> | null = null;
async function guestToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("muschio_session_token");
  if (token) return token;
  if (!sessionRequest) {
    sessionRequest = (async () => {
      try {
        const response = await fetch(`${API_BASE}/sessions/guest`, {
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
  try {
    if (!API_ORIGIN && process.env.NODE_ENV === "production") return null;
    const secured = /^\/(cart|checkout|orders|payments\/session|auth\/(me|profile)|customers\/addresses)(\/|\?|$)/.test(
      endpoint,
    );
    const token = secured ? await guestToken() : null;
    if (secured && !token) return null;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-storefront-session": token } : {}),
        ...(options?.headers || {}),
      },
      ...(secured ||
      options?.cache === "no-store" ||
      (options?.method && options.method !== "GET")
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60 } }),
      signal: options?.signal ?? AbortSignal.timeout(8000),
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
    // Graceful fallback for offline local dev or SSR without live API
    return null;
  }
}

export const muschioApi = {
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
    const query = new URLSearchParams(params).toString();
    const result = await apiRequest<unknown>(
      `/products${query ? `?${query}` : ""}`,
    );
    const parsed = z.array(StorefrontProductSchema).safeParse(result);
    return parsed.success ? parsed.data : null;
  },

  async getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
    const result = await apiRequest<{ product?: unknown }>(
      `/products/${encodeURIComponent(slug)}`,
    );
    const parsed = StorefrontProductSchema.safeParse(result?.product);
    return parsed.success ? parsed.data : null;
  },

  // Notes
  async getNotes(params?: Record<string, any>): Promise<Note[] | null> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<Note[]>(`/notes${query ? `?${query}` : ""}`);
  },

  async getNoteBySlug(slug: string): Promise<Note | null> {
    return apiRequest<Note>(`/notes/${slug}`);
  },

  async getPerfumesByNoteSlug(slug: string): Promise<any | null> {
    return apiRequest<any>(`/notes/${slug}/products`);
  },

  // Brands
  async getBrands(): Promise<any[] | null> {
    return apiRequest<any[]>("/brands");
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

  async initiatePaymentSession(request: any): Promise<any | null> {
    return apiRequest<any>("/payments/session", {
      method: "POST",
      body: JSON.stringify(request),
    });
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
};

