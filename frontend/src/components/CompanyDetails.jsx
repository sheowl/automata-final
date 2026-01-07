import React from "react";
import SaveButton from "./SaveButton";
import Tag from "./JobSkillTag";

export default function CompanyDetails({ open, onClose, job, onApply, userType = "applicant" }) {
  // Debug logging
  console.log("CompanyDetails job data:", job);
  console.log("CompanyDetails companyDescription:", job?.companyDescription);
  
  let matchScoreColor = "text-[#27AE60]";
  if (job && job.matchScore < 50) {
    matchScoreColor = "text-[#EF4444]";
  } else if (job && job.matchScore < 75) {
    matchScoreColor = "text-[#F5B041]";
  }
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 px-8 right-0 h-full w-[640px] bg-white shadow-2xl z-50 transform transition-transform duration-300 rounded-tl-[30px] rounded-bl-[30px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Layout wrapper */}
        <div className="flex flex-col h-full">
          {/* Top Bar */}
          <div className="flex items-center justify-between mt-12 px-10 h-[80px] z-10">
            <button
              className="p-2 text-gray-400 hover:text-gray-700"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="bi bi-arrow-left text-5xl" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 flex items-center justify-center px-10 pb-40 font-montserrat">
            <div className="flex flex-col items-center gap-6 text-center">
              {job ? (
                <>
                  {/* Profile Picture Placeholder */}
                  <svg
                    className="mb-6"
                    width="150"
                    height="150"
                    viewBox="0 0 150 150"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="75"
                      cy="75"
                      r="70"
                      fill="#E5E7EB"
                      stroke="#D1D5DB"
                      strokeWidth="5"
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="24"
                      fill="#9CA3AF"
                      fontWeight="bold"
                    >
                      Logo
                    </text>
                  </svg>                  
                  {/* Company Details */}
                  <div className="space-y-3">
                    <div className="text-5xl font-bold">{job.companyName}</div>
                    <div className="text-xl text-neutral-500">{job.location}</div>
                    <div className="text-base text-neutral-700">{job.companyType || "Company Type"}</div>
                  </div>{/* Company Description */}
                  <div className="space-y-6 mt-6">
                    <div className="text-base text-stone-500">
                      {job.companyDescription || "No company description available."}
                    </div>

                    {/* Buttons Section */}
                    {job.socialLinks && job.socialLinks.length > 0 ? (
                      <div className="flex justify-center pt-6">
                        <div
                          className={`grid gap-4 ${
                            job.socialLinks.length <= 2 ? "grid-cols-2" : "grid-cols-3"
                          }`}
                        >
                          {job.socialLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button 
                                className={`w-full h-11 px-4 py-2 text-white rounded-[30px] transition-colors flex items-center justify-center gap-2 ${
                                  userType === "employer" 
                                    ? "bg-[#9B1C31] hover:bg-[#7D1628]" 
                                    : "bg-[#047857] hover:bg-[#065F46]"
                                }`}
                              >
                                <i className={`bi ${link.icon}`}></i> {link.label}
                              </button>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center pt-6">
                        <div className="text-gray-500 text-sm">No social links available</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No job details available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer mask */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-white rounded-bl-[30px] z-10" />
      </div>
    </>
  );
}
