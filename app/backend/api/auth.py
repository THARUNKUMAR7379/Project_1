from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User, db
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

DUMMY_USER = {
    'email': 'john.doe@email.com',
    'password': 'password123',
    'name': 'John Doe',
}

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email and password required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    
    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({'success': False, 'message': 'Username already taken'}), 400
    
    # Create new user with hashed password
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Generate JWT token
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'success': True, 
            'message': 'User registered successfully',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'username': new_user.username
            },
            'token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if data['email'] == DUMMY_USER['email'] and data['password'] == DUMMY_USER['password']:
        token = create_access_token(identity=DUMMY_USER['email'], expires_delta=datetime.timedelta(days=1))
        return jsonify(success=True, token=token, user=DUMMY_USER)
    return jsonify(success=False, error='Invalid credentials'), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
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

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
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

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    # In production, save user to DB and hash password
    if data['email'] == DUMMY_USER['email']:
        return jsonify(success=False, error='User already exists'), 400
    token = create_access_token(identity=data['email'], expires_delta=datetime.timedelta(days=1))
    return jsonify(success=True, token=token, user={'email': data['email'], 'name': data['name']})

# Routes will be implemented here 