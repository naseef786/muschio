import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/journal",
    title: locale === "ar" ? "مجلة موسكيو للعطور | موسكيو" : "The Muschio Fragrance Journal",
    description: locale === "ar" ? "مقالات وقصص وأدلة متخصصة في فن العطور ودورها ومكوناتها وطقوس اكتشافها." : "Read expert essays, stories, and guides on perfume houses, ingredients, fragrance craft, and scent discovery.",
  });
}

export default function JournalLayout({ children }: { children: ReactNode }) { return children; }
