import React, { useState, useRef, useEffect, useMemo } from "react";
import { Tag, Search, Plus, X, Check, ChevronDown } from "lucide-react";
import { TagItem } from "../seo-utils";

interface SearchableTagSelectProps {
  allTags: TagItem[];
  selectedTagIds: string[];
  onChange: (selectedIds: string[]) => void;
  onCreateTag?: (nameEn: string) => Promise<TagItem | null>;
}

export function SearchableTagSelect({
  allTags,
  selectedTagIds,
  onChange,
  onCreateTag,
}: SearchableTagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filtered tags based on search
  const filteredTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allTags;
    return allTags.filter(
      (t) =>
        t.nameEn.toLowerCase().includes(q) ||
        (t.nameAr && t.nameAr.toLowerCase().includes(q)) ||
        t.slug.toLowerCase().includes(q)
    );
  }, [allTags, searchQuery]);

  // Selected tags objects
  const selectedTags = useMemo(() => {
    return selectedTagIds
      .map((id) => allTags.find((t) => t.id === id || t.slug === id))
      .filter((t): t is TagItem => Boolean(t));
  }, [selectedTagIds, allTags]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateNew = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !onCreateTag || isCreating) return;

    try {
      setIsCreating(true);
      const newTag = await onCreateTag(trimmed);
      if (newTag) {
        if (!selectedTagIds.includes(newTag.id)) {
          onChange([...selectedTagIds, newTag.id]);
        }
        setSearchQuery("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const hasExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTags.some(
      (t) => t.nameEn.toLowerCase() === q || t.slug.toLowerCase() === q
    );
  }, [allTags, searchQuery]);

  return (
    <div ref={containerRef} className="relative space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5">
          <Tag size={13} className="text-amber-500" />
          <span>Product Tags & Curations (العلامات والتصنيفات)</span>
        </label>
        <span className="text-[10px] text-neutral-500 font-mono">
          {selectedTags.length} selected
        </span>
      </div>

      {/* Selected Tags Chips Strip */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs"
            >
              {tag.colorHex && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tag.colorHex }}
                />
              )}
              <span>{tag.nameEn}</span>
              <button
                type="button"
                onClick={(e) => removeTag(tag.id, e)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 ml-0.5 rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                title={`Remove ${tag.nameEn}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] text-neutral-400 hover:text-rose-500 underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search Trigger Input Box */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className="relative flex items-center bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded p-2 cursor-text focus-within:border-black dark:focus-within:border-white transition-colors"
      >
        <Search size={14} className="text-neutral-400 me-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={
            selectedTags.length === 0
              ? "Search or select tags (e.g. Signature Scent, Royal Oud)..."
              : "Search more tags to add..."
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent text-neutral-900 dark:text-white text-xs focus:outline-none placeholder-neutral-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery("");
            }}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden max-h-64 flex flex-col">
          {/* Tag List */}
          <div className="overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900 flex-1">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id) || selectedTagIds.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full flex items-center justify-between p-2.5 text-start transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                      isSelected ? "bg-amber-500/10 dark:bg-amber-500/15" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      {tag.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.colorHex }}
                        />
                      )}
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {tag.nameEn}
                        </div>
                        {tag.nameAr && (
                          <div className="text-[10px] text-neutral-400 font-sans" dir="rtl">
                            {tag.nameAr}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tag.isFeatured && (
                        <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Featured
                        </span>
                      )}
                      {tag.productCount !== undefined && tag.productCount > 0 && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {tag.productCount} prod
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-neutral-400 text-xs">
                No matching tags found
              </div>
            )}
          </div>

          {/* Quick Create Inline Button */}
          {searchQuery.trim() && !hasExactMatch && onCreateTag && (
            <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded text-xs transition-colors disabled:opacity-50"
              >
                <Plus size={13} />
                <span>
                  {isCreating
                    ? "Creating tag..."
                    : `+ Create new tag "${searchQuery.trim()}"`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

