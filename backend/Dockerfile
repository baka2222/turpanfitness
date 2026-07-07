# Django admin panel (Jazzmin + CKEditor). Owns the shared DB schema.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# migrate/collectstatic/superuser run in the one-shot "migrate" service (compose).
# This service just serves the admin via gunicorn.
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
