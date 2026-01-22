from database import get_supabase_client
import json

supabase = get_supabase_client()

# Fetch all applicants
response = supabase.table('applicants').select("name, match_score, current_state, validation_logs").execute()

print(f"Total: {len(response.data)}")
for app in response.data:
    print(f"\n--- {app['name']} ---")
    print(f"Score: {app['match_score']}")
    print(f"State: {app['current_state']}")
    logs = app['validation_logs']
    if logs:
        # Print last 3 logs
        print("Last logs:", logs[-3:] if len(logs) > 3 else logs)
    else:
        print("No logs.")
