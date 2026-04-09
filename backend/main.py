from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import user

app = FastAPI(title="Project Auth Backend", version="1.0.0")

# CORS Setup: Essential for React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our modular routers
app.include_router(user.router)

@app.get("/health")
def health_check():
    return {"status": "online"}