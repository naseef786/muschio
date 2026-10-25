import React from "react";
interface MediaUploadFieldProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    helperText?: string;
    hint?: string;
    placeholder?: string;
}
export declare function MediaUploadField({ label, value, onChange, folder, helperText, hint, placeholder, }: MediaUploadFieldProps): React.JSX.Element;
export {};
//# sourceMappingURL=MediaUploadField.d.ts.map