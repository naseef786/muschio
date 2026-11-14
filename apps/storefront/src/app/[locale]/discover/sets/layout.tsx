import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/discover/sets",
    title: locale === "ar" ? "مجموعات اكتشاف العطور | موسكيو" : "Fragrance Discovery Sets | Muschio",
    description: locale === "ar" ? "كوّن مجموعة عينات عطرية مختارة واكتشف عطرك القادم قبل اقتناء العبوة الكاملة." : "Build a curated perfume sample set and discover your next signature fragrance before choosing a full bottle.",
  });
}

export default function DiscoverySetsLayout({ children }: { children: ReactNode }) { return children; }
