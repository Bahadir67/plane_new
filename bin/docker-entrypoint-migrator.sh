#!/usr/bin/env sh
set -e

python manage.py migrate
python manage.py collectstatic --noinput
