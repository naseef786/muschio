import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, Check, ExternalLink } from "lucide-react";
export function MediaUploadField({ label, value, onChange, folder = "muschio/general", helperText, hint, placeholder = "https://res.cloudinary.com/...", }) {
    const finalHelper = hint || helperText || "Direct upload to Cloudinary CDN (JPG, PNG, WEBP)";
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(!value);
    const fileInputRef = useRef(null);
    const handleFileUpload = async (file) => {
        if (!file)
            return;
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
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
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
        }
        catch (err) {
            console.error("Cloudinary upload failed:", err);
            setUploadError(err.message || "Failed to upload image");
        }
        finally {
            setIsUploading(false);
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file)
            handleFileUpload(file);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file)
            handleFileUpload(file);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "block text-neutral-800 dark:text-neutral-200 font-medium text-xs", children: label }), _jsx("button", { type: "button", onClick: () => setShowUrlInput(!showUrlInput), className: "text-[10px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors", children: showUrlInput ? "Hide Direct URL" : "Enter Image URL" })] }), value ? (_jsxs("div", { className: "relative group bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 flex items-center gap-3", children: [_jsx("div", { className: "relative w-16 h-16 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shrink-0", children: _jsx("img", { src: value, alt: "Preview", className: "w-full h-full object-cover", onError: (e) => {
                                e.target.src =
                                    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=100";
                            } }) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black", children: "Cloudinary CDN" }), uploadSuccess && (_jsxs("span", { className: "text-[10px] text-black dark:text-white flex items-center gap-1 font-medium", children: [_jsx(Check, { size: 11 }), " Uploaded!"] }))] }), _jsx("p", { className: "text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate max-w-full", children: value })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("a", { href: value, target: "_blank", rel: "noreferrer", className: "p-1.5 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors", title: "View full size image", children: _jsx(ExternalLink, { size: 14 }) }), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "px-2.5 py-1.5 rounded bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs transition-colors flex items-center gap-1", children: [_jsx(Upload, { size: 12 }), _jsx("span", { children: "Replace" })] }), _jsx("button", { type: "button", onClick: () => onChange(""), className: "p-1.5 rounded text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors", title: "Remove image", children: _jsx(X, { size: 14 }) })] })] })) : (
            /* UPLOAD DROPZONE */
            _jsx("div", { onDrop: handleDrop, onDragOver: handleDragOver, onClick: () => fileInputRef.current?.click(), className: `border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${isUploading
                    ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900"
                    : "border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900"}`, children: isUploading ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-2 space-y-2 text-black dark:text-white", children: [_jsx(Loader2, { size: 24, className: "animate-spin" }), _jsx("span", { className: "text-xs font-medium", children: "Uploading image to Cloudinary..." })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center py-2 space-y-1.5", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white", children: _jsx(ImageIcon, { size: 18 }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xs text-neutral-800 dark:text-neutral-200 font-medium", children: "Click to upload or drag & drop image" }), _jsx("p", { className: "text-[10px] text-neutral-500 dark:text-neutral-400 font-sans mt-0.5", children: finalHelper })] })] })) })), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/png,image/jpeg,image/webp,image/avif", className: "hidden" }), showUrlInput && (_jsx("div", { className: "pt-1", children: _jsx("input", { type: "url", value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder, className: "w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white px-3 py-2 text-xs rounded-md font-mono focus:outline-none focus:border-black dark:focus:border-white" }) })), uploadError && (_jsxs("div", { className: "p-2 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-[11px] flex items-center justify-between", children: [_jsx("span", { children: uploadError }), _jsx("button", { type: "button", onClick: () => setUploadError(null), className: "text-neutral-500 hover:text-black dark:hover:text-white", children: _jsx(X, { size: 12 }) })] }))] }));
}
//# sourceMappingURL=MediaUploadField.js.map