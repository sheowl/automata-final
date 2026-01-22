"""
Quick test to verify database UPDATE permissions work correctly.
"""

from database import get_supabase_client

def test_update_permissions():
    supabase = get_supabase_client()
    
    print("🔍 Testing Database UPDATE Permissions...")
    print("=" * 60)
    
    # 1. Fetch a sample job_application record
    print("\n1️⃣  Fetching sample job_application...")
    response = supabase.table('job_applications').select('*').limit(1).execute()
    
    if not response.data:
        print("❌ No job_applications found. Did you run seed.py?")
        return
    
    sample = response.data[0]
    job_id = sample['job_id']
    applicant_id = sample['applicant_id']
    original_state = sample['current_state']
    
    print(f"   Job ID: {job_id}")
    print(f"   Applicant ID: {applicant_id}")
    print(f"   Original State: {original_state}")
    
    # 2. Attempt UPDATE
    print("\n2️⃣  Attempting UPDATE operation...")
    test_state = 'test_interviewing'
    
    update_response = supabase.table('job_applications').update({
        'current_state': test_state
    }).eq('job_id', job_id).eq('applicant_id', applicant_id).execute()
    
    if update_response.data and len(update_response.data) > 0:
        print(f"   ✅ UPDATE successful! State changed to: {update_response.data[0]['current_state']}")
    else:
        print(f"   ❌ UPDATE failed! Response: {update_response}")
        print("\n   💡 FIX: Run this SQL in Supabase SQL Editor:")
        print("   " + "-" * 56)
        print("   CREATE POLICY \"Public Update Job Applications\"")
        print("   ON \"public\".\"job_applications\"")
        print("   FOR UPDATE TO public USING (true) WITH CHECK (true);")
        print("   " + "-" * 56)
        return False
    
    # 3. Verify the change persisted
    print("\n3️⃣  Verifying persistence...")
    verify_response = supabase.table('job_applications').select('current_state').eq('job_id', job_id).eq('applicant_id', applicant_id).single().execute()
    
    if verify_response.data['current_state'] == test_state:
        print(f"   ✅ Verification successful! State is: {verify_response.data['current_state']}")
    else:
        print(f"   ❌ Verification failed! Expected {test_state}, got {verify_response.data['current_state']}")
        return False
    
    # 4. Restore original state
    print("\n4️⃣  Restoring original state...")
    restore_response = supabase.table('job_applications').update({
        'current_state': original_state
    }).eq('job_id', job_id).eq('applicant_id', applicant_id).execute()
    
    if restore_response.data:
        print(f"   ✅ Restored to: {original_state}")
    
    print("\n" + "=" * 60)
    print("✅ All UPDATE permission tests passed!")
    print("🎉 Your database is ready for Phase 5 frontend integration!")
    return True

if __name__ == "__main__":
    try:
        test_update_permissions()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Make sure:")
        print("   1. Supabase credentials are in .env")
        print("   2. You ran seed.py to populate data")
        print("   3. You applied the RLS fix: docs/fix_rls_update_policy.sql")
