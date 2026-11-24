import React, { useState, useEffect } from "react";
import { X, Compass, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { ScentProfile } from "@muschio/types";

interface ScentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileToEdit: ScentProfile | null;
  onSave: (profile: Partial<ScentProfile>) => Promise<void> | void;
}

const COLOR_PRESETS = [
  { name: "Woody Chestnut", hex: "#78350f" },
  { name: "Golden Amber", hex: "#d97706" },
  { name: "Royal Agarwood", hex: "#451a03" },
  { name: "Citrus Sunshine", hex: "#eab308" },
  { name: "Ocean Breeze", hex: "#0284c7" },
  { name: "Damascus Rose", hex: "#e11d48" },
  { name: "Gourmand Praline", hex: "#a16207" },
  { name: "Saffron Spice", hex: "#dc2626" },
  { name: "Aromatic Herbal", hex: "#059669" },
  { name: "Clean White Musk", hex: "#64748b" },
  { name: "Sovereign Leather", hex: "#292524" },
  { name: "Wild Orchard", hex: "#f97316" },
];

export function ScentProfileModal({ isOpen, onClose, profileToEdit, onSave }: ScentProfileModalProps) {
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    slug: "",
    descriptionEn: "",
    descriptionAr: "",
    imageUrl: "",
    colorHex: "#78350f",
    isFeatured: true,
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    if (profileToEdit) {
      setFormData({
        nameEn: profileToEdit.nameEn,
        nameAr: profileToEdit.nameAr || profileToEdit.nameEn,
        slug: profileToEdit.slug,
        descriptionEn: profileToEdit.descriptionEn || "",
        descriptionAr: profileToEdit.descriptionAr || "",
        imageUrl: profileToEdit.imageUrl || "",
        colorHex: profileToEdit.colorHex || "#78350f",
        isFeatured: Boolean(profileToEdit.isFeatured),
        sortOrder: profileToEdit.sortOrder || 0,
      });
    } else {
      setFormData({
        nameEn: "",
        nameAr: "",
        slug: "",
        descriptionEn: "",
        descriptionAr: "",
        imageUrl: "",
        colorHex: "#78350f",
        isFeatured: true,
        sortOrder: 0,
      });
    }
  }, [profileToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) {
      setErrorMsg("English scent profile name is required.");
      return;
    }
    setErrorMsg("");

    const slug = (
      formData.slug.trim() ||
      formData.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    );

    try {
      setIsSubmitting(true);
      await onSave({
        id: profileToEdit ? profileToEdit.id : undefined,
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim() || formData.nameEn.trim(),
        slug,
        descriptionEn: formData.descriptionEn.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        colorHex: formData.colorHex,
        isFeatured: formData.isFeatured,
        sortOrder: Number(formData.sortOrder) || 0,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save scent profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {profileToEdit ? `Edit Scent Profile: ${profileToEdit.nameEn}` : "Create Scent Profile"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Woody, Fresh, Amber"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1" dir="rtl">
                الاسم (بالعربية)
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="مثال: خشبي، منعش، عنبري"
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-end"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. woody, fresh, amber"
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded font-mono text-xs focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Forms the public URL: <span className="font-mono">/scent-profile/{formData.slug || "slug"}</span>
            </p>
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
              Description (English)
            </label>
            <textarea
              rows={2}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Poetic olfactory characterization..."
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1" dir="rtl">
              الوصف (بالعربية)
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="وصف شاعري للرائحة والنفحات العطرية..."
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-end"
            />
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-neutral-400" />
              <span>Image URL (Storefront Card & Banner)</span>
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded text-xs focus:outline-none focus:border-amber-500"
            />
            {formData.imageUrl && (
              <div className="mt-2 w-24 h-16 rounded border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-100">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
              Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorHex: c.hex })}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    formData.colorHex.toLowerCase() === c.hex.toLowerCase()
                      ? "border-amber-500 scale-110 shadow-sm"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <input
                type="color"
                value={formData.colorHex}
                onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 rounded"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <label htmlFor="isFeatured" className="text-neutral-800 dark:text-neutral-200 font-medium cursor-pointer">
                Featured on Storefront
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-semibold rounded flex items-center gap-2 transition-colors shadow-sm"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{profileToEdit ? "Update Profile" : "Create Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
