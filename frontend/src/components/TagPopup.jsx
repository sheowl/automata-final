import React, { useState, useEffect } from "react";
import { TagsDisplay } from "./DynamicTags";

const TagPopup = ({ open, onClose, onTagSelect, onSave, currentTags = [] }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (open) {
      // Initialize with current tags when popup opens
      setSelectedTags([...currentTags]);
    } else {
      setSelectedTags([]);
    }
  }, [open, currentTags]);

  const handleTagClick = (tagId) => {
    let updated;
    if (selectedTags.includes(tagId)) {
      updated = selectedTags.filter((id) => id !== tagId);
    } else {
      updated = [...selectedTags, tagId];
    }
    setSelectedTags(updated);
  };

  const handleCancel = () => {
    setSelectedTags([...currentTags]); // Reset to original tags
    onClose();
  };

  const handleSave = () => {
    if (onSave) {
      onSave(selectedTags);
    }
    onClose();
  };

  const hasChanges = () => {
    // Check if selected tags are different from current tags
    if (selectedTags.length !== currentTags.length) return true;
    return selectedTags.some(tagId => !currentTags.includes(tagId)) || 
           currentTags.some(tagId => !selectedTags.includes(tagId));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto relative custom-scrollbar">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 16px;
            margin-top: 16px;
            margin-bottom: 16px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #9B1C31;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #7D1628;
            background-clip: content-box;
          }
        `}</style>
        
        <button
          className="absolute top-8 left-8 text-3xl text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="bi bi-arrow-left text-[52px]" />
        </button>
        
        <h2 className="text-2xl font-bold text-[#9B1C31] mb-6 mt-8 text-center">
          Select Tags
        </h2>
        
        <div className="ml-8 mr-8">
          <TagsDisplay 
            selectedTags={selectedTags}
            onTagSelect={handleTagClick}
            showCategories={true}
          />
        </div>
        
        <div className="flex justify-end gap-4 mt-8 mb-8 text-[14px]">
          <button
            onClick={handleCancel}
            className="w-[100px] h-[30px] px-4 py-0 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges()}
            className={`w-[110px] h-[30px] px-8 py-0 rounded-lg font-semibold transition-colors ${
              hasChanges()
                ? "bg-[#9B1C31] text-white hover:bg-[#7D1628]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagPopup;
