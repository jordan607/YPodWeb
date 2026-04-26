FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY . .
# Replace 'app.py' with your entry point and ensure it listens on 0.0.0.0
CMD ["python", "app.py"] 