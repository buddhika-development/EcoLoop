from src.prompt_template.post_validator_prompt_template import prepare_post_validator_prompt_template
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from src.configs.gemini_connection import get_gemini_connection

GEMINI_CONNECTION = get_gemini_connection()

class PostValidationResponse(BaseModel):
    is_valid: bool = Field(..., description="Indicates if the post content is valid. Contents are eco-friendly and non-harmful.")
    feedback: str = Field(..., description="Feedback on the post content. If invalid, provide reasons and suggestions for improvement. Straightforward and concise with small message.")

def post_validation_response_generator(post_content: str, post_title : str) -> PostValidationResponse:

    try:
        post_validation_response_parser = PydanticOutputParser(pydantic_object=PostValidationResponse)
        prompt_template = prepare_post_validator_prompt_template(post_validation_response_parser)
        prompt = prompt_template.invoke({
            "content": post_content,
            "title": post_title
        })

        response = GEMINI_CONNECTION.invoke(prompt)

        print(response)
        return None
    except Exception as e:
        print(f"Error preparing prompt: {e}")
        return None