# Backend PupiGo: Django + DRF servido con Gunicorn.
# Contexto de build: raiz del repositorio (requirements.txt vive ahi).
#   docker build -f backend/Dockerfile -t pupigo-backend .
FROM python:3.13-slim
LABEL org.opencontainers.image.version="2.0.0"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_DEBUG=0 \
    DJANGO_DB_PATH=/app/data/db.sqlite3 \
    DJANGO_STATIC_ROOT=/app/staticfiles

WORKDIR /app

# Dependencias primero para aprovechar la cache de capas.
# tzdata (pip) garantiza la zona America/Bogota aunque la imagen no traiga /usr/share/zoneinfo.
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt gunicorn==26.2.0 tzdata

COPY backend/ /app/

# Usuario sin privilegios; data/ (SQLite) y staticfiles/ se montan como volumenes.
RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/data /app/staticfiles \
    && chown -R app:app /app
USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/', timeout=4).status == 200 else 1)"

# Al arrancar: DJANGO_SECRET_KEY aleatoria si llega vacia, migraciones, datos base y usuarios demo (idempotentes), estaticos del admin y Gunicorn.
CMD ["sh", "-c", "export DJANGO_SECRET_KEY=\"${DJANGO_SECRET_KEY:-$(python -c 'import secrets;print(secrets.token_urlsafe(50))')}\" && python manage.py migrate --noinput && python manage.py seed && python manage.py seed_users && python manage.py collectstatic --noinput && exec gunicorn pupigo.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4 --timeout 30 --access-logfile -"]
