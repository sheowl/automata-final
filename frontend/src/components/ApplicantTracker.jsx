import React from "react";

import ApplicantApplicationTimeline from "./ApplicantApplicationTimeline";

function truncate(text, maxLength = 80) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function ApplicantTracker({
  jobTitle,
  companyName,
  location,
  matchScore,
  employmentType,
  workSetup,
  description,
  salaryRangeLow,
  salaryRangeHigh,
  salaryFrequency = "Monthly",
  companyDescription,
  onViewDetails,
  status
}) {
  const jobData = {
    jobTitle,
    companyName,
    location,
    matchScore,
    employmentType,
    workSetup,
    description,
    salaryRangeLow,
    salaryRangeHigh,
    salaryFrequency,
    companyDescription,
    status
  };

  let matchScoreColor = "text-[#27AE60]";
  if (matchScore < 50) {
    matchScoreColor = "text-[#EF4444]";
  } else if (matchScore < 75) {
    matchScoreColor = "text-[#F5B041]";
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case "applied":
        return "You have applied for this job.";
      case "rejected-at-applied":
        return "Your application was rejected at the applied stage.";
      case "interview":
        return "You are scheduled for an interview.";
      case "rejected-after-interview":
        return "You were rejected after the interview.";
      case "standby":
        return "You are on standby for further updates.";
      case "accepted":
        return "Congratulations! You have been accepted for this job.";
      case "rejected":
        return "You were rejected after the interview.";
      default:
        return "Status not available.";
    }
  };

  const getTimelineSteps = () => {
    switch (status) {
      case "applied":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#5DADE2]" },
        ];
      case "rejected-at-applied":
        return [
          { label: "Rejected", date: "02/12/25; 11:01 AM", color: "bg-[#EA4335]" },
        ];
      case "interview":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#FBBC04]" },
        ];
      case "rejected-after-interview":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "Rejected", date: "02/13/25; 11:30 AM", color: "bg-[#EA4335]" },
        ];
      case "standby":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
        ];

      case "accepted":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
          { label: "Accepted", date: "02/14/25; 09:00 AM", color: "bg-[#27AE60]" },
        ];
      
        case "rejected":
        return [
          { label: "Applied", date: "02/12/25; 11:01 AM", color: "bg-[#27AE60]" },
          { label: "For Interview", date: "02/13/25; 10:00 AM", color: "bg-[#27AE60]" },
          { label: "Rejected", date: "02/13/25; 11:30 AM", color: "bg-[#EF4444]" },
        ];  

      default:
        return [];
    }
  };


  const timelineSteps = getTimelineSteps();

  // Add your formatSalary function here
  const formatSalary = (amount) => {
    if (!amount) return 0;
    const num = typeof amount === 'string' ? parseInt(amount) : amount;
    return num >= 1000 ? Math.floor(num / 1000) : num;
  };

  return (
    <div className="bg-white shadow-all-around rounded-[20px] p-6 max-w-[500px] h-[310px] flex flex-row justify-between 
    gap-6 transition transform duration-300 ease-in-out hover:scale-102">
      {/* Left Column */}
      <div className="flex flex-col justify-between w-3/5">
        <div className="flex justify-between items-center">
          <div className={`text-end text-xl font-bold leading-tight ${matchScoreColor}`}>
            <div className="text-base justify-end">{matchScore}% <span className="text-base font-bold">Matched</span></div>
          </div>
        </div>

        <div className="space-y-0 -mt-[5%]">
          <h2 className="text-2xl font-bold text-black leading-tight">{jobTitle}</h2>
          <h3 className="text-sm font-bold text-[#676767]">{companyName}</h3>
          <p className="text-[10px] text-[#676767]">{location}</p>
        </div>

        <div className="space-y-2 mt-2 mb-2">
          <div className="flex gap-2">
            <div className="flex items-center justify-center px-2 py-[3px] bg-indigo-50 rounded-[5px]">
              <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700">
                <i className="bi bi-geo-alt-fill text-[#047857]" />
                <span>{workSetup}</span>
              </div>
            </div>
            <div className="flex items-center justify-center px-2 py-[3px] bg-indigo-50 rounded-[5px]">
              <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700">
                <i className="bi bi-briefcase-fill text-[#047857]" />
                <span>{employmentType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs font-medium text-[#676767]">
          {truncate(description, 80)}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="leading-tight flex flex-col justify-center">
            <p className="text-base font-bold">
              ₱{formatSalary(salaryRangeLow)}K - ₱{formatSalary(salaryRangeHigh)}K
            </p>
            <p className="text-[10px] font-semibold text-gray-500 -mt-1">{salaryFrequency}</p>
          </div>
        </div>
      </div>
    
      {/* Right Column - Timeline */}
      <div
        className="w-2/5 flex flex-col pl-4 h-[310px] py-6 -mt-6"
        style={{
          boxShadow: "-6px 0px 12px -4px rgba(0, 0, 0, 0.12)"
        }}
      >

        <ApplicantApplicationTimeline status={status} />

        <button
          onClick={() => onViewDetails(jobData)}
          className="self-center mt-auto h-8 px-6 py-1 bg-white rounded-[10px] outline outline-1 outline-[#047857] inline-flex justify-center 
          items-center gap-2 text-[#047857] text-xs font-bold hover:bg-[#047857] hover:text-white transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ApplicantTracker;