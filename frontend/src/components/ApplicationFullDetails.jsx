import React, { useState, useEffect } from "react";
import { Mail, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import DetailedSkillMatchModal from "./DetailedSkillMatchModal";
import RecruitmentProcessModal from "./RecruitmentProcessModal";

const ApplicationFullDetails = ({ open, onClose, applicant }) => {
  const navigate = useNavigate();
  const [applicationStatus, setApplicationStatus] = useState("Applied");
  const [finalDecision, setFinalDecision] = useState(null); // 'Accepted' or 'Rejected'
  const [isInterviewConfirmed, setIsInterviewConfirmed] = useState(false);
  const [appliedTimestamp] = useState(new Date());
  const [showSkillMatchModal, setShowSkillMatchModal] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false); 
  const [interviewData, setInterviewData] = useState({
    jobTitle: applicant?.jobTitle || "Software Developer",
    company: "Microsoft", // This could come from job posting data
    interviewType: "",
    interviewDate: "",
    interviewTime: ""
  });
  
  useEffect(() => {
    if (open && applicant) {
      setApplicationStatus("Applied");
      setIsInterviewConfirmed(false);
      setFinalDecision(null); // Reset finalDecision when opening a new applicant
      setInterviewData({
        jobTitle: applicant?.jobTitle || "Software Developer",
        company: "Microsoft",
        interviewType: "",
        interviewDate: "",
        interviewTime: ""
      });
    }
  }, [open, applicant]);

  const tempContactInfo = {
    location: applicant?.location || "Silang, Cavite",
    phone: applicant?.phone || "0992 356 7294",
    email: applicant?.email || "nanapusokoanglove14@gmail.com"
  };
  const tempSkillMatches = {
    matched: applicant?.skills?.slice(0, 3) || ["React", "JavaScript", "CSS"],
    notMatched: ["Python", "Django"],
    moreNotMatched: 3 // Additional non-matched skills count
  };

  if (!applicant) return null;

  const handleInterviewDataChange = (field, value) => {
    setInterviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReject = () => {
    setApplicationStatus("Rejected");
    setFinalDecision("Rejected"); 
  };
  const handleAcceptAndProceed = () => {
    if (applicationStatus === "Applied") {
      setApplicationStatus("For Interview");
      setFinalDecision(null); 
    } else if (applicationStatus === "For Interview" && !isInterviewConfirmed) {
      if (interviewData.interviewType && interviewData.interviewDate && interviewData.interviewTime) {
        setIsInterviewConfirmed(true);
      } else {
        alert("Please fill in all interview details before proceeding.");
      }
    }
  };

  const handleCancelApplication = () => {
    setApplicationStatus("Rejected");
    setIsInterviewConfirmed(false);
  };

  const handleEditDetails = () => {
    setIsInterviewConfirmed(false);
  };

  const handleRejectApplicant = () => {
    setFinalDecision("Rejected");
  };
  const handleAcceptApplicant = () => {
    setFinalDecision("Accepted");
  };

  // Helper to format date and time
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}; ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  // Dynamic timeline steps based on status and timestamps
  const getTimelineSteps = () => {
    const steps = [];
    // Always show Applied
    steps.push({
      label: 'Applied',
      date: formatDateTime(appliedTimestamp),
      color: applicationStatus === 'Applied' ? 'bg-[#27AE60]' : 'bg-[#27AE60]'
    });

    if (applicationStatus === 'For Interview' || (finalDecision && isInterviewConfirmed)) {
      // Interview step
      steps.push({
        label: 'For Interview',
        date: interviewData.interviewDate && interviewData.interviewTime
          ? formatDateTime(`${interviewData.interviewDate}T${interviewData.interviewTime}`)
          : formatDateTime(new Date()),
        color: 'bg-[#27AE60]'
      });
    }

    if (finalDecision === 'Rejected') {
      steps.push({
        label: 'Rejected',
        date: formatDateTime(new Date()),
        color: 'bg-[#EF4444]'
      });
    }
    if (finalDecision === 'Accepted') {
      steps.push({
        label: 'Accepted',
        date: formatDateTime(new Date()),
        color: 'bg-[#27AE60]'
      });
    }

    // You can add more logic for 'Accepted' or other statuses if needed
    return steps;
  };

  // Determine match color based on matchScore
  let matchScoreColor = "text-[#27AE60]";
  if (applicant && applicant.matchScore < 50) {
    matchScoreColor = "text-[#EF4444]";
  } else if (applicant && applicant.matchScore < 75) {
    matchScoreColor = "text-[#F5B041]";
  }

  // Helper to check if interview is done and confirmed
  const isInterviewDoneAndConfirmed = () => {
    if (!isInterviewConfirmed) return false;
    if (!interviewData.interviewDate || !interviewData.interviewTime) return false;
    const interviewDateTime = new Date(`${interviewData.interviewDate}T${interviewData.interviewTime}`);
    return interviewDateTime < new Date();
  };

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
        <div className="h-full flex flex-col">          
            <div className="flex-shrink-0 p-8 border-b-2 border-gray-200 ml-16 mr-16">
            {/* Back Button and Match Percentage */}
            <div className="flex justify-between items-center mb-2">
              <button
                className="text-gray-600 hover:text-black transition-colors"
                onClick={onClose}
                aria-label="Back"
              >
                <i className="bi bi-arrow-left text-[50px]" />
              </button>
              
              <span className={`${matchScoreColor} text-[18px] font-bold`}>{applicant.matched || 60}% Matched</span>
            </div>            
            {/* Personal Info */}
            <div className="flex items-center gap-4 -mb-2">
              <div className="w-[160px] h-[160px] min-w-[160px] min-h-[160px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                {applicant.profilePhoto || applicant.avatar ? (
                  <img 
                    src={applicant.profilePhoto || applicant.avatar} 
                    alt={`${applicant.candidateName || "Applicant"}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="bi bi-person-fill text-gray-400 text-[48px]" />
                )}
              </div>
              <div>
                <h2 className="text-[24px] font-bold text-gray-800">{applicant.candidateName || "Candidate Name"}</h2>                  
                <div className="flex items-center gap-1 text-[#6B7280] font-semibold text-[14px]">
                  <i className="bi bi-geo-alt" />
                  <span>{tempContactInfo.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[#6B7280] font-semibold text-[14px]">
                  <PhoneCall size={14} />
                  <span>{tempContactInfo.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-[#6B7280] font-semibold text-[14px]">
                  <Mail size={14} />
                  <span>{tempContactInfo.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Application Status Section */}
          <div className="flex-1 overflow-y-auto p-8 ml-16 mr-16">
            <h3 className="text-[#7D1628] text-[25px] font-bold mb-6 -mt-4">Application Status</h3>
              <div className="mb-8 relative ml-2 flex flex-col">
                {/* Vertical Line (now handled per step) */}
                {getTimelineSteps().map((step, index, timelineSteps) => (
                  <div key={step.label} className="relative z-10 flex items-stretch gap-4 min-h-[56px]">
                    <div className="flex flex-col items-center mr-3 h-full min-h-[40px] justify-center">
                      <div className={`w-5 h-5 rounded-full ${step.color} z-10`} />
                      {index < timelineSteps.length - 1 && (
                        <div className="absolute top-[20px] left-[8px] w-[4px] h-full bg-[#27AE60] z-0" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center h-full min-h-[40px] py-1">
                      <div className="font-semibold text-gray-800 leading-tight">{step.label}</div>
                      <div className="text-gray-500 text-[12px] italic leading-tight">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            {/* Interview Result Card */}
            {isInterviewDoneAndConfirmed() && (
              <div className="bg-[#9B1C31] rounded-xl p-6 mb-8 shadow-lg flex flex-col items-center">
                <h3 className="text-white text-[16px] font-bold text-lg mb-2 w-full text-left">Interview Result</h3>
                <p className="text-white text-[12px] font-medium mb-4 w-full text-left">
                  After reviewing the applicant's interview, you may now choose to either accept them and proceed with a job offer or reject them if they will not be moving forward.
                </p>
                <div className="flex gap-4 w-full justify-center">
                  <button onClick={handleRejectApplicant} className="w-[167px] h-[29px] bg-white text-[#9B1C31] text-[11px] font-bold rounded-lg px-6 py-2 hover:bg-gray-100 transition-colors">Reject Applicant</button>
                  <button onClick={handleAcceptApplicant} className="w-[167px] h-[29px] bg-white text-[#9B1C31] text-[11px] font-bold rounded-lg px-6 py-2 hover:bg-gray-100 transition-colors">Accept Applicant</button>
                </div>
              </div>
            )}
            {/* Status Details */}
            <div className={`${isInterviewDoneAndConfirmed() ? 'bg-[#FEFEFF] text-[#9B1C31] border shadow-lg' : 'bg-[#9B1C31] text-white'} rounded-lg p-6 mb-8 ml-4 mr-4`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold text-[16px] ${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-white'}`}>Status Details</h4>
                <span className={`font-semibold text-[12px] ${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-white'}`}>{applicationStatus === "For Interview" ? "For Interview" : "Applicant"}</span>
              </div>
                {applicationStatus === "For Interview" ? (
                <div>
                  <p className={`${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-white'} text-[12px] font-medium mb-6`}>
                    Set a date and time for the interview.
                  </p>
                  {isInterviewConfirmed ? (
                    <div className={`space-y-4 mb-6 ml-8 ${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-[#D1FAE5]'} text-[12px] font-medium`}>
                      <div className="flex">
                        <div className="w-[180px]">Job Title</div>
                        <div>{interviewData.jobTitle}</div>
                      </div>
                      <div className="flex">
                        <div className="w-[180px]">Company</div>
                        <div>{interviewData.company}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px]">Interview Type</div>
                        <div className="text-inherit">
                          {interviewData.interviewType === 'online' ? 'Online' : 
                           interviewData.interviewType === 'onsite' ? 'Onsite' : 
                           interviewData.interviewType}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px]">Interview Date</div>
                        <div className="text-inherit">
                          {interviewData.interviewDate ? new Date(interviewData.interviewDate).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : ''}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px]">Interview Time</div>
                        <div className="text-inherit">
                          {interviewData.interviewTime ? 
                            new Date(`2000-01-01T${interviewData.interviewTime}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            }) + ' (PST)' : ''}
                        </div>
                      </div>
                    </div>                    
                    ) : (
                    /* Editable Interview Form Fields */
                    <div className="space-y-4 mb-6 ml-8 text-[#D1FAE5] text-[12px] font-medium">
                      <div className="flex">
                        <div className="w-[180px]">Job Title</div>
                        <div>{interviewData.jobTitle}</div>
                      </div>
                      <div className="flex">
                        <div className="w-[180px]">Company</div>
                        <div>{interviewData.company}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px]">Interview Type</div>
                        <div className="w-[125px] h-[30px] relative z-50">
                          <Dropdown
                            label={
                              <span className="flex items-center justify-between w-full text-[11px] text-black">
                                <span>
                                  {interviewData.interviewType === 'online' ? 'Online' : interviewData.interviewType === 'onsite' ? 'Onsite' : ''}
                                </span>
                                <i className="bi bi-caret-down-fill text-xs ml-1" style={{ color: '#9B1C31' }} />
                              </span>
                            }
                            options={[
                              { label: "Online", value: "online" },
                              { label: "Onsite", value: "onsite" }
                            ]}
                            onSelect={(option) => handleInterviewDataChange('interviewType', option.value)}
                            width="w-full"
                            buttonClass="w-[125px] h-[30px] bg-white text-[12px] font-medium px-3 py-1 rounded-lg border-0 focus:outline-none"
                            hideDefaultIcon={true}
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px] text-[#D1FAE5] text-[12px] font-medium">Interview Date</div>
                        <div className="relative w-[125px] h-[30px]">
                        <input 
                          type="date"
                          id="interviewDate"
                          ref={(input) => (window.dateInput = input)} 
                          className="w-full h-full bg-white rounded-lg px-3 py-1 text-[#000000] text-[10px] font-medium border-0 focus:ring-2 focus:ring-white pr-8"
                          value={interviewData.interviewDate}
                          onChange={(e) => handleInterviewDataChange('interviewDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ colorScheme: 'light' }}
                        />
                        <i 
                          className="bi bi-calendar3 absolute right-2 top-1/2 transform -translate-y-1/2 text-[#9B1C31] text-[14px] cursor-pointer"
                          onClick={() => window.dateInput?.showPicker()}
                        />
                      </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[180px] text-[#D1FAE5] text-[12px] font-medium">Interview Time</div>
                        <div className="w-[125px] h-[30px]">
                          <Dropdown
                            label={
                              interviewData.interviewTime ? (
                                <span className="flex items-center justify-between w-full text-[11px] text-black">
                                  <span>
                                    {new Date(`2000-01-01T${interviewData.interviewTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </span>
                                  <i className="bi bi-caret-down-fill text-xs ml-1" style={{ color: '#9B1C31' }} />
                                </span>
                              ) : (
                                <span className="flex items-center justify-end w-full text-[11px] text-black">
                                  <i className="bi bi-caret-down-fill text-xs ml-1" style={{ color: '#9B1C31' }} />
                                </span>
                              )
                            }
                            options={[
                              { label: "8:00 AM", value: "08:00" },
                              { label: "8:30 AM", value: "08:30" },
                              { label: "9:00 AM", value: "09:00" },
                              { label: "9:30 AM", value: "09:30" },
                              { label: "10:00 AM", value: "10:00" },
                              { label: "10:30 AM", value: "10:30" },
                              { label: "11:00 AM", value: "11:00" },
                              { label: "11:30 AM", value: "11:30" },
                              { label: "12:00 PM", value: "12:00" },
                              { label: "12:30 PM", value: "12:30" },
                              { label: "1:00 PM", value: "13:00" },
                              { label: "1:30 PM", value: "13:30" },
                              { label: "2:00 PM", value: "14:00" },
                              { label: "2:30 PM", value: "14:30" },
                              { label: "3:00 PM", value: "15:00" },
                              { label: "3:30 PM", value: "15:30" },
                              { label: "4:00 PM", value: "16:00" },
                              { label: "4:30 PM", value: "16:30" },
                              { label: "5:00 PM", value: "17:00" }
                            ]}
                            onSelect={(option) => handleInterviewDataChange('interviewTime', option.value)}
                            width="w-full"
                            buttonClass="w-[125px] h-[30px] bg-white text-[12px] font-medium px-3 py-1 rounded-lg border-0 focus:outline-none"
                            hideDefaultIcon={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Remarks Section */}
                  <div className="mb-6">
                    <h5 className={`${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-[#FEFEFF]'} text-[14px] font-bold mb-3`}>Remarks</h5>
                    <div className={`bg-white rounded-lg p-4 ${isInterviewDoneAndConfirmed() ? 'border-2 border-[#9B1C31]' : ''}`}>
                      <p className={`${isInterviewDoneAndConfirmed() ? 'text-[#9B1C31]' : 'text-[#7D1628]'} text-[10px] font-medium leading-relaxed ml-4 mr-4`}>
                        Please ensure that you are available at the scheduled time, as rescheduling opportunities may be limited. We encourage you to research our company, review the job description, our company background, and prepare any relevant materials or portfolio beforehand. More detailed instructions, including the interview link and any attachments, have been sent to your registered email. Should you have any unavoidable conflicts, inform us as soon as possible.
                      </p>
                    </div>                  
                </div>  
                  <div className="ml-1 flex gap-3">
                    {isInterviewConfirmed && !isInterviewDoneAndConfirmed() ? (
                      <>
                        <button 
                          onClick={handleCancelApplication}
                          className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-5 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                        >
                          Cancel Application
                        </button>
                        <button 
                          onClick={handleEditDetails}
                          className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-5 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                        >
                          Edit Details
                        </button>
                      </>
                    ) : !isInterviewConfirmed ? (
                      <>
                        <button 
                          onClick={handleReject}
                          className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-5 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                        >
                          Reject Application
                        </button>
                        <button 
                          onClick={handleAcceptAndProceed}
                          className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-5 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                        >
                          Accept and Proceed
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-white text-[12px] mb-6">
                    Review and decide whether to move forward with this applicant. You may accept the application to proceed with that they will proceed, or reject the application to indicate that they will not be moving forward in the hiring process.
                  </p>
                  <div className="ml-1 flex gap-3">
                    <button 
                      onClick={handleReject}
                      className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-6 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                    >
                      Reject Application
                    </button>
                    <button 
                      onClick={handleAcceptAndProceed}
                      className="w-[167px] h-[29px] bg-white text-[#9B1C31] px-4 py-1 rounded-lg font-bold text-[11px] hover:bg-gray-100 hover:text-[#7D1628] transition-colors"
                    >
                      Accept and Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>            
            {/* Tag Matches */}
            <div className="mb-8">
              <h4 className="font-bold text-[16px] text-gray-800 mb-4">Tag Matches</h4>
              <div className="flex flex-wrap gap-2">
                {tempSkillMatches.matched.map((skill, index) => (
                  <span key={`matched-${index}`} className="border-2 border-[#34A853] text-[#3C3B3B] px-3 py-1 rounded-full text-[12px] font-semibold">
                    {skill}
                  </span>
                ))                
                }{tempSkillMatches.notMatched.map((skill, index) => (
                  <span key={`not-matched-${index}`} className="border-2 border-[#EF4444] text-[#3C3B3B] px-3 py-1 rounded-full text-[12px] font-semibold">
                    {skill}
                  </span>
                ))}
                {tempSkillMatches.moreNotMatched > 0 && (
                  <span className="border-2 border-[#EF4444] text-[#3C3B3B] px-3 py-1 rounded-full text-[12px] font-semibold">
                    +{tempSkillMatches.moreNotMatched} more
                  </span>
                )}
              </div>
              
              {/* Machine Visualization Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowSkillMatchModal(true)}
                  className="flex-1 py-2 bg-[#9B1C31] text-white rounded-lg font-semibold text-sm hover:bg-[#7D1628] transition-colors flex items-center justify-center gap-2"
                >
                  <i className="bi bi-diagram-3-fill" />
                  View Skill Matching Process
                </button>
                <button
                  onClick={() => setShowRecruitmentModal(true)}
                  className="flex-1 py-2 bg-[#9B1C31] text-white rounded-lg font-semibold text-sm hover:bg-[#7D1628] transition-colors flex items-center justify-center gap-2"
                >
                  <i className="bi bi-diagram-3-fill" />
                  View Recruitment Process
                </button>
              </div>
            </div>

            {/* View Resume Button */}
            <div className="mb-8 justify-center items-center flex">
              <button
                className="w-[285px] h-[48px] bg-[#9B1C31] text-white py-3 rounded-lg font-bold text-[16px] hover:bg-[#7D1628] transition-colors"
                onClick={() => navigate('/applicantresume')}
              >
                View Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Match Modal */}
      <DetailedSkillMatchModal
        isOpen={showSkillMatchModal}
        onClose={() => setShowSkillMatchModal(false)}
        jobTags={applicant?.requiredSkills || []}
        applicantTags={applicant?.skills || []}
        matchScore={applicant?.matchScore || 0}
        isEmployer={true}
      />

      {/* Recruitment Process Modal */}
      <RecruitmentProcessModal
        isOpen={showRecruitmentModal}
        onClose={() => setShowRecruitmentModal(false)}
        currentStatus={finalDecision === 'Accepted' ? 'accepted' : finalDecision === 'Rejected' ? 'rejected' : applicationStatus === 'For Interview' ? 'interview' : 'applied'}
        applicationDate={appliedTimestamp}
        interviewDate={interviewData.interviewDate && interviewData.interviewTime ? new Date(`${interviewData.interviewDate}T${interviewData.interviewTime}`) : null}
        rejectionDate={finalDecision === 'Rejected' ? new Date() : null}
        acceptedDate={finalDecision === 'Accepted' ? new Date() : null}
        isEmployer={true}
      />
    </>
  );
};

export default ApplicationFullDetails;