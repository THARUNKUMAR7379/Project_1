from extensions import db

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    avatar = db.Column(db.String(256), default=None)
    title = db.Column(db.String(120), default='')
    bio = db.Column(db.Text, default='')
    location = db.Column(db.String(120), default='')
    address = db.Column(db.String(200), default='')  # New address field
    skills = db.Column(db.JSON, default=list)  # List of skill names or dicts
    socials = db.Column(db.JSON, default=dict) # Dict of social links
    name = db.Column(db.String(100), default='')
    # Relationships
    experiences = db.relationship('Experience', backref='profile', cascade='all, delete-orphan')
    education = db.relationship('Education', backref='profile', cascade='all, delete-orphan')

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)

class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text)

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    school = db.Column(db.String(120))
    degree = db.Column(db.String(120))
    field = db.Column(db.String(120))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
