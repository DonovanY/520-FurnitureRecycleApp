from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import user, listings, profile
from app.api.notifications import router as notifications_router
from app.api.requests import router as requests_router
from app.api.messages import router as messages_router

app = FastAPI(title="FurnitureRecycle Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(listings.router)
app.include_router(notifications_router, prefix="/api/v1", tags=["notifications"])
app.include_router(profile.router)
app.include_router(requests_router, prefix="/api/v1", tags=["requests"])
app.include_router(messages_router, prefix="/api/v1", tags=["messages"])

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
def health_check():
    return {"status": "online"}