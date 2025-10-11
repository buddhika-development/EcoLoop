from src.prompt_template.educator_chat_prompt_template import prepare_educator_chat_prompt_template
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from src.configs.gemini_connection import get_gemini_connection

class EducatorChatResponse(BaseModel):
    content: str = Field(..., description="The response content from the educator chat.")

GEMINI_CONNECTION = get_gemini_connection()

def generate_educator_chat_response(user_question: str) -> EducatorChatResponse:

    # generate prompt
    educator_chat_response_parser = PydanticOutputParser(pydantic_object=EducatorChatResponse)
    prompt_template = prepare_educator_chat_prompt_template(educator_chat_response_parser)
    prompt = prompt_template.invoke({"question": user_question})

    reseponse = GEMINI_CONNECTION.invoke(prompt)
    return reseponse.content

    
    