# 🏥 Chronic Kidney Disease Prediction System

A full-stack web application with machine learning capabilities to predict Chronic Kidney Disease (CKD) with an advanced admin dashboard for user management and analytics.

## ✨ Features

### User Features
- 🎨 **Modern Landing Page** - Dynamic rotating medical images carousel with theme toggle
- 🔐 **User Authentication** - Secure signup/login with MongoDB Atlas and modern UI
- 📊 **Single Prediction** - Input medical parameters for instant CKD prediction
- 📁 **CSV Upload** - Batch predictions with CSV file upload
- 🤖 **AI Chat Assistant** - Intelligent RAG chatbot powered by Google Gemini for CKD Q&A
- 🌓 **Dark/Light Mode** - Seamless theme switching throughout the application
- 📈 **Results Visualization** - View prediction results with confidence scores
- 👤 **User Profile** - Comprehensive profile management with avatar, personal info editing, and account statistics
- ⚙️ **Settings Page** - Customize notifications, security preferences, appearance, and privacy settings
- 🩺 **Doctor Consultation** - Schedule and manage appointments with healthcare professionals
- 📋 **Medical Reports** - Access and download your medical reports and prediction history

### Admin Dashboard
- 🛡️ **Admin Authentication** - Secure admin login with secret code
- 👥 **User Management** - View and manage all registered users
- 📊 **Statistics Dashboard** - Real-time analytics on users and predictions
- 🔗 **Session Monitoring** - Track active user sessions
- 📈 **Analytics** - Monitor system usage and performance

### Machine Learning
- 🤖 **Random Forest Algorithm** - High-accuracy CKD prediction model
- 🎯 **Feature Selection** - SelectKBest for optimal feature extraction
- 📉 **Model Evaluation** - Comprehensive performance metrics

### AI Chat Assistant (RAG System)
- 🧠 **Google Gemini Integration** - Powered by Gemini Pro for intelligent responses
- 📚 **FAISS Vector Database** - Semantic search across CKD knowledge base
- 🔍 **Context-Aware Responses** - Retrieves relevant information before answering
- 💬 **Natural Language Processing** - Understands and responds to medical queries
- 📖 **Comprehensive Knowledge Base** - 17 chunks of CKD medical information

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Custom styling with gradients, animations, and glass-morphism effects
- **Context API** - Global theme state management
- **Responsive Design** - Mobile-first approach with adaptive layouts

### Backend
- **Flask** - Python web framework
- **MongoDB Atlas** - Cloud database
- **bcrypt** - Password hashing
- **JWT** - Token-based authentication
- **Flask-CORS** - Cross-origin resource sharing

### Machine Learning
- **scikit-learn** - ML library
- **pandas** - Data manipulation
- **numpy** - Numerical computing
- **Random Forest** - Classification algorithm

### RAG Chatbot Backend
- **FastAPI** - High-performance Python web framework
- **LangChain** - LLM application framework
- **Google Gemini Pro** - Advanced language model
- **FAISS** - Vector similarity search
- **HuggingFace Embeddings** - Text embeddings for semantic search

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB Atlas account
- Git

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/dineshkarthick21/Chronic-kidney-disease-prediction.git
cd CKD-Prediction
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add your MongoDB Atlas URI:
MONGO_URI=your_mongodb_atlas_uri
ADMIN_SECRET_CODE=CKD_ADMIN_2026

# Run Flask server
python app.py
```

Backend will run on `http://localhost:5000`

### 3. RAG Chatbot Backend Setup

```bash
cd Rag-chatbot-assistent/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Google Gemini API key
echo GOOGLE_API_KEY=your_gemini_api_key_here > .env

# Create vector database
python ingest.py

# Run FastAPI server
python -m uvicorn main:app --reload --port 8001
```

RAG Backend will run on `http://localhost:8001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Train ML Model (Optional)

```bash
cd Backend

# Train the model
python src/train_model.py

# Evaluate performance
python src/evaluate_model.py
```

## 🔑 Admin Access

To access the admin dashboard:
1. Navigate to the login page
2. Click **"Admin Login"** button (top right)
3. Sign up with admin credentials
4. Use secret code: `CKD_ADMIN_2026`
5. Access admin dashboard with user management features

## 📁 Project Structure

```
CKD-Prediction/
├── Backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── data/                   # Dataset files
│   ├── models/                 # Trained ML models
│   ├── notebooks/              # Jupyter notebooks
├── Rag-chatbot-assistent/
│   ├── backend/
│   │   ├── main.py            # FastAPI RAG server
│   │   ├── ingest.py          # Vector database creation
│   │   ├── data.txt           # CKD knowledge base
│   │   ├── requirements.txt   # Python dependencies
│   │   ├── .env               # Environment variables
│   │   └── vector_db/         # FAISS vector database
│   └── README.md              # RAG chatbot documentation
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main application with routing
    │   ├── components/
    │   │   ├── LandingPage.jsx # Landing page with image carousel
    │   │   ├── Login.jsx      # User login with modern UI
    │   │   ├── SignUp.jsx     # User registration
    │   │   ├── AdminLogin.jsx # Admin login (separate flow)
    │   │   ├── AdminSignup.jsx # Admin registration
    │   │   ├── AdminDashboard.jsx # Admin panel
    │   │   ├── Header.jsx     # Navigation header with dropdown
    │   │   ├── Navbar.jsx     # Navigation bar
    │   │   ├── PredictionForm.jsx # Single prediction form
    │   │   ├── CSVUpload.jsx  # Batch prediction uploader
    │   │   ├── Results.jsx    # Results display
    │   │   ├── Profile.jsx    # User profile management
    │   │   ├── Settings.jsx   # Application settings
    │   │   ├── AIChatAssistant.jsx # RAG chatbot interface
    │   │   ├── DoctorConsultation.jsx # Doctor appointment management
    │   │   ├── Reports.jsx    # Medical reports viewer
    │   │   └── Loader.jsx     # Loading component
    │   └── context/
    │       └── ThemeContext.jsx # Global theme management
    ├── package.json
    └── vite.config.js
```

## 🔌 API Endpoints

### User Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/verify` - Verify token

### Admin Authentication
- `POST /api/admin/signup` - Register admin (requires secret code)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (admin only)

### Health Check
- `GET /api/health` - API health status

## 🎯 ML Model Details

- **Algorithm**: Random Forest Classifier
- **Feature Selection**: SelectKBest
- **Features**: 24 medical parameters including:
  - Age, Blood Pressure, Specific Gravity
  - Albumin, Sugar, Red Blood Cells
  - Pus Cell, Bacteria, Hemoglobin
  - And more...

## 🎨 UI/UX Highlights

### Landing Page
- **Dynamic Carousel**: 6 high-quality medical images rotating every 1.5 seconds
- **Theme Toggle**: Smooth transition between light and dark modes
- **Optimized Overlays**: 20-25% opacity for light theme, 85% for dark theme
- **Call-to-Action**: Prominent Get Started button

### Authentication Pages
- **Modern Design**: Blue gradient backgrounds with glass-morphism effects
- **Role Selection**: Easy toggle between Student and Admin roles
- **Input Icons**: Visual feedback for email and password fields
- **Responsive Cards**: Centered white cards that adapt to all screen sizes
- **Single-Page Layout**: No scrolling required for better UX

### Profile Page
- **Avatar Management**: 120px circular user avatar
- **Editable Fields**: Toggle between view and edit modes for personal information
- **Password Security**: Dedicated password change form with validation
- **Account Statistics**: Display predictions made, reports generated, and account age

## 🌟 Recent Updates

- ✅ **Doctor Consultation** - NEW! Schedule appointments with healthcare professionals
- ✅ **Medical Reports** - NEW! Access and download medical reports and prediction history  
- ✅ **AI Chat Assistant** - Intelligent RAG chatbot powered by Google Gemini with FAISS vector search
- ✅ **Landing Page Redesign** - Added dynamic rotating medical images carousel (6 images, 1.5s interval)
- ✅ **Modern Authentication UI** - Redesigned login/signup pages with blue gradient and centered cards
- ✅ **Profile Management** - Comprehensive profile page with avatar, editable personal info, password change, and account statistics
- ✅ **Settings Page** - Complete settings management for appearance, notifications, security, preferences, and privacy
- ✅ **Enhanced Theme System** - Improved light/dark theme toggle with optimized image overlay (20-25% for light theme)
- ✅ **Separate Admin Flow** - Dedicated authentication pages for admin users
- ✅ **Role-Based UI** - Student and Admin role selection with appropriate redirects
- ✅ **Header Navigation** - Dropdown menu with Profile, Settings, and AI Chat Assistant
- ✅ **Responsive Design** - Mobile-optimized layouts for all components
- ✅ **User Session Management** - Enhanced MongoDB Atlas integration
- ✅ **Single-Page Forms** - Optimized spacing for no-scroll authentication experience

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Dinesh Karthick**
- GitHub: [@dineshkarthick21](https://github.com/dineshkarthick21)

## 🙏 Acknowledgments

- UCI Machine Learning Repository for the CKD dataset
- Flask and React communities for excellent documentation
- MongoDB Atlas for cloud database services
