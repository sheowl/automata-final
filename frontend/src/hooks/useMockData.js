// Static data hooks to replace context
import { useState, useEffect } from 'react';
import { 
  mockApplicantUser, 
  mockEmployerUser,
  mockJobPosts,
  mockApplications,
  mockApplicants,
  mockCompanyData,
  mockDashboardStats,
  mockMessages
} from '../data/mockData';
import { TAG_CATEGORIES, CATEGORY_IDS, getCategoryById } from '../components/Tags';

// Helper function to calculate time ago
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

// Mock useAuth hook
export const useAuth = () => {
  const [user, setUser] = useState(mockApplicantUser);
  const [userType, setUserType] = useState('applicant');

  return {
    user,
    userType,
    loading: false,
    isAuthenticated: () => true,
    isApplicant: () => userType === 'applicant',
    isEmployer: () => userType === 'employer',
    logout: () => {
      // Just navigate, no actual logout
    },
    companyLogin: async () => {
      setUser(mockEmployerUser);
      setUserType('employer');
      return { success: true };
    },
    companySignup: async () => {
      setUser(mockEmployerUser);
      setUserType('employer');
      return { success: true };
    },
    applicantLogin: async () => {
      setUser(mockApplicantUser);
      setUserType('applicant');
      return { success: true };
    },
    applicantSignup: async () => {
      setUser(mockApplicantUser);
      setUserType('applicant');
      return { success: true };
    }
  };
};

// Re-export useEmployerData as useCompany for backward compatibility
import { useEmployerData } from './useEmployerData';

export const useCompany = () => {
  const employerData = useEmployerData();
  
  return {
    companyProfile: employerData.companyProfile,
    dashboardStats: employerData.dashboardStats,
    companyJobs: employerData.jobPosts,
    jobApplicants: employerData.applicants,
    loading: employerData.loading,
    error: employerData.error,
    getCompanyProfile: employerData.getCompanyProfile,
    updateCompanyProfile: employerData.updateCompanyProfile,
    getDashboardStats: employerData.getDashboardStats,
    getRecentApplicants: employerData.getRecentApplicants,
    getMyJobs: employerData.getJobPosts,
    createJob: employerData.createJobPost,
    updateJob: employerData.updateJobPost,
    deleteJob: employerData.deleteJobPost,
    getJobApplicants: employerData.getApplicants,
    clearError: employerData.clearError
  };
};

// Mock useJobs hook
export const useJobs = () => {
  const [jobs, setJobs] = useState(mockJobPosts);

  return {
    jobs,
    loading: false,
    error: null,
    fetchJobs: async () => jobs,
    fetchAllJobs: async () => jobs,
    createJob: async (jobData) => {
      const newJob = { ...jobData, id: Date.now() };
      setJobs([newJob, ...jobs]);
      return newJob;
    },
    updateJob: async (jobId, jobData) => {
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, ...jobData } : job
      ));
      return { ...jobData, id: jobId };
    },
    deleteJob: async (jobId) => {
      setJobs(jobs.filter(job => job.id !== jobId));
    },
    getJobById: (jobId) => jobs.find(job => job.id === jobId),
    clearError: () => {}
  };
};

// Mock useTags hook
export const useTags = () => {
  // Use Tags.jsx as the source of truth
  const [categories] = useState(() => {
    return Object.entries(CATEGORY_IDS).map(([name, id]) => ({
      id,
      name
    }));
  });

  const [tags] = useState(() => {
    // Convert TAG_CATEGORIES to the format expected by the app
    let tagId = 1;
    const allTags = [];
    
    Object.entries(TAG_CATEGORIES).forEach(([categoryName, tagNames]) => {
      const categoryId = CATEGORY_IDS[categoryName];
      tagNames.forEach(tagName => {
        allTags.push({
          id: tagId,
          tag_id: tagId,
          categoryId,
          name: tagName,
          tag_name: tagName
        });
        tagId++;
      });
    });
    
    return allTags;
  });

  // Create mappings
  const categoryMapping = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const tagMapping = tags.reduce((acc, tag) => {
    if (!acc[tag.categoryId]) {
      acc[tag.categoryId] = {};
    }
    acc[tag.categoryId][tag.id] = tag.name;
    return acc;
  }, {});

  const flatTagMapping = tags.reduce((acc, tag) => {
    acc[tag.id] = tag.name;
    return acc;
  }, {});

  return {
    categories,
    tags,
    categoryMapping,
    tagMapping,
    flatTagMapping,
    loading: false,
    error: null,
    getTagNamesByIds: (tagIds) => {
      if (!tagIds || !Array.isArray(tagIds)) return [];
      return tagIds.map(id => flatTagMapping[id]).filter(Boolean);
    },
    getTagNameById: (tagId) => flatTagMapping[tagId] || null,
    getCategoryNameById: (categoryId) => categoryMapping[categoryId] || null,
    getTagsByCategories: (categoryIds) => {
      // If no specific categories requested, return all grouped by category
      if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        const result = {};
        categories.forEach(cat => {
          const categoryTags = tags.filter(tag => tag.categoryId === cat.id);
          if (categoryTags.length > 0) {
            result[cat.name] = categoryTags;
          }
        });
        return result;
      }
      
      // Return specific categories
      return categoryIds.reduce((acc, catId) => {
        const categoryName = categoryMapping[catId];
        acc[categoryName] = tags.filter(tag => tag.categoryId === catId);
        return acc;
      }, {});
    },
    getAllCategories: async () => categories,
    getAllTags: async () => tags,
    getCategoryById: (id) => categories.find(cat => cat.id === id),
    getTagById: (id) => tags.find(tag => tag.id === id),
    clearError: () => {}
  };
};

// Export dummy data for direct imports
export const companyData = mockCompanyData;
export const jobPostsData = mockJobPosts;
export const recentApplicants = mockApplicants;
