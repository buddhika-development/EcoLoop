from flask import Blueprint, jsonify, request
from src.configs.gemini_connection import get_gemini_connection
from src.utils.is_authenticated import is_authenticated
from src.ai_actinons.educator_chat_response_generator import generate_educator_chat_response
import datetime

educator_chat_router = Blueprint('educator_chat', __name__)
GEMINI = get_gemini_connection()

@educator_chat_router.route("/", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def educator_chat():
    return jsonify({"message": "Educator Chat Endpoint is Healthy"}), 200


@educator_chat_router.route("/chat", methods=["POST"])
def educator_chat_post():
    """
    Example POST endpoint to interact with the Gemini model.
    """ 

    request_body = request.get_json()
    request_header = request.headers.get("Authorization")

    is_autorized_request = is_authenticated(request_header)
    
    if not is_autorized_request:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        question = request_body.get("question", "")
        gemini_response = generate_educator_chat_response(question)
        print(gemini_response)

        return jsonify({
            "response" : gemini_response,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500