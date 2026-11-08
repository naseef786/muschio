import React, { useState, useEffect } from "react";
import { X, Tag, CheckCircle2, Sparkles } from "lucide-react";
import { TagItem, slugify } from "../seo-utils";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagToEdit: TagItem | null;
  onSave: (tag: TagItem) => Promise<void> | void;
}

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

export function TagModal({ isOpen, onClose, tagToEdit, onSave }: TagModalProps) {
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
    } else {
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

  const handleNameEnChange = (val: string) => {
    const updated = { ...formData, nameEn: val };
    if (!tagToEdit) {
      updated.slug = slugify(val);
    }
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) {
      alert("English name is required.");
      return;
    }

    const finalSlug = (formData.slug.trim() || slugify(formData.nameEn)).toLowerCase();
    const tag: TagItem = {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neutral-100 dark:bg-neutral-900 rounded text-neutral-800 dark:text-neutral-200">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {tagToEdit ? "Edit Fragrance Tag" : "Create New Fragrance Tag"}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {tagToEdit ? `Updating #${tagToEdit.slug}` : "Curate tags for product discovery & filters"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Tag Name English & Arabic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">
                Tag Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Signature Scent"
                value={formData.nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">
                Tag Name (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: عطر مميز وبارز"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white font-sans"
              />
            </div>
          </div>

          {/* Unique Slug */}
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">
              Slug Identifier (URL / Filter Key) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. signature-scent"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Storefront filter URL: <span className="font-mono">/shop?tag={formData.slug || "tag-slug"}</span>
            </p>
          </div>

          {/* Color Indicator & Presets */}
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 mb-1.5 font-medium">
              Accent Color Indicator
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {COLOR_PRESETS.map((p) => {
                const isSelected = formData.colorHex.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, colorHex: p.hex })}
                    title={p.name}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                      isSelected
                        ? "border-black dark:border-white ring-1 ring-black dark:ring-white bg-neutral-100 dark:bg-neutral-800 font-semibold"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                    <span className="text-neutral-700 dark:text-neutral-300">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                className="w-9 h-9 p-0.5 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer bg-white dark:bg-black"
              />
              <input
                type="text"
                placeholder="#D4AF37"
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                className="w-28 font-mono bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">
              Curatorial Description / Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Flacons defined by commanding sillage and exceptional longevity."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded text-xs focus:outline-none focus:border-black dark:focus:border-white leading-relaxed"
            />
          </div>

          {/* Featured on Storefront */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <div>
                <span className="text-xs font-medium text-neutral-900 dark:text-white block">
                  Featured on Storefront Filter Strip
                </span>
                <span className="text-[11px] text-neutral-500">
                  Highlight this tag prominently in the trending filter bar on /shop
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
            </label>
          </div>

          {/* Live Preview */}
          <div className="p-3 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
              Live Badge Preview (Storefront & Admin)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.colorHex }} />
                <span>{formData.nameEn || "Tag Preview"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.colorHex }} />
                <span>{formData.nameAr || formData.nameEn || "معاينة التصنيف"}</span>
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{isSubmitting ? "Saving..." : tagToEdit ? "Update Tag" : "Create Tag"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

