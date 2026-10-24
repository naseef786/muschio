import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { X, Layers, Globe, CheckCircle2 } from "lucide-react";
import { slugify, generateNoteMetaTitle, generateNoteMetaDescription } from "../seo-utils";
export function NoteModal({ isOpen, onClose, noteToEdit, onSave }) {
    const [formData, setFormData] = useState({
        nameEn: "",
        nameAr: "",
        slug: "",
        family: "Floral",
        originEn: "Taif Mountains, Saudi Arabia",
        originAr: "جبال الطائف، السعودية",
        descriptionEn: "",
        descriptionAr: "",
        metaTitle: "",
        metaDescription: "",
        status: "PUBLISHED",
    });
    useEffect(() => {
        if (noteToEdit) {
            setFormData({
                nameEn: noteToEdit.nameEn,
                nameAr: noteToEdit.nameAr,
                slug: noteToEdit.slug,
                family: noteToEdit.family,
                originEn: noteToEdit.originEn || "Middle East",
                originAr: noteToEdit.originAr || "الشرق الأوسط",
                descriptionEn: noteToEdit.descriptionEn || "",
                descriptionAr: noteToEdit.descriptionAr || "",
                metaTitle: noteToEdit.metaTitle || "",
                metaDescription: noteToEdit.metaDescription || "",
                status: noteToEdit.status,
            });
        }
        else {
            setFormData({
                nameEn: "",
                nameAr: "",
                slug: "",
                family: "Floral",
                originEn: "Taif Mountains, Saudi Arabia",
                originAr: "جبال الطائف، السعودية",
                descriptionEn: "",
                descriptionAr: "",
                metaTitle: "",
                metaDescription: "",
                status: "PUBLISHED",
            });
        }
    }, [noteToEdit, isOpen]);
    const handleNameEnChange = (val) => {
        const updated = { ...formData, nameEn: val };
        if (!noteToEdit || !formData.slug) {
            updated.slug = slugify(val);
            updated.metaTitle = generateNoteMetaTitle(val, formData.family);
            updated.metaDescription = generateNoteMetaDescription(val, formData.originEn);
        }
        setFormData(updated);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nameEn.trim())
            return;
        const finalSlug = formData.slug.trim() || slugify(formData.nameEn);
        const finalMetaTitle = formData.metaTitle.trim() || generateNoteMetaTitle(formData.nameEn, formData.family);
        const finalMetaDesc = formData.metaDescription.trim() || generateNoteMetaDescription(formData.nameEn, formData.originEn);
        const note = {
            id: noteToEdit ? noteToEdit.id : `note-${Date.now()}`,
            nameEn: formData.nameEn.trim(),
            nameAr: formData.nameAr.trim() || formData.nameEn.trim(),
            slug: finalSlug,
            family: formData.family,
            originEn: formData.originEn.trim(),
            originAr: formData.originAr.trim(),
            descriptionEn: formData.descriptionEn.trim(),
            descriptionAr: formData.descriptionAr.trim(),
            metaTitle: finalMetaTitle,
            metaDescription: finalMetaDesc,
            status: formData.status,
            perfumesCount: noteToEdit ? noteToEdit.perfumesCount : 0,
        };
        onSave(note);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto", children: _jsxs("div", { className: "bg-[#111622] border border-slate-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1420]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400", children: _jsx(Layers, { size: 18 }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-serif text-lg font-light text-white", children: noteToEdit ? `Edit Note: ${noteToEdit.nameEn}` : "Add Note" }), _jsx("p", { className: "text-xs text-slate-400 font-sans", children: "Note details, scent family, and SEO settings" })] })] }), _jsx("button", { onClick: onClose, className: "p-1 text-slate-400 hover:text-white rounded", children: _jsx(X, { size: 18 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 overflow-y-auto flex-1 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Note Name (English) *" }), _jsx("input", { type: "text", placeholder: "e.g. Royal Taif Rose", value: formData.nameEn, onChange: (e) => handleNameEnChange(e.target.value), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded focus:outline-none focus:border-slate-600", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Note Name (Arabic) *" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "e.g. \u0648\u0631\u062F \u0627\u0644\u0637\u0627\u0626\u0641 \u0627\u0644\u0645\u0644\u0643\u064A", value: formData.nameAr, onChange: (e) => setFormData({ ...formData, nameAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded focus:outline-none focus:border-slate-600", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "URL Slug *" }), _jsxs("span", { className: "text-[10px] text-emerald-400 font-mono", children: ["Storefront: /en/notes/", formData.slug || "slug"] })] }), _jsx("input", { type: "text", placeholder: "e.g. taif-rose", value: formData.slug, onChange: (e) => setFormData({ ...formData, slug: slugify(e.target.value) }), className: "w-full bg-[#0E1420] border border-slate-800 text-emerald-400 font-mono p-2.5 rounded focus:outline-none focus:border-slate-600", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Scent Family" }), _jsxs("select", { value: formData.family, onChange: (e) => setFormData({ ...formData, family: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded", children: [_jsx("option", { value: "Floral", children: "Floral (\u0648\u0631\u062F \u0648\u0632\u0647\u0648\u0631)" }), _jsx("option", { value: "Resin", children: "Resin & Frankincense (\u0644\u0628\u0627\u0646 \u0648\u0628\u062E\u0648\u0631)" }), _jsx("option", { value: "Woody", children: "Woody & Cedar (\u0623\u062E\u0634\u0627\u0628 \u0648\u0623\u0631\u0632)" }), _jsx("option", { value: "Oud", children: "Oud (\u062F\u0647\u0646 \u0639\u0648\u062F)" }), _jsx("option", { value: "Amber", children: "Amber (\u0639\u0646\u0628\u0631)" }), _jsx("option", { value: "Citrus", children: "Citrus (\u062D\u0645\u0636\u064A\u0627\u062A)" }), _jsx("option", { value: "Spices", children: "Spices (\u062A\u0648\u0627\u0628\u0644 \u0634\u0631\u0642\u064A\u0629)" }), _jsx("option", { value: "Leather", children: "Leather (\u062C\u0644\u0648\u062F)" }), _jsx("option", { value: "Powdery", children: "Powdery & Iris (\u0633\u0648\u0633\u0646 \u0648\u0628\u0648\u062F\u0631\u0629)" }), _jsx("option", { value: "Gourmand", children: "Gourmand & Vanilla (\u0641\u0627\u0646\u064A\u0644\u064A\u0627 \u0648\u062A\u0648\u0646\u0643\u0627)" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Origin (English)" }), _jsx("input", { type: "text", placeholder: "e.g. Taif Mountains, Saudi Arabia", value: formData.originEn, onChange: (e) => setFormData({ ...formData, originEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Origin (Arabic)" }), _jsx("input", { type: "text", dir: "rtl", placeholder: "e.g. \u062C\u0628\u0627\u0644 \u0627\u0644\u0637\u0627\u0626\u0641\u060C \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", value: formData.originAr, onChange: (e) => setFormData({ ...formData, originAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-slate-800", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Description (English)" }), _jsx("textarea", { rows: 3, placeholder: "Harvested at dawn in the high-altitude mountains...", value: formData.descriptionEn, onChange: (e) => setFormData({ ...formData, descriptionEn: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded text-xs leading-relaxed" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1", children: "Description (Arabic)" }), _jsx("textarea", { rows: 3, dir: "rtl", placeholder: "\u064A\u064F\u062D\u0635\u062F \u0639\u0646\u062F \u0628\u0632\u0648\u063A \u0627\u0644\u0641\u062C\u0631 \u0641\u064A \u0623\u0639\u0627\u0644\u064A \u062C\u0628\u0627\u0644 \u0627\u0644\u0637\u0627\u0626\u0641...", value: formData.descriptionAr, onChange: (e) => setFormData({ ...formData, descriptionAr: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded text-xs leading-relaxed" })] })] }), _jsxs("div", { className: "space-y-3 pt-1 border-t border-slate-800", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "SEO Title (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaTitle.length > 60 ? "text-amber-400" : "text-slate-500"}`, children: [formData.metaTitle.length, "/60 chars"] })] }), _jsx("input", { type: "text", placeholder: generateNoteMetaTitle(formData.nameEn || "Note", formData.family), value: formData.metaTitle, onChange: (e) => setFormData({ ...formData, metaTitle: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-slate-400", children: "SEO Description (Google)" }), _jsxs("span", { className: `text-[10px] font-mono ${formData.metaDescription.length > 160 ? "text-amber-400" : "text-slate-500"}`, children: [formData.metaDescription.length, "/160 chars"] })] }), _jsx("textarea", { rows: 2, placeholder: generateNoteMetaDescription(formData.nameEn || "Note", formData.originEn), value: formData.metaDescription, onChange: (e) => setFormData({ ...formData, metaDescription: e.target.value }), className: "w-full bg-[#0E1420] border border-slate-800 text-white p-2.5 rounded leading-relaxed" })] })] }), _jsxs("div", { className: "p-3.5 bg-[#080B10] border border-slate-800 rounded space-y-1 font-sans", children: [_jsxs("span", { className: "text-[10px] text-emerald-400 font-semibold block flex items-center gap-1", children: [_jsx(Globe, { size: 11 }), _jsx("span", { children: "Google Search Preview" })] }), _jsxs("div", { className: "text-xs text-slate-400 flex items-center gap-1", children: [_jsx("span", { children: "https://muschio.luxury" }), _jsx("span", { children: "\u203A" }), _jsx("span", { children: "en" }), _jsx("span", { children: "\u203A" }), _jsxs("span", { className: "font-mono text-slate-300", children: ["notes \u203A ", formData.slug || "slug"] })] }), _jsx("div", { className: "text-sm text-[#8AB4F8] hover:underline font-medium", children: formData.metaTitle || generateNoteMetaTitle(formData.nameEn || "Note", formData.family) }), _jsx("div", { className: "text-xs text-slate-300 leading-relaxed", children: formData.metaDescription || generateNoteMetaDescription(formData.nameEn || "Note", formData.originEn) })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded flex items-center gap-1.5 transition-colors", children: [_jsx(CheckCircle2, { size: 14 }), _jsx("span", { children: "Save Note" })] })] })] })] }) }));
}
//# sourceMappingURL=NoteModal.js.map