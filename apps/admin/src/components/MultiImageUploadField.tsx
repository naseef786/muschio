import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  Check,
  Plus,
  Star,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface MultiImageUploadFieldProps {
  label?: string;
  images: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  hint?: string;
}

export function MultiImageUploadField({
  label = "Product Flacon & Gallery Photography",
  images = [],
  onChange,
  folder = "muschio/products",
  hint = "Upload multiple photos (bottle flacon, packaging box, lifestyle, details). The first photo is the primary cover image.",
}: MultiImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const invalidFile = fileArray.find((f) => !f.type.startsWith("image/"));
    if (invalidFile) {
      setUploadError("Please select only valid image files (PNG, JPG, WEBP)");
      return;
    }

    const oversizedFile = fileArray.find((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      setUploadError("One or more files exceed the 10MB limit");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        if (!file) continue;
        setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/v1/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64,
            folder,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || `Failed to upload ${file.name}`);
        }

        const secureUrl = json.data.secureUrl || json.data.url;
        if (secureUrl) {
          uploadedUrls.push(secureUrl);
        }
      }

      const updated = [...images, ...uploadedUrls];
      onChange(updated);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("Multi-image upload error:", err);
      setUploadError(err.message || "Failed to upload one or more images");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddCustomUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setCustomUrl("");
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCover = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const target = images[indexToPromote];
    if (!target) return;
    const remaining = images.filter((_, idx) => idx !== indexToPromote);
    onChange([target, ...remaining]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={14} className="text-amber-400" />
          <span className="text-[11px] font-medium text-slate-200">{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
            {images.length} {images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <Plus size={11} />
            <span>{showUrlInput ? "Hide URL" : "Add by URL"}</span>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 leading-normal">{hint}</p>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-[#0A0E17] border border-slate-800 rounded">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomUrl();
              }
            }}
            className="flex-1 bg-[#111622] border border-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            disabled={!customUrl.trim()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Grid of Existing Photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-[#0A0E17] border border-slate-800/80 rounded">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-md overflow-hidden bg-[#111622] border border-slate-700/80 hover:border-slate-500 transition-all shadow-sm"
            >
              <img
                src={url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/product-placeholder.svg";
                }}
              />

              {/* Cover Badge */}
              {idx === 0 ? (
                <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[9px] font-semibold rounded flex items-center gap-0.5 shadow">
                  <Star size={9} fill="currentColor" />
                  <span>Cover</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetCover(idx)}
                  className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black/80 hover:bg-amber-600 border border-slate-600 hover:border-amber-500 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all shadow"
                  title="Make this the primary cover photo"
                >
                  Set Cover
                </button>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute top-1.5 end-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 bg-black/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                  title="View full resolution"
                >
                  <ExternalLink size={10} />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded transition-colors"
                  title="Delete image"
                >
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Index Number */}
              <div className="absolute bottom-1 end-1.5 px-1 bg-black/70 text-slate-400 text-[8px] rounded font-mono">
                #{idx + 1}
              </div>
            </div>
          ))}

          {/* Quick Add Card inside grid */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-md border-2 border-dashed border-slate-700/80 hover:border-amber-500/70 bg-[#0E1420]/60 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer"
          >
            <div className="p-2 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition-colors mb-1">
              <Plus size={14} />
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
              Add More
            </span>
          </button>
        </div>
      )}

      {/* Main Drag & Drop Zone if no images */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/80 bg-[#0A0E17] hover:bg-[#0E1420] p-6 rounded-lg text-center cursor-pointer transition-all space-y-2 group"
        >
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
            {isUploading ? (
              <Loader2 size={18} className="animate-spin text-amber-400" />
            ) : (
              <Upload size={18} />
            )}
          </div>
          <div>
            <p className="text-xs text-white font-medium">
              Click to select product photos or drag & drop here
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Select multiple files at once • PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Feedback */}
      {isUploading && (
        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded">
          <Loader2 size={13} className="animate-spin text-amber-400 shrink-0" />
          <span>{uploadProgress || "Uploading images to Cloudinary..."}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded">
          <Check size={13} className="shrink-0" />
          <span>Photos uploaded successfully to Cloudinary!</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Hidden File Input (multiple enabled) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
