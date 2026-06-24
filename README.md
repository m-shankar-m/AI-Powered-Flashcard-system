# AI-Powered Flashcard System

This is a full-stack application featuring an interactive flashcard system with AI-driven document parsing and voice recognition.

## Features
- **Frontend**: Next.js App Router, Framer Motion, Tailwind CSS
- **Backend**: FastAPI (Python), MongoDB Atlas
- **AI Integrations**: Gemini API (for Document Q&A Generation and Speech-to-Text)
- **Smart Grading**: Fuzzy string matching for accurate answers ignoring typos
- **Document Support**: CSV, PDF, and DOCX format parsing
- **Admin Console**: Track user activities and profiles

## Prerequisites
- Node.js (v18+)
- Python (3.10+)

## Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
The backend will run at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.

## Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
The frontend will run at `http://localhost:3000`.

