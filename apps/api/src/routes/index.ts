import { Router } from "express";
import rateLimit from "express-rate-limit";
import { storefrontProduct } from "../services/storefront-catalog";
import { storefrontOrder } from "../services/storefront-order";
import { z } from "zod";
import { ApiError } from "../middleware/error-handler";
import {
  createGuestSession,
  requireGuestSession,
  requireCustomerAuth,
  assertCartOwner,
  assertOrderOwner,
} from "../middleware/storefront-auth";
import { CustomerService } from "../services/customer.service";
import { DeliveryService } from "../services/delivery.service";
import { DeliveryRequestSchema } from "@muschio/types";
import { CatalogService } from "../services/catalog.service";
import { NotesService } from "../services/notes.service";
import { CartService } from "../services/cart.service";
import { CheckoutService } from "../services/checkout.service";
import { PaymentService } from "../services/payment.service";
import { AIScentDiscoveryService } from "../services/ai-discovery.service";
import { DiscoverySetService } from "../services/discovery-set.service";
import { JournalService } from "../services/journal.service";
import { AdminService } from "../services/admin.service";
import { marketService } from "../services/market.service";
import { InventoryService } from "../services/inventory.service";
import { PurchasingService } from "../services/purchasing.service";
import { FulfillmentService } from "../services/fulfillment.service";
import { ReturnsService } from "../services/returns.service";
import { ReviewsService } from "../services/reviews.service";
import { ContentService } from "../services/content.service";
import { SearchService } from "../services/search.service";
import { BannerService } from "../services/banner.service";
import { requireAdminAuth, requireRoles } from "../middleware/auth";
import {
  ProductFilterSchema,
  NoteFilterQuerySchema,
  AddToCartInputSchema,
  CheckoutPayloadSchema,
  PaymentSessionRequestSchema,
  AIScentConsultationInputSchema,
  CreateReviewInputSchema,
  CustomerLoginSchema,
  CustomerRegisterSchema,
  CreateSavedAddressSchema,
} from "@muschio/types";
import { AdminRole, BannerSlot, HomepageSectionType } from "@prisma/client";

const router: Router = Router();
const sessionLimiter = rateLimit({
  windowMs: 60000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/sessions/guest", sessionLimiter, (_req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: { token: createGuestSession() } });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 0. AUTHENTICATION & PRIVATE CLIENT PRIVILEGE
// -------------------------------------------------------------

router.post("/auth/login", loginLimiter, async (req, res, next) => {
  try {
    const input = CustomerLoginSchema.parse(req.body);
    const result = await CustomerService.login(input);
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/register", sessionLimiter, async (req, res, next) => {
  try {
    const input = CustomerRegisterSchema.parse(req.body);
    const result = await CustomerService.register(input);
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.get("/auth/me", requireCustomerAuth, async (req, res, next) => {
  try {
    const result = await CustomerService.getProfile(req.customerId!);
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.patch("/auth/profile", requireCustomerAuth, async (req, res, next) => {
  try {
    const result = await CustomerService.updateProfile(req.customerId!, req.body);
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 0.1 SAVED ADDRESS BOOK (PRIVATE CLIENT)
// -------------------------------------------------------------

router.get("/customers/addresses", requireCustomerAuth, async (req, res, next) => {
  try {
    const addresses = await CustomerService.getAddresses(req.customerId!);
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: addresses, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.post("/customers/addresses", requireCustomerAuth, async (req, res, next) => {
  try {
    const input = CreateSavedAddressSchema.parse(req.body);
    const address = await CustomerService.addAddress(req.customerId!, input);
    res.status(201).json({ success: true, data: address, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.patch("/customers/addresses/:id", requireCustomerAuth, async (req, res, next) => {
  try {
    const address = await CustomerService.updateAddress(
      req.customerId!,
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: address, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.delete("/customers/addresses/:id", requireCustomerAuth, async (req, res, next) => {
  try {
    const result = await CustomerService.deleteAddress(
      req.customerId!,
      req.params.id as string,
    );
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});

router.post("/customers/addresses/:id/default", requireCustomerAuth, async (req, res, next) => {
  try {
    const address = await CustomerService.setDefaultAddress(
      req.customerId!,
      req.params.id as string,
    );
    res.json({ success: true, data: address, meta: { requestId: req.id } });
  } catch (error) {
    next(error);
  }
});


router.post("/delivery/quote", async (req, res, next) => {
  try {
    const input = DeliveryRequestSchema.parse(req.body);
    res.json({
      success: true,
      data: DeliveryService.quote(input),
      meta: { requestId: req.id },
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 1. CATALOG & SEARCH
// -------------------------------------------------------------

router.get("/products", async (req, res, next) => {
  try {
    const filters = ProductFilterSchema.parse(req.query);
    const result = await CatalogService.getProducts(filters);
    res.json({
      success: true,
      data: result.items.map(storefrontProduct),
      meta: { pagination: result.pagination, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/products/:slug", async (req, res, next) => {
  try {
    const result = await CatalogService.getProductBySlug(req.params.slug);
    if (!result) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "Product not found" },
        });
      return;
    }
    res.json({
      success: true,
      data: { product: storefrontProduct(result.product) },
      meta: { requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";
    const family = req.query.family as string | undefined;
    const accord = req.query.accord as string | undefined;
    const note = req.query.note as string | undefined;
    const gender = req.query.gender as string | undefined;
    const results = await SearchService.searchCatalog(q, {
      family,
      accord,
      note,
      gender,
    });
    res.json({
      success: true,
      data: results,
      meta: { count: results.length, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/brands", async (req, res, next) => {
  try {
    const brands = await CatalogService.getBrands();
    res.json({ success: true, data: brands, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/brands/:slug", async (req, res, next) => {
  try {
    const brand = await CatalogService.getBrandBySlug(req.params.slug);
    if (!brand) {
      res.status(404).json({
        success: false,
        error: { code: "BRAND_NOT_FOUND", message: "Brand not found" },
      });
      return;
    }
    res.json({ success: true, data: brand, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});


router.get("/scent-families", async (req, res, next) => {
  try {
    const families = await CatalogService.getScentFamilies();
    res.json({ success: true, data: families, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// Dedicated Notes Discovery
router.get("/notes", async (req, res, next) => {
  try {
    const query = NoteFilterQuerySchema.parse(req.query);
    const result = await NotesService.getNotes(query);
    res.json({
      success: true,
      data: result.items,
      meta: { pagination: result.pagination, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/notes/:slug", async (req, res, next) => {
  try {
    const result = await NotesService.getNoteBySlug(req.params.slug);
    if (!result) {
      res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOTE_NOT_FOUND",
            message: "Fragrance note not found",
          },
        });
      return;
    }
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/notes/:slug/products", async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const sort = (req.query.sort as string) || "featured";
    const result = await NotesService.getPerfumesByNoteSlug(req.params.slug, {
      page,
      limit,
      sort,
    });
    if (!result) {
      res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOTE_NOT_FOUND",
            message: "Fragrance note not found",
          },
        });
      return;
    }
    res.json({
      success: true,
      data: result,
      meta: { pagination: result.pagination, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. MARKETS & MULTI-COUNTRY ECONOMICS
// -------------------------------------------------------------

router.get("/markets", async (req, res, next) => {
  try {
    const markets = await marketService.getMarkets();
    res.json({ success: true, data: markets, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/markets/calculate", async (req, res, next) => {
  try {
    const { marketCode, items, discountAmount, paymentMethod } = req.body;
    const outcome = await marketService.calculateMarketTotals({
      marketCode: marketCode || "AE",
      items,
      discountAmount,
      paymentMethod,
    });
    res.json({ success: true, data: outcome, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. CART & CHECKOUT
// -------------------------------------------------------------

router.get("/cart", requireGuestSession, async (req, res, next) => {
  try {
    const cart = await CartService.getOrCreateCart(
      req.guestSessionId!,
      req.customerId,
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data: cart, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/cart/items", requireGuestSession, async (req, res, next) => {
  try {
    const body = AddToCartInputSchema.parse(req.body);
    const cart = await CartService.addItem({
      ...body,
      guestSessionId: req.guestSessionId!,
      customerId: req.customerId,
    });
    res.json({ success: true, data: cart, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/cart/items/:itemId",
  requireGuestSession,
  async (req, res, next) => {
    try {
      const { quantity } = z
        .object({ quantity: z.number().int().min(0).max(99) })
        .parse(req.body);
      await CartService.updateItem(
        z.string().uuid().parse(req.params.itemId),
        quantity,
        req.guestSessionId!,
        req.customerId,
      );
      res.json({
        success: true,
        data: { updated: true },
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/checkout", requireGuestSession, async (req, res, next) => {
  try {
    const payload = CheckoutPayloadSchema.parse(req.body);
    await assertCartOwner(payload.cartId, req.guestSessionId!, req.customerId);
    PaymentService.assertAvailable(payload.paymentMethod);
    const order = await CheckoutService.processCheckout(
      payload,
      req.guestSessionId!,
      req.customerId,
    );
    res
      .status(201)
      .json({
        success: true,
        data: storefrontOrder(order),
        meta: { requestId: req.id },
      });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id", requireGuestSession, async (req, res, next) => {
  try {
    const orderId = z.string().uuid().parse(req.params.id);
    await assertOrderOwner(orderId, req.guestSessionId!, req.customerId);
    const order = await CheckoutService.getOrderById(orderId);
    res.setHeader("Cache-Control", "no-store");
    if (!order) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
        });
      return;
    }
    res.json({
      success: true,
      data: storefrontOrder(order),
      meta: { requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/orders", requireGuestSession, async (req, res, next) => {
  try {
    const orders = await CheckoutService.getSessionOrders(
      req.guestSessionId!,
      req.customerId,
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      data: orders.map(storefrontOrder),
      meta: { requestId: req.id },
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/orders/lookup/:orderNumber",
  requireGuestSession,
  async (req, res, next) => {
    try {
      const order = await CheckoutService.getOrderByNumber(
        z.string().min(1).max(80).parse(req.params.orderNumber),
      );
      if (!order) {
        res
          .status(404)
          .json({
            success: false,
            error: { code: "ORDER_NOT_FOUND", message: "Order not found" },
          });
        return;
      }

      // Check access: customer ownership, session reservation, or email/phone verification
      const verifyEmail = (req.query.email as string)?.trim().toLowerCase();
      const verifyPhone = (req.query.phone as string)?.trim();
      const matchesEmail = verifyEmail && order.guestEmail?.toLowerCase() === verifyEmail;
      const matchesPhone = verifyPhone && order.shippingAddress?.phone === verifyPhone;

      if (!matchesEmail && !matchesPhone) {
        await assertOrderOwner(order.id, req.guestSessionId!, req.customerId);
      }

      res.setHeader("Cache-Control", "no-store");
      res.json({
        success: true,
        data: storefrontOrder(order),
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 4. PAYMENTS & WEBHOOKS
// -------------------------------------------------------------

router.get("/payments/availability", (_req, res) =>
  res.json({
    success: true,
    data: { methods: PaymentService.availableMethods() },
  }),
);
router.post(
  "/payments/session",
  requireGuestSession,
  async (req, res, next) => {
    try {
      const body = PaymentSessionRequestSchema.parse(req.body);
      await assertOrderOwner(body.orderId, req.guestSessionId!);
      const session = await PaymentService.initiatePayment(body);
      res.json({ success: true, data: session, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/webhooks/payments", async (_req, _res, next) => {
  next(
    new ApiError(
      410,
      "WEBHOOK_DISABLED",
      "Use the provider-specific verified webhook endpoint",
    ),
  );
});
router.post("/webhooks/stripe", async (req, res, next) => {
  try {
    const result = await PaymentService.handleStripeWebhook(
      req.rawBody,
      req.headers["stripe-signature"],
    );
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5. INVENTORY LEDGER & WAREHOUSING
// -------------------------------------------------------------

router.get("/inventory/ledger", requireAdminAuth, async (req, res, next) => {
  try {
    const variantId = req.query.variantId as string | undefined;
    const history = await InventoryService.getStockLedgerHistory(variantId);
    res.json({ success: true, data: history, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/inventory/allocate-tester",
  requireAdminAuth,
  requireRoles([AdminRole.INVENTORY_MANAGER]),
  async (req, res, next) => {
    try {
      const { variantId, warehouseId, quantity, reason } = req.body;
      const result = await InventoryService.allocateTesterStock({
        variantId,
        warehouseId,
        quantity: Number(quantity),
        reason,
      });
      res.json({ success: true, data: result, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 6. PURCHASING & GOODS RECEIPTS
// -------------------------------------------------------------

router.get(
  "/purchasing/suppliers",
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const suppliers = await PurchasingService.getSuppliers();
      res.json({ success: true, data: suppliers, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/purchasing/orders",
  requireAdminAuth,
  requireRoles([AdminRole.INVENTORY_MANAGER]),
  async (req, res, next) => {
    try {
      const po = await PurchasingService.createPurchaseOrder(req.body);
      res
        .status(201)
        .json({ success: true, data: po, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/purchasing/receive-grn",
  requireAdminAuth,
  requireRoles([AdminRole.INVENTORY_MANAGER]),
  async (req, res, next) => {
    try {
      const grn = await PurchasingService.receiveGoodsReceipt(req.body);
      res
        .status(201)
        .json({ success: true, data: grn, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 7. FULFILLMENT & SHIPMENTS
// -------------------------------------------------------------

router.post(
  "/fulfillments",
  requireAdminAuth,
  requireRoles([AdminRole.ORDER_MANAGER]),
  async (req, res, next) => {
    try {
      const fulfillment = await FulfillmentService.createFulfillment(req.body);
      res
        .status(201)
        .json({
          success: true,
          data: fulfillment,
          meta: { requestId: req.id },
        });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/fulfillments/dispatch",
  requireAdminAuth,
  requireRoles([AdminRole.ORDER_MANAGER]),
  async (req, res, next) => {
    try {
      const shipment = await FulfillmentService.dispatchShipment(req.body);
      res.json({ success: true, data: shipment, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/orders/:id/fulfillments",
  requireGuestSession,
  async (req, res, next) => {
    try {
      const orderId = z.string().uuid().parse(req.params.id);
      await assertOrderOwner(orderId, req.guestSessionId!);
      const fulfillments =
        await FulfillmentService.getOrderFulfillments(orderId);
      res.setHeader("Cache-Control", "no-store");
      res.json({
        success: true,
        data: fulfillments,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 8. RETURNS & INSPECTION STATION
// -------------------------------------------------------------

router.post(
  "/returns/request",
  requireAdminAuth,
  requireRoles([AdminRole.ORDER_MANAGER]),
  async (req, res, next) => {
    try {
      const returnReq = await ReturnsService.requestReturn(req.body);
      res
        .status(201)
        .json({ success: true, data: returnReq, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/admin/returns", requireAdminAuth, async (req, res, next) => {
  try {
    const returns = await ReturnsService.getReturnRequests(
      req.query.status as string,
    );
    res.json({ success: true, data: returns, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/admin/returns/inspect",
  requireAdminAuth,
  requireRoles([AdminRole.ORDER_MANAGER]),
  async (req, res, next) => {
    try {
      const inspection = await ReturnsService.inspectReturnItem({
        ...req.body,
        inspectedBy: req.admin?.email || "Senior Warehouse Lead",
      });
      res.json({
        success: true,
        data: inspection,
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 9. REVIEWS & VERIFIED BUYER FEEDBACK
// -------------------------------------------------------------

router.post("/reviews", requireCustomerAuth, async (req, res, next) => {
  try {
    const input = CreateReviewInputSchema.parse(req.body);
    const review = await ReviewsService.submitReview({
      ...input,
      customerId: req.customerId!,
      orderItemId: input.orderItemId || undefined,
    });
    res
      .status(201)
      .json({ success: true, data: review, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});
router.post(
  "/admin/reviews",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN]),
  async (req, res, next) => {
    try {
      const input = CreateReviewInputSchema.parse(req.body);
      const customerId = z.string().uuid().parse(req.body.customerId);
      const review = await ReviewsService.submitReview({
        ...input,
        customerId,
        orderItemId: input.orderItemId || undefined,
      });
      res
        .status(201)
        .json({ success: true, data: review, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/reviews/product/:productId", async (req, res, next) => {
  try {
    const reviews = await ReviewsService.getProductReviews(
      req.params.productId,
    );
    res.json({ success: true, data: reviews, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 10. CONTENT GRAPH & SEO DOSSIERS
// -------------------------------------------------------------

router.get("/content/nodes", async (req, res, next) => {
  try {
    const nodes = await ContentService.getContentNodes(req.query.type as any);
    res.json({ success: true, data: nodes, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/content/nodes/:slug", async (req, res, next) => {
  try {
    const node = await ContentService.getContentNodeBySlug(req.params.slug);
    if (!node) {
      res
        .status(404)
        .json({
          success: false,
          error: {
            code: "CONTENT_NOT_FOUND",
            message: "Content node not found",
          },
        });
      return;
    }
    res.json({ success: true, data: node, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 11. AI SCENT DISCOVERY & DISCOVERY SETS
// -------------------------------------------------------------

router.post("/ai/scent-discovery", async (req, res, next) => {
  try {
    const body = AIScentConsultationInputSchema.parse(req.body);
    const result = await AIScentDiscoveryService.consult(body);
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/discovery-sets/samples", async (req, res, next) => {
  try {
    const samples = await DiscoverySetService.getAvailableSampleVials();
    res.json({ success: true, data: samples, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/discovery-sets/validate", async (req, res, next) => {
  try {
    const { variantIds } = req.body;
    const result = await DiscoverySetService.validateCustomSet(variantIds);
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 12. EDITORIAL JOURNAL
// -------------------------------------------------------------

router.get("/blog", async (req, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await JournalService.getPosts(page, limit);
    res.json({
      success: true,
      data: result.items,
      meta: { pagination: result.pagination, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await JournalService.getPostBySlug(req.params.slug);
    if (!post) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "POST_NOT_FOUND", message: "Article not found" },
        });
      return;
    }
    res.json({ success: true, data: post, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 13. ADMIN OPERATIONS & DASHBOARD (RBAC)
// -------------------------------------------------------------

router.post("/admin/auth/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const ua = (req.headers["user-agent"] as string) || undefined;
    const result = await AdminService.login(email, password, ip, ua);
    res.json({ success: true, data: result, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/dashboard", requireAdminAuth, async (req, res, next) => {
  try {
    const metrics = await AdminService.getDashboardMetrics();
    res.json({ success: true, data: metrics, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/admin/orders/:id/status",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.ORDER_MANAGER]),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const orderId = req.params.id as string;
      const updated = await AdminService.updateOrderStatus(
        orderId,
        status,
        req.admin!.id,
      );
      res.json({ success: true, data: updated, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// -------------------------------------------------------------
// 14. BANNERS, SLIDERS & HOMEPAGE CMS
// -------------------------------------------------------------

// Public: get active banners (storefront SSR fetch)
router.get("/content/banners", async (req, res, next) => {
  try {
    const slot = req.query.slot as BannerSlot | undefined;
    const banners = await BannerService.getActiveBanners(
      slot && Object.values(BannerSlot).includes(slot) ? slot : undefined,
    );
    res.json({
      success: true,
      data: banners,
      meta: { count: banners.length, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

// Public: get visible homepage sections (storefront SSR fetch)
router.get("/content/sections", async (req, res, next) => {
  try {
    const sections = await BannerService.getVisibleSections();
    res.json({
      success: true,
      data: sections,
      meta: { count: sections.length, requestId: req.id },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: list ALL banners (including inactive/scheduled)
router.get("/admin/banners", requireAdminAuth, async (req, res, next) => {
  try {
    const banners = await BannerService.getAllBanners();
    res.json({ success: true, data: banners, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// Admin: create a banner
router.post(
  "/admin/banners",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const banner = await BannerService.createBanner(req.body);
      res
        .status(201)
        .json({ success: true, data: banner, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: update a banner
router.patch(
  "/admin/banners/:id",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const banner = await BannerService.updateBanner(req.params.id as string, req.body);
      res.json({ success: true, data: banner, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: toggle banner active/inactive
router.post(
  "/admin/banners/:id/toggle",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const banner = await BannerService.toggleBanner(req.params.id as string);
      res.json({ success: true, data: banner, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: delete a banner
router.delete(
  "/admin/banners/:id",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN]),
  async (req, res, next) => {
    try {
      await BannerService.deleteBanner(req.params.id as string);
      res.json({
        success: true,
        data: { deleted: true },
        meta: { requestId: req.id },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: list ALL homepage sections (including hidden)
router.get(
  "/admin/sections",
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const sections = await BannerService.getAllSections();
      res.json({ success: true, data: sections, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: upsert a homepage section
router.put(
  "/admin/sections",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const section = await BannerService.upsertSection(req.body);
      res.json({ success: true, data: section, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: reorder homepage sections
router.post(
  "/admin/sections/reorder",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const sections = await BannerService.reorderSections(req.body.ordering);
      res.json({ success: true, data: sections, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

// Admin: toggle section visibility
router.post(
  "/admin/sections/:sectionType/toggle",
  requireAdminAuth,
  requireRoles([AdminRole.SUPER_ADMIN, AdminRole.EDITOR]),
  async (req, res, next) => {
    try {
      const sectionType = req.params.sectionType as HomepageSectionType;
      const section = await BannerService.toggleSection(sectionType);
      res.json({ success: true, data: section, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  },
);

export { router as apiRouter };