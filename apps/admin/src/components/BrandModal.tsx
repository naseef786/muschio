import React, { useState, useEffect } from "react";
import { X, Award, Globe, CheckCircle2 } from "lucide-react";
import { BrandItem, slugify, generateBrandMetaTitle, generateBrandMetaDescription } from "../seo-utils";
import { MediaUploadField } from "./MediaUploadField";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit: BrandItem | null;
  onSave: (brand: BrandItem) => void;
}

export function BrandModal({ isOpen, onClose, brandToEdit, onSave }: BrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "NICHE" as "NICHE" | "DESIGNER",
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
    } else {
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
  const handleNameChange = (val: string) => {
    const updated = { ...formData, name: val };
    if (!brandToEdit || !formData.slug) {
      updated.slug = slugify(val);
      updated.metaTitle = generateBrandMetaTitle(val);
      updated.metaDescription = generateBrandMetaDescription(val, formData.countryEn);
    }
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalSlug = formData.slug.trim() || slugify(formData.name);
    const finalMetaTitle = formData.metaTitle.trim() || generateBrandMetaTitle(formData.name);
    const finalMetaDesc = formData.metaDescription.trim() || generateBrandMetaDescription(formData.name, formData.countryEn);

    const brand: BrandItem = {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-black text-white dark:bg-white dark:text-black">
              <Award size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light text-neutral-900 dark:text-white">
                {brandToEdit ? `Edit Brand: ${brandToEdit.name}` : "Add Brand"}
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Brand details, origin, and SEO settings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded">
            <X size={18} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Brand Name *</label>
              <input
                type="text"
                placeholder="e.g. Amouage or Clive Christian"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Brand Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "NICHE" | "DESIGNER" })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              >
                <option value="NICHE">Niche Brand</option>
                <option value="DESIGNER">Designer Brand</option>
              </select>
            </div>
          </div>

          {/* Row 2: SEO Canonical Slug */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-700 dark:text-neutral-300">URL Slug *</label>
              <span className="text-[10px] text-neutral-500 font-mono">
                Storefront: /en/brands/{formData.slug || "slug"}
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. amouage"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
              className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white"
              required
            />
          </div>

          {/* Row 3: Origins & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Country (English)</label>
              <input
                type="text"
                placeholder="e.g. Sultanate of Oman"
                value={formData.countryEn}
                onChange={(e) => setFormData({ ...formData, countryEn: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Country (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                placeholder="e.g. سلطنة عُمان"
                value={formData.countryAr}
                onChange={(e) => setFormData({ ...formData, countryAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Founding Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md font-mono"
              />
            </div>
          </div>

          {/* Row 4: Maison Visual Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <MediaUploadField
              label="Brand Logo"
              value={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
              folder="muschio/brands/logos"
              helperText="Upload transparent PNG/SVG maison crest"
              placeholder="https://res.cloudinary.com/zwkad4sz/image/upload/..."
            />
            <MediaUploadField
              label="Brand Hero Banner / Flacon Photography"
              value={formData.heroImageUrl}
              onChange={(url) => setFormData({ ...formData, heroImageUrl: url })}
              folder="muschio/brands/heroes"
              helperText="High-res banner for maison landing page"
              placeholder="https://res.cloudinary.com/zwkad4sz/image/upload/..."
            />
          </div>

          {/* Row 5: Editorial Brand Stories */}
          <div className="space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                Brand Description (English)
              </label>
              <textarea
                rows={3}
                placeholder="Established in 1983 in the Sultanate of Oman..."
                value={formData.storyEn}
                onChange={(e) => setFormData({ ...formData, storyEn: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Brand Description (Arabic)</label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="تأسست عام 1983 في سلطنة عُمان..."
                value={formData.storyAr}
                onChange={(e) => setFormData({ ...formData, storyAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Row 6: Google SERP Meta Tags */}
          <div className="space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-700 dark:text-neutral-300">SEO Title (Google)</label>
                <span className={`text-[10px] font-mono ${formData.metaTitle.length > 60 ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`}>
                  {formData.metaTitle.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                placeholder={generateBrandMetaTitle(formData.name || "Brand")}
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-700 dark:text-neutral-300">SEO Description (Google)</label>
                <span className={`text-[10px] font-mono ${formData.metaDescription.length > 160 ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`}>
                  {formData.metaDescription.length}/160 chars
                </span>
              </div>
              <textarea
                rows={2}
                placeholder={generateBrandMetaDescription(formData.name || "Brand", formData.countryEn)}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md leading-relaxed"
              />
            </div>
          </div>

          {/* SERP PREVIEW BOX */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md space-y-1 font-sans">
            <span className="text-[10px] text-neutral-900 dark:text-white font-semibold flex items-center gap-1">
              <Globe size={11} />
              <span>Google Search Preview</span>
            </span>
            <div className="text-xs text-neutral-500 flex items-center gap-1">
              <span>https://muschio.luxury</span>
              <span>›</span>
              <span>en</span>
              <span>›</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">brands › {formData.slug || "slug"}</span>
            </div>
            <div className="text-sm text-neutral-900 dark:text-white font-medium hover:underline">
              {formData.metaTitle || generateBrandMetaTitle(formData.name || "Brand")}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {formData.metaDescription || generateBrandMetaDescription(formData.name || "Brand", formData.countryEn)}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 size={14} />
              <span>Save Brand</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
