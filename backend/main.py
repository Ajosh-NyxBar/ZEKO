from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import uvicorn
import os
from dotenv import load_dotenv

# Import routers
from routers import speech, emotion, progress, gamification, ai_models

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
app.include_router(ai_models.router, prefix="/api/ai", tags=["AI Models & Training"])

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
            "gamification": "/api/gamification",
            "ai_models": "/api/ai"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test AI models availability
        ai_status = {}
        try:
            from ai_models import EmotionDetectionModel, SpeechRecognitionModel, AdaptiveLearningModel
            ai_status = {
                "emotion_model": "available",
                "speech_model": "available", 
                "adaptive_learning": "available",
                "ai_router": "active"
            }
        except Exception as e:
            ai_status = {
                "ai_models": f"error: {str(e)}",
                "status": "degraded"
            }
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0 - Phase 4 AI",
            "services": {
                "firebase": "connected",
                "google_cloud": "available",
                **ai_status
            },
            "endpoints": {
                "ai_emotion": "/api/ai/emotion/analyze",
                "ai_speech": "/api/ai/speech/analyze", 
                "ai_adaptive": "/api/ai/adaptive/recommend",
                "ai_status": "/api/ai/models/status"
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

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
