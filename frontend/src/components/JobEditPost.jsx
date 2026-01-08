import React, { useState, useEffect, useRef } from "react";
import { useEmployerData } from "../hooks/useEmployerData";
import { useTags } from "../hooks/useMockData";
import { SelectedTags } from "./DynamicTags";
import TagPopup from "./TagPopup";
import { getCategoryName, getProficiencyLevel, CATEGORIES, PROFICIENCY_LEVELS } from "../utils/jobMappings";

// Dropdown options (keep these as is)
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

const categoryOptions = Object.entries(CATEGORIES).map(([id, name]) => ({
  label: <span className="text-[#9B1C31] font-bold">{name}</span>,
  value: parseInt(id)
}));

const proficiencyOptions = Object.entries(PROFICIENCY_LEVELS).map(([id, level]) => ({
  label: <span className="text-[#9B1C31]">{level.replace("Level ", "Level ")}</span>,
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
  hideCaret,
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
        className="h-8 px-6 py-2 border-2 border-[#9B1C31] focus:border-[#9B1C31] hover:bg-[#9B1C31]/10 text-[#9B1C31] rounded-[10px] text-[14px] font-bold bg-white flex items-center gap-2 transition-colors focus:outline-none focus:ring-0 w-[219px] justify-center whitespace-nowrap"
        onClick={handleActionClick}
        type="button"
      >
        {displayLabel} {!hideCaret && <i className="bi bi-caret-down-fill text-xs" />}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow z-40 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 hover:bg-[#9B1C31]/10 cursor-pointer text-sm font-semibold ${
                selected === option.value ? "text-[#9B1C31]" : "text-gray-700"
              }`}
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

const JobEditPost = ({ open, onClose, onSave, jobData }) => {
  const { updateJobPost: updateJob, loading: contextLoading, error: contextError, clearError } = useEmployerData();
  const { getTagNameById, getTagNamesByIds, loading: tagsLoading } = useTags();
  
  const jobDataRef = useRef(null);
  const isSubmittingRef = useRef(false);
  
  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    modality: "",
    workType: "",
    description: "",
    availablePositions: 1,
    tags: [],
    category: "",
    proficiency: ""
  });

  const [originalForm, setOriginalForm] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showTagPopup, setShowTagPopup] = useState(false);

  // Enhanced data mapping function
  const mapJobDataToForm = (jobData) => {
    console.log("🔄 Mapping jobData to form:", jobData);
    
    // Extract data with multiple fallback options for different data structures
    const mappedData = {
      jobTitle: jobData?.jobTitle || jobData?.job_title || "",
      companyName: jobData?.companyName || jobData?.company_name || "",
      location: jobData?.location || "",
      salaryMin: String(jobData?.salaryMin || jobData?.salary_min || ""),
      salaryMax: String(jobData?.salaryMax || jobData?.salary_max || ""),
      modality: jobData?.setting || jobData?.modalityValue || "",
      workType: jobData?.work_type || jobData?.workTypeValue || "",
      description: jobData?.description || "",
      availablePositions: parseInt(jobData?.position_count || jobData?.positionCount || jobData?.availablePositions || 1) || 1,
      tags: Array.isArray(jobData?.job_tags) ? [...jobData.job_tags] : (Array.isArray(jobData?.tags) ? [...jobData.tags] : []),
      category: parseInt(jobData?.required_category_id || jobData?.categoryId) || "",
      proficiency: parseInt(jobData?.required_proficiency || jobData?.proficiencyLevel) || ""
    };
    
    console.log("✅ Mapped form data:", mappedData);
    return mappedData;
  };

  // Store job data when modal opens
  useEffect(() => {
    if (open && jobData && !isSubmittingRef.current) {
      console.log("🔄 Initializing JobEditPost with jobData:", jobData);
      
      jobDataRef.current = { ...jobData };
      const initialData = mapJobDataToForm(jobData);
      
      setForm(initialData);
      setOriginalForm(initialData);
      setInitialized(true);
    }
  }, [open, jobData]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      isSubmittingRef.current = false;
      jobDataRef.current = null;
      setForm({
        jobTitle: "",
        companyName: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        modality: "",
        workType: "",
        description: "",
        availablePositions: 1,
        tags: [],
        category: "",
        proficiency: ""
      });
      setOriginalForm({});
    }
  }, [open]);

  const hasChanges = React.useMemo(() => {
    const formStr = JSON.stringify(form);
    const originalStr = JSON.stringify(originalForm);
    const changed = formStr !== originalStr;
    
    console.log("🔍 hasChanges check:", {
      changed,
      form,
      originalForm,
      formStr,
      originalStr
    });
    
    return changed;
  }, [form, originalForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("📝 Field changed:", { name, value });
    
    if (name === "salaryMin" || name === "salaryMax") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDropdownSelect = (field, value) => {
    console.log("📝 Dropdown changed:", { field, value });
    setForm({ ...form, [field]: value });
  };

  const handleCancel = () => {
    setForm(originalForm);
    onClose();
  };

  const handleTagRemove = (tagId) => {
    setForm({ ...form, tags: form.tags.filter((id) => id !== tagId) });
  };

  // Handle tag save from popup
  const handleTagSave = (newTags) => {
    setForm({ ...form, tags: newTags });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.jobTitle.trim()) errors.push("Job title is required");
    if (!form.companyName.trim()) errors.push("Company name is required");
    if (!form.location.trim()) errors.push("Location is required");
    if (!form.description.trim()) errors.push("Description is required");
    if (!form.modality) errors.push("Modality is required");
    if (!form.workType) errors.push("Work type is required");
    if (!form.category) errors.push("Category is required");
    if (!form.proficiency) errors.push("Proficiency is required");
    
    const salaryMin = parseInt(form.salaryMin);
    const salaryMax = parseInt(form.salaryMax);
    
    if (!salaryMin || salaryMin <= 0) errors.push("Valid minimum salary is required");
    if (!salaryMax || salaryMax <= 0) errors.push("Valid maximum salary is required");
    if (salaryMin > salaryMax) errors.push("Minimum salary cannot be greater than maximum");
    
    if (form.availablePositions < 1) errors.push("At least 1 position is required");
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission and use stored ref data
    if (isSubmittingRef.current || !jobDataRef.current) {
      console.log("❌ Submission blocked");
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.error("❌ Validation errors:", validationErrors);
      alert("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }

    const storedJobData = jobDataRef.current;
    const jobId = storedJobData.id || storedJobData.job_id || storedJobData.jobId;
    
    if (!jobId) {
      console.error("❌ No job ID available");
      alert("Error: Could not find job ID");
      return;
    }
    
    if (!hasChanges) {
      console.log("❌ No changes detected");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setSaving(true);
      clearError();
      
      console.log("🚀 Submitting job update with ID:", jobId);
      console.log("📝 Form data:", form);
      
      // Create properly formatted update data - EXCLUDE date fields
      const updatedJobData = {
        job_title: form.jobTitle.trim(),
        salary_min: parseInt(form.salaryMin),
        salary_max: parseInt(form.salaryMax),
        setting: form.modality,
        work_type: form.workType,
        description: form.description.trim(),
        position_count: parseInt(form.availablePositions),
        required_category_id: parseInt(form.category),
        required_proficiency: parseInt(form.proficiency),
        job_tags: Array.isArray(form.tags) ? form.tags : []
        // REMOVED: date_added and created_at - these should not be updated
      };
      
      console.log("📤 Sending update data to API:", updatedJobData);
      
      const result = await updateJob(jobId, updatedJobData);
      console.log("✅ Update successful:", result);
      
      if (onSave) {
        onSave(result);
      }
      
      onClose();
      
    } catch (error) {
      console.error("❌ Update failed:", error);
      
      // Show more specific error message
      if (error.message.includes("422")) {
        alert("Invalid data submitted. Please check all fields are filled correctly.");
      } else {
        alert("Failed to update job. Please try again.");
      }
      
      isSubmittingRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  const isSalaryValid = () => {
    const min = parseInt(form.salaryMin) || 0;
    const max = parseInt(form.salaryMax) || 0;
    return min > 0 && max > 0 && min <= max;
  };

  const isFormValid = () => {
    return form.jobTitle.trim() && 
           form.companyName.trim() && 
           form.location.trim() && 
           form.description.trim() && 
           form.modality && 
           form.workType && 
           form.category && 
           form.proficiency && 
           isSalaryValid() && 
           form.availablePositions >= 1;
  };

  // Don"t render until initialized
  if (!open || !initialized) {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
    );
  }

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
          <button
            className="absolute top-8 left-8 text-3xl text-gray-400 hover:text-black"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-arrow-left text-[52px]" />
          </button>
          
          {contextError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mt-16">
              Error: {contextError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-16 ml-8">
            {/* Job Title */}
            <div>            
              <div className="relative flex items-center">
                <input
                  className="text-[40px] font-bold text-black outline-none border-b-2 border-[transparent] focus:border-[#9B1C31] w-full placeholder:text-[40px] placeholder:font-bold placeholder:text-[#000000] pr-12 truncate"
                  name="jobTitle"
                  placeholder="Job Title"
                  value={form.jobTitle}
                  onChange={handleChange}
                  required
                  title={form.jobTitle} 
                />
                {form.jobTitle === "" && (
                  <span className="absolute left-48 top-[70%] -translate-y-1/2 flex items-center pointer-events-none">
                    <i className="bi bi-pencil-fill text-[#B4A598] text-xl"></i>
                  </span>
                )}
              </div>
              
              {/* Company Name */}
              <div className="text-[20px] font-bold text-[#6B7280] -mt-2">
                <input
                  className="outline-none border-b-2 border-[transparent] focus:border-[#9B1C31] w-full font-bold text-[#6B7280] placeholder:text-[20px] placeholder:font-bold placeholder:text-[#6B7280]"
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Location */}
              <div className="text-[16px] text-[#6B7280]">
                <input
                  className="outline-none border-b-2 border-transparent focus:border-[#9B1C31] w-full font-semibold text-[#6B7280] placeholder:text-[16px] placeholder:font-semibold placeholder:text-[#6B7280]"
                  name="location"
                  placeholder="Job Location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>          
            
            {/* Salary Range Fields */}
            <div className="flex flex-col gap-2">
              <label className="text-[16px] font-semibold text-[#3C3B3B] mb-1">
                Job Salary Range
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
              {!isSalaryValid() && (form.salaryMin || form.salaryMax) && (
                <p className="text-red-500 text-[12px] mt-1">
                  Please enter valid salary amounts (minimum must be ≤ maximum)
                </p>
              )}
            </div>

            {/* Modality */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Job Modality <span className="text-red-600">*</span></label>              
              <CustomDropdown
                options={modalityOptions}
                selected={form.modality}
                onSelect={(value) => handleDropdownSelect("modality", value)}
                placeholder="Select Modality"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                dropdownKey="modality"
              />
            </div>

            {/* Work Type */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Job Work Type <span className="text-red-600">*</span></label>              
              <CustomDropdown
                options={workTypeOptions}
                selected={form.workType}
                onSelect={(value) => handleDropdownSelect("workType", value)}
                placeholder="Select Work Type"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                dropdownKey="worktype"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#232323]">Job Description <span className="text-red-600">*</span></label>
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
              <label className="font-semibold text-[16px] text-[#3C3B3B]">Available positions <span className="text-red-600">*</span></label>            
              <CustomDropdown
                options={positionOptions}
                selected={form.availablePositions}
                onSelect={(value) => handleDropdownSelect("availablePositions", value)}
                placeholder="Select Positions"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                dropdownKey="positions"
              />
            </div>

            {/* Category and Proficiency */}
            <div className="flex flex-row gap-8">
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-semibold text-[16px] text-[#3C3B3B]">Required Category <span className="text-red-600">*</span></label>
                <CustomDropdown
                  options={categoryOptions}
                  selected={form.category}
                  onSelect={(value) => setForm({ ...form, category: value, tags: [] })}
                  placeholder="Select Category"
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  dropdownKey="category"
                  hideCaret={true}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-semibold text-[16px] text-[#3C3B3B]">Required Proficiency <span className="text-red-600">*</span></label>
                <CustomDropdown
                  options={proficiencyOptions}
                  selected={form.proficiency}
                  onSelect={(value) => setForm({ ...form, proficiency: value })}
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
                  + Add/Edit Tags
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
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
            
            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || contextLoading}
                className="w-[202px] h-[50px] bg-white text-[#828283] text-[16px] font-bold border border-[#828283] rounded-3xl hover:bg-[#828283]/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasChanges || !isFormValid() || saving || contextLoading}
                className={`w-[202px] h-[50px] font-bold rounded-3xl transition text-[16px] ${
                  hasChanges && isFormValid() && !saving && !contextLoading
                    ? "bg-[#9B1C31] text-white hover:bg-[#7D1628]" 
                    : "bg-[#979797] text-white cursor-not-allowed"
                }`}
              >
                {saving || contextLoading ? "Saving..." : "Save Changes"}
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

export default JobEditPost;