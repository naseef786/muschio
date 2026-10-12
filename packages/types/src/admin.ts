import { z } from "zod";

export const AdminRoleEnum = z.enum([
  "SUPER_ADMIN",
  "CATALOG_MANAGER",
  "INVENTORY_MANAGER",
  "ORDER_MANAGER",
  "EDITOR"
]);
export type AdminRole = z.infer<typeof AdminRoleEnum>;

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: AdminRoleEnum,
  isActive: z.boolean().default(true),
  lastLoginAt: z.string().or(z.date()).optional().nullable(),
  createdAt: z.string().or(z.date()),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  action: z.string(), // e.g. "PRODUCT_UPDATE", "PRICE_OVERRIDE", "ORDER_REFUND"
  resourceType: z.string(),
  resourceId: z.string(),
  diff: z.record(z.any()).optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  excerptEn: z.string(),
  excerptAr: z.string(),
  contentEn: z.string(),
  contentAr: z.string(),
  authorName: z.string(),
  coverImageUrl: z.string().url(),
  readingTimeMinutes: z.number().int().positive().default(5),
  isPublished: z.boolean().default(true),
  featuredProductIds: z.array(z.string().uuid()).default([]),
  publishedAt: z.string().or(z.date()),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;
