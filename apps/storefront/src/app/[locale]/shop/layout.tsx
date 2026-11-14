import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/shop",
    title: locale === "ar" ? "تسوق العطور النيش الفاخرة | موسكيو" : "Shop Niche & Luxury Perfumes | Muschio",
    description: locale === "ar" ? "تسوق مجموعة موسكيو المنتقاة من العطور النيش الفاخرة والخلاصات النادرة من دور العطور العالمية." : "Shop Muschio's curated collection of niche perfumes, rare extraits, and luxury fragrances from distinguished fragrance houses.",
  });
}

export default function ShopLayout({ children }: { children: ReactNode }) { return children; }
