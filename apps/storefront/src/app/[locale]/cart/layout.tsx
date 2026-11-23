import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/cart",
    title: locale === "ar" ? "حقيبة التسوق | موسكيو" : "Shopping Bag | Muschio",
    description:
      locale === "ar"
        ? "استعرض المنتجات المختارة في حقيبة التسوق، واحسب الشحن المجاني، واستكمل طلبك بكل أمان."
        : "Review your selected fragrances in your shopping bag, calculate free shipping, and checkout securely.",
    index: false,
  });
}

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
