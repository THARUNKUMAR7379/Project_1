from flask import Blueprint

def register_routes(app):
    from api.auth import auth_bp
    app.register_blueprint(auth_bp)
