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
    <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={14} className="text-neutral-700 dark:text-neutral-300" />
          <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100">{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-mono border border-neutral-200 dark:border-neutral-700">
            {images.length} {images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <Plus size={11} />
            <span>{showUrlInput ? "Hide URL" : "Add by URL"}</span>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-neutral-500 leading-normal">{hint}</p>

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md">
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
            className="flex-1 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white font-mono"
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            disabled={!customUrl.trim()}
            className="px-3 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
          >
            Add Photo
          </button>
        </div>
      )}

      {/* Grid of Existing Photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all shadow-sm"
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
                <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-semibold rounded flex items-center gap-0.5 shadow">
                  <Star size={9} fill="currentColor" />
                  <span>Cover</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetCover(idx)}
                  className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black/80 hover:bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all shadow"
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
                  className="p-1 bg-black/80 hover:bg-neutral-800 text-neutral-200 hover:text-white rounded transition-colors"
                  title="View full resolution"
                >
                  <ExternalLink size={10} />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 bg-black/80 hover:bg-black text-neutral-200 hover:text-white rounded transition-colors"
                  title="Delete image"
                >
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Index Number */}
              <div className="absolute bottom-1 end-1.5 px-1 bg-black/70 text-white text-[8px] rounded font-mono">
                #{idx + 1}
              </div>
            </div>
          ))}

          {/* Quick Add Card inside grid */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white bg-white dark:bg-black transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer"
          >
            <div className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black text-neutral-600 dark:text-neutral-400 transition-colors mb-1">
              <Plus size={14} />
            </div>
            <span className="text-[10px] text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white">
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
          className="border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 p-6 rounded-lg text-center cursor-pointer transition-all space-y-2 group"
        >
          <div className="mx-auto w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors">
            {isUploading ? (
              <Loader2 size={18} className="animate-spin text-black dark:text-white" />
            ) : (
              <Upload size={18} />
            )}
          </div>
          <div>
            <p className="text-xs text-neutral-900 dark:text-white font-medium">
              Click to select product photos or drag & drop here
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Select multiple files at once • PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Feedback */}
      {isUploading && (
        <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md">
          <Loader2 size={13} className="animate-spin text-black dark:text-white shrink-0" />
          <span>{uploadProgress || "Uploading images to Cloudinary..."}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md">
          <Check size={13} className="shrink-0" />
          <span>Photos uploaded successfully to Cloudinary!</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="hover:text-black dark:hover:text-white"
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
