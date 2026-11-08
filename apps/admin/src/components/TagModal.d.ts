import React from "react";
import { TagItem } from "../seo-utils";
interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tagToEdit: TagItem | null;
    onSave: (tag: TagItem) => Promise<void> | void;
}
export declare function TagModal({ isOpen, onClose, tagToEdit, onSave }: TagModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=TagModal.d.ts.map