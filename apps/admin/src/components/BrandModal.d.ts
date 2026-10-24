import React from "react";
import { BrandItem } from "../seo-utils";
interface BrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandToEdit: BrandItem | null;
    onSave: (brand: BrandItem) => void;
}
export declare function BrandModal({ isOpen, onClose, brandToEdit, onSave }: BrandModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=BrandModal.d.ts.map