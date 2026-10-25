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
        perfumer: "In-House Nose",
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
                perfumer: brandToEdit.perfumer,
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
                perfumer: "Master Perfumer",
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
            perfumer: formData.perfumer.trim(),
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
    return (_jsx("div", { className: "fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-[#111622] border border-slate-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1420]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400", children: _jsx(Award, { size: 18 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-serif text-lg font-light text-white", children: brandToEdit ? `Edit Brand: ${brandToEdit.name}` : "Add Brand" }), _jsx("p", { className: "text-xs text-slate-400 font-sans", children: "Brand details, origin, and SEO settings" })] })] }), _jsx("button", { onClick: onClose, className: "p-1 text-slate-400 hover:text-white rounded", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 overflow-y-auto flex-1 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Brand Name *" }), _jsx("input", { type: "text", placeholder: "e.g. Amouage or Clive Christian", value: formData.name, onChange: (e) => handleNameChange(e.target.value), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded focus:outline-none focus:border-slate-600", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Brand Type" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "NICHE", children: "Niche Brand" }), _jsx("option", { value: "DESIGNER", children: "Designer Brand" })] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "URL Slug *" }), _jsxs("span", { className: "text-[10px] text-emerald-400 font-mono", children: ["Storefront: /en/brands/", formData.slug || "slug"] })] }), _jsx("input", { type: "text", placeholder: "e.g. amouage", value: formData.slug, onChange: (e) => setFormData({ ...formData, slug: slugify(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-emerald-400 font-mono p-2.5 rounded focus:outline-none focus:border-slate-600", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Country (English)" }), _jsx("input", { type: "text", placeholder: "e.g. Sultanate of Oman", value: formData.countryEn, onChange: (e) => setFormData({ ...formData, countryEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Country (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "e.g. \u0633\u0644\u0637\u0646\u0629 \u0639\u064F\u0645\u0627\u0646", value: formData.countryAr, onChange: (e) => setFormData({ ...formData, countryAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Founding Year" }), _jsx("input", { type: "number", value: formData.year, onChange: (e) => setFormData({ ...formData, year: Number(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Perfumer(s)" }), _jsx("input", { type: "text", placeholder: "e.g. Pierre Negrin, Karine Vinchon", value: formData.perfumer, onChange: (e) => setFormData({ ...formData, perfumer: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800", children: [_jsx(MediaUploadField, { label: "Brand Logo", value: formData.logoUrl, onChange: (url) => setFormData({ ...formData, logoUrl: url }), folder: "muschio/brands/logos", helperText: "Upload transparent PNG/SVG maison crest", placeholder: "https://res.cloudinary.com/zwkad4sz/image/upload/..." }), _jsx(MediaUploadField, { label: "Brand Hero Banner / Flacon Photography", value: formData.heroImageUrl, onChange: (url) => setFormData({ ...formData, heroImageUrl: url }), folder: "muschio/brands/heroes", helperText: "High-res banner for maison landing page", placeholder: "https://res.cloudinary.com/zwkad4sz/image/upload/..." })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-slate-800", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Brand Description (English)" }), _jsx("textarea", { rows: 3, placeholder: "Established in 1983 in the Sultanate of Oman...", value: formData.storyEn, onChange: (e) => setFormData({ ...formData, storyEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded text-xs leading-relaxed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Brand Description (Arabic)" }), _jsx("textarea", { rows: 3, dir: "rtl", placeholder: "\u062A\u0623\u0633\u0633\u062A \u0639\u0627\u0645 1983 \u0641\u064A \u0633\u0644\u0637\u0646\u0629 \u0639\u064F\u0645\u0627\u0646...", value: formData.storyAr, onChange: (e) => setFormData({ ...formData, storyAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded text-xs leading-relaxed" })] })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-slate-800", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "SEO Title (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaTitle.length > 60 ? "text-amber-400" : "text-slate-500"}`, children: [formData.metaTitle.length, "/60 chars"] })] }), _jsx("input", { type: "text", placeholder: generateBrandMetaTitle(formData.name || "Brand"), value: formData.metaTitle, onChange: (e) => setFormData({ ...formData, metaTitle: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "SEO Description (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaDescription.length > 160 ? "text-amber-400" : "text-slate-500"}`, children: [formData.metaDescription.length, "/160 chars"] })] }), _jsx("textarea", { rows: 2, placeholder: generateBrandMetaDescription(formData.name || "Brand", formData.countryEn), value: formData.metaDescription, onChange: (e) => setFormData({ ...formData, metaDescription: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded leading-relaxed" })] })] }), _jsxs("div", { className: "p-3.5 bg-[#080B10] border border-slate-800 rounded space-y-1 font-sans", children: [_jsxs("span", { className: "text-[10px] text-emerald-400 font-semibold block flex items-center gap-1", children: [_jsx(Globe, { size: 11 }), _jsx("span", { children: "Google Search Preview" })] }), _jsxs("div", { className: "text-xs text-slate-400 flex items-center gap-1", children: [_jsx("span", { children: "https://muschio.luxury" }), _jsx("span", { children: "\u203A" }), _jsx("span", { children: "en" }), _jsx("span", { children: "\u203A" }), _jsxs("span", { className: "font-mono text-slate-300", children: ["brands \u203A ", formData.slug || "slug"] })] }), _jsx("div", { className: "text-sm text-[#8AB4F8] hover:underline font-medium", children: formData.metaTitle || generateBrandMetaTitle(formData.name || "Brand") }), _jsx("div", { className: "text-xs text-slate-300 leading-relaxed", children: formData.metaDescription || generateBrandMetaDescription(formData.name || "Brand", formData.countryEn) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded flex items-center gap-1.5 transition-colors", children: [_jsx(CheckCircle2, { size: 14 }), _jsx("span", { children: "Save Brand" })] })] })] })] }) }));
}
//# sourceMappingURL=BrandModal.js.map