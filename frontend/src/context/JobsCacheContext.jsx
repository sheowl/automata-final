import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const JobsCacheContext = createContext({});

export const useJobsCache = () => {
  const context = useContext(JobsCacheContext);
  if (!context) {
    throw new Error('useJobsCache must be used within JobsCacheProvider');
  }
  return context;
};

export const JobsCacheProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Fetch jobs with caching
  const fetchJobs = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && lastFetched && (now - lastFetched) < CACHE_DURATION && jobs.length > 0) {

      return { data: jobs, error: null, fromCache: true };
    }
    

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
      
      if (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
        return { data: null, error, fromCache: false };
      }
      

      setJobs(data || []);
      setLastFetched(now);
      setLoading(false);
      
      return { data: data || [], error: null, fromCache: false };
    } catch (error) {
      console.error('Exception fetching jobs:', error);
      setLoading(false);
      return { data: null, error, fromCache: false };
    }
  }, [jobs, lastFetched]);

  // Invalidate cache (call after creating/updating/deleting jobs)
  const invalidateCache = useCallback(() => {

    setLastFetched(null);
  }, []);

  // Clear cache completely
  const clearCache = useCallback(() => {

    setJobs([]);
    setLastFetched(null);
  }, []);

  const value = {
    jobs,
    loading,
    fetchJobs,
    invalidateCache,
    clearCache,
    isCached: lastFetched !== null && jobs.length > 0,
  };

  return (
    <JobsCacheContext.Provider value={value}>
      {children}
    </JobsCacheContext.Provider>
  );
};
