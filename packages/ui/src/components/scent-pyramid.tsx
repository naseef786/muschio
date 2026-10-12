import * as React from "react";
import { NoteChip } from "./note-chip";
import { cn } from "../utils/cn";

export interface ScentNoteItem {
  id: string;
  name: string;
  slug: string;
  position: "TOP" | "HEART" | "BASE";
}

export interface ScentPyramidProps extends React.HTMLAttributes<HTMLDivElement> {
  notes: ScentNoteItem[];
  locale?: "en" | "ar";
  onNoteClick?: (slug: string) => void;
}

interface ScentLayer {
  position: "TOP" | "HEART" | "BASE";
  title: string;
  subtitle: string;
  items: ScentNoteItem[];
  badgeColor: string;
}

export function ScentPyramid({
  notes,
  locale = "en",
  onNoteClick,
  className,
  ...props
}: ScentPyramidProps) {
  const [activeLayer, setActiveLayer] = React.useState<"TOP" | "HEART" | "BASE" | null>(null);

  const topNotes = notes.filter((n) => n.position === "TOP");
  const heartNotes = notes.filter((n) => n.position === "HEART");
  const baseNotes = notes.filter((n) => n.position === "BASE");

  const layers: ScentLayer[] = [
    {
      position: "TOP",
      title: locale === "ar" ? "افتتاحية العطر (النوتات العليا)" : "Top Notes (Opening Radiance)",
      subtitle: locale === "ar" ? "تتلاشى بعد أول 15 دقيقة — انطباع أول مبهر" : "First impression, 5-15 mins",
      items: topNotes,
      badgeColor: "from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-300",
    },
    {
      position: "HEART",
      title: locale === "ar" ? "قلب العطر (النوتات الوسطى)" : "Heart Notes (Olfactory Core)",
      subtitle: locale === "ar" ? "جوهر العطر الحقيقي يدوم لساعات" : "Core character, 2-4 hours",
      items: heartNotes,
      badgeColor: "from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-300",
    },
    {
      position: "BASE",
      title: locale === "ar" ? "قاعدة العطر (العمق والفوحان)" : "Base Notes (Monolithic Dry Down)",
      subtitle: locale === "ar" ? "التثبيت الأسطوري والفوحان الدائم على البشرة والثوب" : "Lasting foundation, 8-24+ hours",
      items: baseNotes,
      badgeColor: "from-amber-700/20 to-gold/20 text-amber-700 dark:text-gold",
    },
  ];

  return (
    <div
      className={cn(
        "glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-white/10 pb-4">
        <div>
          <h3 className="font-serif text-xl tracking-wide uppercase font-normal text-zinc-950 dark:text-white">
            {locale === "ar" ? "الهرم العطري والنوتات" : "Olfactory Pyramid Architecture"}
          </h3>
          <p className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400 mt-0.5">
            {locale === "ar" ? "انقر على النوتات لاكتشاف تركيبتها وخلاصاتها النادرة" : "Interactive extraction mapping & note exploration"}
          </p>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 text-[10px] font-sans uppercase tracking-widest bg-gold/10 text-gold border border-gold/20 rounded-full font-medium">
          {locale === "ar" ? "تركيبة ملكية" : "Haute Formulation"}
        </span>
      </div>

      <div className="space-y-4">
        {layers.map((layer) => {
          const isHighlighted = activeLayer === null || activeLayer === layer.position;
          return (
            <div
              key={layer.position}
              onMouseEnter={() => setActiveLayer(layer.position)}
              onMouseLeave={() => setActiveLayer(null)}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 backdrop-blur-md",
                isHighlighted
                  ? "bg-white/80 dark:bg-white/[0.04] border-zinc-300/80 dark:border-white/15 shadow-sm"
                  : "bg-white/30 dark:bg-white/[0.01] border-transparent opacity-60"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <span className="text-xs sm:text-sm font-serif italic text-zinc-950 dark:text-zinc-100 flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full bg-gradient-to-r", layer.badgeColor)} />
                  {layer.title}
                </span>
                <span className="text-[10px] font-sans text-zinc-400">
                  {layer.subtitle}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {layer.items.length > 0 ? (
                  layer.items.map((note) => (
                    <NoteChip
                      key={note.id}
                      name={note.name}
                      slug={note.slug}
                      position={note.position}
                      locale={locale}
                      onClick={() => onNoteClick?.(note.slug)}
                    />
                  ))
                ) : (
                  <span className="text-xs text-zinc-400 italic">
                    {locale === "ar" ? "مزيج متناغم خاص" : "Proprietary accord signature"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
