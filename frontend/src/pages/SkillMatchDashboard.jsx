import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useJobsCache } from '../context/JobsCacheContext';
import { useEmployerData } from '../hooks/useEmployerData';
import EmployerSideBar from '../components/EmployerSideBar';
import JobNewPost from '../components/JobNewPost';
import { 
  BriefcaseIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CpuChipIcon 
} from "@heroicons/react/24/outline";

const SkillMatchDashboard = () => {
  const { fetchJobs, jobs: cachedJobs, loading: cacheLoading } = useJobsCache();
  const { createJobPost, companyProfile } = useEmployerData();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);


  // Handle Recruitment Actions (Mimics Python DFA)
  const handleRecruitmentAction = async (action) => {
      if (!selectedApplicant || !selectedJob) return;

      let newState = selectedApplicant.current_state;
      let logEntry = "";
      
      // Normalize 'q_matched' or 'q_partial' to 'applied' logic for recruitment purposes
      const currentState = (newState === 'q_matched' || newState === 'q_partial') ? 'applied' : newState;

      if (currentState === 'applied') {
          if (action === 'invite') {
              newState = 'interviewing';
              logEntry = `[LOG] Action: 'invite' -> State: interviewing`;
          } else if (action === 'reject') {
              newState = 'rejected';
              logEntry = `[LOG] Action: 'reject' -> State: rejected`;
          }
      } else if (currentState === 'interviewing') {
           if (action === 'offer') {
              newState = 'hired';
              logEntry = `[LOG] Action: 'offer' -> State: hired (OFFER ACCEPTED)`;
          } else if (action === 'reject') {
              newState = 'rejected';
              logEntry = `[LOG] Action: 'reject' -> State: rejected`;
          }
      }

      if (!logEntry) return;

      const newLogs = [...(selectedApplicant.validation_logs || []), logEntry];

      // Update Supabase
      const { error } = await supabase
          .from('job_applications')
          .update({ 
              current_state: newState,
              validation_logs: newLogs
          })
          .eq('job_id', selectedJob.id)
          .eq('applicant_id', selectedApplicant.id);

      if (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status");
      } else {
          // Update local state
          const updatedApp = { ...selectedApplicant, current_state: newState, validation_logs: newLogs };
          setApplicants(applicants.map(app => 
              app.id === selectedApplicant.id ? updatedApp : app
          ));
          setSelectedApplicant(updatedApp);
      }
  };

  // Handle adding new job
  const handleAddJob = async (jobData) => {
    try {

      // Create job using EmployerData hook
      const newJob = await createJobPost(jobData);

      // Close modal and refresh jobs
      setShowModal(false);
      
      // Refresh the jobs list
      await fetchJobs();
      
    } catch (error) {
      console.error("Error creating job:", error);
      alert(error.message || "Failed to create job. Please try again.");
    }
  };

  // Fetch Applicants when selectedJob changes
  useEffect(() => {
      if (!selectedJob) return;

      const fetchApplicants = async () => {
          // Fetch from junction table for specific job
          const { data, error } = await supabase
            .from('job_applications')
            .select(`
                match_score,
                current_state,
                validation_logs,
                applicant:applicants (
                    id,
                    name,
                    skill_tags_json
                )
            `)
            .eq('job_id', selectedJob.id)
            .order('match_score', { ascending: false });
    
          if (error) {
              console.error('Error fetching applicants:', error);
          } else {
              // Flatten the structure for UI compatibility
              const formatted = data.map(item => ({
                  ...item.applicant,
                  match_score: item.match_score,
                  current_state: item.current_state,
                  validation_logs: item.validation_logs
              }));
              setApplicants(formatted);
          }
      };
      
      fetchApplicants();
      setSelectedApplicant(null); // Reset selection
  }, [selectedJob]);

  // Fetch initial data using cache
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      
      // Use cached fetch instead of direct Supabase call
      const { data: jobsData, error: jobsError, fromCache } = await fetchJobs();
      
      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted) {
        setJobs(jobsData || []);
        setLoading(false);
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchJobs]);

  // Helper for match colors
  const getMatchColor = (score) => {
    if (score < 50) return "bg-[#EF4444] text-white";
    if (score < 75) return "bg-[#F5B041] text-white";
    return "bg-[#27AE60] text-white";
  };

  return (
    <div className="min-h-screen bg-[#9B1C31] flex flex-col font-montserrat">
      {/* Top Navigation */}
      <EmployerSideBar activePage="skillmatch" />

      {/* Main Content Area (White Card) */}
      <div className="flex-1 bg-[#FEFEFF] rounded-t-[40px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] mt-4 mb-0 flex flex-col">
        
        <main className="flex-1 p-8 overflow-y-auto">
            {!selectedJob ? (
                // MASTER VIEW: Job Grid
                <div className="max-w-7xl mx-auto">
                   <h1 className="text-[48px] font-bold text-[#9B1C31] mb-2 flex items-center gap-3">
                      <CpuChipIcon className="w-12 h-12 text-[#9B1C31]" />
                      SkillMatch Intelligence
                   </h1>
                   <p className="text-[#9B1C31] text-[22px] font-semibold mb-8">Select a job to analyze candidate compatibility or create a new posting.</p>

                   {loading ? (
                       <div className="text-center py-20">
                           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9B1C31] mx-auto mb-4"></div>
                           <p className="text-[#6B7280] text-lg font-semibold">Loading jobs...</p>
                       </div>
                   ) : jobs.length === 0 ? (
                       <div className="text-center py-20">
                           <BriefcaseIcon className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                           <p className="text-[#6B7280] text-xl font-semibold mb-2">No job postings yet</p>
                           <p className="text-[#6B7280] text-base mb-6">Create your first job posting to start analyzing candidates</p>
                           <button
                               onClick={() => setShowModal(true)}
                               className="px-8 py-3 bg-[#9B1C31] text-white font-bold rounded-lg hover:bg-[#7D1628] transition-colors"
                           >
                               Create First Job
                           </button>
                       </div>
                   ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {jobs.map((job) => (
                               <div
                                   key={job.id}
                                   onClick={() => setSelectedJob(job)}
                                   className="bg-white border border-gray-200 rounded-[20px] p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                               >
                                   <div className="flex justify-between items-start mb-4">
                                       <div className="p-3 bg-red-50 rounded-[12px] group-hover:bg-[#9B1C31] transition-colors duration-300">
                                            <BriefcaseIcon className="w-8 h-8 text-[#9B1C31] group-hover:text-white transition-colors duration-300" />
                                       </div>
                                       <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                                           ID: {job.id}
                                       </span>
                                   </div>
                                   <h3 className="text-[20px] font-bold text-[#3C3B3B] mb-2 group-hover:text-[#9B1C31] transition-colors">
                                       {job.title}
                                   </h3>
                                   <div className="flex flex-wrap gap-2 mt-4">
                                       {job.required_tags_json.slice(0, 3).map(tag => (
                                           <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">
                                               {tag}
                                           </span>
                                       ))}
                                       {job.required_tags_json.length > 3 && (
                                           <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">
                                               +{job.required_tags_json.length - 3}
                                           </span>
                                       )}
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
            ) : (
                // DETAIL VIEW: Analysis Dashboard
                <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
                     {/* Back Button */}
                     <button 
                        onClick={() => setSelectedJob(null)}
                        className="flex items-center gap-2 text-[#9B1C31] font-bold hover:bg-[#9B1C31]/10 px-4 py-2 rounded-lg transition-colors mb-4"
                     >
                         <i className="bi bi-arrow-left text-xl"></i>
                         <span>Back to Jobs</span>
                     </button>

                     {/* Job Header */}
                    <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#9B1C31]"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h1 className="text-[32px] font-bold text-[#3C3B3B] mb-3">{selectedJob.title}</h1>
                                
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Required Skills:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.required_tags_json.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-[#9B1C31] text-white text-xs font-bold rounded-full shadow-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-[#9B1C31]">{applicants.length}</div>
                                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Candidates Analyzed</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Candidates List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[20px] font-bold text-[#3C3B3B] flex items-center gap-2">
                                    <CheckCircleIcon className="w-6 h-6 text-[#27AE60]" />
                                    Ranked Candidates
                                </h3>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Merge Sorted by Score</span>
                            </div>
                            
                            {applicants.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-[16px] border border-gray-200">
                                    <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-[#6B7280] text-lg font-semibold mb-2">No applicants yet</p>
                                    <p className="text-[#6B7280] text-sm">Candidates who apply to this job will appear here</p>
                                </div>
                            ) : applicants.map((app, index) => (
                                <div 
                                    key={app.id} 
                                    onClick={() => setSelectedApplicant(app)}
                                    className={`group relative flex items-center justify-between p-5 rounded-[16px] border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                                        selectedApplicant?.id === app.id 
                                        ? 'border-[#9B1C31] bg-[#fff5f5] shadow-md ring-1 ring-[#9B1C31]' 
                                        : 'border-gray-200 bg-white hover:border-[#9B1C31]'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] shadow-sm flex-shrink-0 ${
                                            index < 3 ? 'bg-[#9B1C31] text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[18px] text-[#3C3B3B]">{app.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-1 flex-wrap">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {app.id}</span>
                                                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                                                    app.current_state === 'hired' ? 'text-yellow-700 bg-yellow-100' :
                                                    app.current_state === 'interviewing' ? 'text-blue-700 bg-blue-100' :
                                                    app.current_state === 'q_matched' || app.current_state === 'applied' ? 'text-emerald-700 bg-emerald-100' : 
                                                    app.current_state === 'q_partial' ? 'text-amber-700 bg-amber-100' :
                                                    'text-red-700 bg-red-100'
                                                }`}>
                                                    {app.current_state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center flex-shrink-0 ml-4">
                                         {app.match_score > 0 ? (
                                             <div className={`px-4 py-2 rounded-[12px] font-bold text-[16px] shadow-sm ${getMatchColor(app.match_score)}`}>
                                                 {app.match_score}%
                                             </div>
                                         ) : (
                                            <div className="px-4 py-2 rounded-[12px] font-bold text-[14px] bg-gray-100 text-gray-400">
                                                Rejected
                                            </div>
                                         )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Validation Console (Visualizer) */}
                        <div className="lg:col-span-1">
                             <ValidationConsole applicant={selectedApplicant} job={selectedJob} onAction={handleRecruitmentAction} />
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#9B1C31] rounded-full shadow-lg flex items-center justify-center cursor-pointer transition hover:bg-[#7D1628] focus:outline-none z-50"
      >
        <span className="text-white text-[32px] leading-none" style={{ fontWeight: 200 }}>+</span>
      </button>

      {/* Job Post Modal */}
      <JobNewPost
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddJob}
        companyData={companyProfile}
      />
    </div>
  );
};

// Extracted Console Component for better state management
const ValidationConsole = ({ applicant, job, onAction }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Reset expanded state when applicant changes
    useEffect(() => {
        setExpanded(false);
    }, [applicant]);

    if (!applicant) {
        return (
            <div className="sticky top-6 bg-[#1E1E1E] text-gray-400 rounded-[20px] p-8 shadow-2xl font-mono text-sm min-h-[400px] border border-gray-800 flex flex-col items-center justify-center text-center">
                 <CpuChipIcon className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-bold">AWAITING INPUT</p>
                 <p className="text-xs mt-2 opacity-50">Select a candidate to run analysis.</p>
            </div>
        );
    }

    const logs = applicant.validation_logs || [];
    const MAX_VISIBLE_LOGS = 8;
    const displayedLogs = expanded ? logs : logs.slice(0, MAX_VISIBLE_LOGS);
    const hasMoreLogs = logs.length > MAX_VISIBLE_LOGS;

    return (
        <div className="sticky top-6 bg-[#1E1E1E] text-[#D4D4D4] rounded-[20px] p-6 shadow-2xl font-mono text-xs md:text-sm border border-gray-800 flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold tracking-widest uppercase text-white">
                        DFA KERNEL
                    </span>
                </div>
                <div className="text-[10px] text-gray-500">{applicant.id}</div>
            </div>
            
            <div className="space-y-3 mb-4">
                 <div className="text-gray-500">
                     -&gt; TARGET: <span className="text-white font-bold">{job.title}</span>
                 </div>
                 <div className="text-gray-500">
                     -&gt; SUBJECT: <span className="text-white font-bold">{applicant.name}</span>
                 </div>
                 <div className="border-b border-gray-800 my-2"></div>
            </div>
            
            <div className="flex-1 space-y-2 overflow-hidden relative">
               {displayedLogs.map((log, i) => (
                   <div key={i} className={`flex gap-3 ${
                       log.includes('Matched') || log.includes('q_matched') ? 'text-[#4ADE80] font-bold' :
                       log.includes('Rejected') || log.includes('q_rejected') ? 'text-[#F87171] font-bold' :
                       log.includes('Input') ? 'text-[#60A5FA]' : 
                       'text-gray-400'
                   }`}>
                       <span className="opacity-30 select-none">{(i+1).toString().padStart(2, '0')}</span>
                       <span className="break-words">{log}</span>
                   </div>
               ))}
               
               {!expanded && hasMoreLogs && (
                   <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#1E1E1E] to-transparent pointer-events-none"></div>
               )}
            </div>

            {hasMoreLogs && (
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors uppercase tracking-wider"
                >
                    {expanded ? "Collapse Log" : `Show ${logs.length - MAX_VISIBLE_LOGS} more lines`}
                </button>
            )}

            <div className="mt-6 pt-4 border-t border-gray-700">
                {/* Status Badge */}
                <div className="mb-4">
                    {applicant.current_state === 'q_matched' || applicant.current_state === 'applied' ? (
                        <div className="w-full bg-[#064E3B] border border-[#10B981] text-[#34D399] rounded p-3 text-center">
                             <div className="text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
                             <div className="text-xl font-black">MATCHED</div>
                        </div>
                    ) : applicant.current_state === 'q_partial' ? (
                        <div className="w-full bg-[#78350F] border border-[#F59E0B] text-[#FCD34D] rounded p-3 text-center">
                             <div className="text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
                             <div className="text-xl font-black">PARTIALLY MATCHED</div>
                        </div>
                    ) : applicant.current_state === 'interviewing' ? (
                         <div className="w-full bg-blue-900 border border-blue-500 text-blue-300 rounded p-3 text-center">
                             <div className="text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
                             <div className="text-xl font-black">INTERVIEWING</div>
                        </div>
                    ) : applicant.current_state === 'hired' ? (
                        <div className="w-full bg-purple-900 border border-purple-500 text-purple-300 rounded p-3 text-center">
                             <div className="text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
                             <div className="text-xl font-black">HIRED</div>
                        </div>
                    ) : (
                        <div className="w-full bg-[#450A0A] border border-[#EF4444] text-[#FCA5A5] rounded p-3 text-center">
                            <div className="text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
                            <div className="text-xl font-black">REJECTED</div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    {(applicant.current_state === 'q_matched' || applicant.current_state === 'q_partial' || applicant.current_state === 'applied') && (
                        <>
                            <button 
                                onClick={() => onAction('invite')}
                                className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors uppercase tracking-wider text-sm"
                            >
                                Invite to Interview
                            </button>
                             <button 
                                onClick={() => onAction('reject')}
                                className="col-span-2 py-3 bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-white rounded font-bold transition-colors uppercase tracking-wider text-sm"
                            >
                                Reject
                            </button>
                        </>
                    )}

                    {applicant.current_state === 'interviewing' && (
                        <>
                            <button 
                                onClick={() => onAction('offer')}
                                className="col-span-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors uppercase tracking-wider text-sm"
                            >
                                Hire
                            </button>
                            <button 
                                onClick={() => onAction('reject')}
                                className="col-span-1 py-3 bg-red-800 hover:bg-red-700 text-white rounded font-bold transition-colors uppercase tracking-wider text-sm"
                            >
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillMatchDashboard;
