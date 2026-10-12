import {
  Product,
  Note,
  Cart,
  AddToCartInput,
  CheckoutPayload,
  AIScentConsultationInput,
  AIScentConsultationResponse,
} from "@muschio/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
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
  // Products
  async getProducts(params?: Record<string, any>): Promise<Product[] | null> {
    const query = new URLSearchParams(params).toString();
    return apiRequest<Product[]>(`/products${query ? `?${query}` : ""}`);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return apiRequest<Product>(`/products/${slug}`);
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
  async getCart(guestSessionId?: string, customerId?: string): Promise<Cart | null> {
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

  // AI Scent Discovery
  async consultAIScent(input: AIScentConsultationInput): Promise<AIScentConsultationResponse | null> {
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
};
