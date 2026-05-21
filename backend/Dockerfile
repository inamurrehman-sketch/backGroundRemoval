FROM python:3.11-slim

# System dependencies for rembg (onnx, opencv etc.)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Expose port
ENV PORT=8080
EXPOSE 8080

# Shell form so $PORT gets expanded at runtime
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
