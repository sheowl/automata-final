import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveSaveIcon from "../assets/ActiveSaveIcon.svg";
import CompanyDetails from "./CompanyDetails";
import { companyData } from "../context/companyData";
import { TagNames } from "./DynamicTags"; // Import dynamic tags
import { useTags } from "../context/TagsContext"; // Import tags context
// Import the mapping utilities
import { getCategoryName, getProficiencyLevel, CATEGORIES, PROFICIENCY_LEVELS } from "../utils/jobMappings";

export default function EmployerPostingDetails({ open, onClose, job, onEdit }) {
  const navigate = useNavigate();
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Get tags context for dynamic tag display
  const { getTagNameById, getTagNamesByIds, getCategoryNameById, loading: tagsLoading } = useTags();

  const handleCompanyDetailsClick = () => {
    setShowCompanyDetails(true);
  };

  const handleCloseCompanyDetails = () => {
    setShowCompanyDetails(false);
  };

  const currentCompany = job ? companyData[job.companyName] : null;  
  
  // Use real job data directly - NO MORE MOCK DATA MERGING
  const fullJobData = job;

  // Helper function to render dynamic tags
  const renderJobTags = (tagIds) => {
    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return <div className="text-gray-500 text-sm">No tags available</div>;
    }

    if (tagsLoading) {
      return <div className="text-gray-500 text-sm">Loading tags...</div>;
    }

    const maxDisplayTags = 8;
    const tagsToShow = tagIds.slice(0, maxDisplayTags);
    const hasMoreTags = tagIds.length > maxDisplayTags;

    return (
      <>
        {tagsToShow.map((tagId) => (
          <span 
            key={tagId} 
            className="px-3 py-1 text-[#9B1C31] border-2 border-[#9B1C31] rounded-full text-[12px] font-semibold hover:bg-[#9B1C31]/10 transition whitespace-nowrap"
          >
            {getTagNameById(tagId)}
          </span>
        ))}
        {hasMoreTags && (
          <span className="px-3 py-1 bg-[#9B1C31] text-white rounded-full text-[12px] font-semibold whitespace-nowrap">
            +{tagIds.length - maxDisplayTags} More
          </span>
        )}
      </>
    );
  };

  // Helper function to get work setting display
  const getWorkSettingDisplay = (setting) => {
    const settingMap = {
      'onsite': 'On-site',
      'hybrid': 'Hybrid',
      'remote': 'Remote'
    };
    return settingMap[setting] || setting || 'Not specified';
  };

  // Helper function to get work type display
  const getWorkTypeDisplay = (workType) => {
    const workTypeMap = {
      'fulltime': 'Full-Time',
      'part-time': 'Part-Time', 
      'contractual': 'Contractual',
      'internship': 'Internship'
    };
    return workTypeMap[workType] || workType || 'Not specified';
  };

  // Helper function to format salary
  const formatSalaryRange = (salaryMin, salaryMax) => {
    if (!salaryMin && !salaryMax) return "Salary not specified";
    
    const formatAmount = (amount) => {
      if (!amount) return null;
      const num = parseInt(amount);
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'k';
      }
      return num.toLocaleString();
    };

    const min = formatAmount(salaryMin);
    const max = formatAmount(salaryMax);
    
    if (min && max) {
      return `₱${min} - ₱${max}`;
    } else if (min) {
      return `₱${min}+`;
    } else if (max) {
      return `Up to ₱${max}`;
    }
    return "Salary not specified";
  };

  const handleEditButtonClick = () => {
    // Ensure we pass data with backend field structure
    const jobDataForEdit = {
      ...fullJobData,
      // Map display fields back to backend fields
      job_title: fullJobData?.jobTitle || fullJobData?.job_title,
      salary_min: fullJobData?.salaryMin || fullJobData?.salary_min,
      salary_max: fullJobData?.salaryMax || fullJobData?.salary_max,
      setting: fullJobData?.setting || fullJobData?.modalityValue,
      work_type: fullJobData?.work_type || fullJobData?.workTypeValue,
      position_count: fullJobData?.position_count || fullJobData?.availablePositions,
      required_category_id: fullJobData?.required_category_id || fullJobData?.categoryId,
      required_proficiency: fullJobData?.required_proficiency || fullJobData?.proficiencyLevel,
      job_tags: fullJobData?.job_tags || fullJobData?.tags || []
    };
    
    onEdit(jobDataForEdit);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 px-8 right-0 h-full w-[640px] bg-white shadow-2xl z-50 transform transition-transform duration-300 rounded-tl-[30px] rounded-bl-[30px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">          
          <div className="flex items-center justify-between mt-12 px-10 h-[80px] z-10">
            <button
              className="w-[52px] h-[52px] text-gray-400 hover:text-black flex items-center justify-center"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="bi bi-arrow-left text-[52px]" />
            </button>
            <img src={ActiveSaveIcon} alt="Tugma Logo" className="w-[68px] h-[41px]" />
          </div>

          <div className="flex-1 overflow-y-auto px-10 pb-10 font-montserrat">            
            <div className="flex flex-col gap-6">
              {fullJobData ? (
                <>
                  {/* Header */}
                  <div className="space-y-4 ml-8">                      
                    <div className="mb-4 mt-8">                      
                      <span className="text-[24px] font-bold text-[#9B1C31]">
                        {fullJobData?.applicants || fullJobData?.applicantCount || 0} Applicants
                      </span>
                      <h2 className="text-[40px] font-bold mt-1 text-black">
                        {fullJobData?.title || fullJobData?.jobTitle || "Job Title"}
                      </h2>                      
                      <div className="flex items-center">
                        <h3 className="text-[20px] font-bold text-[#6B7280]">
                          {fullJobData?.company || fullJobData?.companyName || "Company Name"}
                        </h3>
                        <i
                          className="bi bi-info-circle text-[19px] ml-2 cursor-pointer text-gray-500 hover:text-[#9B1C31] transition-colors"
                          title="Company Information"
                          onClick={handleCompanyDetailsClick}
                        />
                      </div>

                      <p className="text-[16px] font-semibold text-[#6B7280]">
                        {fullJobData?.location || "Job Location"}
                      </p>
                    </div>

                    {/* Salary - Use real data from new backend structure */}
                    <div className="flex items-center gap-2 mb-8">                        
                      <p className="text-[29px] font-bold text-[#262424]">
                        {fullJobData?.salary || formatSalaryRange(fullJobData?.salaryMin, fullJobData?.salaryMax)}
                      </p>
                      <p className="text-[16px] text-[#6B7280]">monthly</p>
                    </div>
                    
                    {/* Work Setting and Type Tags - Use new backend data */}
                    <div className="flex gap-2 mb-6">
                      <span className="px-3 py-1 bg-[#FFF1F2] rounded text-[11px] font-semibold text-[#3C3B3B] flex items-center gap-1">
                        <i className="bi bi-geo-alt-fill text-[#9B1C31]" />                        
                        {getWorkSettingDisplay(fullJobData?.modalityValue || fullJobData?.setting)}
                      </span>
                      <span className="px-3 py-1 bg-[#FFF1F2] rounded text-[11px] font-semibold text-[#3C3B3B] flex items-center gap-1">
                        <i className="bi bi-briefcase-fill text-[#9B1C31]" />
                        {getWorkTypeDisplay(fullJobData?.workTypeValue || fullJobData?.work_type)}
                      </span>
                    </div>
                  </div>         

                  {/* Description */}
                  <div className="space-y-6 ml-8">
                    <div className="gap-2">
                      <h4 className="text-[16px] font-semibold mb-3 text-[#3C3B3B]">Job Description</h4>
                      <p className="text-[12px] font-semibold text-[#676767] leading-relaxed">
                        {fullJobData?.description || "No description available."}
                      </p>
                    </div>
                    
                    {/* Available Positions - Use real data */}                    
                    <p className="text-[14px] text-[#3C3B3B] font-semibold mb-6">                      
                      {(() => {
                        const positions = fullJobData?.positionCount || fullJobData?.position_count || fullJobData?.availablePositions || 0;
                        return positions === 1 
                          ? "1 available position" 
                          : positions > 0
                          ? `${positions} available positions`
                          : "No positions available";
                      })()}
                    </p>
                    
                    {/* Category & Proficiency - Use imported mapping utilities */}
                    <div className="flex gap-16 mb-6">
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-[#3C3B3B] mb-1">Category</span>
                        <span className="px-3 py-1 bg-[#FFF7ED] rounded text-[12px] font-semibold text-[#9B1C31] border-2 border-[#9B1C31] flex items-center gap-1">
                          <i className="bi bi-tag-fill text-[#9B1C31]" />
                          {fullJobData?.category || 
                           getCategoryNameById(fullJobData?.categoryId || fullJobData?.required_category_id) || 
                           getCategoryName(fullJobData?.categoryId || fullJobData?.required_category_id) ||
                           "General"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-[#3C3B3B] mb-1">Proficiency</span>
                        <span className="px-3 py-1 bg-[#FFF7ED] rounded text-[12px] font-semibold text-[#9B1C31] border-2 border-[#9B1C31] flex items-center gap-1">
                          <i className="bi bi-bar-chart-fill text-[#9B1C31]" />
                          {fullJobData?.proficiency || 
                           getProficiencyLevel(fullJobData?.proficiencyLevel || fullJobData?.required_proficiency) ||
                           'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Tags Section */}
                    <div className="mb-8">
                      <h4 className="text-[16px] font-semibold mb-3 text-[#3C3B3B]">Tags</h4>
                      <div className="flex gap-2 flex-wrap mb-4">                        
                        {renderJobTags(fullJobData?.tags || fullJobData?.job_tags)}
                      </div>
                    </div>                    

                    {/* Edit Button */}
                    <div className="w-full flex justify-center pt-6">
                      <button
                        className="w-[300px] h-[48px] bg-[#9B1C31] text-white font-bold py-2 rounded-[10px] hover:bg-[#7D1628] transition-colors text-[16px]"
                        onClick={handleEditButtonClick}
                      >
                        Edit Job Listing
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a job to view details
                </div>
              )}
            </div>          
          </div>
        </div>
      </div>      
      
      {/* Company Details Modal */}
      <CompanyDetails 
        open={showCompanyDetails}
        onClose={handleCloseCompanyDetails}
        job={currentCompany}
        userType="employer"
      />
    </>
  );
}
