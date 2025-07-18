import os
from datetime import timedelta
import secrets

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_urlsafe(32))

    # Database - Only use PostgreSQL in production
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
<<<<<<< HEAD
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
=======
    # Use SQLite for local development if DATABASE_URL is not set
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'sqlite:///local.db'
>>>>>>> fix-e22b509-stabilize
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or secrets.token_urlsafe(48)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # CORS
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'https://prok-frontend-e44d.onrender.com').split(',') 