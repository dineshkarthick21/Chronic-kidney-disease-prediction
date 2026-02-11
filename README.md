# 🏥 Chronic Kidney Disease Prediction System

A full-stack web application with machine learning capabilities to predict Chronic Kidney Disease (CKD) with an advanced admin dashboard for user management and analytics.

## ✨ Features

### User Features
- 🔐 **User Authentication** - Secure signup/login with MongoDB Atlas
- 📊 **Single Prediction** - Input medical parameters for instant CKD prediction
- 📁 **CSV Upload** - Batch predictions with CSV file upload
- 🌓 **Dark/Light Mode** - Toggle between themes for better viewing experience
- 📈 **Results Visualization** - View prediction results with confidence scores
- 👤 **User Profile** - Manage account settings and view history

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

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **CSS3** - Custom styling with theme support
- **Context API** - State management

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

### 3. Frontend Setup

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
│   │   └── eda.ipynb          # Exploratory data analysis
│   └── src/
│       ├── train_model.py     # Model training
│       ├── evaluate_model.py  # Model evaluation
│       ├── preprocess_data.py # Data preprocessing
│       └── feature_selection.py # Feature engineering
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main application
    │   ├── components/
    │   │   ├── Login.jsx      # User login
    │   │   ├── SignUp.jsx     # User registration
    │   │   ├── AdminLogin.jsx # Admin login
    │   │   ├── AdminSignup.jsx # Admin registration
    │   │   ├── AdminDashboard.jsx # Admin panel
    │   │   ├── Header.jsx     # Navigation header
    │   │   ├── PredictionForm.jsx # Single prediction
    │   │   ├── CSVUpload.jsx  # Batch prediction
    │   │   └── Results.jsx    # Results display
    │   └── context/
    │       └── ThemeContext.jsx # Theme management
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

## 🌟 Recent Updates

- ✅ Removed search bar from header for cleaner UI
- ✅ Added complete admin dashboard system
- ✅ Implemented MongoDB Atlas integration
- ✅ Added user session management
- ✅ Enhanced authentication security
- ✅ Improved responsive design
- ✅ Added theme toggle functionality

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
