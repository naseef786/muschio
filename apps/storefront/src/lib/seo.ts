/**
 * Structured-data helpers.
 *
 * Keep this module evidence-based: optional facts are emitted only when the
 * caller supplies a value obtained from the catalog or another verified
 * backend source. Customer-facing policy and business claims do not belong
 * here as defaults.
 */

const CANONICAL_DOMAIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.muschio.ae"
).replace(/\/$/, "");

export interface ProductJsonLdParams {
  name: string;
  description: string;
  slug: string;
  brand: string;
  images: string[];
  sku: string;
  price: number;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  concentration?: string;
  countryOfOrigin?: string;
  inStock?: boolean;
}

export function generateProductJsonLd(
  params: ProductJsonLdParams,
  locale = "en",
) {
  const currency = params.currency || "AED";
  const url = `${CANONICAL_DOMAIN}/${locale}/product/${params.slug}`;
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: params.name,
    description: params.description,
    image: params.images.filter(Boolean),
    sku: params.sku,
    brand: {
      "@type": "Brand",
      name: params.brand,
    },
  };

  if (params.concentration) {
    product.additionalProperty = {
      "@type": "PropertyValue",
      name: "Concentration",
      value: params.concentration,
    };
  }

  if (params.countryOfOrigin) {
    product.countryOfOrigin = {
      "@type": "Country",
      name: params.countryOfOrigin,
    };
  }

  if (Number.isFinite(params.price) && params.price > 0) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: params.price.toFixed(2),
      seller: {
        "@type": "Organization",
        "@id": `${CANONICAL_DOMAIN}/#organization`,
        name: "Muschio",
      },
    };

    if (typeof params.inStock === "boolean") {
      offer.availability = params.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    }

    product.offers = offer;
  }

  if (
    typeof params.ratingValue === "number" &&
    Number.isFinite(params.ratingValue) &&
    params.ratingValue > 0 &&
    typeof params.reviewCount === "number" &&
    Number.isInteger(params.reviewCount) &&
    params.reviewCount > 0
  ) {
    product.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: params.ratingValue,
      reviewCount: params.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return product;
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${CANONICAL_DOMAIN}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}

export interface VerifiedFaq {
  question: string;
  answer: string;
}

export function generateFaqJsonLd(faqs: VerifiedFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${CANONICAL_DOMAIN}/#organization`,
    name: "Muschio Haute Parfumerie",
    url: CANONICAL_DOMAIN,
    logo: `${CANONICAL_DOMAIN}/icon.svg`,
    description:
      "Haute Parfumerie & rare niche fragrance house serving Dubai, the UAE, and the Arabian Gulf.",
    sameAs: [
      "https://www.instagram.com/muschio_parfums",
      "https://www.tiktok.com/@muschio_parfums",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+971-4-000-0000",
      contactType: "customer service",
      areaServed: ["AE", "SA", "KW", "QA", "BH", "OM"],
      availableLanguage: ["English", "Arabic"],
    },
  };
}

export function generateWebSiteJsonLd(locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_DOMAIN}/#website`,
    url: `${CANONICAL_DOMAIN}/${locale}`,
    name: locale === "ar" ? "موسكيو للعطور الفاخرة" : "Muschio Haute Parfumerie",
    alternateName: [
      "Muschio",
      "موسكيو",
      "Muschio Perfumes Dubai",
      "Muschio UAE",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${CANONICAL_DOMAIN}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ArticleJsonLdParams {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  datePublished?: string | Date;
  dateModified?: string | Date;
  authorName?: string;
  locale?: string;
}

export function generateArticleJsonLd(params: ArticleJsonLdParams) {
  const locale = params.locale || "en";
  const url = `${CANONICAL_DOMAIN}/${locale}/journal/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: params.title,
    description: params.description,
    url,
    ...(params.imageUrl ? { image: [params.imageUrl] } : {}),
    ...(params.datePublished ? { datePublished: new Date(params.datePublished).toISOString() } : {}),
    ...(params.dateModified ? { dateModified: new Date(params.dateModified).toISOString() } : {}),
    author: {
      "@type": "Person",
      name: params.authorName || (locale === "ar" ? "محرر موسكيو للعطور" : "Muschio Olfactory Editor"),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${CANONICAL_DOMAIN}/#organization`,
      name: "Muschio",
      logo: {
        "@type": "ImageObject",
        url: `${CANONICAL_DOMAIN}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * Serializes JSON-LD safely for embedding inside <script type="application/ld+json">,
 * escaping characters that could prematurely close the script tag.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

