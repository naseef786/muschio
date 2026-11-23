import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/orders",
    title: locale === "ar" ? "طلباتي وسجل المشتريات | موسكيو" : "My Orders & Receipts | Muschio",
    description:
      locale === "ar"
        ? "استعرض سجل طلبات العطور من موسكيو، وتتبع حالة الشحنات في الإمارات والخليج، واطلع على إيصالات الشراء والفواتير الضريبية."
        : "View your Muschio fragrance orders, track active shipments across the UAE and GCC, and download official tax invoices.",
    index: false,
  });
}

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return children;
}
