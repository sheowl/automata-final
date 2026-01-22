"""
Run DFA matching for all job applications and update the database.
This populates validation_logs and match_score in job_applications.
"""
from database import get_supabase_client
from automata import SkillValidationDFA
import json

def run_dfa_matching():
    print("\n" + "=" * 70)
    print("DFA Matching - Processing All Job Applications")
    print("=" * 70)
    
    supabase = get_supabase_client()
    
    # Fetch all jobs
    jobs_response = supabase.table('jobs').select("*").execute()
    jobs = jobs_response.data
    
    if not jobs:
        print("No jobs found. Run seed.py first.")
        return
    
    print(f"\nFound {len(jobs)} jobs to process")
    
    total_applications = 0
    matched_count = 0
    rejected_count = 0
    
    for job in jobs:
        job_id = job['id']
        job_title = job['title']
        required_tags = job.get('required_tags_json', [])
        optional_tags = job.get('optional_tags_json', [])
        
        print(f"\n--- Processing Job: {job_title} (ID: {job_id}) ---")
        print(f"    Required: {required_tags}")
        print(f"    Optional: {optional_tags}")
        
        # Fetch all applications for this job with applicant data
        apps_response = supabase.table('job_applications').select(
            "*, applicant:applicants(*)"
        ).eq('job_id', job_id).execute()
        
        applications = apps_response.data
        
        if not applications:
            print(f"    No applications for this job")
            continue
        
        print(f"    Found {len(applications)} applications")
        
        for app in applications:
            applicant = app['applicant']
            applicant_id = app['applicant_id']
            applicant_name = applicant['name']
            applicant_skills = applicant.get('skill_tags_json', [])
            
            print(f"\n    Processing: {applicant_name}")
            print(f"    Skills: {applicant_skills}")
            
            # Initialize DFA for this job's requirements
            dfa = SkillValidationDFA(required_tags)
            
            # Run DFA validation
            final_state = dfa.process_applicant(applicant_skills)
            validation_logs = dfa.get_logs()
            
            # Calculate match score
            if final_state == 'q_matched':
                # Score based on required + optional skills
                required_matched = len([s for s in required_tags if s in applicant_skills])
                optional_matched = len([s for s in optional_tags if s in applicant_skills])
                
                # Base score from required (60% weight) + bonus from optional (40% weight)
                required_score = (required_matched / len(required_tags)) * 60 if required_tags else 0
                optional_score = (optional_matched / len(optional_tags)) * 40 if optional_tags else 40
                
                match_score = int(required_score + optional_score)
                new_state = 'q_matched'
                matched_count += 1
                print(f"    >> MATCHED (Score: {match_score}%)")
            else:
                match_score = 0
                new_state = 'q_rejected'
                rejected_count += 1
                print(f"    >> REJECTED")
            
            # Update the job_application in database
            try:
                supabase.table('job_applications').update({
                    'match_score': match_score,
                    'current_state': new_state,
                    'validation_logs': validation_logs
                }).eq('job_id', job_id).eq('applicant_id', applicant_id).execute()
                
                print(f"    Database updated!")
            except Exception as e:
                print(f"    Error updating database: {e}")
            
            total_applications += 1
    
    print("\n" + "=" * 70)
    print("DFA Matching Complete!")
    print("=" * 70)
    print(f"\nResults:")
    print(f"   Total applications processed: {total_applications}")
    print(f"   Matched: {matched_count}")
    print(f"   Rejected: {rejected_count}")
    print(f"\nRefresh your frontend to see the updated data!")
    print()

if __name__ == "__main__":
    run_dfa_matching()
