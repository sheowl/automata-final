import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useTags } from '../context/TagsContext'; // Import Tags Context
import { useNavigate } from "react-router-dom";
import JobCard from '../components/JobCard.jsx';
import EmployerSideBar from "../components/EmployerSideBar";
import JobNewPost from "../components/JobNewPost";
import JobEditPost from "../components/JobEditPost";
import Dropdown from "../components/Dropdown";
import EmployerPostingDetails from "../components/EmployerPostingDetails";

// --- Dropdown options for custom content ---
const sortOptions = [
  { label: "A - Z", value: "az" },
  { label: "Z - A", value: "za" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

const filterOptions = [
  {
    group: "By Modality",
    options: [
      { label: "On-site", value: "onsite" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Remote", value: "remote" },
    ],
  },
  {
    group: "By Work Type",
    options: [
      { label: "Full-Time", value: "fulltime" },
      { label: "Contractual", value: "contractual" },
      { label: "Part-Time", value: "part-time" },
      { label: "Internship", value: "internship" },
    ],
  },
  {
    group: "By Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" },
    ],
  },
];

const EmployerJobPosts = () => {
  const navigate = useNavigate();
  
  // Local state
  const [jobPosts, setJobPosts] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Company Name',
    type: 'Company/Business Type',
    location: 'Company Location'
  });
  const [selectedSort, setSelectedSort] = useState(sortOptions[0].value);
  const [selectedModality, setSelectedModality] = useState(null);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [postingDetailsOpen, setPostingDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Use AuthContext for authentication
  const { 
    isEmployer, 
    isAuthenticated, 
    user,
    loading // ⭐ ADD loading
  } = useAuth();

  // Use CompanyContext for company operations
  const { 
    getCompanyJobs, 
    createJob, 
    updateJob, 
    deleteJob,
    getCompanyProfile,
    companyProfile,
    loading: companyLoading,
    error: companyError,
    clearError
  } = useCompany();

  // Use TagContext for tag operations
  const {
    tags,
    categories,
    flatTagMapping,
    categoryMapping,
    loading: tagLoading,
    error: tagError,
    getTagNameById,
    getTagNamesByIds,
    getCategoryNameById
  } = useTags();

  // Update the useEffect to wait for auth loading
  useEffect(() => {
    if (!loading) { // ⭐ Only run when AuthContext is done loading
      checkAuthAndLoadData();
    }
  }, [loading]); // ⭐ Add loading as dependency

  const checkAuthAndLoadData = async () => {
    try {
      console.log("🔍 EmployerJobPosts Auth check - Loading:", loading, "Authenticated:", isAuthenticated(), "Employer:", isEmployer());
      
      // ⭐ Wait for auth context to finish loading
      if (loading) {
        console.log("⏳ Auth context still loading, waiting...");
        return;
      }

      // Check if user is authenticated and is an employer
      if (!isAuthenticated()) {
        console.log("❌ Not authenticated, redirecting to sign-in");
        navigate('/employer-sign-in');
        return;
      }

      if (!isEmployer()) {
        console.log("❌ Not an employer, redirecting to sign-in");
        navigate('/employer-sign-in');
        return;
      }

      console.log("✅ Auth check passed, loading jobs data");
      // Load jobs and company data
      await loadJobsAndCompanyData();
      
    } catch (error) {
      console.error("Error checking auth or loading data:", error);
      setError("Failed to load job posts. Please try again.");
      setIsLoading(false);
    }
  };

  // Enhanced job mapping function to handle new backend structure
  const mapJobData = (job, companyData) => {
    console.log('Mapping job data:', job);
    
    // Calculate days ago
    const dateAdded = new Date(job.created_at || job.date_added);
    const now = new Date();
    const diffTime = Math.abs(now - dateAdded);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format salary range
    const formatSalary = (amount) => {
      if (!amount) return 0;
      const num = typeof amount === 'string' ? parseInt(amount) : amount;
      return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num.toString();
    };

    const salaryMin = formatSalary(job.salary_min);
    const salaryMax = formatSalary(job.salary_max);
    const salaryRange = salaryMin && salaryMax ? `₱${salaryMin} - ₱${salaryMax}` : 'Salary not specified';

    // Map work settings and types to display values
    const settingMap = {
      'onsite': 'On-site',
      'hybrid': 'Hybrid', 
      'remote': 'Remote'
    };

    const workTypeMap = {
      'fulltime': 'Full-time',
      'part-time': 'Part-time',
      'contractual': 'Contractual',
      'internship': 'Internship'
    };

    // Get category name
    const categoryName = getCategoryNameById(job.required_category_id) || 'General';

    // Get tag names for job_tags array
    const tagNames = getTagNamesByIds(job.job_tags || []);

    const mappedJob = {
      id: job.job_id,
      jobTitle: job.job_title,
      companyName: companyData?.company_name || 'Company Name',
      location: companyData?.location || 'Location',
      type: settingMap[job.setting] || job.setting || 'On-site',
      employment: workTypeMap[job.work_type] || job.work_type || 'Full-time',
      description: job.description || '',
      status: 'Active', // Default status since not provided by backend
      salaryMin: parseInt(job.salary_min) || 0,
      salaryMax: parseInt(job.salary_max) || 0,
      salaryRange: salaryRange,
      availablePositions: job.position_count || 1,
      applicantCount: job.applicant_count || 0,
      category: categoryName,
      proficiency: job.required_proficiency || 1,
      dateAdded: job.date_added,
      createdAt: job.created_at,
      postedDaysAgo: diffDays,
      company_id: job.company_id,
      // New fields for dynamic tags
      job_tags: job.job_tags || [], // Array of tag IDs
      tag_names: tagNames, // Array of tag names for display
      required_category_id: job.required_category_id,
      // Backend field mappings for forms
      setting: job.setting, // Keep original backend values
      work_type: job.work_type,
      // Additional computed fields
      isActive: true, // Since we don't have status from backend yet
    };

    console.log('Mapped job:', mappedJob);
    return mappedJob;
  };

  const loadJobsAndCompanyData = async () => {
    try {
      setIsLoading(true);
      setError("");
      clearError(); // Clear any previous company errors

      // Load company jobs and profile in parallel
      const [jobsResponse, profileResponse] = await Promise.all([
        getCompanyJobs(),
        getCompanyProfile()
      ]);

      console.log('Jobs response:', jobsResponse);
      console.log('Profile response:', profileResponse);

      // Update jobs data with new mapping
      if (jobsResponse.jobs) {
        const mappedJobs = jobsResponse.jobs.map(job => mapJobData(job, jobsResponse.company_info || profileResponse));
        setJobPosts(mappedJobs);
        setTotalJobs(jobsResponse.total || mappedJobs.length);
        
        // Update company info from jobs response if available
        if (jobsResponse.company_info) {
          setCompanyInfo({
            name: jobsResponse.company_info.company_name || 'Company Name',
            type: formatCompanyType(jobsResponse.company_info.company_size) || 'Company Type',
            location: jobsResponse.company_info.location || 'Company Location',
          });
        }
      } else if (Array.isArray(jobsResponse)) {
        const mappedJobs = jobsResponse.map(job => mapJobData(job, profileResponse));
        setJobPosts(mappedJobs);
        setTotalJobs(mappedJobs.length);
      }

      // Update company info from profile if not already set
      if (profileResponse && !jobsResponse.company_info) {
        setCompanyInfo({
          name: profileResponse.company_name || 'Company Name',
          type: formatCompanyType(profileResponse.company_size) || 'Company Type',
          location: profileResponse.location || 'Company Location',
        });
      }

    } catch (error) {
      console.error("Error loading jobs and company data:", error);
      setError(error.message || "Failed to load job posts. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
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

  const handleAddJob = async (jobData) => {
    try {
      setError("");
      clearError();

      console.log('Creating new job:', jobData);
      
      // Create job using CompanyContext
      const newJob = await createJob(jobData);
      
      console.log('Job created successfully:', newJob);
      
      // Close modal
      setShowModal(false);
      
      // Reload jobs to get updated list
      await loadJobsAndCompanyData();
      
    } catch (error) {
      console.error("Error creating job:", error);
      setError(error.message || "Failed to create job. Please try again.");
    }
  };

  const handleViewJobDetails = (jobData) => {
    setSelectedJob(jobData);
    setPostingDetailsOpen(true);
  };  
  
  const handleEditJob = (jobData) => {
    console.log('Editing job:', jobData);
    
    // Ensure we pass the complete backend data structure
    const jobDataForEdit = {
      ...jobData,
      // Add backend field mappings
      job_title: jobData.jobTitle,
      salary_min: jobData.salaryMin,
      salary_max: jobData.salaryMax,
      setting: jobData.setting, // This should already be correct
      work_type: jobData.work_type, // This should already be correct
      position_count: jobData.availablePositions,
      required_category_id: jobData.required_category_id,
      required_proficiency: jobData.proficiency,
      job_tags: jobData.job_tags || []
    };
    
    setSelectedJob(jobDataForEdit);
    setShowEditModal(true);
  };

  const handleEditJobSave = async (updatedJobData) => {
    try {
      setError("");
      clearError();

      // Use selectedJob instead of jobToEdit, and add null check
      if (!selectedJob || !selectedJob.id) {
        console.error('No job selected for editing:', selectedJob);
        setError("No job selected for editing");
        return;
      }

      console.log('Updating job with ID:', selectedJob.id);
      console.log('Update data:', updatedJobData);
      
      // Update job using CompanyContext
      const updatedJob = await updateJob(selectedJob.id, updatedJobData);
      
      console.log('Job updated successfully:', updatedJob);
      
      // Close modal and clear edit data FIRST
      setShowEditModal(false);
      setJobToEdit(null);
      setSelectedJob(null);
      
      // THEN reload jobs after a small delay to prevent interference
      setTimeout(async () => {
        try {
          await loadJobsAndCompanyData();
          console.log('Job list refreshed after update');
        } catch (error) {
          console.error('Error refreshing job list:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error("Error updating job:", error);
      setError(error.message || "Failed to update job. Please try again.");
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setJobToEdit(null);
    setSelectedJob(null); // Also clear selectedJob
  };

  const handleViewApplicants = (jobData = null) => {
    console.log('🔍 EmployerJobPosts: handleViewApplicants called with:', jobData);
    
    // If jobData is passed, navigate to specific job's applicants
    // Otherwise, navigate to general applicants page with all jobs
    const navigationState = {
      jobPosts: jobPosts, // This should only contain serializable data
    };

    // If specific job is selected, add it to the state
    if (jobData && jobData.id) {
      console.log('🔍 EmployerJobPosts: Job ID being passed:', jobData.id);
      
      // Make sure to only pass serializable data (no functions)
      const serializableJobData = {
        id: jobData.id,
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        location: jobData.location,
        type: jobData.type,
        employment: jobData.employment,
        description: jobData.description,
        status: jobData.status,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryRange: jobData.salaryRange,
        availablePositions: jobData.availablePositions,
        applicantCount: jobData.applicantCount,
        category: jobData.category,
        proficiency: jobData.proficiency,
        dateAdded: jobData.dateAdded,
        createdAt: jobData.createdAt,
        postedDaysAgo: jobData.postedDaysAgo,
        company_id: jobData.company_id,
        job_tags: jobData.job_tags, // Include tag IDs
        tag_names: jobData.tag_names, // Include tag names
      };
      
      navigationState.selectedJob = serializableJobData;
      navigationState.selectedJobId = jobData.id;
      
      console.log('🔍 EmployerJobPosts: Navigation state:', navigationState);
    }

    navigate('/employerapplicants', { 
      state: navigationState
    });
  };

  const handleDropdownToggle = (jobId) => {
    setOpenDropdownId(openDropdownId === jobId ? null : jobId);
  };

  const handleJobAction = (jobData, action) => {
    console.log('Job action:', action, 'Job data:', jobData);
    
    switch (action) {
      case 'edit':
        handleEditJob(jobData); // Pass complete job data
        break;
      case 'archive':
        handleArchiveJob(jobData.id);
        break;
      case 'delete':
        handleDeleteJob(jobData.id);
        break;
      case 'restore':
        handleRestoreJob(jobData.id);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Update getFilteredAndSortedJobs to include search
  const getFilteredAndSortedJobs = () => {
    let filteredJobs = jobPosts;

    // Apply filters - Updated to match new backend values
    if (selectedModality) {
      filteredJobs = filteredJobs.filter(job => {
        const jobSetting = job.setting?.toLowerCase();
        return jobSetting === selectedModality;
      });
    }

    if (selectedWorkType) {
      filteredJobs = filteredJobs.filter(job => {
        const jobWorkType = job.work_type?.toLowerCase();
        return jobWorkType === selectedWorkType || 
               (selectedWorkType === 'part-time' && jobWorkType === 'part-time');
      });
    }

    if (selectedStatus) {
      filteredJobs = filteredJobs.filter(job => 
        job.status?.toLowerCase() === selectedStatus
      );
    }

    // Apply sorting
    const sortedJobs = [...filteredJobs].sort((a, b) => {
      switch (selectedSort) {
        case 'az':
          return (a.jobTitle || '').localeCompare(b.jobTitle || '');
        case 'za':
          return (b.jobTitle || '').localeCompare(a.jobTitle || '');
        case 'newest':
          return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
        case 'oldest':
          return (b.postedDaysAgo || 0) - (a.postedDaysAgo || 0);
        default:
          return 0;
      }
    });

    return sortedJobs;
  };

  const handleRetry = () => {
    setError("");
    clearError();
    loadJobsAndCompanyData();
  };

  // Loading state (combine all loading states)
  if (loading || isLoading || companyLoading || tagLoading) {
    return (
      <div className="min-h-screen bg-[#9B1C31] flex flex-col">
        <EmployerSideBar />
        <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B1C31] mx-auto mb-4"></div>
              <p className="text-[#6B7280] text-lg">
                {loading ? 'Verifying authentication...' : 'Loading job posts...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Combine errors from all sources
  const displayError = error || companyError || tagError;

  const sortContent = (
    <div className="flex flex-col">
      {sortOptions.map(opt => (
        <div
          key={opt.value}
          className={`p-2 cursor-pointer rounded transition-colors text-[14px] font-opensans ${
            selectedSort === opt.value ? "bg-[#9B1C31] text-white" : ""
          }`}
          onClick={() => setSelectedSort(opt.value)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );

  const selectedOptionStyle = { backgroundColor: "#9B1C311A", color: "#9B1C31" };

  const filterContent = (
    <div className="p-4 w-80 text-[14px] font-semibold grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-24 items-start">
        <div className="font-semibold text-[#6B7280] mb-1 mt-2">By Modality</div>
        <div className="font-semibold text-[#6B7280] mb-1 mt-0">By Work Type</div>
        <div className="font-semibold text-[#6B7280] mb-1 mt-10">By Status</div>
      </div>
      <div className="flex flex-col gap-1 justify-start items-start">
        {/* By Modality */}
        {filterOptions[0].options.map(opt => (
          <div
            key={opt.value}
            className="p-1 mt-1 rounded cursor-pointer transition-colors"
            style={selectedModality === opt.value ? selectedOptionStyle : {}}
            data-selected={selectedModality === opt.value}
            onClick={() => setSelectedModality(selectedModality === opt.value ? null : opt.value)}
          >
            {opt.label}
          </div>
        ))}
        <div className="h-2" />
        {/* By Work Type */}
        {filterOptions[1].options.map(opt => (
          <div
            key={opt.value}
            className="p-1 mt-1 rounded cursor-pointer transition-colors"
            style={selectedWorkType === opt.value ? selectedOptionStyle : {}}
            data-selected={selectedWorkType === opt.value}
            onClick={() => setSelectedWorkType(selectedWorkType === opt.value ? null : opt.value)}
          >
            {opt.label}
          </div>
        ))}
        <div className="h-2" />
        {/* By Status */}
        {filterOptions[2].options.map(opt => (
          <div
            key={opt.value}
            className="p-1 mt-1 rounded cursor-pointer transition-colors"
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

  // Show loading while company data is being fetched
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#9B1C31] font-semibold text-lg">
          Loading company data...
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-semibold text-lg text-center">
          Please log in to access this page.
        </div>
      </div>
    );
  }

  // Show error if company data failed to load
  if (companyError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-semibold text-lg text-center">
          Error loading company data: {companyError}
          <br />
          <button 
            onClick={() => getCompanyProfile()}
            className="mt-4 bg-[#9B1C31] text-white px-4 py-2 rounded-lg hover:bg-[#7D1628] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col">
      <EmployerSideBar />
      <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-y-auto p-6 shadow-md">
        
        {/* Header with company info */}
        <div className="flex justify-between items-center p-4 px-[112px] -mb-8">
          <div>            
            <h1 className="text-[48px] font-bold text-[#9B1C31] -mb-1 mt-8">Manage Postings</h1>
            <p className="text-[22px] text-[#9B1C31] font-semibold">
              Jobs Posted: <span className="italic">{getFilteredAndSortedJobs().length}</span>
              {totalJobs !== getFilteredAndSortedJobs().length && (
                <span> / {totalJobs}</span>
              )}
            </p>
          </div>          
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



        {/* Sort and Filter Dropdowns */}
        <div className="flex justify-end items-center px-[112px] pr-[118px] text-[16px] font-semibold gap-4 mt-8 -mb-8">
          <Dropdown
            label="Sort by"
            customContent={sortContent}
            width="w-40"
            color="#9B1C31"
          />
          <Dropdown
            label="Filter by"
            customContent={filterContent}
            width="w-80"
            color="#9B1C31"
          />
        </div>

        {/* Job Posts List */}
        <div className="pl-[112px] pr-[118px] mt-10 mb-10 flex flex-col gap-[20px]">
          {getFilteredAndSortedJobs().length > 0 ? (            
            getFilteredAndSortedJobs().map(job => (                
            <JobCard
                key={job.id}
                {...job} // Pass all job properties including applicantCount and tag data
                onViewDetails={handleViewJobDetails}
                onViewApplicants={handleViewApplicants}
                dropdownOpen={openDropdownId === job.id}
                onDropdownToggle={handleDropdownToggle}
                onAction={handleJobAction}
              />
            ))
          ) : (
            <div className="text-center text-[#6B7280] text-[16px] py-8">
              {jobPosts.length === 0 ? (
                <div>
                  <p className="mb-4">You haven't posted any jobs yet.</p>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-[#9B1C31] text-white rounded-lg hover:bg-[#7D1628] transition-colors"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                "No job posts match the selected filters."
              )}
            </div>
          )}
        </div>
        
        {/* Floating Add Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#9B1C31] rounded-full shadow-lg flex items-center justify-center cursor-pointer transition hover:bg-[#7D1628] focus:outline-none z-50"
        >
          <span className="text-white text-[32px] leading-none" style={{ fontWeight: 200 }}>+</span>
        </button>

        {/* Modals and Drawers */}          
        <JobNewPost
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddJob}
          companyData={companyProfile} // Pass company data as prop
          userData={user} // Pass user data as prop
        />
        
        <JobEditPost
          open={showEditModal}
          onClose={handleEditModalClose}
          onSave={handleEditJobSave}
          jobData={selectedJob}
        />
        
        {/* Employer Posting Details Drawer */}
        <EmployerPostingDetails
          open={postingDetailsOpen}
          onClose={() => setPostingDetailsOpen(false)}
          job={selectedJob} // This now includes applicantCount and tag data
          onEdit={handleEditJob}
        />
      </div>
    </div>
  );
};

export default EmployerJobPosts;
