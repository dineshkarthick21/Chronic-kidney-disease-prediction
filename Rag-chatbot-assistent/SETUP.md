# Quick Setup Guide - AI Chat Assistant

Follow these steps to get the AI Chat Assistant running:

## Step 1: Install Backend Dependencies

```bash
cd Rag-chatbot-assistent/backend
pip install -r requirements.txt
```

## Step 2: Configure Google Gemini API

1. Get your Google Gemini API key from: https://makersuite.google.com/app/apikey
2. Create `.env` file in the backend folder:

```bash
cd Rag-chatbot-assistent/backend
copy .env.example .env
```

3. Edit `.env` and add your key:
```
GOOGLE_API_KEY=your_actual_api_key_here
```

## Step 3: Create Vector Database

```bash
cd Rag-chatbot-assistent/backend
python ingest.py
```

You should see:
```
🚀 Starting CKD Knowledge Base Ingestion...
📄 Loading CKD knowledge base from data.txt...
✅ Loaded 1 document(s)
✂️  Splitting documents into chunks...
✅ Created X text chunks
🧠 Creating embeddings using Google Gemini...
💾 Creating FAISS vector database...
💾 Saving vector database to disk...
✅ Vector database created successfully!
```

## Step 4: Start the Backend Server

```bash
cd Rag-chatbot-assistent/backend
uvicorn main:app --reload --port 8001
```

Backend will run on: http://localhost:8001

Test it: Open http://localhost:8001 in browser
You should see: `{"status":"ok","message":"CKD Prediction RAG Assistant API is running 🚀","version":"1.0.0"}`

## Step 5: Start the Frontend (if not already running)

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## Step 6: Use the AI Chat Assistant

1. Open http://localhost:5173 in your browser
2. Sign in with your student account
3. Look for the "More" dropdown in the header
4. Click "AI Chat Assistant"
5. Start chatting! 🤖

## Common Issues

### Issue: "GOOGLE_API_KEY not found"
**Solution**: Make sure you created the `.env` file with your API key

### Issue: "vector_db not found"
**Solution**: Run `python ingest.py` to create the database

### Issue: "Cannot connect to backend"
**Solution**: Make sure backend is running on port 8001

### Issue: "Module not found"
**Solution**: Run `pip install -r requirements.txt`

## Quick Test

1. Open the chat assistant
2. Try the suggestion: "What is Chronic Kidney Disease?"
3. You should get a detailed response about CKD

## Need Help?

- Check the main README.md for detailed documentation
- Check backend logs for errors
- Check browser console for frontend errors

---

Happy chatting with AI! 🎉
