import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/wishlist",
    title: locale === "ar" ? "قائمة المفضلة | موسكيو" : "My Wishlist | Muschio",
    description:
      locale === "ar"
        ? "احفظ عطورك المفضلة وتوليفاتك المختارة للرجوع إليها لاحقاً وطلبها بسهولة."
        : "Save your favorite luxury fragrances and curated scents for quick reference and future purchase.",
    index: false,
  });
}

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children;
}
