// Pro SEO Utility functions, CSV Parser, Excel Parser/Exporter, and Meta Generators for Muschio Admin
import * as XLSX from "xlsx";

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
}

export interface ParsedCsvProduct {
  sku: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  brand: string;
  brandSlug: string;
  scentFamily: string;
  perfumer?: string;
  perfumerBio?: string;
  concentration: string;
  gender: string;
  volumeMl: number;
  price: string;
  costPrice: string;
  stock: number;
  testerStock: number;
  warehouse: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  taglineEn: string;
  taglineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
  imageAlt: string;
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
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

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

export const PRO_SEO_CSV_TEMPLATE = `sku,nameEn,nameAr,slug,brand,scentFamily,perfumer,perfumerBio,concentration,gender,volumeMl,priceAed,costPriceAed,sealedStock,testerStock,warehouseCode,topNotes,heartNotes,baseNotes,taglineEn,taglineAr,descriptionEn,descriptionAr,metaTitle,metaDescription,imageUrl,imageAlt,status
AMO-INT53-100,"Interlude 53 Man Extrait","إنترلود 53 إكستريت دي بارفان",amouage-interlude-53-man-extrait,Amouage,"Woody Amber","Pierre Negrin","Master French perfumer renowned for sculpting deep, architectural incense and resinous extraits for royalty.",EXTRAIT_DE_PARFUM,MEN,100,1850,950,28,5,DXB-MAIN,"Oregano, Pimento Berry, Bergamot","Amber, Frankincense, Cistus, Opoponax","Leather, Agarwood Smoke, Patchouli, Sandalwood","The Monumental Expression of Spicy Smoky Amber","التعبير المهيب عن العنبر الدخاني الحار","Formulated at a monumental 53% concentration and aged for six months in Oman, Interlude 53 reveals hidden facets of the iconic spicy harmony.","بتركيز أسطوري يبلغ 53% ومعتق لمدة ستة أشهر في عُمان، يكشف إنترلود 53 عن أبعاد استثنائية من التناغم الخشبي الحار.","Interlude 53 Man Extrait by Amouage | Authentic Luxury Fragrance UAE","Shop authentic Interlude 53 Man Extrait by Amouage (53% Extrait) at Muschio. Opening with oregano and pimento. 100% genuine with white-glove GCC shipping.",https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85,"Amouage Interlude 53 Man Extrait luxury flacon",PUBLISHED
MFK-BR540E-70,"Baccarat Rouge 540 Extrait","باكارات روج 540 إكستريت",mfk-baccarat-rouge-540-extrait,"Maison Francis Kurkdjian","Amber Floral","Francis Kurkdjian","Legendary Master Perfumer and Dior Perfume Creation Director, famed for crystalline olfactory radiance.",EXTRAIT_DE_PARFUM,UNISEX,70,1650,820,34,4,DXB-MAIN,"Bitter Almond, Saffron","Egyptian Jasmine Grandiflorum, Cedarwood","Ambergris, Woody Musk","Luminous Amber Crystal and Floral Radiance","إشراقة الكريستال العنبري والزهور الساحرة","Augments the strength and radiance of the perfume's amber woody floral aura. In this exalted version, jasmine blossoms and woody musks engage in an alchemy of the senses.","يعزز هذا الإصدار الاستثنائي قوة وإشراقة النفحات الخشبية العنبرية والزهرية لدار فرانسيس كوركدجيان.","Baccarat Rouge 540 Extrait by MFK | Authentic UAE","Shop authentic Baccarat Rouge 540 Extrait by Maison Francis Kurkdjian at Muschio. 100% genuine guaranteed with white-glove GCC delivery.",https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85,"Baccarat Rouge 540 Extrait flacon",PUBLISHED
ROJA-ELY-100,"Elysium Pour Homme Parfum","إليسيوم بور أوم بارفان",roja-elysium-pour-homme-parfum,"Roja Parfums","Fresh Aromatic Citrus","Roja Dove","The premier British Master Perfumer and fragrance historian, famed for formulating without compromise on rare natural absolutes.",PARFUM,MEN,100,1950,980,25,2,RUH-HUB,"Grapefruit, Lemon, Bergamot, Lime","Lily of the Valley, Rose de Mai, Jasmin de Grasse, Apple","Galbanum, Pink Pepper, Cypriol, Vetiver, Cedarwood, Labdanum, Ambergris, Benzoin, Vanilla","Heroic Elysian Freshness and Royal Musk","الانتعاش الأسطوري والمسك الملكي","An ultra-fresh citrus blend of lemon, bergamot, grapefruit, and lime is further refreshed by thyme and lavender, enriched by an opulent base of ambergris and cedar.","مزيج منعش وفائق الفخامة من الحمضيات النادرة والزعتر واللافندر مع قاعدة ثرية من العنبر الأشهب وخشب الأرز.","Elysium Pour Homme Parfum by Roja Parfums | UAE GCC","Shop authentic Elysium Pour Homme Parfum by Roja Parfums at Muschio. 100% genuine luxury flacons with fast GCC delivery.",https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85,"Roja Parfums Elysium luxury flacon",PUBLISHED
XER-ALEX2-100,"Alexandria II Eau de Parfum","ألكسندريا 2 أو دي بارفان",xerjoff-alexandria-ii-eau-de-parfum,Xerjoff,"Woody Amber Oud","Chris Maurice","Renowned Spanish nose celebrated for bridging classical Mediterranean perfumery with opulent Middle Eastern accords.",EAU_DE_PARFUM,UNISEX,100,2200,1100,19,3,DXB-MAIN,"Apple, Cinnamon, Rosewood, Lavender","Cedarwood, Lily of the Valley, Bulgarian Rose","Amber, Sandalwood, Musk, Vanilla, Laotian Oud","Aristocratic Laotian Oud and Cinnamon Majesty","فخامة العود اللاوسي والقرفة الملكية","Alexandria II by Xerjoff is an olfactory legend inspired by ancient millennium capitals, opening with cinnamon and apple wrapped in rare Laotian agarwood.","ألكسندريا 2 من زيرجوف أسطورة عطرية مستوحاة من العواصم التاريخية القديمة، يمتزج فيها العود اللاوسي النادر مع نفحات الورد والقرفة.", "Alexandria II by Xerjoff | Authentic Luxury Fragrance UAE","Shop authentic Alexandria II by Xerjoff at Muschio. Rare Laotian Oud and Bulgarian Rose. 100% authentic with white-glove GCC delivery.",https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85,"Xerjoff Alexandria II luxury flacon",PUBLISHED`;

/**
 * Downloads a pre-formatted Excel (.xlsx) template for bulk product import.
 */
export function downloadExcelTemplate(filename = "muschio_luxury_catalog_template.xlsx"): void {
  const { headers, rows } = parseCsvContent(PRO_SEO_CSV_TEMPLATE);
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

  // Format generous column widths so all fragrance data and Arabic titles are comfortable to read
  ws["!cols"] = [
    { wch: 18 }, // sku
    { wch: 30 }, // nameEn
    { wch: 32 }, // nameAr
    { wch: 34 }, // slug
    { wch: 22 }, // brand
    { wch: 20 }, // scentFamily
    { wch: 22 }, // perfumer
    { wch: 35 }, // perfumerBio
    { wch: 22 }, // concentration
    { wch: 12 }, // gender
    { wch: 12 }, // volumeMl
    { wch: 12 }, // priceAed
    { wch: 14 }, // costPriceAed
    { wch: 14 }, // sealedStock
    { wch: 14 }, // testerStock
    { wch: 16 }, // warehouseCode
    { wch: 35 }, // topNotes
    { wch: 35 }, // heartNotes
    { wch: 35 }, // baseNotes
    { wch: 40 }, // taglineEn
    { wch: 40 }, // taglineAr
    { wch: 55 }, // descriptionEn
    { wch: 55 }, // descriptionAr
    { wch: 45 }, // metaTitle
    { wch: 55 }, // metaDescription
    { wch: 40 }, // imageUrl
    { wch: 35 }, // imageAlt
    { wch: 14 }, // status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Muschio Catalog");
  XLSX.writeFile(wb, filename);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) file into standardized CSV text and row count.
 */
export async function parseExcelFileToCsv(file: File): Promise<{ csvText: string; rowCount: number }> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const wb = XLSX.read(data, { type: "array" });
  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error("The Excel workbook contains no sheets.");
  }
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Could not find first sheet in Excel file.");
  }
  const sheet = wb.Sheets[firstSheetName];
  if (!sheet) {
    throw new Error("Could not read sheet data from Excel file.");
  }
  const csvText = XLSX.utils.sheet_to_csv(sheet);
  const rows = XLSX.utils.sheet_to_json(sheet);
  return { csvText, rowCount: rows.length };
}
