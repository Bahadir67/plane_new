#!/usr/bin/env sh
set -e

python manage.py wait_for_migrations

exec gunicorn plane.asgi:application \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers ${GUNICORN_WORKERS:-2}
