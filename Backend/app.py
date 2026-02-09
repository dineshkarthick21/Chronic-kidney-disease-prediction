from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from datetime import datetime, timedelta
import secrets
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['ckd_prediction']
users_collection = db['users']
sessions_collection = db['sessions']

# Create indexes
users_collection.create_index('email', unique=True)
sessions_collection.create_index('token', unique=True)
sessions_collection.create_index('expires_at', expireAfterSeconds=0)


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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
