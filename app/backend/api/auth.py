from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from extensions import db
import datetime
import traceback

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# CORS is handled globally in main.py for Render compatibility

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json(force=False, silent=True)
        if not data or not isinstance(data, dict):
            print("[SIGNUP ERROR] No JSON body received or invalid JSON")
            return jsonify({'success': False, 'message': 'Invalid or missing JSON payload'}), 400
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if not username or not email or not password:
            print(f"[SIGNUP ERROR] Missing fields: username={username}, email={email}, password={'***' if password else None}")
            return jsonify({'success': False, 'message': 'Username, email and password required'}), 400
        if not isinstance(username, str) or not isinstance(email, str) or not isinstance(password, str):
            print(f"[SIGNUP ERROR] Invalid types: username={type(username)}, email={type(email)}, password={type(password)}")
            return jsonify({'success': False, 'message': 'Invalid input types'}), 400
        if User.query.filter_by(email=email).first():
            print(f"[SIGNUP ERROR] Email already registered: {email}")
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        if User.query.filter_by(username=username).first():
            print(f"[SIGNUP ERROR] Username already taken: {username}")
            return jsonify({'success': False, 'message': 'Username already taken'}), 400
        if not User.is_password_complex(password):
            print("[SIGNUP ERROR] Password not complex enough")
            return jsonify({'success': False, 'message': 'Password must be at least 8 chars, with upper, lower, digit.'}), 400
        user = User(username=username, email=email)
        user.set_password(password)
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as db_exc:
            db.session.rollback()
            print(f"[SIGNUP ERROR] DB Exception: {db_exc}")
            traceback.print_exc()
            return jsonify({'success': False, 'message': 'Database error'}), 500
        token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            },
            'token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"[SIGNUP ERROR] Exception: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['OPTIONS'])
def login_options():
    from flask import make_response, request
    response = make_response()
    # Use the correct allowed origin for credentials
    allowed_origin = 'https://prok-frontend-e44d.onrender.com'
    # Optionally, allow localhost for dev
    if request.headers.get('Origin') in ['http://localhost:5173', 'http://127.0.0.1:5173', allowed_origin]:
        response.headers['Access-Control-Allow-Origin'] = request.headers['Origin']
    else:
        response.headers['Access-Control-Allow-Origin'] = allowed_origin
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json(silent=True)
        if not data:
            print("[LOGIN ERROR] No JSON body received")
            return jsonify(success=False, message='Invalid or missing JSON payload'), 400
        print(f"[LOGIN DEBUG] Received data: {data}")
        identifier = data.get('identifier') or data.get('username') or data.get('email')
        password = data.get('password')
        print(f"[LOGIN DEBUG] identifier: {identifier}, password: {'***' if password else None}")
        if not identifier or not password:
            print("[LOGIN ERROR] Missing identifier or password")
            return jsonify(success=False, message='Username/Email and password required'), 400
        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
        if not user:
            print(f"[LOGIN ERROR] User not found for identifier: {identifier}")
        elif not user.check_password(password):
            print(f"[LOGIN ERROR] Invalid password for user: {identifier}")
        if not user or not user.check_password(password):
            return jsonify(success=False, message='Invalid credentials'), 401
        token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        print(f"[LOGIN SUCCESS] User {user.id} logged in")
        return jsonify(success=True, token=token, user={
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
    except Exception as e:
        print(f"[LOGIN ERROR] Exception: {e}")
        traceback.print_exc()
        return jsonify(success=False, message='Internal server error'), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        })
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({'success': True, 'message': 'If the email exists, a reset link has been sent'}), 200

        # TODO: Implement actual password reset logic
        # For now, just return success
        # In production, you would:
        # 1. Generate a secure reset token
        # 2. Store it in database with expiration
        # 3. Send email with reset link
        # 4. Log the reset attempt

        return jsonify({
            'success': True,
            'message': 'If the email exists, a reset link has been sent'
        })
    except Exception as e:
        print(f"Forgot password error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        # In production, save user to DB and hash password
        # For now, just return success for any valid email
        if not data or not data.get('email'):
            return jsonify(success=False, error='Email is required'), 400

        token = create_access_token(identity=str(data['email']), expires_delta=datetime.timedelta(days=1))
        return jsonify(success=True, token=token, user={'email': data['email'], 'name': data.get('name', '')})
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify(success=False, error='Internal server error'), 500 