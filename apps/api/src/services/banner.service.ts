import { prisma } from "../prisma";
import { BannerSlot, HomepageSectionType } from "@prisma/client";

export class BannerService {
  static readonly DEFAULT_SECTIONS: Array<{
    sectionType: HomepageSectionType;
    titleEn: string;
    titleAr: string;
    sortOrder: number;
    isVisible: boolean;
  }> = [
    { sectionType: "HERO_BANNER", titleEn: "Campaign Hero", titleAr: "الواجهة الرئيسية", sortOrder: 0, isVisible: true },
    { sectionType: "DISCOVERY_STRIP", titleEn: "Quick Category Jump", titleAr: "الاستكشاف السريع", sortOrder: 1, isVisible: true },
    { sectionType: "FEATURED_PRODUCTS", titleEn: "Curated Masterpieces", titleAr: "المختارات المميزة", sortOrder: 2, isVisible: true },
    { sectionType: "HOUSES_GRID", titleEn: "Shop by Fragrance House", titleAr: "تسوق حسب الدار", sortOrder: 3, isVisible: true },
    { sectionType: "NOTES_GRID", titleEn: "Explore by Key Notes", titleAr: "المكتبة العطرية", sortOrder: 4, isVisible: true },
    { sectionType: "CUSTOM_BANNER", titleEn: "Promotional Offer & Deal Banner", titleAr: "عروض وحملات خاصة", sortOrder: 5, isVisible: true },
    { sectionType: "DISCOVERY_SETS", titleEn: "Bespoke Discovery Sets", titleAr: "مجموعات العينات", sortOrder: 6, isVisible: true },
    { sectionType: "JOURNAL_FEATURE", titleEn: "The Muschio Journal", titleAr: "مجلة موسكيو", sortOrder: 7, isVisible: true },
    { sectionType: "TRUST_INDICATORS", titleEn: "Service Guarantees & Trust Bar", titleAr: "ضمانات الخدمة والفخامة", sortOrder: 8, isVisible: true },
  ];

  static async ensureDefaultSections() {
    try {
      const count = await prisma.homepageSection.count();
      if (count === 0) {
        await prisma.$transaction(
          BannerService.DEFAULT_SECTIONS.map((s) =>
            prisma.homepageSection.upsert({
              where: { sectionType: s.sectionType },
              create: s,
              update: {},
            }),
          ),
        );
      }
    } catch (e) {
      console.warn("Could not ensure default homepage sections:", e);
    }
  }

  static async ensureDefaultBanners() {
    try {
      const count = await prisma.banner.count();
      if (count === 0) {
        await prisma.banner.createMany({
          data: [
            {
              slot: "HERO_SLIDER",
              eyebrowEn: "HAUTE PARFUMERIE · ARABIAN GULF",
              eyebrowAr: "دار العطور الراقية · الخليج العربي",
              titleEn: "The Art of | Noble Sillage",
              titleAr: "فن | الحضور المهيب",
              subtitleEn: "Curating the world's most formidable extraits de parfum, aged attars, and raw olfactory essences for the connoisseurs of the Gulf.",
              subtitleAr: "ننتقي أرقى خلاصات العطور العالمية المعتقة والزيوت النادرة لعشاق العطور الراقية في الخليج العربي.",
              ctaTextEn: "Shop the Collection",
              ctaTextAr: "تسوق المجموعة",
              ctaUrl: "/shop",
              secondaryCtaTextEn: "AI Sommelier",
              secondaryCtaTextAr: "مستشار العطور",
              secondaryCtaUrl: "/discover/ai",
              imageUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1400&q=85",
              overlayLabelEn: "MUSCHIO SELECTION / 2026",
              overlayLabelAr: "مختارات موسكيو / ٢٠٢٦",
              sortOrder: 0,
              isActive: true,
            },
            {
              slot: "CAMPAIGN_MID",
              eyebrowEn: "LIMITED PROMOTIONAL OFFER · EXCLUSIVE DEALS",
              eyebrowAr: "عرض ترويجي حصري · صفقات خاصة",
              titleEn: "Private Client Reserve | Up to 20% Off",
              titleAr: "مختارات كبار الشخصيات | خصم حتى ٢٠٪",
              subtitleEn: "Acquire rare artisanal extraits and pure parfums with complimentary white-glove courier delivery across the GCC.",
              subtitleAr: "اقتنِ أنقى خلاصات العطور النيش النادرة مع توصيل مبرد مجاني لكافة مدن الخليج العربي.",
              ctaTextEn: "Explore Privé Deals",
              ctaTextAr: "استكشف العروض الحصرية",
              ctaUrl: "/shop?deal=true",
              imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=85",
              overlayLabelEn: "VIP DEAL CODE: MUSCHIO20",
              overlayLabelAr: "رمز العرض: MUSCHIO20",
              sortOrder: 1,
              isActive: true,
            },
            {
              slot: "PROMO_STRIP",
              eyebrowEn: "SPECIAL OFFER",
              eyebrowAr: "عرض خاص",
              titleEn: "Complimentary 5-Piece Maison Discovery Box on Orders Over 850 AED",
              titleAr: "صندوق عينات فاخر مجاني (٥ عينات) عند الطلب بقيمة أكثر من ٨٥٠ د.إ",
              ctaTextEn: "Claim Offer",
              ctaTextAr: "استفد من العرض",
              ctaUrl: "/shop",
              imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85",
              sortOrder: 2,
              isActive: true,
            },
          ],
        });
      }
    } catch (e) {
      console.warn("Could not ensure default banners:", e);
    }
  }

  // ─── PUBLIC STOREFRONT QUERIES ───────────────────────────

  /**
   * Get active banners for a given slot, filtered by scheduling window
   */
  static async getActiveBanners(slot?: BannerSlot) {
    await BannerService.ensureDefaultBanners();
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
    await BannerService.ensureDefaultSections();
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
    await BannerService.ensureDefaultBanners();
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
    await BannerService.ensureDefaultSections();
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
