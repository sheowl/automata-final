import React, { useState } from "react";

export default function ApplicantCertPopup({ onSave, onCancel }) {
  const [certificationName, setCertificationName] = useState("");
  const [certificationDescription, setCertificationDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [previewURL, setPreviewURL] = useState("");

  const handleSave = () => {
    if (certificationName.trim()) {
      const certification = {
        certificate_name: certificationName,        // ✅ Correct field name
        certificate_description: certificationDescription, // ✅ Correct field name
        name: certificationName,                   // Keep for UI compatibility
        description: certificationDescription,     // Keep for UI compatibility
        previewURL: previewURL,
        file,  // ✅ Include the actual file for upload
      };
      console.log("Saving certification:", certification);
      onSave(certification);
    } else {
      console.log("Validation failed: Missing required fields");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png"];

      if (!validTypes.includes(selectedFile.type)) {
        setFileError("Only JPG, and PNG files are allowed.");
        setFile(null);
        setPreviewURL("");
        return;
      }

      setFileError("");
      setFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        setPreviewURL(URL.createObjectURL(selectedFile));
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-[#047857]">Add Certification</h2>

<div className="space-y-2">
        {/* UPDATED: Remove size limit and PDF mention */}
        <label className="text-base italic text-[#3C3B3B]">Upload certification (JPG/PNG only)</label>
        <div className="flex items-center space-x-4">
          {/* Custom Button */}
          <label
            htmlFor="file-upload"
            className="w-fit rounded-[30px] text-[#047857] border border-[#047857] text-base px-4 py-1 
            font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="bi bi-plus text-xl"></i>
            Add media
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png" // ADDED: Restrict file picker to images only
          />
          {file && <span className="text-sm text-gray-600 truncate max-w-[160px]">{file.name}</span>}
        </div>
        {fileError && <p className="text-sm text-red-500">{fileError}</p>}
      </div>

      {/* File Preview */}
      {previewURL && (
        <div className="mt-4">
          <label className="text-base font-semibold text-[#3C3B3B]">Preview:</label>
          <div className="mt-2 border rounded-md p-2 w-fit max-w-[300px]">
            {/* SIMPLIFIED: Only show image preview since PDF is removed */}
            <img src={previewURL} alt="Preview" className="max-h-48 rounded-md" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-base font-semibold text-[#3C3B3B]">Certification Name</label>
        <input
          className="w-full h-[50px] border border-gray-400 rounded-lg p-4"
          placeholder="Enter certification name"
          value={certificationName}
          onChange={(e) => {
            setCertificationName(e.target.value);
            console.log("Certification Name:", e.target.value); // Debugging
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-base font-semibold text-[#3C3B3B]">Certification Description</label>
        <textarea
          className="w-full h-[100px] border border-gray-400 rounded-lg p-4"
          placeholder="Enter certification description"
          value={certificationDescription}
          onChange={(e) => {
            setCertificationDescription(e.target.value);
            console.log("Certification Description:", e.target.value); // Debugging
          }}
        />
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onCancel}
          className="w-36 px-6 py-2 bg-white text-gray-700 text-base font-bold rounded-[10px] hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="w-36 px-6 py-2 bg-[#047857] text-white text-base font-bold rounded-[10px] hover:bg-[#065F46]"
        >
          Save
        </button>
      </div>
    </div>
  );
}
