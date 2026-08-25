FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

RUN addgroup --system roadcue && adduser --system --ingroup roadcue roadcue
COPY vico/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --requirement requirements.txt

COPY vico/app ./app
COPY vico/pytest.ini ./pytest.ini

USER roadcue
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
