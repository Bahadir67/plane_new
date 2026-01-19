#!/usr/bin/env sh
set -e

python manage.py migrate

exec python manage.py runserver 0.0.0.0:${PORT:-8000}
