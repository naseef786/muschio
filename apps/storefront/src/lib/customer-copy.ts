export const productCardCopy = {
  en: { viewProduct: "View product", gallery: "Product images", previousImage: "Previous image", nextImage: "Next image", image: "Image", of: "of" },
  ar: { viewProduct: "عرض المنتج", gallery: "صور المنتج", previousImage: "الصورة السابقة", nextImage: "الصورة التالية", image: "الصورة", of: "من" },
} as const;

const PLAIN_ENGLISH: Record<string, string> = {
  "Shop Fragrance": "Shop",
  "The Collection": "Shop",
  "The Houses": "Brands",
  "Curated Haute Maisons": "Featured Brands",
  "Olfactory Tiers": "Fragrance Types",
  "Haute Niche Extraits": "Niche Fragrances",
  "Pure Extrait": "Highly Concentrated",
  "Designer Privé": "Designer Fragrances",
  "Bespoke Discovery": "Find Your Scent",
  "AI Scent Sommelier": "Scent Finder",
  "Discovery Sets": "Sample Sets",
  "5 x 2ml Discovery Sets": "Sample Sets",
  "Explore Olfactory Compendium →": "Fragrance Guide →",
  "Discovery Vault": "Explore",
  "The Fragrance Compendium": "Fragrance Guide",
  "Olfactory Notes Library": "Fragrance Notes",
  "Scent Notes Library": "Fragrance Notes",
  "About The Maison": "About Us",
  "About the Maison": "About Us",
  "Contact & VIP Concierge": "Contact Us",
  "Track Order & Dispatch": "Track Order",
  "Client Vault & Account": "My Account",
  "Concierge & Socials": "Help & Social Media",
  "WhatsApp VIP Concierge": "WhatsApp Help",
  "VIP Concierge": "Customer Help",
  "Olfactory Loyalty Credit": "Rewards Credit",
  "Olfactory Loyalty Rewards": "Rewards Earned",
  "Flacons Curated": "Fragrances",
  "Artisanal Discovery Box": "Sample Set",
  "Add Discovery Box to Bag": "Add Sample Set to Bag",
  "100% Authentic Maison Flacons": "100% Authentic Bottles",
  "100% Authentic Maison Vials": "100% Authentic Samples",
  "Climate-controlled transit": "Temperature-Safe Shipping",
  "Guaranteed GCC Delivery": "UAE & Gulf Delivery",
  "Dispatch": "Shipping",
  "Maison": "Brand",
  "Flacon": "Bottle",
  "Olfactory Matrix": "Fragrance Details",
  "Harmonious Olfactory Overlap": "Shared Fragrance Notes",
  "Maison Flacon": "Brand and Bottle",
  "Longevity & Sillage": "Lasting Power & Scent Trail",
  "Maison & Provenance": "Brand & Origin",
};

export function repairMojibake(value: string): string {
  if (!/[ÃÂØÙ]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from(value, (character) => character.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    return decoded.includes("�") ? value : decoded;
  } catch {
    return value;
  }
}

export function customerCopy(en: string, arabic: string, isArabic: boolean): string {
  return isArabic ? repairMojibake(arabic) : (PLAIN_ENGLISH[en] || en);
}
