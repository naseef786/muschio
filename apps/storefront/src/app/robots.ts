import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_STORE_URL || process.env.STOREFRONT_URL || "https://muschio.luxury";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/*/admin",
          "/account",
          "/*/account",
          "/checkout",
          "/*/checkout",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

