import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ApplicantSideBar from '../components/ApplicantSideBar';
import ApplicantTracker from '../components/ApplicantTracker';
import Dropdown from '../components/Dropdown';
import ApplicantHeader from '../components/ApplicantHeader'; 
import ApplicantTrackerDrawer from '../components/ApplicantTrackerDrawer'; 
import JobDetailsDrawer from '../components/JobDetailsDrawer'; 
import { useAuth } from "../hooks/useMockData";

const sortOptions = [
    { label: "Most Recent", value: "recent" },
    { label: "Oldest First", value: "oldest" },
    { label: "Best Match", value: "best" },
];

const filterOptions = [
  { label: "On-Site", value: "On-Site" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Remote", value: "Remote" },
];

const statusOptions = [
  { label: "Full-Time", value: "Full-time" },
  { label: "Contractual", value: "Contractual" },
  { label: "Part-Time", value: "Part-Time" },
  { label: "Internship", value: "Internship" },
];

function ApplicantApplications() {
    const { user, loading } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [applications, setApplications] = useState([]);
    const [selectedSort, setSelectedSort] = useState("recent");
    const [selectedModality, setSelectedModality] = useState(null);
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    
    // Add these missing states for drawer functionality
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Add loading states
    const [isLoadingApplications, setIsLoadingApplications] = useState(true);
    
    const navigate = useNavigate();

    // Load static applications data
    useEffect(() => {
      setIsLoadingApplications(true);
      import('../data/mockData').then(module => {
        setApplications(module.mockApplications);
        setIsLoadingApplications(false);
      });
    }, []);

    // Set user first name
    useEffect(() => {
      if (user) {
        const name = user.name || "User";
        setFirstName(name.split(' ')[0]);
      }
    }, [user]);

    useEffect(() => {
      if (!loading && !user) {
        navigate("/applicant-sign-in", { replace: true });
      }
    }, [user, loading, navigate]);

    // Update filtering logic to match backend field names
    const filteredApplications = applications
        .filter(app => 
            (!selectedModality || app.setting === selectedModality) // Use 'setting' instead of 'modality'
            && (!selectedWorkType || app.jobType === selectedWorkType) // Use 'jobType' instead of 'workType'
        )
        .sort((a, b) => {
            if (selectedSort === "recent") {
                return new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
            } else if (selectedSort === "oldest") {
                return new Date(a.appliedDate || 0) - new Date(b.appliedDate || 0);
            } else if (selectedSort === "best") {
                return (b.matchScore || 0) - (a.matchScore || 0);
            }
            return 0;
        });

    // Move the loading check outside of the main return, keeping only auth loading
    if (loading || isLoadingApplications) {
        return (
            <div className="min-h-screen bg-[#047857] flex flex-col">
                <ApplicantSideBar />
                <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6">
                <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#047857] mx-auto mb-4"></div>
                        <div>Loading your applications...</div>
                    </div>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#047857] flex flex-col">
            <ApplicantSideBar />

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-t-[40px] overflow-y-auto p-6 shadow-md">
                {/* Use ApplicantHeader instead of manual header */}
                <ApplicantHeader
                    title="Track Your Applications"
                    subtitle="Ready to make meets end?"
                />

                {/* Job Count section remains the same */}
                <div className="pl-[112px] pr-[118px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-base font-semibold text-gray-500 mb-2">
                            {filteredApplications.length} matches displayed
                        </div>
                        <div className="flex gap-4">
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

                {/* Job Applications */}
                <div className="pl-[112px] pr-[118px] mt-10 mb-10 flex flex-wrap gap-[33px] justify-center">
                    {isLoadingApplications ? (
                        // Simple loading spinner for applications only
                        <div className="flex justify-center items-center w-full h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#047857] mx-auto mb-4"></div>
                                <div>Loading applications...</div>
                            </div>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        // Empty state
                        <div className="flex justify-center items-center w-full h-64">
                            <div className="text-center text-gray-500">
                                <i className="bi bi-inbox text-4xl mb-4"></i>
                                <div>No applications found</div>
                                <div className="text-sm">Start applying to jobs to see them here!</div>
                            </div>
                        </div>
                    ) : (
                        // Applications list
                        filteredApplications.map((job, index) => (
                            <div key={index} className="flex items-center justify-between mb-2">
                                <ApplicantTracker
                                    jobTitle={job.jobTitle}
                                    companyName={job.companyName}
                                    location={job.location}
                                    matchScore={job.matchScore || 0}
                                    employmentType={job.jobType}
                                    workSetup={job.setting}
                                    description={job.description}
                                    salaryRangeLow={job.salaryRangeLow}
                                    salaryRangeHigh={job.salaryRangeHigh}
                                    salaryFrequency={job.salaryFrequency || "Monthly"}
                                    companyDescription={job.companyDescription || ""}
                                    onViewDetails={(jobData) => {
                                        setSelectedJob(jobData || job);
                                        setDrawerOpen(true);
                                    }}
                                    status={job.status}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Add ApplicantTrackerDrawer */}
                <ApplicantTrackerDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    onViewDetails={(job) => {
                        setSelectedJob(job);
                        setDrawerOpen(false);
                        setJobDetailsOpen(true);
                    }}
                    job={selectedJob}
                />

                {/* Add JobDetailsDrawer */}
                <JobDetailsDrawer
                    open={jobDetailsOpen}
                    onClose={() => setJobDetailsOpen(false)}
                    job={selectedJob}
                />
            </div>
        </div>
    );
}

export default ApplicantApplications;
