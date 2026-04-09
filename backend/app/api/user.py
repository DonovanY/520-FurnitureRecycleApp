from fastapi import APIRouter, Depends
from app.middleware.security import validate_token

router = APIRouter(prefix="/api/v1/user", tags=["user"])

@router.get("/me")
async def read_user_me(user: dict = Depends(validate_token)):
    # 'user' is the decoded JWT payload from Supabase
    return {
        "id": user.get("sub"),
        "email": user.get("email"),
        "status": "authenticated"
    }