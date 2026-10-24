import React from "react";
import { NoteItem } from "../seo-utils";
interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteToEdit: NoteItem | null;
    onSave: (note: NoteItem) => void;
}
export declare function NoteModal({ isOpen, onClose, noteToEdit, onSave }: NoteModalProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=NoteModal.d.ts.map