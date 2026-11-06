import React from "react";
import { CollectionItem, ProductItem } from "../seo-utils";
interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionToEdit: CollectionItem | null;
    onSave: (collection: Partial<CollectionItem>) => Promise<void> | void;
    allProducts: ProductItem[];
}
export declare function CollectionModal({ isOpen, onClose, collectionToEdit, onSave, allProducts, }: CollectionModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=CollectionModal.d.ts.map