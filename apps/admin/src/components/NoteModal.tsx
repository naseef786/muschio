import React, { useState, useEffect } from "react";
import { X, Layers, Globe, CheckCircle2 } from "lucide-react";
import { NoteItem, slugify, generateNoteMetaTitle, generateNoteMetaDescription } from "../seo-utils";
import { MediaUploadField } from "./MediaUploadField";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit: NoteItem | null;
  onSave: (note: NoteItem) => void;
}

export function NoteModal({ isOpen, onClose, noteToEdit, onSave }: NoteModalProps) {
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
    heroImageUrl: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
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
        heroImageUrl: noteToEdit.heroImageUrl || "",
        status: noteToEdit.status,
      });
    } else {
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
        heroImageUrl: "",
        status: "PUBLISHED",
      });
    }
  }, [noteToEdit, isOpen]);

  const handleNameEnChange = (val: string) => {
    const updated = { ...formData, nameEn: val };
    if (!noteToEdit || !formData.slug) {
      updated.slug = slugify(val);
      updated.metaTitle = generateNoteMetaTitle(val, formData.family);
      updated.metaDescription = generateNoteMetaDescription(val, formData.originEn);
    }
    setFormData(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) return;

    const finalSlug = formData.slug.trim() || slugify(formData.nameEn);
    const finalMetaTitle = formData.metaTitle.trim() || generateNoteMetaTitle(formData.nameEn, formData.family);
    const finalMetaDesc = formData.metaDescription.trim() || generateNoteMetaDescription(formData.nameEn, formData.originEn);

    const note: NoteItem = {
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
      heroImageUrl: formData.heroImageUrl.trim() || undefined,
      thumbnailUrl: formData.heroImageUrl.trim() || undefined,
      status: formData.status,
      perfumesCount: noteToEdit ? noteToEdit.perfumesCount : 0,
    };

    onSave(note);
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
              <Layers size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light text-neutral-900 dark:text-white">
                {noteToEdit ? `Edit Note: ${noteToEdit.nameEn}` : "Add Note"}
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Note details, scent family, and SEO settings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded">
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Row 1: English & Arabic Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Note Name (English) *</label>
              <input
                type="text"
                placeholder="e.g. Royal Taif Rose"
                value={formData.nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Note Name (Arabic) *</label>
              <input
                type="text"
                dir="rtl"
                placeholder="e.g. ورد الطائف الملكي"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
            </div>
          </div>

          {/* Row 2: Canonical Slug & Family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-700 dark:text-neutral-300">URL Slug *</label>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Storefront: /en/notes/{formData.slug || "slug"}
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. taif-rose"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white font-mono p-2.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Scent Family</label>
              <select
                value={formData.family}
                onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              >
                <option value="Floral">Floral (ورد وزهور)</option>
                <option value="Resin">Resin & Frankincense (لبان وبخور)</option>
                <option value="Woody">Woody & Cedar (أخشاب وأرز)</option>
                <option value="Oud">Oud (دهن عود)</option>
                <option value="Amber">Amber (عنبر)</option>
                <option value="Citrus">Citrus (حمضيات)</option>
                <option value="Spices">Spices (توابل شرقية)</option>
                <option value="Leather">Leather (جلود)</option>
                <option value="Powdery">Powdery & Iris (سوسن وبودرة)</option>
                <option value="Gourmand">Gourmand & Vanilla (فانيليا وتونكا)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Origins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Origin (English)</label>
              <input
                type="text"
                placeholder="e.g. Taif Mountains, Saudi Arabia"
                value={formData.originEn}
                onChange={(e) => setFormData({ ...formData, originEn: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              />
            </div>
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Origin (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                placeholder="e.g. جبال الطائف، السعودية"
                value={formData.originAr}
                onChange={(e) => setFormData({ ...formData, originAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md"
              />
            </div>
          </div>

          {/* Row 3.5: Note Botanical & Flacon Artwork */}
          <div className="pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <MediaUploadField
              label="Scent Note Botanical / Hero Artwork"
              value={formData.heroImageUrl}
              onChange={(url) => setFormData({ ...formData, heroImageUrl: url })}
              folder="muschio/notes"
              helperText="Upload raw ingredient photography (Oud chips, Taif roses, Bergamot zest) to Cloudinary"
              placeholder="https://res.cloudinary.com/zwkad4sz/image/upload/..."
            />
          </div>

          {/* Row 4: Sensory Editorial Description */}
          <div className="space-y-3 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                Description (English)
              </label>
              <textarea
                rows={3}
                placeholder="Harvested at dawn in the high-altitude mountains..."
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Description (Arabic)</label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="يُحصد عند بزوغ الفجر في أعالي جبال الطائف..."
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white p-2.5 rounded-md text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Row 5: Google SERP Meta Tags */}
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
                placeholder={generateNoteMetaTitle(formData.nameEn || "Note", formData.family)}
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
                placeholder={generateNoteMetaDescription(formData.nameEn || "Note", formData.originEn)}
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
              <span className="font-mono text-neutral-700 dark:text-neutral-300">notes › {formData.slug || "slug"}</span>
            </div>
            <div className="text-sm text-neutral-900 dark:text-white font-medium hover:underline">
              {formData.metaTitle || generateNoteMetaTitle(formData.nameEn || "Note", formData.family)}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {formData.metaDescription || generateNoteMetaDescription(formData.nameEn || "Note", formData.originEn)}
            </div>
          </div>

          {/* FOOTER */}
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
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
