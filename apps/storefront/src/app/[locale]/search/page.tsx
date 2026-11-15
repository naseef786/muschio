import React from "react";
import { prisma } from "@muschio/api";
import { SearchPageClient } from "./SearchPageClient";
import { buildLocalizedMetadata, type StorefrontLocale } from "../../../lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: StorefrontLocale }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    path: "/search",
    title: locale === "ar" ? "البحث عن العطور | موسكيو" : "Search Fragrances | Muschio",
    description: locale === "ar" ? "ابحث في مجموعة موسكيو من العطور والعلامات والنوتات العطرية." : "Search Muschio's fragrance collection by perfume, brand, note, or scent family.",
    index: false,
  });
}

export default async function SearchPage(props: {
  params: Promise<{ locale: "en" | "ar" }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale }, searchParams, families] = await Promise.all([
    props.params,
    props.searchParams,
    prisma.scentFamily.findMany({ orderBy: { nameEn: "asc" } }).catch(() => []),
  ]);

  return (
    <SearchPageClient
      locale={locale}
      initialQuery={searchParams.q || ""}
      initialFamilies={families.map((family) => ({
        slug: family.slug,
        nameEn: family.nameEn,
        nameAr: family.nameAr || family.nameEn,
      }))}
    />
  );
}
