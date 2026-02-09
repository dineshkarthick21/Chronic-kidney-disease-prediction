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
