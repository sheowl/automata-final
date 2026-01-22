import React, { useState, useEffect } from "react";
import EmployerSideBar from "../components/EmployerSideBar";
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  CalendarDaysIcon, 
  StarIcon, 
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useMockData";
import { useEmployerData } from "../hooks/useEmployerData";
import { useNavigate } from "react-router-dom";

const EmployerHomePage = () => {
  const navigate = useNavigate();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_applications: 0,
    pending_reviews: 0
  });
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    company_size: "",
    location: ""
  });
  const [allApplicants, setAllApplicants] = useState([]); // Store all applicants
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllApplicants, setShowAllApplicants] = useState(false); // New state for expanded view

  // Dashboard limit for recent applicants
  const DASHBOARD_LIMIT = 3;

  // Get methods from EmployerData hook (company operations)
  const { 
    getDashboardStats, 
    getRecentApplicants, 
    getCompanyProfile,
    loading: companyLoading,
    error: companyError,
    clearError
  } = useEmployerData();

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      clearError(); // Clear any previous company errors
      
      // Load dashboard stats, all applicants, and company profile in parallel
      // Note: getRecentApplicants now returns ALL applicants from backend
      const [statsResponse, applicantsResponse, profileResponse] = await Promise.all([
        getDashboardStats(),
        getRecentApplicants(), // No limit parameter - backend returns all
        getCompanyProfile()
      ]);

      // Update stats
      setStats({
        active_jobs: statsResponse.active_jobs || 0,
        total_applications: statsResponse.total_applications || 0,
        pending_reviews: statsResponse.pending_reviews || 0
      });

      // Update company info (from either dashboard stats or profile)
      const companyData = statsResponse.company_info || profileResponse;
      setCompanyInfo({
        company_name: companyData.company_name || companyData.name || "Company Name",
        company_size: companyData.company_size || "",
        location: companyData.location || ""
      });

      // Store ALL applicants in state
      setAllApplicants(applicantsResponse.recent_applicants || applicantsResponse || []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get applicants based on whether showing all or limited view
  const getApplicantsToShow = () => {
    return showAllApplicants ? allApplicants : allApplicants.slice(0, DASHBOARD_LIMIT);
  };

  const getMatchColor = (percentage) => {
    const score = percentage || 0; // Handle undefined/null values
    if (score < 50) {
      return "bg-[#EF4444] text-[#FEFEFF]";
    } else if (score < 75) {
      return "bg-[#F5B041] text-[#FEFEFF]";
    }
    return "bg-[#27AE60] text-[#FEFEFF]";
  };

  const getMatchText = (percentage) => {
    const score = percentage || 0; // Handle undefined/null values
    return `${Math.round(score)}% Match`;
  };

  const formatCompanyType = (companySize) => {
    if (!companySize) return "Company";
    
    // Map backend enum values to display text
    const sizeMapping = {
      'Me': 'Solo Entrepreneur',
      'Micro': 'Micro Company',
      'Small': 'Small Company', 
      'Medium': 'Medium Company',
      'Large': 'Large Company'
    };
    
    return sizeMapping[companySize] || `${companySize} Company`;
  };

  const handleToggleViewAll = () => {
    setShowAllApplicants(!showAllApplicants);
  };

  const handleViewProfile = (applicantId) => {
    // Navigate to applicant profile or open modal
    console.log(`View profile for applicant ${applicantId}`);
    // navigate(`/applicant/${applicantId}`);
  };

  const handleRetry = () => {
    setError("");
    clearError();
    loadDashboardData();
  };

  // Get the applicants to display (limited or all based on state)
  const applicantsToShow = getApplicantsToShow();

  // Loading state (combine both loading states)
  if (isLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B1C31] mx-auto mb-4"></div>
              <p className="text-[#6B7280] text-lg">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Combine errors from both sources
  const displayError = error || companyError;

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col">
      <EmployerSideBar />
      <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
        
        {/* Header with company info */}
        <div className="flex justify-between items-center p-4 px-[112px] -mb-8">
          <h1 className="text-[48px] font-bold text-[#9B1C31] -mb-1 mt-8">Dashboard</h1>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mx-[112px] mb-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span>{displayError}</span>
                <button 
                  onClick={handleRetry}
                  className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Quick Stats */}
        <div className="mb-8 mt-8 px-[112px]">
          <h2 className="text-[24px] font-bold text-[#3C3B3B] mb-6">Quick Stats</h2>          
          <div className="grid grid-cols-3 gap-8">
            
            {/* Active Jobs */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-lg w-full h-[140px]">
              <div className="flex items-center justify-between">                
                <div>
                  <p className="text-[20px] text-[#6B7280] font-semibold -mb-2 mt-2">Active Jobs</p>
                  <p className="text-[36px] font-bold text-[#9B1C31]">{stats.active_jobs}</p>
                </div>                 
                <BriefcaseIcon className="text-[#9B1C31] w-[70px] h-[70px]" strokeWidth={1.5} />
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-lg w-full h-[140px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[20px] text-[#6B7280] font-semibold -mb-2 mt-2">Total Applications</p>
                  <p className="text-[36px] font-bold text-[#9B1C31]">{stats.total_applications}</p>
                </div>                  
                <DocumentTextIcon className="text-[#9B1C31] w-[70px] h-[70px]" strokeWidth={1.5} />
              </div>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-lg w-full h-[140px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[20px] text-[#6B7280] font-semibold -mb-2 mt-2">Pending Reviews</p>
                  <p className="text-[36px] font-bold text-[#9B1C31]">{stats.pending_reviews}</p>
                </div>                  
                <CalendarDaysIcon className="text-[#9B1C31] w-[70px] h-[70px]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm mx-[112px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <StarIcon className="text-[#9B1C31] w-[25px] h-[25px]" strokeWidth={2} />
              <h2 className="text-[24px] font-bold text-[#3C3B3B]">Recent Applicants</h2>
            </div>
            {allApplicants.length > DASHBOARD_LIMIT && (
              <button 
                onClick={handleToggleViewAll}
                className="flex items-center gap-2 text-[#9B1C31] hover:text-[#7D1628] font-semibold text-[16px] hover:underline transition-colors"
              >
                {showAllApplicants ? (
                  <>
                    Show Less
                    <ChevronUpIcon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All
                    <ChevronDownIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {applicantsToShow.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#6B7280] mb-4">
                <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-[#6B7280] text-[18px] font-semibold mb-2">No recent applicants yet</p>
              <p className="text-[#6B7280] text-[14px]">
                Applications will appear here when candidates apply to your jobs.
              </p>
              <button 
                onClick={() => navigate('/skillmatch')}
                className="mt-4 px-6 py-2 bg-[#9B1C31] text-white rounded-lg hover:bg-[#7D1628] transition-colors"
              >
                Post a Job
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {applicantsToShow.map((applicant, index) => {
                // Add this debug log
                console.log('🔍 Applicant match score debug:', {
                  name: applicant.name,
                  match_percentage: applicant.match_percentage,
                  match_score: applicant.match_score,
                  position: applicant.position
                });
                
                return (
                  <div key={applicant.id} className="flex items-start gap-4 relative">
                    
                    {/* Timeline */}
                    <div className="flex flex-col items-center relative">
                      <div className={`w-[25px] h-[25px] rounded-full ${
                        index === 0 ? 'bg-[#9B1C31]' : 'bg-white border-2 border-[#9B1C31]'
                      } mt-6 relative z-10`}></div>
                      {index < applicantsToShow.length - 1 && (
                        <div className="w-0.5 bg-[#9B1C31] absolute top-[43px] bottom-[-102px] left-1/2 transform -translate-x-1/2"></div>
                      )}
                    </div>
                    
                    {/* Content Card */}
                    <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[12px] p-4 mb-2 h-[100px] hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          
                          {/* Avatar */}
                          <div className="w-[50px] h-[50px] bg-[#D1D5DB] rounded-full flex items-center justify-center overflow-hidden">
                            {applicant.profile_picture ? (
                              <img 
                                src={applicant.profile_picture} 
                                alt={applicant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[#6B7280] font-semibold text-[14px]">
                                {applicant.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div>
                            <h3 className="text-[16px] font-bold text-[#000000]">{applicant.name}</h3>
                            <p className="text-[14px] font-semibold text-[#6B7280]">Applied to: {applicant.position}</p>
                            <p className="text-[12px] font-semibold text-[#6B7280]">{applicant.time_ago}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                            getMatchColor(applicant.match_percentage || applicant.match_score)
                          }`}>
                            {getMatchText(applicant.match_percentage || applicant.match_score)}
                          </span>
                          <button 
                            onClick={() => handleViewProfile(applicant.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] rounded-[8px] text-[12px] text-[#3C3B3B] font-semibold hover:bg-[#F9FAFB] transition-colors"
                          >
                            <EyeIcon className="text-[#3C3B3B] w-[20px] h-[20px]" strokeWidth={2} />
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerHomePage;
