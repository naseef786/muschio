import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/brands",
    title: locale === "ar" ? "دور العطور الفاخرة من الألف إلى الياء | موسكيو" : "Luxury Fragrance Houses A–Z | Muschio",
    description: locale === "ar" ? "استكشف دور العطور النيش والمصممين المنتقاة لدى موسكيو وتعرف على قصصها ومجموعاتها." : "Explore Muschio's A–Z directory of niche and designer fragrance houses, their stories, and curated perfume collections.",
  });
}

export default function BrandsLayout({ children }: { children: ReactNode }) { return children; }
