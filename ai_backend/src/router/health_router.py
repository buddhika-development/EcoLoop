from flask import Blueprint, jsonify

health_router = Blueprint('health', __name__)

@health_router.route("/", methods = ["GET", "POST", "PUT", "PATCH", "DELETE"])
def health():
    return jsonify({"message": "API is running"}), 200

@health_router.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200