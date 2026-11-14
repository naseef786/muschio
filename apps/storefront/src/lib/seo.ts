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
    name: "Muschio",
    url: CANONICAL_DOMAIN,
    description:
      "An online fragrance catalog and discovery platform serving English and Arabic audiences.",
  };
}
