import { prisma } from "../prisma";
import { BannerSlot, HomepageSectionType } from "@prisma/client";

export class BannerService {
  // ─── PUBLIC STOREFRONT QUERIES ───────────────────────────

  /**
   * Get active banners for a given slot, filtered by scheduling window
   */
  static async getActiveBanners(slot?: BannerSlot) {
    const now = new Date();
    return prisma.banner.findMany({
      where: {
        isActive: true,
        ...(slot ? { slot } : {}),
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Get visible homepage sections with sort order
   */
  static async getVisibleSections() {
    return prisma.homepageSection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  // ─── ADMIN MANAGEMENT ───────────────────────────────────

  /**
   * List all banners (including inactive) for admin
   */
  static async getAllBanners() {
    return prisma.banner.findMany({
      orderBy: [{ slot: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Create a new banner
   */
  static async createBanner(data: {
    slot: BannerSlot;
    eyebrowEn?: string;
    eyebrowAr?: string;
    titleEn: string;
    titleAr: string;
    subtitleEn?: string;
    subtitleAr?: string;
    ctaTextEn?: string;
    ctaTextAr?: string;
    ctaUrl?: string;
    secondaryCtaTextEn?: string;
    secondaryCtaTextAr?: string;
    secondaryCtaUrl?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    overlayLabelEn?: string;
    overlayLabelAr?: string;
    sortOrder?: number;
    isActive?: boolean;
    startsAt?: string | Date;
    endsAt?: string | Date;
  }) {
    return prisma.banner.create({
      data: {
        slot: data.slot,
        eyebrowEn: data.eyebrowEn,
        eyebrowAr: data.eyebrowAr,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        subtitleEn: data.subtitleEn,
        subtitleAr: data.subtitleAr,
        ctaTextEn: data.ctaTextEn,
        ctaTextAr: data.ctaTextAr,
        ctaUrl: data.ctaUrl,
        secondaryCtaTextEn: data.secondaryCtaTextEn,
        secondaryCtaTextAr: data.secondaryCtaTextAr,
        secondaryCtaUrl: data.secondaryCtaUrl,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        overlayLabelEn: data.overlayLabelEn,
        overlayLabelAr: data.overlayLabelAr,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  /**
   * Update an existing banner
   */
  static async updateBanner(
    id: string,
    data: Partial<{
      slot: BannerSlot;
      eyebrowEn: string;
      eyebrowAr: string;
      titleEn: string;
      titleAr: string;
      subtitleEn: string;
      subtitleAr: string;
      ctaTextEn: string;
      ctaTextAr: string;
      ctaUrl: string;
      secondaryCtaTextEn: string;
      secondaryCtaTextAr: string;
      secondaryCtaUrl: string;
      imageUrl: string;
      mobileImageUrl: string;
      overlayLabelEn: string;
      overlayLabelAr: string;
      sortOrder: number;
      isActive: boolean;
      startsAt: string | Date | null;
      endsAt: string | Date | null;
    }>,
  ) {
    const updateData: Record<string, any> = { ...data };
    if (data.startsAt !== undefined) {
      updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    }
    if (data.endsAt !== undefined) {
      updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    }
    return prisma.banner.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a banner
   */
  static async deleteBanner(id: string) {
    return prisma.banner.delete({ where: { id } });
  }

  /**
   * Toggle banner active status
   */
  static async toggleBanner(id: string) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new Error("Banner not found");
    return prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });
  }

  // ─── HOMEPAGE SECTIONS MANAGEMENT ───────────────────────

  /**
   * Get all homepage sections (admin view, including hidden)
   */
  static async getAllSections() {
    return prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Upsert a homepage section configuration
   */
  static async upsertSection(data: {
    sectionType: HomepageSectionType;
    titleEn?: string;
    titleAr?: string;
    subtitleEn?: string;
    subtitleAr?: string;
    sortOrder?: number;
    isVisible?: boolean;
    config?: any;
  }) {
    return prisma.homepageSection.upsert({
      where: { sectionType: data.sectionType },
      create: {
        sectionType: data.sectionType,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        subtitleEn: data.subtitleEn,
        subtitleAr: data.subtitleAr,
        sortOrder: data.sortOrder ?? 0,
        isVisible: data.isVisible ?? true,
        config: data.config ?? {},
      },
      update: {
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.titleAr !== undefined ? { titleAr: data.titleAr } : {}),
        ...(data.subtitleEn !== undefined
          ? { subtitleEn: data.subtitleEn }
          : {}),
        ...(data.subtitleAr !== undefined
          ? { subtitleAr: data.subtitleAr }
          : {}),
        ...(data.sortOrder !== undefined
          ? { sortOrder: data.sortOrder }
          : {}),
        ...(data.isVisible !== undefined
          ? { isVisible: data.isVisible }
          : {}),
        ...(data.config !== undefined ? { config: data.config } : {}),
      },
    });
  }

  /**
   * Bulk reorder homepage sections
   */
  static async reorderSections(
    ordering: { sectionType: HomepageSectionType; sortOrder: number }[],
  ) {
    await prisma.$transaction(
      ordering.map(({ sectionType, sortOrder }) =>
        prisma.homepageSection.updateMany({
          where: { sectionType },
          data: { sortOrder },
        }),
      ),
    );
    return prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Toggle section visibility
   */
  static async toggleSection(sectionType: HomepageSectionType) {
    const section = await prisma.homepageSection.findUnique({
      where: { sectionType },
    });
    if (!section) throw new Error("Section not found");
    return prisma.homepageSection.update({
      where: { sectionType },
      data: { isVisible: !section.isVisible },
    });
  }
}
