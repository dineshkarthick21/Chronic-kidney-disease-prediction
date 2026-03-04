"""
CKD Prediction RAG - Vector Database Ingestion Script
This script processes the CKD knowledge base and creates FAISS vector embeddings.
"""

import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def main():
    # Load environment variables
    load_dotenv()
    
    # Check for API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")
    
    print("🚀 Starting CKD Knowledge Base Ingestion...")
    
    # Load the CKD knowledge base
    print("📄 Loading CKD knowledge base from data.txt...")
    loader = TextLoader("data.txt", encoding="utf-8")
    documents = loader.load()
    print(f"✅ Loaded {len(documents)} document(s)")
    
    # Split documents into chunks
    print("✂️  Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n=== ", "\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"✅ Created {len(chunks)} text chunks")
    
    # Create embeddings
    print("🧠 Creating embeddings using HuggingFace...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Create FAISS vector store
    print("💾 Creating FAISS vector database...")
    vectorstore = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )
    
    # Save vector store locally
    print("💾 Saving vector database to disk...")
    vectorstore.save_local("vector_db")
    
    print("✅ Vector database created successfully!")
    print(f"📊 Total chunks indexed: {len(chunks)}")
    print("🎯 Ready to use with the RAG API!")

if __name__ == "__main__":
    main()
