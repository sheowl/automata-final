from database import get_supabase_client
from automata import SkillValidationDFA
from algo.hashing import TagMatcher
from algo.mergesort import merge_sort
import json

def run_pipeline():
    supabase = get_supabase_client()
    print(f"--- SkillMatch Pipeline Started ---")
    
    # 1. Fetch All Jobs
    job_res = supabase.table('jobs').select("*").execute()
    jobs = job_res.data
    print(f"Loaded {len(jobs)} jobs.")

    # 2. Fetch All Applicants
    app_res = supabase.table('applicants').select("*").execute()
    applicants = app_res.data
    print(f"Loaded {len(applicants)} applicants.")

    # 3. Process each Job
    for job in jobs:
        print(f"\nProcessing Job: {job['title']} (ID: {job['id']})")
        required_tags = job.get('required_tags_json', [])
        optional_tags = job.get('optional_tags_json', [])
        all_job_tags = required_tags + optional_tags

        # Initialize DFA
        dfa = SkillValidationDFA(required_tags)
        
        candidates_to_rank = []

        for app in applicants:
            # A. Run DFA
            state = dfa.process_applicant(app['skill_tags_json'])
            logs = dfa.get_logs()
            
            score = 0
            # B. Score if Matched
            if state == 'q_matched':
                matcher = TagMatcher(app['skill_tags_json'], all_job_tags)
                score = matcher.calculate_score()
                candidates_to_rank.append({
                    'applicant_id': app['id'],
                    'score': score,
                    'name': app['name'] # just for sorting debug
                })
            
            # C. Upsert into job_applications
            try:
                # Check if exists
                existing = supabase.table('job_applications').select('id').eq('job_id', job['id']).eq('applicant_id', app['id']).execute()
                
                data = {
                    'job_id': job['id'],
                    'applicant_id': app['id'],
                    'match_score': score,
                    'current_state': state,
                    'validation_logs': logs
                }

                if existing.data:
                    supabase.table('job_applications').update(data).eq('id', existing.data[0]['id']).execute()
                else:
                    supabase.table('job_applications').insert(data).execute()
            except Exception as e:
                print(f"Error saving application: {e}")

        # D. Local Sorting for Debug Print
        candidates_to_rank = merge_sort(candidates_to_rank, 'score', descending=True)
        print(f"Top 3 Candidates for {job['title']}:")
        for c in candidates_to_rank[:3]:
            print(f" - {c['name']}: {c['score']}")

    print("\nPipeline Complete. All jobs processed.")
    return


if __name__ == "__main__":
    run_pipeline()
