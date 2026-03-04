# CKD Prediction AI Chat Assistant 🤖

An intelligent RAG (Retrieval Augmented Generation) chatbot integrated into the CKD Prediction system. Provides instant, accurate answers about Chronic Kidney Disease, symptoms, risk factors, and how the prediction system works.

## 🌟 Features

- **Intelligent Document Search**: Uses FAISS vector database for efficient semantic search
- **AI-Powered Responses**: Leverages Google Gemini 2.0 Flash for accurate, context-aware answers
- **Beautiful Chat Interface**: Modern React UI with dark/light theme support
- **Context-Aware Responses**: Retrieves relevant medical information before generating answers
- **Integrated into Dashboard**: Accessible via "More" menu in student dashboard
- **Real-time Chat**: Interactive conversation with typing indicators
- **Quick Suggestions**: Pre-defined questions for easy start
- **Clean Output**: Automatically removes markdown formatting

## 🏗️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **LangChain**: Framework for building LLM applications
- **FAISS**: Facebook AI Similarity Search for vector storage
- **Google Gemini 2.0 Flash**: Powerful LLM for text generation
- **Python 3.13**: Latest Python features

### Frontend
- **React 18**: Modern UI library
- **CSS3**: Custom styling with theme support
- **Fetch API**: For backend communication

## 📁 Project Structure

```
Rag-chatbot-assistent/
├── backend/
│   ├── data.txt              # CKD knowledge base
│   ├── ingest.py             # Script to create vector embeddings
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── README.md             # Backend documentation
│   └── vector_db/            # FAISS vector database (generated)
└── README.md                 # This file

frontend/src/components/
├── AIChatAssistant.jsx       # React chat component
└── AIChatAssistant.css       # Chat component styles
```

## 🚀 Getting Started

### Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher
- Google Gemini API key
- Existing CKD Prediction frontend running

### Installation

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd Rag-chatbot-assistent/backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env and add your Google Gemini API key
# GOOGLE_API_KEY=your_actual_api_key_here

# Create vector database from knowledge base
python ingest.py

# Start the FastAPI server
uvicorn main:app --reload --port 8001
```

Backend will run on `http://localhost:8001`

#### 2. Frontend Integration

The frontend components are already integrated into the CKD Prediction system:
- `AIChatAssistant.jsx` - Chat interface component
- `AIChatAssistant.css` - Styling
- Header component - Updated with "More" menu
- App.jsx - Integrated with chat overlay

**Note**: The frontend is already set up. Just ensure the CKD frontend is running:

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Running the Application

1. **Start the RAG backend** (Terminal 1):
   ```bash
   cd Rag-chatbot-assistent/backend
   uvicorn main:app --reload --port 8001
   ```

2. **Start the CKD frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Open browser: `http://localhost:5173`
   - Sign in to your student account
   - Click "More" → "AI Chat Assistant"

## 💡 Usage

### Accessing the AI Chat Assistant

1. Log in to your CKD Prediction student account
2. In the header, click on the **"More"** dropdown menu
3. Select **"AI Chat Assistant"**
4. The chat interface will open in full-screen overlay

### Asking Questions

**Quick Start Questions** (suggestions provided):
- "What is Chronic Kidney Disease?"
- "Explain the symptoms of CKD"
- "How does the prediction system work?"
- "What are the risk factors for CKD?"

**Or ask your own questions** about:
- CKD stages, symptoms, and progression
- Medical parameters and their meanings
- Using the prediction system
- Risk factors and prevention
- Treatment and management
- Understanding test results

### Theme Toggle

- Click the **☀️/🌙** button in the chat header
- Switch between dark and light themes
- Theme preference applies to the chat interface

### Closing the Chat

- Click the **✕** button in the top-right corner
- Returns to the main dashboard

## 📝 API Endpoints

### GET `/`
Health check endpoint
```json
{
  "status": "ok",
  "message": "CKD Prediction RAG Assistant API is running 🚀",
  "version": "1.0.0"
}
```

### GET `/health`
Detailed health check
```json
{
  "status": "healthy",
  "vectorstore": "loaded",
  "qa_chain": "initialized"
}
```

### POST `/ask`
Ask a question to the RAG system
```json
// Request
{
  "question": "What is chronic kidney disease?"
}

// Response
{
  "answer": "Chronic Kidney Disease (CKD) is a long-term condition..."
}
```

### POST `/chat`
Alternative chat endpoint with detailed response
```json
// Request
{
  "question": "What are the symptoms of CKD?"
}

// Response
{
  "question": "What are the symptoms of CKD?",
  "answer": "Symptoms include fatigue, swelling...",
  "status": "success"
}
```

## 🧠 Knowledge Base

The chatbot's knowledge base (`backend/data.txt`) includes comprehensive information about:

- **CKD Overview**: Definition, stages, and progression
- **Symptoms**: Early and late-stage symptoms
- **Risk Factors**: Diabetes, hypertension, family history, etc.
- **Medical Parameters**: 24+ clinical parameters explained
- **Prediction System**: How the AI model works
- **Treatment**: Medical treatments and lifestyle changes
- **Prevention**: Steps to reduce CKD risk
- **FAQ**: Common questions and answers

### Updating the Knowledge Base

1. Edit `backend/data.txt` with updated information
2. Run the ingestion script to update the vector database:
   ```bash
   python ingest.py
   ```
3. Restart the backend server

## 🎨 Customization

### Backend Configuration

Edit `backend/main.py` to customize:
- LLM model (currently using `gemini-2.0-flash-exp`)
- Vector search parameters (k=3 for retrieval)
- CORS settings (configured for localhost:5173)
- Temperature (set to 0 for consistent responses)
- Custom prompts

### Frontend Configuration

Edit `frontend/src/components/AIChatAssistant.jsx` to customize:
- API base URL (default: http://localhost:8001)
- Suggestion prompts
- Chat interface behavior
- Theme colors

Edit `frontend/src/components/AIChatAssistant.css` to customize:
- Color schemes
- Layout and spacing
- Animations and transitions

## 🐛 Troubleshooting

### Backend Issues

**Error: GOOGLE_API_KEY not found**
- Create `.env` file in backend directory
- Add your Gemini API key: `GOOGLE_API_KEY=your_key_here`

**Error: vector_db not found**
- Run `python ingest.py` to create the vector database

**Module not found errors**
- Run `pip install -r requirements.txt`

**Port 8001 already in use**
- Change port in `main.py`: `uvicorn.run(app, port=8002)`
- Update frontend API URL in `AIChatAssistant.jsx`

### Frontend Issues

**Cannot connect to backend**
- Ensure backend is running on port 8001
- Check CORS settings in `backend/main.py`
- Verify API URL in `AIChatAssistant.jsx`

**AI Chat Assistant not appearing**
- Check if you're logged in (not admin)
- Click "More" dropdown in header
- Check browser console for errors

**Theme not working**
- Ensure ThemeContext is properly set up
- Check CSS theme classes

## 📦 Dependencies

### Backend
- fastapi==0.115.0
- uvicorn==0.32.0
- langchain==0.3.7
- langchain-google-genai==2.0.4
- langchain-community==0.3.7
- langchain-text-splitters==0.3.2
- langchain-core==0.3.15
- faiss-cpu==1.9.0
- python-dotenv==1.0.1
- tiktoken==0.8.0
- pydantic==2.10.2

### Frontend
- react 18
- react-dom
- Already integrated into CKD Prediction frontend

## 🔒 Security Notes

- API keys are stored in `.env` file (not in version control)
- CORS is configured for specific origins
- User authentication is maintained from main app
- No sensitive data is logged

## 🚀 Deployment Considerations

For production deployment:

1. **Backend**:
   - Use production WSGI server (Gunicorn with Uvicorn)
   - Set up proper environment variables
   - Configure CORS for production domain
   - Implement rate limiting
   - Add authentication/authorization if needed

2. **Frontend**:
   - Update API URL to production backend
   - Build for production: `npm run build`
   - Serve with production server

## 📄 License

This project is part of the CKD Prediction system.

## 🙏 Acknowledgments

- Google Gemini for the powerful LLM
- LangChain for the excellent RAG framework
- FAISS for efficient vector search
- FastAPI for the amazing backend framework
- React for the frontend library

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review backend logs for error messages
- Check browser console for frontend errors
- Ensure all dependencies are installed

---

**AI Chat Assistant for CKD Prediction** - Making healthcare information accessible through AI 🏥🤖

