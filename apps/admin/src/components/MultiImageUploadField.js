import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, Check, Plus, Star, Trash2, ExternalLink, } from "lucide-react";
export function MultiImageUploadField({ label = "Product Flacon & Gallery Photography", images = [], onChange, folder = "muschio/products", hint = "Upload multiple photos (bottle flacon, packaging box, lifestyle, details). The first photo is the primary cover image.", }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [customUrl, setCustomUrl] = useState("");
    const fileInputRef = useRef(null);
    const handleFileUpload = async (files) => {
        if (!files || files.length === 0)
            return;
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
        const uploadedUrls = [];
        try {
            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                if (!file)
                    continue;
                setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
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
        }
        catch (err) {
            console.error("Multi-image upload error:", err);
            setUploadError(err.message || "Failed to upload one or more images");
        }
        finally {
            setIsUploading(false);
            setUploadProgress("");
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
    };
    const handleAddCustomUrl = () => {
        const trimmed = customUrl.trim();
        if (!trimmed)
            return;
        onChange([...images, trimmed]);
        setCustomUrl("");
        setShowUrlInput(false);
    };
    const handleRemoveImage = (indexToRemove) => {
        const updated = images.filter((_, idx) => idx !== indexToRemove);
        onChange(updated);
    };
    const handleSetCover = (indexToPromote) => {
        if (indexToPromote === 0)
            return;
        const target = images[indexToPromote];
        if (!target)
            return;
        const remaining = images.filter((_, idx) => idx !== indexToPromote);
        onChange([target, ...remaining]);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
            handleFileUpload(e.dataTransfer.files);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    return (_jsxs("div", { className: "space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(ImageIcon, { size: 14, className: "text-neutral-700 dark:text-neutral-300" }), _jsx("span", { className: "text-[11px] font-medium text-neutral-900 dark:text-neutral-100", children: label }), _jsxs("span", { className: "text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-mono border border-neutral-200 dark:border-neutral-700", children: [images.length, " ", images.length === 1 ? "photo" : "photos"] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { type: "button", onClick: () => setShowUrlInput(!showUrlInput), className: "text-[10px] text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors flex items-center gap-1", children: [_jsx(Plus, { size: 11 }), _jsx("span", { children: showUrlInput ? "Hide URL" : "Add by URL" })] }) })] }), _jsx("p", { className: "text-[10px] text-neutral-500 leading-normal", children: hint }), showUrlInput && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md", children: [_jsx("input", { type: "url", placeholder: "https://images.unsplash.com/... or https://res.cloudinary.com/...", value: customUrl, onChange: (e) => setCustomUrl(e.target.value), onKeyDown: (e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomUrl();
                            }
                        }, className: "flex-1 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-black dark:focus:border-white font-mono" }), _jsx("button", { type: "button", onClick: handleAddCustomUrl, disabled: !customUrl.trim(), className: "px-3 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors", children: "Add Photo" })] })), images.length > 0 && (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg", children: [images.map((url, idx) => (_jsxs("div", { className: "group relative aspect-square rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all shadow-sm", children: [_jsx("img", { src: url, alt: `Product image ${idx + 1}`, className: "w-full h-full object-cover", onError: (e) => {
                                    e.target.src = "/product-placeholder.svg";
                                } }), idx === 0 ? (_jsxs("div", { className: "absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[9px] font-semibold rounded flex items-center gap-0.5 shadow", children: [_jsx(Star, { size: 9, fill: "currentColor" }), _jsx("span", { children: "Cover" })] })) : (_jsx("button", { type: "button", onClick: () => handleSetCover(idx), className: "absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black/80 hover:bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all shadow", title: "Make this the primary cover photo", children: "Set Cover" })), _jsxs("div", { className: "absolute top-1.5 end-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "p-1 bg-black/80 hover:bg-neutral-800 text-neutral-200 hover:text-white rounded transition-colors", title: "View full resolution", children: _jsx(ExternalLink, { size: 10 }) }), _jsx("button", { type: "button", onClick: () => handleRemoveImage(idx), className: "p-1 bg-black/80 hover:bg-black text-neutral-200 hover:text-white rounded transition-colors", title: "Delete image", children: _jsx(Trash2, { size: 10 }) })] }), _jsxs("div", { className: "absolute bottom-1 end-1.5 px-1 bg-black/70 text-white text-[8px] rounded font-mono", children: ["#", idx + 1] })] }, `${url}-${idx}`))), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "aspect-square rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white bg-white dark:bg-black transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer", children: [_jsx("div", { className: "p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black text-neutral-600 dark:text-neutral-400 transition-colors mb-1", children: _jsx(Plus, { size: 14 }) }), _jsx("span", { className: "text-[10px] text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white", children: "Add More" })] })] })), images.length === 0 && (_jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onClick: () => fileInputRef.current?.click(), className: "border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 p-6 rounded-lg text-center cursor-pointer transition-all space-y-2 group", children: [_jsx("div", { className: "mx-auto w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-colors", children: isUploading ? (_jsx(Loader2, { size: 18, className: "animate-spin text-black dark:text-white" })) : (_jsx(Upload, { size: 18 })) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-neutral-900 dark:text-white font-medium", children: "Click to select product photos or drag & drop here" }), _jsx("p", { className: "text-[10px] text-neutral-500 mt-0.5", children: "Select multiple files at once \u2022 PNG, JPG, WEBP up to 10MB" })] })] })), isUploading && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md", children: [_jsx(Loader2, { size: 13, className: "animate-spin text-black dark:text-white shrink-0" }), _jsx("span", { children: uploadProgress || "Uploading images to Cloudinary..." })] })), uploadSuccess && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md", children: [_jsx(Check, { size: 13, className: "shrink-0" }), _jsx("span", { children: "Photos uploaded successfully to Cloudinary!" })] })), uploadError && (_jsxs("div", { className: "flex items-center justify-between p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md", children: [_jsx("span", { children: uploadError }), _jsx("button", { type: "button", onClick: () => setUploadError(null), className: "hover:text-black dark:hover:text-white", children: _jsx(X, { size: 12 }) })] })), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/png,image/jpeg,image/webp,image/avif", onChange: (e) => handleFileUpload(e.target.files), className: "hidden" })] }));
}
//# sourceMappingURL=MultiImageUploadField.js.map