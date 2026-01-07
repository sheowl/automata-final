import React, { createContext, useContext, useReducer, useEffect } from 'react';
import jobService from '../services/jobService';

const JobsContext = createContext();

// Action types
const JOBS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_JOBS: 'SET_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  jobs: [],
  loading: false,
  error: null
};

// Reducer (keep exactly as is)
function jobsReducer(state, action) {
  switch (action.type) {
    case JOBS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case JOBS_ACTIONS.SET_JOBS:
      return { ...state, jobs: action.payload, loading: false, error: null };
    
    case JOBS_ACTIONS.ADD_JOB:
      return { 
        ...state, 
        jobs: [action.payload, ...state.jobs], 
        loading: false, 
        error: null 
      };
    
    case JOBS_ACTIONS.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job.id === action.payload.id ? action.payload : job
        ),
        loading: false,
        error: null
      };
    
    case JOBS_ACTIONS.DELETE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        loading: false,
        error: null
      };
    
    case JOBS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case JOBS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Provider component
export function JobsProvider({ children }) {
  const [state, dispatch] = useReducer(jobsReducer, initialState);

  // Remove default company ID
  const fetchJobs = async (companyId) => {
    if (!companyId) {
      console.warn('No company ID provided to fetchJobs');
      return;
    }
    
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    try {
      const backendJobs = await jobService.getCompanyJobs(companyId);
      console.log('Raw backend jobs:', backendJobs);
      
      const transformedJobs = backendJobs.map(job => {
        const transformed = jobService.transformJobData(job);
        console.log('Transformed job:', transformed);
        return transformed;
      });
      
      dispatch({ type: JOBS_ACTIONS.SET_JOBS, payload: transformedJobs });
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      dispatch({ type: JOBS_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const fetchAllJobs = async () => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    try {
      const backendJobs = await jobService.getAllJobs();
      console.log('Raw backend jobs (all):', backendJobs);
      
      const transformedJobs = backendJobs.map(job => {
        const transformed = jobService.transformJobData(job);
        console.log('Transformed job (all):', transformed);
        return transformed;
      });
      
      dispatch({ type: JOBS_ACTIONS.SET_JOBS, payload: transformedJobs });
    } catch (error) {
      console.error('Error in fetchAllJobs:', error);
      dispatch({ type: JOBS_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // FIX: Don't double-transform the job data
  const createJob = async (jobData) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: JOBS_ACTIONS.CLEAR_ERROR });
    
    try {
      // JobData is already in backend format from JobNewPost.jsx
      // Don't transform it again!
      console.log('JobsContext: Received job data (already in backend format):', jobData);
      
      // Send directly to service without transformation
      const newJob = await jobService.createJob(jobData);
      console.log('JobsContext: Created job response:', newJob);
      
      // Only transform the response for frontend display
      const transformedJob = jobService.transformJobData(newJob);
      dispatch({ type: JOBS_ACTIONS.ADD_JOB, payload: transformedJob });
      return transformedJob;
    } catch (error) {
      console.error('JobsContext: Error in createJob:', error);
      dispatch({ type: JOBS_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const updateJob = async (jobId, jobData) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    try {
      const backendJobData = jobService.transformToBackendFormat(jobData);
      const updatedJob = await jobService.updateJob(jobId, backendJobData);
      const transformedJob = jobService.transformJobData(updatedJob);
      dispatch({ type: JOBS_ACTIONS.UPDATE_JOB, payload: transformedJob });
      return transformedJob;
    } catch (error) {
      dispatch({ type: JOBS_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    try {
      await jobService.deleteJob(jobId);
      dispatch({ type: JOBS_ACTIONS.DELETE_JOB, payload: jobId });
    } catch (error) {
      dispatch({ type: JOBS_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: JOBS_ACTIONS.CLEAR_ERROR });
  };

  // FIX: Don't auto-fetch with hardcoded company ID
  // Let the parent components fetch jobs with the correct company ID
  useEffect(() => {
    // Remove auto-fetch to prevent interference
    // Parent components should call fetchJobs(companyId) when needed
  }, []);

  const value = {
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
    fetchJobs,
    fetchAllJobs,
    createJob,
    updateJob,
    deleteJob,
    clearError
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}

// Custom hook - MUST BE EXPORTED
export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}

// Export the context as well for direct access if needed
export { JobsContext };