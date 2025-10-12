from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from flask import Blueprint, jsonify, request
from src.database.post_actions import fetch_post_by_user_id, get_all_posts, post_search, access_single_post_by_id, create_new_post, like_post, check_already_liked, unlike_post
from src.utils.is_authenticated import is_authenticated
from src.ai_actinons.post_validation_response_generator import post_validation_response_generator
from src.utils.s3_connection import s3_client, store_post_image

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
    # auth
    authorization_token = request.headers.get('Authorization')
    if not is_authenticated(authorization_token):
        return jsonify({"error": "Unauthorized"}), 401

    title = None
    content = None
    image_file = None

    if request.content_type and 'multipart/form-data' in request.content_type:
        # form-data with file
        title = request.form.get('post_title')
        content = request.form.get('post_content')
        author = request.form.get('post_author')
        image_file = request.files.get('post_image')  # optional

    elif request.content_type and 'application/x-www-form-urlencoded' in request.content_type:
        title = request.form.get('post_title')
        content = request.form.get('post_content')
    else:
        body = request.get_json(silent=True) or {}
        title = body.get('post_title')
        content = body.get('post_content')


    if not title or not content:
        return jsonify({"message": "Missing required post params."}), 400
    
    post_validation = post_validation_response_generator(
        post_title=title, post_content=content
    )

    if post_validation.status == "REJECTED":
        return jsonify({
            "message": "Something went wrong content includes",
            "error": "Content can't be publish under the concenrs related to ethics.",
            "reason": post_validation.reason
        }), 400

    
    stored_image_path = store_post_image(image_file) if image_file else None
    
    if image_file and not stored_image_path:
        return jsonify({"message": "Failed to upload image."}), 500
    
    post_details = create_new_post(
        post_title=title, 
        post_content=content, 
        image_path=stored_image_path,
        post_author=author
    )
    
    # validate
    # post_validation = post_validation_response_generator(
    #     post_title=title, post_content=content
    # )

    # persist your post here, include image_path if saved
    return jsonify({
        "message": "Successfully created post",
        "post": post_details
    }), 200



@post_router.route('/search', methods=['GET'])
def search_posts():

    search_query = request.args.get('search')

    if not search_query:
        return jsonify({
            "message" : "Missing required search params."
        }), 400
    
    search_post_results = post_search(search_query)
    print(search_post_results)
    
    if not search_post_results:
        return jsonify({
            "message": "No posts found matching the search criteria.",
            "posts": []
        }), 404
    
    return jsonify({
        "message": "Successfully fetched search results.",
        "posts" : search_post_results
    }), 200


@post_router.route('/post/<string:id>', methods=['GET'])
def access_single_post(id):

    post = access_single_post_by_id(id)

    if not post:
        return jsonify({"message": "Post not found"}), 404

    return jsonify({
        "post": post,
        "message": "Post retrieval successful"
    }), 200



@post_router.route('/like/<string:post_id>', methods=['POST'])
def like_posts(post_id):

    request_body = request.get_json() or {}
    user_id = request_body.get('user_id')

    result = like_post(post_id, user_id)
    return result


@post_router.route('/unlike/<string:post_id>', methods=['POST'])
def unlike_posts(post_id):

    request_body = request.get_json() or {}
    user_id = request_body.get('user_id')

    result = unlike_post(post_id, user_id)
    return result


@post_router.route('/is_liked/<string:post_id>', methods=['POST'])
def is_post_liked(post_id):

    request_body = request.get_json() or {}
    user_id = request_body.get('user_id')

    is_liked = check_already_liked(post_id, user_id)

    if is_liked :
        return {
            "message": "Already liked.",
            "is_liked": is_liked
        }, 200
    
    return {
        "message": "Not like already.",
        "is_liked": is_liked
    }, 400



@post_router.route('/author/<string:author_id>', methods=['GET'])
def get_posts_by_author(author_id):

    posts = fetch_post_by_user_id(author_id)

    if not posts:
        return jsonify({"message": "No posts found for this author."}), 404

    return jsonify({
        "posts": posts,
        "message": "Posts retrieved successfully."
    }), 200