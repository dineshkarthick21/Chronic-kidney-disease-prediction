# 🏥 Chronic Kidney Disease Prediction System

A full-stack web application with machine learning capabilities to predict Chronic Kidney Disease (CKD) with an advanced admin dashboard for user management and analytics.

## ✨ Features

### User Features
- 🎨 **Modern Landing Page** - Dynamic rotating medical images carousel (light theme only, 2-second intervals)
- 🔐 **User Authentication** - Secure signup/login with MongoDB Atlas and modern UI
- 📊 **Single Prediction** - Input medical parameters with patient name for instant CKD prediction
- 📄 **PDF Download** - Generate and download comprehensive prediction reports with patient info, parameters, and recommendations
- 📁 **CSV Upload** - Batch predictions with CSV file upload and downloadable results
- 📋 **Reports Dashboard** - View, manage, and download all prediction history with patient names
  - 🔍 **Interactive Session Filtering** - Search sessions by patient name/result, filter by prediction type (Single/Batch), sort by date or confidence
  - 📊 **Dynamic Pagination** - Real-time result counts based on active filters with reset option
- 🎓 **Health Education Center** - Access 36 categorized educational videos on CKD topics
  - ⭐ **Favorites System** - Mark favorite videos with persistent localStorage storage
  - 🎬 **Smart Sorting** - Sort videos by popularity, newest first, or duration
  - 📚 **Search Integration** - Combined with favorites toggle and sorting for personalized discovery
- 🤖 **AI Chat Assistant** - Intelligent RAG chatbot powered by Google Gemini for CKD Q&A
- 💡 **Pull-Chain Theme Toggle** - Animated bulb + pull-chain switch to change Light/Dark mode (except landing page)
  - 💡 **Bulb Icon** - Yellow bulb with grey metal cap and visible filament
  - 🔗 **Animated Chain** - Pull-down animation on click to smoothly toggle theme
  - 🎨 **Smart Colors** - Auto-adjusts bulb/chain colors for light/dark mode compatibility
  - ✨ **Smooth Animation** - 120ms chain pull transition effect on press
  - 📍 **Everywhere** - Available in Header, Auth pages, and Admin Dashboard
- 📈 **Results Visualization** - View prediction results with confidence scores
- 👤 **User Profile** - Comprehensive profile management with:
  - 📸 **Photo Upload** - Upload and display profile pictures (5MB limit, base64 storage)
  - ✏️ **Edit Profile** - Update name, email, phone, and bio with real-time backend sync
  - 🔒 **Password Change** - Secure password update with validation
  - 📊 **Account Statistics** - Real-time stats (predictions count, reports count, account age)
  - � **Profile Completion Bar** - Visual progress indicator (0-100%) for profile completeness
  - 💡 **Interactive Stats** - Click stat cards to view contextual insights about your account
  - �🖼️ **Avatar Display** - Profile photos shown across Header, Profile, and Reports pages
- ⚙️ **Settings Page** - Tab-based customization interface:
  - 🎨 **Appearance Tab** - Theme toggle, font size, compact mode, high contrast, language selection
  - ⚙️ **Preferences Tab** - Auto-save, default view, tutorials, sound effects, date/time formats
  - 🔒 **Security Tab** - Password change, session timeout, login alerts, device tracking
  - 💾 **Change Tracking** - Visual badge shows "Unsaved changes" (yellow) or "All changes saved" (green)
  - 🔄 **Reset Defaults** - One-click button to restore all settings to factory defaults with confirmation
  - 📥 **Export Settings** - Download all current settings as JSON file for backup or transfer
- 🩺 **Doctor Consultation** - Schedule and manage appointments with healthcare professionals using **Jitsi Meet video conferencing**

### Doctor Consultation & Video Conferencing 🆕
- �‍⚕️ **Doctor Authentication** - Separate doctor login/signup with specialization field and dedicated dashboard
  - Pre-seeded accounts for 3 default doctors (auto-created at startup)
  - Default credentials: `dineshkarthick@ckd.local`, `dharanish@ckd.local`, `hari.saravana@ckd.local`
  - Password: `Doctor@123` (customizable via `/api/doctor/seed` endpoint)
- 📊 **Doctor Dashboard** - Complete interface for managing consultations and patient appointments
  - 📈 Real-time patient list with prediction counts
  - 💬 Live chat messaging with individual patients
  - 📄 View patient prediction history with confidence scores
  - 📥 **PDF Download** - One-click download of individual patient predictions as formatted PDF reports
- � **Doctor Filtering** - Find doctors by name/specialization, spoken language, or minimum rating
- �👥 **Patient Management** - View, organize, and manage patient consultation history
- 📅 **Real-time Scheduling** - Book appointments with healthcare professionals
- 🎥 **Jitsi Meet Integration** - Secure, free video conferencing with no setup required
- 🔒 **Unique Meeting Rooms** - Auto-generated unique room names for each consultation
- 📲 **Instant Access** - No downloads needed, works directly in browser
- 🌐 **Cross-Platform** - Works on desktop, mobile, and tablets
- 🔗 **Easy Sharing** - Copy and share meeting links instantly
- 💬 **Student Chat** - Students can chat with doctors directly from consultation scheduling page
  - "Chat with Doctor" button on each doctor card
  - Real-time messaging via WebSocket connection

### PDF Reports & Patient Tracking 🆕
- 📄 **Comprehensive PDF Reports** - Generate detailed prediction reports with:
  - Patient information (name, date, timestamp)
  - Complete parameter table with all 24 medical values
  - Prediction result and severity assessment
  - Key risk factors and health recommendations
  - Lifestyle advice and medical disclaimer
- 👤 **Patient Name Tracking** - All predictions now include patient names for better record keeping
- 📥 **One-Click Download** - Download individual prediction reports from Results page
- 📊 **Batch Download** - Download historical predictions from Reports dashboard
- 🔍 **Search & Filter** - Find predictions by patient name or date

### Health Education Center 🆕
- 🎓 **36 Educational Videos** - Curated video library covering:
  - 📚 **CKD Basics** (9 videos) - Understanding kidney disease, stages, symptoms, tests
  - 🥗 **Diet & Nutrition** (8 videos) - Kidney-friendly foods, sodium/protein/potassium management
  - 💊 **Treatment** (7 videos) - Dialysis, transplant, medications, home care options
  - 🛡️ **Prevention** (5 videos) - Risk factors, diabetes, hypertension, kidney stones
  - 🏃 **Lifestyle** (7 videos) - Exercise, stress, sleep, travel, work-life balance
- 🔍 **Search & Filter** - Find videos by title, description, or category
- 🎬 **YouTube Integration** - Watch videos directly or open on YouTube
- 📱 **Responsive Player** - Full-screen modal player with metadata
- 📍 **Easy Access** - Available from "More" dropdown menu in dashboard header

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
- 💬� Recent Updates (Latest Release)

### UI/UX Enhancements
- ✨ **Pull-Chain Bulb Theme Toggle** - Replaced standard theme icons with elegant animated pull-chain light bulb interface
  - Implemented across Header, all Auth pages (Login/SignUp/AdminLogin/AdminSignup/DoctorLogin/DoctorSignup), and Admin Dashboard
  - SVG-based bulb illustration with smooth pull-down animation
  - Responsive color schemes for light and dark themes
  - Accessibility features: title attributes and aria-labels

### New Components
- 🆕 **DoctorDashboard.jsx** - Complete dashboard for healthcare professionals with appointment management
- 🆕 **DoctorLogin.jsx** - Secure doctor authentication with email and password validation
- 🆕 **DoctorSignup.jsx** - Doctor registration interface with specialization field
- 🆕 **DoctorDashboard.css** - Responsive styling optimized for doctor workflow

### Infrastructure Updates
- Updated frontend dependencies for enhanced performance and security
- Vite build system optimizations (requires Node.js 20.19+ or 22.12+)
- npm packages upgraded for React 19 compatibility
- Backend dependencies updated for stability

**Latest Commit:** Multi-phase release — Doctor PDF downloads, chat with doctor, auto-seeded accounts  
**Changes:** Doctor Dashboard PDF export, student chat integration, secure doctor account seeding

## � **Natural Language Processing** - Understands and responds to medical queries
- 📖 **Comprehensive Knowledge Base** - 17 chunks of CKD medical information

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Vite** - Lightning-fast build tool and dev server
- **jsPDF** - Client-side PDF generation
- **jspdf-autotable** - PDF table generation plugin
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
    │   │   ├── HealthEducation.jsx # Video library (36 CKD educational videos)
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

### Predictions
- `POST /api/predict` - Make single prediction (includes patient_name field)
- `POST /api/predict/batch` - Batch predictions from CSV
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
- **Dynamic Carousel**: 6 high-quality medical images rotating every 2 seconds
- **Light Theme Only**: Clean, professional white theme (dark theme removed)
- **Optimized Overlays**: 20-25% opacity for optimal contrast and readability
- **Call-to-Action**: Prominent Get Started button

### Authentication Pages
- **Modern Design**: Blue gradient backgrounds with glass-morphism effects
- **Role Selection**: Easy toggle between Student a with photo upload
- **Photo Upload**: Click avatar to upload profile picture (5MB limit, JPG/PNG/GIF)
- **Editable Fields**: Toggle between view and edit modes for personal information
- **Password Security**: Dedicated password change form with validation (6 char minimum)
- **Account Statistics**: Real-time stats from database (predictions, reports, account age)
- **Backend Integration**: All changes sync immediately with MongoDB via API
- **Global Display**: Profile photo appears in Header dropdown and Reports page

### Settings Page
- **Tab Navigation**: Three organized tabs for easy settings management
- **Appearance Settings**: Theme toggle (Context API sync), font size, compact mode, high contrast, 6 language options
- **Preferences**: Auto-save, default view, tutorials, sound effects, date/time formats
- **Security Settings**: Password change, session timeout, login alerts, device tracking
- **localStorage Persistence**: All settings saved locally for consistent user experience

## 🌟 Recent Updates (March 2026)

### 🆕 Latest Dashboard Interactivity Enhancements
- ✅ **Reports Dashboard** - Real-time session filtering (search by patient/result, filter by type, sort by date/confidence)
- ✅ **Doctor List Filtering** - Filter doctors by name/specialization, language, and minimum rating
- ✅ **Health Education Favorites** - Mark favorite videos with persistent localStorage storage, filter and sort library
- ✅ **Profile Completion Tracking** - Visual progress bar (0-100%) showing profile completeness
- ✅ **Interactive Stat Cards** - Click stat cards to view contextual insights about your account activity
- ✅ **Settings Enhancements** - Unsaved changes indicator, reset to defaults action, export settings as JSON
- ✅ **Theme Refinement** - Purple color theme replaced with blue (#2563eb) for consistency; improved dark mode support

### Just Added (Health Education & Settings)
- ✅ **Health Education Center** - 36 categorized educational videos on CKD (basics, diet, treatment, prevention, lifestyle)
- ✅ **PDF Report Generation** - Download comprehensive prediction reports with patient information and recommendations
- ✅ **Patient Name Tracking** - All predictions include patient names for better record keeping
- ✅ **Reports Dashboard** - Enhanced with PDF download and patient name display
- ✅ **Landing Page Refinement** - Light theme only with optimized 2-second image rotation

### Previous Major Updates
- ✅ **Jitsi Meet Integration** - Secure video conferencing for doctor consultations
- ✅ **Doctor Consultation** - Schedule appointments with healthcare professionals
- ✅ **AI Chat Assistant** - Intelligent RAG chatbot powered by Google Gemini with FAISS vector search
- ✅ **Profile Management** - Comprehensive profile page with avatar, editable personal info, password change, and account statistics
- ✅ **Settings Page** - Complete settings management for appearance, notifications, security, preferences, and privacy
- ✅ **Landing Page Redesign** - Added dynamic rotating medical images carousel
- ✅ **Modern Authentication UI** - Redesigned login/signup pages with blue gradient and centered cards

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
