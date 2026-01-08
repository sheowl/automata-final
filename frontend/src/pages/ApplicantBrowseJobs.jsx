import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import ApplicantSideBar from '../components/ApplicantSideBar';
import Card from '../components/Card';
import JobDetailsDrawer from '../components/JobDetailsDrawer';
import Dropdown from '../components/Dropdown';
import { useAuth, useTags } from "../hooks/useMockData";

function ApplicantBrowseJobs() {
    // State for drawer and selected job
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const [firstName, setFirstName] = useState("");
    const [selectedModality, setSelectedModality] = useState(null);
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [selectedSort, setSelectedSort] = useState("best"); // Change default to "best"
    const [sortedData, setSortedData] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    
    // Add these missing states for apply functionality
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Add this state with your other states
    const [sortTime, setSortTime] = useState("0.00 secs");

    const navigate = useNavigate();
    const { user, loading } = useAuth(); // Get user and loading from Auth context
    const { getTagNamesByIds } = useTags(); // Get tag mapping function

    // Auth check: redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            navigate("/applicant-sign-in", { replace: true });
        }
    }, [user, loading, navigate]);

// Use static firstName from mock user data
useEffect(() => {
    if (user) {
        const name = user.name || "User";
        setFirstName(name.split(' ')[0]); // Get first name
    }
}, [user]);

    // Load static mock jobs
    useEffect(() => {
        setLoadingJobs(true);
        // Import and use static job data
        import('../data/mockData').then(module => {
            // Map tag IDs to tag names for each job
            const jobsWithTags = module.mockJobPosts.map(job => ({
                ...job,
                tag_names: getTagNamesByIds(job.job_tags || [])
            }));
            setJobs(jobsWithTags);
            setLoadingJobs(false);
        });
    }, []); // Empty dependency array - only run once on mount

    const filteredJobs = useMemo(() => {
        const startTime = performance.now();
        
        let filtered = [...jobs];

        // Apply modality filter - handle both field names
        if (selectedModality) {
            filtered = filtered.filter((job) => {
                const setting = job.setting || job.workSetup;
                return setting?.toLowerCase() === selectedModality.toLowerCase();
            });
        }

        // Apply work type filter - handle both field names  
        if (selectedWorkType) {
            filtered = filtered.filter((job) => {
                const workType = job.work_type || job.employmentType;
                return workType?.toLowerCase() === selectedWorkType.toLowerCase();
            });
        }

        // Apply sorting - handle both field names
        if (selectedSort === "best") {
            filtered = filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        } else if (selectedSort === "recent") {
            filtered = filtered.sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateB - dateA;
            });
        } else if (selectedSort === "oldest") {
            filtered = filtered.sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateA - dateB;
            });
        }

        const endTime = performance.now();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
        setSortTime(`${timeTaken} secs`);

        return filtered;
    }, [jobs, selectedModality, selectedWorkType, selectedSort]);

    const sortOptions = [
        { label: "Best Match", value: "best" },
        { label: "Most Recent", value: "recent" },
        { label: "Oldest First", value: "oldest" },
      ];

      const filterOptions = [
        { label: "On-Site", value: "on-site" },
        { label: "Hybrid", value: "hybrid" },
        { label: "Remote", value: "remote" },
      ];
  
      const statusOptions = [
        { label: "Full-Time", value: "full-time" },
        { label: "Contractual", value: "contractual" },
        { label: "Part-Time", value: "part-time" },
        { label: "Internship", value: "internship" },
      ];

// Add these handler functions before your useEffects
const handleApplyClick = () => {
    setShowConfirmModal(true);
};

const handleProceed = async () => {
    setShowConfirmModal(false);
    // Simulate application submission
    setTimeout(() => {
        setShowSuccessModal(true);
    }, 500);
};

const handleCancel = () => {
    setShowConfirmModal(false);
};

const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setDrawerOpen(false); // Close the drawer after successful application
};

// Update the mapJobDataForApplicant function
const mapJobDataForApplicant = (job) => {
    // For static data, jobs are already in the right format
    return {
        ...job,
        id: job.id,
        jobTitle: job.title,
        companyName: job.company,
        workSetup: job.workSetting,
        employmentType: job.type,
        postedDaysAgo: job.postedDaysAgo,
        applicantCount: job.applicantCount,
        tags: job.skills?.map(skill => ({ label: skill, matched: false })) || []
    };
};

    return (
        <div className="min-h-screen bg-[#047857] flex flex-col">
            <ApplicantSideBar />

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6 shadow-md font-montserrat">
                {/* Header */}
                <div className="flex justify-between w-full px-9 mb-0">
                    <div className="flex items-center gap-[15px] m-9">
                        <div>
                            <div className="font-[Montserrat] text-4xl font-bold text-[#047857]">
                                Welcome Back, {firstName}!
                            </div>
                            <div className="font-semibold italic text-rose-400 text-xl">
                                Ready to make meets end?
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Count */}
                <div className="pl-[112px] pr-[118px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                            <div className="text-base font-semibold text-gray-500 mb-2">
                                {filteredJobs.length} matches displayed
                            </div>
                        </div>
                        
                        {/* Add the missing dropdowns here */}
                        <div className="flex gap-4">
                            {/* Sort By Dropdown */}
                            <Dropdown
                                label="Sort by"
                                customContent={
                                    <div className="flex flex-col">
                                        {sortOptions.map((option) => (
                                            <div
                                                key={option.value}
                                                className={`p-2 cursor-pointer rounded transition-colors text-[14px] font-opensans ${
                                                    selectedSort === option.value
                                                        ? "bg-[#047857] text-white"
                                                        : ""
                                                }`}
                                                onClick={() => setSelectedSort(option.value)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                }
                                width="w-40"
                                color="#047857"
                            />
                            
                            {/* Filter By Dropdown */}
                            <Dropdown
                                label="Filter by"
                                customContent={
                                    <div className="p-4 w-80 text-[14px] font-semibold grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-6 items-start">
                                            <div className="font-semibold text-[#6B7280] mb-1 mt-2">
                                                By Modality
                                            </div>
                                            <div className="h-12" />
                                            <div className="font-semibold text-[#6B7280] mb-1">
                                                By Work Type
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 justify-start items-start">
                                            {/* Modality Filter Options */}
                                            {filterOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className={`p-1 mt-1 rounded cursor-pointer transition-colors ${
                                                        selectedModality === opt.value
                                                            ? "bg-[#047857] text-white"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedModality(
                                                            selectedModality === opt.value
                                                                ? null
                                                                : opt.value
                                                        )
                                                    }
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                            <div className="h-2" />
                                            
                                            {/* Work Type Filter Options */}
                                            {statusOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className={`p-1 rounded cursor-pointer transition-colors ${
                                                        selectedWorkType === opt.value
                                                            ? "bg-[#047857] text-white"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedWorkType(
                                                            selectedWorkType === opt.value
                                                                ? null
                                                                : opt.value
                                                        )
                                                    }
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                                width="w-72"
                                color="#047857"
                            />
                        </div>
                    </div>
                    <hr className="border-t-2 border-[#000000]/20" />
                </div>

                {/* Job Cards */}
                <div className="pl-[112px] pr-[118px] mt-10 mb-10 flex flex-wrap gap-[33px] justify-center">
                    {loadingJobs ? (
                        // Simple loading spinner positioned right after the bars
                        <div className="flex justify-center items-center w-full h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#047857] mx-auto mb-4"></div>
                                <div>Loading jobs...</div>
                            </div>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        // Empty state
                        <div className="flex justify-center items-center w-full h-64">
                            <div className="text-center text-gray-500">
                                <i className="bi bi-search text-4xl mb-4"></i>
                                <div>No jobs found matching your criteria</div>
                            </div>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card
                                key={job.job_id || job.id}
                                jobTitle={job.job_title || job.jobTitle}
                                companyName={job.company_name || job.companyName}
                                location={job.location}
                                matchScore={job.match_score || 0}
                                workSetup={job.setting || job.workSetup}
                                employmentType={job.work_type || job.employmentType}
                                description={job.description}
                                salaryRangeLow={job.salary_min || job.salaryRangeLow}
                                salaryRangeHigh={job.salary_max || job.salaryRangeHigh}
                                tags={(job.tag_names || []).map(tagName => ({ label: tagName, matched: true }))}
                                onViewDetails={() => {
                                    console.log("=== JOB DETAILS DEBUG ===");
                                    console.log("Selected job for details:", job);
                                    setSelectedJob(job);
                                    setDrawerOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Job Details Drawer */}
            <JobDetailsDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                job={selectedJob}
                onApply={handleApplyClick}
            />

            {/* Confirmation Modal */}
{showConfirmModal && (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Are you sure you want to apply?</h2>
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[10px] hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={handleProceed}
                    className="px-4 py-2 bg-[#047857] text-white rounded-[10px] font-semibold hover:bg-[#065F46]"
                >
                    Proceed
                </button>
            </div>
        </div>
    </div>
)}

{/* Success Modal */}
{showSuccessModal && (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">Application Successful!</h2>
            <p className="text-gray-600 mb-4">
                You have successfully applied for the job. Our team will review your application and get back to you soon.
            </p>
            <button
                onClick={handleCloseSuccess}
                className="px-4 py-2 bg-[#047857] text-white rounded-[10px] font-semibold hover:bg-[#065F46]"
            >
                Close
            </button>
        </div>
    </div>
)}
        </div>
    );
}

export default ApplicantBrowseJobs;
