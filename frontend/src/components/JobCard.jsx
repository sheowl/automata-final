import React from "react";
import { useNavigate } from "react-router-dom";
import { getWorkSetting, getWorkType } from "../utils/jobMappings";

const JobCard = (props) => {
  const {
    id,
    jobTitle = "Job Title",
    companyName = "Company Name",
    location = "Sta Mesa, Manila",
    type = "On-Site",
    employment = "Full-Time",
    description = "",
    status = "Active",
    createdAt = "", // <-- make sure this is passed in
    onAction = () => {},
    actionLabel = "Action",
    onViewDetails = () => {},
    onViewApplicants = () => {},
    dropdownOpen = false,
    onDropdownToggle = () => {},
  } = props;

  const navigate = useNavigate();

  // Helper to calculate "time ago"
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Unknown time";
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const actionOptions = status === "Active" 
    ? [
        { label: "Edit", value: "edit" },
        { label: "Archive", value: "archive" },
        { label: "Delete", value: "delete" },
      ]
    : [
        { label: "Edit", value: "edit" },
        { label: "Restore", value: "restore" },
        { label: "Delete", value: "delete" },      
      ];

  const handleActionClick = () => {
    onDropdownToggle(id);
  };  const handleOptionClick = (option) => {
    console.log('Option clicked:', option, 'Job ID:', id);
    onDropdownToggle(id); 
    if (option && onAction) {
      console.log('Calling onAction with complete job data:', props);
      // Pass the complete job object instead of just id and action
      onAction(props, option.value); // Pass entire props object
    }
  };const handleViewApplicants = () => {
    const job = {
      id,
      jobTitle,
      companyName,
      location,
      type,
      employment,
      description,
      status,
      createdAt,
    };
    navigate('/employerapplicants', {
      state: {
        jobPosts: [job],
        selectedJob: job,
      },
    });
  };

  const handleViewPostingDetails = () => {
    // Pass the entire props object which contains all mapped data
    onViewDetails(props);
  };
  
  return (
    <div className={`bg-white border rounded-[20px] shadow-all-around p-6 flex relative w-full max-w-full h-[288px] hover:scale-101 transition-transform duration-300 ${dropdownOpen ? 'z-50' : 'z-10'}`}>      <div className="absolute top-12 right-12">
        <span className={`px-4 py-2 rounded-full text-[14px] w-[126px] h-[29px] font-semibold flex items-center justify-center ${
          status === "Active" 
            ? "bg-[#16A34A] text-white" 
            : "bg-[#FACC15] text-white"
        }`}>
          {status}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-start ml-8 mt-4">
        {/* Posted time */}
        <div className="text-[10px] text-[#6B7280]">
          {getTimeAgo(createdAt)}
        </div>
        <div className="font-bold text-[24px] text-[#262424] -mb-1">{jobTitle}</div>        
        <div className="text-[14px] font-bold text-[#6B7280]">{companyName}</div>        
        <div className="text-[12px] font-semibold text-[#6B7280] mb-2">{location}</div>
        
        {/* Tags - Use utility functions for proper formatting */}
        <div className="flex gap-3 mb-4">
          <span className="w-[100px] h-[20px] bg-[#FFF1F2] text-[#3C3B3B] px-3 py-2 rounded text-[11px] font-semibold flex items-center gap-2">
            <i className="bi bi-geo-alt-fill text-[10px] text-[#9B1C31]" /> {getWorkSetting(type)}
          </span>
          <span className="w-[100px] h-[20px] bg-[#FFF1F2] text-[#3C3B3B] px-3 py-2 rounded text-[11px] font-semibold flex items-center gap-2">
            <i className="bi bi-briefcase-fill text-[10px] text-[#9B1C31]" /> {getWorkType(employment)}
          </span>
        </div>
        
        <div className="text-[#676767] text-[12px] mb-2 break-words max-w-[900px] whitespace-pre-line max-h-[40px] overflow-hidden text-ellipsis">
          {description.split(' ').slice(0, 36).join(' ')}{description.split(' ').length > 36 ? '...' : ''}
        </div>
        <div className="text-[#9B1C31] text-[12px] font-semibold cursor-pointer hover:underline" onClick={handleViewPostingDetails}>View posting details</div>
      </div>      
      
      {/* Right side - Action buttons */}
      <div className="flex flex-col justify-end items-end ml-8 mr-8">
        <div className="flex gap-3">
          <div className="relative">
            <button 
              className="w-[100px] h-[32px] bg-transparent text-white px-4 py-3 rounded-lg text-[12px] text-[#9B1C31] font-semibold border-2 border-[#9B1C31] font-semibold hover:bg-[#9B1C31] hover:text-white transition-colors flex items-center gap-2"
              onClick={handleActionClick}
              type="button"
            >
              {actionLabel} <i className="bi bi-caret-down-fill text-[16px]" />
            </button>            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow z-[100]">
                {actionOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 text-[#9B1C31] hover:bg-[#9B1C31]/10 hover:text-[#9B1C31] cursor-pointer text-[12px] font-semibold"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}</div>          
            <button 
            className="w-[144px] h-[32px] bg-transparent text-white px-5 py-3 rounded-lg text-[12px] text-[#9B1C31] font-semibold border-2 border-[#9B1C31] font-semibold hover:bg-[#9B1C31] hover:text-white transition-colors flex items-center gap-2"
            onClick={handleViewApplicants}
          >
            View Applicants
          </button>        
          </div>
      </div>
    </div>
  );
};

export default JobCard;