#!/usr/bin/env sh
set -e

python manage.py wait_for_migrations

exec celery -A plane beat -l info
