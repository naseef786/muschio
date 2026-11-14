import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/discover/ai",
    title: locale === "ar" ? "اكتشف عطرك المناسب | موسكيو" : "Find Your Fragrance Match | Muschio",
    description: locale === "ar" ? "صف ذوقك ومزاجك لتحصل على ترشيحات عطرية شخصية من مجموعة موسكيو." : "Describe your taste and mood to receive personal fragrance recommendations from the Muschio collection.",
  });
}

export default function AiDiscoveryLayout({ children }: { children: ReactNode }) { return children; }
