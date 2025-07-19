from flask import Blueprint
from app.backend.extensions import db

jobs_bp = Blueprint('jobs', __name__)
 
# Routes will be implemented here 