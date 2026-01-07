import React from "react";
import SaveButton from "./SaveButton";

function truncate(text, maxLength = 80) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function formatSalaryK(amount) {
  if (!amount || isNaN(amount)) return 0;
  return `${Math.floor(Number(amount) / 1000)}K`;
}

const WORK_SETUP_LABELS = {
  hybrid: "Hybrid",
  onsite: "On-site",
  remote: "Remote",
  // add more as needed
};

const EMPLOYMENT_TYPE_LABELS = {
  fulltime: "Full-time",
  "part-time": "Part-time",
  internship: "Internship",
  // add more as needed
};

function Card({
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
  tags = [],
  matched_tags = [],
  unmatched_job_tags = [],
}) {
  // If tags prop is not provided, build it from matched/unmatched tags
  const computedTags = tags.length
    ? tags
    : [
        ...(matched_tags || []).map(tag => ({ label: tag, matched: true })),
        ...(unmatched_job_tags || []).map(tag => ({ label: tag, matched: false })),
      ];

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
  };

  let matchScoreColor = "text-[#27AE60]";
  if (matchScore < 50) {
    matchScoreColor = "text-[#EF4444]";
  } else if (matchScore < 75) {
    matchScoreColor = "text-[#F5B041]";
  }

  return (
    <div className="bg-white shadow-all-around rounded-[20px] p-6 w-[350px] max-w-[350px] h-[330px] flex flex-col 
    justify-between relative transition transform duration-300 ease-in-out hover:scale-102">
      {/* Save Button + Match Score */}
      <div className="flex justify-between items-center">
        <SaveButton size={45} />
        <div className={`text-end text-xl font-bold leading-tight ${matchScoreColor}`}>
          <div className="text-xl">{matchScore}%</div>
          <div className="text-sm font-bold -mt-[10%]">Matched</div>
        </div>
      </div>

      {/* Title, Company, Location */}
      <div className="space-y-0 -mt-[5%]">
        <h2 className="text-2xl font-bold text-black leading-tight">{jobTitle}</h2>
        <h3 className="text-sm font-bold text-[#676767]">{companyName}</h3>
        <p className="text-[10px] text-[#676767]">{location}</p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {console.log("Card tags prop:", tags)}
          <div className="flex items-center justify-center px-2 py-[3px] bg-indigo-50 rounded-[5px]">
            <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700">
              <i className="bi bi-geo-alt-fill text-[#047857]" />
              <span>{WORK_SETUP_LABELS[workSetup] || workSetup}</span>
            </div>
          </div>

          <div className="flex items-center justify-center px-2 py-[3px] bg-indigo-50 rounded-[5px]">
            <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700">
              <i className="bi bi-briefcase-fill text-[#047857]" />
              <span>{EMPLOYMENT_TYPE_LABELS[employmentType] || employmentType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {computedTags.length === 0 ? (
            <span className="italic text-gray-400 text-xs mt-1 block text-[#EF4444]">No tags for this job</span>
          ) : (
            (() => {
              const sortedTags = [
                ...computedTags.filter((tag) => tag.matched),
                ...computedTags.filter((tag) => !tag.matched),
              ];
              const tagsToShow = sortedTags.slice(0, 3);
              const moreCount = sortedTags.length - tagsToShow.length;

              return (
                <>
                  {tagsToShow.map((tag) => (
                    <span
                      key={tag.label}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tag.matched ? "bg-[#34A853] text-white" : "bg-[#EF4444] text-white"
                      }`}
                    >
                      {tag.label}
                    </span>
                  ))}
                  {moreCount > 0 && (
                    <span className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-xs font-semibold opacity-60 transition-opacity duration-200">
                      +{moreCount} more
                    </span>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Description */}
      <div className="text-xs font-medium text-[#676767]">{truncate(description, 80)}</div>

      {/* Salary + Button */}
      <div className="flex items-center justify-between mt-2">
        <div className="leading-tight flex flex-col justify-center">
          <p className="text-base font-bold">
            ₱{formatSalaryK(salaryRangeLow)} - ₱{formatSalaryK(salaryRangeHigh)}
          </p>
          <p className="text-[10px] font-semibold text-gray-500 -mt-1">{salaryFrequency}</p>
        </div>

        <button
          onClick={() => onViewDetails(jobData)}
          className="h-8 px-6 py-2 bg-white rounded-[10px] outline outline-1 outline-[#047857] inline-flex justify-center 
        items-center gap-2.5 text-[#047857] text-xs font-bold hover:bg-[#047857] hover:text-white transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default Card;