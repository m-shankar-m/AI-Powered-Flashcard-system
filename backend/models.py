from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Flashcard(BaseModel):
    question: str
    answer: str

class FlashcardSet(BaseModel):
    title: str
    flashcards: List[Flashcard]

class GradeRequest(BaseModel):
    user_answer: str
    correct_answer: str

class GradeResponse(BaseModel):
    score: int
    is_correct: bool
    feedback: str

class TestResult(BaseModel):
    set_id: str
    total_score: int
    max_score: int
    wrong_answers: List[dict] # {question, correct_answer, user_answer}
