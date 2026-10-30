import React, { useState, useMemo } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Search,
  Layers,
  Award,
  Globe,
} from "lucide-react";
import {
  BrandItem,
  NoteItem,
  ProductItem,
  ParsedCsvProduct,
  slugify,
  generateProductMetaTitle,
  generateProductMetaDescription,
  generateBrandMetaTitle,
  generateBrandMetaDescription,
  generateNoteMetaTitle,
  generateNoteMetaDescription,
  parseCsvContent,
  PRO_SEO_CSV_TEMPLATE,
  downloadExcelTemplate,
  parseExcelFileToCsv,
} from "../seo-utils";

interface BulkCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBrands: BrandItem[];
  existingNotes: NoteItem[];
  onImportSuccess: (
    newProducts: ProductItem[],
    newBrands: BrandItem[],
    newNotes: NoteItem[]
  ) => void;
}

export function BulkCsvModal({
  isOpen,
  onClose,
  existingBrands,
  existingNotes,
  onImportSuccess,
}: BulkCsvModalProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [csvContent, setCsvContent] = useState<string>(PRO_SEO_CSV_TEMPLATE);
  const [fileName, setFileName] = useState<string>("muschio_luxury_catalog_template.xlsx");
  const [autoGenerateSeo, setAutoGenerateSeo] = useState<boolean>(true);
  const [previewSerpSku, setPreviewSerpSku] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Trigger download of the sample Excel template
  const handleDownloadTemplate = () => {
    downloadExcelTemplate("muschio_luxury_catalog_template.xlsx");
  };

  // Handle file drop / upload (.xlsx, .xls, .csv)
  const handleFileUpload = async (file: File) => {
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const isCsv = file.name.endsWith(".csv");
    if (!isExcel && !isCsv) {
      alert("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.");
      return;
    }
    setFileName(file.name);
    if (isExcel) {
      try {
        const { csvText } = await parseExcelFileToCsv(file);
        setCsvContent(csvText);
      } catch (err: any) {
        alert(`Failed to parse Excel file: ${err.message || err}`);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvContent(text || "");
      };
      reader.readAsText(file);
    }
  };

  // Parse CSV and validate Pro SEO compliance
  const parsedResult = useMemo(() => {
    if (!csvContent.trim()) {
      return {
        products: [] as ParsedCsvProduct[],
        newBrandsToCreate: [] as BrandItem[],
        newNotesToCreate: [] as NoteItem[],
        validCount: 0,
        warningCount: 0,
        errorCount: 0,
      };
    }

    const { rows } = parseCsvContent(csvContent);
    const seenSkus = new Set<string>();

    const existingBrandMap = new Map(existingBrands.map((b) => [b.name.toLowerCase().trim(), b]));
    const existingNoteMap = new Map(existingNotes.map((n) => [n.nameEn.toLowerCase().trim(), n]));

    const newBrandsMap = new Map<string, BrandItem>();
    const newNotesMap = new Map<string, NoteItem>();

    const parsedProducts: ParsedCsvProduct[] = rows.map((r, idx) => {
      const sku = r["sku"] || `MSC-AUTO-${idx + 1}`;
      const nameEn = r["nameEn"] || "";
      const nameAr = r["nameAr"] || "";
      const brand = r["brand"] || "Independent Maison";
      const brandSlug = r["brandSlug"] || slugify(brand);
      const scentFamily = r["scentFamily"] || "Woody Amber";
      const perfumer = r["perfumer"] || "";
      const perfumerBio = r["perfumerBio"] || "";
      const concentration = r["concentration"] || "EXTRAIT_DE_PARFUM";
      const gender = r["gender"] || "UNISEX";
      const volumeMl = Number(r["volumeMl"]) || 100;
      const rawPrice = r["priceAed"] || r["price"] || "0";
      const priceFormatted = rawPrice.includes("AED") ? rawPrice : `${rawPrice} AED`;
      const costPriceFormatted = r["costPriceAed"] ? (r["costPriceAed"].includes("AED") ? r["costPriceAed"] : `${r["costPriceAed"]} AED`) : "0 AED";
      const stock = Number(r["sealedStock"]) || Number(r["stock"]) || 20;
      const testerStock = Number(r["testerStock"]) || 2;
      const warehouse = r["warehouseCode"] || r["warehouse"] || "DXB-MAIN";
      const taglineEn = r["taglineEn"] || "";
      const taglineAr = r["taglineAr"] || "";
      const descriptionEn = r["descriptionEn"] || "";
      const descriptionAr = r["descriptionAr"] || "";
      const imageUrl = r["imageUrl"] || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85";
      const imageAlt = r["imageAlt"] || `${nameEn} by ${brand} flacon`;
      const status = (r["status"] as "PUBLISHED" | "DRAFT" | "ARCHIVED") || "PUBLISHED";

      // Notes parsing (comma-separated lists)
      const topNotes = (r["topNotes"] || "").split(",").map((n) => n.trim()).filter((n) => n.length > 0);
      const heartNotes = (r["heartNotes"] || "").split(",").map((n) => n.trim()).filter((n) => n.length > 0);
      const baseNotes = (r["baseNotes"] || "").split(",").map((n) => n.trim()).filter((n) => n.length > 0);

      // Auto SEO slugification & metadata
      let slug = r["slug"] ? slugify(r["slug"]) : "";
      if (!slug && autoGenerateSeo && nameEn) {
        slug = slugify(`${brand}-${nameEn}`);
      }

      let metaTitle = r["metaTitle"] || "";
      if (!metaTitle && autoGenerateSeo && nameEn) {
        metaTitle = generateProductMetaTitle(nameEn, brand);
      }

      let metaDescription = r["metaDescription"] || "";
      if (!metaDescription && autoGenerateSeo && nameEn) {
        metaDescription = generateProductMetaDescription(nameEn, brand, concentration, topNotes);
      }

      // Check Brand existence in SEO Graph
      const brandKey = brand.toLowerCase().trim();
      let isNewBrand = false;
      if (!existingBrandMap.has(brandKey)) {
        isNewBrand = true;
        if (!newBrandsMap.has(brandKey)) {
          newBrandsMap.set(brandKey, {
            id: `b-auto-${Date.now()}-${slugify(brand)}`,
            name: brand,
            slug: brandSlug,
            type: "NICHE",
            countryEn: "France / GCC",
            countryAr: "فرنسا / الخليج",
            year: 2020,
            storyEn: `${brand} is an exceptional perfume house dedicated to artisanal craftsmanship and noble olfactory raw materials.`,
            storyAr: `دار ${brand} هي دار عطور مرموقة مكرسة للابتكار العطري وانتقاء أنقى الخلاصات الطبيعية النادرة.`,
            perfumer: "Master Perfumer",
            metaTitle: generateBrandMetaTitle(brand),
            metaDescription: generateBrandMetaDescription(brand, "France / GCC"),
            perfumesCount: 1,
          });
        }
      }

      // Check Scent Notes existence in SEO Graph
      const allRowNotes = [...topNotes, ...heartNotes, ...baseNotes];
      const newNotes: string[] = [];
      allRowNotes.forEach((noteName) => {
        const noteKey = noteName.toLowerCase().trim();
        if (!existingNoteMap.has(noteKey)) {
          newNotes.push(noteName);
          if (!newNotesMap.has(noteKey)) {
            newNotesMap.set(noteKey, {
              id: `n-auto-${Date.now()}-${slugify(noteName)}`,
              nameEn: noteName,
              nameAr: noteName,
              slug: slugify(noteName),
              family: scentFamily,
              originEn: "Global Harvest",
              originAr: "محصول عالمي",
              descriptionEn: `Noble ${noteName} essence harvested for luxury haute parfumerie accords.`,
              descriptionAr: `خلاصة ${noteName} الفاخرة المنتقاة لأرقى التركيبات العطرية الملكية.`,
              metaTitle: generateNoteMetaTitle(noteName, scentFamily),
              metaDescription: generateNoteMetaDescription(noteName, "Global Harvest"),
              status: "PUBLISHED",
              perfumesCount: 1,
            });
          }
        }
      });

      // Validation
      const validationMessages: string[] = [];
      let validationStatus: "VALID" | "WARNING" | "ERROR" = "VALID";

      if (!r["sku"]) {
        validationStatus = "ERROR";
        validationMessages.push("Missing SKU code");
      } else if (seenSkus.has(sku)) {
        validationStatus = "ERROR";
        validationMessages.push(`Duplicate SKU "${sku}" in this CSV batch`);
      } else {
        seenSkus.add(sku);
      }

      if (!nameEn) {
        validationStatus = "ERROR";
        validationMessages.push("Missing English product title");
      }

      if (!rawPrice || rawPrice === "0") {
        validationStatus = "ERROR";
        validationMessages.push("Invalid or zero base price");
      }

      if (validationStatus !== "ERROR") {
        if (!nameAr) {
          validationStatus = "WARNING";
          validationMessages.push("Arabic title missing (will fallback to EN for RTL SEO)");
        }
        if (allRowNotes.length === 0) {
          validationStatus = "WARNING";
          validationMessages.push("No scent notes defined (Top/Heart/Base) for /notes/[slug] discovery");
        }
        if (isNewBrand) {
          validationMessages.push(`New Maison "${brand}" will be auto-created in Brands directory`);
        }
        if (newNotes.length > 0) {
          validationMessages.push(`${newNotes.length} new scent notes will be added to Scent Notes Graph`);
        }
      }

      return {
        sku,
        nameEn,
        nameAr: nameAr || nameEn,
        slug,
        brand,
        brandSlug,
        scentFamily,
        perfumer: perfumer || undefined,
        perfumerBio: perfumerBio || undefined,
        concentration,
        gender,
        volumeMl,
        price: priceFormatted,
        costPrice: costPriceFormatted,
        stock,
        testerStock,
        warehouse,
        topNotes,
        heartNotes,
        baseNotes,
        taglineEn,
        taglineAr,
        descriptionEn,
        descriptionAr,
        metaTitle,
        metaDescription,
        imageUrl,
        imageAlt,
        status,
        validationStatus,
        validationMessages,
        isNewBrand,
        newNotesCount: newNotes.length,
        newNotes,
      };
    });

    const validCount = parsedProducts.filter((p) => p.validationStatus === "VALID").length;
    const warningCount = parsedProducts.filter((p) => p.validationStatus === "WARNING").length;
    const errorCount = parsedProducts.filter((p) => p.validationStatus === "ERROR").length;

    return {
      products: parsedProducts,
      newBrandsToCreate: Array.from(newBrandsMap.values()),
      newNotesToCreate: Array.from(newNotesMap.values()),
      validCount,
      warningCount,
      errorCount,
    };
  }, [csvContent, autoGenerateSeo, existingBrands, existingNotes]);

  // Execute Import
  const handleExecuteImport = () => {
    const importable = parsedResult.products.filter((p) => p.validationStatus !== "ERROR");
    if (importable.length === 0) {
      alert("No valid products to import. Please fix CSV errors.");
      return;
    }

    const convertedProducts: ProductItem[] = importable.map((p) => ({
      id: `p-${Date.now()}-${p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      sku: p.sku,
      name: p.nameEn,
      nameAr: p.nameAr,
      slug: p.slug,
      brand: p.brand,
      brandSlug: p.brandSlug,
      scentFamily: p.scentFamily,
      perfumer: p.perfumer || undefined,
      perfumerBio: p.perfumerBio || undefined,
      concentration: p.concentration,
      gender: p.gender,
      volumeMl: p.volumeMl,
      price: p.price,
      costPrice: p.costPrice,
      stock: p.stock,
      testerStock: p.testerStock,
      reserved: 0,
      warehouse: p.warehouse,
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
      taglineEn: p.taglineEn,
      taglineAr: p.taglineAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      imageUrl: p.imageUrl,
      imageAlt: p.imageAlt,
      status: p.status,
      variants: [
        {
          sku: p.sku,
          volume: `${p.volumeMl || 100}ml`,
          volumeMl: p.volumeMl || 100,
          price: p.price,
          stockQuantity: p.stock || 0,
          isDefault: true,
        },
      ],
    }));

    onImportSuccess(convertedProducts, parsedResult.newBrandsToCreate, parsedResult.newNotesToCreate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-5xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-normal text-neutral-900 dark:text-white">Bulk Excel Upload</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                  EXCEL (.XLSX) READY
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mt-0.5">
                Upload products in bulk using Microsoft Excel (.xlsx) spreadsheet or CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTROLS & SUBHEADER */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded">
            {/* Input Mode Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800 rounded text-xs shadow-sm">
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                  mode === "upload" ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Upload size={13} />
                <span>Upload Excel File</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("paste")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  mode === "paste" ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Paste / Raw Data
              </button>
            </div>

            {/* Template Download & Options */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoGenerateSeo}
                  onChange={(e) => setAutoGenerateSeo(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Auto-generate missing slugs & SEO tags</span>
                </span>
              </label>

              {/* HIGH-VISIBILITY EXCEL TEMPLATE DOWNLOAD BUTTON */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-2 shadow-sm transition-all"
                title="Download clean Excel (.xlsx) template with sample catalog data"
              >
                <FileSpreadsheet size={15} />
                <span>Download Excel Template (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* INPUT AREA */}
          {mode === "upload" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-neutral-300 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/50 hover:border-emerald-400 dark:hover:border-emerald-600"
              }`}
            >
              <FileSpreadsheet size={36} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-3" />
              <p className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                Drop your Excel (.xlsx, .xls) file here, or{" "}
                <label className="text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer hover:opacity-80">
                  browse from device
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Accepted: Microsoft Excel (.xlsx, .xls) or UTF-8 .CSV files
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs rounded font-mono shadow-sm">
                  <CheckCircle2 size={14} />
                  <span>{fileName} ({parsedResult.products.length} products parsed)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Paste tabular or CSV data (headers included):</span>
                <button
                  type="button"
                  onClick={() => setCsvContent(PRO_SEO_CSV_TEMPLATE)}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-[11px]"
                >
                  Load Sample Data
                </button>
              </div>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={6}
                placeholder="sku,nameEn,nameAr,slug,brand,scentFamily,concentration,gender,volumeMl,priceAed,sealedStock,topNotes,heartNotes,baseNotes..."
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-mono text-[11px] p-3 rounded focus:outline-none focus:border-neutral-500 leading-relaxed shadow-sm"
              />
            </div>
          )}

          {/* SEO VERIFICATION STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">Total Products</span>
              <div className="text-xl font-serif text-neutral-900 dark:text-white mt-1">{parsedResult.products.length}</div>
              <span className="text-[10px] text-neutral-500">In batch</span>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-emerald-500/30 rounded">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Ready to Import</span>
              </span>
              <div className="text-xl font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                {parsedResult.validCount + parsedResult.warningCount}
              </div>
              <span className="text-[10px] text-neutral-500">Valid products</span>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-amber-500/30 rounded">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                <Award size={12} />
                <span>New Brands</span>
              </span>
              <div className="text-xl font-serif text-amber-600 dark:text-amber-400 mt-1">
                +{parsedResult.newBrandsToCreate.length}
              </div>
              <span className="text-[10px] text-neutral-500">Will create brand pages</span>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-purple-500/30 rounded">
              <span className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 block flex items-center gap-1">
                <Layers size={12} />
                <span>New Notes</span>
              </span>
              <div className="text-xl font-serif text-purple-600 dark:text-purple-400 mt-1">
                +{parsedResult.newNotesToCreate.length}
              </div>
              <span className="text-[10px] text-neutral-500">Will create note pages</span>
            </div>
          </div>

          {/* PARSED TABLE PREVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-normal text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Import Preview</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans">
                  ({parsedResult.products.length} products found)
                </span>
              </h3>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Storefront domain: <span className="text-emerald-600 dark:text-emerald-400">https://muschio.luxury</span>
              </span>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-x-auto rounded max-h-72">
              <table className="w-full text-start text-xs font-sans">
                <thead className="bg-neutral-100 dark:bg-black text-neutral-600 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-start">Product</th>
                    <th className="p-3 text-start">SEO URL</th>
                    <th className="p-3 text-start">Brand</th>
                    <th className="p-3 text-start">Notes</th>
                    <th className="p-3 text-start">Price & Stock</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-end">Google Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-sans">
                  {parsedResult.products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-neutral-500 text-xs">
                        No product rows detected. Upload an Excel (.xlsx) file or paste data above.
                      </td>
                    </tr>
                  ) : (
                    parsedResult.products.map((p) => (
                      <React.Fragment key={p.sku}>
                        <tr className="hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                          <td className="p-3">
                            <span className="font-medium text-neutral-900 dark:text-white block">{p.nameEn}</span>
                            <span className="text-neutral-600 dark:text-neutral-400 text-[11px]" dir="rtl">{p.nameAr}</span>
                            <span className="text-neutral-500 font-mono text-[10px] block mt-0.5">{p.sku}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="text-neutral-500">/en/product/</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{p.slug || "auto-generated"}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-neutral-900 dark:text-neutral-100 block font-medium">{p.brand}</span>
                            {p.isNewBrand ? (
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded border border-purple-500/30">
                                +Auto-create brand
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">✓ In directory</span>
                            )}
                          </td>
                          <td className="p-3 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="text-neutral-700 dark:text-neutral-300 block">
                                Top: {p.topNotes.length} • Heart: {p.heartNotes.length} • Base: {p.baseNotes.length}
                              </span>
                              {p.newNotesCount > 0 && (
                                <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded block w-fit">
                                  +{p.newNotesCount} new notes
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs">
                            <span className="text-neutral-900 dark:text-white block font-medium">{p.price}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">{p.stock} sealed ({p.warehouse})</span>
                          </td>
                          <td className="p-3">
                            {p.validationStatus === "VALID" ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                <CheckCircle2 size={11} />
                                <span>SEO Ready</span>
                              </span>
                            ) : p.validationStatus === "WARNING" ? (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                <AlertTriangle size={11} />
                                <span>Optimization Ready</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                <XCircle size={11} />
                                <span>Invalid</span>
                              </span>
                            )}
                            {p.validationMessages.length > 0 && (
                              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 space-y-0.5 max-w-xs">
                                {p.validationMessages.map((m, i) => (
                                  <div key={i}>• {m}</div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-end">
                            <button
                              type="button"
                              onClick={() => setPreviewSerpSku(previewSerpSku === p.sku ? null : p.sku)}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[10px] rounded border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 ml-auto transition-colors shadow-sm"
                            >
                              <Search size={11} />
                              <span>{previewSerpSku === p.sku ? "Hide SERP" : "View SERP"}</span>
                            </button>
                          </td>
                        </tr>

                        {/* GOOGLE SERP RICH SNIPPET PREVIEW ACCORDION */}
                        {previewSerpSku === p.sku && (
                          <tr className="bg-neutral-50 dark:bg-neutral-900 border-t border-b border-emerald-500/30">
                            <td colSpan={7} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Globe size={13} />
                                    <span>Google Search Engine Result Snippet (Desktop & Mobile SERP)</span>
                                  </span>
                                  <span className="text-[10px] font-mono">Structured Data: Schema.org Product</span>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-800 font-sans max-w-2xl space-y-1 shadow-sm">
                                  {/* URL Breadcrumb */}
                                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    <span className="text-neutral-700 dark:text-neutral-300">https://muschio.luxury</span>
                                    <span>›</span>
                                    <span>en</span>
                                    <span>›</span>
                                    <span className="text-neutral-500 dark:text-neutral-400 font-mono">product › {p.slug}</span>
                                  </div>

                                  {/* SERP Title */}
                                  <h4 className="text-base text-blue-600 dark:text-[#8AB4F8] hover:underline cursor-pointer font-medium leading-snug">
                                    {p.metaTitle || generateProductMetaTitle(p.nameEn, p.brand)}
                                  </h4>

                                  {/* SERP Description */}
                                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5">
                                    {p.metaDescription || generateProductMetaDescription(p.nameEn, p.brand, p.concentration, p.topNotes)}
                                  </p>

                                  {/* Rich Schema Metadata */}
                                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800/80 mt-2 font-mono">
                                    <span className="text-emerald-600 dark:text-emerald-400">Rating: 5.0 ★★★★★</span>
                                    <span>•</span>
                                    <span>Price: {p.price}</span>
                                    <span>•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">In stock ({p.warehouse})</span>
                                    <span>•</span>
                                    <span>Brand: {p.brand}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">
            Ready to import:{" "}
            <span className="text-neutral-900 dark:text-white font-semibold">
              {parsedResult.validCount + parsedResult.warningCount}
            </span>{" "}
            valid products (
            <span className="text-amber-600 dark:text-amber-400">+{parsedResult.newBrandsToCreate.length} new brands</span>,{" "}
            <span className="text-purple-600 dark:text-purple-400">+{parsedResult.newNotesToCreate.length} new notes</span>)
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedResult.validCount + parsedResult.warningCount === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CheckCircle2 size={14} />
              <span>
                Import {parsedResult.validCount + parsedResult.warningCount} Products
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
