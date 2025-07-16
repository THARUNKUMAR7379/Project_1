import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    
    # Database - Support both MySQL (dev) and PostgreSQL (prod)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    # Fallback to MySQL local if DATABASE_URL is not set
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'mysql://root:Tharun%40123@localhost/prok_db?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # CORS
    CORS_HEADERS = 'Content-Type' 