from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import re

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        # Password complexity: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
        if not self.is_password_complex(password):
            raise ValueError(
                "Password must be at least 8 characters long and include an uppercase letter, "
                "a lowercase letter, a digit, and a special character."
            )
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def is_password_complex(password):
        if (len(password) < 8 or
            not re.search(r'[A-Z]', password) or
            not re.search(r'[a-z]', password) or
            not re.search(r'\d', password) or
            not re.search(r'[^\w\s]', password)):
            return False
        return True

    def __repr__(self):
        return f'<User {self.username}>'
