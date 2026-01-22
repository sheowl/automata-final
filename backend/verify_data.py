from database import get_supabase_client

supabase = get_supabase_client()

# Fetch all applicants
response = supabase.table('applicants').select("*").execute()

print(f"Total Applicants in DB: {len(response.data)}")
if response.data:
    print("Sample:", response.data[0]['name'], "| Score:", response.data[0].get('match_score'))
else:
    print("No data found!")
