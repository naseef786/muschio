import React, { useState } from "react";
import { X, Compass, CheckCircle2, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { ScentProfile } from "@muschio/types";

interface BulkScentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  selectedProductNames: string[];
  allProfiles: ScentProfile[];
  onApply: (data: { productIds: string[]; scentProfileIds: string[]; mode: "add" | "set" | "remove" }) => Promise<void>;
}

export function BulkScentProfileModal({
  isOpen,
  onClose,
  selectedProductIds,
  selectedProductNames,
  allProfiles,
  onApply,
}: BulkScentProfileModalProps) {
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"add" | "set" | "remove">("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const toggleProfile = (id: string) => {
    if (selectedProfileIds.includes(id)) {
      setSelectedProfileIds(selectedProfileIds.filter((p) => p !== id));
    } else {
      setSelectedProfileIds([...selectedProfileIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProfileIds.length === allProfiles.length) {
      setSelectedProfileIds([]);
    } else {
      setSelectedProfileIds(allProfiles.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfileIds.length === 0 && mode !== "set") {
      setErrorMsg("Please select at least one scent profile.");
      return;
    }
    setErrorMsg("");

    try {
      setIsSubmitting(true);
      await onApply({
        productIds: selectedProductIds,
        scentProfileIds: selectedProfileIds,
        mode,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update scent profiles.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Bulk Assign Scent Profiles ({selectedProductIds.length} fragrances)
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Selected Products summary */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-medium">
              <span>Selected Fragrances ({selectedProductIds.length})</span>
            </div>
            <p className="text-[11px] text-neutral-500 line-clamp-2">
              {selectedProductNames.slice(0, 8).join(" · ")}
              {selectedProductNames.length > 8 ? ` and ${selectedProductNames.length - 8} more...` : ""}
            </p>
          </div>

          {/* Operation Mode */}
          <div>
            <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-2">
              Assignment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`p-2.5 rounded-lg border text-start transition-all ${
                  mode === "add"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-neutral-900 dark:text-white ring-1 ring-amber-500"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1 text-amber-700 dark:text-amber-400">
                  <Plus size={13} />
                  <span>Append Profiles</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  Adds selected profiles to existing ones without removing any.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("set")}
                className={`p-2.5 rounded-lg border text-start transition-all ${
                  mode === "set"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-neutral-900 dark:text-white ring-1 ring-amber-500"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1 text-amber-700 dark:text-amber-400">
                  <RefreshCw size={13} />
                  <span>Replace All</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  Replaces all existing profiles on these fragrances with selected.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode("remove")}
                className={`p-2.5 rounded-lg border text-start transition-all ${
                  mode === "remove"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-neutral-900 dark:text-white ring-1 ring-rose-500"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1 text-rose-700 dark:text-rose-400">
                  <Trash2 size={13} />
                  <span>Detach Profiles</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  Removes selected profiles from these fragrances.
                </p>
              </button>
            </div>
          </div>

          {/* Scent Profiles Multi-Select Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-neutral-700 dark:text-neutral-300 font-medium">
                Choose Scent Profiles ({selectedProfileIds.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                {selectedProfileIds.length === allProfiles.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allProfiles.map((p) => {
                const isSelected = selectedProfileIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProfile(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-start transition-all ${
                      isSelected
                        ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: p.colorHex || "#78350f" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs truncate leading-tight">
                        {p.nameEn}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400"
                        }`}
                        dir="rtl"
                      >
                        {p.nameAr || p.nameEn}
                      </div>
                    </div>
                  </button>
                );
              })}
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
              <span>Apply to {selectedProductIds.length} Fragrances</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
