from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv
from extensions import db  # FIX: import db from extensions, not models
import os

# Load environment variables
load_dotenv()

# Import models
from models.user import User  # Only import User, not db
from models.profile import Profile, Skill, Experience, Education  # Only import models, not db

# Create Flask app
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'super-secret')

from flask_cors import CORS
# Enable CORS for all /api/* routes from localhost and Render with credentials, headers, and methods
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://prok-frontend-e44d.onrender.com"
    ]}},
    supports_credentials=True,
    allow_headers="*",
    methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"]
)

# Initialize extensions
jwt = JWTManager(app)

# Initialize database
db.init_app(app)

# Register blueprints
from api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(messaging_bp)


# Add a simple test route
@app.route('/')
def home():
    return jsonify({'message': 'Server is running!', 'status': 'ok'})

# Add a global OPTIONS handler for /api/* routes (for CORS preflight)
@app.route('/api/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return '', 204

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 