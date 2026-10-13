import express from "express";
import { Server } from "node:http";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import jwt from "jsonwebtoken";
const mocks = vi.hoisted(() => ({
  cartOwner: vi.fn(),
  orderOwner: vi.fn(),
  getCart: vi.fn(),
  getOrder: vi.fn(),
}));
vi.mock("../src/prisma", () => ({
  prisma: {
    cart: { findFirst: mocks.cartOwner },
    inventoryReservation: { findFirst: mocks.orderOwner },
  },
}));
vi.mock("../src/services/cart.service", () => ({
  CartService: { getOrCreateCart: mocks.getCart },
}));
vi.mock("../src/services/checkout.service", () => ({
  CheckoutService: {
    getOrderById: mocks.getOrder,
    getOrderByNumber: mocks.getOrder,
  },
}));
import { apiRouter } from "../src/routes";
import { errorHandler } from "../src/middleware/error-handler";
import { createGuestSession } from "../src/middleware/storefront-auth";
let server: Server, base: string;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", apiRouter);
  app.use(errorHandler);
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No test server");
  base = `http://127.0.0.1:${address.port}/api/v1`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv(
    "JWT_SECRET",
    "route-test-fixture-with-more-than-64-characters-abcdefghijklmnop",
  );
});
describe("protected HTTP routes", () => {
  it("blocks unauthenticated orders, fulfillments, checkout, payment sessions, returns, and cart updates", async () => {
    const paths = [
      ["GET", "/orders/11111111-1111-4111-8111-111111111111"],
      ["GET", "/orders/lookup/MSC-test"],
      ["GET", "/orders/11111111-1111-4111-8111-111111111111/fulfillments"],
      ["POST", "/checkout"],
      ["POST", "/payments/session"],
      ["POST", "/returns/request"],
      ["PATCH", "/cart/items/11111111-1111-4111-8111-111111111111"],
    ];
    for (const [method, path] of paths) {
      const response = await fetch(base + path, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method === "GET" ? {} : { body: "{}" }),
      });
      expect(response.status).toBe(401);
    }
    expect(mocks.getOrder).not.toHaveBeenCalled();
  });
  it("uses the signed session rather than caller-supplied customer or session ids", async () => {
    const token = createGuestSession();
    const claims = jwt.decode(token) as jwt.JwtPayload;
    mocks.getCart.mockResolvedValue({ id: "owned-cart", items: [] });
    const response = await fetch(
      base + "/cart?guestSessionId=other-session&customerId=other-customer",
      { headers: { "x-storefront-session": token } },
    );
    expect(response.status).toBe(200);
    expect(mocks.getCart).toHaveBeenCalledWith(claims.sub);
  });
  it("returns 404 without exposing another guest's order", async () => {
    mocks.orderOwner.mockResolvedValue(null);
    const response = await fetch(
      base + "/orders/11111111-1111-4111-8111-111111111111",
      { headers: { "x-storefront-session": createGuestSession() } },
    );
    expect(response.status).toBe(404);
    expect(mocks.getOrder).not.toHaveBeenCalled();
  });
  it("disables unsigned legacy payment callbacks and customer-id impersonation in reviews", async () => {
    const callback = await fetch(base + "/webhooks/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CAPTURED" }),
    });
    expect(callback.status).toBe(410);
    const review = await fetch(base + "/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: "another-customer" }),
    });
    expect(review.status).toBe(403);
  });
});
