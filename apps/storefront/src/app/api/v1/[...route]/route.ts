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
  CloudinaryService,
  AdminService,
} from "@muschio/api";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://neondb_owner:npg_sQVMUZS9i7gC@ep-noisy-band-b4h6frtw-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "9f8e7d6c5b4a3928172635445566778899aabbccddeeff001122334455667788";
}
if (!process.env.ADMIN_JWT_SECRET) {
  process.env.ADMIN_JWT_SECRET = "9f8e7d6c5b4a3928172635445566778899aabbccddeeff001122334455667788";
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  process.env.CLOUDINARY_CLOUD_NAME = "zwkad4sz";
}
if (!process.env.CLOUDINARY_API_KEY) {
  process.env.CLOUDINARY_API_KEY = "287343912324243";
}
if (!process.env.CLOUDINARY_API_SECRET) {
  process.env.CLOUDINARY_API_SECRET = "YFAeE_1UdoL5Xlr05jOYspbNQnA";
}

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

    // 13. Admin Dashboard
    if (path === "admin/dashboard") {
      const metrics = await AdminService.getDashboardMetrics();
      return success(metrics);
    }

    // 14. Admin Products List
    if (path === "admin/products") {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          brand: true,
          scentFamily: true,
          variants: { include: { inventory: true } },
          notes: { include: { note: true } },
        },
      });
      return success(products);
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

    // 2. Auth: Customer & Admin Login
    if (path === "admin/auth/login") {
      const { email, password } = body || {};
      if (!email || !password) {
        return error("INVALID_INPUT", "Email and password are required", 400);
      }
      const result = await AdminService.login(email, password);
      return success(result);
    }
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

    // 10. Media: Direct Upload
    if (path === "media/upload") {
      if (!body?.file || typeof body.file !== "string") {
        return error("INVALID_INPUT", "file (string or data URI) is required", 400);
      }
      const result = await CloudinaryService.uploadImage({
        file: body.file,
        folder: body.folder,
        publicId: body.publicId,
        tags: body.tags,
        overwrite: body.overwrite,
      });
      return success(result, 201);
    }

    // 11. Media: Upload Signature
    if (path === "media/sign") {
      const folder = body?.folder || "muschio/uploads";
      const signature = CloudinaryService.generateSignature(folder);
      return success(signature);
    }

    // 12. Admin Create Product
    if (path === "admin/products") {
      const {
        name,
        nameAr,
        sku,
        price,
        brand: brandName,
        scentFamily: familyName,
        concentration,
        gender,
        volumeMl,
        imageUrl,
        stock,
        testerStock,
        status,
        descriptionEn,
        descriptionAr,
      } = body || {};

      if (!name || !sku) {
        return error("INVALID_INPUT", "Name and SKU are required", 400);
      }

      // 1. Resolve or create Brand
      let brand = await prisma.brand.findFirst({
        where: { name: { equals: String(brandName || "Haute Niche").trim(), mode: "insensitive" } },
      });
      if (!brand) {
        const brandSlug = String(brandName || "haute-niche")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        brand = await prisma.brand.create({
          data: {
            name: String(brandName || "Haute Niche").trim(),
            slug: brandSlug || `brand-${Date.now()}`,
            type: "NICHE",
          },
        });
      }

      // 2. Resolve ScentFamily if provided
      let scentFamily = null;
      if (familyName) {
        scentFamily = await prisma.scentFamily.findFirst({
          where: { nameEn: { equals: String(familyName).trim(), mode: "insensitive" } },
        });
      }

      // 3. Generate product slug
      const baseSlug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let slug = baseSlug;
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const numPrice = Number(String(price || 0).replace(/[^0-9.]/g, "")) || 0;
      const numStock = Number(stock) || 10;
      const numTesterStock = Number(testerStock) || 1;
      const numVolume = Number(volumeMl) || 100;

      // 4. Create Product with Variant and Inventory in Neon DB
      const newProduct = await prisma.product.create({
        data: {
          slug,
          nameEn: String(name).trim(),
          nameAr: String(nameAr || name).trim(),
          descriptionEn: String(descriptionEn || name).trim(),
          descriptionAr: String(descriptionAr || nameAr || name).trim(),
          brandId: brand.id,
          scentFamilyId: scentFamily?.id,
          concentration: (concentration as any) || "EXTRAIT_DE_PARFUM",
          gender: (gender as any) || "UNISEX",
          images: imageUrl ? [imageUrl] : ["/product-placeholder.svg"],
          isPublished: status !== "DRAFT",
          variants: {
            create: {
              sku: String(sku).trim(),
              volumeMl: numVolume,
              sizeLabelEn: `${numVolume}ml Extrait`,
              sizeLabelAr: `${numVolume} مل إكستريت`,
              price: numPrice,
              inventory: {
                create: {
                  sealedQuantity: numStock,
                  testerQuantity: numTesterStock,
                },
              },
            },
          },
        },
        include: {
          brand: true,
          scentFamily: true,
          variants: { include: { inventory: true } },
        },
      });

      return success(newProduct, 201);
    }

    // 13. Admin Create Brand
    if (path === "admin/brands") {
      const { name, storyEn, storyAr, countryEn, logoUrl, heroImageUrl, type } = body || {};
      if (!name) return error("INVALID_INPUT", "Brand name is required", 400);

      const baseSlug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let slug = baseSlug;
      const existing = await prisma.brand.findUnique({ where: { slug } });
      if (existing) slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const brand = await prisma.brand.create({
        data: {
          name: String(name).trim(),
          slug,
          type: type === "DESIGNER" ? "DESIGNER" : "NICHE",
          descriptionEn: storyEn || "",
          descriptionAr: storyAr || "",
          countryOfOrigin: countryEn || "France",
          logoUrl,
          heroImageUrl,
        },
      });
      return success(brand, 201);
    }

    // 14. Admin Create Note
    if (path === "admin/notes") {
      const { name, nameAr, categoryEn, categoryAr, descriptionEn, descriptionAr, heroImageUrl } = body || {};
      if (!name) return error("INVALID_INPUT", "Note name is required", 400);

      const slugEn = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slugAr = String(nameAr || name).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/(^-|-$)/g, "");

      const note = await prisma.note.create({
        data: {
          nameEn: String(name).trim(),
          nameAr: String(nameAr || name).trim(),
          slugEn: `${slugEn}-${Date.now().toString().slice(-4)}`,
          slugAr: `${slugAr}-${Date.now().toString().slice(-4)}`,
          categoryEn: categoryEn || "General",
          categoryAr: categoryAr || "عام",
          descriptionEn: descriptionEn || "",
          descriptionAr: descriptionAr || "",
          heroImageUrl,
        },
      });
      return success(note, 201);
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

    // 3. Media: Delete Image
    if (route[0] === "media") {
      const url = new URL(req.url);
      let body: any = {};
      try {
        body = await req.json();
      } catch {}
      const publicId = (url.searchParams.get("publicId") || body?.publicId) as string;
      if (!publicId) return error("INVALID_INPUT", "publicId is required", 400);
      const result = await CloudinaryService.deleteImage(publicId);
      return success(result);
    }

    // 4. Admin Delete Product
    if (route[0] === "admin" && route[1] === "products" && route[2]) {
      const productIdOrSlug = route[2];
      try {
        await prisma.product.delete({
          where: { id: productIdOrSlug },
        });
      } catch {
        // Fallback to slug or unpublish if referenced by foreign keys
        await prisma.product.updateMany({
          where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
          data: { isPublished: false },
        });
      }
      return success({ success: true, deleted: productIdOrSlug });
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${route.join("/")} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route DELETE Error:", err);
    return error("INTERNAL_ERROR", err?.message || "Internal server error", 500);
  }
}
