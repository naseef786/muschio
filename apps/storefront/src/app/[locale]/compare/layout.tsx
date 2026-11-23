import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/compare",
    title: locale === "ar" ? "مقارنة العطور | موسكيو" : "Compare Fragrances | Muschio",
    description:
      locale === "ar"
        ? "قارن بين العطور المختلفة من حيث النوتات العطرية، والتركيز، وبلد المنشأ، والحجم."
        : "Compare luxury fragrances side-by-side by fragrance notes, concentration, brand origin, and bottle size.",
    index: false,
  });
}

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}
