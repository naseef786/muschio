import React, { useState, useEffect } from "react";
import { X, Sparkles, Search, ChevronUp, ChevronDown, Check, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { CollectionItem, ProductItem, slugify } from "../seo-utils";
import { MediaUploadField } from "./MediaUploadField";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit: CollectionItem | null;
  onSave: (collection: Partial<CollectionItem>) => Promise<void> | void;
  allProducts: ProductItem[];
}

export function CollectionModal({
  isOpen,
  onClose,
  collectionToEdit,
  onSave,
  allProducts,
}: CollectionModalProps) {
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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
    } else {
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

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameEn(val);
    if (!collectionToEdit) {
      setSlug(slugify(val));
    }
  };

  const handleToggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const moveProduct = (index: number, direction: "up" | "down") => {
    const newIds = [...selectedProductIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    const current = newIds[index];
    const target = newIds[targetIndex];
    if (!current || !target) return;
    newIds[index] = target;
    newIds[targetIndex] = current;
    setSelectedProductIds(newIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save collection");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Selected products mapped with full item info
  const selectedProducts = selectedProductIds
    .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
    .filter(Boolean) as ProductItem[];

  // Filter available products
  const availableProducts = allProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.nameAr && p.nameAr.toLowerCase().includes(query)) ||
      p.brand.toLowerCase().includes(query) ||
      (p.concentration && p.concentration.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E121A] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {collectionToEdit ? "Edit Curated Collection" : "Create New Collection"}
              </h3>
              <p className="text-[11px] text-neutral-500">
                Curate fragrance flacons and display order according to admin preference.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* 1. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Collection Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={handleNameEnChange}
                placeholder="e.g. Royal Extraits 2026"
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Collection Name (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: خلاصات العطور الملكية ٢٠٢٦"
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="royal-extraits-2026"
                className="w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Featured on Storefront Slider
              </label>
              <label className="flex items-center gap-2.5 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                />
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  Feature this collection in the Storefront Collection Slider
                </span>
              </label>
            </div>
          </div>

          {/* 2. Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Description (English)
              </label>
              <textarea
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Curated selection of our highest concentration perfumes..."
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Description (Arabic)
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="مجموعة منتقاة من أندر خلاصات العطور الملكية الفائقة..."
                className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* 3. Hero / Cover Image */}
          <div>
            <MediaUploadField
              label="Collection Cover / Hero Image"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              hint="Upload or paste a cover image for this collection."
              folder="muschio/collections"
            />
          </div>

          {/* 4. Product Picker & Admin Preference Ordering */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50/50 dark:bg-neutral-900/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Curate Products in Collection
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Select and order products according to your preference. They will slide in this exact order.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium self-start sm:self-auto">
                {selectedProductIds.length} Flacons Selected
              </span>
            </div>

            {/* Selected Products in Order */}
            {selectedProducts.length > 0 && (
              <div className="space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md p-2 bg-white dark:bg-neutral-950 max-h-56 overflow-y-auto">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-2 block mb-1">
                  Slide Sequence (Admin Preference Order)
                </span>
                {selectedProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.imageUrl || p.images?.[0] ? (
                          <img
                            src={p.imageUrl || p.images?.[0]}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon size={14} className="text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {p.brand} • AED {p.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ps-2">
                      <button
                        type="button"
                        onClick={() => moveProduct(idx, "up")}
                        disabled={idx === 0}
                        title="Move Earlier in Slide"
                        className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProduct(idx, "down")}
                        disabled={idx === selectedProducts.length - 1}
                        title="Move Later in Slide"
                        className="p-1 rounded text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleProduct(p.id)}
                        title="Remove from Collection"
                        className="p-1 rounded text-red-500 hover:text-red-700 transition-colors ms-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Products Picker */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog by perfume name, brand, or concentration..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded p-2 bg-white dark:bg-neutral-950">
                {availableProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all text-xs ${
                        isSelected
                          ? "bg-neutral-100 dark:bg-neutral-900 border-black dark:border-white shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center overflow-hidden">
                          {p.imageUrl || p.images?.[0] ? (
                            <img
                              src={p.imageUrl || p.images?.[0]}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon size={12} className="text-neutral-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white truncate text-[11px]">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {p.brand}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ps-1">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-black dark:text-white">
                            <Check size={13} />
                            <span>Added</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 hover:text-black dark:hover:text-white">
                            <Plus size={13} />
                            <span>Add</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-medium rounded bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-black/10"
            >
              {isSaving ? (
                <span>Saving Collection...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>{collectionToEdit ? "Update Collection" : "Create Collection"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
