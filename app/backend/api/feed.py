from flask import Blueprint
from app.backend.models.post import Post
from app.backend.models.user import User
from app.backend.extensions import db

feed_bp = Blueprint('feed', __name__)
 
# Routes will be implemented here 