import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ImageIcon, Loader2, Search, Trash2, Upload, X } from "lucide-react";

interface MediaAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

interface MediaLibraryManagerProps {
  authHeaders: Record<string, string>;
}

const FOLDER = "muschio/products";

export function MediaLibraryManager({ authHeaders }: MediaLibraryManagerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAssets = async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ folder: FOLDER });
      if (cursor) params.set("nextCursor", cursor);
      const response = await fetch(`/api/v1/media/library?${params.toString()}`, { headers: authHeaders });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Could not load media library");
      setAssets(payload.data.assets || []);
      setNextCursor(payload.data.nextCursor);
      setCurrentCursor(cursor);
      setSelected([]);
    } catch (err: any) {
      setError(err.message || "Could not load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAssets(); }, []);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? assets.filter((asset) => asset.publicId.toLowerCase().includes(term)) : assets;
  }, [assets, search]);

  const toggleSelected = (publicId: string) => {
    setSelected((current) => current.includes(publicId) ? current.filter((id) => id !== publicId) : [...current, publicId]);
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const fileArray = Array.from(files);
      for (let index = 0; index < fileArray.length; index += 1) {
        const file = fileArray[index];
        if (!file) continue;
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image file`);
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} exceeds the 10MB limit`);
        setStatus(`Uploading ${index + 1} of ${fileArray.length}: ${file.name}`);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const response = await fetch("/api/v1/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ file: base64, folder: FOLDER }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error?.message || `Failed to upload ${file.name}`);
      }
      setStatus(`${fileArray.length} image${fileArray.length === 1 ? "" : "s"} uploaded successfully`);
      await loadAssets(currentCursor);
    } catch (err: any) {
      setError(err.message || "Bulk upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const deleteSelected = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected image${selected.length === 1 ? "" : "s"} from Cloudinary? Products using these URLs may lose their images.`)) return;
    setLoading(true);
    setError(null);
    try {
      for (const publicId of selected) {
        const response = await fetch(`/api/v1/media?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE", headers: authHeaders });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error?.message || `Failed to delete ${publicId}`);
      }
      setStatus(`${selected.length} image${selected.length === 1 ? "" : "s"} deleted`);
      await loadAssets(currentCursor);
    } catch (err: any) {
      setError(err.message || "Delete failed");
      setLoading(false);
    }
  };

  const selectAllVisible = () => {
    const visibleIds = filteredAssets.map((asset) => asset.publicId);
    setSelected((current) => visibleIds.every((id) => current.includes(id)) ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-2"><ImageIcon size={18} /><h2 className="text-sm font-medium">Cloudinary Media Library</h2></div><p className="mt-1 text-xs text-neutral-500">Manage product images in the <span className="font-mono">{FOLDER}</span> folder.</p></div>
      <div className="flex flex-wrap gap-2"><input ref={inputRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={(event) => void uploadFiles(event.target.files)} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"><Upload size={14} /> {uploading ? "Uploading..." : "Upload images"}</button><button type="button" disabled={!selected.length || loading} onClick={() => void deleteSelected()} className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-3 py-2 text-xs font-medium text-rose-700 disabled:opacity-40 dark:border-rose-900 dark:text-rose-300"><Trash2 size={14} /> Delete selected{selected.length ? ` (${selected.length})` : ""}</button></div>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1"><Search size={14} className="absolute start-3 top-2.5 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page by filename or SKU" className="w-full rounded-md border border-neutral-300 bg-white py-2 ps-9 pe-3 text-xs outline-none focus:border-black dark:border-neutral-700 dark:bg-black dark:text-white dark:focus:border-white" /></div><button type="button" onClick={selectAllVisible} disabled={!filteredAssets.length} className="rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200">Select all visible</button></div>

    {status && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</div>}
    {error && <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button type="button" onClick={() => setError(null)}><X size={14} /></button></div>}

    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-black">{loading ? <div className="flex h-64 items-center justify-center text-neutral-500"><Loader2 size={22} className="animate-spin" /></div> : filteredAssets.length === 0 ? <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-neutral-500"><ImageIcon size={30} /><p className="text-sm">No images found</p><p className="text-xs">Upload product images to build your library.</p></div> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{filteredAssets.map((asset) => { const isSelected = selected.includes(asset.publicId); return <button key={asset.publicId} type="button" onClick={() => toggleSelected(asset.publicId)} className={`group relative aspect-square overflow-hidden rounded-lg border-2 text-left ${isSelected ? "border-black dark:border-white" : "border-transparent hover:border-neutral-400"}`} title={asset.publicId}><img src={asset.secureUrl} alt={asset.publicId} className="h-full w-full object-cover" />{isSelected && <span className="absolute end-2 top-2 rounded-full bg-black p-1 text-white dark:bg-white dark:text-black"><Check size={12} /></span>}<span className="absolute inset-x-0 bottom-0 truncate bg-black/75 px-2 py-1.5 text-xs text-white">{asset.publicId.split("/").pop()}</span></button>; })}</div>}</div>

    <div className="flex items-center justify-between"><div className="flex gap-1"><button type="button" disabled={!cursorHistory.length || loading} onClick={() => { const previous = [...cursorHistory]; const cursor = previous.pop(); setCursorHistory(previous); void loadAssets(cursor || undefined); }} className="rounded border border-neutral-300 p-2 text-neutral-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"><ChevronLeft size={15} /></button><button type="button" disabled={!nextCursor || loading} onClick={() => { if (nextCursor) { setCursorHistory([...cursorHistory, currentCursor || ""]); void loadAssets(nextCursor); } }} className="rounded border border-neutral-300 p-2 text-neutral-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"><ChevronRight size={15} /></button></div><span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{selected.length} selected on this page</span></div>
  </section>;
}
