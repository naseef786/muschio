import React from "react";
import { TagItem } from "../seo-utils";
interface SearchableTagSelectProps {
    allTags: TagItem[];
    selectedTagIds: string[];
    onChange: (selectedIds: string[]) => void;
    onCreateTag?: (nameEn: string) => Promise<TagItem | null>;
}
export declare function SearchableTagSelect({ allTags, selectedTagIds, onChange, onCreateTag, }: SearchableTagSelectProps): React.JSX.Element;
export {};
//# sourceMappingURL=SearchableTagSelect.d.ts.map