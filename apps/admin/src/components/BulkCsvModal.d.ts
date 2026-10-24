import React from "react";
import { BrandItem, NoteItem, ProductItem } from "../seo-utils";
interface BulkCsvModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingBrands: BrandItem[];
    existingNotes: NoteItem[];
    onImportSuccess: (newProducts: ProductItem[], newBrands: BrandItem[], newNotes: NoteItem[]) => void;
}
export declare function BulkCsvModal({ isOpen, onClose, existingBrands, existingNotes, onImportSuccess, }: BulkCsvModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=BulkCsvModal.d.ts.map