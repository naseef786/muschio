import React, { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, Check, ExternalLink } from "lucide-react";

interface MediaUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  helperText?: string;
  hint?: string;
  placeholder?: string;
}

export function MediaUploadField({
  label,
  value,
  onChange,
  folder = "muschio/general",
  helperText,
  hint,
  placeholder = "https://res.cloudinary.com/...",
}: MediaUploadFieldProps) {
  const finalHelper = hint || helperText || "Direct upload to Cloudinary CDN (JPG, PNG, WEBP)";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Convert file to base64 data URI
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload via Muschio Media API
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
        throw new Error(json.error?.message || "Failed to upload image to Cloudinary");
      }

      const secureUrl = json.data.secureUrl || json.data.url;
      onChange(secureUrl);
      setUploadSuccess(true);
      setShowUrlInput(false);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-neutral-800 dark:text-neutral-200 font-medium text-xs">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          {showUrlInput ? "Hide Direct URL" : "Enter Image URL"}
        </button>
      </div>

      {/* THUMBNAIL PREVIEW IF VALUE EXISTS */}
      {value ? (
        <div className="relative group bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=100";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                Cloudinary CDN
              </span>
              {uploadSuccess && (
                <span className="text-[10px] text-black dark:text-white flex items-center gap-1 font-medium">
                  <Check size={11} /> Uploaded!
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate max-w-full">{value}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              title="View full size image"
            >
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-2.5 py-1.5 rounded bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs transition-colors flex items-center gap-1"
            >
              <Upload size={12} />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD DROPZONE */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            isUploading
              ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900"
              : "border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 text-black dark:text-white">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs font-medium">Uploading image to Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white">
                <ImageIcon size={18} />
              </div>
              <div>
                <span className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                  Click to upload or drag & drop image
                </span>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">{finalHelper}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
      />

      {/* OPTIONAL DIRECT URL INPUT */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 text-xs rounded-md font-mono focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>
      )}

      {/* ERROR MESSAGE */}
      {uploadError && (
        <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-[11px] flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="text-neutral-500 hover:text-black dark:hover:text-white">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
