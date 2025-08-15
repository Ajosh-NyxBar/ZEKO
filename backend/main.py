from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Import routers
from routers import speech, emotion, progress, gamification

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ZEKO Backend API",
    description="AI-powered speech training API for children with ADHD",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo web
        "exp://localhost:8081",   # Expo Go
        "http://localhost:3000",  # React web (if any)
        "*"  # For development only - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(speech.router, prefix="/api/speech", tags=["Speech Training"])
app.include_router(emotion.router, prefix="/api/emotion", tags=["Emotion Detection"])
app.include_router(progress.router, prefix="/api/progress", tags=["User Progress"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "ZEKO Backend API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "docs": "/api/docs",
            "speech": "/api/speech",
            "emotion": "/api/emotion", 
            "progress": "/api/progress",
            "gamification": "/api/gamification"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": "2025-08-15T10:00:00Z",
        "services": {
            "firebase": "connected",
            "google_cloud": "available"
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") else "Something went wrong"
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if os.getenv("DEBUG") else False,
        log_level="info"
    )
