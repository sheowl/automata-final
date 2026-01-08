import React, { createContext, useContext, useReducer } from 'react';
import { exampleJobPosts } from './jobPostsData';

const JobsContext = createContext();

const JOBS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_JOBS: 'SET_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

const initialState = {
  jobs: exampleJobPosts,
  loading: false,
  error: null
};

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

export function JobsProvider({ children }) {
  const [state, dispatch] = useReducer(jobsReducer, initialState);

  const fetchJobs = async (companyId) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    setTimeout(() => {
      dispatch({ type: JOBS_ACTIONS.SET_JOBS, payload: exampleJobPosts });
    }, 300);
  };

  const fetchAllJobs = async () => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    setTimeout(() => {
      dispatch({ type: JOBS_ACTIONS.SET_JOBS, payload: exampleJobPosts });
    }, 300);
  };

  const createJob = async (jobData) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    const newJob = {
      ...jobData,
      id: Date.now(),
      applicantCount: 0,
      postedDaysAgo: 0,
      status: 'Active'
    };
    setTimeout(() => {
      dispatch({ type: JOBS_ACTIONS.ADD_JOB, payload: newJob });
    }, 300);
    return newJob;
  };

  const updateJob = async (jobId, jobData) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    const updatedJob = { ...jobData, id: jobId };
    setTimeout(() => {
      dispatch({ type: JOBS_ACTIONS.UPDATE_JOB, payload: updatedJob });
    }, 300);
    return updatedJob;
  };

  const deleteJob = async (jobId) => {
    dispatch({ type: JOBS_ACTIONS.SET_LOADING, payload: true });
    setTimeout(() => {
      dispatch({ type: JOBS_ACTIONS.DELETE_JOB, payload: jobId });
    }, 300);
  };

  const clearError = () => {
    dispatch({ type: JOBS_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
    fetchJobs,
    fetchAllJobs,
    createJob,
    updateJob,
    deleteJob,
    clearError,
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

export default JobsContext;
