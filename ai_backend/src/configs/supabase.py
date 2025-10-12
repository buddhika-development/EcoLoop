from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def suapabase_connection() -> Client:

    try:

        if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"):
            raise ValueError("Supabase URL or Anon Key is not set in environment variables.")
        
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )
        logging.info("Supabase connection established successfully.")
        return supabase
    
    except ValueError as ve:
        logging.error(f"ValueError: {ve}")
        return None
    
    except Exception as e:
        logging.error(f"Error establishing Supabase connection: {e}")
        return None
