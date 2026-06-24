import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "flashcards_db")

try:
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

def get_db():
    return db
