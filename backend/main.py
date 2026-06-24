from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.flashcard_routes import router as flashcard_router
from routes.admin_routes import router as admin_router

app = FastAPI(title="AI-Powered Flashcard System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(flashcard_router, prefix="/api/flashcards", tags=["flashcards"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Powered Flashcard System API"}
