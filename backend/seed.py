from database import get_supabase_client
import json

supabase = get_supabase_client()

def seed_data():
    print("WARNING: This script will WIPE 'jobs' and 'applicants' tables and re-seed them.")
    confirm = input("Type 'yes' to proceed: ")
    if confirm != 'yes':
        print("Aborted.")
        return

    # 1. Clear existing data (if any) - Optional, be careful in real apps!
    # For MVP, we might just assume empty or delete all.
    # supabase.table('jobs').delete().neq('id', 0).execute() # Hacky delete all
    # supabase.table('applicants').delete().neq('id', 0).execute()

    # NOTE: Since Supabase delete all requires a policy or careful filter, 
    # we'll skip auto-wipe for now to stay safe, or user can assume fresh DB.
    # Alternatively, we can insert and ignore duplicates if IDs match.
    
    # 2. Seed Jobs
    jobs = [
        {
            "title": "Senior Python Developer",
            "required_tags_json": ["Python", "Django", "PostgreSQL"],
            "optional_tags_json": ["Docker", "AWS", "Redis"]
        },
        {
            "title": "Frontend Engineer",
            "required_tags_json": ["React", "TypeScript", "CSS"],
            "optional_tags_json": ["Tailwind", "Figma"]
        },
        {
            "title": "Data Scientist",
            "required_tags_json": ["Python", "Pandas", "Machine Learning"],
            "optional_tags_json": ["Jupyter", "SQL"]
        }
    ]

    print("Seeding Jobs...")
    for job in jobs:
        try:
            data, count = supabase.table('jobs').insert(job).execute()
            print(f"Inserted Job: {job['title']}")
        except Exception as e:
            print(f"Error inserting job {job['title']}: {e}")

    # 3. Seed Applicants
    # Structure: Matching, Missing 1 Required, Overqualified, Irrelevant
    applicants = [
        {
            "name": "Alice Matched",
            "skill_tags_json": ["Python", "Django", "PostgreSQL", "Docker"],
            "current_state": "applied"
        },
        {
            "name": "Bob MissingOne",
            "skill_tags_json": ["Python", "Django"], # Missing PostgreSQL
            "current_state": "applied"
        },
        {
            "name": "Charlie Overqualified",
            "skill_tags_json": ["Python", "Django", "PostgreSQL", "Docker", "AWS", "Redis", "Go"],
            "current_state": "applied"
        },
        {
            "name": "Dave Frontend (Irrelevant for Python Job)",
            "skill_tags_json": ["React", "TypeScript", "CSS"],
            "current_state": "applied"
        },
        {
            "name": "Eve BarelyMatched",
            "skill_tags_json": ["Python", "Django", "PostgreSQL"],
            "current_state": "applied"
        },
          {
            "name": "Frank Partial",
             "skill_tags_json": ["Python", "Pandas"], # For Data Science but missing ML
            "current_state": "applied"
        },
          {
            "name": "Grace PerfectDS",
             "skill_tags_json": ["Python", "Pandas", "Machine Learning", "Jupyter"],
            "current_state": "applied"
        },
          {
            "name": "Heidi FrontendPro",
             "skill_tags_json": ["React", "TypeScript", "CSS", "Tailwind", "Figma"],
            "current_state": "applied"
        },
          {
            "name": "Ivan NoSkills",
             "skill_tags_json": [],
            "current_state": "applied"
        },
          {
            "name": "Judy Learner",
             "skill_tags_json": ["Python"],
            "current_state": "applied"
        }
    ]

    print("Seeding Applicants...")
    for app in applicants:
        try:
            data, count = supabase.table('applicants').insert(app).execute()
            print(f"Inserted Applicant: {app['name']}")
        except Exception as e:
            print(f"Error inserting applicant {app['name']}: {e}")

if __name__ == "__main__":
    seed_data()
