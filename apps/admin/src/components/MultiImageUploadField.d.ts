import React from "react";
interface MultiImageUploadFieldProps {
    label?: string;
    images: string[];
    onChange: (urls: string[]) => void;
    folder?: string;
    hint?: string;
}
export declare function MultiImageUploadField({ label, images, onChange, folder, hint, }: MultiImageUploadFieldProps): React.JSX.Element;
export {};
//# sourceMappingURL=MultiImageUploadField.d.ts.map