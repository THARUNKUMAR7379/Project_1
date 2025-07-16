#!/usr/bin/env bash
set -e

# Use pip cache for faster builds
export PIP_CACHE_DIR=".pip_cache"
mkdir -p $PIP_CACHE_DIR

# Upgrade pip and install wheel
pip install --upgrade pip wheel

# Pre-build wheels for all dependencies
pip wheel --wheel-dir=.wheels -r requirements.txt

# Install from wheels
pip install --find-links=.wheels --cache-dir=$PIP_CACHE_DIR -r requirements.txt

echo "🚀 Starting build process..."

# Set up database
# For dev: create tables; for prod: run migrations if needed
python -c "
from main import app, db
with app.app_context():
    try:
        db.create_all()
        print('✅ Database tables created successfully!')
    except Exception as e:
        print(f'❌ Database setup failed: {e}')
"

echo "✅ Build completed successfully!" 