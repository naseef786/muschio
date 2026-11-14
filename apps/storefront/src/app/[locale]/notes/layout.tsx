import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/notes",
    title: locale === "ar" ? "دليل النوتات العطرية | موسكيو" : "Fragrance Notes Directory | Muschio",
    description: locale === "ar" ? "تعرف على النوتات والمكونات العطرية واكتشف العطور التي تبرز كل مكون لدى موسكيو." : "Explore fragrance notes and ingredients, then discover Muschio perfumes that showcase each scent profile.",
  });
}

export default function NotesLayout({ children }: { children: ReactNode }) { return children; }
