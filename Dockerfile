# syntax=docker/dockerfile:1.5
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# Install system dependencies required for common optional extras
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl git \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY tornado_ai ./tornado_ai

RUN pip install --upgrade pip \
    && pip install .

EXPOSE 8000

CMD ["uvicorn", "tornado_ai.server:app", "--host", "0.0.0.0", "--port", "8000"]
