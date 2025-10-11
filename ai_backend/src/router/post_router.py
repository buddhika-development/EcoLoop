from flask import Blueprint, jsonify, request
from src.database.post_actions import get_all_posts, post_search
from src.utils.is_authenticated import is_authenticated
from src.ai_actinons.post_validation_response_generator import post_validation_response_generator

post_router = Blueprint('post_router', __name__)

@post_router.route('/', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def post_router_health():    
    return jsonify({"message": "Post router is healthy"}), 200

@post_router.route('/all', methods=['GET'])
def access_all_posts():
    response = get_all_posts()
    status_code = 200 if response else 404
    return jsonify(response), status_code


@post_router.route('/create', methods=['POST'])
def create_post():

    authorization_token = request.headers.get('Authorization')
    is_authorized = is_authenticated(authorization_token)

    if not is_authorized:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"message": "Post creation endpoint - to be implemented"}), 200


@post_router.route('/search', methods=['GET'])
def search_posts():

    search_query = request.args.get('search')

    if not search_query:
        return jsonify({
            "message" : "Missing required search params."
        }), 400
    
    search_post_results = post_search(search_query)
    
    return jsonify({"message": "Post search endpoint - to be implemented"}), 200