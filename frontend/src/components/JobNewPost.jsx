import React, { useState } from "react";
import { useEmployerData } from "../hooks/useEmployerData"; // Changed to centralized hook
import { useTags } from "../hooks/useMockData"; // Added for dynamic tags
import { SelectedTags } from "./DynamicTags"; // Added for dynamic tag display
import TagPopup from "./TagPopup"; // Added for tag selection
import { getCategoryName, getProficiencyLevel, CATEGORIES, PROFICIENCY_LEVELS } from "../utils/jobMappings";

// Dropdown options - Update values to match backend
const modalityOptions = [
  { label: "On-site", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];

const workTypeOptions = [
  { label: "Full-Time", value: "fulltime" },
  { label: "Contractual", value: "contractual" },
  { label: "Part-Time", value: "part-time" },
  { label: "Internship", value: "internship" },
];

const positionOptions = Array.from({ length: 100 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

// Use dynamic categories from utils
const categoryOptions = Object.entries(CATEGORIES).map(([id, name]) => ({
  label: <span className="text-[#9B1C31] font-bold">{name}</span>,
  value: parseInt(id)
}));

// Use dynamic proficiency from utils
const proficiencyOptions = Object.entries(PROFICIENCY_LEVELS).map(([id, level]) => ({
  label: <span className="text-[#9B1C31]">{level}</span>,
  value: parseInt(id)
}));

// Reusable Dropdown
const CustomDropdown = ({
  options,
  selected,
  onSelect,
  placeholder,
  openDropdown,
  setOpenDropdown,
  dropdownKey,
  hideCaret
}) => {
  const isOpen = openDropdown === dropdownKey;

  const handleActionClick = () => setOpenDropdown(isOpen ? null : dropdownKey);

  const handleOptionClick = (option) => {
    onSelect(option.value);
    setOpenDropdown(null);
  };

  let displayLabel;
  if (dropdownKey === "category" && selected) {
    displayLabel = getCategoryName(selected);
  } else if (dropdownKey === "proficiency" && selected) {
    displayLabel = getProficiencyLevel(selected);
  } else {
    displayLabel = options.find((opt) => opt.value === selected)?.label || placeholder;
  }

  return (
    <div className="relative">
      <button
        className={`h-8 px-6 py-2 border-2 border-[#9B1C31] focus:border-[#9B1C31] hover:bg-[#9B1C31]/10 text-[#9B1C31] rounded-[10px] text-[14px] font-bold bg-white flex items-center gap-2 transition-colors focus:outline-none focus:ring-0 w-[219px] justify-center whitespace-nowrap`}
        onClick={handleActionClick}
        type="button"
      >
        {displayLabel}
        {!hideCaret && <i className="bi bi-caret-down-fill text-xs" />}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow z-40 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 hover:bg-[#9B1C31]/10 cursor-pointer text-sm font-semibold ${
                selected === option.value ? "text-[#9B1C31]" : "text-gray-700"}
              `}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

//POST New Jobs
const JobNewPost = ({ open, onClose, onSave, companyData, userData }) => {
  // Use CompanyContext instead of JobsContext
  const { loading: contextLoading, error: contextError, clearError } = useEmployerData(); // Get loading and error states
  const { getTagNameById, loading: tagsLoading } = useTags();
  
  // Use company data from props (companyProfile from CompanyContext)
  const company = companyData || {};
  const currentUser = userData || {};

  // Update form state to use tag IDs instead of tag names
  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    tags: [], // Now stores array of tag IDs
  });

  const [selectedModality, setSelectedModality] = useState(null);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [availablePositions, setAvailablePositions] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProficiency, setSelectedProficiency] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showTagPopup, setShowTagPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle salary fields
    if (name === "salaryMin" || name === "salaryMax") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Updated to handle tag IDs instead of tag names
  const handleTagRemove = (tagId) => {
    setForm({ ...form, tags: form.tags.filter((id) => id !== tagId) });
  };

  // Handle tag save from popup
  const handleTagSave = (newTags) => {
    setForm({ ...form, tags: newTags });
  };

  // Add salary validation
  const isSalaryValid = () => {
    const min = parseInt(form.salaryMin) || 0;
    const max = parseInt(form.salaryMax) || 0;
    if (min < 0 || max < 0) return false;
    return min > 0 && max > 0 && min <= max;
  };

  // Updated form validation
  const isFormValid = () => {
    return form.jobTitle.trim() && 
           form.description.trim() && 
           selectedModality && 
           selectedWorkType && 
           availablePositions && 
           selectedCategory && 
           selectedProficiency && 
           isSalaryValid();
  };

  // Update handleSubmit to include the required date fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert("Please fill in all required fields with valid data");
      return;
    }

    // Make sure we have company data
    if (!company || !company.company_id) {
      alert("Company information is not available. Please try refreshing the page.");
      return;
    }

    try {
      setSaving(true);
      clearError();
      
      // Get current date in the format expected by backend
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const currentDateTime = new Date().toISOString(); // Full ISO datetime
      
      // Transform data to match backend expected format exactly
      const jobData = {
        job_title: form.jobTitle.trim(),
        salary_min: parseInt(form.salaryMin),
        salary_max: parseInt(form.salaryMax),
        setting: selectedModality,
        work_type: selectedWorkType,
        description: form.description.trim(),
        position_count: parseInt(availablePositions),
        required_category_id: parseInt(selectedCategory),
        required_proficiency: parseInt(selectedProficiency),
        job_tags: form.tags, // Array of tag IDs
        company_id: company.company_id,
        date_added: currentDate,
        created_at: currentDateTime
      };
      
      console.log("🚀 JobNewPost: Preparing job data:", jobData);
      
      // CHANGED: Call onSave instead of createJob directly
      if (onSave) {
        await onSave(jobData);
      }
      
      // Reset form
      setForm({
        jobTitle: "",
        companyName: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        description: "",
        tags: [],
      });
      setSelectedModality(null);
      setSelectedWorkType(null);
      setAvailablePositions(null);
      setSelectedCategory(null);
      setSelectedProficiency(null);
      
      onClose();
      
    } catch (error) {
      console.error("❌ Failed to prepare job data:", error);
      
      // Try to get more detailed error information
      if (error.message && error.message.includes("422")) {
        alert("Invalid data submitted. Please check all required fields are filled correctly.");
      } else {
        alert(`Failed to create job: ${error.message || error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      <div
        className={`fixed top-0 right-0 h-full w-[640px] bg-white shadow-2xl z-50 transform transition-transform duration-300 rounded-tl-[30px] rounded-bl-[30px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-10 w-full h-full overflow-y-auto relative flex flex-col">
        {/* Close Button */}
        <button
          className="absolute top-8 left-8 text-3xl text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="bi bi-arrow-left text-[52px]" />
        </button>
        
        {/* Error display */}
        {contextError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mt-16">
            Error: {contextError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-16 ml-12">
          {/* Job Title Section */}
          <div>
            <div className="relative flex items-center">
              <input
                className="text-[40px] font-bold text-black outline-none border-b-2 border-[transparent] focus:border-[#9B1C31] w-full placeholder:text-[40px] placeholder:font-bold placeholder:text-[#000000] pr-12"
                name="jobTitle"
                placeholder="Job Title"
                value={form.jobTitle}
                onChange={handleChange}
                required
              />
              {form.jobTitle === "" && (
                <span className="absolute left-48 top-[70%] -translate-y-1/2 flex items-center pointer-events-none">
                  <i className="bi bi-pencil-fill text-[#B4A598] text-xl"></i>
                </span>
              )}
            </div>
            <div className="text-[20px] font-bold text-[#6B7280] -mt-2">
              <input
                className="outline-none border-b-2 border-[transparent] focus:border-[#9B1C31] w-full font-bold text-[#6B7280] placeholder:text-[20px] placeholder:font-bold placeholder:text-[#6B7280]"
                name="companyName"
                placeholder="Company Name"
                value={form.companyName || company.company_name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-[16px] text-[#6B7280]">
              <input
                className="outline-none border-b-2 border-transparent focus:border-[#9B1C31] w-full font-semibold text-[#6B7280] placeholder:text-[16px] placeholder:font-semibold placeholder:text-[#6B7280]"
                name="location"
                placeholder="Job Location"
                value={form.location || company.location || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>          
          
          {/* Salary Range */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#3C3B3B] mb-1">
              Job Salary Range *
            </label>            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[16px] text-[#262424] font-semibold">₱</span>
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Minimum"
                  value={form.salaryMin}
                  onChange={handleChange}
                  className="h-8 px-3 py-2 border-2 border-[#9B1C31] focus:border-[#9B1C31] focus:outline-none focus:ring-0 text-[#9B1C31] rounded-[10px] text-[14px] font-bold bg-white w-[120px]"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <span className="text-[16px] text-[#262424] font-semibold">-</span>
              <div className="flex items-center gap-2">
                <span className="text-[16px] text-[#262424] font-semibold">₱</span>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Maximum"
                  value={form.salaryMax}
                  onChange={handleChange}
                  className="h-8 px-3 py-2 border-2 border-[#9B1C31] focus:border-[#9B1C31] focus:outline-none focus:ring-0 text-[#9B1C31] rounded-[10px] text-[14px] font-bold bg-white w-[120px]"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <span className="text-[16px] text-[#262424] font-semibold">monthly</span>
            </div>
            {/* Validation message */}
            {(form.salaryMin || form.salaryMax) && !isSalaryValid() && (
              <p className="text-red-500 text-[12px] mt-1">
                {parseInt(form.salaryMin) < 0 || parseInt(form.salaryMax) < 0
                  ? "Salary cannot be negative"
                  : parseInt(form.salaryMin) > parseInt(form.salaryMax) 
                  ? "Minimum salary cannot be greater than maximum salary" 
                  : "Please enter valid salary amounts"}
              </p>
            )}
          </div>

          {/* Modality */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[16px] text-[#3C3B3B]">
              Job Modality *
            </label>
            <CustomDropdown
              options={modalityOptions}
              selected={selectedModality}
              onSelect={setSelectedModality}
              placeholder="Select Modality"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              dropdownKey="modality"
            />
          </div>

          {/* Work Type */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[16px] text-[#3C3B3B]">
              Job Work Type *
            </label>
            <CustomDropdown
              options={workTypeOptions}
              selected={selectedWorkType}
              onSelect={setSelectedWorkType}
              placeholder="Select Work Type"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              dropdownKey="worktype"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[#232323]">Job Description *</label>
            <textarea
              className="border-2 border-[#A6A6A6] focus:border-[#9B1C31] focus:outline-none focus:ring-0 rounded px-3 py-2"
              name="description"
              placeholder="Job Description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>

          {/* Available Positions */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[16px] text-[#3C3B3B]">
              Available positions *
            </label>
            <CustomDropdown
              options={positionOptions}
              selected={availablePositions}
              onSelect={setAvailablePositions}
              placeholder="Select Positions"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              dropdownKey="positions"
            />
          </div>

          {/* Category and Proficiency Row */}
          <div className="flex flex-row gap-8">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Required Category *</label>
              <CustomDropdown
                options={categoryOptions}
                selected={selectedCategory}
                onSelect={(value) => {
                  setSelectedCategory(value);
                  setForm({ ...form, tags: [] }); // Clear tags when category changes
                }}
                placeholder="Select Category"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                dropdownKey="category"
                hideCaret={true}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Required Proficiency *</label>
              <CustomDropdown
                options={proficiencyOptions}
                selected={selectedProficiency}
                onSelect={setSelectedProficiency}
                placeholder="Select Proficiency"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                dropdownKey="proficiency"
                hideCaret={true}
              />
            </div>
          </div>
          
          {/* Dynamic Tags Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Tags</label>
              <button
                type="button"
                onClick={() => setShowTagPopup(true)}
                className="text-[#9B1C31] text-[14px] font-semibold hover:underline"
              >
                + Add Tags
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Display selected tags using dynamic tags component */}
              {tagsLoading ? (
                <span className="text-gray-500 text-sm">Loading tags...</span>
              ) : form.tags.length > 0 ? (
                <SelectedTags 
                  tagIds={form.tags} 
                  onRemoveTag={handleTagRemove}
                  className="flex-wrap"
                />
              ) : (
                <span className="text-gray-500 text-sm">No tags selected</span>
              )}
            </div>
          </div>  

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={!isFormValid() || saving || contextLoading}
              className={`w-[243px] h-[48px] font-bold rounded-lg transition text-[16px] ${
                isFormValid() && !saving && !contextLoading
                  ? "bg-[#9B1C31] text-white hover:bg-[#7D1628]" 
                  : "bg-[#979797] text-white cursor-not-allowed"
              }`}
            >
              {saving || contextLoading ? "Creating..." : "Post Job"}
            </button>          
          </div>
        </form>
        
        </div>
      </div>
      
      {/* Tag Selection Popup */}
      <TagPopup
        open={showTagPopup}
        onClose={() => setShowTagPopup(false)}
        onSave={handleTagSave}
        currentTags={form.tags}
      />
    </>
  );
};

export default JobNewPost;