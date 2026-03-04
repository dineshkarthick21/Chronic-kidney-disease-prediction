# CKD Prediction AI Chat Assistant - Backend

The backend RAG (Retrieval Augmented Generation) system for the CKD Prediction AI Chat Assistant.

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

3. **Create Vector Database:**
   ```bash
   python ingest.py
   ```
   This will process `data.txt` and create the FAISS vector database in the `vector_db/` folder.

4. **Run the API Server:**
   ```bash
   uvicorn main:app --reload --port 8001
   ```
   
   The API will be available at `http://localhost:8001`

## API Endpoints

### GET `/`
Health check endpoint
```json
{
  "status": "ok",
  "message": "CKD Prediction RAG Assistant API is running 🚀",
  "version": "1.0.0"
}
```

### POST `/ask`
Ask a question about CKD or the prediction system
```json
// Request
{
  "question": "What is chronic kidney disease?"
}

// Response
{
  "answer": "Chronic Kidney Disease (CKD) is..."
}
```

## Tech Stack

- **FastAPI**: Modern Python web framework
- **LangChain**: Framework for LLM applications
- **FAISS**: Vector similarity search
- **Google Gemini 2.0 Flash**: Large Language Model
- **Python 3.13**: Programming language
