import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";

const sortOptions = [
  { label: "Best Match", value: "best" },
  { label: "Most Recent", value: "recent" },
];

const filterOptions = [
  { label: "High", value: "high" },
  { label: "Average", value: "average" },
  { label: "Low", value: "low" },
];

const statusOptions = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
];

const color = "#9B1C31";
const selectedBg = color + '1A';

const EmployerApplicantHeader = ({
  jobTitle = 'Job Title', // TODO: Replace default with backend value
  totalApplicants = 'N', // TODO: Replace default with backend value
  onSortChange = () => {}, // callback for sort change
  selectedSort = sortOptions[0].value,
  onClose = () => {}, // callback for close/back button
}) => {
  const navigate = useNavigate();
  const [selectedMatchScore, setSelectedMatchScore] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const selectedOptionStyle = { backgroundColor: selectedBg, color: color };

  const handleSortChange = (val) => {
    onSortChange(val);
  };

  const sortContent = (
    <div className="flex flex-col">
      {sortOptions.map(opt => (
        <div
          key={opt.value}
          className="p-2 cursor-pointer rounded transition-colors text-[14px] font-opensans"
          style={selectedSort === opt.value ? selectedOptionStyle : {}}
          onClick={() => handleSortChange(opt.value)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );

  const filterContent = (
    <div className="p-4 w-80 text-[14px] font-semibold grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-6 items-start">
        <div className="font-semibold text-[#6B7280] mb-1 mt-2">By Match Score</div>
        <div className="h-12" />
        <div className="font-semibold text-[#6B7280] mb-1">By Status</div>
      </div>
      <div className="flex flex-col gap-1 justify-start items-start">
        {filterOptions.map(opt => (
          <div
            key={opt.value}
            className={`p-1 mt-1 rounded cursor-pointer transition-colors`}
            style={selectedMatchScore === opt.value ? selectedOptionStyle : {}}
            data-selected={selectedMatchScore === opt.value}
            onClick={() => setSelectedMatchScore(selectedMatchScore === opt.value ? null : opt.value)}
          >
            {opt.label}
          </div>
        ))}
        <div className="h-2" />
        {statusOptions.map(opt => (
          <div
            key={opt.value}
            className={`p-1 rounded cursor-pointer transition-colors`}
            style={selectedStatus === opt.value ? selectedOptionStyle : {}}
            data-selected={selectedStatus === opt.value}
            onClick={() => setSelectedStatus(selectedStatus === opt.value ? null : opt.value)}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="mt-6 bg-white relative">    
    <button
        className="absolute top-8 left-8 text-3xl text-[#9B1C31] hover:text-[#7D1628]"
        onClick={() => navigate('/skillmatch')}
        aria-label="Go back to skill match"
      >
        <i className="bi bi-arrow-left text-[52px]" />
      </button>
      
      <div className="flex justify-between items-center p-4 pl-[112px] pr-[118px]">        
      {/* Left Section */}
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-[48px] font-bold text-[#3C3B3B] flex items-center gap-2"> {jobTitle} </h1>
          <p className="text-[20px] text-[#9B1C31] font-semibold -mt-2">
            Total Applicants: <span className="italic">{totalApplicants}</span>
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-4 justify-center h-full text-right mt-16">
          {/* Dropdown Buttons */}
          <div className="flex justify-end text-[16px] font-semibold relative mt-0 text-right z-30">
            <Dropdown
              label="Sort by"
              customContent={sortContent}
              width="w-40"
              color={color}
            />
            <Dropdown
              label="Filter by"
              customContent={filterContent}
              width="w-92"
              color={color}
            />
          </div>
        </div>
      </div>
      <div className="pl-[112px] pr-[118px]">
        <hr className="border-t-2 border-[#000000]/20" />
      </div>
    </div>
  );
};

export default EmployerApplicantHeader;