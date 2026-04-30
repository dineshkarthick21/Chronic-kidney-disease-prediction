# CKD Prediction Frontend

React + Vite frontend for the CKD Prediction system.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Feature Highlights

- Authentication flows (user/admin/doctor)
- Prediction forms + CSV upload
- Reports dashboard with filters
- Health Education center with YouTube videos + custom add flow
- AI Chat Assistant overlay (RAG backend on port 8001)
- Profile and Settings pages with localStorage persistence

## Environment

The frontend expects:
- Flask API on `http://localhost:5000`
- RAG backend on `http://localhost:8001`

Update URLs in the components if your ports differ.
