import { prisma } from "../prisma";

export interface StoreSettingsData {
  instagramUrl: string;
  instagramHandle: string;
  whatsappPhone: string;
  whatsappNumber: string;
  whatsappDefaultMsg: string;
  tiktokUrl: string;
  tiktokHandle: string;
  twitterUrl: string;
  twitterHandle: string;
  youtubeUrl: string;
  conciergeEmail: string;
  conciergePhone: string;
  announcementBarEn: string;
  announcementBarAr: string;
  freeShippingThreshold: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettingsData = {
  instagramUrl: "https://www.instagram.com/muschio.parfums",
  instagramHandle: "@muschio.parfums",
  whatsappPhone: "+971 4 800 MUSCHIO",
  whatsappNumber: "97148006872",
  whatsappDefaultMsg: "Hello Muschio Concierge, I would like assistance with a fragrance recommendation.",
  tiktokUrl: "https://www.tiktok.com/@muschio.haute",
  tiktokHandle: "@muschio.haute",
  twitterUrl: "https://twitter.com/muschio_haute",
  twitterHandle: "@muschio_haute",
  youtubeUrl: "https://www.youtube.com/@muschiohaute",
  conciergeEmail: "concierge@muschio.luxury",
  conciergePhone: "+971 4 800 MUSCHIO",
  announcementBarEn: "COMPLIMENTARY WHITE-GLOVE GCC DELIVERY ON ORDERS OVER 500 AED · 100% AUTHENTIC MAISON FLACONS",
  announcementBarAr: "توصيل فاخر مجاني لكافة دول الخليج للطلبات فوق 500 درهم · عطور أصلية ومضمونة 100%",
  freeShippingThreshold: 500,
};

export class SettingsService {
  /**
   * Retrieves active store settings from PostgreSQL BusinessEvents ledger,
   * falling back to default GCC luxury configuration.
   */
  static async getSettings(): Promise<StoreSettingsData> {
    try {
      const event = await prisma.businessEvent.findFirst({
        where: {
          aggregateType: "SYSTEM",
          aggregateId: "store_settings",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!event || !event.payload || typeof event.payload !== "object") {
        return DEFAULT_STORE_SETTINGS;
      }

      return {
        ...DEFAULT_STORE_SETTINGS,
        ...(event.payload as any),
      };
    } catch (err) {
      console.warn("[SettingsService] Falling back to default settings:", err);
      return DEFAULT_STORE_SETTINGS;
    }
  }

  /**
   * Updates store settings and records an immutable audit ledger entry.
   */
  static async updateSettings(
    newSettings: Partial<StoreSettingsData>,
    adminUserId?: string
  ): Promise<StoreSettingsData> {
    const current = await this.getSettings();
    const updated: StoreSettingsData = {
      ...current,
      ...newSettings,
      freeShippingThreshold: Number(newSettings.freeShippingThreshold ?? current.freeShippingThreshold) || 500,
    };

    await prisma.businessEvent.create({
      data: {
        eventName: "STORE_SETTINGS_UPDATED",
        aggregateType: "SYSTEM",
        aggregateId: "store_settings",
        payload: updated as any,
      },
    });

    if (adminUserId) {
      await prisma.auditLog.create({
        data: {
          adminUserId,
          action: "STORE_SETTINGS_UPDATED",
          resourceType: "SETTINGS",
          resourceId: "store_settings",
          diff: updated as any,
        },
      }).catch((e) => console.warn("[SettingsService] AuditLog skipped:", e));
    }

    return updated;
  }
}
