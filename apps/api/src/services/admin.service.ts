import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../middleware/error-handler";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "super-secret-admin-jwt-key-muschio-luxury-perfumery-2026";

export class AdminService {
  static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ADMIN_JWT_SECRET,
      { expiresIn: "12h" }
    );

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

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockCount: lowStockInventories.length,
      lowStockItems: lowStockInventories,
      recentOrders,
    };
  }

  static async updateOrderStatus(orderId: string, status: any, adminUserId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId,
        action: "UPDATE_ORDER_STATUS",
        resourceType: "ORDER",
        resourceId: orderId,
        diff: { newStatus: status },
      },
    });

    return order;
  }
}
