import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/delivery",
    title: locale === "ar" ? "توصيل العطور في الإمارات والخليج | موسكيو" : "Perfume Delivery in the UAE & GCC | Muschio",
    description: locale === "ar" ? "اطلع على خيارات ومواعيد توصيل طلبات موسكيو داخل الإمارات ودول مجلس التعاون الخليجي." : "Review Muschio delivery options and estimated transit times across the UAE and GCC countries.",
  });
}

export default function DeliveryLayout({ children }: { children: ReactNode }) { return children; }
