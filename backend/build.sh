#!/usr/bin/env bash
# Render build script

set -o errexit

# Install setuptools first to provide pkg_resources
pip install --upgrade pip setuptools wheel

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
