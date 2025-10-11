import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from flask import current_app as app
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_gemini_connection() -> ChatGoogleGenerativeAI:
    
    try:
        gemini_connection = ChatGoogleGenerativeAI(
            api_key= os.getenv("GOOGLE_API_KEY"),
            model= os.getenv("GOOGLE_GEMINI_MODEL"),
            temperature=0.6
        )

        logger.info("Gemini connection established successfully.")
        return gemini_connection
    
    
    except ConnectionError as ce:
        logger.error(f"Connection error: {ce}")
        return None
    
    except Exception as e:
        logger.error(f"Error establishing Gemini connection: {e}")
        return None