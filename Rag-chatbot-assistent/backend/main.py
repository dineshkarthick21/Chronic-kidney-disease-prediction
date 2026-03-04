"""
CKD Prediction RAG API - FastAPI Backend
Provides intelligent Q&A for Chronic Kidney Disease information using RAG with Gemini.
"""

import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="CKD Prediction RAG API",
    description="AI Chat Assistant for Chronic Kidney Disease Prediction System",
    version="1.0.0"
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class Question(BaseModel):
    question: str

class Answer(BaseModel):
    answer: str

# Global variables for RAG components
vectorstore = None
llm = None

def remove_markdown(text: str) -> str:
    """Remove markdown formatting from text for clean output."""
    # Remove bold
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    # Remove italic
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    # Remove headers
    text = re.sub(r'#{1,6}\s*(.+)', r'\1', text)
    # Remove code blocks
    text = re.sub(r'```[\s\S]*?```', '', text)
    # Remove inline code
    text = re.sub(r'`(.+?)`', r'\1', text)
    # Remove links [text](url)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    return text.strip()

def initialize_rag():
    """Initialize the RAG system with vector database and LLM."""
    global vectorstore, llm
    
    try:
        # Get API key
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Load FAISS vector store
        vectorstore = FAISS.load_local(
            "vector_db",
            embeddings,
            allow_dangerous_deserialization=True
        )
        
        # Initialize Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0
        )
        
        print("✅ RAG system initialized successfully!")
        
    except Exception as e:
        print(f"❌ Error initializing RAG system: {str(e)}")
        raise

# Initialize RAG on startup
@app.on_event("startup")
async def startup_event():
    """Initialize RAG components when the API starts."""
    initialize_rag()

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "CKD Prediction RAG Assistant API is running 🚀",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "vectorstore": "loaded" if vectorstore else "not loaded",
        "llm": "initialized" if llm else "not initialized"
    }

@app.post("/ask", response_model=Answer)
async def ask_question(question: Question):
    """
    Ask a question about CKD or the prediction system.
    Returns an AI-generated answer based on the knowledge base.
    """
    try:
        if not llm or not vectorstore:
            raise HTTPException(
                status_code=503,
                detail="RAG system not initialized. Please check vector database."
            )
        
        if not question.question or len(question.question.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )
        
        # Retrieve relevant documents
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(question.question)
        
        # Combine context from retrieved documents
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Create prompt
        prompt = f"""You are an AI assistant for a Chronic Kidney Disease (CKD) Prediction System. 
Your role is to provide helpful, accurate, and friendly information about CKD, its symptoms, risk factors, 
prevention, and how the prediction system works.

Use the following context to answer the question. If you don't know the answer based on the context, 
say so honestly and suggest consulting with healthcare professionals.

Always remind users that this system is for assistance only and should not replace professional medical advice.

Context:
{context}

Question: {question.question}

Answer: Provide a clear, concise, and helpful response. Use bullet points when appropriate for better readability."""
        
        # Get answer from LLM
        result = llm.invoke(prompt)
        answer_text = result.content if hasattr(result, 'content') else str(result)
        answer_text = remove_markdown(answer_text)
        
        return Answer(answer=answer_text)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your question: {str(e)}"
        )

@app.post("/chat")
async def chat(question: Question):
    """
    Alternative chat endpoint with more detailed response.
    """
    try:
        if not llm or not vectorstore:
            raise HTTPException(
                status_code=503,
                detail="RAG system not initialized"
            )
        
        # Retrieve relevant documents
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(question.question)
        
        # Combine context
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Create prompt
        prompt = f"""You are an AI assistant for CKD Prediction. Use the context to answer the question.

Context:
{context}

Question: {question.question}

Answer:"""
        
        # Get answer
        result = llm.invoke(prompt)
        answer_text = result.content if hasattr(result, 'content') else str(result)
        answer_text = remove_markdown(answer_text)
        
        return {
            "question": question.question,
            "answer": answer_text,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
