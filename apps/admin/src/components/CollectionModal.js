import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Sparkles, Search, ChevronUp, ChevronDown, Check, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { slugify } from "../seo-utils";
import { MediaUploadField } from "./MediaUploadField";
export function CollectionModal({ isOpen, onClose, collectionToEdit, onSave, allProducts, }) {
    const [nameEn, setNameEn] = useState("");
    const [nameAr, setNameAr] = useState("");
    const [slug, setSlug] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionAr, setDescriptionAr] = useState("");
    const [heroImageUrl, setHeroImageUrl] = useState("");
    const [isFeatured, setIsFeatured] = useState(true);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(() => {
        if (collectionToEdit) {
            setNameEn(collectionToEdit.nameEn || "");
            setNameAr(collectionToEdit.nameAr || "");
            setSlug(collectionToEdit.slug || "");
            setDescriptionEn(collectionToEdit.descriptionEn || "");
            setDescriptionAr(collectionToEdit.descriptionAr || "");
            setHeroImageUrl(collectionToEdit.heroImageUrl || "");
            setIsFeatured(Boolean(collectionToEdit.isFeatured));
            setSelectedProductIds(collectionToEdit.productIds || collectionToEdit.products?.map((p) => p.id) || []);
        }
        else {
            setNameEn("");
            setNameAr("");
            setSlug("");
            setDescriptionEn("");
            setDescriptionAr("");
            setHeroImageUrl("");
            setIsFeatured(true);
            setSelectedProductIds([]);
        }
        setErrorMsg("");
        setSearchQuery("");
    }, [collectionToEdit, isOpen]);
    const handleNameEnChange = (e) => {
        const val = e.target.value;
        setNameEn(val);
        if (!collectionToEdit) {
            setSlug(slugify(val));
        }
    };
    const handleToggleProduct = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
        }
        else {
            setSelectedProductIds([...selectedProductIds, id]);
        }
    };
    const moveProduct = (index, direction) => {
        const newIds = [...selectedProductIds];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newIds.length)
            return;
        const current = newIds[index];
        const target = newIds[targetIndex];
        if (!current || !target)
            return;
        newIds[index] = target;
        newIds[targetIndex] = current;
        setSelectedProductIds(newIds);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nameEn.trim()) {
            setErrorMsg("English collection name is required");
            return;
        }
        setIsSaving(true);
        setErrorMsg("");
        try {
            await onSave({
                id: collectionToEdit?.id,
                nameEn: nameEn.trim(),
                nameAr: nameAr.trim() || nameEn.trim(),
                slug: slug.trim() || slugify(nameEn),
                descriptionEn: descriptionEn.trim(),
                descriptionAr: descriptionAr.trim(),
                heroImageUrl: heroImageUrl.trim(),
                isFeatured,
                productIds: selectedProductIds,
            });
            onClose();
        }
        catch (err) {
            setErrorMsg(err?.message || "Failed to save collection");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (!isOpen)
        return null;
    // Selected products mapped with full item info
    const selectedProducts = selectedProductIds
        .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
        .filter(Boolean);
    // Filter available products
    const availableProducts = allProducts.filter((p) => {
        if (!searchQuery.trim())
            return true;
        const query = searchQuery.toLowerCase();
        return (p.name.toLowerCase().includes(query) ||
            (p.nameAr && p.nameAr.toLowerCase().includes(query)) ||
            p.brand.toLowerCase().includes(query) ||
            (p.concentration && p.concentration.toLowerCase().includes(query)));
    });
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto", children: _jsxs("div", { className: "relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E121A] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl overflow-hidden font-sans", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center", children: _jsx(Sparkles, { size: 16 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: collectionToEdit ? "Edit Curated Collection" : "Create New Collection" }), _jsx("p", { className: "text-[11px] text-neutral-500", children: "Curate fragrance flacons and display order according to admin preference." })] })] }), _jsx("button", { type: "button", onClick: onClose, className: "p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md transition-colors", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex-1 overflow-y-auto p-6 space-y-6", children: [errorMsg && (_jsx("div", { className: "p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400", children: errorMsg })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: ["Collection Name (English) ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: nameEn, onChange: handleNameEnChange, placeholder: "e.g. Royal Extraits 2026", className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Collection Name (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", value: nameAr, onChange: (e) => setNameAr(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u062E\u0644\u0627\u0635\u0627\u062A \u0627\u0644\u0639\u0637\u0648\u0631 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0662\u0660\u0662\u0666", className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: ["URL Slug ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: slug, onChange: (e) => setSlug(e.target.value), placeholder: "royal-extraits-2026", className: "w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Featured on Storefront Slider" }), _jsxs("label", { className: "flex items-center gap-2.5 mt-2 cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", checked: isFeatured, onChange: (e) => setIsFeatured(e.target.checked), className: "rounded border-neutral-300 text-black focus:ring-black h-4 w-4" }), _jsx("span", { className: "text-xs text-neutral-700 dark:text-neutral-300", children: "Feature this collection in the Storefront Collection Slider" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Description (English)" }), _jsx("textarea", { rows: 2, value: descriptionEn, onChange: (e) => setDescriptionEn(e.target.value), placeholder: "Curated selection of our highest concentration perfumes...", className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Description (Arabic)" }), _jsx("textarea", { rows: 2, dir: "rtl", value: descriptionAr, onChange: (e) => setDescriptionAr(e.target.value), placeholder: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u0646\u062A\u0642\u0627\u0629 \u0645\u0646 \u0623\u0646\u062F\u0631 \u062E\u0644\u0627\u0635\u0627\u062A \u0627\u0644\u0639\u0637\u0648\u0631 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u0641\u0627\u0626\u0642\u0629...", className: "w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] })] }), _jsx("div", { children: _jsx(MediaUploadField, { label: "Collection Cover / Hero Image", value: heroImageUrl, onChange: setHeroImageUrl, hint: "Upload or paste a cover image for this collection.", folder: "muschio/collections" }) }), _jsxs("div", { className: "border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50/50 dark:bg-neutral-900/20 space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white", children: "Curate Products in Collection" }), _jsx("p", { className: "text-[11px] text-neutral-500", children: "Select and order products according to your preference. They will slide in this exact order." })] }), _jsxs("span", { className: "text-xs px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium self-start sm:self-auto", children: [selectedProductIds.length, " Flacons Selected"] })] }), selectedProducts.length > 0 && (_jsxs("div", { className: "space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md p-2 bg-white dark:bg-neutral-950 max-h-56 overflow-y-auto", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-2 block mb-1", children: "Slide Sequence (Admin Preference Order)" }), selectedProducts.map((p, idx) => (_jsxs("div", { className: "flex items-center justify-between p-2 rounded border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [_jsx("span", { className: "w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold text-[10px] shrink-0", children: idx + 1 }), _jsx("div", { className: "w-8 h-8 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center", children: p.imageUrl || p.images?.[0] ? (_jsx("img", { src: p.imageUrl || p.images?.[0], alt: p.name, className: "w-full h-full object-contain" })) : (_jsx(ImageIcon, { size: 14, className: "text-neutral-400" })) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-medium text-neutral-900 dark:text-white truncate", children: p.name }), _jsxs("p", { className: "text-[10px] text-neutral-400 truncate", children: [p.brand, " \u2022 AED ", p.price] })] })] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0 ps-2", children: [_jsx("button", { type: "button", onClick: () => moveProduct(idx, "up"), disabled: idx === 0, title: "Move Earlier in Slide", className: "p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed", children: _jsx(ChevronUp, { size: 15 }) }), _jsx("button", { type: "button", onClick: () => moveProduct(idx, "down"), disabled: idx === selectedProducts.length - 1, title: "Move Later in Slide", className: "p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed", children: _jsx(ChevronDown, { size: 15 }) }), _jsx("button", { type: "button", onClick: () => handleToggleProduct(p.id), title: "Remove from Collection", className: "p-1 rounded text-red-500 hover:text-red-700 transition-colors ms-1", children: _jsx(Trash2, { size: 13 }) })] })] }, p.id)))] })), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search catalog by perfume name, brand, or concentration...", className: "w-full pl-9 pr-3 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded p-2 bg-white dark:bg-neutral-950", children: availableProducts.map((p) => {
                                                const isSelected = selectedProductIds.includes(p.id);
                                                return (_jsxs("div", { onClick: () => handleToggleProduct(p.id), className: `flex items-center justify-between p-2 rounded cursor-pointer border transition-all text-xs ${isSelected
                                                        ? "bg-neutral-100 dark:bg-neutral-900 border-black dark:border-white shadow-sm"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-transparent"}`, children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("div", { className: "w-7 h-7 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center overflow-hidden", children: p.imageUrl || p.images?.[0] ? (_jsx("img", { src: p.imageUrl || p.images?.[0], alt: p.name, className: "w-full h-full object-contain" })) : (_jsx(ImageIcon, { size: 12, className: "text-neutral-400" })) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-medium text-neutral-900 dark:text-white truncate text-[11px]", children: p.name }), _jsx("p", { className: "text-[10px] text-neutral-400 truncate", children: p.brand })] })] }), _jsx("div", { className: "shrink-0 ps-1", children: isSelected ? (_jsxs("span", { className: "flex items-center gap-1 text-[10px] font-semibold text-black dark:text-white", children: [_jsx(Check, { size: 13 }), _jsx("span", { children: "Added" })] })) : (_jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-neutral-500 hover:text-black dark:hover:text-white", children: [_jsx(Plus, { size: 13 }), _jsx("span", { children: "Add" })] })) })] }, p.id));
                                            }) })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isSaving, className: "px-4 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSaving, className: "px-5 py-2 text-xs font-medium rounded bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-black/10", children: isSaving ? (_jsx("span", { children: "Saving Collection..." })) : (_jsxs(_Fragment, { children: [_jsx(Check, { size: 14 }), _jsx("span", { children: collectionToEdit ? "Update Collection" : "Create Collection" })] })) })] })] })] }) }));
}
//# sourceMappingURL=CollectionModal.js.map