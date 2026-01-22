import CompanyDetails from "./CompanyDetails";
import ApplicantApplicationTimeline from "./ApplicantApplicationTimeline";
import RecruitmentProcessModal from "./RecruitmentProcessModal";
import { getStatusDescription, getStatusLabel } from "../utils/statusUtils";
import { useState } from "react";
import { Link } from "react-router-dom";

function StatusDetailsBox({ status = "Status", message, children }) {
  return (
    <div className="bg-[#047857] text-white rounded-[20px] px-8 p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-bold">Status Details</h4>
        <p className="text-sm font-semibold">{status}</p>
      </div>
      <div className="text-xs text-left mb-4">{message}</div>
      {children}
    </div>
  );
}

export default function ApplicantTrackerDrawer({ open, onClose, job, onViewDetails }) {
  const [companyDetailsOpen, setCompanyDetailsOpen] = useState(false);
  const [showInterviewDetails, setShowInterviewDetails] = useState(false);
  const [interviewAction, setInterviewAction] = useState(null); // confirmed | cancelled
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);

  let matchScoreColor = "text-[#27AE60]";
  if (job && job.matchScore < 50) {
    matchScoreColor = "text-[#EF4444]";
  } else if (job && job.matchScore < 75) {
    matchScoreColor = "text-[#F5B041]";
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 px-12 right-0 h-full w-[640px] bg-white shadow-2xl z-50 transform 
          transition-transform duration-300 rounded-tl-[30px] rounded-bl-[30px] ${
            open ? "translate-x-0" : "translate-x-full"
          } flex flex-col justify-between py-12`}
      >
        {/* Top Bar */}
        <div className="px-0 mb-4">
          <button
            className="p-2 text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-arrow-left text-5xl" />
          </button>
        </div>

        {/* Main Content */}
        <div className="px-10 flex-grow font-montserrat">
          {job ? (
            <div className="space-y-20">
              <div>
                <span className={`text-2xl font-bold text-right ${matchScoreColor}`}>
                  {job.matchScore}% Matched
                </span>
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (onViewDetails) {
                        onViewDetails(job);
                      }
                    }}
                    className="text-sm font-semibold text-[#047857] underline cursor-pointer bg-transparent border-none hover:text-[#065F46]"
                  >
                    View Job Details
                  </button>
                </div>
                <h2 className="text-4xl font-bold mt-1">{job.jobTitle}</h2>
                <div className="text-xl font-bold text-gray-900">
                  ₱{job.salaryRangeLow}K - ₱{job.salaryRangeHigh}K{" "}
                  <span className="text-xl font-normal text-gray-500">
                    {job.salaryFrequency.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center">
                  <h3 className="text-base font-semibold text-[#676767]">{job.companyName}</h3>
                  <i
                    className="bi bi-info-circle text-[19px] ml-2 cursor-pointer text-gray-500"
                    title="Company Information"
                    onClick={() => setCompanyDetailsOpen(true)}
                  />
                </div>

                <p className="text-base text-[#676767]">{job.location}</p>
                <div className="flex gap-4 mt-4">
                  <span className="px-2 py-1 bg-indigo-50 rounded text-xs font-semibold text-neutral-700">
                    <i className="bi bi-geo-alt-fill text-[#047857] mr-1" />
                    {job.workSetup}
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 rounded text-xs font-semibold text-neutral-700">
                    <i className="bi bi-briefcase-fill text-[#047857] mr-1" />
                    {job.employmentType}
                  </span>
                </div>
              </div>

              <ApplicantApplicationTimeline status={job.status} large />
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">No job selected</div>
          )}
        </div>

        
      </div>

      {/* Interview Modal */}
      {showInterviewDetails && job && (
        <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex justify-center items-center font-montserrat">
          <div className="bg-white w-[500px] p-8 rounded-[20px] shadow-xl text-[#047857] relative">
            <button
              className="absolute top-4 right-4 text-2xl"
              onClick={() => setShowInterviewDetails(false)}
            >
              <i className="bi bi-x-lg" />
            </button>

            <h2 className="text-2xl font-bold mb-6">Interview Details</h2>

            <div className="space-y-3 text-sm">
              {[
                { label: "Job Title", value: job.jobTitle },
                { label: "Company", value: job.companyName },
                { label: "Interview Type", value: "Online via Zoom" },
                { label: "Interview Date", value: "June 15, 2025" },
                { label: "Interview Time", value: "11:59 PM (PST)" },
              ].map(({ label, value }) => (
                <div className="flex justify-between" key={label}>
                  <span className="font-semibold text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-base font-bold mb-2">Remarks</h3>
              <div className="bg-[#047857] text-white text-xs p-6 rounded-[10px]">
                Please ensure that you are available at the scheduled time, as rescheduling opportunities may be limited.
                We strongly encourage you to review the job description, our company background, and prepare any relevant
                materials or portfolio beforehand. More detailed instructions, including the interview link and any
                attachments, have been sent to your registered email. Should you have any unavoidable conflicts, inform
                us as soon as possible.
              </div>
            </div>

            {!interviewAction && (
            <div className="flex justify-between mt-6 gap-4">
              <button
                onClick={() => setInterviewAction("cancelled")}
                className="flex-1 py-2 rounded-[8px] border border-[#047857] text-[#047857] font-bold text-sm hover:bg-[#047857] hover:text-white transition"
              >
                Cancel Interview
              </button>
              <button
                onClick={() => setInterviewAction("confirmed")}
                className="flex-1 py-2 rounded-[8px] border border-[#047857] text-[#047857] font-bold text-sm hover:bg-[#047857] hover:text-white transition"
              >
                Confirm Interview
              </button>
            </div>
          )}


            {interviewAction && (
              <div className="mt-4 text-xs text-gray-500 italic font-medium text-center">
                You have <span className="font-bold">{interviewAction}</span> this interview schedule.
                Should you need to make any changes or cancellations, please notify the company directly.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Details Drawer */}
      <CompanyDetails
        open={companyDetailsOpen}
        onClose={() => setCompanyDetailsOpen(false)}
        job={job}
      />

      
    </>
  );
}