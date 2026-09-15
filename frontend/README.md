# Meeting Intelligence & Consulting Platform

An enterprise platform that helps consulting teams prepare for client meetings, track questions, analyze transcripts dynamically with OpenAI, and maintain a living knowledge base for each engagement.

## Architecture

- **Backend**: Django REST Framework + OpenAI GPT-4o-mini + OpenAI Whisper
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + React Router v7
- **Data Flow**: 100% dynamic live data from Django REST API endpoints

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- Recharts (charts)
- Lucide React (icons)
- Django 5 + Django REST Framework + SQLite / PostgreSQL

## Getting started

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

