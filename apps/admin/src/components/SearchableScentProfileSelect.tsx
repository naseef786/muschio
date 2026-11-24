import { Compass, Check } from "lucide-react";
import { ScentProfile } from "@muschio/types";

interface SearchableScentProfileSelectProps {
  allProfiles: ScentProfile[];
  selectedProfileIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function SearchableScentProfileSelect({
  allProfiles,
  selectedProfileIds,
  onChange,
}: SearchableScentProfileSelectProps) {
  const toggleProfile = (id: string) => {
    if (selectedProfileIds.includes(id)) {
      onChange(selectedProfileIds.filter((p) => p !== id));
    } else {
      onChange([...selectedProfileIds, id]);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5">
          <Compass size={14} className="text-amber-500" />
          <span>Scent Profiles (المجموعات العطرية)</span>
        </label>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {selectedProfileIds.length} of {allProfiles.length} active
        </span>
      </div>

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Assign multiple olfactory families without hierarchy or primary/secondary restriction.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
        {allProfiles.map((p) => {
          const isSelected = selectedProfileIds.includes(p.id) || selectedProfileIds.includes(p.slug);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProfile(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-start transition-all ${
                isSelected
                  ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm ring-1 ring-neutral-900 dark:ring-white"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.colorHex || "#78350f" }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate leading-tight flex items-center justify-between gap-1">
                  <span>{p.nameEn}</span>
                  {isSelected && <Check size={11} className="shrink-0" />}
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
  );
}
