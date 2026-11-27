// Pro SEO Utility functions, CSV Parser, Excel Parser/Exporter, and Meta Generators for Muschio Admin

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  type: "NICHE" | "DESIGNER";
  countryEn: string;
  countryAr: string;
  year: number;
  storyEn: string;
  storyAr: string;
  perfumer?: string;
  metaTitle: string;
  metaDescription: string;
  logoUrl?: string;
  heroImageUrl?: string;
  perfumesCount: number;
}

export interface NoteItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  family: string;
  originEn?: string;
  originAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitle?: string;
  metaDescription?: string;
  heroImageUrl?: string;
  thumbnailUrl?: string;
  status: "PUBLISHED" | "DRAFT";
  perfumesCount: number;
}

export interface ProductVariantItem {
  id?: string;
  sku?: string;
  volume: string | number; // e.g. 30, 50, 100 or "30ml", "50ml", "100ml"
  volumeMl?: number;
  basePrice?: number | string; // Base Price / Original MRP in AED
  regularPrice?: number | string; // Original Price / MRP alias
  originalPrice?: number | string; // alias
  price: number | string; // Selling / Discounted Price in AED
  discountPrice?: number | string | null;
  salePrice?: number | string | null;
  compareAtPrice?: number | string | null;
  stock?: number; // Stock Quantity alias
  stockQuantity: number;
  warehouse?: string; // Warehouse location/identifier, e.g. "DXB-MAIN", "RUH-HUB"
  isDefault?: boolean;
  isSampleVial?: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  slug: string;
  brand: string;
  brandSlug?: string;
  scentFamily?: string;
  perfumer?: string;
  perfumers?: string[];
  perfumerBio?: string;
  concentration?: string;
  gender?: string;
  volumeMl?: number;
  price: string;
  costPrice?: string;
  stock: number;
  testerStock: number;
  reserved: number;
  warehouse: string;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  taglineEn?: string;
  taglineAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  images?: string[];
  imageAlt?: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  variants?: ProductVariantItem[];
  tags?: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    colorHex?: string | null;
    isFeatured?: boolean;
  }>;
  tagIds?: string[];
  scentProfiles?: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    colorHex?: string | null;
    imageUrl?: string | null;
    isFeatured?: boolean;
    sortOrder?: number;
  }>;
  scentProfileIds?: string[];
  scentProfileNames?: string[];
  tagNames?: string[];
  longevity?: string;
  sillage?: string;
  countryOfOrigin?: string;
  releaseYear?: number;
  isFeatured?: boolean;
}

export interface TagItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  colorHex?: string | null;
  isFeatured: boolean;
  productCount?: number;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionItem {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  heroImageUrl?: string;
  isFeatured: boolean;
  productCount?: number;
  productIds?: string[];
  products?: Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameAr?: string;
    brand: string;
    price: number | string;
    image: string;
    concentration?: string;
    displayOrder?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParsedCsvProduct {
  sku: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  brand: string;
  brandSlug: string;
  scentFamily: string;
  scentProfiles: string[];
  tags: string[];
  perfumer?: string;
  perfumerBio?: string;
  concentration: string;
  gender: string;
  volumeMl: number;
  isDefaultVariant: boolean;
  extraVariants: Array<{
    sku: string;
    volume: string;
    volumeMl: number;
    price: string;
    compareAtPrice?: string | null;
    discountPrice?: string | null;
    stockQuantity: number;
    warehouse: string;
    isDefault: boolean;
  }>;
  price: string;
  compareAtPrice?: string | null;
  discountPrice?: string | null;
  costPrice: string;
  stock: number;
  testerStock: number;
  warehouse: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevity?: string;
  sillage?: string;
  countryOfOrigin?: string;
  releaseYear?: number;
  taglineEn: string;
  taglineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
  images: string[];
  imageAlt: string;
  isFeatured: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  // SEO Validation attributes
  validationStatus: "VALID" | "WARNING" | "ERROR";
  validationMessages: string[];
  isNewBrand: boolean;
  newNotesCount: number;
  newNotes: string[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateProductMetaTitle(nameEn: string, brand: string): string {
  return `${nameEn} by ${brand} | Authentic Luxury Fragrance UAE & GCC`;
}

export function generateProductMetaDescription(
  nameEn: string,
  brand: string,
  concentration: string = "Extrait de Parfum",
  topNotes: string[] = []
): string {
  const notesStr = topNotes.length > 0 ? ` with opening notes of ${topNotes.join(", ")}` : "";
  return `Shop authentic ${nameEn} by ${brand} (${concentration})${notesStr} at Muschio. 100% genuine guaranteed with complimentary white-glove GCC express delivery.`;
}

export function generateBrandMetaTitle(name: string): string {
  return `${name} Fragrances & Extraits | Authentic Niche Haute Parfumerie`;
}

export function generateBrandMetaDescription(name: string, country: string = "Europe"): string {
  return `Discover the royal olfactory heritage of ${name} (${country}). Hand-curated flacons, aged attars, and limited extraits with verified provenance at Muschio.`;
}

export function generateNoteMetaTitle(nameEn: string, family: string = "Noble Essence"): string {
  return `${nameEn} Olfactory Essence (${family}) | Luxury Scent Notes Guide`;
}

export function generateNoteMetaDescription(nameEn: string, originEn: string = "the Middle East"): string {
  return `Explore luxury perfumes featuring ${nameEn}, prized from ${originEn}. Discover noble flacons composed around this timeless essence at Muschio.`;
}

export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function parseCsvContent(content: string): { headers: string[]; rows: Record<string, string>[] } {
  // Split CSV into logical rows while respecting quoted multi-line cells
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentLine += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        currentLine += ch;
      }
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && content[i + 1] === "\n") i++;
      if (currentLine.trim().length > 0) {
        lines.push(currentLine.trim());
      }
      currentLine = "";
    } else {
      currentLine += ch;
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const lineZero = lines[0];
  if (!lineZero) return { headers: [], rows: [] };
  const rawHeaders = parseCsvLine(lineZero);
  const headers = rawHeaders.map((h) => h.replace(/^["']|["']$/g, "").trim());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const vals = parseCsvLine(line);
    if (vals.length === 0 || (vals.length === 1 && !vals[0])) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = vals[index] ? vals[index].replace(/^["']|["']$/g, "").trim() : "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export const PRO_SEO_CSV_TEMPLATE = `sku,nameEn,nameAr,slug,brand,scentFamily,scentProfiles,tags,perfumer,perfumerBio,concentration,gender,volumeMl,isDefaultVariant,originalPriceAed,offerPriceAed,variants,costPriceAed,sealedStock,testerStock,warehouseCode,topNotes,heartNotes,baseNotes,longevity,sillage,countryOfOrigin,releaseYear,taglineEn,taglineAr,descriptionEn,descriptionAr,metaTitle,metaDescription,imageUrl,galleryImages,imageAlt,isFeatured,status
AMO-INT53-100,"Interlude 53 Man Extrait","إنترلود 53 إكستريت دي بارفان",amouage-interlude-53-man-extrait,Amouage,"Woody Amber","Woody, Amber, Spicy, Oud","Signature Scent, Extrait Concentration","Pierre Negrin","Master French perfumer renowned for sculpting deep, architectural incense and resinous extraits for royalty.",EXTRAIT_DE_PARFUM,MEN,100,TRUE,2050,1850,"50ml:1450:1290:15:AMO-INT53-50 | 200ml:2950::10:AMO-INT53-200",950,28,5,DXB-MAIN,"Oregano, Pimento Berry, Bergamot","Amber, Frankincense, Cistus, Opoponax","Leather, Agarwood Smoke, Patchouli, Sandalwood","12+ Hours","Enormous","Oman",2020,"The Monumental Expression of Spicy Smoky Amber","التعبير المهيب عن العنبر الدخاني الحار","Formulated at a monumental 53% concentration and aged for six months in Oman, Interlude 53 reveals hidden facets of the iconic spicy harmony.","بتركيز أسطوري يبلغ 53% ومعتق لمدة ستة أشهر في عُمان، يكشف إنترلود 53 عن أبعاد استثنائية من التناغم الخشبي الحار.","Interlude 53 Man Extrait by Amouage | Authentic Luxury Fragrance UAE","Shop authentic Interlude 53 Man Extrait by Amouage (53% Extrait) at Muschio. Opening with oregano and pimento. 100% genuine with white-glove GCC shipping.",https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85,"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85","Amouage Interlude 53 Man Extrait luxury flacon",TRUE,PUBLISHED
MFK-BR540E-70,"Baccarat Rouge 540 Extrait","باكارات روج 540 إكستريت",mfk-baccarat-rouge-540-extrait,"Maison Francis Kurkdjian","Amber Floral","Amber, Floral, Woody, Gourmand","Iconic, Best Seller","Francis Kurkdjian","Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",EXTRAIT_DE_PARFUM,UNISEX,70,TRUE,1650,,,820,34,4,DXB-MAIN,"Bitter Almond, Saffron","Egyptian Jasmine Grandiflorum, Cedarwood","Ambergris, Woody Musk","10-12 Hours","Strong","France",2017,"Luminous Amber Crystal and Floral Radiance","إشراقة الكريستال العنبري والزهور الساحرة","Augments the strength and radiance of the perfume's amber woody floral aura. In this exalted version, jasmine blossoms and woody musks engage in an alchemy of the senses.","يعزز هذا الإصدار الاستثنائي قوة وإشراقة النفحات الخشبية العنبرية والزهرية لدار فرانسيس كوركدجيان.","Baccarat Rouge 540 Extrait by MFK | Authentic UAE","Shop authentic Baccarat Rouge 540 Extrait by Maison Francis Kurkdjian at Muschio. 100% genuine guaranteed with white-glove GCC delivery.",https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85,"","Baccarat Rouge 540 Extrait flacon",TRUE,PUBLISHED
MFK-BR540E-200,"Baccarat Rouge 540 Extrait","باكارات روج 540 إكستريت",mfk-baccarat-rouge-540-extrait,"Maison Francis Kurkdjian","Amber Floral","Amber, Floral, Woody, Gourmand","Iconic, Best Seller","Francis Kurkdjian","Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",EXTRAIT_DE_PARFUM,UNISEX,200,FALSE,2950,2750,,1450,12,2,DXB-MAIN,"Bitter Almond, Saffron","Egyptian Jasmine Grandiflorum, Cedarwood","Ambergris, Woody Musk","10-12 Hours","Strong","France",2017,"Luminous Amber Crystal and Floral Radiance","إشراقة الكريستال العنبري والزهور الساحرة","Augments the strength and radiance of the perfume's amber woody floral aura. In this exalted version, jasmine blossoms and woody musks engage in an alchemy of the senses.","يعزز هذا الإصدار الاستثنائي قوة وإشراقة النفحات الخشبية العنبرية والزهرية لدار فرانسيس كوركدجيان.","Baccarat Rouge 540 Extrait by MFK | Authentic UAE","Shop authentic Baccarat Rouge 540 Extrait by Maison Francis Kurkdjian at Muschio. 100% genuine guaranteed with white-glove GCC delivery.",https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85,"","Baccarat Rouge 540 Extrait flacon",TRUE,PUBLISHED
ROJA-ELY-100,"Elysium Pour Homme Parfum","إليسيوم بور أوم بارفان",roja-elysium-pour-homme-parfum,"Roja Parfums","Fresh Aromatic","Fresh, Citrus, Aromatic, Woody","Fresh & Crisp, Daywear","Roja Dove","The premier British Master Perfumer and fragrance historian, famed for formulating without compromise on rare natural absolutes.",EXTRAIT_DE_PARFUM,MEN,100,TRUE,1950,,,980,25,2,RUH-HUB,"Grapefruit, Lemon, Bergamot, Lime","Lily of the Valley, Rose de Mai, Jasmin de Grasse, Apple","Galbanum, Pink Pepper, Cypriol, Vetiver, Cedarwood, Labdanum, Ambergris, Benzoin, Vanilla","8-10 Hours","Moderate to Strong","United Kingdom",2017,"Heroic Elysian Freshness and Royal Musk","الانتعاش الأسطوري والمسك الملكي","An ultra-fresh citrus blend of lemon, bergamot, grapefruit, and lime is further refreshed by thyme and lavender, enriched by an opulent base of ambergris and cedar.","مزيج منعش وفائق الفخامة من الحمضيات النادرة والزعتر واللافندر مع قاعدة ثرية من العنبر الأشهب وخشب الأرز.","Elysium Pour Homme Parfum by Roja Parfums | UAE GCC","Shop authentic Elysium Pour Homme Parfum by Roja Parfums at Muschio. 100% genuine luxury flacons with fast GCC delivery.",https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85,"","Roja Parfums Elysium luxury flacon",FALSE,PUBLISHED`;

function sanitizeSpreadsheetRows<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        k,
        typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v,
      ]),
    ),
  );
}

/**
 * Downloads a pre-formatted Excel (.xlsx) template for bulk product import.
 */
export async function downloadExcelTemplate(filename = "muschio_luxury_catalog_template.xlsx"): Promise<void> {
  const XLSX = await import("xlsx");
  const { headers, rows } = parseCsvContent(PRO_SEO_CSV_TEMPLATE);
  const worksheet = XLSX.utils.json_to_sheet(sanitizeSpreadsheetRows(rows), { header: headers });

  worksheet["!cols"] = [
    { wch: 18 }, { wch: 30 }, { wch: 32 }, { wch: 34 }, { wch: 24 }, { wch: 20 },
    { wch: 32 }, { wch: 32 }, { wch: 22 }, { wch: 35 }, { wch: 22 }, { wch: 12 },
    { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 15 }, { wch: 48 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 55 },
    { wch: 55 }, { wch: 45 }, { wch: 55 }, { wch: 40 }, { wch: 45 }, { wch: 35 },
    { wch: 12 }, { wch: 14 },
  ];

  const guideRows = [
    { Column: "scentProfiles", Format: "Comma-separated", Allowed_Or_Example: "Fresh, Citrus, Floral, Fruity, Woody, Amber, Oud, Gourmand, Spicy, Aromatic, Musky, Leather", Notes: "Assign multiple profiles per fragrance (no primary/secondary restriction)" },
    { Column: "scentFamily", Format: "Single name", Allowed_Or_Example: "Woody Amber, Amber Floral, Fresh Aromatic, Woody Oud, Citrus, Chypre, Leather", Notes: "Auto-created if not already in Scent Families" },
    { Column: "tags", Format: "Comma-separated", Allowed_Or_Example: "Signature Scent, Extrait Concentration, Best Seller, Bespoke Layering, New Arrival", Notes: "Auto-links existing tags or creates new ones" },
    { Column: "concentration", Format: "Enum", Allowed_Or_Example: "EXTRAIT_DE_PARFUM, EAU_DE_PARFUM, EAU_DE_TOILETTE, EAU_DE_COLOGNE, PARFUM_OIL, ATTAR, DISCOVERY_SET", Notes: "Uppercase with underscores" },
    { Column: "gender", Format: "Enum", Allowed_Or_Example: "UNISEX, MEN, WOMEN", Notes: "Defaults to UNISEX if omitted" },
    { Column: "topNotes / heartNotes / baseNotes", Format: "Comma-separated", Allowed_Or_Example: "Bergamot, Saffron, Pink Pepper", Notes: "Missing notes are auto-added to the Notes Library" },
    { Column: "originalPriceAed / offerPriceAed", Format: "Numeric", Allowed_Or_Example: "2050 / 1850", Notes: "originalPriceAed is the regular price; offerPriceAed is optional sale price (leave blank if no discount)" },
    { Column: "variants (Single-row method)", Format: "Pipe-separated (|)", Allowed_Or_Example: "50ml:1450:1290:15:AMO-INT53-50 | 200ml:2950::10:AMO-INT53-200", Notes: "Format per variant: volumeMl:originalPrice:offerPrice:stock:sku (offerPrice, stock, sku are optional)" },
    { Column: "isDefaultVariant", Format: "Boolean", Allowed_Or_Example: "TRUE or FALSE", Notes: "Marks which variant is the default size shown on product cards" },
    { Column: "Multi-row variants (Alternative)", Format: "Multiple rows", Allowed_Or_Example: "Repeat the same product slug with different sku, volumeMl, originalPriceAed & offerPriceAed", Notes: "Rows sharing the same slug are automatically merged into one product with multiple size variants" },
    { Column: "imageUrl / galleryImages", Format: "URL / Comma-separated URLs", Allowed_Or_Example: "https://... / https://..., https://...", Notes: "imageUrl is the cover photo; galleryImages adds extra angles" },
    { Column: "isFeatured", Format: "Boolean", Allowed_Or_Example: "TRUE or FALSE", Notes: "Highlights fragrance on homepage featured sections" },
    { Column: "status", Format: "Enum", Allowed_Or_Example: "PUBLISHED or DRAFT", Notes: "Defaults to PUBLISHED" },
  ];
  const guideSheet = XLSX.utils.json_to_sheet(guideRows);
  guideSheet["!cols"] = [{ wch: 36 }, { wch: 24 }, { wch: 68 }, { wch: 52 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Muschio Catalog");
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Import Guide & Options");
  XLSX.writeFile(workbook, filename);
}

/**
 * Exports existing catalog products to an Excel (.xlsx) file matching the bulk import template.
 */
export async function exportCatalogToExcel(
  products: ProductItem[],
  filename = "muschio_catalog_export.xlsx",
): Promise<void> {
  const XLSX = await import("xlsx");
  const { headers } = parseCsvContent(PRO_SEO_CSV_TEMPLATE);

  const rows = products.map((p) => {
    const allVariants = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [];
    const defaultVar = allVariants.find((v) => v.isDefault) || allVariants[0];
    const extraVars = allVariants.filter((v) => v !== defaultVar);

    const parseMoney = (val: unknown): number => {
      if (val === null || val === undefined) return 0;
      return Number(String(val).replace(/[^0-9.]/g, "")) || 0;
    };

    const selling = parseMoney(defaultVar?.price ?? p.price);
    const compareAt = parseMoney(defaultVar?.compareAtPrice ?? defaultVar?.originalPrice ?? defaultVar?.basePrice);
    const originalPrice = compareAt > selling ? compareAt : selling;
    const offerPrice = compareAt > selling && selling > 0 ? String(selling) : "";

    const extraVariantsStr = extraVars
      .map((v) => {
        const vol = v.volumeMl || parseInt(String(v.volume || "100").replace(/[^0-9]/g, ""), 10) || 100;
        const vSell = parseMoney(v.price);
        const vComp = parseMoney(v.compareAtPrice ?? v.originalPrice ?? v.basePrice);
        const vOrig = vComp > vSell ? vComp : vSell;
        const vOffer = vComp > vSell && vSell > 0 ? String(vSell) : "";
        const vStock = v.stockQuantity ?? v.stock ?? 0;
        const vSku = v.sku || "";
        return `${vol}ml:${vOrig}:${vOffer}:${vStock}:${vSku}`;
      })
      .join(" | ");

    const allImgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    const coverImg = p.imageUrl || allImgs[0] || "";
    const galleryImgs = allImgs.filter((img) => img !== coverImg).join(", ");

    return {
      sku: String(defaultVar?.sku || p.sku || ""),
      nameEn: p.name || "",
      nameAr: p.nameAr || "",
      slug: p.slug || "",
      brand: p.brand || "",
      scentFamily: p.scentFamily || "",
      scentProfiles: Array.isArray(p.scentProfiles)
        ? p.scentProfiles.map((sp) => sp.nameEn).filter(Boolean).join(", ")
        : (p.scentProfileNames || []).join(", "),
      tags: Array.isArray(p.tags)
        ? p.tags.map((t) => t.nameEn).filter(Boolean).join(", ")
        : (p.tagNames || []).join(", "),
      perfumer: p.perfumer || "",
      perfumerBio: p.perfumerBio || "",
      concentration: p.concentration || "EXTRAIT_DE_PARFUM",
      gender: p.gender || "UNISEX",
      volumeMl: defaultVar?.volumeMl || p.volumeMl || 100,
      isDefaultVariant: "TRUE",
      originalPriceAed: originalPrice || "",
      offerPriceAed: offerPrice,
      variants: extraVariantsStr,
      costPriceAed: parseMoney(p.costPrice) || "",
      sealedStock: defaultVar?.stockQuantity ?? p.stock ?? 0,
      testerStock: p.testerStock ?? 0,
      warehouseCode: defaultVar?.warehouse || p.warehouse || "DXB-MAIN",
      topNotes: (p.topNotes || []).join(", "),
      heartNotes: (p.heartNotes || []).join(", "),
      baseNotes: (p.baseNotes || []).join(", "),
      longevity: p.longevity || "",
      sillage: p.sillage || "",
      countryOfOrigin: p.countryOfOrigin || "",
      releaseYear: p.releaseYear || "",
      taglineEn: p.taglineEn || "",
      taglineAr: p.taglineAr || "",
      descriptionEn: p.descriptionEn || "",
      descriptionAr: p.descriptionAr || "",
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      imageUrl: coverImg,
      galleryImages: galleryImgs,
      imageAlt: p.imageAlt || "",
      isFeatured: p.isFeatured ? "TRUE" : "FALSE",
      status: p.status || "PUBLISHED",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(sanitizeSpreadsheetRows(rows), { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Muschio Catalog");
  XLSX.writeFile(workbook, filename);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) file into standardized CSV text and row count.
 */
export async function parseExcelFileToCsv(file: File): Promise<{ csvText: string; rowCount: number }> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("The Excel workbook contains no sheets.");
  }
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error("Could not read sheet data from Excel file.");
  }

  const csvText = XLSX.utils.sheet_to_csv(worksheet);
  const rows = XLSX.utils.sheet_to_json(worksheet);
  return { csvText, rowCount: rows.length };
}
