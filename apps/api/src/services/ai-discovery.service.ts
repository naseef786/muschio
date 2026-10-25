import { prisma } from "../prisma";
import {
  AIScentConsultationInput,
  AIScentConsultationResponse,
  AIScentRecommendationItem,
} from "@muschio/types";

export class AIScentDiscoveryService {
  static async consult(input: AIScentConsultationInput): Promise<AIScentConsultationResponse> {
    const { query, preferredNotes = [], preferredFamilies = [], gender, locale = "en" } = input;

    // Fetch published catalog with brand, notes, and variants for grounding
    const allProducts = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        brand: true,
        scentFamily: true,
        notes: {
          include: { note: true },
        },
        accords: {
          include: { accord: true },
        },
        variants: {
          include: { inventory: true },
          orderBy: { price: "asc" },
        },
      },
    });

    // Score and rank catalog products against query, notes, families, gender
    const scoredProducts = allProducts.map((product) => {
      let score = 50; // base score
      const matchingAccords: string[] = [];

      // Note matching
      for (const pn of product.notes) {
        const noteName = pn.note.nameEn.toLowerCase();
        const noteSlug = pn.note.slugEn.toLowerCase();
        const queryLower = query.toLowerCase();

        if (
          preferredNotes.some((n) => noteName.includes(n.toLowerCase()) || noteSlug.includes(n.toLowerCase())) ||
          queryLower.includes(noteName) ||
          queryLower.includes(noteSlug)
        ) {
          score += 15 * (pn.prominence / 5);
          matchingAccords.push(locale === "ar" ? pn.note.nameAr : pn.note.nameEn);
        }
      }

      // Scent family matching
      if (
        product.scentFamily &&
        preferredFamilies.some(
          (f) =>
            product.scentFamily!.nameEn.toLowerCase().includes(f.toLowerCase()) ||
            product.scentFamily!.slug.toLowerCase().includes(f.toLowerCase())
        )
      ) {
        score += 20;
      }

      // Gender affinity
      if (gender && (product.gender === gender || product.gender === "UNISEX")) {
        score += 10;
      }

      // Clamp match percentage to 65 - 98
      const matchPercentage = Math.min(98, Math.max(65, Math.round(score)));

      return {
        product,
        matchPercentage,
        matchingAccords: Array.from(new Set(matchingAccords)),
      };
    });

    // Sort by match percentage
    scoredProducts.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const topMatches = scoredProducts.slice(0, 3);

    const recommendations: AIScentRecommendationItem[] = topMatches.map((item) => {
      const p = item.product;
      const topVariant = p.variants.find((v) => !v.isSampleVial) || p.variants[0];
      const sku = topVariant ? topVariant.sku : `SKU-${p.slug}`;
      const isAmouage = p.slug === "amouage-interlude-53-man";
      const image = isAmouage
        ? "/amouage-placeholder.svg"
        : (p.images[0] || "/product-placeholder.svg");

      return {
        sku,
        slug: p.slug,
        productName: locale === "ar" ? p.nameAr : p.nameEn,
        brandName: p.brand.name,
        concentration: p.concentration.replaceAll("_", " "),
        price: topVariant?.price ? Number(topVariant.price) : 1850,
        image,
        matchReasonEn: `Harmonizes with your affinity for ${
          item.matchingAccords.length > 0 ? item.matchingAccords.join(" & ") : p.scentFamily?.nameEn || "warm resins"
        }. Opens with captivating radiance that transitions smoothly into rich, enduring base accords.`,
        matchReasonAr: `يتناغم بشكل استثنائي مع ذوقك في نوتات ${
          item.matchingAccords.length > 0 ? item.matchingAccords.join(" و ") : p.scentFamily?.nameAr || "العطور الشرقية الفاخرة"
        }. يمنحك هالة آسرة وثباتاً ملكياً يدوم طويلاً.`,
        accordOverlap: item.matchingAccords.length > 0 ? item.matchingAccords : p.accords.map((a) => a.accord.nameEn).slice(0, 3),
        matchPercentage: item.matchPercentage,
      };
    });

    const analysisEn =
      locale === "en"
        ? `Based on your preference for "${query}", we have curated these high-concentration niche masterpieces that embody your desired olfactory mood, balanced with aristocratic projection and skin chemistry harmony.`
        : `بناءً على تفضيلك لـ "${query}"، قمنا باختيار هذه التحف العطرية النيش ذات التركيز العالي التي تجسد ذوقك الرفيع بتناغم ملكي وفواح.`;

    const analysisAr =
      `بناءً على تفضيلك لـ "${query}"، قمنا باختيار هذه التحف العطرية النيش ذات التركيز العالي التي تجسد ذوقك الرفيع بتناغم ملكي وفواح.`;

    return {
      analysisEn,
      analysisAr,
      recommendations,
      groundedProducts: topMatches.map((t) => t.product as any),
    };
  }
}
