/**
 * Muschio Dubai & GCC Luxury SEO & Structured Data Engine
 * Generates authoritative JSON-LD graphs and metadata tailored for Dubai, UAE, and GCC haute perfumery search intent.
 */

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

export function generateProductJsonLd(params: ProductJsonLdParams, locale = "en") {
  const currency = params.currency || "AED";
  const url = `https://muschio.luxury/${locale}/product/${params.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    image: params.images,
    sku: params.sku,
    brand: {
      "@type": "Brand",
      name: params.brand,
    },
    category: "Haute Parfumerie & Luxury Niche Fragrance",
    countryOfOrigin: {
      "@type": "Country",
      name: params.countryOfOrigin || "France",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: params.price.toFixed(2),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: params.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Muschio Haute Parfumerie",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["AE", "SA", "QA", "KW", "BH", "OM"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: ["AE", "SA", "QA", "KW", "BH", "OM"],
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: params.ratingValue || 4.95,
      reviewCount: params.reviewCount || 48,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://muschio.luxury${item.url}`,
    })),
  };
}

export function generateFaqJsonLd(locale = "en") {
  const isAr = locale === "ar";

  const faqs = isAr
    ? [
        {
          q: "هل جميع عطور مسكيو أصلية ومضمونة 100%؟",
          a: "نعم، جميع العطور والخلاصات المتوفرة في مسكيو أصلية 100% ومستوردة مباشرة من الدور العالمية الملكية مثل أمواج، روجا دوف، كيركيدجان، وزيدجوف.",
        },
        {
          q: "كم يستغرق التوصيل داخل دبي ودولة الإمارات؟",
          a: "نقدم خدمة التوصيل في نفس اليوم لمدينة دبي للطلبات قبل الساعة 2 ظهراً، والتوصيل السريع خلال 24 ساعة لكافة إمارات الدولة.",
        },
        {
          q: "هل يتوفر الدفع بالتقسيط عبر تابي وتمارا؟",
          a: "نعم، يمكنك تقسيط مشترياتك العطرية الفاخرة على 4 دفعات ميسرة عبر تابي أو تمارا بدون أي فوائد أو رسوم إضافية.",
        },
      ]
    : [
        {
          q: "Are all Muschio fragrances 100% authentic and official allocations?",
          a: "Yes. Every single extrait, bottle, and sample vial in the Muschio vault is 100% authentic, sourced directly through authorized master distributor allocations with certificate of origin provenance.",
        },
        {
          q: "What are the delivery timelines for Dubai and the GCC?",
          a: "We offer White-Glove VIP Same-Day delivery across Dubai for orders placed before 2:00 PM, Next-Day delivery for Abu Dhabi, Sharjah and Northern Emirates, and 2-3 business days express across Saudi Arabia, Qatar, and Kuwait via DHL Express.",
        },
        {
          q: "Are Tabby and Tamara installment plans supported?",
          a: "Yes. You can split your purchase into 4 equal, interest-free monthly installments via Tabby or Tamara at checkout with 0% markup.",
        },
      ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LuxuryStore",
    name: "Muschio Haute Parfumerie",
    url: "https://muschio.luxury",
    logo: "https://muschio.luxury/images/logo.png",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    description: "Dubai's premier destination for rare niche extraits de parfum, artisanal aged attars, and bespoke olfactory consultation in the Arabian Gulf.",
    sameAs: [
      "https://www.instagram.com/muschio.parfums",
      "https://www.tiktok.com/@muschio.haute",
      "https://twitter.com/muschio_haute",
      "https://wa.me/97148006872",
      "https://www.youtube.com/@muschiohaute",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Fashion Avenue, The Dubai Mall",
      addressLocality: "Downtown Dubai",
      addressRegion: "Dubai",
      postalCode: "00000",
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "25.1972",
      longitude: "55.2744",
    },
    telephone: "+971-4-800-MUSCHIO",
    priceRange: "$$$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "10:00",
        closes: "23:00",
      },
    ],
  };
}

