from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from datetime import datetime, timedelta
import secrets
import os
from dotenv import load_dotenv
import pickle
import numpy as np
import pandas as pd

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load the trained model
try:
    with open('models/random_forest_ckd.pkl', 'rb') as f:
        loaded_model = pickle.load(f)
    
    # Check if it's a dict with model and other components
    if isinstance(loaded_model, dict):
        model = loaded_model.get('model')
        scaler = loaded_model.get('scaler')
        feature_selector = loaded_model.get('selector')  # Note: key is 'selector' not 'feature_selector'
        print(f"Model loaded from dict with keys: {loaded_model.keys()}")
    else:
        model = loaded_model
        scaler = None
        feature_selector = None
    
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    scaler = None
    feature_selector = None

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['ckd_prediction']
users_collection = db['users']
sessions_collection = db['sessions']
admins_collection = db['admins']
admin_sessions_collection = db['admin_sessions']
predictions_collection = db['predictions']  # Add predictions collection

# Admin secret code (change this in production!)
ADMIN_SECRET_CODE = os.getenv('ADMIN_SECRET_CODE', 'CKD_ADMIN_2026')

# Create indexes
users_collection.create_index('email', unique=True)
sessions_collection.create_index('token', unique=True)
sessions_collection.create_index('expires_at', expireAfterSeconds=0)
admins_collection.create_index('email', unique=True)
admin_sessions_collection.create_index('token', unique=True)
admin_sessions_collection.create_index('expires_at', expireAfterSeconds=0)

# Collections for consultations
doctors_collection = db['doctors']
consultations_collection = db['consultations']


def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed


def verify_password(password, hashed):
    """Verify a password against a hashed password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)


def generate_token():
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


def create_session(user_id, email):
    """Create a new session for a user"""
    token = generate_token()
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    session = {
        'user_id': str(user_id),
        'email': email,
        'token': token,
        'created_at': datetime.utcnow(),
        'expires_at': expires_at
    }
    
    sessions_collection.insert_one(session)
    return token


@app.route('/api/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not name or not email or not password:
            return jsonify({'message': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': email}):
            return jsonify({'message': 'Email already registered'}), 409
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user
        user = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = users_collection.insert_one(user)
        user_id = result.inserted_id
        
        # Create session
        token = create_session(user_id, email)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': str(user_id),
                'name': name,
                'email': email
            },
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate a user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(password, user['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create session
        token = create_session(user['_id'], email)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email']
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout a user"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if token:
            sessions_collection.delete_one({'token': token})
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/verify', methods=['GET'])
def verify_token():
    """Verify a session token"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        session = sessions_collection.find_one({'token': token})
        
        if not session:
            return jsonify({'message': 'Invalid token'}), 401
        
        if session['expires_at'] < datetime.utcnow():
            sessions_collection.delete_one({'token': token})
            return jsonify({'message': 'Token expired'}), 401
        
        user = users_collection.find_one({'_id': session['user_id']})
        
        if not user:
            return jsonify({'message': 'User not found'}), 401
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'message': 'API and MongoDB are running'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'message': str(e)
        }), 500


# ===================== ADMIN ROUTES =====================

@app.route('/api/admin/signup', methods=['POST'])
def admin_signup():
    """Register a new admin"""
    try:
        data = request.get_json()
        
        # Validate required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        admin_code = data.get('adminCode', '')
        
        if not name or not email or not password or not admin_code:
            return jsonify({'message': 'All fields are required'}), 400
        
        # Verify admin secret code
        if admin_code != ADMIN_SECRET_CODE:
            return jsonify({'message': 'Invalid admin secret code'}), 403
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Check if admin already exists
        if admins_collection.find_one({'email': email}):
            return jsonify({'message': 'Admin email already registered'}), 409
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create admin
        admin = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': 'admin',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = admins_collection.insert_one(admin)
        admin_id = result.inserted_id
        
        # Create admin session
        token = generate_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        admin_session = {
            'admin_id': str(admin_id),
            'email': email,
            'token': token,
            'created_at': datetime.utcnow(),
            'expires_at': expires_at
        }
        
        admin_sessions_collection.insert_one(admin_session)
        
        return jsonify({
            'message': 'Admin registered successfully',
            'admin': {
                'id': str(admin_id),
                'name': name,
                'email': email,
                'role': 'admin'
            },
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Authenticate an admin"""
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find admin
        admin = admins_collection.find_one({'email': email})
        
        if not admin:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(password, admin['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create admin session
        token = generate_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        admin_session = {
            'admin_id': str(admin['_id']),
            'email': email,
            'token': token,
            'created_at': datetime.utcnow(),
            'expires_at': expires_at
        }
        
        admin_sessions_collection.insert_one(admin_session)
        
        return jsonify({
            'message': 'Admin login successful',
            'admin': {
                'id': str(admin['_id']),
                'name': admin['name'],
                'email': admin['email'],
                'role': 'admin'
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    """Get dashboard statistics"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify admin session
        admin_session = admin_sessions_collection.find_one({'token': token})
        
        if not admin_session or admin_session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Count total users
        total_users = users_collection.count_documents({})
        
        # Count total predictions
        total_predictions = predictions_collection.count_documents({})
        
        # Count active sessions
        active_sessions = sessions_collection.count_documents({
            'expires_at': {'$gt': datetime.utcnow()}
        })
        
        return jsonify({
            'totalUsers': total_users,
            'totalPredictions': total_predictions,
            'activeSessions': active_sessions
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    """Get list of all users"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify admin session
        admin_session = admin_sessions_collection.find_one({'token': token})
        
        if not admin_session or admin_session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Get all users (exclude password field)
        users = list(users_collection.find({}, {'password': 0}))
        
        # Convert ObjectId to string
        for user in users:
            user['_id'] = str(user['_id'])
        
        return jsonify({
            'users': users
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/user-predictions/<user_id>', methods=['GET'])
def get_user_predictions(user_id):
    """Get all predictions for a specific user"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify admin session
        admin_session = admin_sessions_collection.find_one({'token': token})
        
        if not admin_session or admin_session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Get predictions for the user
        predictions = list(predictions_collection.find({'user_id': user_id}).sort('created_at', -1))
        
        # Convert ObjectId to string
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
        
        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


def preprocess_input(data):
    """Preprocess input data for prediction"""
    # Define expected features
    feature_names = ['age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 
                     'hemo', 'pcv', 'wc', 'rc', 'rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 
                     'cad', 'appet', 'pe', 'ane']
    
    # Mappings for categorical variables
    mappings = {
        'rbc': {'normal': 0, 'abnormal': 1},
        'pc': {'normal': 0, 'abnormal': 1},
        'pcc': {'notpresent': 0, 'present': 1},
        'ba': {'notpresent': 0, 'present': 1},
        'htn': {'no': 0, 'yes': 1},
        'dm': {'no': 0, 'yes': 1},
        'cad': {'no': 0, 'yes': 1},
        'appet': {'good': 0, 'poor': 1},
        'pe': {'no': 0, 'yes': 1},
        'ane': {'no': 0, 'yes': 1}
    }
    
    # Convert data to proper format
    processed_data = []
    for feature in feature_names:
        value = data.get(feature, '')
        
        # Handle NaN values
        if pd.isna(value):
            value = ''
        
        # Handle categorical variables
        if feature in mappings:
            value = str(value).lower().strip()
            processed_data.append(mappings[feature].get(value, 0))
        else:
            # Handle numerical variables
            try:
                processed_data.append(float(value) if value != '' else 0.0)
            except:
                processed_data.append(0.0)
    
    return np.array(processed_data).reshape(1, -1)


@app.route('/api/predict', methods=['POST'])
def predict():
    """Make a single CKD prediction"""
    try:
        if model is None:
            return jsonify({'message': 'Model not loaded'}), 500
        
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify user session
        session = sessions_collection.find_one({'token': token})
        
        if not session or session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        data = request.get_json()
        
        # Preprocess input
        input_data = preprocess_input(data)
        
        # Apply transformations if available
        if scaler is not None:
            input_data = scaler.transform(input_data)
        
        if feature_selector is not None:
            input_data = feature_selector.transform(input_data)
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        prediction_proba = model.predict_proba(input_data)[0]
        
        # Get confidence (probability of predicted class)
        confidence = float(max(prediction_proba))
        
        # Convert prediction to readable format
        result = 'CKD' if prediction == 1 else 'No CKD'
        
        # Save prediction to database
        prediction_record = {
            'user_id': session['user_id'],
            'email': session['email'],
            'type': 'single',
            'result': result,
            'confidence': confidence * 100,
            'age': data.get('age'),
            'bp': data.get('bp'),
            'sg': data.get('sg'),
            'al': data.get('al'),
            'su': data.get('su'),
            'bgr': data.get('bgr'),
            'bu': data.get('bu'),
            'sc': data.get('sc'),
            'sod': data.get('sod'),
            'pot': data.get('pot'),
            'hemo': data.get('hemo'),
            'pcv': data.get('pcv'),
            'wc': data.get('wc'),
            'rc': data.get('rc'),
            'rbc': data.get('rbc'),
            'pc': data.get('pc'),
            'pcc': data.get('pcc'),
            'ba': data.get('ba'),
            'htn': data.get('htn'),
            'dm': data.get('dm'),
            'cad': data.get('cad'),
            'appet': data.get('appet'),
            'pe': data.get('pe'),
            'ane': data.get('ane'),
            'created_at': datetime.utcnow()
        }
        
        predictions_collection.insert_one(prediction_record)
        
        return jsonify({
            'prediction': result,
            'confidence': confidence,
            'message': 'Prediction made successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/predict-batch', methods=['POST'])
def predict_batch():
    """Make batch CKD predictions from CSV file"""
    try:
        if model is None:
            return jsonify({'message': 'Model not loaded'}), 500
        
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify user session
        session = sessions_collection.find_one({'token': token})
        
        if not session or session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'message': 'File must be a CSV'}), 400
        
        # Read CSV file
        df = pd.read_csv(file)
        
        # Remove classification column if it exists
        if 'classification' in df.columns:
            df = df.drop('classification', axis=1)
        
        # Remove id column if it exists
        if 'id' in df.columns:
            df = df.drop('id', axis=1)
        
        print(f"CSV loaded with {len(df)} rows and columns: {df.columns.tolist()}")
        
        results = []
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Convert row to dict
                data = row.to_dict()
                
                # Preprocess input
                input_data = preprocess_input(data)
                
                # Apply transformations if available
                if scaler is not None:
                    input_data = scaler.transform(input_data)
                
                if feature_selector is not None:
                    input_data = feature_selector.transform(input_data)
                
                # Make prediction
                prediction = model.predict(input_data)[0]
                prediction_proba = model.predict_proba(input_data)[0]
                
                # Get confidence
                confidence = float(max(prediction_proba))
                
                # Convert prediction to readable format
                result = 'CKD' if prediction == 1 else 'No CKD'
                
                # Save prediction to database
                prediction_record = {
                    'user_id': session['user_id'],
                    'email': session['email'],
                    'type': 'batch',
                    'result': result,
                    'confidence': confidence * 100,
                    'age': data.get('age'),
                    'bp': data.get('bp'),
                    'sg': data.get('sg'),
                    'al': data.get('al'),
                    'su': data.get('su'),
                    'bgr': data.get('bgr'),
                    'bu': data.get('bu'),
                    'sc': data.get('sc'),
                    'sod': data.get('sod'),
                    'pot': data.get('pot'),
                    'hemo': data.get('hemo'),
                    'pcv': data.get('pcv'),
                    'wc': data.get('wc'),
                    'rc': data.get('rc'),
                    'rbc': data.get('rbc'),
                    'pc': data.get('pc'),
                    'pcc': data.get('pcc'),
                    'ba': data.get('ba'),
                    'htn': data.get('htn'),
                    'dm': data.get('dm'),
                    'cad': data.get('cad'),
                    'appet': data.get('appet'),
                    'pe': data.get('pe'),
                    'ane': data.get('ane'),
                    'created_at': datetime.utcnow()
                }
                
                predictions_collection.insert_one(prediction_record)
                
                results.append({
                    'id': index + 1,
                    'prediction': result,
                    'confidence': round(confidence * 100, 2)
                })
                
            except Exception as e:
                print(f"Error processing row {index + 1}: {str(e)}")  # Log the error
                import traceback
                traceback.print_exc()  # Print full traceback
                results.append({
                    'id': index + 1,
                    'prediction': 'Error',
                    'confidence': 0,
                    'error': str(e)
                })
        
        # Calculate summary
        total = len(results)
        ckd_count = sum(1 for r in results if r['prediction'] == 'CKD')
        not_ckd_count = sum(1 for r in results if r['prediction'] == 'No CKD')
        
        return jsonify({
            'results': results,
            'summary': {
                'total': total,
                'ckd': ckd_count,
                'notCkd': not_ckd_count
            },
            'message': 'Batch prediction completed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/prediction/save', methods=['POST'])
def save_prediction():
    """Save a prediction result"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify user session
        session = sessions_collection.find_one({'token': token})
        
        if not session or session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        data = request.get_json()
        
        # Create prediction record
        prediction = {
            'user_id': session['user_id'],
            'email': session['email'],
            'result': data.get('result'),
            'confidence': data.get('confidence'),
            'age': data.get('age'),
            'bp': data.get('bp'),
            'sg': data.get('sg'),
            'al': data.get('al'),
            'su': data.get('su'),
            'bgr': data.get('bgr'),
            'bu': data.get('bu'),
            'sc': data.get('sc'),
            'rbc': data.get('rbc'),
            'pc': data.get('pc'),
            'pcc': data.get('pcc'),
            'ba': data.get('ba'),
            'htn': data.get('htn'),
            'dm': data.get('dm'),
            'cad': data.get('cad'),
            'appet': data.get('appet'),
            'pe': data.get('pe'),
            'ane': data.get('ane'),
            'created_at': datetime.utcnow()
        }
        
        result = predictions_collection.insert_one(prediction)
        
        return jsonify({
            'message': 'Prediction saved successfully',
            'prediction_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/predictions/history', methods=['GET'])
def get_prediction_history():
    """Get user's prediction history"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Verify user session
        session = sessions_collection.find_one({'token': token})
        
        if not session or session['expires_at'] < datetime.utcnow():
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Get user's predictions
        predictions = list(predictions_collection.find(
            {'user_id': session['user_id']}
        ).sort('created_at', -1))
        
        # Convert ObjectId to string
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
        
        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


# ==================== Doctor Consultation Endpoints ====================

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get list of available doctors"""
    try:
        doctors = list(doctors_collection.find())
        
        # If no doctors in database, return mock data
        if not doctors:
            mock_doctors = [
                {
                    'id': 1,
                    'name': 'Dr. Dineshkarthick',
                    'specialization': 'Nephrologist',
                    'experience': '12 years',
                    'rating': 4.9,
                    'availability': 'Mon-Sat: 10 AM - 6 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil', 'Hindi']
                },
                {
                    'id': 2,
                    'name': 'Dr. Dharanish',
                    'specialization': 'Kidney Specialist',
                    'experience': '10 years',
                    'rating': 4.7,
                    'availability': 'Tue-Sat: 8 AM - 4 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil']
                },
                {
                    'id': 3,
                    'name': 'Dr. Hari Saravana',
                    'specialization': 'Renal Medicine Expert',
                    'experience': '14 years',
                    'rating': 4.9,
                    'availability': 'Mon-Fri: 11 AM - 7 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil', 'Malayalam']
                }
            ]
            return jsonify({'doctors': mock_doctors}), 200
        
        # Convert ObjectId to string
        for doctor in doctors:
            doctor['_id'] = str(doctor['_id'])
        
        return jsonify({'doctors': doctors}), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctors/seed', methods=['POST'])
def seed_doctors():
    """Initialize doctors in MongoDB (run once)"""
    try:
        # Check if doctors already exist
        existing_count = doctors_collection.count_documents({})
        if existing_count > 0:
            return jsonify({
                'message': 'Doctors already exist in database',
                'count': existing_count
            }), 200
        
        # Seed doctors data
        doctors_data = [
            {
                'id': 1,
                'name': 'Dr. Dineshkarthick',
                'specialization': 'Nephrologist',
                'experience': '12 years',
                'rating': 4.9,
                'availability': 'Mon-Sat: 10 AM - 6 PM',
                'avatar': '👨‍⚕️',
                'languages': ['English', 'Tamil', 'Hindi'],
                'created_at': datetime.utcnow()
            },
            {
                'id': 2,
                'name': 'Dr. Dharanish',
                'specialization': 'Kidney Specialist',
                'experience': '10 years',
                'rating': 4.7,
                'availability': 'Tue-Sat: 8 AM - 4 PM',
                'avatar': '👨‍⚕️',
                'languages': ['English', 'Tamil'],
                'created_at': datetime.utcnow()
            },
            {
                'id': 3,
                'name': 'Dr. Hari Saravana',
                'specialization': 'Renal Medicine Expert',
                'experience': '14 years',
                'rating': 4.9,
                'availability': 'Mon-Fri: 11 AM - 7 PM',
                'avatar': '👨‍⚕️',
                'languages': ['English', 'Tamil', 'Malayalam'],
                'created_at': datetime.utcnow()
            }
        ]
        
        result = doctors_collection.insert_many(doctors_data)
        
        return jsonify({
            'message': 'Doctors seeded successfully',
            'count': len(result.inserted_ids)
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/consultations', methods=['POST'])
def book_consultation():
    """Book a new consultation"""
    try:
        data = request.get_json()
        
        # Create consultation record
        consultation = {
            'userEmail': data.get('userEmail'),
            'doctor': data.get('doctor'),
            'date': data.get('date'),
            'time': data.get('time'),
            'status': data.get('status', 'scheduled'),
            'meetingLink': data.get('meetingLink'),
            'reason': data.get('reason'),
            'notes': data.get('notes', ''),
            'created_at': datetime.utcnow()
        }
        
        result = consultations_collection.insert_one(consultation)
        
        return jsonify({
            'message': 'Consultation booked successfully',
            'consultation_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/consultations/<user_email>', methods=['GET'])
def get_consultations(user_email):
    """Get consultations for a user"""
    try:
        consultations = list(consultations_collection.find(
            {'userEmail': user_email}
        ).sort('created_at', -1))
        
        # Convert ObjectId to string
        for consultation in consultations:
            consultation['_id'] = str(consultation['_id'])
            # Keep id fields consistent
            if 'id' not in consultation:
                consultation['id'] = consultation['_id']
        
        return jsonify({
            'consultations': consultations,
            'count': len(consultations)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/consultations/<consultation_id>', methods=['DELETE'])
def cancel_consultation(consultation_id):
    """Cancel a consultation"""
    try:
        from bson.objectid import ObjectId
        
        # Try to convert to ObjectId if it's a MongoDB ID
        try:
            obj_id = ObjectId(consultation_id)
            result = consultations_collection.delete_one({'_id': obj_id})
        except:
            # If not a valid ObjectId, try as regular id
            result = consultations_collection.delete_one({'id': consultation_id})
        
        if result.deleted_count > 0:
            return jsonify({'message': 'Consultation cancelled successfully'}), 200
        else:
            return jsonify({'message': 'Consultation not found'}), 404
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/consultations/<consultation_id>', methods=['PATCH'])
def update_consultation_status(consultation_id):
    """Update consultation status (e.g., mark as completed)"""
    try:
        from bson.objectid import ObjectId
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'message': 'Status is required'}), 400
        
        # Try to convert to ObjectId if it's a MongoDB ID
        try:
            obj_id = ObjectId(consultation_id)
            result = consultations_collection.update_one(
                {'_id': obj_id},
                {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
            )
        except:
            # If not a valid ObjectId, try as regular id
            result = consultations_collection.update_one(
                {'id': consultation_id},
                {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
            )
        
        if result.modified_count > 0:
            return jsonify({'message': 'Consultation updated successfully'}), 200
        else:
            return jsonify({'message': 'Consultation not found'}), 404
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


if __name__ == '__main__':
    # Auto-seed doctors if database is empty
    try:
        if doctors_collection.count_documents({}) == 0:
            print("🏥 Seeding doctors into MongoDB...")
            doctors_data = [
                {
                    'id': 1,
                    'name': 'Dr. Dineshkarthick',
                    'specialization': 'Nephrologist',
                    'experience': '12 years',
                    'rating': 4.9,
                    'availability': 'Mon-Sat: 10 AM - 6 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil', 'Hindi'],
                    'created_at': datetime.utcnow()
                },
                {
                    'id': 2,
                    'name': 'Dr. Dharanish',
                    'specialization': 'Kidney Specialist',
                    'experience': '10 years',
                    'rating': 4.7,
                    'availability': 'Tue-Sat: 8 AM - 4 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil'],
                    'created_at': datetime.utcnow()
                },
                {
                    'id': 3,
                    'name': 'Dr. Hari Saravana',
                    'specialization': 'Renal Medicine Expert',
                    'experience': '14 years',
                    'rating': 4.9,
                    'availability': 'Mon-Fri: 11 AM - 7 PM',
                    'avatar': '👨‍⚕️',
                    'languages': ['English', 'Tamil', 'Malayalam'],
                    'created_at': datetime.utcnow()
                }
            ]
            doctors_collection.insert_many(doctors_data)
            print(f"✅ Successfully seeded {len(doctors_data)} doctors!")
        else:
            print(f"✅ Doctors already exist in database ({doctors_collection.count_documents({})} doctors)")
    except Exception as e:
        print(f"⚠️  Error seeding doctors: {e}")
    
    print("🚀 Starting Flask server...")
    app.run(debug=True, port=5000)
