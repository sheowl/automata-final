import React, { useState } from "react";

function EmpCard({
  matched = 0,
  isNew = false,
  candidateName = "Candidate Name",
  role = "User Current/Previous Role",
  skills = [],
  moreSkillsCount = 0,
  appliedDaysAgo = 'n',
  onViewFull = () => {},
}) {
  const [status, setStatus] = useState(isNew ? 'new' : '');  return (
    <div className="bg-white shadow-all-around rounded-[20px] p-6 max-w-[324px] h-[340px] hover:scale-102 transition-transform duration-300 flex flex-col justify-between relative z-10">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[32px] font-bold text-[#27AE60] leading-none">{matched}%</div>
          <div className="text-[#27AE60] text-base font-bold -mt-2">Matched</div>
        </div>
        {status === 'new' && (
          <div className="flex items-center gap-1 text-[#464646] text-base font-semibold">
            New
            <span className="inline-block w-2 h-2 bg-[#9B1C31] rounded-full ml-1"></span>
          </div>
        )}
        {status === 'waitlisted' && (
          <div className="flex items-center gap-1 text-[#464646] text-base font-semibold rounded-full px-3 py-1"> Waitlisted 
              <span className="inline-block w-2 h-2 bg-[#F5B041] rounded-full ml-1"></span>
          </div>
        )}
        {status === 'reject' && (
          <div className="flex items-center gap-1 text-[#464646] text-base font-semibold rounded-full px-3 py-1"> Rejected 
              <span className="inline-block w-2 h-2 bg-[#EF4444] rounded-full ml-1"></span>
          </div>
        )}
      </div>

      {/* Candidate Name & Role */}
      <div className="mb-2">
        <div className="text-[20px] font-bold text-[#3C3B3B] leading-tight">{candidateName}</div>
        <div className="text-[14px] text-[#6B7280] font-semibold">{role}</div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.slice(0, 5).map((skill, idx) => (
          <span key={idx} className="px-3 py-1 text-[#9B1C31] border-2 border-[#9B1C31] rounded-[5px] text-xs font-bold bg-[#FFF1F2]">
            {skill}
          </span>
        ))}
        {moreSkillsCount > 0 && (
          <span
            className="px-3 py-1 text-white border-2 border-[#9B1C31] rounded-[5px] text-xs font-semibold bg-[#9B1C31]"
          >
            +{moreSkillsCount} More
          </span>
        )}
      </div>

      {/* Applied & Action */}
      <div className="flex items-center justify-between mt-auto gap-4">
        <div className="text-[12px] text-[#676767] font-semibold">
          Applied: <span className="italic">{appliedDaysAgo}</span> days ago
        </div>
        <button
          className="h-8 px-4 py-0 border-2 border-[#9B1C31] text-[#9B1C31] rounded-[10px] text-[14px] font-bold bg-white hover:bg-[#9B1C31] hover:text-white transition-colors"
          onClick={onViewFull}
          type="button"
        >
          View Full
        </button>
      </div>
    </div>
  );
}

export default EmpCard;
