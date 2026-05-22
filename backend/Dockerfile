# 1. Python lightweight image
FROM python:3.11-slim

# 2. System dependencies for rembg & onnxruntime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 3. Container ke andar working directory
WORKDIR /app

# 4. Requirements file copy karenge (Pehle ensure karein requirements.txt backend folder mein ho)
COPY requirements.txt .

# 5. Dependencies install karenge
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "rembg[cpu]"

# 6. Backend ka saara code copy karenge
COPY . .

# 7. Cloud Run ke liye Port 8080 expose karenge
EXPOSE 8080

# 8. FastAPI app ko run karenge (Kyunki main.py direct root par hai, toh "main:app" likhenge)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]