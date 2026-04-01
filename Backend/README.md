# CKD Prediction Backend API

Flask API for user authentication and CKD prediction system.

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If MongoDB is not running, start it:
# On Windows (if installed as service):
net start MongoDB

# Or start mongod manually:
mongod --dbpath "path/to/your/data"
```

### 3. Configure Environment

The `.env` file is already configured for local development:
- MongoDB URI: `mongodb://localhost:27017/`
- Database: `ckd_prediction`
- Collections: `users`, `sessions`

### 4. Run the Flask API

```bash
python app.py
```

The API will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### **POST** `/api/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "session_token"
}
```

#### **POST** `/api/login`
Login an existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "session_token"
}
```

#### **POST** `/api/logout`
Logout current user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### **GET** `/api/verify`
Verify session token

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### **GET** `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "message": "API and MongoDB are running"
}
```
## Real-Time Chat System (Socket.io)

### Overview
- **Technology**: Flask-SocketIO with WebSocket support
- **Storage**: In-memory thread-safe message storage (no database persistence)
- **Privacy**: Socket.io room-based isolation ensures patient messages only reach their selected doctor and doctor replies only reach the targeted patient
- **Features**: Private one-to-one conversations, instant message delivery, organized by conversation partner

### Socket.io Handlers

#### **authenticate_socket**
Authenticates user/doctor and joins them to appropriate rooms

**Event**: `authenticate_socket`
**Payload**:
```json
{
  "role": "user|doctor",
  "token": "authentication_token"
}
```
**Rooms Joined**: 
- User: `user_{user_id}` (receives doctor messages)
- Doctor: `doctor_{doctor_id}` (receives patient messages)

#### **send_chat_message**
Sends a message from patient to doctor or doctor to patient

**Event**: `send_chat_message`
**Payload**:
```json
{
  "role": "user|doctor",
  "token": "authentication_token",
  "targetDoctorId": "doctor_id_string (patient only)",
  "targetUserId": "user_id_string (doctor only)",
  "text": "message content"
}
```
**Message Format**:
```json
{
  "id": "unique_id",
  "user_id": "patient_user_id",
  "doctor_id": "doctor_account_id",
  "sender_type": "user|doctor",
  "sender_name": "name of sender",
  "text": "message content",
  "created_at": "ISO8601 timestamp"
}
```
**Delivery**: 
- Patient→Doctor: Emitted to room `doctor_{targetDoctorId}`
- Doctor→Patient: Emitted to room `user_{targetUserId}`

### Chat REST API Endpoints

#### **GET** `/api/chat/user/messages`
Retrieve all chat messages for current patient (grouped by doctor)

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "user_id": "patient_id",
  "chats": [
    {
      "id": "message_id",
      "user_id": "patient_id",
      "doctor_id": "doctor_id",
      "sender_type": "user|doctor",
      "sender_name": "name",
      "text": "message",
      "created_at": "ISO8601"
    }
  ]
}
```

#### **GET** `/api/chat/doctor/conversations`
Get list of all patients the doctor has conversed with (with last message preview)

**Headers**:
```
Authorization: Bearer <token> (doctor)
```

**Response**:
```json
{
  "doctor_id": "doctor_id",
  "conversations": [
    {
      "user_id": "patient_id",
      "user_name": "patient name",
      "last_message": "last message text",
      "last_message_time": "ISO8601"
    }
  ]
}
```

#### **GET** `/api/chat/doctor/messages/<user_id>`
Get conversation history between doctor and specific patient

**Headers**:
```
Authorization: Bearer <token> (doctor)
```

**Response**:
```json
{
  "doctor_id": "doctor_id",
  "user_id": "patient_id",
  "messages": [
    {
      "id": "message_id",
      "user_id": "patient_id",
      "doctor_id": "doctor_id",
      "sender_type": "user|doctor",
      "sender_name": "name",
      "text": "message",
      "created_at": "ISO8601"
    }
  ]
}
```
## MongoDB Collections

### users
Stores user account information
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  created_at: DateTime,
  updated_at: DateTime
}
```

### sessions
Stores active user sessions
```javascript
{
  _id: ObjectId,
  user_id: String,
  email: String,
  token: String (unique),
  created_at: DateTime,
  expires_at: DateTime (auto-expires after 7 days)
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with auto-generated salt
- **Secure Tokens**: Session tokens are generated using `secrets.token_urlsafe(32)`
- **Session Expiry**: Sessions automatically expire after 7 days
- **CORS Enabled**: Cross-origin requests enabled for frontend integration
- **Input Validation**: Email and password validation before processing

## Testing the API

You can test the API using curl, Postman, or the frontend application:

```bash
# Health check
curl http://localhost:5000/api/health

# Sign up
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running on `localhost:27017`
- Check MongoDB Compass is connected to the same URI
- Verify firewall settings allow connections to port 27017

### Port Already in Use
If port 5000 is already in use, modify `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change port number
```

And update frontend API URLs accordingly.

### Module Import Errors
If you encounter import errors, ensure all dependencies are installed:
```bash
pip install -r requirements.txt --upgrade
```
