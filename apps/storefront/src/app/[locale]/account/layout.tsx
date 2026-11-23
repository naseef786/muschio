import type { ReactNode } from "react";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/account",
    title: locale === "ar" ? "حسابي والملف الشخصي | موسكيو" : "My Account & Profile | Muschio",
    description:
      locale === "ar"
        ? "إدارة حسابك في موسكيو، والعناوين المحفوظة، وسجل الطلبات، ونقاط المكافآت."
        : "Manage your Muschio customer profile, saved delivery addresses, order history, and reward points.",
    index: false,
  });
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
