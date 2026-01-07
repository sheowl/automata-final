import React, { createContext, useContext, useState, useEffect } from 'react';
import CompanyService from '../services/CompanyService';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const { isEmployer } = useAuth();
  const [companyProfile, setCompanyProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [jobApplicants, setJobApplicants] = useState([]); // Add this state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile operations
  const getCompanyProfile = async () => {
    if (!isEmployer()) {
      throw new Error('Only employers can access company profile');
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await CompanyService.getProfile();
      console.log('Profile response:', response);
      setCompanyProfile(response);
      return response;
    } catch (err) {
      console.error('Error getting profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyProfile = async (data) => {
    if (!isEmployer()) {
      throw new Error('Only employers can update company profile');
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Updating profile with data:', data);
      const response = await CompanyService.updateProfile(data);
      console.log('Update response:', response);
      setCompanyProfile(response);
      return response;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Onboarding operations
  const completeOnboarding = async (data) => {
    if (!isEmployer()) {
      throw new Error('Only employers can complete onboarding');
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await CompanyService.completeOnboarding(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingStatus = async () => {
    if (!isEmployer()) {
      throw new Error('Only employers can check onboarding status');
    }
    
    setLoading(true);
    setError(null);
    try {
      const status = await CompanyService.getOnboardingStatus();
      return status;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dashboard operations
  const getDashboardStats = async () => {
    if (!isEmployer()) {
      throw new Error('Only employers can access dashboard stats');
    }
    
    setLoading(true);
    setError(null);
    try {
      const stats = await CompanyService.getDashboardStats();
      setDashboardStats(stats);
      return stats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecentApplicants = async () => {  // Remove limit parameter
    if (!isEmployer()) {
      throw new Error('Only employers can access recent applicants');
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await CompanyService.getRecentApplicants(); // No limit passed
      console.log('Recent applicants response:', response);

    // Ensure each applicant has a match_percentage or match_score
    const applicantsWithMatchScores = response.recent_applicants?.map(applicant => ({
      ...applicant,
      match_percentage: applicant.match_percentage || applicant.match_score || 0,
      match_score: applicant.match_score || applicant.match_percentage || 0
    })) || [];

      setRecentApplicants(applicantsWithMatchScores);
      return { recent_applicants: applicantsWithMatchScores };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Job operations
  const getCompanyJobs = async () => {
    if (!isEmployer()) {
      throw new Error('Only employers can access company jobs');
    }
    
    setLoading(true);
    setError(null);
    try {
      const jobs = await CompanyService.getMyJobs();
      setCompanyJobs(jobs.jobs || jobs);
      return jobs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    if (!isEmployer()) {
      throw new Error('Only employers can create jobs');
    }
    
    setLoading(true);
    setError(null);
    try {
      const newJob = await CompanyService.createJob(jobData);
      // Refresh jobs list
      await getCompanyJobs();
      return newJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId, jobData) => {
    if (!isEmployer()) {
      throw new Error('Only employers can update jobs');
    }
    
    setLoading(true);
    setError(null);
    try {
      const updatedJob = await CompanyService.updateJob(jobId, jobData);
      // Refresh jobs list
      await getCompanyJobs();
      return updatedJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!isEmployer()) {
      throw new Error('Only employers can delete jobs');
    }
    
    setLoading(true);
    setError(null);
    try {
      await CompanyService.deleteJob(jobId);
      // Refresh jobs list
      await getCompanyJobs();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Applicant operations
  const getApplicants = async (jobId = null) => {
    if (!isEmployer()) {
      throw new Error('Only employers can access applicants');
    }
    
    setLoading(true);
    setError(null);
    try {
      const applicants = await CompanyService.getApplicants(jobId);
      return applicants;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add new method for job-specific applicants
  const getJobApplicants = async (jobId) => {
    if (!isEmployer()) {
      throw new Error('Only employers can access job applicants');
    }
    
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Fetching applicants for job ID: ${jobId}`);
      const response = await CompanyService.getJobApplicants(jobId);
      console.log('📋 Job applicants response:', response);
      
      setJobApplicants(response.applicants || []);
      return response;
    } catch (err) {
      console.error('❌ Error fetching job applicants:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    companyProfile,
    dashboardStats,
    recentApplicants,
    companyJobs,
    jobApplicants, // Add this to the context value
    loading,
    error,
    
    // Profile operations
    getCompanyProfile,
    updateCompanyProfile,
    
    // Onboarding operations
    completeOnboarding,
    getOnboardingStatus,
    
    // Dashboard operations
    getDashboardStats,
    getRecentApplicants,
    
    // Job operations
    getCompanyJobs,
    createJob,
    updateJob,
    deleteJob,
    
    // Applicant operations
    getApplicants,
    getJobApplicants, // Add this to the context value
    
    // Utility
    clearError,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};