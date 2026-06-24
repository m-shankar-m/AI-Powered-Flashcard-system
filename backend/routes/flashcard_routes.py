import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from database import get_db
from routes.auth_routes import get_current_user
from models import GradeRequest, GradeResponse, TestResult
from fuzzywuzzy import fuzz
import google.generativeai as genai
import csv
import io
import json
from pypdf import PdfReader
from docx import Document
from bson import ObjectId

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    title: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    flashcards = []
    
    content = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            decoded = content.decode('utf-8')
            reader = csv.reader(io.StringIO(decoded))
            for row in reader:
                if len(row) >= 2:
                    flashcards.append({"question": row[0].strip(), "answer": row[1].strip()})
        elif file.filename.endswith('.pdf'):
            pdf_reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            flashcards = generate_flashcards_with_gemini(text)
        elif file.filename.endswith('.docx') or file.filename.endswith('.doc'):
            doc = Document(io.BytesIO(content))
            text = "\n".join([para.text for para in doc.paragraphs])
            flashcards = generate_flashcards_with_gemini(text)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        if not flashcards:
            raise HTTPException(status_code=400, detail="No flashcards could be extracted")
            
        set_data = {
            "title": title,
            "user_id": str(current_user["_id"]),
            "flashcards": flashcards,
            "created_at": datetime.now().isoformat()
        }
        
        result = db.flashcard_sets.insert_one(set_data)
        
        # Log activity
        db.activities.insert_one({
            "user_id": str(current_user["_id"]),
            "email": current_user["email"],
            "action": "Uploaded document",
            "details": f"Created set '{title}' with {len(flashcards)} cards",
            "timestamp": datetime.now().isoformat()
        })
        
        return {"message": "Upload successful", "set_id": str(result.inserted_id), "count": len(flashcards)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_flashcards_with_gemini(text: str):
    try:
        model = genai.GenerativeModel('gemini-3.5-flash')
        prompt = f"""
        Extract key concepts from the following text and create a list of flashcards.
        Return ONLY a JSON array of objects, where each object has 'question' and 'answer' string keys.
        Limit to maximum 15 flashcards.
        
        Text:
        {text[:10000]} # Limit to avoid token issues
        """
        response = model.generate_content(prompt)
        response_text = response.text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        cards = json.loads(response_text)
        return cards
    except Exception as e:
        print(f"Gemini generation error: {e}")
        return []

@router.get("/sets")
async def get_my_sets(current_user: dict = Depends(get_current_user)):
    db = get_db()
    sets = list(db.flashcard_sets.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    for s in sets:
        s["_id"] = str(s["_id"])
    return sets

@router.get("/sets/{set_id}")
async def get_set(set_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    fset = db.flashcard_sets.find_one({"_id": ObjectId(set_id)})
    if not fset:
        raise HTTPException(status_code=404, detail="Set not found")
    fset["_id"] = str(fset["_id"])
    return fset

@router.post("/grade", response_model=GradeResponse)
async def grade_answer(req: GradeRequest, current_user: dict = Depends(get_current_user)):
    score = fuzz.token_sort_ratio(req.user_answer.lower(), req.correct_answer.lower())
    is_correct = score >= 85
    return {"score": score, "is_correct": is_correct, "feedback": f"{score}% Match"}

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        content = await file.read()
        
        # Clean up MIME type parameters (e.g., "audio/webm;codecs=opus" -> "audio/webm")
        mime_type = file.content_type or "audio/webm"
        if ";" in mime_type:
            mime_type = mime_type.split(";")[0].strip()
        if mime_type == "application/octet-stream" or not mime_type:
            mime_type = "audio/webm"
            
        model = genai.GenerativeModel('gemini-3.5-flash')
        response = model.generate_content([
            "Transcribe this audio exactly as spoken. Return ONLY the transcription.",
            {
                "mime_type": mime_type,
                "data": content
            }
        ])
        
        return {"transcription": response.text.strip()}
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/results")
async def save_results(result: TestResult, current_user: dict = Depends(get_current_user)):
    db = get_db()
    res_dict = result.dict()
    res_dict["user_id"] = str(current_user["_id"])
    res_dict["timestamp"] = datetime.now().isoformat()
    
    db.test_results.insert_one(res_dict)
    
    # Log activity
    db.activities.insert_one({
        "user_id": str(current_user["_id"]),
        "email": current_user["email"],
        "action": "Completed Test",
        "details": f"Scored {result.total_score}/{result.max_score} on set {result.set_id}",
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Results saved"}

@router.get("/results/latest/{set_id}")
async def get_latest_result(set_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db.test_results.find_one(
        {"user_id": str(current_user["_id"]), "set_id": set_id},
        sort=[("timestamp", -1)]
    )
    if not result:
        raise HTTPException(status_code=404, detail="No results found for this set")
    result["_id"] = str(result["_id"])
    return result
