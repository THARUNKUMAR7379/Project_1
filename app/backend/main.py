from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db
import os

# Only load dotenv in local development
if os.environ.get('FLASK_ENV') != 'production':
    from dotenv import load_dotenv
    load_dotenv()

# Create Flask app
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

# Enable CORS for allowed origins
CORS(app,
     origins=Config.CORS_ORIGINS,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=True,
     max_age=3600)

# Initialize extensions
jwt = JWTManager(app)
db.init_app(app)

# Register blueprints
from api import auth_bp, profile_bp, posts_bp, feed_bp, jobs_bp, messaging_bp
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(feed_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(messaging_bp)

@app.route('/')
def home():
    return jsonify({'message': 'Server is running!', 'status': 'ok'})

@app.route('/health')
def health():
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"[HEALTH ERROR] {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/api/health')
def api_health():
    try:
        db.session.execute('SELECT 1')
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"[API HEALTH ERROR] {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

def setup_database():
    """Setup database tables"""
    with app.app_context():
        try:
            db.create_all()
            print(" 705 Database tables created successfully!")
        except Exception as e:
            print(f" 74c Database setup failed: {e}")
            import traceback; traceback.print_exc()

def create_app():
    return app

if __name__ == '__main__':
    setup_database()
    print(' f680 Flask app has started and is ready to serve requests.')
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 