from datetime import datetime
from extensions import db

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(512), nullable=True)
    media_type = db.Column(db.String(32), nullable=True)  # e.g., 'image', 'video'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
