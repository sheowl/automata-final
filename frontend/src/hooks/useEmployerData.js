import { useState, useEffect, useCallback } from 'react';
import { mockCompanyData, mockJobPosts, mockApplicants, mockDashboardStats } from '../data/mockData';

// Shared state for all employer data (singleton pattern)
let sharedEmployerState = {
  companyProfile: { ...mockCompanyData },
  jobPosts: [...mockJobPosts],
  applicants: [...mockApplicants],
  dashboardStats: { ...mockDashboardStats },
  messages: [],
  notifications: []
};

// Subscribers for state changes
const subscribers = new Set();

// Notify all subscribers of state changes
const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// Helper function to generate unique IDs
const generateId = () => Date.now() + Math.random();

/**
 * Centralized hook for all employer-side data management
 * Provides consistent state across all employer pages and components
 */
export const useEmployerData = () => {
  const [state, setState] = useState(sharedEmployerState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to state changes
  useEffect(() => {
    const updateState = () => {
      setState({ ...sharedEmployerState });
    };
    
    subscribers.add(updateState);
    return () => subscribers.delete(updateState);
  }, []);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ COMPANY PROFILE OPERATIONS ============
  
  const getCompanyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return sharedEmployerState.companyProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompanyProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Updating company profile:', updates);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      sharedEmployerState.companyProfile = {
        ...sharedEmployerState.companyProfile,
        ...updates
      };
      
      console.log('✅ Company profile updated:', sharedEmployerState.companyProfile);
      notifySubscribers();
      return sharedEmployerState.companyProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ JOB POST OPERATIONS ============
  
  const getJobPosts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let jobs = [...sharedEmployerState.jobPosts];
      
      // Apply filters if provided
      if (filters.status) {
        // Filter by status (active, closed, etc.)
        jobs = jobs.filter(job => job.status === filters.status);
      }
      
      return jobs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback((jobId) => {
    return sharedEmployerState.jobPosts.find(job => 
      job.id === jobId || job.job_id === jobId
    );
  }, []);

  const createJobPost = useCallback(async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Creating job post:', jobData);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newJob = {
        ...jobData,
        id: generateId(),
        job_id: generateId(),
        company_id: sharedEmployerState.companyProfile.company_id,
        company_name: sharedEmployerState.companyProfile.company_name,
        date_added: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        applicant_count: 0,
        status: 'active'
      };
      
      sharedEmployerState.jobPosts = [newJob, ...sharedEmployerState.jobPosts];
      
      // Update dashboard stats
      sharedEmployerState.dashboardStats = {
        ...sharedEmployerState.dashboardStats,
        totalJobPostings: sharedEmployerState.jobPosts.length,
        activePostings: sharedEmployerState.jobPosts.filter(j => j.status === 'active').length
      };
      
      console.log('✅ Job post created:', newJob);
      notifySubscribers();
      return newJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJobPost = useCallback(async (jobId, updates) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Updating job post:', jobId, updates);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      sharedEmployerState.jobPosts = sharedEmployerState.jobPosts.map(job =>
        (job.id === jobId || job.job_id === jobId) 
          ? { ...job, ...updates }
          : job
      );
      
      const updatedJob = sharedEmployerState.jobPosts.find(j => 
        j.id === jobId || j.job_id === jobId
      );
      
      console.log('✅ Job post updated:', updatedJob);
      notifySubscribers();
      return updatedJob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJobPost = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting job post:', jobId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      sharedEmployerState.jobPosts = sharedEmployerState.jobPosts.filter(job =>
        job.id !== jobId && job.job_id !== jobId
      );
      
      // Update dashboard stats
      sharedEmployerState.dashboardStats = {
        ...sharedEmployerState.dashboardStats,
        totalJobPostings: sharedEmployerState.jobPosts.length,
        activePostings: sharedEmployerState.jobPosts.filter(j => j.status === 'active').length
      };
      
      console.log('✅ Job post deleted');
      notifySubscribers();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ APPLICANT OPERATIONS ============
  
  const getApplicants = useCallback(async (jobId = null) => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let applicants = [...sharedEmployerState.applicants];
      
      if (jobId) {
        applicants = applicants.filter(app => 
          app.job_id === jobId || app.jobId === jobId
        );
      }
      
      return applicants;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApplicantById = useCallback((applicantId) => {
    return sharedEmployerState.applicants.find(app =>
      app.id === applicantId || app.applicant_id === applicantId
    );
  }, []);

  const updateApplicantStatus = useCallback(async (applicantId, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Updating applicant status:', applicantId, newStatus);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      sharedEmployerState.applicants = sharedEmployerState.applicants.map(app =>
        (app.id === applicantId || app.applicant_id === applicantId)
          ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
          : app
      );
      
      console.log('✅ Applicant status updated');
      notifySubscribers();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentApplicants = useCallback(async (limit = 3) => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Sort by application date and get most recent
      const recent = [...sharedEmployerState.applicants]
        .sort((a, b) => new Date(b.appliedDate || b.applied_date) - new Date(a.appliedDate || a.applied_date))
        .slice(0, limit)
        .map(applicant => ({
          ...applicant,
          match_percentage: applicant.matchScore || applicant.match_score,
          match_score: applicant.matchScore || applicant.match_score,
          position: applicant.jobTitle || applicant.job_title,
          time_ago: getTimeAgo(applicant.appliedDate || applicant.applied_date)
        }));
      
      return { recent_applicants: recent };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ DASHBOARD OPERATIONS ============
  
  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Calculate real-time stats from actual data
      const activeJobs = sharedEmployerState.jobPosts.filter(j => j.status === 'active' || !j.status).length;
      const totalApplications = sharedEmployerState.applicants.length;
      const pendingReviews = sharedEmployerState.applicants.filter(app => 
        app.status === 'pending' || app.status === 'applied' || !app.status
      ).length;
      
      const stats = {
        active_jobs: activeJobs,
        total_applications: totalApplications,
        pending_reviews: pendingReviews,
        // Also include the old format for backward compatibility
        totalJobPostings: sharedEmployerState.jobPosts.length,
        activePostings: activeJobs,
        totalApplicants: totalApplications,
        newApplicants: sharedEmployerState.applicants.filter(app => {
          const appliedDate = new Date(app.appliedDate || app.applied_date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appliedDate >= weekAgo;
        }).length,
        company_info: {
          company_name: sharedEmployerState.companyProfile.company_name,
          company_size: sharedEmployerState.companyProfile.company_size,
          location: sharedEmployerState.companyProfile.location
        }
      };
      
      sharedEmployerState.dashboardStats = stats;
      notifySubscribers();
      return stats;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============ UTILITY FUNCTIONS ============
  
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        getCompanyProfile(),
        getJobPosts(),
        getApplicants(),
        getDashboardStats()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, [getCompanyProfile, getJobPosts, getApplicants, getDashboardStats]);

  return {
    // State
    companyProfile: state.companyProfile,
    jobPosts: state.jobPosts,
    applicants: state.applicants,
    dashboardStats: state.dashboardStats,
    loading,
    error,
    
    // Company operations
    getCompanyProfile,
    updateCompanyProfile,
    
    // Job post operations
    getJobPosts,
    getJobById,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    
    // Applicant operations
    getApplicants,
    getApplicantById,
    updateApplicantStatus,
    getRecentApplicants,
    
    // Dashboard operations
    getDashboardStats,
    
    // Utilities
    refreshData,
    clearError
  };
};

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  if (!dateString) return "Unknown time";
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export default useEmployerData;
