import { prisma } from "../prisma";

export class AuditService {
  /**
   * Fetch recent audit logs from PostgreSQL
   */
  static async getLogs(limit = 100) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Record an action in the immutable audit log table
   */
  static async log(data: {
    adminUserId?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    diff?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      let adminUserId = data.adminUserId;
      if (!adminUserId) {
        const superAdmin = await prisma.adminUser.findFirst({
          where: { role: "SUPER_ADMIN", isActive: true },
          select: { id: true },
        });
        if (superAdmin) adminUserId = superAdmin.id;
      }

      if (!adminUserId) {
        const anyAdmin = await prisma.adminUser.findFirst({
          select: { id: true },
        });
        if (anyAdmin) adminUserId = anyAdmin.id;
      }

      if (!adminUserId) return null;

      return await prisma.auditLog.create({
        data: {
          adminUserId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          diff: data.diff ?? undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      console.warn("[AuditService] Failed to record audit log:", err);
      return null;
    }
  }
}
