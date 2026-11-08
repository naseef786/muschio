import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Tag, CheckCircle2, Sparkles } from "lucide-react";
import { slugify } from "../seo-utils";
const COLOR_PRESETS = [
    { name: "Luxury Gold", hex: "#D4AF37" },
    { name: "Deep Onyx", hex: "#171717" },
    { name: "Royal Amber", hex: "#D97706" },
    { name: "Desert Sand", hex: "#B45309" },
    { name: "Imperial Violet", hex: "#7C3AED" },
    { name: "Emerald Oud", hex: "#059669" },
    { name: "Damascus Rose", hex: "#E11D48" },
    { name: "Sapphire Night", hex: "#2563EB" },
    { name: "Platinum Grey", hex: "#525252" },
];
export function TagModal({ isOpen, onClose, tagToEdit, onSave }) {
    const [formData, setFormData] = useState({
        nameEn: "",
        nameAr: "",
        slug: "",
        description: "",
        colorHex: "#D4AF37",
        isFeatured: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (tagToEdit) {
            setFormData({
                nameEn: tagToEdit.nameEn,
                nameAr: tagToEdit.nameAr || tagToEdit.nameEn,
                slug: tagToEdit.slug,
                description: tagToEdit.description || "",
                colorHex: tagToEdit.colorHex || "#D4AF37",
                isFeatured: Boolean(tagToEdit.isFeatured),
            });
        }
        else {
            setFormData({
                nameEn: "",
                nameAr: "",
                slug: "",
                description: "",
                colorHex: "#D4AF37",
                isFeatured: true,
            });
        }
    }, [tagToEdit, isOpen]);
    const handleNameEnChange = (val) => {
        const updated = { ...formData, nameEn: val };
        if (!tagToEdit) {
            updated.slug = slugify(val);
        }
        setFormData(updated);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nameEn.trim()) {
            alert("English name is required.");
            return;
        }
        const finalSlug = (formData.slug.trim() || slugify(formData.nameEn)).toLowerCase();
        const tag = {
            id: tagToEdit ? tagToEdit.id : `tag-${Date.now()}`,
            nameEn: formData.nameEn.trim(),
            nameAr: formData.nameAr.trim() || formData.nameEn.trim(),
            slug: finalSlug,
            description: formData.description.trim() || undefined,
            colorHex: formData.colorHex || "#D4AF37",
            isFeatured: formData.isFeatured,
            productCount: tagToEdit?.productCount ?? 0,
            createdAt: tagToEdit?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        try {
            setIsSubmitting(true);
            await onSave(tag);
            onClose();
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn", children: _jsxs("div", { className: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 bg-neutral-100 dark:bg-neutral-900 rounded text-neutral-800 dark:text-neutral-200", children: _jsx(Tag, { size: 18 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: tagToEdit ? "Edit Fragrance Tag" : "Create New Fragrance Tag" }), _jsx("p", { className: "text-[11px] text-neutral-500", children: tagToEdit ? `Updating #${tagToEdit.slug}` : "Curate tags for product discovery & filters" })] })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors", children: _jsx(X, { size: 16 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-5 space-y-4 overflow-y-auto text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1 font-medium", children: "Tag Name (English) *" }), _jsx("input", { type: "text", required: true, placeholder: "e.g. Signature Scent", value: formData.nameEn, onChange: (e) => handleNameEnChange(e.target.value), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1 font-medium", children: "Tag Name (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "\u0645\u062B\u0627\u0644: \u0639\u0637\u0631 \u0645\u0645\u064A\u0632 \u0648\u0628\u0627\u0631\u0632", value: formData.nameAr, onChange: (e) => setFormData({ ...formData, nameAr: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white font-sans" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1 font-medium", children: "Slug Identifier (URL / Filter Key) *" }), _jsx("input", { type: "text", required: true, placeholder: "e.g. signature-scent", value: formData.slug, onChange: (e) => setFormData({ ...formData, slug: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white" }), _jsxs("p", { className: "text-[10px] text-neutral-400 mt-1", children: ["Storefront filter URL: ", _jsxs("span", { className: "font-mono", children: ["/shop?tag=", formData.slug || "tag-slug"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1.5 font-medium", children: "Accent Color Indicator" }), _jsx("div", { className: "flex flex-wrap items-center gap-2 mb-2", children: COLOR_PRESETS.map((p) => {
                                        const isSelected = formData.colorHex.toLowerCase() === p.hex.toLowerCase();
                                        return (_jsxs("button", { type: "button", onClick: () => setFormData({ ...formData, colorHex: p.hex }), title: p.name, className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${isSelected
                                                ? "border-black dark:border-white ring-1 ring-black dark:ring-white bg-neutral-100 dark:bg-neutral-800 font-semibold"
                                                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400"}`, children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: p.hex } }), _jsx("span", { className: "text-neutral-700 dark:text-neutral-300", children: p.name })] }, p.hex));
                                    }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: formData.colorHex, onChange: (e) => setFormData({ ...formData, colorHex: e.target.value }), className: "w-9 h-9 p-0.5 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer bg-white dark:bg-black" }), _jsx("input", { type: "text", placeholder: "#D4AF37", value: formData.colorHex, onChange: (e) => setFormData({ ...formData, colorHex: e.target.value }), className: "w-28 font-mono bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-neutral-700 dark:text-neutral-300 mb-1 font-medium", children: "Curatorial Description / Note (Optional)" }), _jsx("textarea", { rows: 2, placeholder: "e.g. Flacons defined by commanding sillage and exceptional longevity.", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white leading-relaxed" })] }), _jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { size: 16, className: "text-amber-500" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-neutral-900 dark:text-white block", children: "Featured on Storefront Filter Strip" }), _jsx("span", { className: "text-[11px] text-neutral-500", children: "Highlight this tag prominently in the trending filter bar on /shop" })] })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.isFeatured, onChange: (e) => setFormData({ ...formData, isFeatured: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black" })] })] }), _jsxs("div", { className: "p-3 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-1.5", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-neutral-400 font-medium block", children: "Live Badge Preview (Storefront & Admin)" }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { backgroundColor: formData.colorHex } }), _jsx("span", { children: formData.nameEn || "Tag Preview" })] }), _jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { backgroundColor: formData.colorHex } }), _jsx("span", { children: formData.nameAr || formData.nameEn || "معاينة التصنيف" })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isSubmitting, className: "px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors", children: "Cancel" }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50", children: [_jsx(CheckCircle2, { size: 14 }), _jsx("span", { children: isSubmitting ? "Saving..." : tagToEdit ? "Update Tag" : "Create Tag" })] })] })] })] }) }));
}
//# sourceMappingURL=TagModal.js.map