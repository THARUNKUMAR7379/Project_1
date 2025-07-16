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

# Always run Alembic migrations to ensure DB schema is up to date
flask db upgrade

echo "✅ Database migrations applied!"

echo "✅ Build completed successfully!" 