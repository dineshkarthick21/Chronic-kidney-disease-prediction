from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from pymongo import MongoClient
import bcrypt
from datetime import datetime, timedelta
import secrets
import os
from dotenv import load_dotenv
import pickle
import numpy as np
import pandas as pd
from bson.objectid import ObjectId
from threading import Lock

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

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
doctor_accounts_collection = db['doctor_accounts']
doctor_sessions_collection = db['doctor_sessions']

# Admin secret code (change this in production!)
ADMIN_SECRET_CODE = os.getenv('ADMIN_SECRET_CODE', 'CKD_ADMIN_2026')

# Create indexes
users_collection.create_index('email', unique=True)
sessions_collection.create_index('token', unique=True)
sessions_collection.create_index('expires_at', expireAfterSeconds=0)
admins_collection.create_index('email', unique=True)
admin_sessions_collection.create_index('token', unique=True)
admin_sessions_collection.create_index('expires_at', expireAfterSeconds=0)
doctor_accounts_collection.create_index('email', unique=True)
doctor_sessions_collection.create_index('token', unique=True)
doctor_sessions_collection.create_index('expires_at', expireAfterSeconds=0)

# Collections for consultations
doctors_collection = db['doctors']
consultations_collection = db['consultations']

# Socket-only chat storage (no MongoDB persistence).
chat_messages_memory = {}
chat_messages_lock = Lock()


def add_live_chat_message(message):
    """Store chat message in memory under its user conversation key."""
    user_id = str(message.get('user_id') or '')
    if not user_id:
        return

    with chat_messages_lock:
        chat_messages_memory.setdefault(user_id, []).append(message)


def get_live_chat_messages_for_user(user_id):
    """Read in-memory chat history for a user conversation."""
    with chat_messages_lock:
        return list(chat_messages_memory.get(str(user_id), []))


DEFAULT_DOCTOR_ACCOUNTS = []


def seed_default_doctor_accounts_if_missing(default_password: str):
    """Ensure the three default doctor accounts exist (idempotent)."""
    if not default_password or len(default_password) < 6:
        return

    for item in DEFAULT_DOCTOR_ACCOUNTS:
        email = item['email'].strip().lower()
        existing = doctor_accounts_collection.find_one({'email': email})
        if existing:
            continue

        doctor_accounts_collection.insert_one({
            'name': item['name'],
            'email': email,
            'password': hash_password(default_password),
            'specialization': item['specialization'],
            'role': 'doctor',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })


# Auto-seed default doctor accounts for development/demo convenience.
try:
    seed_default_doctor_accounts_if_missing(os.getenv('DEFAULT_DOCTOR_PASSWORD', 'Doctor@123'))
except Exception as _e:
    # Avoid crashing app startup due to seed issues.
    pass


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


def create_doctor_session(doctor_id, email):
    """Create a new session for a doctor"""
    token = generate_token()
    expires_at = datetime.utcnow() + timedelta(days=7)

    session = {
        'doctor_id': str(doctor_id),
        'email': email,
        'token': token,
        'created_at': datetime.utcnow(),
        'expires_at': expires_at
    }

    doctor_sessions_collection.insert_one(session)
    return token


def get_user_session(token):
    """Validate and return user session"""
    if not token:
        return None

    session = sessions_collection.find_one({'token': token})
    if not session or session['expires_at'] < datetime.utcnow():
        return None
    return session


def get_doctor_session(token):
    """Validate and return doctor session"""
    if not token:
        return None

    session = doctor_sessions_collection.find_one({'token': token})
    if not session or session['expires_at'] < datetime.utcnow():
        return None
    return session


def get_admin_session(token):
    """Validate and return admin session"""
    if not token:
        return None

    session = admin_sessions_collection.find_one({'token': token})
    if not session or session['expires_at'] < datetime.utcnow():
        return None
    return session


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


# ===================== DOCTOR AUTH ROUTES =====================

@app.route('/api/doctor/signup', methods=['POST'])
def doctor_signup():
    """Register a new doctor account"""
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        specialization = data.get('specialization', 'General Physician').strip()

        if not name or not email or not password:
            return jsonify({'message': 'All fields are required'}), 400

        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400

        if doctor_accounts_collection.find_one({'email': email}):
            return jsonify({'message': 'Doctor email already registered'}), 409

        hashed_password = hash_password(password)

        doctor = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'specialization': specialization,
            'role': 'doctor',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = doctor_accounts_collection.insert_one(doctor)
        doctor_id = result.inserted_id
        token = create_doctor_session(doctor_id, email)

        return jsonify({
            'message': 'Doctor registered successfully',
            'doctor': {
                'id': str(doctor_id),
                'name': name,
                'email': email,
                'specialization': specialization,
                'role': 'doctor'
            },
            'token': token
        }), 201

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctor/login', methods=['POST'])
def doctor_login():
    """Authenticate a doctor"""
    try:
        data = request.get_json()

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        doctor = doctor_accounts_collection.find_one({'email': email})
        if not doctor or not verify_password(password, doctor['password']):
            return jsonify({'message': 'Invalid email or password'}), 401

        token = create_doctor_session(doctor['_id'], email)

        return jsonify({
            'message': 'Doctor login successful',
            'doctor': {
                'id': str(doctor['_id']),
                'name': doctor['name'],
                'email': doctor['email'],
                'specialization': doctor.get('specialization', 'General Physician'),
                'role': 'doctor'
            },
            'token': token
        }), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctor/stats', methods=['GET'])
def doctor_stats():
    """Get doctor dashboard stats"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Allow access with or without token (for development)
        if token:
            session = get_doctor_session(token)
            if not session:
                return jsonify({'message': 'Invalid or expired token'}), 401

        total_patients = users_collection.count_documents({})
        total_predictions = predictions_collection.count_documents({})

        latest = list(predictions_collection.find({}).sort('created_at', -1).limit(200))
        high_risk = sum(1 for p in latest if str(p.get('result', '')).lower() == 'ckd')

        return jsonify({
            'totalPatients': total_patients,
            'totalPredictions': total_predictions,
            'highRiskCases': high_risk
        }), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctor/patients', methods=['GET'])
def doctor_patients():
    """Get all patients with latest prediction summary"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Allow access with or without token (for development)
        if token:
            session = get_doctor_session(token)
            if not session:
                return jsonify({'message': 'Invalid or expired token'}), 401

        patients = list(users_collection.find({}, {'password': 0}).sort('created_at', -1))
        patient_list = []

        for patient in patients:
            uid = str(patient['_id'])
            latest_prediction = predictions_collection.find_one(
                {'user_id': uid},
                sort=[('created_at', -1)]
            )
            prediction_count = predictions_collection.count_documents({'user_id': uid})

            patient_list.append({
                'id': uid,
                'name': patient.get('name', ''),
                'email': patient.get('email', ''),
                'created_at': patient.get('created_at'),
                'predictionCount': prediction_count,
                'latestResult': latest_prediction.get('result') if latest_prediction else None,
                'latestConfidence': latest_prediction.get('confidence') if latest_prediction else None,
                'latestPredictionAt': latest_prediction.get('created_at') if latest_prediction else None
            })

        return jsonify({'patients': patient_list}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctor/patient-predictions/<user_id>', methods=['GET'])
def doctor_patient_predictions(user_id):
    """Get all predictions for a patient"""
    try:
        # Get token from Authorization header
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Validate doctor session if token provided
        if token:
            session = get_doctor_session(token)
            if not session:
                return jsonify({'message': 'Invalid or expired token'}), 401
        # If no token, still allow access but log it (for development)
        
        predictions = list(predictions_collection.find({'user_id': user_id}).sort('created_at', -1))
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])

        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        }), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctor/seed', methods=['POST'])
def seed_doctor_accounts():
    """Seed default doctor login accounts (development helper)."""
    try:
        data = request.get_json(silent=True) or {}
        default_password = (data.get('password') or 'Doctor@123').strip()
        force = bool(data.get('force', False))

        if len(default_password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400

        defaults = DEFAULT_DOCTOR_ACCOUNTS

        created = []
        skipped = []
        updated = []

        for item in defaults:
            email = item['email'].strip().lower()
            existing = doctor_accounts_collection.find_one({'email': email})
            if existing:
                if force:
                    doctor_accounts_collection.update_one(
                        {'_id': existing['_id']},
                        {'$set': {
                            'name': item['name'],
                            'specialization': item['specialization'],
                            'password': hash_password(default_password),
                            'updated_at': datetime.utcnow()
                        }}
                    )
                    updated.append({'email': email})
                else:
                    skipped.append({'email': email})
                continue

            doctor = {
                'name': item['name'],
                'email': email,
                'password': hash_password(default_password),
                'specialization': item['specialization'],
                'role': 'doctor',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            result = doctor_accounts_collection.insert_one(doctor)
            created.append({
                'id': str(result.inserted_id),
                'email': email,
                'name': item['name'],
                'specialization': item['specialization']
            })

        status_code = 201 if created else 200
        return jsonify({
            'message': 'Doctor accounts seed complete',
            'created': created,
            'updated': updated,
            'skipped': skipped,
            'password': default_password
        }), status_code

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


# ===================== CHAT ROUTES =====================

@app.route('/api/chat/user/messages', methods=['GET'])
def get_user_chat_messages():
    """Get chat messages for logged in user"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_user_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        messages = get_live_chat_messages_for_user(session['user_id'])

        return jsonify({'messages': messages}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/chat/doctor/conversations', methods=['GET'])
def get_doctor_conversations():
    """Get all patients for doctor to initiate conversations (pure socket messaging)"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Allow access with or without token (for development)
        if token:
            session = get_doctor_session(token)
            if not session:
                return jsonify({'message': 'Invalid or expired token'}), 401

        # Build conversations from users + in-memory socket chat history.
        patients = list(users_collection.find({}, {'password': 0}).sort('created_at', -1))
        conversations = []

        for patient in patients:
            user_id = str(patient['_id'])
            user_messages = get_live_chat_messages_for_user(user_id)
            last_message = user_messages[-1] if user_messages else None

            conversations.append({
                'userId': user_id,
                'userName': patient.get('name', 'Unknown User'),
                'userEmail': patient.get('email', ''),
                'lastMessage': last_message.get('text', '') if last_message else '',
                'lastSenderType': last_message.get('sender_type', '') if last_message else '',
                'lastMessageAt': last_message.get('created_at') if last_message else None
            })

        return jsonify({'conversations': conversations}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/chat/doctor/messages/<user_id>', methods=['GET'])
def get_doctor_chat_messages(user_id):
    """Get chat messages for selected patient conversation"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Allow access with or without token (for development)
        if token:
            session = get_doctor_session(token)
            if not session:
                return jsonify({'message': 'Invalid or expired token'}), 401

        messages = get_live_chat_messages_for_user(user_id)

        return jsonify({'messages': messages}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@socketio.on('authenticate_socket')
def authenticate_socket(payload):
    """Authenticate socket connection and join role rooms"""
    role = payload.get('role')
    token = payload.get('token')

    if role == 'user':
        session = get_user_session(token)
        if not session:
            emit('socket_error', {'message': 'User authentication failed'})
            return

        join_room('doctors_online')
        join_room(f"user_{session['user_id']}")
        emit('socket_authenticated', {
            'role': 'user',
            'userId': session['user_id']
        })
        return

    if role == 'doctor':
        session = get_doctor_session(token)

        if not session:
            emit('socket_error', {'message': 'Doctor authentication failed'})
            return
        
        join_room('doctors_online')
        join_room(f"doctor_{session['doctor_id']}")
        emit('socket_authenticated', {
            'role': 'doctor',
            'doctorId': session['doctor_id']
        })
        return

    emit('socket_error', {'message': 'Invalid socket role'})


@socketio.on('send_chat_message')
def send_chat_message(payload):
    """Send chat messages between users and doctors via socket only"""
    role = payload.get('role')
    token = payload.get('token')
    text = (payload.get('text') or '').strip()

    if not text:
        emit('socket_error', {'message': 'Message text is required'})
        return

    created_at = datetime.utcnow()

    if role == 'user':
        session = get_user_session(token)
        if not session:
            emit('socket_error', {'message': 'Invalid user token'})
            return

        target_doctor_id = payload.get('targetDoctorId', '')
        if not target_doctor_id:
            emit('socket_error', {'message': 'targetDoctorId is required for patient message'})
            return

        user_doc = users_collection.find_one({'_id': ObjectId(session['user_id'])})
        message = {
            'id': f"{created_at.isoformat()}-{secrets.token_hex(4)}",
            'user_id': session['user_id'],
            'doctor_id': target_doctor_id,
            'sender_type': 'user',
            'sender_name': user_doc.get('name', 'User') if user_doc else 'User',
            'text': text,
            'created_at': created_at.isoformat()
        }

        add_live_chat_message(message)

        # Send only to the specific selected doctor
        emit('chat_message', message, room=f"doctor_{target_doctor_id}")
        # Also send to the patient's own room for confirmation
        emit('chat_message', message, room=f"user_{session['user_id']}")
        return

    if role == 'doctor':
        session = get_doctor_session(token)

        if not session:
            emit('socket_error', {'message': 'Invalid doctor token'})
            return

        target_user_id = payload.get('targetUserId', '')
        if not target_user_id:
            emit('socket_error', {'message': 'targetUserId is required for doctor message'})
            return

        doctor_name = 'Doctor'
        if session:
            doctor_doc = doctor_accounts_collection.find_one({'_id': ObjectId(session['doctor_id'])})
            doctor_name = doctor_doc.get('name', 'Doctor') if doctor_doc else 'Doctor'
        
        message = {
            'id': f"{created_at.isoformat()}-{secrets.token_hex(4)}",
            'user_id': target_user_id,
            'doctor_id': session['doctor_id'],
            'sender_type': 'doctor',
            'sender_name': doctor_name,
            'text': text,
            'created_at': created_at.isoformat()
        }

        add_live_chat_message(message)

        # Send to the specific patient's room
        emit('chat_message', message, room=f'user_{target_user_id}')
        # Echo back only to this doctor room to keep their own chat in sync.
        emit('chat_message', message, room=f"doctor_{session['doctor_id']}")
        return

    emit('socket_error', {'message': 'Invalid role in message payload'})


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


@app.route('/api/admin/predictions', methods=['GET'])
def admin_all_predictions():
    """Get recent predictions across all users for admin dashboard"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_admin_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        limit = request.args.get('limit', default=250, type=int)
        limit = max(1, min(limit, 1000))

        predictions = list(predictions_collection.find({}).sort('created_at', -1).limit(limit))

        # Map user_id to user name for display in admin UI
        user_map = {}
        for user in users_collection.find({}, {'name': 1}):
            user_map[str(user['_id'])] = user.get('name', 'Unknown User')

        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            prediction['user_name'] = user_map.get(str(prediction.get('user_id')), 'Unknown User')

        return jsonify({'predictions': predictions, 'count': len(predictions)}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/sessions', methods=['GET'])
def admin_all_sessions():
    """Get user sessions for admin dashboard"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_admin_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        limit = request.args.get('limit', default=300, type=int)
        limit = max(1, min(limit, 1000))

        sessions = list(sessions_collection.find({}).sort('created_at', -1).limit(limit))
        now = datetime.utcnow()

        for s in sessions:
            s['_id'] = str(s['_id'])
            s['status'] = 'active' if s.get('expires_at') and s['expires_at'] > now else 'expired'

        active_count = sum(1 for s in sessions if s.get('status') == 'active')

        return jsonify({
            'sessions': sessions,
            'count': len(sessions),
            'active': active_count,
            'expired': len(sessions) - active_count
        }), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/sessions/<session_id>', methods=['DELETE'])
def admin_revoke_session(session_id):
    """Revoke a user session by session document id"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_admin_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        try:
            object_id = ObjectId(session_id)
        except Exception:
            return jsonify({'message': 'Invalid session id'}), 400

        result = sessions_collection.delete_one({'_id': object_id})
        if result.deleted_count == 0:
            return jsonify({'message': 'Session not found'}), 404

        return jsonify({'message': 'Session revoked successfully'}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/doctors', methods=['GET'])
def admin_all_doctors():
    """Get doctor directory details for admin dashboard"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_admin_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        doctor_profiles = list(doctors_collection.find({}))
        profile_by_name = {d.get('name', '').strip().lower(): d for d in doctor_profiles}

        doctor_accounts = list(doctor_accounts_collection.find({}, {'password': 0}))
        doctors = []

        for account in doctor_accounts:
            account['_id'] = str(account['_id'])
            profile = profile_by_name.get(account.get('name', '').strip().lower(), {})

            doctors.append({
                'id': account['_id'],
                'name': account.get('name', 'Doctor'),
                'email': account.get('email', ''),
                'specialization': account.get('specialization', profile.get('specialization', 'General Physician')),
                'experience': profile.get('experience', 'N/A'),
                'rating': profile.get('rating', 'N/A'),
                'availability': profile.get('availability', 'N/A'),
                'languages': profile.get('languages', []),
                'created_at': account.get('created_at')
            })

        return jsonify({'doctors': doctors, 'count': len(doctors)}), 200

    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/reports', methods=['GET'])
def admin_reports_summary():
    """Get aggregated report metrics for admin dashboard"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = get_admin_session(token)

        if not session:
            return jsonify({'message': 'Invalid or expired token'}), 401

        predictions = list(predictions_collection.find({}))

        summary = {
            'total': len(predictions),
            'ckd': 0,
            'noCkd': 0,
            'single': 0,
            'batch': 0
        }

        monthly = {}

        for p in predictions:
            result = str(p.get('result', '')).strip().lower()
            if result == 'ckd' or result == 'positive':
                summary['ckd'] += 1
            elif result in ('no ckd', 'negative', 'notckd'):
                summary['noCkd'] += 1

            ptype = str(p.get('type', 'single')).strip().lower()
            if ptype == 'batch':
                summary['batch'] += 1
            else:
                summary['single'] += 1

            created = p.get('created_at')
            if isinstance(created, datetime):
                key = created.strftime('%Y-%m')
                monthly[key] = monthly.get(key, 0) + 1

        monthly_data = [
            {'month': key, 'count': monthly[key]}
            for key in sorted(monthly.keys())[-12:]
        ]

        return jsonify({'summary': summary, 'monthly': monthly_data}), 200

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
            'patient_name': data.get('patientName', 'Anonymous'),
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
            'saved': True,  # Mark as explicitly saved/reported
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

@app.route('/api/doctor_accounts', methods=['GET'])
def get_doctor_accounts():
    """Get list of all doctors from doctor_accounts collection"""
    try:
        doctors = list(doctor_accounts_collection.find({}, {
            '_id': 1,
            'name': 1,
            'email': 1,
            'specialization': 1
        }))
        
        # Convert ObjectId to string and add default values for display fields
        formatted_doctors = []
        for idx, doctor in enumerate(doctors, 1):
            formatted_doctors.append({
                '_id': str(doctor['_id']),
                'id': idx,
                'name': doctor.get('name', 'Unknown'),
                'email': doctor.get('email', ''),
                'specialization': doctor.get('specialization', 'Specialist'),
                'experience': '10 years',  # Default values
                'rating': 4.7,
                'availability': 'Mon-Fri: 9 AM - 5 PM',
                'avatar': '👨‍⚕️',
                'languages': ['English', 'Tamil']
            })
        
        return jsonify({'doctors': formatted_doctors}), 200
        
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
        
        # No default doctors to seed
        return jsonify({
            'message': 'No default doctors configured to seed',
            'count': 0
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/doctors/cleanup', methods=['POST'])
def cleanup_doctors():
    """Remove duplicate doctors from database"""
    try:
        # Find all doctors
        all_doctors = list(doctors_collection.find())
        
        # Group by 'id'
        seen = set()
        duplicates = []
        
        for doctor in all_doctors:
            doc_id = doctor.get('id')
            if doc_id in seen:
                duplicates.append(doctor['_id'])
            else:
                seen.add(doc_id)
        
        # Remove duplicates
        if duplicates:
            result = doctors_collection.delete_many({'_id': {'$in': duplicates}})
            return jsonify({
                'message': f'Removed {len(duplicates)} duplicate doctors',
                'deleted_count': result.deleted_count
            }), 200
        else:
            return jsonify({'message': 'No duplicates found'}), 200
        
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


# ===================== USER PROFILE ROUTES =====================

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile with statistics"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        session = sessions_collection.find_one({'token': token})
        
        if not session:
            return jsonify({'message': 'Invalid token'}), 401
        
        from bson.objectid import ObjectId
        user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
        
        if not user:
            return jsonify({'message': 'User not found'}), 401
        
        # Calculate statistics
        predictions_count = predictions_collection.count_documents({'user_id': session['user_id']})
        
        # Calculate account age in days
        created_at = user.get('created_at', datetime.utcnow())
        account_age = (datetime.utcnow() - created_at).days
        
        # Get reports count (predictions that were saved/reported)
        reports_count = predictions_collection.count_documents({
            'user_id': session['user_id'],
            'saved': True
        })
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone', ''),
                'bio': user.get('bio', ''),
                'profilePhoto': user.get('profilePhoto', ''),
                'created_at': created_at.isoformat()
            },
            'statistics': {
                'predictions_count': predictions_count,
                'reports_count': reports_count,
                'account_age': account_age
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Update user profile information"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        session = sessions_collection.find_one({'token': token})
        
        if not session:
            return jsonify({'message': 'Invalid token'}), 401
        
        data = request.get_json()
        
        # Fields that can be updated
        update_fields = {}
        if 'name' in data:
            update_fields['name'] = data['name'].strip()
        if 'phone' in data:
            update_fields['phone'] = data['phone'].strip()
        if 'bio' in data:
            update_fields['bio'] = data['bio'].strip()
        if 'email' in data:
            # Check if email already exists
            new_email = data['email'].strip().lower()
            from bson.objectid import ObjectId
            existing_user = users_collection.find_one({
                'email': new_email,
                '_id': {'$ne': ObjectId(session['user_id'])}
            })
            if existing_user:
                return jsonify({'message': 'Email already in use'}), 409
            update_fields['email'] = new_email
        
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
        
        update_fields['updated_at'] = datetime.utcnow()
        
        from bson.objectid import ObjectId
        result = users_collection.update_one(
            {'_id': ObjectId(session['user_id'])},
            {'$set': update_fields}
        )
        
        if result.modified_count > 0:
            # Get updated user
            user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'phone': user.get('phone', ''),
                    'bio': user.get('bio', ''),
                    'profilePhoto': user.get('profilePhoto', '')
                }
            }), 200
        else:
            return jsonify({'message': 'No changes made'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/user/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        session = sessions_collection.find_one({'token': token})
        
        if not session:
            return jsonify({'message': 'Invalid token'}), 401
        
        data = request.get_json()
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        
        if not current_password or not new_password:
            return jsonify({'message': 'Current and new passwords are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'message': 'New password must be at least 6 characters'}), 400
        
        from bson.objectid import ObjectId
        user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
        
        if not user:
            return jsonify({'message': 'User not found'}), 401
        
        # Verify current password
        if not verify_password(current_password, user['password']):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        users_collection.update_one(
            {'_id': ObjectId(session['user_id'])},
            {'$set': {
                'password': hashed_password,
                'updated_at': datetime.utcnow()
            }}
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@app.route('/api/user/profile-photo', methods=['PUT'])
def update_profile_photo():
    """Update user profile photo"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        session = sessions_collection.find_one({'token': token})
        
        if not session:
            return jsonify({'message': 'Invalid token'}), 401
        
        data = request.get_json()
        profile_photo = data.get('profilePhoto', '')
        
        if not profile_photo:
            return jsonify({'message': 'Profile photo is required'}), 400
        
        # Validate base64 image (basic check)
        if not profile_photo.startswith('data:image/'):
            return jsonify({'message': 'Invalid image format'}), 400
        
        from bson.objectid import ObjectId
        
        # Update profile photo
        result = users_collection.update_one(
            {'_id': ObjectId(session['user_id'])},
            {'$set': {
                'profilePhoto': profile_photo,
                'updated_at': datetime.utcnow()
            }}
        )
        
        if result.modified_count > 0:
            return jsonify({'message': 'Profile photo updated successfully'}), 200
        else:
            # No changes made (same photo)
            return jsonify({'message': 'Profile photo updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


if __name__ == '__main__':
    doctor_count = doctors_collection.count_documents({})
    print(f"✅ Doctors in database: {doctor_count}") 
    print("🚀 Starting Flask server...")
    socketio.run(app, debug=True, port=5000)
