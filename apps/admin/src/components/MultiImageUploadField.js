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
    return (_jsxs("div", { className: "space-y-3 pt-2 border-t border-slate-800", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(ImageIcon, { size: 14, className: "text-amber-400" }), _jsx("span", { className: "text-[11px] font-medium text-slate-200", children: label }), _jsxs("span", { className: "text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono", children: [images.length, " ", images.length === 1 ? "photo" : "photos"] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { type: "button", onClick: () => setShowUrlInput(!showUrlInput), className: "text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1", children: [_jsx(Plus, { size: 11 }), _jsx("span", { children: showUrlInput ? "Hide URL" : "Add by URL" })] }) })] }), _jsx("p", { className: "text-[10px] text-slate-400 leading-normal", children: hint }), showUrlInput && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-[#0A0E17] border border-slate-800 rounded", children: [_jsx("input", { type: "url", placeholder: "https://images.unsplash.com/... or https://res.cloudinary.com/...", value: customUrl, onChange: (e) => setCustomUrl(e.target.value), onKeyDown: (e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomUrl();
                            }
                        }, className: "flex-1 bg-[#111622] border border-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 font-mono" }), _jsx("button", { type: "button", onClick: handleAddCustomUrl, disabled: !customUrl.trim(), className: "px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors", children: "Add Photo" })] })), images.length > 0 && (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 bg-[#0A0E17] border border-slate-800/80 rounded", children: [images.map((url, idx) => (_jsxs("div", { className: "group relative aspect-square rounded-md overflow-hidden bg-[#111622] border border-slate-700/80 hover:border-slate-500 transition-all shadow-sm", children: [_jsx("img", { src: url, alt: `Product image ${idx + 1}`, className: "w-full h-full object-cover", onError: (e) => {
                                    e.target.src = "/product-placeholder.svg";
                                } }), idx === 0 ? (_jsxs("div", { className: "absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[9px] font-semibold rounded flex items-center gap-0.5 shadow", children: [_jsx(Star, { size: 9, fill: "currentColor" }), _jsx("span", { children: "Cover" })] })) : (_jsx("button", { type: "button", onClick: () => handleSetCover(idx), className: "absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-black/80 hover:bg-amber-600 border border-slate-600 hover:border-amber-500 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all shadow", title: "Make this the primary cover photo", children: "Set Cover" })), _jsxs("div", { className: "absolute top-1.5 end-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "p-1 bg-black/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors", title: "View full resolution", children: _jsx(ExternalLink, { size: 10 }) }), _jsx("button", { type: "button", onClick: () => handleRemoveImage(idx), className: "p-1 bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded transition-colors", title: "Delete image", children: _jsx(Trash2, { size: 10 }) })] }), _jsxs("div", { className: "absolute bottom-1 end-1.5 px-1 bg-black/70 text-slate-400 text-[8px] rounded font-mono", children: ["#", idx + 1] })] }, `${url}-${idx}`))), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), disabled: isUploading, className: "aspect-square rounded-md border-2 border-dashed border-slate-700/80 hover:border-amber-500/70 bg-[#0E1420]/60 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer", children: [_jsx("div", { className: "p-2 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition-colors mb-1", children: _jsx(Plus, { size: 14 }) }), _jsx("span", { className: "text-[10px] text-slate-400 group-hover:text-slate-200", children: "Add More" })] })] })), images.length === 0 && (_jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onClick: () => fileInputRef.current?.click(), className: "border-2 border-dashed border-slate-700/80 hover:border-amber-500/80 bg-[#0A0E17] hover:bg-[#0E1420] p-6 rounded-lg text-center cursor-pointer transition-all space-y-2 group", children: [_jsx("div", { className: "mx-auto w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors", children: isUploading ? (_jsx(Loader2, { size: 18, className: "animate-spin text-amber-400" })) : (_jsx(Upload, { size: 18 })) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-white font-medium", children: "Click to select product photos or drag & drop here" }), _jsx("p", { className: "text-[10px] text-slate-500 mt-0.5", children: "Select multiple files at once \u2022 PNG, JPG, WEBP up to 10MB" })] })] })), isUploading && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded", children: [_jsx(Loader2, { size: 13, className: "animate-spin text-amber-400 shrink-0" }), _jsx("span", { children: uploadProgress || "Uploading images to Cloudinary..." })] })), uploadSuccess && (_jsxs("div", { className: "flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded", children: [_jsx(Check, { size: 13, className: "shrink-0" }), _jsx("span", { children: "Photos uploaded successfully to Cloudinary!" })] })), uploadError && (_jsxs("div", { className: "flex items-center justify-between p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded", children: [_jsx("span", { children: uploadError }), _jsx("button", { type: "button", onClick: () => setUploadError(null), className: "hover:text-white", children: _jsx(X, { size: 12 }) })] })), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/png,image/jpeg,image/webp,image/avif", onChange: (e) => handleFileUpload(e.target.files), className: "hidden" })] }));
}
//# sourceMappingURL=MultiImageUploadField.js.map