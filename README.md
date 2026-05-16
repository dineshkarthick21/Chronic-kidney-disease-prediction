
# CKD Prediction System

A full-stack web application with machine learning to predict Chronic Kidney Disease (CKD), a doctor consultation module, a health education video hub, and a RAG-based AI chat assistant.

## Features

### Patient Experience
- Modern landing page with rotating medical imagery
- Secure authentication with MongoDB sessions
- Single prediction + CSV batch prediction
- PDF report download for individual and batch predictions
- Reports dashboard with search, filters, and pagination
- Profile management (avatar, bio, phone, password updates)
- Settings (appearance, preferences, security, export/reset)

### Health Education Center
- 9 local CKD education videos across 5 categories (Basics, Prevention, Diet, Treatment, Lifestyle)
- Favorites, search, and sorting (popular/newest/duration)
- Full-screen modal video player (no YouTube embeds)
- Videos are stored in `frontend/src/assets/Kidney videos/`

### Doctor Consultation
- Dedicated doctor login/signup and dashboard
- Patient list + prediction history + PDF exports
- Real-time socket chat between doctors and patients
- Jitsi Meet video conferencing with auto-generated rooms

### AI Chat Assistant (RAG)
- FastAPI + LangChain + FAISS
- Gemini 2.5 Flash responses
- Context-aware answers over CKD knowledge base

## Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Vite** - Lightning-fast build tool and dev server
- **jsPDF** - Client-side PDF generation
- **jspdf-autotable** - PDF table generation plugin
- **CSS3** - Custom styling with gradients, animations, and glass-morphism effects
- **Context API** - Global theme state management
- **Responsive Design** - Mobile-first approach with adaptive layouts

### Backend
- Flask, Flask-SocketIO, Flask-CORS
- MongoDB Atlas or local MongoDB
- bcrypt password hashing

### Machine Learning
- **scikit-learn** - ML library
- **pandas** - Data manipulation
- **numpy** - Numerical computing
- **Random Forest** - Classification algorithm

### RAG Chatbot Backend
- FastAPI, LangChain, FAISS
- Gemini 2.5 Flash
- HuggingFace embeddings

## 📋 Prerequisites

- Python 3.8+
- Node.js 20.19+ or 22.12+ (required by Vite)
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
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
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

### 5. Train ML Model (Optional)

```bash
cd Backend

# Train the model
python src/train_model.py

# Evaluate performance
python src/evaluate_model.py
```

## Admin Access

To access the admin dashboard:
1. Navigate to the login page
2. Click **"Admin Login"** button (top right)
3. Sign up with admin credentials
4. Use secret code: `CKD_ADMIN_2026`
5. Access admin dashboard with user management features

## Project Structure

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
    │   │   ├── LandingPage.jsx # Landing page with image carousel (light theme, 2s intervals)
    │   │   ├── Login.jsx      # User login with modern UI
    │   │   ├── SignUp.jsx     # User registration
    │   │   ├── AdminLogin.jsx # Admin login (separate flow)
    │   │   ├── AdminSignup.jsx # Admin registration
    │   │   ├── AdminDashboard.jsx # Admin panel
    │   │   ├── Header.jsx     # Navigation header with dropdown (Profile, Settings, Education)
    │   │   ├── Navbar.jsx     # Navigation bar
    │   │   ├── PredictionForm.jsx # Single prediction form with patient name
    │   │   ├── CSVUpload.jsx  # Batch prediction uploader
    │   │   ├── Results.jsx    # Results display with PDF download
    │   │   ├── Profile.jsx    # User profile management
    │   │   ├── Settings.jsx   # Application settings
    │   │   ├── AIChatAssistant.jsx # RAG chatbot interface
    │   │   ├── DoctorConsultation.jsx # Doctor appointment with Jitsi Meet
    │   │   ├── Reports.jsx    # Medical reports with PDF download and patient tracking
    │   │   ├── HealthEducation.jsx # Video library (local CKD educational videos)
    │   │   └── Loader.jsx     # Loading component
    │   └── context/
    │       └── ThemeContext.jsx # Global theme management
    ├── package.json
    └── vite.config.js
```

## API Endpoints (Core)

### User Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/verify` - Verify token

### Predictions
- `POST /api/predict` - Make single prediction (includes patient_name field)
- `POST /api/predict-batch` - Batch predictions from CSV
- `GET /api/predictions/history` - Get user's prediction history with patient names

### User Profile Management
- `GET /api/user/profile` - Get user profile with statistics
- `PUT /api/user/profile` - Update user profile (name, email, phone, bio)
- `POST /api/user/change-password` - Change user password with validation
- `PUT /api/user/profile-photo` - Upload profile photo (base64, 5MB limit)

### Admin Authentication
- `POST /api/admin/signup` - Register admin (requires secret code)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (admin only)

### Health Check
- `GET /api/health` - API health status

## ML Model Details

- **Algorithm**: Random Forest Classifier
- **Feature Selection**: SelectKBest
- **Features**: 24 medical parameters including:
  - Age, Blood Pressure, Specific Gravity
  - Albumin, Sugar, Red Blood Cells
  - Pus Cell, Bacteria, Hemoglobin
  - And more...

## UI/UX Highlights

### Landing Page
- Dynamic carousel of medical imagery
- Light theme with clear CTA for onboarding

### Profile and Settings
- Profile photo upload + editable contact info
- Account stats with contextual insights
- Settings tabs for appearance, preferences, and security

## Recent Updates (April 2026)
- Health Education updated to use local video assets (YouTube removed)
- Settings and Profile visual redesign
- Doctor dashboard auth guard and socket recovery
- RAG backend run instructions aligned to backend folder

## Contributing

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
