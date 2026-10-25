import { NextRequest, NextResponse } from "next/server";
import {
  CatalogService,
  NotesService,
  DiscoverySetService,
  CustomerService,
  AIScentDiscoveryService,
  BannerService,
  JournalService,
  CartService,
  CheckoutService,
  PaymentService,
  storefrontProduct,
  storefrontOrder,
  prisma,
} from "@muschio/api";

export const dynamic = "force-dynamic";

function success(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function error(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    const part = parts[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let customerId: string | undefined = undefined;
  let guestSessionId: string | undefined = undefined;

  if (token) {
    const decoded = decodeJwtPayload(token);
    if (decoded?.customerId) customerId = String(decoded.customerId);
    else if (decoded?.sub) customerId = String(decoded.sub);
  }

  const url = new URL(req.url);
  const qCustomerId = url.searchParams.get("customerId");
  const qGuestSessionId = url.searchParams.get("guestSessionId");

  if (qCustomerId) customerId = qCustomerId;
  if (qGuestSessionId) guestSessionId = qGuestSessionId;

  return { customerId, guestSessionId, token };
}

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const path = route.join("/");
    const url = new URL(req.url);

    // 1. Brands
    if (path === "brands") {
      const brands = await CatalogService.getBrands();
      return success(brands);
    }
    if (route[0] === "brands" && route[1]) {
      const slug = route[1];
      const brand = await CatalogService.getBrandBySlug(slug);
      if (!brand) return error("BRAND_NOT_FOUND", "Brand not found", 404);
      return success(brand);
    }

    // 2. Scent Families
    if (path === "scent-families") {
      const families = await CatalogService.getScentFamilies();
      return success(families);
    }

    // 3. Notes
    if (path === "notes") {
      const search = url.searchParams.get("search") || undefined;
      const result = await NotesService.getNotes({ search });
      return success(result.items);
    }
    if (route[0] === "notes" && route[1]) {
      const slug = route[1];
      if (route[2] === "products") {
        const result = await NotesService.getPerfumesByNoteSlug(slug);
        if (!result) return error("NOTE_NOT_FOUND", "Note not found", 404);
        return success(result);
      }
      const result = await NotesService.getNoteBySlug(slug);
      if (!result) return error("NOTE_NOT_FOUND", "Note not found", 404);
      return success(result);
    }

    // 4. Products
    if (path === "products") {
      const search = url.searchParams.get("search") || undefined;
      const brandSlug = url.searchParams.get("brandSlug") || undefined;
      const limit = Number(url.searchParams.get("limit") || "100");
      const result = await CatalogService.getProducts({
        search,
        brandSlug,
        page: 1,
        limit,
        sort: "featured",
      });
      return success(result.items.map(storefrontProduct));
    }
    if (route[0] === "products" && route[1]) {
      const slug = route[1];
      const result = await CatalogService.getProductBySlug(slug);
      if (!result) return error("PRODUCT_NOT_FOUND", "Product not found", 404);
      return success({ product: storefrontProduct(result.product) });
    }

    // 5. Discovery Sets
    if (path === "discovery-sets/samples") {
      const samples = await DiscoverySetService.getAvailableSampleVials();
      return success(samples);
    }

    // 6. Editorial Journal
    if (path === "blog") {
      const page = Number(url.searchParams.get("page") || "1");
      const limit = Number(url.searchParams.get("limit") || "10");
      const result = await JournalService.getPosts(page, limit);
      return success(result.items);
    }
    if (route[0] === "blog" && route[1]) {
      const slug = route[1];
      const post = await JournalService.getPostBySlug(slug);
      if (!post) return error("POST_NOT_FOUND", "Post not found", 404);
      return success(post);
    }

    // 7. Content / Banners / Sections
    if (path === "content/banners") {
      const slot = url.searchParams.get("slot") as any;
      const banners = await BannerService.getActiveBanners(slot);
      return success(banners);
    }
    if (path === "content/sections") {
      const sections = await BannerService.getVisibleSections();
      return success(sections);
    }

    // 8. Auth / Private Client Profile
    if (path === "auth/me") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const profile = await CustomerService.getProfile(customerId);
      return success(profile);
    }

    // 9. Saved Addresses
    if (path === "customers/addresses") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const addresses = await CustomerService.getAddresses(customerId);
      return success(addresses);
    }

    // 10. Cart
    if (path === "cart") {
      const { customerId, guestSessionId } = getAuth(req);
      if (!customerId && !guestSessionId) {
        return success(null);
      }
      const cart = await CartService.getOrCreateCart(guestSessionId, customerId);
      return success(cart);
    }

    // 11. Orders
    if (path === "orders") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const orders = await prisma.order.findMany({
        where: { customerId },
        include: { items: true, payments: true },
        orderBy: { createdAt: "desc" },
      });
      return success(orders.map(storefrontOrder));
    }
    if (route[0] === "orders" && route[1] === "lookup" && route[2]) {
      const orderNumber = route[2];
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, payments: true },
      });
      if (!order) return error("ORDER_NOT_FOUND", "Order not found", 404);
      return success(storefrontOrder(order));
    }

    // 12. Payment Availability
    if (path === "payments/availability") {
      return success({ methods: PaymentService.availableMethods() });
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route Error:", err);
    return error("INTERNAL_ERROR", err?.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const path = route.join("/");
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // 1. Guest Session
    if (path === "sessions/guest") {
      return success({ token: CustomerService.createToken("guest-" + Date.now(), "guest@muschio.client") });
    }

    // 2. Auth: Login & Register
    if (path === "auth/login") {
      const result = await CustomerService.login(body);
      return success(result);
    }
    if (path === "auth/register") {
      const result = await CustomerService.register(body);
      return success(result, 201);
    }

    // 3. AI Scent Discovery
    if (path === "ai/scent-discovery") {
      const result = await AIScentDiscoveryService.consult(body);
      return success(result);
    }

    // 4. Discovery Sets Validate
    if (path === "discovery-sets/validate") {
      const result = await DiscoverySetService.validateCustomSet(body.variantIds || []);
      return success(result);
    }

    // 5. Delivery Quote
    if (path === "delivery/quote") {
      const country = body.country || "AE";
      const subtotal = Number(body.subtotal || 0);
      const isFree = subtotal >= 500;
      return success({
        country,
        currency: "AED",
        shippingFee: isFree ? 0 : 30,
        isFreeShipping: isFree,
        freeShippingThreshold: 500,
        estimatedDaysMin: country === "AE" ? 1 : 2,
        estimatedDaysMax: country === "AE" ? 2 : 4,
      });
    }

    // 6. Cart Items Add
    if (path === "cart/items") {
      const { customerId, guestSessionId } = getAuth(req);
      const cart = await CartService.addItem({
        guestSessionId: body.guestSessionId || guestSessionId,
        customerId: body.customerId || customerId,
        variantId: body.variantId,
        quantity: body.quantity || 1,
      });
      return success(cart);
    }

    // 7. Checkout Process
    if (path === "checkout") {
      const { customerId, guestSessionId } = getAuth(req);
      const session = body.guestSessionId || guestSessionId || "guest";
      const customer = body.customerId || customerId;
      const order = await CheckoutService.processCheckout(body, session, customer);
      return success(order, 201);
    }

    // 8. Saved Addresses: Create
    if (path === "customers/addresses") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const address = await CustomerService.addAddress(customerId, body);
      return success(address, 201);
    }

    // 9. Saved Addresses: Set Default
    if (route[0] === "customers" && route[1] === "addresses" && route[2] && route[3] === "default") {
      const addressId = route[2];
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const address = await CustomerService.setDefaultAddress(customerId, addressId);
      return success(address);
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route POST Error:", err);
    return error("INTERNAL_ERROR", err?.message || "Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const path = route.join("/");
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // 1. Client Profile
    if (path === "auth/profile") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const profile = await CustomerService.updateProfile(customerId, body);
      return success(profile);
    }

    // 2. Cart Items: Update Quantity
    if (route[0] === "cart" && route[1] === "items" && route[2]) {
      const itemId = route[2];
      const { customerId, guestSessionId } = getAuth(req);
      const session = body.guestSessionId || guestSessionId || "guest";
      const result = await CartService.updateItem(itemId, Number(body.quantity || 0), session, customerId);
      return success(result);
    }

    // 3. Saved Addresses: Update
    if (route[0] === "customers" && route[1] === "addresses" && route[2]) {
      const addressId = route[2];
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const address = await CustomerService.updateAddress(customerId, addressId, body);
      return success(address);
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route PATCH Error:", err);
    return error("INTERNAL_ERROR", err?.message || "Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];

    // 1. Cart Items: Remove
    if (route[0] === "cart" && route[1] === "items" && route[2]) {
      const itemId = route[2];
      const { customerId, guestSessionId } = getAuth(req);
      const session = guestSessionId || "guest";
      const result = await CartService.updateItem(itemId, 0, session, customerId);
      return success(result);
    }

    // 2. Saved Addresses: Delete
    if (route[0] === "customers" && route[1] === "addresses" && route[2]) {
      const addressId = route[2];
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);
      const result = await CustomerService.deleteAddress(customerId, addressId);
      return success(result);
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${route.join("/")} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route DELETE Error:", err);
    return error("INTERNAL_ERROR", err?.message || "Internal server error", 500);
  }
}
