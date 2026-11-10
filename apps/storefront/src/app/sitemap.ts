import { MetadataRoute } from "next";
import { prisma } from "@muschio/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_STORE_URL ||
  process.env.STOREFRONT_URL ||
  "https://www.muschio.ae";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];
  const locales = ["en", "ar"];

  // Static high-priority pages
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/brands", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/notes", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/discover/sets", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/discover/ai", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guide", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/delivery", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/journal", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  for (const page of staticPages) {
    for (const locale of locales) {
      routes.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${page.path}`,
            ar: `${BASE_URL}/ar${page.path}`,
          },
        },
      });
    }
  }

  // Dynamic Product Pages from Database
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    for (const p of products) {
      for (const locale of locales) {
        routes.push({
          url: `${BASE_URL}/${locale}/product/${p.slug}`,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.9,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/product/${p.slug}`,
              ar: `${BASE_URL}/ar/product/${p.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Sitemap Generator] Database products lookup fallback:", err);
  }

  // Dynamic Brand Pages from Database
  try {
    const brands = await prisma.brand.findMany({
      select: { slug: true, updatedAt: true },
    });

    for (const b of brands) {
      for (const locale of locales) {
        routes.push({
          url: `${BASE_URL}/${locale}/brands/${b.slug}`,
          lastModified: b.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/brands/${b.slug}`,
              ar: `${BASE_URL}/ar/brands/${b.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Sitemap Generator] Database brands lookup fallback:", err);
  }

  // Dynamic Note Pages from Database
  try {
    const notes = await prisma.note.findMany({
      select: { slugEn: true, updatedAt: true },
    });

    for (const n of notes) {
      if (!n.slugEn) continue;
      for (const locale of locales) {
        routes.push({
          url: `${BASE_URL}/${locale}/notes/${n.slugEn}`,
          lastModified: n.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/notes/${n.slugEn}`,
              ar: `${BASE_URL}/ar/notes/${n.slugEn}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Sitemap Generator] Database notes lookup fallback:", err);
  }

  // Dynamic Collection Pages from Database
  try {
    const collections = await prisma.collection.findMany({
      select: { slug: true, updatedAt: true },
    });

    for (const c of collections) {
      for (const locale of locales) {
        routes.push({
          url: `${BASE_URL}/${locale}/shop?collection=${c.slug}`,
          lastModified: c.updatedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/shop?collection=${c.slug}`,
              ar: `${BASE_URL}/ar/shop?collection=${c.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Sitemap Generator] Database collections lookup fallback:", err);
  }

  return routes;
}
