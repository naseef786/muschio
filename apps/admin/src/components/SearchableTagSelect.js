import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { Tag, Search, Plus, X, Check, ChevronDown } from "lucide-react";
export function SearchableTagSelect({ allTags, selectedTagIds, onChange, onCreateTag, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    // Close dropdown on click outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);
    // Filtered tags based on search
    const filteredTags = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q)
            return allTags;
        return allTags.filter((t) => t.nameEn.toLowerCase().includes(q) ||
            (t.nameAr && t.nameAr.toLowerCase().includes(q)) ||
            t.slug.toLowerCase().includes(q));
    }, [allTags, searchQuery]);
    // Selected tags objects
    const selectedTags = useMemo(() => {
        return selectedTagIds
            .map((id) => allTags.find((t) => t.id === id || t.slug === id))
            .filter((t) => Boolean(t));
    }, [selectedTagIds, allTags]);
    const toggleTag = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter((id) => id !== tagId));
        }
        else {
            onChange([...selectedTagIds, tagId]);
        }
    };
    const removeTag = (tagId, e) => {
        e.stopPropagation();
        onChange(selectedTagIds.filter((id) => id !== tagId));
    };
    const handleCreateNew = async () => {
        const trimmed = searchQuery.trim();
        if (!trimmed || !onCreateTag || isCreating)
            return;
        try {
            setIsCreating(true);
            const newTag = await onCreateTag(trimmed);
            if (newTag) {
                if (!selectedTagIds.includes(newTag.id)) {
                    onChange([...selectedTagIds, newTag.id]);
                }
                setSearchQuery("");
            }
        }
        finally {
            setIsCreating(false);
        }
    };
    const hasExactMatch = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allTags.some((t) => t.nameEn.toLowerCase() === q || t.slug.toLowerCase() === q);
    }, [allTags, searchQuery]);
    return (_jsxs("div", { ref: containerRef, className: "relative space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5", children: [_jsx(Tag, { size: 13, className: "text-amber-500" }), _jsx("span", { children: "Product Tags & Curations (\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A)" })] }), _jsxs("span", { className: "text-[10px] text-neutral-500 font-mono", children: [selectedTags.length, " selected"] })] }), selectedTags.length > 0 && (_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 p-2 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded", children: [selectedTags.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs", children: [tag.colorHex && (_jsx("span", { className: "w-2 h-2 rounded-full shrink-0", style: { backgroundColor: tag.colorHex } })), _jsx("span", { children: tag.nameEn }), _jsx("button", { type: "button", onClick: (e) => removeTag(tag.id, e), className: "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 ml-0.5 rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors", title: `Remove ${tag.nameEn}`, children: _jsx(X, { size: 11 }) })] }, tag.id))), _jsx("button", { type: "button", onClick: () => onChange([]), className: "text-[10px] text-neutral-400 hover:text-rose-500 underline ml-1", children: "Clear all" })] })), _jsxs("div", { onClick: () => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }, className: "relative flex items-center bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded p-2 cursor-text focus-within:border-black dark:focus-within:border-white transition-colors", children: [_jsx(Search, { size: 14, className: "text-neutral-400 me-2 shrink-0" }), _jsx("input", { ref: inputRef, type: "text", placeholder: selectedTags.length === 0
                            ? "Search or select tags (e.g. Signature Scent, Royal Oud)..."
                            : "Search more tags to add...", value: searchQuery, onChange: (e) => {
                            setSearchQuery(e.target.value);
                            if (!isOpen)
                                setIsOpen(true);
                        }, onFocus: () => setIsOpen(true), className: "w-full bg-transparent text-neutral-900 dark:text-white text-xs focus:outline-none placeholder-neutral-400" }), searchQuery && (_jsx("button", { type: "button", onClick: (e) => {
                            e.stopPropagation();
                            setSearchQuery("");
                        }, className: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1", children: _jsx(X, { size: 12 }) })), _jsx(ChevronDown, { size: 14, className: `text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}` })] }), isOpen && (_jsxs("div", { className: "absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden max-h-64 flex flex-col", children: [_jsx("div", { className: "overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900 flex-1", children: filteredTags.length > 0 ? (filteredTags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id) || selectedTagIds.includes(tag.slug);
                            return (_jsxs("button", { type: "button", onClick: () => toggleTag(tag.id), className: `w-full flex items-center justify-between p-2.5 text-start transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${isSelected ? "bg-amber-500/10 dark:bg-amber-500/15" : ""}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: `w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                                    : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"}`, children: isSelected && _jsx(Check, { size: 11, strokeWidth: 3 }) }), tag.colorHex && (_jsx("span", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: tag.colorHex } })), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-neutral-900 dark:text-neutral-100", children: tag.nameEn }), tag.nameAr && (_jsx("div", { className: "text-[10px] text-neutral-400 font-sans", dir: "rtl", children: tag.nameAr }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [tag.isFeatured && (_jsx("span", { className: "text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20", children: "Featured" })), tag.productCount !== undefined && tag.productCount > 0 && (_jsxs("span", { className: "text-[10px] font-mono text-neutral-400", children: [tag.productCount, " prod"] }))] })] }, tag.id));
                        })) : (_jsx("div", { className: "p-4 text-center text-neutral-400 text-xs", children: "No matching tags found" })) }), searchQuery.trim() && !hasExactMatch && onCreateTag && (_jsx("div", { className: "p-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900", children: _jsxs("button", { type: "button", onClick: handleCreateNew, disabled: isCreating, className: "w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded text-xs transition-colors disabled:opacity-50", children: [_jsx(Plus, { size: 13 }), _jsx("span", { children: isCreating
                                        ? "Creating tag..."
                                        : `+ Create new tag "${searchQuery.trim()}"` })] }) }))] }))] }));
}
//# sourceMappingURL=SearchableTagSelect.js.map