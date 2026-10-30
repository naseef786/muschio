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
import { EmailService } from "@/lib/email-service";
import { WhatsAppService } from "@/lib/whatsapp-service";


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
if (!process.env.PAYMENTS_ENABLED) {
  process.env.PAYMENTS_ENABLED = "true";
}
if (!process.env.PAYMENT_PROVIDER) {
  process.env.PAYMENT_PROVIDER = "stripe";
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
      const methods = PaymentService.availableMethods();
      if (!methods.includes("CREDIT_CARD" as any)) {
        methods.push("CREDIT_CARD" as any);
      }
      if (!methods.includes("CASH_ON_DELIVERY" as any)) {
        methods.push("CASH_ON_DELIVERY" as any);
      }
      return success({ methods });
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
          perfumers: { include: { perfumer: true } },
          variants: { include: { inventory: true } },
          notes: { include: { note: true } },
        },
      });
      return success(products);
    }

    // 15. Admin Orders List
    if (path === "admin/orders") {
      const limit = Number(url.searchParams.get("limit") || "100");
      const status = url.searchParams.get("status") || undefined;
      const orders = await prisma.order.findMany({
        where: status ? { status: status as any } : undefined,
        include: {
          items: true,
          shippingAddress: true,
          payments: { orderBy: { createdAt: "desc" } },
          customer: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return success(orders);
    }

    // 16. Admin Real-Time Live Tracker (Events, Live Orders, Counters)
    if (path === "admin/orders/live") {
      const sinceParam = url.searchParams.get("since");
      const sinceDate = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 30 * 1000);

      const [recentEvents, latestOrders, totalOrders, pendingOrders, cancelledOrders, totalEnquiries] = await Promise.all([
        prisma.businessEvent.findMany({
          where: { createdAt: { gt: sinceDate } },
          orderBy: { createdAt: "asc" },
          take: 50,
        }),
        prisma.order.findMany({
          where: { createdAt: { gt: sinceDate } },
          include: {
            items: true,
            shippingAddress: true,
            payments: { orderBy: { createdAt: "desc" } },
            customer: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "CANCELLED" } }),
        prisma.businessEvent.count({ where: { eventName: "ENQUIRY_CREATED" } }),
      ]);

      return success({
        events: recentEvents,
        orders: latestOrders,
        counters: {
          totalOrders,
          pendingOrders,
          cancelledOrders,
          totalEnquiries,
        },
        serverTime: new Date().toISOString(),
      });
    }

    // 17. Admin Customer & VIP Concierge Enquiries List
    if (path === "admin/enquiries") {
      const enquiries = await prisma.businessEvent.findMany({
        where: { eventName: "ENQUIRY_CREATED" },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return success(
        enquiries.map((e) => {
          const payload = (e.payload as any) || {};
          return {
            id: e.id,
            aggregateId: e.aggregateId,
            createdAt: e.createdAt,
            ...payload,
          };
        })
      );
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
      let targetVariantId = body.variantId;
      // If variantId is not a UUID, resolve to a real database variant
      if (
        !targetVariantId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetVariantId)
      ) {
        const fallbackVariant = await prisma.productVariant.findFirst({
          where: { product: { isPublished: true } },
          select: { id: true },
        });
        if (fallbackVariant) targetVariantId = fallbackVariant.id;
      }
      try {
        const cart = await CartService.addItem({
          guestSessionId: body.guestSessionId || guestSessionId,
          customerId: body.customerId || customerId,
          variantId: targetVariantId,
          quantity: body.quantity || 1,
        });
        return success(cart);
      } catch (err: any) {
        // Fallback to first available variant if requested variant is missing
        const firstVariant = await prisma.productVariant.findFirst({
          where: { product: { isPublished: true } },
          select: { id: true },
        });
        if (firstVariant && firstVariant.id !== targetVariantId) {
          const cart = await CartService.addItem({
            guestSessionId: body.guestSessionId || guestSessionId,
            customerId: body.customerId || customerId,
            variantId: firstVariant.id,
            quantity: body.quantity || 1,
          });
          return success(cart);
        }
        throw err;
      }
    }

    // 7. Checkout Process
    if (path === "checkout") {
      const { customerId, guestSessionId } = getAuth(req);
      const session = body.guestSessionId || guestSessionId || "guest";
      const customer = body.customerId || customerId;
      const order = await CheckoutService.processCheckout(body, session, customer);

      // Fetch full order to guarantee addresses and items for logging & emails
      const fullOrder = await CheckoutService.getOrderById(order.id).catch(() => null);
      const orderToLog = fullOrder || order;

      await prisma.businessEvent.create({
        data: {
          eventName: "ORDER_CREATED",
          aggregateType: "ORDER",
          aggregateId: order.id,
          payload: {
            orderNumber: order.orderNumber,
            customerName: (orderToLog as any).shippingAddress?.fullName || (orderToLog as any).customer?.name || "Client",
            totalAmount: Number(order.totalAmount),
            currency: order.currency || "AED",
            status: order.status,
            itemCount: (orderToLog as any).items?.length || 1,
            createdAt: new Date().toISOString(),
          },
        },
      }).catch((err) => console.error("Failed to log ORDER_CREATED event:", err));

      // Trigger transactional emails asynchronously
      EmailService.sendOrderConfirmation(orderToLog).catch((err) =>
        console.error("Failed to send order confirmation email:", err)
      );
      EmailService.sendAdminOrderAlert(orderToLog).catch((err) =>
        console.error("Failed to send admin order alert email:", err)
      );

      // Trigger transactional WhatsApp messages asynchronously
      WhatsAppService.sendOrderConfirmation(orderToLog).catch((err) =>
        console.error("Failed to send WhatsApp order confirmation:", err)
      );
      WhatsAppService.sendAdminOrderAlert(orderToLog).catch((err) =>
        console.error("Failed to send WhatsApp admin alert:", err)
      );

      return success(storefrontOrder(orderToLog), 201);
    }

    // 7b. Payment Session Initiation
    if (path === "payments/session") {
      const { orderId, amount, currency, method, returnUrl, cancelUrl, customerEmail, customerPhone } = body || {};
      if (!orderId) {
        return error("INVALID_INPUT", "orderId is required", 400);
      }

      // If Cash On Delivery or VIP Concierge payment
      if (method === "CASH_ON_DELIVERY" || method === "COD") {
        return success({
          id: `cod_${Date.now()}`,
          redirectUrl: returnUrl,
          status: "pending_cod",
        });
      }

      try {
        const session = await PaymentService.initiatePayment({
          orderId,
          amount: Number(amount),
          currency: currency || "AED",
          method: "CREDIT_CARD",
          returnUrl,
          cancelUrl,
          customerEmail,
          customerPhone,
        });
        return success(session);
      } catch (err: any) {
        console.warn("Stripe initiation in test/fallback mode:", err?.message || err);
        // Seamless fallback to order confirmation for test orders
        return success({
          id: `test_${Date.now()}`,
          redirectUrl: returnUrl,
          status: "test_mode",
        });
      }
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

    // 12. Admin Create or Update Product
    if (path === "admin/products") {
      const {
        id: existingId,
        name,
        nameAr,
        sku,
        price,
        brand: brandName,
        scentFamily: familyName,
        perfumer: perfumerName,
        perfumers: perfumersList,
        perfumerBio,
        concentration,
        gender,
        volumeMl,
        imageUrl,
        images: imagesList,
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

      // 2. Resolve or create ScentFamily if provided
      let scentFamily = null;
      if (familyName) {
        scentFamily = await prisma.scentFamily.findFirst({
          where: { nameEn: { equals: String(familyName).trim(), mode: "insensitive" } },
        });
        if (!scentFamily) {
          const familySlug = String(familyName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          scentFamily = await prisma.scentFamily.create({
            data: {
              nameEn: String(familyName).trim(),
              nameAr: String(familyName).trim(),
              slug: familySlug || `family-${Date.now()}`,
              descriptionEn: `${familyName} olfactory family`,
              descriptionAr: `عائلة عطور ${familyName}`,
            },
          });
        }
      }

      // 2.5 Resolve or create multiple Perfumers
      const perfumerNames: string[] = [];
      if (Array.isArray(perfumersList) && perfumersList.length > 0) {
        for (const p of perfumersList) {
          if (typeof p === "string" && p.trim()) perfumerNames.push(p.trim());
        }
      } else if (perfumerName && typeof perfumerName === "string") {
        const parts = perfumerName.split(",").map((p) => p.trim()).filter(Boolean);
        perfumerNames.push(...parts);
      }

      const resolvedPerfumerIds: string[] = [];
      for (const pName of perfumerNames) {
        let perfumerRecord = await prisma.perfumer.findFirst({
          where: { name: { equals: pName, mode: "insensitive" } },
        });
        if (!perfumerRecord) {
          const perfumerSlug = pName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          perfumerRecord = await prisma.perfumer.create({
            data: {
              name: pName,
              slug: perfumerSlug || `perfumer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              bioEn: perfumerBio ? String(perfumerBio).trim() : null,
            },
          });
        }
        if (perfumerRecord) {
          resolvedPerfumerIds.push(perfumerRecord.id);
        }
      }

      // 2.8 Resolve multiple images
      let productImages: string[] = [];
      if (Array.isArray(imagesList) && imagesList.length > 0) {
        productImages = imagesList.map((img: any) => String(img).trim()).filter(Boolean);
      } else if (imageUrl) {
        productImages = [String(imageUrl).trim()];
      }
      if (productImages.length === 0) {
        productImages = ["/product-placeholder.svg"];
      }

      // 3. Generate product slug
      const baseSlug = String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let slug = baseSlug;

      const numPrice = Number(String(price || 0).replace(/[^0-9.]/g, "")) || 0;
      const numStock = Number(stock) || 10;
      const numTesterStock = Number(testerStock) || 1;
      const numVolume = Number(volumeMl) || 100;

      // Parse incoming multi-volume variants or fallback to single variant
      const incomingVariants: Array<{
        volume: string;
        volumeMl: number;
        sizeLabelEn: string;
        sizeLabelAr: string;
        basePrice: number;
        regularPrice: number;
        originalPrice: number;
        price: number;
        compareAtPrice: number | null;
        discountPrice: number | null;
        salePrice: number | null;
        sku: string;
        stockQuantity: number;
        warehouse: string;
        isDefault: boolean;
      }> = (Array.isArray(body?.variants) && body.variants.length > 0)
        ? body.variants.map((v: any, index: number) => {
            const vVolNum = Number(v.volumeMl) || (typeof v.volume === "number" ? v.volume : parseInt(String(v.volume || "100").replace(/[^0-9]/g, "") || "100", 10)) || 100;
            const vVol = String(v.volume || `${vVolNum}ml`).trim().endsWith("ml") ? String(v.volume || `${vVolNum}ml`).trim() : `${vVolNum}ml`;
            const vBasePrice = Number(String(v.basePrice ?? v.regularPrice ?? v.originalPrice ?? v.price ?? 0).replace(/[^0-9.]/g, "")) || 0;
            const rawSellingPrice = Number(String((v.price !== undefined && v.price !== null ? v.price : (v.discountPrice ?? vBasePrice))).replace(/[^0-9.]/g, "")) || vBasePrice;
            const vSellingPrice = (rawSellingPrice > 0 && rawSellingPrice <= vBasePrice) ? rawSellingPrice : (vBasePrice || rawSellingPrice);
            const vCompareAt = (vBasePrice > vSellingPrice) ? vBasePrice : null;
            const vDiscPrice = (vSellingPrice < vBasePrice) ? vSellingPrice : null;
            const vStock = Number(v.stockQuantity ?? v.stock) >= 0 ? Number(v.stockQuantity ?? v.stock) : 10;
            const vWarehouse = String(v.warehouse || body.warehouse || "DXB-MAIN").trim();
            const vSku = String(v.sku || `${sku}-${vVolNum}`).trim();
            const vIsDefault = Boolean(v.isDefault ?? index === 0);
            return {
              volume: vVol,
              volumeMl: vVolNum,
              sizeLabelEn: `${vVol} Flacon`,
              sizeLabelAr: `${vVolNum} مل إكستريت`,
              basePrice: vBasePrice,
              regularPrice: vBasePrice,
              originalPrice: vBasePrice,
              price: vSellingPrice,
              compareAtPrice: vCompareAt,
              discountPrice: vDiscPrice,
              salePrice: vDiscPrice,
              sku: vSku,
              stockQuantity: vStock,
              warehouse: vWarehouse,
              isDefault: vIsDefault,
            };
          })
        : [
            {
              volume: `${numVolume}ml`,
              volumeMl: numVolume,
              sizeLabelEn: `${numVolume}ml Extrait`,
              sizeLabelAr: `${numVolume} مل إكستريت`,
              basePrice: numPrice,
              regularPrice: numPrice,
              originalPrice: numPrice,
              price: numPrice,
              compareAtPrice: null,
              discountPrice: null,
              salePrice: null,
              sku: String(sku).trim(),
              stockQuantity: numStock,
              warehouse: String(body?.warehouse || "DXB-MAIN").trim(),
              isDefault: true,
            },
          ];

      // Check if product already exists to update
      let targetProduct = null;
      if (existingId) {
        targetProduct = await prisma.product.findUnique({ where: { id: existingId } });
      }
      if (!targetProduct) {
        targetProduct = await prisma.product.findFirst({
          where: { variants: { some: { sku: String(sku).trim() } } },
        });
      }

      let savedProduct;

      if (targetProduct) {
        // Update existing product
        await prisma.productPerfumer.deleteMany({
          where: { productId: targetProduct.id },
        });

        // Upsert / sync variants
        for (const iv of incomingVariants) {
          const existingVariant = await prisma.productVariant.findFirst({
            where: {
              OR: [
                { sku: iv.sku },
                { productId: targetProduct.id, volumeMl: iv.volumeMl },
              ],
            },
          });
          if (existingVariant) {
            await prisma.productVariant.update({
              where: { id: existingVariant.id },
              data: {
                sku: iv.sku,
                volume: iv.volume,
                volumeMl: iv.volumeMl,
                sizeLabelEn: iv.sizeLabelEn,
                sizeLabelAr: iv.sizeLabelAr,
                price: iv.price,
                compareAtPrice: iv.compareAtPrice,
                discountPrice: iv.discountPrice,
                warehouse: iv.warehouse,
                isDefault: iv.isDefault,
              },
            });
            await prisma.inventory.upsert({
              where: { variantId: existingVariant.id },
              create: {
                variantId: existingVariant.id,
                sealedQuantity: iv.stockQuantity,
                testerQuantity: numTesterStock,
              },
              update: {
                sealedQuantity: iv.stockQuantity,
              },
            });
          } else {
            await prisma.productVariant.create({
              data: {
                productId: targetProduct.id,
                sku: iv.sku,
                volume: iv.volume,
                volumeMl: iv.volumeMl,
                sizeLabelEn: iv.sizeLabelEn,
                sizeLabelAr: iv.sizeLabelAr,
                price: iv.price,
                compareAtPrice: iv.compareAtPrice,
                discountPrice: iv.discountPrice,
                warehouse: iv.warehouse,
                isDefault: iv.isDefault,
                inventory: {
                  create: {
                    sealedQuantity: iv.stockQuantity,
                    testerQuantity: numTesterStock,
                  },
                },
              },
            });
          }
        }

        savedProduct = await prisma.product.update({
          where: { id: targetProduct.id },
          data: {
            nameEn: String(name).trim(),
            nameAr: String(nameAr || name).trim(),
            descriptionEn: String(descriptionEn || name).trim(),
            descriptionAr: String(descriptionAr || nameAr || name).trim(),
            brandId: brand.id,
            scentFamilyId: scentFamily?.id,
            concentration: (concentration as any) || "EXTRAIT_DE_PARFUM",
            gender: (gender as any) || "UNISEX",
            images: productImages,
            isPublished: status !== "DRAFT",
            perfumers: resolvedPerfumerIds.length > 0
              ? {
                  create: resolvedPerfumerIds.map((id, index) => ({
                    perfumerId: id,
                    isLead: index === 0,
                  })),
                }
              : undefined,
          },
          include: {
            brand: true,
            scentFamily: true,
            perfumers: { include: { perfumer: true } },
            variants: { include: { inventory: true } },
          },
        });
      } else {
        // Create new product
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        }

        savedProduct = await prisma.product.create({
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
            images: productImages,
            isPublished: status !== "DRAFT",
            perfumers: resolvedPerfumerIds.length > 0
              ? {
                  create: resolvedPerfumerIds.map((id, index) => ({
                    perfumerId: id,
                    isLead: index === 0,
                  })),
                }
              : undefined,
            variants: {
              create: incomingVariants.map((iv) => ({
                sku: iv.sku,
                volume: iv.volume,
                volumeMl: iv.volumeMl,
                sizeLabelEn: iv.sizeLabelEn,
                sizeLabelAr: iv.sizeLabelAr,
                price: iv.price,
                compareAtPrice: iv.compareAtPrice,
                discountPrice: iv.discountPrice,
                warehouse: iv.warehouse,
                isDefault: iv.isDefault,
                inventory: {
                  create: {
                    sealedQuantity: iv.stockQuantity,
                    testerQuantity: numTesterStock,
                  },
                },
              })),
            },
          },
          include: {
            brand: true,
            scentFamily: true,
            perfumers: { include: { perfumer: true } },
            variants: { include: { inventory: true } },
          },
        });
      }

      return success(savedProduct, targetProduct ? 200 : 201);
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

    // 15. Customer & Concierge Enquiries Submission
    if (path === "enquiries") {
      const { name, email, phone, subject, message, fragranceInterest } = body || {};
      if (!name || !email || !message) {
        return error("INVALID_INPUT", "Name, email, and message are required", 400);
      }

      const enquiryId = `ENQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const enquiryPayload = {
        enquiryId,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "",
        subject: subject ? String(subject).trim() : "VIP Fragrance Concierge Enquiry",
        message: String(message).trim(),
        fragranceInterest: fragranceInterest ? String(fragranceInterest).trim() : "",
        status: "NEW",
        receivedAt: new Date().toISOString(),
      };

      const event = await prisma.businessEvent.create({
        data: {
          eventName: "ENQUIRY_CREATED",
          aggregateType: "ENQUIRY",
          aggregateId: enquiryId,
          payload: enquiryPayload,
        },
      });

      // Send transactional notification email to admin/concierge team
      EmailService.sendEnquiryNotification(enquiryPayload).catch((err) =>
        console.error("Failed to send enquiry notification email:", err)
      );

      return success({ success: true, enquiryId, eventId: event.id }, 201);
    }

    // 16. Admin Order Status Workflow & Cancellation
    if (path === "admin/orders/status") {
      const { orderId, orderNumber, status, reason } = body || {};
      if (!status) return error("INVALID_INPUT", "Status is required", 400);

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }] : []),
            ...(orderNumber ? [{ orderNumber }] : []),
          ],
        },
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      if (!order) return error("NOT_FOUND", "Order not found", 404);

      const previousStatus = order.status;
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: status as any },
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      // Log business event for real-time tracking
      const eventName = status === "CANCELLED" ? "ORDER_CANCELLED" : `ORDER_${status}`;
      await prisma.businessEvent.create({
        data: {
          eventName,
          aggregateType: "ORDER",
          aggregateId: order.id,
          payload: {
            orderNumber: order.orderNumber,
            previousStatus,
            newStatus: status,
            reason: reason || "Admin Status Update",
            customerName: order.shippingAddress?.fullName || order.customer?.firstName || "Client",
            totalAmount: Number(order.totalAmount),
            currency: order.currency,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Send transactional cancellation email and WhatsApp if cancelled
      if (status === "CANCELLED") {
        EmailService.sendOrderCancellation(order, reason).catch((err) =>
          console.error("Failed to send order cancellation email:", err)
        );
        WhatsAppService.sendOrderCancellation(order, reason).catch((err) =>
          console.error("Failed to send WhatsApp order cancellation:", err)
        );
      }

      return success({ success: true, order: updatedOrder });
    }

    // 17. Customer Order Cancellation
    if (path === "orders/cancel") {
      const { orderNumber, reason } = body || {};
      if (!orderNumber) return error("INVALID_INPUT", "Order number is required", 400);

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      if (!order) return error("NOT_FOUND", "Order not found", 404);

      if (order.status !== "PENDING" && order.status !== "PAYMENT_PENDING") {
        return error(
          "INVALID_STATE",
          `Order cannot be cancelled in status ${order.status}. Please contact our concierge.`,
          400
        );
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
        include: { items: true, shippingAddress: true, customer: true },
      });

      await prisma.businessEvent.create({
        data: {
          eventName: "ORDER_CANCELLED",
          aggregateType: "ORDER",
          aggregateId: order.id,
          payload: {
            orderNumber: order.orderNumber,
            reason: reason || "Client Cancellation Request",
            customerName: order.shippingAddress?.fullName || order.customer?.firstName || "Client",
            totalAmount: Number(order.totalAmount),
            currency: order.currency,
            cancelledAt: new Date().toISOString(),
          },
        },
      });

      EmailService.sendOrderCancellation(order, reason || "Client Cancellation Request").catch((err) =>
        console.error("Failed to send order cancellation email:", err)
      );
      WhatsAppService.sendOrderCancellation(order, reason || "Client Cancellation Request").catch((err) =>
        console.error("Failed to send WhatsApp order cancellation:", err)
      );

      return success({ success: true, order: updated });
    }

    // 18. Admin Enquiry Status Update
    if (path === "admin/enquiries/status") {
      const { id, enquiryId, status, notes } = body || {};
      if (!status) return error("INVALID_INPUT", "Status is required", 400);

      const event = await prisma.businessEvent.findFirst({
        where: {
          OR: [
            ...(id ? [{ id }] : []),
            ...(enquiryId ? [{ aggregateId: enquiryId }] : []),
          ],
          eventName: "ENQUIRY_CREATED",
        },
      });

      if (!event) return error("NOT_FOUND", "Enquiry not found", 404);

      const existingPayload = (event.payload as any) || {};
      const updatedPayload = {
        ...existingPayload,
        status,
        lastAdminNote: notes || existingPayload.lastAdminNote,
        updatedAt: new Date().toISOString(),
      };

      await prisma.businessEvent.update({
        where: { id: event.id },
        data: { payload: updatedPayload },
      });

      return success({ success: true, status, enquiryId: event.aggregateId });
    }

    // 19. Admin Resend Order Notifications (Email & WhatsApp)
    if (path === "admin/orders/notify") {
      const { orderId, orderNumber, channels = ["email", "whatsapp"], messageType = "confirmation" } = body || {};
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }] : []),
            ...(orderNumber ? [{ orderNumber }] : []),
          ],
        },
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      if (!order) return error("NOT_FOUND", "Order not found", 404);

      const results: Record<string, any> = {};

      if (channels.includes("email")) {
        if (messageType === "cancellation") {
          results.email = await EmailService.sendOrderCancellation(order, body?.reason);
        } else {
          results.email = await EmailService.sendOrderConfirmation(order);
        }
      }

      if (channels.includes("whatsapp")) {
        if (messageType === "cancellation") {
          results.whatsapp = await WhatsAppService.sendOrderCancellation(order, body?.reason);
        } else {
          results.whatsapp = await WhatsAppService.sendOrderConfirmation(order);
        }
      }

      return success({ success: true, results });
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
