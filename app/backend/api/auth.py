from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from extensions import db
import datetime
from flask_cors import CORS

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Ensure CORS for this blueprint (if not already applied globally)
CORS(auth_bp, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"], supports_credentials=True)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email and password required'}), 400
    # Dummy user check for demonstration; replace with real DB lookup in production
    if email == "user@example.com":
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    if username == "user":
        return jsonify({'success': False, 'message': 'Username already taken'}), 400
    # Simulate user creation
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'user': {
            'id': 1,
            'email': email,
            'username': username
        },
        'token': 'dummy-jwt-token'
    }), 201
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        print(f"[Backend] Login request received: {request.get_json()}")
    data = request.get_json()
    identifier = data.get('identifier') or data.get('username') or data.get('email')
    password = data.get('password')
        
        print(f"[Backend] Processing login for identifier: {identifier}")
        
    if not identifier or not password:
        return jsonify(success=False, message='Username/Email and password required'), 400
        
    # Demo: allow login with username 'tharun' and password 'Tharun@1'
    if (identifier == 'tharun' or identifier == 'tharun@email.com') and password == 'Tharun@1':
            print(f"[Backend] Login successful for user: {identifier}")
            # Create a proper JWT token
            token = create_access_token(identity=1)  # Use user ID 1
            return jsonify(success=True, token=token, user={
            'id': 1,
            'username': 'tharun',
            'email': 'tharun@email.com'
        }), 200
        
        print(f"[Backend] Login failed for user: {identifier}")
    return jsonify(success=False, message='Invalid credentials'), 401
    except Exception as e:
        print(f"[Backend] Login error: {e}")
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
        
    token = create_access_token(identity=data['email'], expires_delta=datetime.timedelta(days=1))
        return jsonify(success=True, token=token, user={'email': data['email'], 'name': data.get('name', '')})
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify(success=False, error='Internal server error'), 500 