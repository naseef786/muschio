import { Router } from "express";
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
import { requireAdminAuth, requireRoles } from "../middleware/auth";
import {
  ProductFilterSchema,
  NoteFilterQuerySchema,
  AddToCartInputSchema,
  CheckoutPayloadSchema,
  PaymentSessionRequestSchema,
  WebhookPayloadSchema,
  AIScentConsultationInputSchema,
  CreateReviewInputSchema,
} from "@muschio/types";
import { AdminRole } from "@prisma/client";

const router: Router = Router();

// -------------------------------------------------------------
// 1. CATALOG & SEARCH
// -------------------------------------------------------------

router.get("/products", async (req, res, next) => {
  try {
    const filters = ProductFilterSchema.parse(req.query);
    const result = await CatalogService.getProducts(filters);
    res.json({ success: true, data: result.items, meta: { pagination: result.pagination, requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/products/:slug", async (req, res, next) => {
  try {
    const result = await CatalogService.getProductBySlug(req.params.slug);
    if (!result) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } });
      return;
    }
    res.json({ success: true, data: result, meta: { requestId: req.id } });
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
    const results = await SearchService.searchCatalog(q, { family, accord, note, gender });
    res.json({ success: true, data: results, meta: { count: results.length, requestId: req.id } });
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
    res.json({ success: true, data: result.items, meta: { pagination: result.pagination, requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/notes/:slug", async (req, res, next) => {
  try {
    const result = await NotesService.getNoteBySlug(req.params.slug);
    if (!result) {
      res.status(404).json({ success: false, error: { code: "NOTE_NOT_FOUND", message: "Fragrance note not found" } });
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
    const result = await NotesService.getPerfumesByNoteSlug(req.params.slug, { page, limit, sort });
    if (!result) {
      res.status(404).json({ success: false, error: { code: "NOTE_NOT_FOUND", message: "Fragrance note not found" } });
      return;
    }
    res.json({ success: true, data: result, meta: { pagination: result.pagination, requestId: req.id } });
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

router.get("/cart", async (req, res, next) => {
  try {
    const guestSessionId = req.query.guestSessionId as string | undefined;
    const customerId = req.query.customerId as string | undefined;
    const cart = await CartService.getOrCreateCart(guestSessionId, customerId);
    res.json({ success: true, data: cart, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/cart/items", async (req, res, next) => {
  try {
    const body = AddToCartInputSchema.parse(req.body);
    const cart = await CartService.addItem(body);
    res.json({ success: true, data: cart, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.patch("/cart/items/:itemId", async (req, res, next) => {
  try {
    const { quantity } = req.body;
    await CartService.updateItem(req.params.itemId, Number(quantity));
    res.json({ success: true, data: { updated: true }, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", async (req, res, next) => {
  try {
    const payload = CheckoutPayloadSchema.parse(req.body);
    const order = await CheckoutService.processCheckout(payload);
    res.status(201).json({ success: true, data: order, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await CheckoutService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
      return;
    }
    res.json({ success: true, data: order, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/lookup/:orderNumber", async (req, res, next) => {
  try {
    const order = await CheckoutService.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      res.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
      return;
    }
    res.json({ success: true, data: order, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. PAYMENTS & WEBHOOKS
// -------------------------------------------------------------

router.post("/payments/session", async (req, res, next) => {
  try {
    const body = PaymentSessionRequestSchema.parse(req.body);
    const session = await PaymentService.initiatePayment(body);
    res.json({ success: true, data: session, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/webhooks/payments", async (req, res, next) => {
  try {
    const body = WebhookPayloadSchema.parse(req.body);
    const result = await PaymentService.handleWebhook(body);
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

router.post("/inventory/allocate-tester", requireAdminAuth, async (req, res, next) => {
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
});

// -------------------------------------------------------------
// 6. PURCHASING & GOODS RECEIPTS
// -------------------------------------------------------------

router.get("/purchasing/suppliers", requireAdminAuth, async (req, res, next) => {
  try {
    const suppliers = await PurchasingService.getSuppliers();
    res.json({ success: true, data: suppliers, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/purchasing/orders", requireAdminAuth, async (req, res, next) => {
  try {
    const po = await PurchasingService.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: po, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/purchasing/receive-grn", requireAdminAuth, async (req, res, next) => {
  try {
    const grn = await PurchasingService.receiveGoodsReceipt(req.body);
    res.status(201).json({ success: true, data: grn, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 7. FULFILLMENT & SHIPMENTS
// -------------------------------------------------------------

router.post("/fulfillments", requireAdminAuth, async (req, res, next) => {
  try {
    const fulfillment = await FulfillmentService.createFulfillment(req.body);
    res.status(201).json({ success: true, data: fulfillment, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/fulfillments/dispatch", requireAdminAuth, async (req, res, next) => {
  try {
    const shipment = await FulfillmentService.dispatchShipment(req.body);
    res.json({ success: true, data: shipment, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id/fulfillments", async (req, res, next) => {
  try {
    const fulfillments = await FulfillmentService.getOrderFulfillments(req.params.id);
    res.json({ success: true, data: fulfillments, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 8. RETURNS & INSPECTION STATION
// -------------------------------------------------------------

router.post("/returns/request", async (req, res, next) => {
  try {
    const returnReq = await ReturnsService.requestReturn(req.body);
    res.status(201).json({ success: true, data: returnReq, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/returns", requireAdminAuth, async (req, res, next) => {
  try {
    const returns = await ReturnsService.getReturnRequests(req.query.status as string);
    res.json({ success: true, data: returns, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/returns/inspect", requireAdminAuth, async (req, res, next) => {
  try {
    const inspection = await ReturnsService.inspectReturnItem({
      ...req.body,
      inspectedBy: req.admin?.email || "Senior Warehouse Lead",
    });
    res.json({ success: true, data: inspection, meta: { requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 9. REVIEWS & VERIFIED BUYER FEEDBACK
// -------------------------------------------------------------

router.post("/reviews", async (req, res, next) => {
  try {
    const input = CreateReviewInputSchema.parse(req.body);
    // Customer identity must come from verified authentication, never client input or demo IDs.
    res.status(503).json({ success: false, error: { code: "REVIEWS_UNAVAILABLE", message: "Review submission is unavailable until authenticated customer identity is configured." } });
    return;
    /* Legacy unauthenticated submission disabled.
    const customerId = (req.body.customerId as string) || "cust-demo-1";
    const review = await ReviewsService.submitReview({
      ...input,
      customerId,
      orderItemId: input.orderItemId || undefined,
    });
    res.status(201).json({ success: true, data: review, meta: { requestId: req.id } });
    */
  } catch (err) {
    next(err);
  }
});

router.get("/reviews/product/:productId", async (req, res, next) => {
  try {
    const reviews = await ReviewsService.getProductReviews(req.params.productId);
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
      res.status(404).json({ success: false, error: { code: "CONTENT_NOT_FOUND", message: "Content node not found" } });
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
    res.json({ success: true, data: result.items, meta: { pagination: result.pagination, requestId: req.id } });
  } catch (err) {
    next(err);
  }
});

router.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await JournalService.getPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ success: false, error: { code: "POST_NOT_FOUND", message: "Article not found" } });
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

router.post("/admin/auth/login", async (req, res, next) => {
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
      const updated = await AdminService.updateOrderStatus(orderId, status, req.admin!.id);
      res.json({ success: true, data: updated, meta: { requestId: req.id } });
    } catch (err) {
      next(err);
    }
  }
);

export { router as apiRouter };
