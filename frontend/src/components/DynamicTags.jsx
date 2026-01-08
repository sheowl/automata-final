import React from "react";
import { useTags } from "../hooks/useMockData";

// Component for displaying tags in a categorized format
export const TagsDisplay = ({ 
  selectedTags = [], 
  onTagSelect, 
  maxSelectionsPerCategory,
  showCategories = true 
}) => {
  const { getTagsByCategories, loading, error } = useTags();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
        <span className="ml-2">Loading tags...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading tags: {error}
      </div>
    );
  }

  const tagsByCategories = getTagsByCategories();

  return (
    <div className="space-y-4">
      {Object.entries(tagsByCategories).map(([category, categoryTags]) => (
        <div key={category} className="space-y-2">
          {showCategories && (
            <h3 className="font-semibold text-[#9B1C31] text-lg">{category}</h3>
          )}
          <div className="flex flex-wrap gap-2">
            {categoryTags.map(tag => (
              <button
                key={tag.tag_id}
                onClick={() => onTagSelect && onTagSelect(tag.tag_id)}
                className={`px-3 py-1 rounded-full text-[13px] font-semibold transition-colors border-2 ${
                  selectedTags.includes(tag.tag_id)
                    ? "bg-[#9B1C31] text-white border-[#9B1C31]"
                    : "bg-[#FFF6F0] text-[#9B1C31] border-[#9B1C31] hover:bg-[#FFE0C2]"
                }`}
              >
                {selectedTags.includes(tag.tag_id) ? (
                  <>
                    <span className="font-bold">&times;</span> {tag.tag_name}
                  </>
                ) : (
                  <>+ {tag.tag_name}</>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for displaying selected tags as chips
export const SelectedTags = ({ tagIds = [], onRemoveTag, className = "" }) => {
  const { getTagNameById } = useTags();

  if (!tagIds.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tagIds.map(tagId => (
        <div
          key={tagId}
          className="flex items-center bg-[#9B1C31] text-white px-3 py-1 rounded-full text-[12px] font-semibold"
        >
          <span>{getTagNameById(tagId)}</span>
          {onRemoveTag && (
            <button
              onClick={() => onRemoveTag(tagId)}
              className="ml-2 text-white hover:text-red-200"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Simple component to just display tag names
export const TagNames = ({ tagIds = [], separator = ", ", className = "" }) => {
  const { getTagNamesByIds } = useTags();
  
  const tagNames = getTagNamesByIds(tagIds);
  
  if (!tagNames.length) return null;
  
  return (
    <span className={className}>
      {tagNames.join(separator)}
    </span>
  );
};

// Single tag display component
export const SingleTag = ({ tagId, className = "" }) => {
  const { getTagNameById } = useTags();
  
  return (
    <span className={`px-3 py-1 text-[#9B1C31] border-2 border-[#9B1C31] rounded-full text-[12px] font-semibold ${className}`}>
      {getTagNameById(tagId)}
    </span>
  );
};

export default TagsDisplay;