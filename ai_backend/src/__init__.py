
from flask import Flask


def create_app(config):

    app = Flask(__name__)
    app.config.from_object(config)

    from src.router.health_router import health_router
    from src.router.educator_chat_router import educator_chat_router
    from src.router.rag_service_router import rag_service_router

    # configure the routes
    app.register_blueprint(health_router, url_prefix='/')
    app.register_blueprint(educator_chat_router, url_prefix='/api/educator_chat')
    app.register_blueprint(rag_service_router, url_prefix='/api/rag_service')


    return app