import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/order-confirmation",
    title: locale === "ar" ? "تأكيد الطلب وإيصال الشراء | موسكيو" : "Order Confirmation & Receipt | Muschio",
    description:
      locale === "ar"
        ? "تفاصيل تأكيد طلبك من موسكيو، وإيصال الشراء، وتفاصيل تتبع الشحنة."
        : "Your Muschio order confirmation, purchase receipt, and shipment tracking details.",
    index: false,
  });
}

export default function OrderConfirmationLayout({ children }: { children: ReactNode }) {
  return children;
}
