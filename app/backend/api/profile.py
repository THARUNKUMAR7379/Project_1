from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import os
import datetime

profile_bp = Blueprint('profile', __name__)

PROFILE_DATA = {
    'name': 'John Doe',
    'location': 'San Francisco, CA',
    'bio': 'Full Stack Developer passionate about building beautiful web apps.',
    'skills': [
        {'name': 'React', 'endorsements': 5},
        {'name': 'Flask', 'endorsements': 3},
        {'name': 'TailwindCSS', 'endorsements': 4},
    ],
    'education': 'B.Sc. Computer Science',
    'languages': ['English', 'Spanish'],
    'contact': 'john.doe@email.com',
    'photo': '/static/uploads/profile.jpg',
    'activity': []
}

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    return jsonify(success=True, profile=PROFILE_DATA)

@profile_bp.route('/profile', methods=['PATCH'])
def update_profile():
    data = request.json
    for key in data:
        PROFILE_DATA[key] = data[key]
    PROFILE_DATA['activity'].append({'action': 'edit', 'timestamp': datetime.datetime.utcnow().isoformat()})
    return jsonify(success=True, profile=PROFILE_DATA)

@profile_bp.route('/upload', methods=['POST'])
def upload_photo():
    if 'file' not in request.files:
        return jsonify(success=False, error='No file part'), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, error='No selected file'), 400
    filename = secure_filename(file.filename)
    upload_path = os.path.join(current_app.root_path, 'static', 'uploads', filename)
    file.save(upload_path)
    PROFILE_DATA['photo'] = f'/static/uploads/{filename}'
    PROFILE_DATA['activity'].append({'action': 'upload_photo', 'timestamp': datetime.datetime.utcnow().isoformat()})
    return jsonify(success=True, url=PROFILE_DATA['photo'])

@profile_bp.route('/profile/resume', methods=['GET'])
def download_resume():
    resume_path = os.path.join(current_app.root_path, 'static', 'resume', 'resume.pdf')
    if not os.path.exists(resume_path):
        # Generate a dummy PDF if not exists
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(resume_path)
        c.drawString(100, 750, 'John Doe Resume')
        c.save()
    return send_file(resume_path, as_attachment=True)

# Routes will be implemented here 