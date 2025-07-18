from flask import Flask, jsonify
from config import Config
from flask_cors import CORS
from extensions import db, migrate, jwt
from dotenv import load_dotenv  # python-dotenv correct import
import os

def create_app():
    load_dotenv()  # Ensure .env is loaded
    app = Flask(__name__)
    app.config.from_object(Config)
    # Restrict CORS to only allow the deployed frontend domain
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": Config.CORS_ORIGINS}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    with app.app_context():
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp)
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500
    return app

def get_app():
    return create_app() 