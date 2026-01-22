import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from project root
import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
service_role_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY not found in environment variables. Please check your .env file.")

# Standard client (with anon key) for regular operations
supabase: Client = create_client(url, key)

# Admin client (with service_role key) for auth operations - only used in seed.py
admin_supabase: Client = None
if service_role_key:
    admin_supabase = create_client(url, service_role_key)

def get_supabase_client() -> Client:
    return supabase

def get_admin_client() -> Client:
    """Returns admin client for auth operations. Requires SUPABASE_SERVICE_ROLE_KEY in .env"""
    if not admin_supabase:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY not found. Required for creating auth users.")
    return admin_supabase
