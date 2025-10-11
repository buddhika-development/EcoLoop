from flask import Blueprint, jsonify, request

rag_service_router = Blueprint('rag_service', __name__)

@rag_service_router.route("/", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def rag_service():
    return jsonify({"message": "RAG Service Endpoint is Healthy"}), 200
