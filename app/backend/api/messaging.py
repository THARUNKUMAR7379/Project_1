from flask import Blueprint
from app.backend.extensions import db

messaging_bp = Blueprint('messaging', __name__)
 
# Routes will be implemented here 