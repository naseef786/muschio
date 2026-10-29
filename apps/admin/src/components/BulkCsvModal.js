import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from "react";
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Sparkles, Search, Layers, Award, Globe, } from "lucide-react";
import { slugify, generateProductMetaTitle, generateProductMetaDescription, generateBrandMetaTitle, generateBrandMetaDescription, generateNoteMetaTitle, generateNoteMetaDescription, parseCsvContent, PRO_SEO_CSV_TEMPLATE, } from "../seo-utils";
export function BulkCsvModal({ isOpen, onClose, existingBrands, existingNotes, onImportSuccess, }) {
    const [mode, setMode] = useState("paste");
    const [csvContent, setCsvContent] = useState(PRO_SEO_CSV_TEMPLATE);
    const [fileName, setFileName] = useState("muschio_luxury_catalog_sample.csv");
    const [autoGenerateSeo, setAutoGenerateSeo] = useState(true);
    const [previewSerpSku, setPreviewSerpSku] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    // Trigger download of the sample template
    const handleDownloadTemplate = () => {
        const blob = new Blob([PRO_SEO_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "muschio_pro_seo_catalog_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    // Handle file drop / upload
    const handleFileUpload = (file) => {
        if (!file.name.endsWith(".csv")) {
            alert("Please upload a valid .csv file.");
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            setCsvContent(text || "");
        };
        reader.readAsText(file);
    };
    // Parse CSV and validate Pro SEO compliance
    const parsedResult = useMemo(() => {
        if (!csvContent.trim()) {
            return {
                products: [],
                newBrandsToCreate: [],
                newNotesToCreate: [],
                validCount: 0,
                warningCount: 0,
                errorCount: 0,
            };
        }
        const { rows } = parseCsvContent(csvContent);
        const seenSkus = new Set();
        const existingBrandMap = new Map(existingBrands.map((b) => [b.name.toLowerCase().trim(), b]));
        const existingNoteMap = new Map(existingNotes.map((n) => [n.nameEn.toLowerCase().trim(), n]));
        const newBrandsMap = new Map();
        const newNotesMap = new Map();
        const parsedProducts = rows.map((r, idx) => {
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
            const status = r["status"] || "PUBLISHED";
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
            const newNotes = [];
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
            const validationMessages = [];
            let validationStatus = "VALID";
            if (!r["sku"]) {
                validationStatus = "ERROR";
                validationMessages.push("Missing SKU code");
            }
            else if (seenSkus.has(sku)) {
                validationStatus = "ERROR";
                validationMessages.push(`Duplicate SKU "${sku}" in this CSV batch`);
            }
            else {
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
        const convertedProducts = importable.map((p) => ({
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
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-5xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto", children: [_jsxs("div", { className: "px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-black", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded bg-black text-white dark:bg-white dark:text-black", children: _jsx(FileSpreadsheet, { size: 20 }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "font-serif text-xl font-light text-white", children: "Bulk CSV Upload" }), _jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-medium", children: "SEO FRIENDLY" })] }), _jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5", children: "Upload products in bulk with automated SEO slugs and note links" })] })] }), _jsx("button", { onClick: onClose, className: "p-1 text-neutral-500 dark:text-neutral-400 hover:text-white hover:bg-slate-800 rounded transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-6 space-y-5 overflow-y-auto flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded", children: [_jsxs("div", { className: "flex items-center gap-2 bg-white dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800 rounded text-xs", children: [_jsx("button", { onClick: () => setMode("paste"), className: `px-3 py-1.5 rounded transition-colors ${mode === "paste" ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-white"}`, children: "Paste CSV" }), _jsxs("button", { onClick: () => setMode("upload"), className: `px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${mode === "upload" ? "bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-white"}`, children: [_jsx(Upload, { size: 13 }), _jsx("span", { children: "Upload CSV File" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("label", { className: "flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: autoGenerateSeo, onChange: (e) => setAutoGenerateSeo(e.target.checked), className: "rounded border-neutral-300 dark:border-neutral-700 bg-slate-900 text-accent focus:ring-accent" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Sparkles, { size: 13, className: "text-amber-400" }), _jsx("span", { children: "Auto-generate missing slugs & SEO tags" })] })] }), _jsxs("button", { onClick: handleDownloadTemplate, className: "px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-neutral-900 dark:text-neutral-100 text-xs font-medium rounded flex items-center gap-1.5 border border-neutral-300 dark:border-neutral-700 transition-colors", title: "Download CSV template file", children: [_jsx(Download, { size: 13 }), _jsx("span", { children: "Download CSV Template" })] })] })] }), mode === "upload" ? (_jsxs("div", { onDragOver: (e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }, onDragLeave: () => setIsDragging(false), onDrop: (e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleFileUpload(e.dataTransfer.files[0]);
                                }
                            }, className: `border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                                ? "border-accent bg-accent/10"
                                : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-400 dark:border-neutral-600"}`, children: [_jsx(Upload, { size: 32, className: "mx-auto text-neutral-500 mb-3" }), _jsxs("p", { className: "text-sm text-neutral-900 dark:text-neutral-100 font-medium", children: ["Drop your CSV file here, or", " ", _jsxs("label", { className: "text-accent underline cursor-pointer hover:text-accent-hover", children: ["browse from device", _jsx("input", { type: "file", accept: ".csv", className: "hidden", onChange: (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleFileUpload(e.target.files[0]);
                                                        }
                                                    } })] })] }), _jsx("p", { className: "text-xs text-neutral-500 mt-1", children: "Accepted: UTF-8 formatted .CSV files" }), fileName && (_jsxs("div", { className: "mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-neutral-300 dark:border-neutral-700 text-emerald-400 text-xs rounded font-mono", children: [_jsx(CheckCircle2, { size: 13 }), _jsxs("span", { children: [fileName, " (", parsedResult.products.length, " products parsed)"] })] }))] })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400", children: [_jsx("span", { children: "Paste CSV data (headers included):" }), _jsx("button", { onClick: () => setCsvContent(PRO_SEO_CSV_TEMPLATE), className: "text-accent hover:underline text-[11px]", children: "Load Sample CSV Data" })] }), _jsx("textarea", { value: csvContent, onChange: (e) => setCsvContent(e.target.value), rows: 6, placeholder: "sku,nameEn,nameAr,slug,brand,scentFamily,concentration,gender,volumeMl,priceAed,sealedStock,topNotes,heartNotes,baseNotes...", className: "w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-white font-mono text-[11px] p-3 rounded focus:outline-none focus:border-neutral-400 dark:border-neutral-600 leading-relaxed" })] })), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [_jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block", children: "Total Products" }), _jsx("div", { className: "text-xl font-serif text-white mt-1", children: parsedResult.products.length }), _jsx("span", { className: "text-[10px] text-neutral-500", children: "In CSV batch" })] }), _jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-neutral-900 border border-emerald-500/30 rounded", children: [_jsxs("span", { className: "text-[10px] uppercase tracking-wider text-emerald-400 block flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12 }), _jsx("span", { children: "Ready to Import" })] }), _jsx("div", { className: "text-xl font-serif text-emerald-400 mt-1", children: parsedResult.validCount + parsedResult.warningCount }), _jsx("span", { className: "text-[10px] text-neutral-500", children: "Valid products" })] }), _jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-neutral-900 border border-amber-500/30 rounded", children: [_jsxs("span", { className: "text-[10px] uppercase tracking-wider text-amber-400 block flex items-center gap-1", children: [_jsx(Award, { size: 12 }), _jsx("span", { children: "New Brands" })] }), _jsxs("div", { className: "text-xl font-serif text-amber-400 mt-1", children: ["+", parsedResult.newBrandsToCreate.length] }), _jsx("span", { className: "text-[10px] text-neutral-500", children: "Will create brand pages" })] }), _jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-neutral-900 border border-purple-500/30 rounded", children: [_jsxs("span", { className: "text-[10px] uppercase tracking-wider text-purple-400 block flex items-center gap-1", children: [_jsx(Layers, { size: 12 }), _jsx("span", { children: "New Notes" })] }), _jsxs("div", { className: "text-xl font-serif text-purple-400 mt-1", children: ["+", parsedResult.newNotesToCreate.length] }), _jsx("span", { className: "text-[10px] text-neutral-500", children: "Will create note pages" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "font-serif text-sm font-light text-white flex items-center gap-2", children: [_jsx("span", { children: "Import Preview" }), _jsxs("span", { className: "text-[10px] text-neutral-500 dark:text-neutral-400 font-sans", children: ["(", parsedResult.products.length, " products found)"] })] }), _jsxs("span", { className: "text-xs text-neutral-500 dark:text-neutral-400 font-mono", children: ["Storefront domain: ", _jsx("span", { className: "text-emerald-400", children: "https://muschio.luxury" })] })] }), _jsx("div", { className: "border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-x-auto rounded max-h-72", children: _jsxs("table", { className: "w-full text-start text-xs font-sans", children: [_jsx("thead", { className: "bg-neutral-50 dark:bg-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-start", children: "Product" }), _jsx("th", { className: "p-3 text-start", children: "SEO URL" }), _jsx("th", { className: "p-3 text-start", children: "Brand" }), _jsx("th", { className: "p-3 text-start", children: "Notes" }), _jsx("th", { className: "p-3 text-start", children: "Price & Stock" }), _jsx("th", { className: "p-3 text-start", children: "Status" }), _jsx("th", { className: "p-3 text-end", children: "Google Preview" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: parsedResult.products.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-6 text-center text-neutral-500 text-xs", children: "No product rows detected. Upload a .csv file or paste CSV content above." }) })) : (parsedResult.products.map((p) => (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: "hover:bg-slate-900/60 transition-colors", children: [_jsxs("td", { className: "p-3", children: [_jsx("span", { className: "font-medium text-white block", children: p.nameEn }), _jsx("span", { className: "text-neutral-500 dark:text-neutral-400 text-[11px]", dir: "rtl", children: p.nameAr }), _jsx("span", { className: "text-neutral-500 font-mono text-[10px] block mt-0.5", children: p.sku })] }), _jsxs("td", { className: "p-3 font-mono text-[11px]", children: [_jsx("span", { className: "text-neutral-500", children: "/en/product/" }), _jsx("span", { className: "text-emerald-400 font-medium", children: p.slug || "auto-generated" })] }), _jsxs("td", { className: "p-3", children: [_jsx("span", { className: "text-neutral-900 dark:text-neutral-100 block font-medium", children: p.brand }), p.isNewBrand ? (_jsx("span", { className: "text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30", children: "+Auto-create brand" })) : (_jsx("span", { className: "text-[9px] text-emerald-400", children: "\u2713 In directory" }))] }), _jsx("td", { className: "p-3 text-[11px]", children: _jsxs("div", { className: "space-y-0.5", children: [_jsxs("span", { className: "text-neutral-700 dark:text-neutral-300 block", children: ["Top: ", p.topNotes.length, " \u2022 Heart: ", p.heartNotes.length, " \u2022 Base: ", p.baseNotes.length] }), p.newNotesCount > 0 && (_jsxs("span", { className: "text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded block w-fit", children: ["+", p.newNotesCount, " new notes"] }))] }) }), _jsxs("td", { className: "p-3 font-mono text-xs", children: [_jsx("span", { className: "text-white block", children: p.price }), _jsxs("span", { className: "text-neutral-500 dark:text-neutral-400 text-[10px]", children: [p.stock, " sealed (", p.warehouse, ")"] })] }), _jsxs("td", { className: "p-3", children: [p.validationStatus === "VALID" ? (_jsxs("span", { className: "px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit", children: [_jsx(CheckCircle2, { size: 11 }), _jsx("span", { children: "SEO Ready" })] })) : p.validationStatus === "WARNING" ? (_jsxs("span", { className: "px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit", children: [_jsx(AlertTriangle, { size: 11 }), _jsx("span", { children: "Optimization Ready" })] })) : (_jsxs("span", { className: "px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded flex items-center gap-1 w-fit", children: [_jsx(XCircle, { size: 11 }), _jsx("span", { children: "Invalid" })] })), p.validationMessages.length > 0 && (_jsx("div", { className: "text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 space-y-0.5 max-w-xs", children: p.validationMessages.map((m, i) => (_jsxs("div", { children: ["\u2022 ", m] }, i))) }))] }), _jsx("td", { className: "p-3 text-end", children: _jsxs("button", { onClick: () => setPreviewSerpSku(previewSerpSku === p.sku ? null : p.sku), className: "px-2 py-1 bg-slate-800 hover:bg-slate-700 text-neutral-700 dark:text-neutral-300 text-[10px] rounded border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 ml-auto transition-colors", children: [_jsx(Search, { size: 11 }), _jsx("span", { children: previewSerpSku === p.sku ? "Hide SERP" : "View SERP" })] }) })] }), previewSerpSku === p.sku && (_jsx("tr", { className: "bg-neutral-50 dark:bg-neutral-900 border-t border-b border-emerald-500/30", children: _jsx("td", { colSpan: 7, className: "p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400", children: [_jsxs("span", { className: "font-semibold text-emerald-400 flex items-center gap-1", children: [_jsx(Globe, { size: 13 }), _jsx("span", { children: "Google Search Engine Result Snippet (Desktop & Mobile SERP)" })] }), _jsx("span", { className: "text-[10px] font-mono", children: "Structured Data: Schema.org Product" })] }), _jsxs("div", { className: "bg-neutral-50 dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-800 font-sans max-w-2xl space-y-1", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400", children: [_jsx("span", { className: "text-neutral-700 dark:text-neutral-300", children: "https://muschio.luxury" }), _jsx("span", { children: "\u203A" }), _jsx("span", { children: "en" }), _jsx("span", { children: "\u203A" }), _jsxs("span", { className: "text-neutral-500 dark:text-neutral-400 font-mono", children: ["product \u203A ", p.slug] })] }), _jsx("h4", { className: "text-base text-[#8AB4F8] hover:underline cursor-pointer font-medium leading-snug", children: p.metaTitle || generateProductMetaTitle(p.nameEn, p.brand) }), _jsx("p", { className: "text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-0.5", children: p.metaDescription || generateProductMetaDescription(p.nameEn, p.brand, p.concentration, p.topNotes) }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800/80 mt-2 font-mono", children: [_jsx("span", { className: "text-emerald-400", children: "Rating: 5.0 \u2605\u2605\u2605\u2605\u2605" }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Price: ", p.price] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "text-emerald-400", children: ["In stock (", p.warehouse, ")"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Brand: ", p.brand] })] })] })] }) }) }))] }, p.sku)))) })] }) })] })] }), _jsxs("div", { className: "px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black flex items-center justify-between", children: [_jsxs("div", { className: "text-xs text-neutral-500 dark:text-neutral-400 font-sans", children: ["Ready to import:", " ", _jsx("span", { className: "text-white font-semibold", children: parsedResult.validCount + parsedResult.warningCount }), " ", "valid products (", _jsxs("span", { className: "text-amber-400", children: ["+", parsedResult.newBrandsToCreate.length, " new brands"] }), ",", " ", _jsxs("span", { className: "text-purple-400", children: ["+", parsedResult.newNotesToCreate.length, " new notes"] }), ")"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-white rounded text-xs transition-colors", children: "Cancel" }), _jsxs("button", { onClick: handleExecuteImport, disabled: parsedResult.validCount + parsedResult.warningCount === 0, className: "px-5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40", children: [_jsx(CheckCircle2, { size: 14 }), _jsxs("span", { children: ["Import ", parsedResult.validCount + parsedResult.warningCount, " Products"] })] })] })] })] }) }));
}
//# sourceMappingURL=BulkCsvModal.js.map