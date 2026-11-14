import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/guide",
    title: locale === "ar" ? "دليل العطور: النوتات والتركيز والثبات | موسكيو" : "Fragrance Guide: Notes, Strength & Wear | Muschio",
    description: locale === "ar" ? "تعلم أساسيات الهرم العطري والعائلات والتركيز والثبات لاختيار العطر المناسب لك." : "Learn fragrance pyramids, scent families, concentrations, longevity, and practical ways to choose and wear perfume.",
  });
}

export default function GuideLayout({ children }: { children: ReactNode }) { return children; }
