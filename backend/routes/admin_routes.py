from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from routes.auth_routes import get_current_user

router = APIRouter()

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

@router.get("/users")
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    db = get_db()
    users = list(db.users.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.get("/activities")
async def get_all_activities(admin_user: dict = Depends(get_admin_user)):
    db = get_db()
    activities = list(db.activities.find().sort("_id", -1).limit(100))
    for a in activities:
        a["_id"] = str(a["_id"])
    return activities
