"""
Cleanup script to remove duplicate jobs from the database.
This will keep only the 3 most recent jobs (latest IDs).
"""
from database import get_supabase_client

supabase = get_supabase_client()

def cleanup_duplicate_jobs():
    print("\n" + "=" * 70)
    print("Duplicate Jobs Cleanup Script")
    print("=" * 70)
    
    # Fetch all jobs
    response = supabase.table('jobs').select('*').order('id', desc=False).execute()
    jobs = response.data
    
    print(f"\n📋 Found {len(jobs)} total jobs:")
    for job in jobs:
        print(f"   ID: {job['id']} - {job['title']}")
    
    if len(jobs) <= 3:
        print("\n✅ No duplicates found. Database is clean!")
        return
    
    # Group by title to find duplicates
    job_groups = {}
    for job in jobs:
        title = job['title']
        if title not in job_groups:
            job_groups[title] = []
        job_groups[title].append(job)
    
    print(f"\n🔍 Found {len(job_groups)} unique job titles:")
    for title, group in job_groups.items():
        print(f"   {title}: {len(group)} instance(s)")
    
    # Identify jobs to delete (keep only the latest of each title)
    jobs_to_delete = []
    jobs_to_keep = []
    
    for title, group in job_groups.items():
        if len(group) > 1:
            # Sort by ID descending, keep the latest (highest ID)
            sorted_group = sorted(group, key=lambda x: x['id'], reverse=True)
            jobs_to_keep.append(sorted_group[0])
            jobs_to_delete.extend(sorted_group[1:])
        else:
            jobs_to_keep.append(group[0])
    
    if not jobs_to_delete:
        print("\n✅ No duplicates found. Database is clean!")
        return
    
    print(f"\n🗑️  Jobs to DELETE (older duplicates):")
    for job in jobs_to_delete:
        print(f"   ID: {job['id']} - {job['title']}")
    
    print(f"\n✅ Jobs to KEEP (latest versions):")
    for job in jobs_to_keep:
        print(f"   ID: {job['id']} - {job['title']}")
    
    # Confirm deletion
    confirm = input(f"\n⚠️  Delete {len(jobs_to_delete)} duplicate job(s)? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("\n❌ Cleanup cancelled.")
        return
    
    # Delete duplicates
    deleted_count = 0
    for job in jobs_to_delete:
        try:
            # First, delete related job_applications
            supabase.table('job_applications').delete().eq('job_id', job['id']).execute()
            
            # Then delete the job
            supabase.table('jobs').delete().eq('id', job['id']).execute()
            print(f"✓ Deleted job ID {job['id']} ({job['title']})")
            deleted_count += 1
        except Exception as e:
            print(f"❌ Error deleting job ID {job['id']}: {e}")
    
    print(f"\n" + "=" * 70)
    print(f"✅ Cleanup Complete! Deleted {deleted_count} duplicate job(s).")
    print("=" * 70)
    print("\n💡 Tip: Refresh your frontend to see the updated job list.")
    print()

if __name__ == "__main__":
    cleanup_duplicate_jobs()
