import { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_STORE_URL ||
  process.env.STOREFRONT_URL ||
  "https://www.muschio.ae"
).replace(/\/$/, "");

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
          "/*/account",
          "/*/orders",
          "/*/checkout",
          "/*/cart",
          "/*/wishlist",
          "/*/compare",
          "/*/track",
          "/*/order-confirmation",
          "/*/search",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

