from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.post import Post
from models.user import User
from extensions import db
import os
import uuid
from datetime import datetime

posts_bp = Blueprint('posts', __name__, url_prefix='/api')

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'webm'}
MAX_MEDIA_SIZE_MB = 10
UPLOAD_FOLDER = 'static/uploads/posts/'

# Helper: allowed file

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_IMAGE_EXTENSIONS or ext in ALLOWED_VIDEO_EXTENSIONS

def get_media_type(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return 'image'
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return 'video'
    return None

@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(success=False, message='User not found'), 404

    content = request.form.get('content', '').strip()
    file = request.files.get('media')

    # Validate content or media
    if not content and not file:
        return jsonify(success=False, message='Post must have text or media.'), 400

    media_url = None
    media_type = None
    if file:
        if not allowed_file(file.filename):
            return jsonify(success=False, message='Invalid media type.'), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_MEDIA_SIZE_MB * 1024 * 1024:
            return jsonify(success=False, message='File too large. Max 10MB.'), 400
        ext = file.filename.rsplit('.', 1)[1].lower()
        media_type = get_media_type(file.filename)
        unique_id = str(uuid.uuid4())
        filename = f'post_{user_id}_{unique_id}.{ext}'
        upload_dir = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        media_url = f'/static/uploads/posts/{filename}'

    post = Post(
        user_id=user_id,
        content=content,
        media_url=media_url,
        media_type=media_type,
        created_at=datetime.utcnow()
    )
    db.session.add(post)
    db.session.commit()

    return jsonify(success=True, post={
        'id': post.id,
        'user_id': post.user_id,
        'content': post.content,
        'media_url': post.media_url,
        'media_type': post.media_type,
        'created_at': post.created_at.isoformat()
    }), 201 

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        print('[GET /api/posts] Fetching posts...')
        posts = Post.query.order_by(Post.created_at.desc()).all()
        posts_data = [
            {
                'id': post.id,
                'user_id': post.user_id,
                'content': post.content,
                'media_url': post.media_url,
                'media_type': post.media_type,
                'created_at': post.created_at.isoformat() if post.created_at else None
            }
            for post in posts
        ]
        print(f'[GET /api/posts] Returned {len(posts_data)} posts')
        return jsonify(success=True, posts=posts_data), 200
    except Exception as e:
        print(f'[GET /api/posts] Error: {e}')
        return jsonify(success=False, message='Failed to fetch posts.'), 500 