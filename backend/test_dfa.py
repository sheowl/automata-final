from database import get_supabase_client
from automata import SkillValidationDFA
import json

def test_dfa():
    supabase = get_supabase_client()
    
    # 1. Fetch one job (e.g., Python Developer)
    job_response = supabase.table('jobs').select("*").eq('title', 'Senior Python Developer').execute()
    if not job_response.data:
        print("Job not found. Did you seed?")
        return
    
    target_job = job_response.data[0]
    required_tags = target_job.get('required_tags_json', [])
    print(f"\nTarget Job: {target_job['title']}")
    print(f"Required Tags: {required_tags}")
    
    # 2. Fetch all applicants
    app_response = supabase.table('applicants').select("*").execute()
    applicants = app_response.data
    
    print("\n--- Running DFA Validation ---")
    
    for app in applicants:
        print(f"\nProcessing: {app['name']}")
        print(f"Skills: {app['skill_tags_json']}")
        
        # Initialize DFA for this specific job's requirements
        dfa = SkillValidationDFA(required_tags)
        
        # Run
        final_state = dfa.process_applicant(app['skill_tags_json'])
        
        print(f"Final State: {final_state}")
        
        if final_state == 'q_matched':
            print(">> STATUS: MATCHED (Ready for Scoring)")
        elif final_state == 'q_partial':
             print(">> STATUS: PARTIALLY MATCHED (Review Needed)")
        else:
            print(">> STATUS: REJECTED")

if __name__ == "__main__":
    test_dfa()
