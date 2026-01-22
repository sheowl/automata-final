import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEmployerData } from "../hooks/useEmployerData";
import { useTags } from "../hooks/useMockData";
import EmployerSideBar from "../components/EmployerSideBar";
import EmployerApplicantHeader from "../components/EmployerApplicantHeader";
import EmpCard from "../components/EmpCard";
import ApplicationFullDetails from "../components/ApplicationFullDetails";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const fetchSortedApplicantsFromAPI = async (jobId, sortBy = 'match_score', descending = true) => {
  // Return static mock data
  const { mockApplicants } = await import('../data/mockData');
  return mockApplicants;
};

const EmployerApplicants = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use EmployerData hook for backend operations
  const { 
    getApplicants: getJobApplicants, 
    getCompanyProfile, 
    loading: companyLoading, 
    error, 
    clearError 
  } = useEmployerData();
  
  // Use TagsContext for dynamic tag display
  const { getTagNamesByIds, loading: tagsLoading } = useTags();
  
  const [applicants, setApplicants] = useState([]);
  const [sortBy, setSortBy] = useState('best');
  const [selectedJobNumber, setSelectedJobNumber] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  
  // Get job posts data from navigation state
  const jobPostsData = location.state?.jobPosts || [];
  const selectedJob = location.state?.selectedJob;
  const selectedJobId = location.state?.selectedJobId;

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load applicants when job changes
  useEffect(() => {
    loadApplicantsData();
  }, [selectedJobNumber, sortBy]); // Added sortBy dependency

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      clearError();
      
      // Initialize job selection
      await initializeJobSelection();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setFetchError("Failed to load applicants data.");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeJobSelection = async () => {
    // If no job posts data is passed, redirect back to skill match page
    if (!jobPostsData || jobPostsData.length === 0) {
      navigate('/skillmatch');
      return;
    }

    // Set the selected job if provided, otherwise default to first
    let jobIdToSelect = selectedJobNumber;
    
    // Priority order for job ID selection:
    if (selectedJobId && selectedJobNumber === null) {
      jobIdToSelect = selectedJobId;
      setSelectedJobNumber(selectedJobId);
    } else if (selectedJobNumber) {
      jobIdToSelect = selectedJobNumber;
    } else if (jobPostsData.length > 0) {
      jobIdToSelect = jobPostsData[0].id;
      setSelectedJobNumber(jobPostsData[0].id);
    }

    if (!jobIdToSelect) {
      setFetchError("No valid job ID found");
      return;
    }
  };

  const loadApplicantsData = async () => {
    try {
      setIsLoading(true);
      setFetchError("");
      clearError();

      if (!selectedJobNumber) {
        return;
      }

      // **NEW: Use your backend sorting API with merge sort algorithm**
      // Map frontend sort options to backend sort fields
      const sortMapping = {
        'best': { field: 'match_score', descending: true },
        'recent': { field: 'match_score', descending: true }, // You can change this to date field when available
        'alphabetical': { field: 'applicant_id', descending: false }
      };

      const sortConfig = sortMapping[sortBy] || { field: 'match_score', descending: true };

      // **STEP 1: Fetch sorted job matches using your merge sort API**
      let sortedJobMatches = [];
      try {
        sortedJobMatches = await fetchSortedApplicantsFromAPI(
          selectedJobNumber, 
          sortConfig.field, 
          sortConfig.descending
        );
        console.log('✅ Sorted job matches from API:', sortedJobMatches);
      } catch (apiError) {
        console.warn('⚠️ API sorting failed, falling back to manual sorting:', apiError);
        // Fallback to your existing method if API fails
      }

      // **STEP 2: Fetch detailed applicant data (your existing logic)**
      const applicantsData = await getJobApplicants(selectedJobNumber);
      
      // Get job details for job title
      const currentJob = jobPostsData.find(job => job.id === selectedJobNumber || job.job_id === selectedJobNumber);

      // **STEP 3: Transform and merge the data**
      let transformedApplicants;

      if (sortedJobMatches.length > 0) {
        // **Use API-sorted order with merge sort algorithm results**
        transformedApplicants = sortedJobMatches.map((jobMatch, index) => {
          // Find matching applicant data
          const applicantData = applicantsData?.find(
            app => app.applicant_id === jobMatch.applicant_id
          );

          if (!applicantData) {
            console.warn(`No applicant data found for ID: ${jobMatch.applicant_id}`);
            return null;
          }

          // Get tag names from tag IDs
          const tagNames = getTagNamesByIds(applicantData.applicant_tags || []);
          
          return {
            id: applicantData.applicant_id || `${selectedJobNumber}-${index}`,
            applicant_id: applicantData.applicant_id,
            jobNumber: selectedJobNumber,
            jobTitle: currentJob?.job_title || 'Job Post',
            matched: jobMatch.match_score || applicantData.match_score || 0, // Use API match score
            isNew: new Date() - new Date(applicantData.application_created_at) < 24 * 60 * 60 * 1000,
            candidateName: applicantData.name || 'Unknown Applicant',
            role: 'Applicant',
            email: applicantData.applicant_email || 'N/A',
            phoneNumber: applicantData.phone_number || 'N/A',
            location: applicantData.location || 'N/A',
            applicationCreatedAt: applicantData.application_created_at,
            status: applicantData.status || 'applied',
            skills: tagNames.slice(0, 3),
            moreSkillsCount: Math.max(0, tagNames.length - 3),
            appliedDaysAgo: calculateDaysAgo(applicantData.application_created_at),
            applicantTags: applicantData.applicant_tags || [],
            tagNames: tagNames,
            matchScore: jobMatch.match_score || applicantData.match_score || 0,
            // **Add sorting metadata for debugging**
            sortedByAPI: true,
            apiSortField: sortConfig.field,
            apiSortOrder: sortConfig.descending ? 'desc' : 'asc'
          };
        }).filter(Boolean); // Remove null entries

        console.log(`✅ Applied merge sort algorithm results: ${transformedApplicants.length} applicants sorted by ${sortConfig.field}`);
      } else {
        // **Fallback: Transform without API sorting (your existing logic)**
        transformedApplicants = (applicantsData || []).map((applicant, index) => {
          const tagNames = getTagNamesByIds(applicant.applicant_tags || []);
          
          return {
            id: applicant.applicant_id || `${selectedJobNumber}-${index}`,
            applicant_id: applicant.applicant_id,
            jobNumber: selectedJobNumber,
            jobTitle: currentJob?.job_title || 'Job Post',
            matched: applicant.match_score || 0,
            isNew: new Date() - new Date(applicant.application_created_at) < 24 * 60 * 60 * 1000,
            candidateName: applicant.name || 'Unknown Applicant',
            role: 'Applicant',
            email: applicant.applicant_email || 'N/A',
            phoneNumber: applicant.phone_number || 'N/A',
            location: applicant.location || 'N/A',
            applicationCreatedAt: applicant.application_created_at,
            status: applicant.status || 'applied',
            skills: tagNames.slice(0, 3),
            moreSkillsCount: Math.max(0, tagNames.length - 3),
            appliedDaysAgo: calculateDaysAgo(applicant.application_created_at),
            applicantTags: applicant.applicant_tags || [],
            tagNames: tagNames,
            matchScore: applicant.match_score || 0,
            sortedByAPI: false
          };
        });

        console.log('⚠️ Using fallback sorting (no API results)');
      }

      setApplicants(transformedApplicants);
      
    } catch (error) {
      // Check if it's an auth error
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        setFetchError("Session expired. Please log in again.");
        navigate('/employer-sign-in');
      } else {
        setFetchError(error.message || "Failed to load applicants. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate days ago
  const calculateDaysAgo = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get available job IDs from the passed job posts data
  const jobNumbers = jobPostsData.map(job => job.id).sort((a, b) => a - b);
  const currentIndex = jobNumbers.indexOf(selectedJobNumber);
  
  // Get current job details
  const currentJob = jobPostsData.find(job => job.id === selectedJobNumber);

  // Filter applicants by selected job number
  const filteredApplicants = applicants.filter(app => app.jobNumber === selectedJobNumber);

  // Already sorted by merge sort algorithm from API
  const sortedApplicants = filteredApplicants; 

  const handleDropdownToggle = (applicantId) => {
    setOpenDropdownId(openDropdownId === applicantId ? null : applicantId);
  };

  const handleViewFullApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicationDetails(true);
  };

  const handleJobChange = (newJobId) => {
    setSelectedJobNumber(newJobId);
    setApplicants([]); // Clear current applicants while loading new ones
  };

  // ⭐ RETRY FUNCTION THAT INCLUDES AUTH CHECK
  const handleRetry = () => {
    setAuthChecked(false);
    checkAuthenticationAndLoadData();
  };

  // Loading state
  if (isLoading && applicants.length === 0) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#9B1C31] mx-auto"></div>
              <div className="text-lg font-semibold text-gray-600 mt-4">
                Loading applicants...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || error) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">
              <div className="text-lg font-semibold mb-4">Error Loading Applicants</div>
              <div className="mb-4">{fetchError || error}</div>
              
              <button 
                onClick={handleRetry}
                className="bg-[#9B1C31] text-white px-6 py-2 rounded-lg hover:bg-[#7D1628] transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col">
      <EmployerSideBar />
      <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">        
        <EmployerApplicantHeader
          onSortChange={setSortBy}
          selectedSort={sortBy}
          jobPostNumber={selectedJobNumber}
          totalApplicants={filteredApplicants.length}
          jobTitle={currentJob?.jobTitle || 'Job Post'}
          jobNumbers={jobNumbers}
          onJobChange={handleJobChange}
        />
        <div className="pl-[112px] pr-[118px] mt-10 mb-10 flex flex-wrap gap-[33px] justify-center">
          {isLoading || tagsLoading ? (
            <div className="text-center text-gray-600 w-full">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9B1C31] mx-auto mb-4"></div>
              <div>Loading applicants...</div>
            </div>
          ) : sortedApplicants.length > 0 ? (            
            sortedApplicants.map(applicant => (
              <EmpCard
                key={applicant.id}
                matched={applicant.matchScore}
                isNew={applicant.isNew}
                candidateName={applicant.candidateName}
                role={applicant.role}
                email={applicant.email}
                phoneNumber={applicant.phoneNumber}
                location={applicant.location}
                skills={applicant.skills}
                moreSkillsCount={applicant.moreSkillsCount}
                appliedDaysAgo={applicant.appliedDaysAgo}
                actionLabel="Action"
                onAction={val => {}}
                dropdownOpen={openDropdownId === applicant.id}
                onDropdownToggle={() => handleDropdownToggle(applicant.id)}
                onViewFull={() => handleViewFullApplicant(applicant)}
                applicantTags={applicant.applicantTags}
                tagNames={applicant.tagNames}
              />
            ))
          ) : (
            <div className="text-center text-gray-600 w-full py-16">
              <div className="text-lg font-semibold mb-2">No applicants found</div>
              <div>This job hasn't received any applications yet.</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Application Full Details Modal */}
      {selectedApplicant && (
        <ApplicationFullDetails 
          open={showApplicationDetails}
          onClose={() => setShowApplicationDetails(false)}
          applicant={selectedApplicant}
          jobId={selectedJobNumber}
          jobData={selectedApplicant?.job}
          applicantTags={selectedApplicant.applicantTags} // <-- add this line
          tagNames={selectedApplicant.tagNames} // <-- optionally, if you want tag names
          onStatusUpdate={(applicantId, newStatus) => {
            setApplicants(prevApplicants => 
              prevApplicants.map(app => 
                app.id === applicantId 
                  ? { ...app, status: newStatus }
                  : app
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default EmployerApplicants;