#!/bin/sh
# ---------------------------------------------------------------------------
# Runs every time the web container starts, before the web server itself.
#
#   1. wait until PostgreSQL is ready to accept connections
#   2. create or update the database tables (migrate)
#   3. collect the static files Django serves
#   4. optionally create the /admin/ login from the .env values
#   5. hand over to the command in the Dockerfile (gunicorn)
# ---------------------------------------------------------------------------
set -e

echo "waiting for PostgreSQL at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432} ..."
# Try to open a database connection once a second until it works.
until python -c "
import os, sys
import psycopg
try:
    psycopg.connect(
        host=os.environ.get('POSTGRES_HOST', 'db'),
        port=os.environ.get('POSTGRES_PORT', '5432'),
        dbname=os.environ.get('POSTGRES_DB', 'sudan_neighbouring_pop_movement'),
        user=os.environ.get('POSTGRES_USER', 'sudan'),
        password=os.environ.get('POSTGRES_PASSWORD', ''),
        connect_timeout=3,
    ).close()
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "applying database migrations ..."
python manage.py migrate --noinput

echo "collecting static files ..."
python manage.py collectstatic --noinput --clear >/dev/null

# Create the admin login only if a password was set in .env and no user exists.
if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('${DJANGO_SUPERUSER_USERNAME:-admin}',
                                  '${DJANGO_SUPERUSER_EMAIL:-admin@example.org}',
                                  '${DJANGO_SUPERUSER_PASSWORD}')
    print('created admin user: ${DJANGO_SUPERUSER_USERNAME:-admin}')
"
fi

echo "starting: $@"
exec "$@"
