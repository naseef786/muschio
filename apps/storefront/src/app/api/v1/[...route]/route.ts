import { syncProductVariants } from "@muschio/api";
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
  DeliveryService,
  PaymentService,
  storefrontProduct,
  storefrontOrder,
  prisma,
  CloudinaryService,
  AdminService,
  SearchService,
  SettingsService,
  ReviewsService,
  ReturnsService,
  AuditService,
  TagService,
  InventoryService,
  LoyaltyService,
  PromotionService,
  GiftCardService,
  verifyStorefrontToken,
} from "@muschio/api";
import { EmailService } from "@/lib/email-service";
import { WhatsAppService } from "@/lib/whatsapp-service";

export const dynamic = "force-dynamic";

async function verifyAdminAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return await AdminService.verifyToken(token);
}


function success(data: any, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(
    { success: true, data },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        ...headers,
      },
    }
  );
}

function error(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

function getAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const sessionHeader = req.headers.get("x-storefront-session");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : sessionHeader?.trim() || null;

  let customerId: string | undefined = undefined;
  let guestSessionId: string | undefined = undefined;

  if (token) {
    const verified = verifyStorefrontToken(token);
    if (verified) {
      customerId = verified.customerId;
      guestSessionId = verified.guestSessionId;
    }
  }

  return { customerId, guestSessionId, token };
}

function resolveConcentration(val: any): "EXTRAIT_DE_PARFUM" | "EAU_DE_PARFUM" | "EAU_DE_TOILETTE" | "EAU_DE_COLOGNE" | "PARFUM_OIL" | "ATTAR" | "DISCOVERY_SET" {
  if (!val || typeof val !== "string") return "EXTRAIT_DE_PARFUM";
  const upper = val.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (upper === "PARFUM" || upper === "EXTRAIT" || upper === "EXTRAIT_DE_PARFUM" || upper === "PURE_PARFUM" || upper === "PARFUM_PURE") {
    return "EXTRAIT_DE_PARFUM";
  }
  if (upper === "EDP" || upper === "EAU_DE_PARFUM") {
    return "EAU_DE_PARFUM";
  }
  if (upper === "EDT" || upper === "EAU_DE_TOILETTE") {
    return "EAU_DE_TOILETTE";
  }
  if (upper === "EDC" || upper === "EAU_DE_COLOGNE") {
    return "EAU_DE_COLOGNE";
  }
  if (upper === "OIL" || upper === "PARFUM_OIL" || upper === "PERFUME_OIL") {
    return "PARFUM_OIL";
  }
  if (upper === "ATTAR") {
    return "ATTAR";
  }
  if (upper === "DISCOVERY_SET" || upper === "SET" || upper === "SAMPLE_SET") {
    return "DISCOVERY_SET";
  }
  return "EXTRAIT_DE_PARFUM";
}

function resolveGender(val: any): "UNISEX" | "MEN" | "WOMEN" {
  if (!val || typeof val !== "string") return "UNISEX";
  const upper = val.trim().toUpperCase();
  if (upper === "MEN" || upper === "MALE" || upper === "FOR MEN" || upper === "HOMME") return "MEN";
  if (upper === "WOMEN" || upper === "FEMALE" || upper === "FOR WOMEN" || upper === "FEMME") return "WOMEN";
  return "UNISEX";
}

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const path = route.join("/");
    const url = new URL(req.url);

    // Require administrator authorization for all admin endpoints
    if (route[0] === "admin") {
      const admin = await verifyAdminAuth(req);
      if (!admin) {
        return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      }
    }

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

    // 4. Products (Supports page, limit, and paginate query flags)
    if (path === "products") {
      const search = url.searchParams.get("search") || undefined;
      const brandSlug = url.searchParams.get("brandSlug") || undefined;
      const tag = url.searchParams.get("tag") || url.searchParams.get("tagSlug") || undefined;
      const page = Number(url.searchParams.get("page") || "1");
      const limit = Number(url.searchParams.get("limit") || "100");
      const paginate = url.searchParams.get("paginate") === "true";
      const result = await CatalogService.getProducts({
        search,
        brandSlug,
        tag,
        page,
        limit,
        sort: "featured",
      });
      if (paginate) {
        return success({
          items: result.items.map(storefrontProduct),
          pagination: result.pagination,
        });
      }
      return success(result.items.map(storefrontProduct));
    }
    if (route[0] === "products" && route[1]) {
      const slug = route[1];
      const result = await CatalogService.getProductBySlug(slug);
      if (!result) return error("PRODUCT_NOT_FOUND", "Product not found", 404);
      return success({ product: storefrontProduct(result.product) });
    }

    // 4a. Tags (Public)
    if (path === "tags") {
      const search = url.searchParams.get("search") || undefined;
      const featured = url.searchParams.get("featured");
      const isFeatured = featured === "true" ? true : featured === "false" ? false : undefined;
      const tags = await TagService.getTags({ search, isFeatured });
      return success(tags);
    }
    if (route[0] === "tags" && route[1]) {
      const slugOrId = route[1];
      const tag = await TagService.getTagBySlug(slugOrId);
      if (!tag) return error("TAG_NOT_FOUND", "Tag not found", 404);
      return success(tag);
    }

    // 4a. Public Search (Real-time Full-Text Search across Products, Brands, Accords & Notes)
    if (path === "search") {
      const q = url.searchParams.get("q") || url.searchParams.get("query") || "";
      const limit = Number(url.searchParams.get("limit") || "10");
      const family = url.searchParams.get("family") || undefined;
      const results = await SearchService.searchCatalog(q, {
        limit,
        family,
      });
      return success(results);
    }

    // 4b. Collections (Public)
    if (path === "collections") {
      const isFeaturedParam = url.searchParams.get("featured");
      const where: any = {};
      if (isFeaturedParam === "true") where.isFeatured = true;

      const collections = await prisma.collection.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          products: {
            orderBy: { displayOrder: "asc" },
            include: {
              product: {
                include: {
                  brand: true,
                  variants: { orderBy: { price: "asc" } },
                },
              },
            },
          },
        },
      });

      return success(
        collections.map((c) => ({
          id: c.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          slug: c.slug,
          descriptionEn: c.descriptionEn,
          descriptionAr: c.descriptionAr,
          heroImageUrl: c.heroImageUrl,
          isFeatured: c.isFeatured,
          products: c.products.map((pc) => storefrontProduct(pc.product)),
        }))
      );
    }

    if (route[0] === "collections" && route[1]) {
      const slugOrId = route[1];
      const collection = await prisma.collection.findFirst({
        where: {
          OR: [{ slug: slugOrId }, { id: slugOrId }],
        },
        include: {
          products: {
            orderBy: { displayOrder: "asc" },
            include: {
              product: {
                include: {
                  brand: true,
                  variants: { orderBy: { price: "asc" } },
                },
              },
            },
          },
        },
      });

      if (!collection) return error("COLLECTION_NOT_FOUND", "Collection not found", 404);

      return success({
        id: collection.id,
        nameEn: collection.nameEn,
        nameAr: collection.nameAr,
        slug: collection.slug,
        descriptionEn: collection.descriptionEn,
        descriptionAr: collection.descriptionAr,
        heroImageUrl: collection.heroImageUrl,
        isFeatured: collection.isFeatured,
        products: collection.products.map((pc) => storefrontProduct(pc.product)),
      });
    }

    // 5. Discovery Sets
    if (path === "discovery-sets/samples") {
      const samples = await DiscoverySetService.getAvailableSampleVials();
      return success(samples);
    }

    // 6. Editorial Journal
    if (path === "blog" || path === "journal") {
      const page = Number(url.searchParams.get("page") || "1");
      const limit = Number(url.searchParams.get("limit") || "10");
      const result = await JournalService.getPosts(page, limit);
      return success(result.items);
    }
    if ((route[0] === "blog" || route[0] === "journal") && route[1]) {
      const slug = route[1];
      const post = await JournalService.getPostBySlug(slug);
      if (!post) return error("POST_NOT_FOUND", "Post not found", 404);
      return success(post);
    }

    // 7. Content / Banners / Sections
    if (path === "content/banners" || path === "banners") {
      const slot = url.searchParams.get("slot") as any;
      const banners = await BannerService.getActiveBanners(slot);
      return success(banners);
    }
    if (path === "content/sections" || path === "sections") {
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

    // 11. Orders (Customer Order History)
    if (path === "orders") {
      const { customerId } = getAuth(req);
      if (!customerId) return error("UNAUTHORIZED", "Client session required", 401);

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      const customerEmail = customer?.email?.toLowerCase()?.trim();

      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { customerId },
            ...(customerEmail ? [{ guestEmail: { equals: customerEmail, mode: "insensitive" as const } }] : []),
          ],
        },
        include: {
          items: true,
          payments: true,
          shippingAddress: true,
          fulfillments: {
            include: { shipments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return success(orders.map(storefrontOrder));
    }
    // 11b. Single Order Lookup & Real-Time Tracking
    // Supports:
    //  - /orders/:orderNumber (used by muschioApi.getOrder)
    //  - /orders/lookup/:orderNumber (used by muschioApi.getOrderTracking)
    //  - /orders/live/:orderNumber (used by live polling streams)
    const isSingleOrderLookup =
      (route[0] === "orders" && route[1] && route[1] !== "lookup" && route[1] !== "live") ||
      (route[0] === "orders" && (route[1] === "lookup" || route[1] === "live") && Boolean(route[2]));

    if (isSingleOrderLookup) {
      const orderIdentifier =
        route[1] === "lookup" || route[1] === "live" ? route[2] : route[1];

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: orderIdentifier },
            { id: orderIdentifier },
          ],
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      slug: true,
                      images: true,
                      brand: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
          payments: { include: { events: true }, orderBy: { createdAt: "desc" } },
          shippingAddress: true,
          fulfillments: { include: { shipments: true } },
          customer: true,
        },
      });
      if (!order) return error("ORDER_NOT_FOUND", "Order not found", 404);

      // Verify access authorization (BOLA / IDOR protection)
      const admin = await verifyAdminAuth(req);
      const auth = getAuth(req);
      const url = new URL(req.url);
      const queryEmail = (url.searchParams.get("email") || "").trim().toLowerCase();
      const queryPhone = (url.searchParams.get("phone") || "").replace(/[^0-9]/g, "");

      let isAuthorized = false;
      if (admin) {
        isAuthorized = true;
      } else if (order.customerId && auth.customerId && order.customerId === auth.customerId) {
        isAuthorized = true;
      } else {
        const orderEmail = (order.guestEmail || order.customer?.email || "").trim().toLowerCase();
        const rawPhone = (order.shippingAddress?.phone || order.customer?.phone || "").replace(/[^0-9]/g, "");
        if (queryEmail && orderEmail && queryEmail === orderEmail) {
          isAuthorized = true;
        } else if (queryPhone && rawPhone && (rawPhone.endsWith(queryPhone) || queryPhone.endsWith(rawPhone))) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return error("ORDER_NOT_FOUND", "Order not found", 404);
      }

      // Fetch all real-time business events logged for this order
      const businessEvents = await prisma.businessEvent.findMany({
        where: {
          aggregateType: "ORDER",
          aggregateId: order.id,
        },
        orderBy: { createdAt: "asc" },
      });

      const base = storefrontOrder(order);
      const shipment = order.fulfillments?.[0]?.shipments?.[0];
      const trackingNumber =
        shipment?.trackingNumber ||
        (["SHIPPED", "DELIVERED"].includes(order.status)
          ? `DXB-VIP-${order.orderNumber.replace(/[^0-9]/g, "").slice(-6) || "882104"}`
          : null);

      // Construct clear, simple milestone events
      const events: Array<{
        id: string;
        status: string;
        titleEn: string;
        titleAr: string;
        descriptionEn: string;
        descriptionAr: string;
        timestamp: string;
        completed: boolean;
      }> = [
        {
          id: `evt_created_${order.id}`,
          status: "PENDING",
          titleEn: "Order Placed & Confirmed",
          titleAr: "تم استلام الطلب وتأكيده",
          descriptionEn: `Order #${order.orderNumber} has been received and confirmed.`,
          descriptionAr: `تم استلام طلبك رقم #${order.orderNumber} بنجاح وحجز المنتجات.`,
          timestamp: order.createdAt.toISOString(),
          completed: true,
        },
      ];

      const capturedPayment = order.payments?.find((p) => p.status === "CAPTURED");
      if (capturedPayment || ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(order.status)) {
        events.push({
          id: `evt_paid_${order.id}`,
          status: "PAID",
          titleEn: "Payment Successful",
          titleAr: "تم الدفع بنجاح",
          descriptionEn: `Payment of ${order.currency} ${Number(order.totalAmount).toLocaleString()} was received successfully.`,
          descriptionAr: `تم تأكيد استلام مبلغ ${Number(order.totalAmount).toLocaleString()} ${order.currency} بنجاح.`,
          timestamp: capturedPayment?.createdAt ? capturedPayment.createdAt.toISOString() : order.createdAt.toISOString(),
          completed: true,
        });
      }

      if (["FULFILLING", "SHIPPED", "DELIVERED"].includes(order.status)) {
        events.push({
          id: `evt_fulfilling_${order.id}`,
          status: "FULFILLING",
          titleEn: "Preparing & Packaging",
          titleAr: "جاري تجهيز وتغليف الطلب",
          descriptionEn: "Your perfumes are being carefully checked and packaged.",
          descriptionAr: "نقوم الآن بفحص وتغليف طلبك بكل عناية.",
          timestamp: order.updatedAt.toISOString(),
          completed: true,
        });
      }

      if (["SHIPPED", "DELIVERED"].includes(order.status)) {
        events.push({
          id: `evt_shipped_${order.id}`,
          status: "SHIPPED",
          titleEn: "Shipped & On The Way",
          titleAr: "تم الشحن وهو في الطريق إليك",
          descriptionEn: `Handed over to ${shipment?.carrier ? String(shipment.carrier).replace("_", " ") : "Courier"} (Tracking: ${trackingNumber}).`,
          descriptionAr: `تم تسليم الشحنة لشركة الشحن برقم تتبع: ${trackingNumber}.`,
          timestamp: shipment?.shippedAt ? shipment.shippedAt.toISOString() : order.updatedAt.toISOString(),
          completed: true,
        });
      }

      if (order.status === "DELIVERED") {
        events.push({
          id: `evt_delivered_${order.id}`,
          status: "DELIVERED",
          titleEn: "Delivered",
          titleAr: "تم التوصيل بنجاح",
          descriptionEn: "Your package has been safely delivered to your doorstep.",
          descriptionAr: "تم توصيل الطلب بنجاح إلى باب منزلك.",
          timestamp: shipment?.deliveredAt ? shipment.deliveredAt.toISOString() : order.updatedAt.toISOString(),
          completed: true,
        });
      }

      // Add any additional custom business events
      for (const be of businessEvents) {
        if (!events.some((e) => e.titleEn.toLowerCase().includes(be.eventName.toLowerCase()))) {
          events.push({
            id: be.id,
            status: (be.payload as any)?.newStatus || order.status,
            titleEn: (be.payload as any)?.reason || be.eventName.replace(/_/g, " "),
            titleAr: "تحديث المسار الملكي للشحنة",
            descriptionEn: `Status updated to ${(be.payload as any)?.newStatus || order.status} by Muschio Logistics.`,
            descriptionAr: `تم تحديث مسار الشحنة في النظام.`,
            timestamp: be.createdAt.toISOString(),
            completed: true,
          });
        }
      }

      const maskPhone = (phone: string | null) => {
        if (!phone) return null;
        if (admin) return phone;
        const digits = phone.replace(/[^0-9]/g, "");
        if (digits.length <= 4) return "****";
        return phone.slice(0, 4) + " ••• ••" + digits.slice(-2);
      };

      const maskAddress = (addr: any) => {
        if (!addr) return null;
        if (admin) return addr;
        return {
          ...addr,
          streetAddress: "Private Client Address (Verified)",
          apartment: null,
          phone: maskPhone(addr.phone),
        };
      };

      const safePayments = admin
        ? order.payments
        : order.payments.map((payment) => ({
            provider: payment.provider,
            status: payment.status,
            amount: Number(payment.amount),
            currency: payment.currency,
          }));

      return success({
        ...base,
        payments: safePayments,
        paymentDetails: base.paymentDetails,
        paymentMethod: base.paymentMethod,
        items: order.items.map((item: any) => ({
          id: item.id,
          productNameEn: item.productNameEn,
          productNameAr: item.productNameAr,
          brandName: item.brandName || item.variant?.product?.brand?.name || "Haute Parfumerie",
          sizeLabel: item.sizeLabel || "Standard Flacon",
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice || (item.totalPrice ? Number(item.totalPrice) / (item.quantity || 1) : 0)),
          totalPrice: Number(item.totalPrice),
          image: item.variant?.product?.images?.[0] || "/product-placeholder.svg",
          slug: item.variant?.product?.slug || null,
        })),
        shippingAddress: maskAddress(order.shippingAddress),
        customerName: admin ? (order.shippingAddress?.fullName || order.customer?.firstName || "Client") : "Private Client",
        customerEmail: admin ? (order.guestEmail || order.customer?.email || null) : undefined,
        customerPhone: maskPhone(order.shippingAddress?.phone || order.customer?.phone || null),
        trackingNumber,
        carrier: shipment?.carrier ? String(shipment.carrier).replace("_", " ") : "Muschio GCC Climate Courier",
        estimatedDelivery:
          shipment?.estimatedDelivery ||
          new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      });
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

    // 12b. Voucher & Coupon Verification
    if (path === "vouchers/verify" || path === "coupons/verify") {
      const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
      if (!code) return error("INVALID_INPUT", "Voucher or coupon code required", 400);

      // Check modern Coupon
      const coupon = await prisma.coupon.findUnique({
        where: { code },
        include: { promotion: true },
      });

      if (coupon) {
        const now = new Date();
        if (!coupon.isActive || !coupon.promotion.isActive) {
          return error("INACTIVE", "Coupon is inactive", 400);
        }
        if (coupon.expiresAt && coupon.expiresAt < now) {
          return error("EXPIRED", "Coupon has expired", 400);
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return error("DEPLETED", "Coupon usage limit reached", 400);
        }
        return success({
          code: coupon.code,
          discountAmount: coupon.promotion.type === "FIXED_AMOUNT" ? Number(coupon.promotion.value) : null,
          discountPercent: coupon.promotion.type === "PERCENTAGE" ? Number(coupon.promotion.value) : null,
          minOrderAmount: coupon.promotion.minOrderAmount ? Number(coupon.promotion.minOrderAmount) : null,
          maxDiscountAmount: coupon.promotion.maxDiscountAmount ? Number(coupon.promotion.maxDiscountAmount) : null,
          nameEn: coupon.promotion.nameEn,
          nameAr: coupon.promotion.nameAr,
          isDiscoveryVoucher: false,
        });
      }

      // Check legacy Voucher
      const voucher = await prisma.voucher.findUnique({
        where: { code },
        include: { redemptions: true },
      });

      if (!voucher) return error("NOT_FOUND", "Voucher code not found", 404);
      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        return error("EXPIRED", "Voucher code has expired", 400);
      }
      if (voucher.redemptions && voucher.redemptions.length > 0) {
        return error("ALREADY_USED", "Voucher code has already been redeemed", 400);
      }

      return success({
        code: voucher.code,
        discountAmount: voucher.discountAmount ? Number(voucher.discountAmount) : 0,
        discountPercent: voucher.discountPercent ? Number(voucher.discountPercent) : null,
        isDiscoveryVoucher: voucher.isDiscoveryVoucher,
      });
    }

    // 12c. Gift Card Verification
    if (path === "gift-cards/verify") {
      const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
      if (!code) return error("INVALID_INPUT", "Gift card code required", 400);
      const giftCard = await GiftCardService.getGiftCardByCode(code);
      return success(giftCard);
    }

    // 12d. Public Loyalty Tiers
    if (path === "loyalty/tiers") {
      const tiers = await LoyaltyService.getTiers();
      const config = await LoyaltyService.getProgramConfig();
      return success({ tiers, config });
    }

    // 12e. Customer Loyalty Ledger
    if (path === "loyalty/history") {
      const auth = getAuth(req);
      if (!auth.customerId) return error("UNAUTHORIZED", "Client sign-in required", 401);
      const history = await LoyaltyService.getCustomerLedger(auth.customerId);
      return success(history);
    }

    // 12f. Admin Marketing & Rewards GET Endpoints
    if (path === "admin/promotions/dashboard") {
      const metrics = await PromotionService.getPromotionsDashboardMetrics();
      return success(metrics);
    }

    if (path === "admin/promotions") {
      const promotions = await PromotionService.listPromotions();
      return success(promotions);
    }

    if (path === "admin/coupons") {
      const coupons = await PromotionService.listCoupons();
      return success(coupons);
    }

    if (path === "admin/vouchers") {
      const vouchers = await prisma.voucher.findMany({
        include: {
          redemptions: true,
          _count: { select: { redemptions: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return success(vouchers);
    }

    if (path === "admin/gift-cards") {
      const cards = await GiftCardService.listGiftCards();
      return success(cards);
    }

    if (path === "admin/loyalty/config") {
      const config = await LoyaltyService.getProgramConfig();
      const tiers = await LoyaltyService.getTiers();
      return success({ config, tiers });
    }

    if (path === "admin/loyalty/ledger") {
      const transactions = await prisma.loyaltyTransaction.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { email: true, firstName: true, lastName: true } } },
      });
      return success(transactions);
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
          tags: { include: { tag: true } },
        },
      });
      return success(products);
    }

    // 14a. Admin Tags List & Details
    if (path === "admin/tags") {
      const search = url.searchParams.get("search") || undefined;
      const tags = await TagService.getTags({ search });
      return success(tags);
    }
    if (route[0] === "admin" && route[1] === "tags" && route[2]) {
      const slugOrId = route[2];
      const tag = await TagService.getTagBySlug(slugOrId);
      if (!tag) return error("TAG_NOT_FOUND", "Tag not found", 404);
      return success(tag);
    }

    // 14b. Admin Collections List
    if (path === "admin/collections") {
      const collections = await prisma.collection.findMany({
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          products: {
            orderBy: { displayOrder: "asc" },
            include: {
              product: {
                include: {
                  brand: true,
                  variants: { orderBy: { price: "asc" } },
                },
              },
            },
          },
        },
      });

      return success(
        collections.map((c) => ({
          id: c.id,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          slug: c.slug,
          descriptionEn: c.descriptionEn,
          descriptionAr: c.descriptionAr,
          heroImageUrl: c.heroImageUrl,
          isFeatured: c.isFeatured,
          productCount: c.products.length,
          productIds: c.products.map((p) => p.productId),
          products: c.products.map((p) => ({
            id: p.product.id,
            slug: p.product.slug,
            nameEn: p.product.nameEn,
            nameAr: p.product.nameAr,
            brand: p.product.brand.name,
            price: p.product.variants[0]?.price || 0,
            image: p.product.images[0] || "/product-placeholder.svg",
            concentration: p.product.concentration,
            displayOrder: p.displayOrder,
          })),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
      );
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
          payments: { include: { events: true }, orderBy: { createdAt: "desc" } },
          customer: true,
          fulfillments: { include: { shipments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return success(orders);
    }

    // 15b. Single Admin Order Detailed Inspection
    if (route[0] === "admin" && route[1] === "orders" && route[2] && route[2] !== "live") {
      const orderIdOrNum = route[2];
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderIdOrNum }, { orderNumber: orderIdOrNum }],
        },
        include: {
          items: true,
          shippingAddress: true,
          payments: { include: { events: true }, orderBy: { createdAt: "desc" } },
          customer: true,
          fulfillments: { include: { shipments: true } },
        },
      });

      if (!order) return error("ORDER_NOT_FOUND", "Order not found", 404);

      const events = await prisma.businessEvent.findMany({
        where: {
          aggregateType: "ORDER",
          aggregateId: order.id,
        },
        orderBy: { createdAt: "asc" },
      });

      return success({
        ...order,
        events,
      });
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

    // 18. Admin Notification Providers Status
    if (path === "admin/notifications/status") {
      return success({
        email: EmailService.getStatus(),
        whatsapp: WhatsAppService.getStatus(),
      });
    }

    // 19. Admin Banners List (All slots, active & inactive)
    if (path === "admin/banners") {
      const banners = await BannerService.getAllBanners();
      return success(banners);
    }

    // 20. Admin Homepage Sections List (All sections, ordered by sortOrder)
    if (path === "admin/sections") {
      const sections = await BannerService.getAllSections();
      return success(sections);
    }

    // 21. Store Settings (Public & Admin)
    if (path === "settings" || path === "admin/settings") {
      const settings = await SettingsService.getSettings();
      return success(settings);
    }

    // 22. Public Product Reviews
    if (path === "reviews") {
      const productId = url.searchParams.get("productId");
      if (!productId) return error("MISSING_PRODUCT_ID", "productId is required", 400);
      const reviews = await ReviewsService.getProductReviews(productId);
      return success(reviews);
    }

    // 23. Admin Reviews Moderation
    if (path === "admin/reviews") {
      const reviews = await ReviewsService.getAllReviews();
      return success(reviews);
    }

    // 24. Admin Returns & Reverse Logistics
    if (path === "admin/returns") {
      const returns = await ReturnsService.getReturnRequests();
      return success(returns);
    }

    // 25. Admin Audit Trail
    if (path === "admin/audit-logs") {
      const logs = await AuditService.getLogs(100);
      return success(logs);
    }


    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route GET Error:", err);
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
    const code = err?.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED");
    return error(code, err?.message || "Internal server error", status);
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];
    const path = route.join("/");
    let rawText = "";
    let body: any = {};
    try {
      rawText = await req.text();
      if (rawText && rawText.trim()) {
        body = JSON.parse(rawText);
      }
    } catch {}

    // Require administrator authorization for all admin endpoints (except login)
    if (route[0] === "admin" && path !== "admin/auth/login" && path !== "admin/login") {
      const admin = await verifyAdminAuth(req);
      if (!admin) {
        return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      }
    }

    // 1. Guest Session
    if (path === "sessions/guest") {
      return success({ token: CustomerService.createToken("guest-" + Date.now(), "guest@muschio.client") });
    }

    // 2. Auth: Customer & Admin Login
    if (path === "admin/auth/login" || path === "admin/login") {
      const { email, password } = body || {};
      if (!email || !password) {
        return error("INVALID_INPUT", "Email and password are required", 400);
      }
      const result = await AdminService.login(email, password);
      return success(result);
    }
    if (path === "auth/login") {
      try {
        const result = await CustomerService.login(body);
        return success(result);
      } catch (err: any) {
        return error(err?.code || "AUTH_FAILED", err?.message || "Invalid credentials", err?.statusCode || 401);
      }
    }
    if (path === "auth/register") {
      try {
        const result = await CustomerService.register(body);
        return success(result, 201);
      } catch (err: any) {
        return error(err?.code || "REGISTRATION_FAILED", err?.message || "Registration failed", err?.statusCode || 400);
      }
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
      const quote = DeliveryService.quote({ country, subtotal, currency: "AED" });
      const isFree = subtotal >= 500;

      return success({
        enabled: quote.enabled,
        country,
        currency: quote.currency || "AED",
        shippingFee: isFree ? 0 : 35,
        isFreeShipping: isFree,
        freeShippingThreshold: 500,
        estimatedDaysMin: country === "AE" ? 1 : 2,
        estimatedDaysMax: country === "AE" ? 2 : 4,
        services: quote.services,
      });
    }

    // 5b. Centralized Promotions Quote (Public Storefront & Cart)
    if (path === "promotions/quote") {
      const { items, subtotal, couponCode } = body || {};
      const { customerId } = getAuth(req);
      const quote = await PromotionService.evaluateCartPromotions(
        items || [],
        Number(subtotal || 0),
        customerId || undefined,
        couponCode,
      );
      return success(quote);
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
      const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey : null;
      let ownsIdempotencyKey = false;
      try {
        if (idempotencyKey) {
          const existing = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
          if (existing) {
            const prior = existing.response as { orderId?: string; status?: string };
            if (prior.orderId) {
              const priorOrder = await CheckoutService.getOrderById(prior.orderId);
              if (priorOrder) return success(storefrontOrder(priorOrder), 200);
            }
            return error("CHECKOUT_IN_PROGRESS", "This checkout is already being processed. Please wait for its status to update.", 409);
          }
          await prisma.idempotencyKey.create({
            data: {
              key: idempotencyKey,
              response: { status: "PROCESSING" },
              expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
          });
          ownsIdempotencyKey = true;
        }
        const { customerId, guestSessionId } = getAuth(req);
        const session = guestSessionId || body.guestSessionId || "guest";
        const customer = customerId;
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

        // Dispatch transactional confirmations to customer and admin ONLY for orders that do not require online upfront payment (e.g. CASH_ON_DELIVERY)!
        // For CREDIT_CARD, APPLE_PAY, and GOOGLE_PAY, confirmations are deferred until payment is authorized & captured in /payments/card-charge or /payments/verify-session!
        const paymentMethodUpper = String(body.paymentMethod || "").toUpperCase();
        const isOnlinePrepayment = ["CREDIT_CARD", "APPLE_PAY", "GOOGLE_PAY", "STRIPE"].includes(paymentMethodUpper);

        if (!isOnlinePrepayment) {
          try {
            await Promise.allSettled([
              EmailService.sendOrderConfirmation(orderToLog),
              EmailService.sendAdminOrderAlert(orderToLog),
              WhatsAppService.sendOrderConfirmation(orderToLog),
              WhatsAppService.sendAdminOrderAlert(orderToLog),
            ]);
          } catch (notifyErr) {
            console.error("Order notification dispatch error:", notifyErr);
          }
        }

        if (idempotencyKey) {
          await prisma.idempotencyKey.update({
            where: { key: idempotencyKey },
            data: { response: { orderId: order.id, orderNumber: order.orderNumber } },
          });
        }
        return success(storefrontOrder(orderToLog), 201);
      } catch (err: any) {
        if (idempotencyKey && err?.code === "P2002") {
          const existing = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
          const prior = existing?.response as { orderId?: string } | undefined;
          if (prior?.orderId) {
            const priorOrder = await CheckoutService.getOrderById(prior.orderId);
            if (priorOrder) return success(storefrontOrder(priorOrder), 200);
          }
          return error("CHECKOUT_IN_PROGRESS", "This checkout is already being processed. Please wait for its status to update.", 409);
        }
        if (idempotencyKey && ownsIdempotencyKey) {
          await prisma.idempotencyKey.delete({ where: { key: idempotencyKey } }).catch(() => null);
        }
        return error(
          err?.code || "CHECKOUT_FAILED",
          err?.message || "Checkout failed",
          typeof err?.statusCode === "number" ? err.statusCode : 400
        );
      }
    }

    // 7b. Payment Session Initiation (Stripe Hosted Checkout / Apple Pay / Google Pay)
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
        const session = await (PaymentService as any).initiatePayment({
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
        console.error("Stripe initiation error:", err?.message || err);
        return error("PAYMENT_SESSION_FAILED", err?.message || "Failed to initiate payment session", err?.statusCode || 500);
      }
    }

    // 7c. Payment Session Verification (Return from Stripe Hosted Checkout)
    if (path === "payments/verify-session") {
      const sessionId = body?.sessionId || req.nextUrl.searchParams.get("session_id");
      if (!sessionId) {
        return error("INVALID_INPUT", "sessionId is required", 400);
      }

      try {
        const verifyRes = await (PaymentService as any).verifyPaymentSession(sessionId);
        if (verifyRes.paid && verifyRes.order) {
          const paidOrder = verifyRes.order;

          // Dispatch confirmation email & admin alert if newly paid
          if (verifyRes.isNewlyPaid) {
            try {
              await Promise.allSettled([
                EmailService.sendOrderConfirmation(paidOrder),
                EmailService.sendAdminOrderAlert(paidOrder),
                WhatsAppService.sendOrderConfirmation(paidOrder),
                WhatsAppService.sendAdminOrderAlert(paidOrder),
              ]);
            } catch (notifyErr) {
              console.error("Payment confirmation notification error:", notifyErr);
            }
          }

          return success({
            paid: true,
            status: "PAID",
            order: storefrontOrder(paidOrder),
          });
        }

        return success({
          paid: false,
          status: verifyRes.status || "UNPAID",
        });
      } catch (err: any) {
        console.error("Payment session verification failed:", err);
        return error("PAYMENT_VERIFICATION_FAILED", err?.message || "Verification failed", err?.statusCode || 400);
      }
    }

    // 7d. Stripe Webhook Handler (PCI-DSS & SCA Compliant Settlement)
    if (path === "payments/webhook" || path === "payments/stripe-webhook") {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return error("BAD_REQUEST", "Stripe-Signature header is missing", 400);
      }
      try {
        const rawBody = Buffer.from(rawText || JSON.stringify(body || {}), "utf-8");
        const result = await (PaymentService as any).handleStripeWebhook(rawBody, signature);

        // If webhook settled payment, verify and dispatch emails
        if (result && result.status === "PROCESSED" && body?.data?.object?.metadata?.orderId) {
          const orderId = body.data.object.metadata.orderId;
          const freshOrder = await CheckoutService.getOrderById(orderId).catch(() => null);
          if (freshOrder) {
            await Promise.allSettled([
              EmailService.sendOrderConfirmation(freshOrder),
              EmailService.sendAdminOrderAlert(freshOrder),
              WhatsAppService.sendOrderConfirmation(freshOrder),
              WhatsAppService.sendAdminOrderAlert(freshOrder),
            ]).catch(() => null);
          }
        }

        return success(result);
      } catch (err: any) {
        console.error("Stripe webhook processing error:", err);
        return error("WEBHOOK_ERROR", err?.message || "Webhook processing failed", err?.statusCode || 400);
      }
    }

    // 7c. Direct Card Payment: Disabled in production (Use secure Stripe Checkout)
    if (path === "payments/card-charge") {
      return error(
        "METHOD_NOT_ALLOWED",
        "Direct unverified card charging is disabled. Use secure Stripe Checkout.",
        405,
      );
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
        productId,
        name,
        nameEn,
        nameAr,
        sku,
        price,
        brand: brandName,
        brandId: rawBrandId,
        scentFamily: familyName,
        scentFamilyId: rawFamilyId,
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

      const resolvedName = String(name || nameEn || "").trim();
      const resolvedNameAr = String(nameAr || body.nameArabic || resolvedName).trim();
      const rawVariants = Array.isArray(body?.variants) ? body.variants : [];
      if (Array.isArray(body?.variants) && rawVariants.length === 0) {
        return error("INVALID_VARIANTS", "At least one volume variant is required.", 400);
      }

      if (!resolvedName || (!sku && rawVariants.length === 0)) {
        return error("INVALID_INPUT", "Product name and SKU or variants are required", 400);
      }

      // 1. Resolve or create Brand
      let brand = null;
      const targetBrandId = rawBrandId || body.brandId;
      if (targetBrandId) {
        brand = await prisma.brand.findUnique({ where: { id: String(targetBrandId) } });
      }
      if (!brand) {
        brand = await prisma.brand.findFirst({
          where: { name: { equals: String(brandName || "Haute Niche").trim(), mode: "insensitive" } },
        });
      }
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
      const targetFamilyId = rawFamilyId || body.scentFamilyId;
      if (targetFamilyId) {
        scentFamily = await prisma.scentFamily.findUnique({ where: { id: String(targetFamilyId) } });
      }
      if (!scentFamily && familyName) {
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
      const baseSlug = String(body.slug || resolvedName)
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
        id?: string;
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
      }> = (rawVariants.length > 0)
        ? rawVariants.map((v: any, index: number) => {
            const vVolNum = Number(v.volumeMl) || (typeof v.volume === "number" ? v.volume : parseInt(String(v.volume || "100").replace(/[^0-9]/g, "") || "100", 10)) || 100;
            const vVol = String(v.volume || `${vVolNum}ml`).trim().endsWith("ml") ? String(v.volume || `${vVolNum}ml`).trim() : `${vVolNum}ml`;
            const vBasePrice = Number(String(v.basePrice ?? v.regularPrice ?? v.originalPrice ?? v.price ?? 0).replace(/[^0-9.]/g, "")) || 0;
            const rawSellingPrice = Number(String((v.price !== undefined && v.price !== null ? v.price : (v.discountPrice ?? vBasePrice))).replace(/[^0-9.]/g, "")) || vBasePrice;
            const vSellingPrice = (rawSellingPrice > 0 && rawSellingPrice <= vBasePrice) ? rawSellingPrice : (vBasePrice || rawSellingPrice);
            const vCompareAt = (vBasePrice > vSellingPrice) ? vBasePrice : null;
            const vDiscPrice = (vSellingPrice < vBasePrice) ? vSellingPrice : null;
            const vStock = Number(v.stockQuantity ?? v.stock) >= 0 ? Number(v.stockQuantity ?? v.stock) : 10;
            const vWarehouse = String(v.warehouse || body.warehouse || "DXB-MAIN").trim();
            const vSku = String(v.sku || `${sku || baseSlug}-${vVolNum}`).trim();
            const vIsDefault = Boolean(v.isDefault ?? index === 0);
            return {
              id: v.id ? String(v.id) : undefined,
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
              sku: String(sku || `${baseSlug}-${numVolume}`).trim(),
              stockQuantity: numStock,
              warehouse: String(body?.warehouse || "DXB-MAIN").trim(),
              isDefault: true,
            },
          ];

      // Check if product already exists to update
      let targetProduct = null;
      const targetId = existingId || productId;
      if (targetId) {
        targetProduct = await prisma.product.findUnique({ where: { id: String(targetId) } });
      }
      if (!targetProduct && body.slug) {
        targetProduct = await prisma.product.findUnique({ where: { slug: String(body.slug).trim() } });
      }
      if (!targetProduct && baseSlug) {
        targetProduct = await prisma.product.findUnique({ where: { slug: baseSlug } });
      }
      if (!targetProduct && sku) {
        targetProduct = await prisma.product.findFirst({
          where: { variants: { some: { sku: String(sku).trim() } } },
        });
      }
      // Check variant SKUs for update detection
      if (!targetProduct && incomingVariants.length > 0) {
        for (const iv of incomingVariants) {
          if (iv.sku) {
            const matchVar = await prisma.productVariant.findUnique({
              where: { sku: iv.sku },
              include: { product: true },
            });
            if (matchVar?.product) {
              targetProduct = matchVar.product;
              break;
            }
          }
        }
      }

      let savedProduct;

      if (targetProduct) {
        savedProduct = await prisma.$transaction(async (tx) => {
          await syncProductVariants(tx, targetProduct.id, incomingVariants, Array.isArray(body.variants), numTesterStock);
          await tx.productPerfumer.deleteMany({ where: { productId: targetProduct.id } });
          return tx.product.update({
            where: { id: targetProduct.id },
            data: {
              nameEn: resolvedName,
              nameAr: resolvedNameAr,
              descriptionEn: String(descriptionEn || resolvedName).trim(),
              descriptionAr: String(descriptionAr || resolvedNameAr || resolvedName).trim(),
              brandId: brand.id,
              scentFamilyId: scentFamily?.id,
              concentration: resolveConcentration(concentration),
              gender: resolveGender(gender),
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
        }, { timeout: 15000 });
      } else {
        // Create new product
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        }

        const safeVariantsData = [];
        for (const iv of incomingVariants) {
          const conflicting = await prisma.productVariant.findUnique({ where: { sku: iv.sku } });
          if (conflicting) return error("SKU_CONFLICT", "This SKU is already in use. Choose a unique SKU for each variant.", 409);
          safeVariantsData.push({
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
          });
        }

        savedProduct = await prisma.product.create({
          data: {
            slug,
            nameEn: resolvedName,
            nameAr: resolvedNameAr,
            descriptionEn: String(descriptionEn || resolvedName).trim(),
            descriptionAr: String(descriptionAr || resolvedNameAr || resolvedName).trim(),
            brandId: brand.id,
            scentFamilyId: scentFamily?.id,
            concentration: resolveConcentration(concentration),
            gender: resolveGender(gender),
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
              create: safeVariantsData,
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

      if (body?.tagIds !== undefined || body?.tags !== undefined) {
        const rawTags = body.tagIds !== undefined ? body.tagIds : body.tags;
        const tagList = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
        await TagService.setProductTags(savedProduct.id, tagList);
      }

      const refreshedProduct = await prisma.product.findUnique({
        where: { id: savedProduct.id },
        include: {
          brand: true,
          scentFamily: true,
          perfumers: { include: { perfumer: true } },
          variants: { include: { inventory: true } },
          tags: { include: { tag: true } },
        },
      });

      return success(refreshedProduct || savedProduct, targetProduct ? 200 : 201);
    }

    // 12b. Admin Create or Update Tag
    if (path === "admin/tags") {
      const { nameEn, nameAr, slug, description, colorHex, isFeatured } = body || {};
      if (!nameEn) return error("INVALID_INPUT", "Tag English name (nameEn) is required", 400);
      const tag = await TagService.createTag({
        nameEn,
        nameAr: nameAr || nameEn,
        slug,
        description,
        colorHex,
        isFeatured: Boolean(isFeatured),
      });
      return success(tag, 201);
    }
    if (route[0] === "admin" && route[1] === "tags" && route[2]) {
      const tagId = route[2];
      const { nameEn, nameAr, slug, description, colorHex, isFeatured } = body || {};
      const tag = await TagService.updateTag(tagId, {
        nameEn,
        nameAr,
        slug,
        description,
        colorHex,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      });
      return success(tag);
    }

    // 13. Admin Create or Update Brand
    if (path === "admin/brands" || (route[0] === "admin" && route[1] === "brands")) {
      const { id, name, storyEn, storyAr, countryEn, countryAr, logoUrl, heroImageUrl, type, slug: customSlug } = body || {};
      if (!name) return error("INVALID_INPUT", "Brand name is required", 400);

      const brandId = id || (route[2] ? route[2] : null);
      if (brandId) {
        const existing = await prisma.brand.findFirst({
          where: { OR: [{ id: brandId }, { slug: customSlug || "" }] },
        });
        if (existing) {
          const updated = await prisma.brand.update({
            where: { id: existing.id },
            data: {
              name: String(name).trim(),
              slug: customSlug || existing.slug,
              type: type === "DESIGNER" ? "DESIGNER" : "NICHE",
              descriptionEn: storyEn !== undefined ? storyEn : existing.descriptionEn,
              descriptionAr: storyAr !== undefined ? storyAr : existing.descriptionAr,
              countryOfOrigin: countryEn || countryAr || existing.countryOfOrigin,
              logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
              heroImageUrl: heroImageUrl !== undefined ? heroImageUrl : existing.heroImageUrl,
            },
          });
          return success(updated);
        }
      }

      const baseSlug = (customSlug || String(name))
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
          countryOfOrigin: countryEn || countryAr || "France",
          logoUrl,
          heroImageUrl,
        },
      });
      return success(brand, 201);
    }

    // 14. Admin Create or Update Note
    if (path === "admin/notes" || (route[0] === "admin" && route[1] === "notes")) {
      const { id, name, nameAr, categoryEn, categoryAr, descriptionEn, descriptionAr, heroImageUrl, slug } = body || {};
      if (!name) return error("INVALID_INPUT", "Note name is required", 400);

      const noteId = id || (route[2] ? route[2] : null);
      if (noteId) {
        const existing = await prisma.note.findFirst({
          where: { OR: [{ id: noteId }, { slugEn: slug || "" }] },
        });
        if (existing) {
          const updated = await prisma.note.update({
            where: { id: existing.id },
            data: {
              nameEn: String(name).trim(),
              nameAr: String(nameAr || name).trim(),
              categoryEn: categoryEn !== undefined ? categoryEn : existing.categoryEn,
              categoryAr: categoryAr !== undefined ? categoryAr : existing.categoryAr,
              descriptionEn: descriptionEn !== undefined ? descriptionEn : existing.descriptionEn,
              descriptionAr: descriptionAr !== undefined ? descriptionAr : existing.descriptionAr,
              heroImageUrl: heroImageUrl !== undefined ? heroImageUrl : existing.heroImageUrl,
            },
          });
          return success(updated);
        }
      }

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
          heroImageUrl: heroImageUrl || null,
        },
      });
      return success(note, 201);
    }

    // 14c. Admin Create / Update Collection
    if (
      path === "admin/collections" ||
      (route[0] === "admin" && route[1] === "collections" && route[2] && route[3] !== "toggle")
    ) {
      const targetId = route[2] || body?.id;
      const {
        nameEn,
        nameAr,
        slug: customSlug,
        descriptionEn,
        descriptionAr,
        heroImageUrl,
        isFeatured = false,
        productIds = [],
      } = body || {};

      if (!nameEn) return error("INVALID_INPUT", "Collection name (English) is required", 400);

      const baseSlug = (customSlug || nameEn)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let slug = baseSlug || `collection-${Date.now().toString().slice(-4)}`;

      // Check if targetId exists in DB (by ID or Slug)
      let existingRecord = null;
      if (targetId) {
        existingRecord = await prisma.collection.findFirst({
          where: {
            OR: [{ id: targetId }, { slug: targetId }],
          },
        });
      }

      // Ensure slug uniqueness
      const slugCollision = await prisma.collection.findFirst({
        where: {
          slug,
          ...(existingRecord ? { id: { not: existingRecord.id } } : {}),
        },
      });
      if (slugCollision) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      let collection;

      if (existingRecord) {
        collection = await prisma.collection.update({
          where: { id: existingRecord.id },
          data: {
            nameEn: String(nameEn).trim(),
            nameAr: String(nameAr || nameEn).trim(),
            slug,
            descriptionEn: descriptionEn || null,
            descriptionAr: descriptionAr || null,
            heroImageUrl: heroImageUrl || null,
            isFeatured: Boolean(isFeatured),
          },
        });

        // Re-sync product collection relations
        await prisma.productCollection.deleteMany({
          where: { collectionId: existingRecord.id },
        });
      } else {
        collection = await prisma.collection.create({
          data: {
            nameEn: String(nameEn).trim(),
            nameAr: String(nameAr || nameEn).trim(),
            slug,
            descriptionEn: descriptionEn || null,
            descriptionAr: descriptionAr || null,
            heroImageUrl: heroImageUrl || null,
            isFeatured: Boolean(isFeatured),
          },
        });
      }

      // Add products in admin's explicit preferred order
      if (Array.isArray(productIds) && productIds.length > 0) {
        for (let i = 0; i < productIds.length; i++) {
          const rawId = String(productIds[i] || "").trim();
          if (!rawId) continue;
          try {
            const prod = await prisma.product.findFirst({
              where: {
                OR: [{ id: rawId }, { slug: rawId }],
              },
              select: { id: true },
            });
            if (prod) {
              await prisma.productCollection.upsert({
                where: {
                  productId_collectionId: {
                    productId: prod.id,
                    collectionId: collection.id,
                  },
                },
                update: {
                  displayOrder: i,
                },
                create: {
                  collectionId: collection.id,
                  productId: prod.id,
                  displayOrder: i,
                },
              });
            }
          } catch {
            // Ignore potential duplicates
          }
        }
      }

      // Fetch the full updated collection with products
      const fullCollection = await prisma.collection.findUnique({
        where: { id: collection.id },
        include: {
          products: {
            orderBy: { displayOrder: "asc" },
            include: {
              product: {
                include: {
                  brand: true,
                  variants: { orderBy: { price: "asc" } },
                },
              },
            },
          },
        },
      });

      return success(
        {
          id: fullCollection!.id,
          nameEn: fullCollection!.nameEn,
          nameAr: fullCollection!.nameAr,
          slug: fullCollection!.slug,
          descriptionEn: fullCollection!.descriptionEn,
          descriptionAr: fullCollection!.descriptionAr,
          heroImageUrl: fullCollection!.heroImageUrl,
          isFeatured: fullCollection!.isFeatured,
          productCount: fullCollection!.products.length,
          productIds: fullCollection!.products.map((p) => p.productId),
          products: fullCollection!.products.map((p) => ({
            id: p.product.id,
            slug: p.product.slug,
            nameEn: p.product.nameEn,
            nameAr: p.product.nameAr,
            brand: p.product.brand?.name || "",
            price: p.product.variants[0]?.price || 0,
            image: p.product.images?.[0] || "/product-placeholder.svg",
            images: p.product.images || [],
            isFeatured: p.product.isFeatured,
          })),
          createdAt: fullCollection!.createdAt,
          updatedAt: fullCollection!.updatedAt,
        },
        existingRecord ? 200 : 201
      );
    }

    // 14d. Admin Toggle Collection Featured Status
    if (route[0] === "admin" && route[1] === "collections" && route[2] && route[3] === "toggle") {
      const collectionIdOrSlug = route[2];
      const existing = await prisma.collection.findFirst({
        where: {
          OR: [{ id: collectionIdOrSlug }, { slug: collectionIdOrSlug }],
        },
      });
      if (!existing) return error("NOT_FOUND", "Collection not found", 404);

      const updated = await prisma.collection.update({
        where: { id: existing.id },
        data: { isFeatured: !existing.isFeatured },
      });
      return success({ id: updated.id, isFeatured: updated.isFeatured });
    }

    // 15. Customer & Concierge Enquiries / Contact Message Submission (With Bot & Spam Defense)
    if (path === "enquiries" || path === "contact") {
      const { name, email, phone, subject, message, fragranceInterest, _honeypot, honeypot, website, _timeElapsed } = body || {};

      // Bot Protection 1: Honeypot trap check (bots automatically fill hidden fields)
      if (_honeypot || honeypot || website) {
        console.warn("[Bot Protection] Honeypot triggered, discarding bot submission silently.");
        return success({ success: true, enquiryId: `ENQ-${Date.now().toString(36).toUpperCase()}` }, 200);
      }

      // Bot Protection 2: Speed check (humans cannot submit in under 2 seconds)
      if (typeof _timeElapsed === "number" && _timeElapsed < 2000) {
        console.warn("[Bot Protection] Speed trap triggered (< 2000ms).");
        return error("BOT_DETECTED", "Submission submitted too rapidly. Please retry.", 400);
      }

      if (!name || !email || !message) {
        return error("INVALID_INPUT", "Name, email, and message are required", 400);
      }

      const cleanMessage = String(message).trim();

      // Spam Protection 1: Excessive hyperlinks count
      const urlMatches = (cleanMessage.match(/https?:\/\//gi) || []).length;
      if (urlMatches > 2) {
        return error("SPAM_DETECTED", "Messages cannot contain excessive hyperlinks.", 400);
      }

      // Spam Protection 2: Automated spam word heuristic
      const spamKeywords = ["casino", "crypto investment", "forex signals", "viagra", "cialis", "buy backlinks", "telegram channel", "whatsapp blasting"];
      const lowerMsg = cleanMessage.toLowerCase();
      if (spamKeywords.some((word) => lowerMsg.includes(word))) {
        console.warn("[Spam Protection] Message matched spam keyword heuristic.");
        return error("SPAM_DETECTED", "Message flagged by automated spam filter.", 400);
      }

      const enquiryId = `ENQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const enquiryPayload = {
        enquiryId,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : "",
        subject: subject ? String(subject).trim() : "VIP Fragrance Concierge Enquiry",
        message: cleanMessage,
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
      const { orderId, orderNumber, status: rawStatus, reason, trackingNumber, carrier } = body || {};
      if (!rawStatus) return error("INVALID_INPUT", "Status is required", 400);
      let status = String(rawStatus).toUpperCase().trim();
      const requestedCancellation = status === "CANCELLED";

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ id: orderId }] : []),
            ...(orderNumber ? [{ orderNumber }] : []),
          ],
        },
        include: {
          items: true,
          shippingAddress: true,
          customer: true,
          payments: { orderBy: { createdAt: "desc" } },
          fulfillments: { include: { shipments: true } },
        },
      });

      if (!order) return error("NOT_FOUND", "Order not found", 404);

      const previousStatus = order.status;

      // When transitioning to PAID, FULFILLING, SHIPPED, or DELIVERED, guarantee a captured payment record exists
      if (["PAID", "FULFILLING", "SHIPPED", "DELIVERED"].includes(status)) {
        const hasCaptured = order.payments.some((p) => p.status === "CAPTURED");
        if (!hasCaptured) {
          return error(
            "PAYMENT_REQUIRED",
            "This order cannot advance until the payment provider confirms capture.",
            409,
          );
        }
        await InventoryService.commitOrderInventory(order.id).catch(() => null);
      }

      // When cancelling, release reserved stock and update payment record
      if (requestedCancellation) {
        const primaryPayment = order.payments[0];
        if (primaryPayment?.status === "CAPTURED") {
          if (primaryPayment.provider !== "CREDIT_CARD") {
            return error("REFUND_UNAVAILABLE", "This captured payment requires provider reconciliation before cancellation.", 409);
          }
          await PaymentService.refundOrder(order.id, reason || "Admin cancellation");
          status = "REFUNDED";
        }
        await InventoryService.releaseOrderReservations(order.id).catch(() => null);
        if (primaryPayment?.status !== "CAPTURED") {
          await LoyaltyService.refundOrderRedemption(order.id).catch(() => null);
        }
        if (primaryPayment && primaryPayment.status !== "CAPTURED") {
          await prisma.payment.update({
            where: { id: primaryPayment.id },
            data: { status: "CANCELLED" },
          });
        }
      }

      // When transitioning to SHIPPED, ensure fulfillment and shipment tracking exist
      if (status === "SHIPPED") {
        let fulfillmentId = order.fulfillments[0]?.id;
        let hasShipments = (order.fulfillments[0]?.shipments?.length ?? 0) > 0;
        if (!fulfillmentId) {
          const warehouse = await prisma.warehouse.findFirst();
          if (warehouse) {
            const newFulfillment = await prisma.fulfillment.create({
              data: {
                orderId: order.id,
                warehouseId: warehouse.id,
                fulfillmentNumber: `FUL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                status: "DISPATCHED",
              },
            });
            fulfillmentId = newFulfillment.id;
            hasShipments = false;
          }
        }
        if (!hasShipments && fulfillmentId) {
          const generatedTracking =
            trackingNumber ||
            `DXB-VIP-${order.orderNumber.replace(/[^0-9]/g, "").slice(-6) || "904128"}`;
          await prisma.shipment.create({
            data: {
              fulfillmentId,
              carrier: (carrier as any) || "DHL_EXPRESS",
              trackingNumber: generatedTracking,
              status: "IN_TRANSIT",
              shippedAt: new Date(),
              estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: status as any },
        include: {
          items: true,
          shippingAddress: true,
          customer: true,
          payments: { orderBy: { createdAt: "desc" } },
          fulfillments: { include: { shipments: true } },
        },
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
            reason: reason || "Admin Status Workflow Update",
            customerName: order.shippingAddress?.fullName || order.customer?.firstName || "Client",
            totalAmount: Number(order.totalAmount),
            currency: order.currency,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Customer transactional alerts
      const customerPhone = order.shippingAddress?.phone || order.customer?.phone;
      if (requestedCancellation) {
        EmailService.sendOrderCancellation(order, reason).catch((err) =>
          console.error("Failed to send order cancellation email:", err)
        );
        WhatsAppService.sendOrderCancellation(order, reason).catch((err) =>
          console.error("Failed to send WhatsApp order cancellation:", err)
        );
      } else if (status === "SHIPPED" && customerPhone) {
        WhatsAppService.sendWhatsAppMessage({
          to: customerPhone,
          body: `Your Muschio creation (#${order.orderNumber}) is now in climate-controlled transit across the GCC! Track progression: https://www.muschio.ae/track?ref=${encodeURIComponent(order.orderNumber)}`,
        }).catch((e) => console.warn("WhatsApp dispatch error:", e));
      } else if (status === "DELIVERED" && customerPhone) {
        WhatsAppService.sendWhatsAppMessage({
          to: customerPhone,
          body: `Your Muschio acquisition (#${order.orderNumber}) has been delivered with white-glove service. We hope you cherish this olfactory masterpiece!`,
        }).catch((e) => console.warn("WhatsApp delivery error:", e));
      }

      if (status === "DELIVERED") {
        await LoyaltyService.awardOrderPoints(updatedOrder.id).catch((err) =>
          console.error("Failed to award delivery loyalty points:", err),
        );
      }

      return success({ success: true, order: updatedOrder });
    }

    // 17. Customer Order Cancellation
    if (path === "orders/cancel") {
      const { orderNumber, reason, email, phone } = body || {};
      if (!orderNumber) return error("INVALID_INPUT", "Order number is required", 400);

      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      if (!order) return error("NOT_FOUND", "Order not found", 404);

      const auth = getAuth(req);
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedPhone = String(phone || "").replace(/[^0-9]/g, "");
      const orderEmail = String(order.guestEmail || order.customer?.email || "").trim().toLowerCase();
      const orderPhone = String(order.shippingAddress?.phone || order.customer?.phone || "").replace(/[^0-9]/g, "");
      const ownsOrder = Boolean(
        auth.customerId && order.customerId === auth.customerId,
      ) || Boolean(
        !order.customerId &&
        ((normalizedEmail && normalizedEmail === orderEmail) ||
          (normalizedPhone && (orderPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(orderPhone)))),
      );
      if (!ownsOrder) return error("NOT_FOUND", "Order not found", 404);

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
        include: { items: true, shippingAddress: true, customer: true, payments: true },
      });

      // Release inventory hold
      await InventoryService.releaseOrderReservations(order.id).catch(() => null);
      await LoyaltyService.refundOrderRedemption(order.id).catch(() => null);

      // Cancel payment if pending
      if (order.payments && order.payments[0]) {
        await prisma.payment.update({
          where: { id: order.payments[0].id },
          data: { status: "CANCELLED" },
        }).catch(() => null);
      }

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

    // 20. Admin Notification Diagnostics Test Send
    if (path === "admin/notifications/test") {
      const { channel, recipient } = body || {};
      if (!channel || !recipient) {
        return error("INVALID_INPUT", "channel (email or whatsapp) and recipient are required", 400);
      }

      if (channel === "email") {
        const testRes = await EmailService.sendEmail({
          to: recipient,
          subject: "🧪 Muschio Haute Parfumerie — Email Delivery Test",
          html: `
            <div style="font-family: sans-serif; padding: 25px; border: 1px solid #000; max-width: 500px;">
              <h2 style="margin-top: 0;">⚜️ Muschio Email Delivery Test</h2>
              <p>Congratulations! Your transactional email service is active and communicating with Muschio production.</p>
              <p style="font-size: 12px; color: #666;">Timestamp: ${new Date().toISOString()}</p>
            </div>
          `,
        });
        return success({ success: testRes.success, details: testRes });
      }

      if (channel === "whatsapp") {
        const testRes = await WhatsAppService.sendWhatsAppMessage({
          to: recipient,
          body: `⚜️ *MUSCHIO HAUTE PARFUMERIE · DUBAI*\n\nThis is a verified test notification confirming your WhatsApp Business gateway is connected.\n\nTime: ${new Date().toLocaleTimeString()}`,
          previewUrl: false,
        });
        return success({ success: testRes.success, details: testRes });
      }

      return error("INVALID_CHANNEL", "Supported channels: email, whatsapp", 400);
    }

    // 21. Admin Banners Create / Update
    if (path === "admin/banners") {
      const banner = await BannerService.createBanner(body);
      return success(banner, 201);
    }
    if (route[0] === "admin" && route[1] === "banners" && route[2]) {
      const bannerId = route[2];
      if (route[3] === "toggle") {
        const toggled = await BannerService.toggleBanner(bannerId);
        return success(toggled);
      }
      const updated = await BannerService.updateBanner(bannerId, body);
      return success(updated);
    }

    // 22. Admin Homepage Sections Reorder & Upsert
    if (path === "admin/sections/reorder") {
      const ordering = body?.ordering || body?.sections || (Array.isArray(body) ? body : []);
      const reordered = await BannerService.reorderSections(ordering);
      return success(reordered);
    }
    if (route[0] === "admin" && route[1] === "sections" && route[2]) {
      const sectionType = route[2] as any;
      if (route[3] === "toggle") {
        const toggled = await BannerService.toggleSection(sectionType);
        return success(toggled);
      }
      const upserted = await BannerService.upsertSection({ sectionType, ...body });
      return success(upserted);
    }

    // 5b. Admin Update Tag (PATCH)
    if (route[0] === "admin" && route[1] === "tags" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const tagId = route[2];
      const { nameEn, nameAr, slug, description, colorHex, isFeatured } = body || {};
      const updated = await TagService.updateTag(tagId, {
        nameEn,
        nameAr,
        slug,
        description,
        colorHex,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      });
      return success(updated);
    }

    // Admin Review Status Moderation (PATCH)
    if (route[0] === "admin" && route[1] === "reviews" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const reviewId = route[2];
      const status = body.status;
      if (!status) return error("INVALID_INPUT", "status is required", 400);
      const updated = await ReviewsService.updateReviewStatus(reviewId, status, admin.id);
      return success(updated);
    }

    // Admin Return Inspection & Restock (PATCH)
    if (route[0] === "admin" && route[1] === "returns" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const returnRequestId = route[2];
      const updated = await ReturnsService.inspectReturnRequest({
        returnRequestId,
        disposition: body.disposition || "RESTOCK_SELLABLE",
        condition: body.condition,
        adminUserId: admin.id,
        notes: body.notes,
      });
      return success(updated);
    }
    if (path === "admin/settings") {
      const admin = await verifyAdminAuth(req);
      const updated = await SettingsService.updateSettings(body, admin?.id);
      return success(updated);
    }

    // 23b. Admin Promotions & Marketing Controls
    if (path === "admin/promotions") {
      const admin = await verifyAdminAuth(req);
      const created = await PromotionService.createPromotion(body, admin?.id);
      return success(created, 201);
    }

    if (route[0] === "admin" && route[1] === "promotions" && route[2]) {
      const admin = await verifyAdminAuth(req);
      const updated = await PromotionService.updatePromotion(route[2], body, admin?.id);
      return success(updated);
    }

    if (path === "admin/coupons") {
      const admin = await verifyAdminAuth(req);
      const created = await PromotionService.createCoupon(body, admin?.id);
      return success(created, 201);
    }

    if (path === "admin/vouchers") {
      const { code, discountAmount, discountPercent, isDiscoveryVoucher, expiresDays } = body || {};
      const { randomUUID } = await import("node:crypto");
      const voucherCode = (code || `MSC-VCH-${randomUUID().slice(0, 8)}`).trim().toUpperCase();
      const expiresAt = expiresDays ? new Date(Date.now() + Number(expiresDays) * 24 * 60 * 60 * 1000) : null;
      const voucher = await prisma.voucher.create({
        data: {
          code: voucherCode,
          discountAmount: discountAmount ? Number(discountAmount) : null,
          discountPercent: discountPercent ? Number(discountPercent) : null,
          isDiscoveryVoucher: Boolean(isDiscoveryVoucher),
          expiresAt,
        },
      });
      return success(voucher, 201);
    }

    if (path === "admin/gift-cards") {
      const admin = await verifyAdminAuth(req);
      const created = await GiftCardService.createGiftCard(body, admin?.id);
      return success(created, 201);
    }

    if (path === "admin/loyalty/adjust") {
      const admin = await verifyAdminAuth(req);
      const { customerId, pointsDelta, reason } = body || {};
      if (!customerId || pointsDelta === undefined || !reason) {
        return error("INVALID_INPUT", "customerId, pointsDelta, and mandatory reason required", 400);
      }
      const adjusted = await LoyaltyService.manualAdjustment(customerId, Number(pointsDelta), reason, admin?.id || "admin");
      return success(adjusted);
    }

    if (path === "admin/loyalty/config") {
      const admin = await verifyAdminAuth(req);
      const updated = await LoyaltyService.updateProgramConfig(body, admin?.id);
      return success(updated);
    }

    // 24. Public Customer Review Submission
    if (path === "reviews") {
      const auth = getAuth(req);
      let customerId = auth.customerId;
      if (!customerId) {
        if (body.email) {
          let cust = await prisma.customer.findUnique({ where: { email: body.email } });
          if (!cust) {
            cust = await prisma.customer.create({
              data: {
                email: body.email,
                firstName: body.name || body.firstName || "Client",
                lastName: body.lastName || "",
              },
            });
          }
          customerId = cust.id;
        } else {
          const defaultCust = await prisma.customer.findFirst();
          customerId = defaultCust?.id || "guest";
        }
      }

      if (!body.productId) return error("MISSING_PRODUCT_ID", "productId is required", 400);

      const review = await ReviewsService.submitReview({
        customerId,
        productId: body.productId,
        orderItemId: body.orderItemId,
        rating: Number(body.rating) || 5,
        title: body.title,
        body: body.body || body.comment || "",
        longevityRating: body.longevityRating ? Number(body.longevityRating) : undefined,
        sillageRating: body.sillageRating ? Number(body.sillageRating) : undefined,
        imageUrls: body.imageUrls,
      });
      return success(review, 201);
    }

    // 25. Admin Review Status Moderation
    if (path === "admin/reviews/status") {
      const admin = await verifyAdminAuth(req);
      const reviewId = body.reviewId || body.id;
      const status = body.status;
      if (!reviewId || !status) return error("INVALID_INPUT", "reviewId and status are required", 400);
      const updated = await ReviewsService.updateReviewStatus(reviewId, status, admin?.id);
      return success(updated);
    }

    // 26. Customer Return Request (7-Day Guarantee)
    if (path === "returns") {
      const auth = getAuth(req);
      let customerId = auth.customerId || body.customerId;
      if (!customerId) {
        const order = await prisma.order.findUnique({ where: { id: body.orderId } });
        customerId = order?.customerId || (await prisma.customer.findFirst())?.id || "guest";
      }
      if (!body.orderId) return error("MISSING_ORDER_ID", "orderId is required", 400);

      const returnReq = await ReturnsService.requestReturn({
        orderId: body.orderId,
        customerId,
        reason: body.reason || "Customer requested return within 7-day guarantee window",
        requestedAction: body.requestedAction || "REFUND",
        items: body.items || [],
      });
      return success(returnReq, 201);
    }

    // 27. Admin Return Inspection & Restock
    if (path === "admin/returns/inspect") {
      const admin = await verifyAdminAuth(req);
      const returnRequestId = body.returnRequestId || body.id;
      const disposition = body.disposition || "RESTOCK_SELLABLE";
      const condition = body.condition;
      if (!returnRequestId) return error("INVALID_INPUT", "returnRequestId is required", 400);
      const updated = await ReturnsService.inspectReturnRequest({
        returnRequestId,
        disposition,
        condition,
        adminUserId: admin?.id,
        notes: body.notes,
      });
      return success(updated);
    }

    // 28. Admin Audit Log Record
    if (path === "admin/audit-logs") {
      const admin = await verifyAdminAuth(req);
      const logged = await AuditService.log({
        adminUserId: admin?.id,
        action: body.action || "ADMIN_ACTION",
        resourceType: body.resourceType || "SYSTEM",
        resourceId: body.resourceId || "general",
        diff: body.diff || body.res,
      });
      return success(logged);
    }


    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route POST Error:", err);
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
    const code = err?.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED");
    return error(code, err?.message || "Internal server error", status);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { route: string[] } }) {
  // Delegate PUT requests directly to POST handler
  return POST(req, { params });
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

    // 4. Admin Toggle / Update Banner
    if (route[0] === "admin" && route[1] === "banners" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const bannerId = route[2];
      if (route[3] === "toggle") {
        const toggled = await BannerService.toggleBanner(bannerId);
        return success(toggled);
      }
      const updated = await BannerService.updateBanner(bannerId, body);
      return success(updated);
    }

    // 5. Admin Toggle / Update Section
    if (route[0] === "admin" && route[1] === "sections" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const sectionType = route[2] as any;
      if (route[3] === "toggle") {
        const toggled = await BannerService.toggleSection(sectionType);
        return success(toggled);
      }
      const upserted = await BannerService.upsertSection({ sectionType, ...body });
      return success(upserted);
    }

    // 5b. Admin Update Tag (PATCH)
    if (route[0] === "admin" && route[1] === "tags" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const tagId = route[2];
      const { nameEn, nameAr, slug, description, colorHex, isFeatured } = body || {};
      const updated = await TagService.updateTag(tagId, {
        nameEn,
        nameAr,
        slug,
        description,
        colorHex,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      });
      return success(updated);
    }

    // Admin Review Status Moderation (PATCH)
    if (route[0] === "admin" && route[1] === "reviews" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const reviewId = route[2];
      const status = body.status;
      if (!status) return error("INVALID_INPUT", "status is required", 400);
      const updated = await ReviewsService.updateReviewStatus(reviewId, status, admin.id);
      return success(updated);
    }

    // Admin Return Inspection & Restock (PATCH)
    if (route[0] === "admin" && route[1] === "returns" && route[2]) {
      const admin = await verifyAdminAuth(req);
      if (!admin) return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      const returnRequestId = route[2];
      const updated = await ReturnsService.inspectReturnRequest({
        returnRequestId,
        disposition: body.disposition || "RESTOCK_SELLABLE",
        condition: body.condition,
        adminUserId: admin.id,
        notes: body.notes,
      });
      return success(updated);
    }
    if (path === "admin/settings") {
      const admin = await verifyAdminAuth(req);
      const updated = await SettingsService.updateSettings(body, admin?.id);
      return success(updated);
    }

    // 23b. Admin Promotions & Marketing Controls
    if (path === "admin/promotions") {
      const admin = await verifyAdminAuth(req);
      const created = await PromotionService.createPromotion(body, admin?.id);
      return success(created, 201);
    }

    if (route[0] === "admin" && route[1] === "promotions" && route[2]) {
      const admin = await verifyAdminAuth(req);
      const updated = await PromotionService.updatePromotion(route[2], body, admin?.id);
      return success(updated);
    }

    if (path === "admin/coupons") {
      const admin = await verifyAdminAuth(req);
      const created = await PromotionService.createCoupon(body, admin?.id);
      return success(created, 201);
    }

    if (path === "admin/vouchers") {
      const { code, discountAmount, discountPercent, isDiscoveryVoucher, expiresDays } = body || {};
      const { randomUUID } = await import("node:crypto");
      const voucherCode = (code || `MSC-VCH-${randomUUID().slice(0, 8)}`).trim().toUpperCase();
      const expiresAt = expiresDays ? new Date(Date.now() + Number(expiresDays) * 24 * 60 * 60 * 1000) : null;
      const voucher = await prisma.voucher.create({
        data: {
          code: voucherCode,
          discountAmount: discountAmount ? Number(discountAmount) : null,
          discountPercent: discountPercent ? Number(discountPercent) : null,
          isDiscoveryVoucher: Boolean(isDiscoveryVoucher),
          expiresAt,
        },
      });
      return success(voucher, 201);
    }

    if (path === "admin/gift-cards") {
      const admin = await verifyAdminAuth(req);
      const created = await GiftCardService.createGiftCard(body, admin?.id);
      return success(created, 201);
    }

    if (path === "admin/loyalty/adjust") {
      const admin = await verifyAdminAuth(req);
      const { customerId, pointsDelta, reason } = body || {};
      if (!customerId || pointsDelta === undefined || !reason) {
        return error("INVALID_INPUT", "customerId, pointsDelta, and mandatory reason required", 400);
      }
      const adjusted = await LoyaltyService.manualAdjustment(customerId, Number(pointsDelta), reason, admin?.id || "admin");
      return success(adjusted);
    }

    if (path === "admin/loyalty/config") {
      const admin = await verifyAdminAuth(req);
      const updated = await LoyaltyService.updateProgramConfig(body, admin?.id);
      return success(updated);
    }

    // 24. Public Customer Review Submission
    if (path === "reviews") {
      const auth = getAuth(req);
      let customerId = auth.customerId;
      if (!customerId) {
        if (body.email) {
          let cust = await prisma.customer.findUnique({ where: { email: body.email } });
          if (!cust) {
            cust = await prisma.customer.create({
              data: {
                email: body.email,
                firstName: body.name || body.firstName || "Client",
                lastName: body.lastName || "",
              },
            });
          }
          customerId = cust.id;
        } else {
          const defaultCust = await prisma.customer.findFirst();
          customerId = defaultCust?.id || "guest";
        }
      }

      if (!body.productId) return error("MISSING_PRODUCT_ID", "productId is required", 400);

      const review = await ReviewsService.submitReview({
        customerId,
        productId: body.productId,
        orderItemId: body.orderItemId,
        rating: Number(body.rating) || 5,
        title: body.title,
        body: body.body || body.comment || "",
        longevityRating: body.longevityRating ? Number(body.longevityRating) : undefined,
        sillageRating: body.sillageRating ? Number(body.sillageRating) : undefined,
        imageUrls: body.imageUrls,
      });
      return success(review, 201);
    }

    // 25. Admin Review Status Moderation
    if (path === "admin/reviews/status") {
      const admin = await verifyAdminAuth(req);
      const reviewId = body.reviewId || body.id;
      const status = body.status;
      if (!reviewId || !status) return error("INVALID_INPUT", "reviewId and status are required", 400);
      const updated = await ReviewsService.updateReviewStatus(reviewId, status, admin?.id);
      return success(updated);
    }

    // 26. Customer Return Request (7-Day Guarantee)
    if (path === "returns") {
      const auth = getAuth(req);
      let customerId = auth.customerId || body.customerId;
      if (!customerId) {
        const order = await prisma.order.findUnique({ where: { id: body.orderId } });
        customerId = order?.customerId || (await prisma.customer.findFirst())?.id || "guest";
      }
      if (!body.orderId) return error("MISSING_ORDER_ID", "orderId is required", 400);

      const returnReq = await ReturnsService.requestReturn({
        orderId: body.orderId,
        customerId,
        reason: body.reason || "Customer requested return within 7-day guarantee window",
        requestedAction: body.requestedAction || "REFUND",
        items: body.items || [],
      });
      return success(returnReq, 201);
    }

    // 27. Admin Return Inspection & Restock
    if (path === "admin/returns/inspect") {
      const admin = await verifyAdminAuth(req);
      const returnRequestId = body.returnRequestId || body.id;
      const disposition = body.disposition || "RESTOCK_SELLABLE";
      const condition = body.condition;
      if (!returnRequestId) return error("INVALID_INPUT", "returnRequestId is required", 400);
      const updated = await ReturnsService.inspectReturnRequest({
        returnRequestId,
        disposition,
        condition,
        adminUserId: admin?.id,
        notes: body.notes,
      });
      return success(updated);
    }

    // 28. Admin Audit Log Record
    if (path === "admin/audit-logs") {
      const admin = await verifyAdminAuth(req);
      const logged = await AuditService.log({
        adminUserId: admin?.id,
        action: body.action || "ADMIN_ACTION",
        resourceType: body.resourceType || "SYSTEM",
        resourceId: body.resourceId || "general",
        diff: body.diff || body.res,
      });
      return success(logged);
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${path} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route PATCH Error:", err);
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
    const code = err?.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED");
    return error(code, err?.message || "Internal server error", status);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const route = params.route || [];

    // Require administrator authorization for all admin delete endpoints
    if (route[0] === "admin") {
      const admin = await verifyAdminAuth(req);
      if (!admin) {
        return error("UNAUTHORIZED", "Valid administrator authentication token is required", 401);
      }
    }

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
        const prod = await prisma.product.findFirst({
          where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
          select: { id: true },
        });
        const targetId = prod?.id || productIdOrSlug;

        // Disassociate relations safely to avoid foreign key violation
        await prisma.productTag.deleteMany({ where: { productId: targetId } }).catch(() => null);
        await prisma.productNote.deleteMany({ where: { productId: targetId } }).catch(() => null);
        await prisma.productCollection.deleteMany({ where: { productId: targetId } }).catch(() => null);
        await prisma.productPerfumer.deleteMany({ where: { productId: targetId } }).catch(() => null);
        await prisma.inventory.deleteMany({
          where: { variant: { productId: targetId } },
        }).catch(() => null);
        await prisma.productVariant.deleteMany({ where: { productId: targetId } }).catch(() => null);
        await prisma.product.delete({
          where: { id: targetId },
        });
      } catch (err: any) {
        console.warn("Product direct deletion failed, fallback to soft unpublish:", err);
        await prisma.product.updateMany({
          where: { OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }] },
          data: { isPublished: false },
        });
      }
      return success({ success: true, deleted: productIdOrSlug });
    }

    // 5. Admin Delete Collection
    if (route[0] === "admin" && route[1] === "collections" && route[2]) {
      const collectionIdOrSlug = route[2];
      const target = await prisma.collection.findFirst({
        where: {
          OR: [{ id: collectionIdOrSlug }, { slug: collectionIdOrSlug }],
        },
      });
      if (target) {
        await prisma.productCollection.deleteMany({
          where: { collectionId: target.id },
        });
        await prisma.collection.delete({
          where: { id: target.id },
        });
      }
      return success({ success: true, deleted: collectionIdOrSlug });
    }

    // 6. Admin Delete Banner
    if (route[0] === "admin" && route[1] === "banners" && route[2]) {
      const bannerId = route[2];
      await BannerService.deleteBanner(bannerId);
      return success({ success: true, deleted: bannerId });
    }

    // 7. Admin Delete Tag
    if (route[0] === "admin" && route[1] === "tags" && route[2]) {
      const tagId = route[2];
      await TagService.deleteTag(tagId);
      return success({ success: true, deleted: tagId });
    }

    // 8. Admin Delete Brand
    if (route[0] === "admin" && route[1] === "brands" && route[2]) {
      const brandIdOrSlug = route[2];
      const target = await prisma.brand.findFirst({
        where: {
          OR: [{ id: brandIdOrSlug }, { slug: brandIdOrSlug }],
        },
      });
      if (target) {
        // Reassign products to an alternate brand if any exist to satisfy foreign key constraint
        const fallbackBrand = await prisma.brand.findFirst({
          where: { id: { not: target.id } },
        });
        if (fallbackBrand) {
          await prisma.product.updateMany({
            where: { brandId: target.id },
            data: { brandId: fallbackBrand.id },
          }).catch(() => null);
        }
        await prisma.brand.delete({
          where: { id: target.id },
        });
      }
      return success({ success: true, deleted: brandIdOrSlug });
    }

    // 9. Admin Delete Note
    if (route[0] === "admin" && route[1] === "notes" && route[2]) {
      const noteIdOrSlug = route[2];
      const target = await prisma.note.findFirst({
        where: {
          OR: [{ id: noteIdOrSlug }, { slugEn: noteIdOrSlug }, { slugAr: noteIdOrSlug }],
        },
      });
      if (target) {
        await prisma.productNote.deleteMany({
          where: { noteId: target.id },
        }).catch(() => null);
        await prisma.note.delete({
          where: { id: target.id },
        });
      }
      return success({ success: true, deleted: noteIdOrSlug });
    }

    // 10. Admin Delete Enquiry / Message
    if (route[0] === "admin" && (route[1] === "enquiries" || route[1] === "messages") && route[2]) {
      const enquiryId = route[2];
      await prisma.businessEvent.deleteMany({
        where: {
          eventName: "ENQUIRY_CREATED",
          OR: [{ id: enquiryId }, { aggregateId: enquiryId }],
        },
      });
      return success({ success: true, deleted: enquiryId });
    }

    // 11. Admin Delete Review
    if (route[0] === "admin" && route[1] === "reviews" && route[2]) {
      const reviewId = route[2];
      await prisma.reviewImage.deleteMany({ where: { reviewId } }).catch(() => null);
      await prisma.review.deleteMany({ where: { id: reviewId } });
      return success({ success: true, deleted: reviewId });
    }

    // 12. Admin Delete Promotion
    if (route[0] === "admin" && route[1] === "promotions" && route[2]) {
      const admin = await verifyAdminAuth(req);
      const deleted = await PromotionService.deletePromotion(route[2], admin?.id);
      return success(deleted);
    }

    // 13. Admin Delete Coupon
    if (route[0] === "admin" && route[1] === "coupons" && route[2]) {
      const admin = await verifyAdminAuth(req);
      const deleted = await PromotionService.deleteCoupon(route[2], admin?.id);
      return success(deleted);
    }

    // 14. Admin Delete Voucher
    if (route[0] === "admin" && route[1] === "vouchers" && route[2]) {
      await prisma.voucherRedemption.deleteMany({ where: { voucherId: route[2] } }).catch(() => null);
      await prisma.voucher.delete({ where: { id: route[2] } });
      return success({ success: true, deleted: route[2] });
    }

    return error("NOT_FOUND", `Endpoint /api/v1/${route.join("/")} not found`, 404);
  } catch (err: any) {
    console.error("Storefront API Route DELETE Error:", err);
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;
    const code = err?.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED");
    return error(code, err?.message || "Internal server error", status);
  }
}
