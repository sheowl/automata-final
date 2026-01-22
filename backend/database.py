import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from project root
import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY not found in environment variables. Please check your .env file.")

supabase: Client = create_client(url, key)

def get_supabase_client() -> Client:
    return supabase
