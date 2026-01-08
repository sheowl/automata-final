import React, { useState } from "react";
import { useTags } from "../hooks/useMockData";
import DetailedSkillMatchModal from "./DetailedSkillMatchModal";

const SkillMatchVisualization = ({ 
  jobTags = [], 
  applicantTags = [], 
  matchScore = 0,
  jobTitle = "Job Position",
  showDetails = false 
}) => {
  const { getTagNamesByIds } = useTags();
  const [expanded, setExpanded] = useState(showDetails);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  // Safely handle both tag IDs (numbers) and tag names (strings)
  const safeJobTags = Array.isArray(jobTags) ? jobTags.filter(tag => tag != null) : [];
  const safeApplicantTags = Array.isArray(applicantTags) ? applicantTags.filter(tag => tag != null) : [];
  
  const isJobTagIds = safeJobTags.length > 0 && typeof safeJobTags[0] === "number";
  const isApplicantTagIds = safeApplicantTags.length > 0 && typeof safeApplicantTags[0] === "number";
  
  const jobTagNames = isJobTagIds ? getTagNamesByIds(safeJobTags) : safeJobTags;
  const applicantTagNames = isApplicantTagIds ? getTagNamesByIds(safeApplicantTags) : safeApplicantTags;

  // Calculate matched and unmatched tags
  const matchedTags = jobTagNames.filter(tag => applicantTagNames.includes(tag));
  const unmatchedTags = jobTagNames.filter(tag => !applicantTagNames.includes(tag));
  const extraApplicantTags = applicantTagNames.filter(tag => !jobTagNames.includes(tag));

  // Determine state based on match score
  const getMatchState = () => {
    if (matchScore >= 75) return "matched";
    if (matchScore >= 50) return "partially_matched";
    if (matchScore >= 25) return "low_match";
    return "rejected";
  };

  const matchState = getMatchState();

  // State configurations
  const stateConfig = {
    matched: {
      label: "Matched",
      color: "bg-[#27AE60]",
      textColor: "text-[#27AE60]",
      borderColor: "border-[#27AE60]",
      icon: "bi-check-circle-fill",
      description: "You meet most of the required skills for this position"
    },
    partially_matched: {
      label: "Partially Matched",
      color: "bg-[#F5B041]",
      textColor: "text-[#F5B041]",
      borderColor: "border-[#F5B041]",
      icon: "bi-exclamation-circle-fill",
      description: "You have some of the required skills"
    },
    low_match: {
      label: "Low Match",
      color: "bg-[#E67E22]",
      textColor: "text-[#E67E22]",
      borderColor: "border-[#E67E22]",
      icon: "bi-dash-circle-fill",
      description: "Limited skill alignment with this position"
    },
    rejected: {
      label: "Not Recommended",
      color: "bg-[#EF4444]",
      textColor: "text-[#EF4444]",
      borderColor: "border-[#EF4444]",
      icon: "bi-x-circle-fill",
      description: "Skills do not align with position requirements"
    }
  };

  const currentState = stateConfig[matchState];

  return (
    <div className="bg-white rounded-[20px] shadow-lg p-6 font-montserrat">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <i className={`bi ${currentState.icon} text-2xl ${currentState.textColor}`} />
          <div>
            <h3 className="text-lg font-bold text-gray-800">Skill Match Analysis</h3>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${currentState.textColor}`}>
            {matchScore}%
          </div>
          <div className={`text-xs font-semibold ${currentState.textColor}`}>
            {currentState.label}
          </div>
        </div>
      </div>

      {/* Match State Badge */}
      <div className={`${currentState.color} bg-opacity-10 ${currentState.borderColor} border-2 rounded-[12px] p-4 mb-4`}>
        <div className="flex items-center gap-2">
          <i className={`bi ${currentState.icon} ${currentState.textColor}`} />
          <span className={`text-sm font-semibold ${currentState.textColor}`}>
            {currentState.description}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>Skill Alignment</span>
          <span>{matchedTags.length} of {jobTagNames.length} required</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${currentState.color} transition-all duration-500`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>

      {/* Toggle Details Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 px-4 bg-gray-50 rounded-[10px] hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">
          {expanded ? "Hide" : "Show"} Detailed Breakdown
        </span>
        <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"} text-gray-600`} />
      </button>

      {/* Detailed Breakdown */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Matched Skills */}
          {matchedTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="bi bi-check-circle-fill text-[#27AE60]" />
                <span className="text-sm font-bold text-gray-800">
                  Matched Skills ({matchedTags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedTags.map((tag, index) => (
                  <div
                    key={`matched-${index}`}
                    className="px-3 py-1 bg-[#27AE60] bg-opacity-10 border-2 border-[#27AE60] rounded-full text-xs font-semibold text-[#27AE60] flex items-center gap-1"
                  >
                    <i className="bi bi-check2" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {unmatchedTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="bi bi-x-circle-fill text-[#EF4444]" />
                <span className="text-sm font-bold text-gray-800">
                  Missing Skills ({unmatchedTags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unmatchedTags.map((tag, index) => (
                  <div
                    key={`unmatched-${index}`}
                    className="px-3 py-1 bg-[#EF4444] bg-opacity-10 border-2 border-[#EF4444] rounded-full text-xs font-semibold text-[#EF4444] flex items-center gap-1"
                  >
                    <i className="bi bi-x" />
                    {tag}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Consider adding these skills to your profile to improve your match score
              </p>
            </div>
          )}

          {/* Additional Skills */}
          {extraApplicantTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <i className="bi bi-plus-circle-fill text-[#047857]" />
                <span className="text-sm font-bold text-gray-800">
                  Your Additional Skills ({extraApplicantTags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {extraApplicantTags.slice(0, 5).map((tag, index) => (
                  <div
                    key={`extra-${index}`}
                    className="px-3 py-1 bg-[#047857] bg-opacity-10 border border-[#047857] rounded-full text-xs font-semibold text-[#047857]"
                  >
                    {tag}
                  </div>
                ))}
                {extraApplicantTags.length > 5 && (
                  <div className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-semibold text-gray-600">
                    +{extraApplicantTags.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Match State Flow Visualization */}
          <div className="bg-gray-50 rounded-[12px] p-4 mt-4">
            <div className="text-xs font-bold text-gray-700 mb-3">Matching Process</div>
            <div className="flex items-center justify-between">
              {/* Initial State */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  matchState === "rejected" ? "border-[#EF4444] bg-[#EF4444] bg-opacity-10" : "border-gray-300 bg-white"
                }`}>
                  <i className={`bi bi-person text-lg ${matchState === "rejected" ? "text-[#EF4444]" : "text-gray-400"}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 mt-1">Initial</span>
              </div>

              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />

              {/* Partial Match State */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  matchState === "partially_matched" || matchState === "low_match" 
                    ? "border-[#F5B041] bg-[#F5B041] bg-opacity-10" 
                    : "border-gray-300 bg-white"
                }`}>
                  <i className={`bi bi-gear text-lg ${
                    matchState === "partially_matched" || matchState === "low_match" ? "text-[#F5B041]" : "text-gray-400"
                  }`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 mt-1">Partial</span>
              </div>

              <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-2" />

              {/* Matched State */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  matchState === "matched" 
                    ? "border-[#27AE60] bg-[#27AE60] bg-opacity-10" 
                    : "border-gray-300 bg-white"
                }`}>
                  <i className={`bi bi-check-circle text-lg ${matchState === "matched" ? "text-[#27AE60]" : "text-gray-400"}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 mt-1">Matched</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {matchState !== "matched" && (
            <div className="bg-emerald-50 border-l-4 border-[#047857] p-4 rounded">
              <div className="flex items-start gap-2">
                <i className="bi bi-lightbulb-fill text-[#047857] mt-1" />
                <div>
                  <div className="text-xs font-bold text-[#047857] mb-1">Recommendation</div>
                  <p className="text-xs text-gray-700">
                    {matchState === "rejected" 
                      ? "Update your profile with the missing skills or consider applying to positions that better match your expertise."
                      : matchState === "low_match"
                      ? "Adding more of the required skills to your profile could significantly improve your match score."
                      : "You\"re close! Add a few more required skills to achieve a perfect match."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Detailed Machine Button */}
          <button
            onClick={() => setShowDetailedModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#047857] to-[#065F46] text-white rounded-[12px] hover:shadow-lg transition-all font-semibold text-sm"
          >
            <i className="bi bi-diagram-3-fill" />
            View Detailed State Machine
          </button>
        </div>
      )}

      {/* Detailed Modal */}
      <DetailedSkillMatchModal
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
        jobTags={jobTags}
        applicantTags={applicantTags}
        matchScore={matchScore}
      />
    </div>
  );
};

export default SkillMatchVisualization;
