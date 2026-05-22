# Deliberately insecure lab app — see app.py. Not for production use.
FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir flask requests
COPY app.py .

EXPOSE 8501
CMD ["python", "app.py"]
