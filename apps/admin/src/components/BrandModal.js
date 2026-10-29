import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Award, Globe, CheckCircle2 } from "lucide-react";
import { slugify, generateBrandMetaTitle, generateBrandMetaDescription } from "../seo-utils";
import { MediaUploadField } from "./MediaUploadField";
export function BrandModal({ isOpen, onClose, brandToEdit, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        type: "NICHE",
        countryEn: "France",
        countryAr: "فرنسا",
        year: 2020,
        storyEn: "",
        storyAr: "",
        metaTitle: "",
        metaDescription: "",
        logoUrl: "",
        heroImageUrl: "",
    });
    useEffect(() => {
        if (brandToEdit) {
            setFormData({
                name: brandToEdit.name,
                slug: brandToEdit.slug,
                type: brandToEdit.type,
                countryEn: brandToEdit.countryEn,
                countryAr: brandToEdit.countryAr,
                year: brandToEdit.year,
                storyEn: brandToEdit.storyEn,
                storyAr: brandToEdit.storyAr,
                metaTitle: brandToEdit.metaTitle,
                metaDescription: brandToEdit.metaDescription,
                logoUrl: brandToEdit.logoUrl || "",
                heroImageUrl: brandToEdit.heroImageUrl || "",
            });
        }
        else {
            setFormData({
                name: "",
                slug: "",
                type: "NICHE",
                countryEn: "Sultanate of Oman",
                countryAr: "سلطنة عُمان",
                year: 1983,
                storyEn: "",
                storyAr: "",
                metaTitle: "",
                metaDescription: "",
                logoUrl: "",
                heroImageUrl: "",
            });
        }
    }, [brandToEdit, isOpen]);
    // Handle auto slugification
    const handleNameChange = (val) => {
        const updated = { ...formData, name: val };
        if (!brandToEdit || !formData.slug) {
            updated.slug = slugify(val);
            updated.metaTitle = generateBrandMetaTitle(val);
            updated.metaDescription = generateBrandMetaDescription(val, formData.countryEn);
        }
        setFormData(updated);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim())
            return;
        const finalSlug = formData.slug.trim() || slugify(formData.name);
        const finalMetaTitle = formData.metaTitle.trim() || generateBrandMetaTitle(formData.name);
        const finalMetaDesc = formData.metaDescription.trim() || generateBrandMetaDescription(formData.name, formData.countryEn);
        const brand = {
            id: brandToEdit ? brandToEdit.id : `brand-${Date.now()}`,
            name: formData.name.trim(),
            slug: finalSlug,
            type: formData.type,
            countryEn: formData.countryEn.trim(),
            countryAr: formData.countryAr.trim(),
            year: Number(formData.year) || 2020,
            storyEn: formData.storyEn.trim(),
            storyAr: formData.storyAr.trim(),
            metaTitle: finalMetaTitle,
            metaDescription: finalMetaDesc,
            logoUrl: formData.logoUrl.trim(),
            heroImageUrl: formData.heroImageUrl.trim(),
            perfumesCount: brandToEdit ? brandToEdit.perfumesCount : 0,
        };
        onSave(brand);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto", children: [_jsxs("div", { className: "px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-black", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded bg-black text-white dark:bg-white dark:text-black", children: _jsx(Award, { size: 18 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-serif text-lg font-light text-neutral-900 dark:text-white", children: brandToEdit ? `Edit Brand: ${brandToEdit.name}` : "Add Brand" }), _jsx("p", { className: "text-xs text-neutral-500 font-sans", children: "Brand details, origin, and SEO settings" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Brand Name *" }), _jsx("input", { type: "text", placeholder: "e.g. Amouage or Clive Christian", value: formData.name, onChange: (e) => handleNameChange(e.target.value), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Brand Type" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md", children: [_jsx("option", { value: "NICHE", children: "Niche Brand" }), _jsx("option", { value: "DESIGNER", children: "Designer Brand" })] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-neutral-700 dark:text-neutral-300", children: "URL Slug *" }), _jsxs("span", { className: "text-[10px] text-neutral-500 font-mono", children: ["Storefront: /en/brands/", formData.slug || "slug"] })] }), _jsx("input", { type: "text", placeholder: "e.g. amouage", value: formData.slug, onChange: (e) => setFormData({ ...formData, slug: slugify(e.target.value) }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Country (English)" }), _jsx("input", { type: "text", placeholder: "e.g. Sultanate of Oman", value: formData.countryEn, onChange: (e) => setFormData({ ...formData, countryEn: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Country (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "e.g. \u0633\u0644\u0637\u0646\u0629 \u0639\u064F\u0645\u0627\u0646", value: formData.countryAr, onChange: (e) => setFormData({ ...formData, countryAr: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Founding Year" }), _jsx("input", { type: "number", value: formData.year, onChange: (e) => setFormData({ ...formData, year: Number(e.target.value) }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md font-mono" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800", children: [_jsx(MediaUploadField, { label: "Brand Logo", value: formData.logoUrl, onChange: (url) => setFormData({ ...formData, logoUrl: url }), folder: "muschio/brands/logos", helperText: "Upload transparent PNG/SVG maison crest", placeholder: "https://res.cloudinary.com/zwkad4sz/image/upload/..." }), _jsx(MediaUploadField, { label: "Brand Hero Banner / Flacon Photography", value: formData.heroImageUrl, onChange: (url) => setFormData({ ...formData, heroImageUrl: url }), folder: "muschio/brands/heroes", helperText: "High-res banner for maison landing page", placeholder: "https://res.cloudinary.com/zwkad4sz/image/upload/..." })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Brand Description (English)" }), _jsx("textarea", { rows: 3, placeholder: "Established in 1983 in the Sultanate of Oman...", value: formData.storyEn, onChange: (e) => setFormData({ ...formData, storyEn: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1", children: "Brand Description (Arabic)" }), _jsx("textarea", { rows: 3, dir: "rtl", placeholder: "\u062A\u0623\u0633\u0633\u062A \u0639\u0627\u0645 1983 \u0641\u064A \u0633\u0644\u0637\u0646\u0629 \u0639\u064F\u0645\u0627\u0646...", value: formData.storyAr, onChange: (e) => setFormData({ ...formData, storyAr: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed" })] })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-neutral-700 dark:text-neutral-300", children: "SEO Title (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaTitle.length > 60 ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`, children: [formData.metaTitle.length, "/60 chars"] })] }), _jsx("input", { type: "text", placeholder: generateBrandMetaTitle(formData.name || "Brand"), value: formData.metaTitle, onChange: (e) => setFormData({ ...formData, metaTitle: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-neutral-700 dark:text-neutral-300", children: "SEO Description (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaDescription.length > 160 ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`, children: [formData.metaDescription.length, "/160 chars"] })] }), _jsx("textarea", { rows: 2, placeholder: generateBrandMetaDescription(formData.name || "Brand", formData.countryEn), value: formData.metaDescription, onChange: (e) => setFormData({ ...formData, metaDescription: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md leading-relaxed" })] })] }), _jsxs("div", { className: "p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md space-y-1 font-sans", children: [_jsxs("span", { className: "text-[10px] text-neutral-900 dark:text-white font-semibold flex items-center gap-1", children: [_jsx(Globe, { size: 11 }), _jsx("span", { children: "Google Search Preview" })] }), _jsxs("div", { className: "text-xs text-neutral-500 flex items-center gap-1", children: [_jsx("span", { children: "https://muschio.luxury" }), _jsx("span", { children: "\u203A" }), _jsx("span", { children: "en" }), _jsx("span", { children: "\u203A" }), _jsxs("span", { className: "font-mono text-neutral-700 dark:text-neutral-300", children: ["brands \u203A ", formData.slug || "slug"] })] }), _jsx("div", { className: "text-sm text-neutral-900 dark:text-white font-medium hover:underline", children: formData.metaTitle || generateBrandMetaTitle(formData.name || "Brand") }), _jsx("div", { className: "text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed", children: formData.metaDescription || generateBrandMetaDescription(formData.name || "Brand", formData.countryEn) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-md", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors", children: [_jsx(CheckCircle2, { size: 14 }), _jsx("span", { children: "Save Brand" })] })] })] })] }) }));
}
//# sourceMappingURL=BrandModal.js.map