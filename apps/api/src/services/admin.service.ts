import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../middleware/error-handler";
import { signingSecret } from "../middleware/storefront-auth";
import { InventoryService } from "./inventory.service";

export class AdminService {
  static async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const secret = signingSecret("ADMIN_JWT_SECRET");
    if (typeof email !== "string" || typeof password !== "string")
      throw new ApiError(
        400,
        "INVALID_INPUT",
        "Email and password are required",
      );
    const user = await prisma.adminUser.findUnique({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: user.id,
        action: "ADMIN_LOGIN",
        resourceType: "AUTH",
        resourceId: user.id,
        ipAddress,
        userAgent,
      },
    });

    const token = jwt.sign({ id: user.id, purpose: "admin" }, secret, {
      expiresIn: "12h",
      algorithm: "HS256",
      issuer: "muschio-api",
      audience: "muschio-admin",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  static async getDashboardMetrics() {
    const [
      totalProducts,
      totalOrders,
      paidOrders,
      lowStockInventories,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { isPublished: true } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: "PAID" },
        select: { totalAmount: true },
      }),
      prisma.inventory.findMany({
        where: {
          sealedQuantity: { lte: 5 },
        },
        include: {
          variant: {
            include: { product: true },
          },
        },
        take: 10,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true, shippingAddress: true },
        take: 8,
      }),
    ]);

    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockCount: lowStockInventories.length,
      lowStockItems: lowStockInventories,
      recentOrders,
    };
  }

  static async updateOrderStatus(
    orderId: string,
    status: any,
    adminUserId: string,
  ) {
    if (!["FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status))
      throw new ApiError(
        400,
        "INVALID_ORDER_TRANSITION",
        "Payment status must be verified by the payment provider",
      );
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
      const current = await tx.order.findUnique({ where: { id: orderId } });
      if (!current)
        throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found");
      const allowed: Record<string, string[]> = {
        PAID: ["FULFILLING"],
        FULFILLING: ["SHIPPED"],
        SHIPPED: ["DELIVERED"],
        PENDING: ["CANCELLED"],
      };
      if (!allowed[current.status]?.includes(status))
        throw new ApiError(
          409,
          "INVALID_ORDER_TRANSITION",
          "Order cannot move to the requested status",
        );
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (status === "CANCELLED")
        await InventoryService.releaseOrderReservations(orderId, tx);
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "UPDATE_ORDER_STATUS",
          resourceType: "ORDER",
          resourceId: orderId,
          diff: { newStatus: status },
        },
      });

      return order;
    });
  }
}
