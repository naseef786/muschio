import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/track",
    title: locale === "ar" ? "تتبع حالة الطلب والشحنة | موسكيو" : "Track Order & Live Shipment Status | Muschio",
    description:
      locale === "ar"
        ? "تتبع شحنة طلبك من موسكيو مباشرة مع تحديثات شركات الشحن في الإمارات ودول مجلس التعاون الخليجي."
        : "Track your Muschio luxury fragrance delivery in real time with live courier updates across the UAE and GCC.",
    index: false,
  });
}

export default function TrackLayout({ children }: { children: ReactNode }) {
  return children;
}
