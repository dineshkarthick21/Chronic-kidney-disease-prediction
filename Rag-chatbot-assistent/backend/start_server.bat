@echo off
cd /d "C:\Users\ezhil\Videos\Projects\CKD-Prediction\Rag-chatbot-assistent\backend"
c:\Users\ezhil\Videos\Projects\CKD-Prediction\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8001
pause
