from typing import Optional

from src.prompt_template.post_validator_prompt_template import prepare_post_validator_prompt_template
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from src.configs.gemini_connection import get_gemini_connection

GEMINI_CONNECTION = get_gemini_connection()


class PostValidationResponse(BaseModel):
    status: str = Field(..., description="Either 'APPROVED' or 'REJECTED'.")
    reason: str = Field(..., description="A concise reason explaining the decision.")


def post_validation_response_generator(post_content: str, post_title: str) -> Optional[PostValidationResponse]:
    """Generate a validation response for a post using the configured LLM connection.

    Returns the parsed PostValidationResponse on success, otherwise None.
    """
    try:
        post_validation_response_parser = PydanticOutputParser(pydantic_object=PostValidationResponse)
        prompt_template = prepare_post_validator_prompt_template(post_validation_response_parser)

        prompt_text = prompt_template.format(title=post_title, content=post_content)
        raw_response = GEMINI_CONNECTION.invoke(prompt_text)
        response_text = getattr(raw_response, 'content', raw_response)
        parsed = post_validation_response_parser.parse(response_text)

        return parsed
    except Exception as e:
        print(f"Error preparing prompt: {e}")
        return None