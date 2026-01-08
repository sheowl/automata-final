import React, { createContext, useContext, useState } from 'react';
import { companyData } from './companyData';
import recentApplicants from './recentApplicants';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const { isEmployer } = useAuth();
  const [companyProfile, setCompanyProfile] = useState(companyData["Tech Solutions Inc."]);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobPostings: 12,
    activePostings: 8,
    totalApplicants: 234,
    newApplicants: 45
  });
  const [recentApplicantsData, setRecentApplicantsData] = useState(recentApplicants.slice(0, 3));
  const [companyJobs, setCompanyJobs] = useState([]);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCompanyProfile = async () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setCompanyProfile(companyData["Tech Solutions Inc."]);
      setLoading(false);
    }, 300);
    return companyData["Tech Solutions Inc."];
  };

  const updateCompanyProfile = async (data) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setCompanyProfile({ ...companyProfile, ...data });
      setLoading(false);
    }, 300);
    return { ...companyProfile, ...data };
  };

  const getDashboardStats = async () => {
    setLoading(true);
    setTimeout(() => {
      setDashboardStats({
        totalJobPostings: 12,
        activePostings: 8,
        totalApplicants: 234,
        newApplicants: 45
      });
      setLoading(false);
    }, 300);
  };

  const getRecentApplicants = async (limit = 3) => {
    setLoading(true);
    setTimeout(() => {
      setRecentApplicantsData(recentApplicants.slice(0, limit));
      setLoading(false);
    }, 300);
  };

  const getMyJobs = async () => {
    setLoading(true);
    setTimeout(() => {
      setCompanyJobs([]);
      setLoading(false);
    }, 300);
  };

  const createJob = async (jobData) => {
    setLoading(true);
    const newJob = { ...jobData, id: Date.now() };
    setTimeout(() => {
      setCompanyJobs([...companyJobs, newJob]);
      setLoading(false);
    }, 300);
    return newJob;
  };

  const updateJob = async (jobId, jobData) => {
    setLoading(true);
    setTimeout(() => {
      setCompanyJobs(companyJobs.map(job => 
        job.id === jobId ? { ...job, ...jobData } : job
      ));
      setLoading(false);
    }, 300);
    return { ...jobData, id: jobId };
  };

  const deleteJob = async (jobId) => {
    setLoading(true);
    setTimeout(() => {
      setCompanyJobs(companyJobs.filter(job => job.id !== jobId));
      setLoading(false);
    }, 300);
  };

  const getJobApplicants = async (jobId) => {
    setLoading(true);
    setTimeout(() => {
      setJobApplicants(recentApplicants);
      setLoading(false);
    }, 300);
  };

  const getApplicantsByStatus = async (jobId, status) => {
    setLoading(true);
    setTimeout(() => {
      setJobApplicants(recentApplicants.filter(a => a.status === status));
      setLoading(false);
    }, 300);
  };

  const updateApplicationStatus = async (applicationId, status) => {
    setLoading(true);
    setTimeout(() => {
      setJobApplicants(jobApplicants.map(applicant =>
        applicant.id === applicationId ? { ...applicant, status } : applicant
      ));
      setLoading(false);
    }, 300);
  };

  const getOnboardingStatus = async () => {
    return { onboarded: true };
  };

  const completeOnboarding = async (data) => {
    setCompanyProfile({ ...companyProfile, ...data });
    return { success: true };
  };

  const value = {
    companyProfile,
    dashboardStats,
    recentApplicants: recentApplicantsData,
    companyJobs,
    jobApplicants,
    loading,
    error,
    getCompanyProfile,
    updateCompanyProfile,
    getDashboardStats,
    getRecentApplicants,
    getMyJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobApplicants,
    getApplicantsByStatus,
    updateApplicationStatus,
    getOnboardingStatus,
    completeOnboarding,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
