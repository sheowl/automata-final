from database import get_supabase_client, get_admin_client
import json
import os

supabase = get_supabase_client()

def create_test_auth_users():
    """
    Create test employer and applicant accounts in Supabase Auth.
    Returns employer_id for linking to jobs.
    """
    print("\n=== Creating Test Auth Users ===")
    
    try:
        admin_client = get_admin_client()
    except ValueError as e:
        print(f"⚠️  Skipping auth user creation: {e}")
        print("    Add SUPABASE_SERVICE_ROLE_KEY to backend/.env to enable this feature.")
        return None
    
    employer_id = None
    applicant_id = None
    
    # Get test credentials from env
    test_email = "employer@test.com"
    test_password = os.getenv("TEST_USER_PASSWORD")
    
    if not test_password:
        raise ValueError("TEST_USER_PASSWORD not found in environment variables. Please add it to backend/.env")
    
    # Create Employer Account
    try:
        print(f"Creating employer account ({test_email})...")
        employer_response = admin_client.auth.admin.create_user({
            "email": test_email,
            "password": test_password,
            "email_confirm": True  # Auto-confirm email for testing
        })
        
        employer_id = employer_response.user.id
        
        # Create employer profile
        supabase.table('profiles').insert({
            'id': employer_id,
            'email': 'employer@test.com',
            'role': 'employer',
            'name': 'Test Employer'
        }).execute()
        
        print(f"✓ Employer created: employer@test.com (ID: {employer_id[:8]}...)")
        
    except Exception as e:
        # User might already exist, try to fetch it
        if "already been registered" in str(e) or "already exists" in str(e):
            print("⚠️  Employer account already exists, fetching existing...")
            try:
                # Try to get existing profile
                profile_response = supabase.table('profiles').select('*').eq('email', 'employer@test.com').single().execute()
                employer_id = profile_response.data['id']
                print(f"✓ Using existing employer (ID: {employer_id[:8]}...)")
            except:
                print(f"⚠️  Could not fetch existing employer: {e}")
        else:
            print(f"❌ Error creating employer: {e}")
    
    # Create Applicant Account
    try:
        print("Creating applicant account (applicant@test.com)...")
        applicant_response = admin_client.auth.admin.create_user({
            "email": "applicant@test.com",
            "password": test_password,
            "email_confirm": True
        })
        
        applicant_id = applicant_response.user.id
        
        # Create applicant profile
        supabase.table('profiles').insert({
            'id': applicant_id,
            'email': 'applicant@test.com',
            'role': 'applicant',
            'name': 'Test Applicant'
        }).execute()
        
        print(f"✓ Applicant created: applicant@test.com (ID: {applicant_id[:8]}...)")
        
    except Exception as e:
        if "already been registered" in str(e) or "already exists" in str(e):
            print("⚠️  Applicant account already exists, fetching existing...")
            try:
                profile_response = supabase.table('profiles').select('*').eq('email', 'applicant@test.com').single().execute()
                applicant_id = profile_response.data['id']
                print(f"✓ Using existing applicant (ID: {applicant_id[:8]}...)")
            except:
                print(f"⚠️  Could not fetch existing applicant: {e}")
        else:
            print(f"❌ Error creating applicant: {e}")
    
    print("\n📋 Test Credentials:")
    print("   Employer: employer@test.com / Test123!")
    print("   Applicant: applicant@test.com / Test123!")
    print()
    
    return employer_id

def seed_data():
    print("=" * 70)
    print("SkillMatch MVP - Database Seeding Script")
    print("=" * 70)
    print("\nThis script will:")
    print("  1. Create test auth users (employer & applicant)")
    print("  2. Seed jobs table (linked to employer)")
    print("  3. Seed applicants table")
    print("  4. Create job_applications for matching analysis")
    print()
    confirm = input("Type 'yes' to proceed: ")
    if confirm != 'yes':
        print("Aborted.")
        return
    
    # Step 1: Create auth users
    employer_id = create_test_auth_users()

    # 1. Clear existing data (if any) - Optional, be careful in real apps!
    # For MVP, we might just assume empty or delete all.
    # supabase.table('jobs').delete().neq('id', 0).execute() # Hacky delete all
    # supabase.table('applicants').delete().neq('id', 0).execute()

    # NOTE: Since Supabase delete all requires a policy or careful filter, 
    # we'll skip auto-wipe for now to stay safe, or user can assume fresh DB.
    # Alternatively, we can insert and ignore duplicates if IDs match.
    
    # Step 2: Seed Jobs (linked to employer)
    print("\n=== Seeding Jobs ===")
    
    jobs = [
        {
            "title": "Senior Python Developer",
            "required_tags_json": ["Python", "Django", "PostgreSQL"],
            "optional_tags_json": ["Docker", "AWS", "Redis"],
            "employer_id": employer_id  # Link to employer
        },
        {
            "title": "Frontend Engineer",
            "required_tags_json": ["React", "TypeScript", "CSS"],
            "optional_tags_json": ["Tailwind", "Figma"],
            "employer_id": employer_id
        },
        {
            "title": "Data Scientist",
            "required_tags_json": ["Python", "Pandas", "Machine Learning"],
            "optional_tags_json": ["Jupyter", "SQL"],
            "employer_id": employer_id
        }
    ]

    job_ids = []
    for job in jobs:
        try:
            result = supabase.table('jobs').insert(job).execute()
            job_id = result.data[0]['id']
            job_ids.append(job_id)
            print(f"✓ Inserted Job: {job['title']} (ID: {job_id})")
        except Exception as e:
            print(f"❌ Error inserting job {job['title']}: {e}")

    # Step 3: Seed Applicants
    print("\n=== Seeding Applicants ===")
    
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

    applicant_ids = []
    for app in applicants:
        try:
            result = supabase.table('applicants').insert(app).execute()
            applicant_id = result.data[0]['id']
            applicant_ids.append(applicant_id)
            print(f"✓ Inserted Applicant: {app['name']} (ID: {applicant_id})")
        except Exception as e:
            print(f"❌ Error inserting applicant {app['name']}: {e}")
    
    # Step 4: Create job_applications for SkillMatch analysis
    print("\n=== Creating Job Applications (for matching) ===")
    
    if len(job_ids) > 0 and len(applicant_ids) > 0:
        # Map applicants to appropriate jobs based on skills
        # Python Job (job_ids[0]): Alice, Bob, Charlie, Eve, Judy
        # Frontend Job (job_ids[1]): Dave, Heidi (relevant applicants)
        # Data Science Job (job_ids[2]): Frank, Grace (relevant applicants)
        
        python_job_id = job_ids[0]
        frontend_job_id = job_ids[1] if len(job_ids) > 1 else python_job_id
        ds_job_id = job_ids[2] if len(job_ids) > 2 else python_job_id
        
        # Python job applications (indices 0-4, 7-9)
        python_applicant_indices = [0, 1, 2, 4, 9]  # Alice, Bob, Charlie, Eve, Judy
        for idx in python_applicant_indices:
            if idx < len(applicant_ids):
                try:
                    supabase.table('job_applications').insert({
                        'job_id': python_job_id,
                        'applicant_id': applicant_ids[idx],
                        'match_score': 0,
                        'current_state': 'applied',
                        'validation_logs': []
                    }).execute()
                    print(f"✓ Created Python job application for applicant {idx}")
                except Exception as e:
                    print(f"⚠️  Application might already exist: {e}")
        
        # Frontend job applications (indices 3, 7)
        frontend_applicant_indices = [3, 7]  # Dave, Heidi
        for idx in frontend_applicant_indices:
            if idx < len(applicant_ids):
                try:
                    supabase.table('job_applications').insert({
                        'job_id': frontend_job_id,
                        'applicant_id': applicant_ids[idx],
                        'match_score': 0,
                        'current_state': 'applied',
                        'validation_logs': []
                    }).execute()
                    print(f"✓ Created Frontend job application for applicant {idx}")
                except Exception as e:
                    print(f"⚠️  Application might already exist: {e}")
        
        # Data Science job applications (indices 5, 6)
        ds_applicant_indices = [5, 6]  # Frank, Grace
        for idx in ds_applicant_indices:
            if idx < len(applicant_ids):
                try:
                    supabase.table('job_applications').insert({
                        'job_id': ds_job_id,
                        'applicant_id': applicant_ids[idx],
                        'match_score': 0,
                        'current_state': 'applied',
                        'validation_logs': []
                    }).execute()
                    print(f"✓ Created Data Science job application for applicant {idx}")
                except Exception as e:
                    print(f"⚠️  Application might already exist: {e}")
    
    print("\n" + "=" * 70)
    print("✅ Seeding Complete!")
    print("=" * 70)
    print("\n📊 Summary:")
    print(f"   • Jobs created: {len(job_ids)}")
    print(f"   • Applicants created: {len(applicant_ids)}")
    print(f"   • Python job applications: 5")
    print(f"   • Frontend job applications: 2")
    print(f"   • Data Science job applications: 2")
    print("\n🔐 Test Login:")
    print("   Employer: employer@test.com / Test123!")
    print("   Applicant: applicant@test.com / Test123!")
    print("\n🎯 Next Steps:")
    print("   1. Run: python test_dfa.py (verify DFA logic)")
    print("   2. Start frontend and test sign-in")
    print("   3. Access SkillMatch dashboard to see matched applicants")
    print()

if __name__ == "__main__":
    seed_data()
