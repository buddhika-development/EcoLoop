from dotenv import load_dotenv
import os

load_dotenv()

def is_authenticated(bearer_token : str) -> bool:
    
    VALID_TOKEN = os.getenv("HEADER_AUTHORIZATION")
    VALID_BEARER_KEY = f"Bearer {VALID_TOKEN}"

    if bearer_token == VALID_BEARER_KEY:
        return True
    
    return False

