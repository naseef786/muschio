import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ImageIcon, Loader2, Search, X } from "lucide-react";

interface MediaAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

interface MediaLibraryPickerProps {
  images: string[];
  onChange: (urls: string[]) => void;
  authHeaders: Record<string, string>;
  folder?: string;
}

export function MediaLibraryPicker({ images, onChange, authHeaders, folder = "muschio/products" }: MediaLibraryPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string>();
  const [nextCursor, setNextCursor] = useState<string>();
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ folder });
      if (cursor) params.set("nextCursor", cursor);
      const response = await fetch(`/api/v1/media/library?${params.toString()}`, { headers: authHeaders });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Could not load media library");
      setAssets(payload.data.assets || []);
      setNextCursor(payload.data.nextCursor);
      setCurrentCursor(cursor);
    } catch (err: any) {
      setError(err.message || "Could not load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelected([...images]);
      setHistory([]);
      void loadAssets();
    }
  }, [open]);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? assets.filter((asset) => asset.publicId.toLowerCase().includes(term)) : assets;
  }, [assets, search]);

  const toggle = (url: string) => setSelected((current) => current.includes(url) ? current.filter((item) => item !== url) : [...current, url]);
  const applySelection = () => {
    const existing = images.filter((url) => selected.includes(url));
    const added = selected.filter((url) => !images.includes(url));
    onChange([...existing, ...added]);
    setOpen(false);
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-[10px] font-medium text-neutral-700 hover:border-black dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-white">
      <ImageIcon size={12} /> Select from Media Library
    </button>

    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div><h3 className="text-sm font-medium text-neutral-900 dark:text-white">Cloudinary Media Library</h3><p className="mt-1 text-[10px] text-neutral-500">Images from {folder}</p></div>
          <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 hover:text-black dark:hover:text-white"><X size={17} /></button>
        </div>
        <div className="flex items-center gap-2 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div className="relative flex-1"><Search size={13} className="absolute start-2.5 top-2.5 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by filename or SKU" className="w-full rounded-md border border-neutral-300 bg-white py-2 ps-8 pe-3 text-xs text-neutral-900 outline-none focus:border-black dark:border-neutral-700 dark:bg-black dark:text-white dark:focus:border-white" /></div>
          <span className="text-[10px] text-neutral-500">{selected.length} selected</span>
        </div>
        <div className="min-h-[260px] flex-1 overflow-y-auto p-4">
          {loading ? <div className="flex h-48 items-center justify-center text-neutral-500"><Loader2 size={20} className="animate-spin" /></div> : error ? <p className="p-6 text-center text-xs text-red-600">{error}</p> : filteredAssets.length === 0 ? <p className="p-6 text-center text-xs text-neutral-500">No images found in this folder.</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {filteredAssets.map((asset) => { const isSelected = selected.includes(asset.secureUrl); return <button key={asset.publicId} type="button" onClick={() => toggle(asset.secureUrl)} className={`group relative aspect-square overflow-hidden rounded-md border-2 bg-neutral-100 text-left dark:bg-neutral-900 ${isSelected ? "border-black dark:border-white" : "border-transparent hover:border-neutral-400"}`} title={asset.publicId}>
              <img src={asset.secureUrl} alt={asset.publicId} className="h-full w-full object-cover" />
              {isSelected && <span className="absolute end-1.5 top-1.5 rounded-full bg-black p-1 text-white dark:bg-white dark:text-black"><Check size={11} /></span>}
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1.5 py-1 text-[9px] text-white">{asset.publicId.split("/").pop()}</span>
            </button>; })}
          </div>}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex gap-1"><button type="button" disabled={history.length === 0 || loading} onClick={() => { const previous = [...history]; const cursor = previous.pop(); setHistory(previous); void loadAssets(cursor); }} className="rounded border border-neutral-300 p-1.5 text-neutral-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"><ChevronLeft size={14} /></button><button type="button" disabled={!nextCursor || loading} onClick={() => { if (nextCursor) { setHistory([...history, currentCursor || ""]); void loadAssets(nextCursor); } }} className="rounded border border-neutral-300 p-1.5 text-neutral-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"><ChevronRight size={14} /></button></div>
          <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">Cancel</button><button type="button" onClick={applySelection} className="rounded-md bg-black px-3 py-2 text-xs text-white dark:bg-white dark:text-black">Use selected images</button></div>
        </div>
      </div>
    </div>}
  </>;
}
