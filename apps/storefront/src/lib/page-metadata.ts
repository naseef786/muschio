import type { Metadata } from "next";

export type StorefrontLocale = "en" | "ar";

export const privateRouteMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.muschio.ae"
).replace(/\/$/, "");

type LocalizedMetadataOptions = {
  locale: StorefrontLocale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  index?: boolean;
};

function normalizePath(path: string) {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
  image,
  index = true,
}: LocalizedMetadataOptions): Metadata {
  const routePath = normalizePath(path);
  const canonical = `${SITE_URL}/${locale}${routePath}`;
  const socialImage = image ? absoluteUrl(image) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${SITE_URL}/en${routePath}`,
        ar: `${SITE_URL}/ar${routePath}`,
        "en-AE": `${SITE_URL}/en${routePath}`,
        "ar-AE": `${SITE_URL}/ar${routePath}`,
        "en-SA": `${SITE_URL}/en${routePath}`,
        "ar-SA": `${SITE_URL}/ar${routePath}`,
        "en-KW": `${SITE_URL}/en${routePath}`,
        "ar-KW": `${SITE_URL}/ar${routePath}`,
        "x-default": `${SITE_URL}/en${routePath}`,
      },
    },
    robots: {
      index,
      follow: index,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: locale === "ar" ? "موسكيو للعطور الفاخرة" : "Muschio Haute Parfumerie",
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      alternateLocale: locale === "ar" ? ["en_AE"] : ["ar_AE"],
      type: "website",
      ...(socialImage ? { images: [{ url: socialImage }] } : {}),
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}
