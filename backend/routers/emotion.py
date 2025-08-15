from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
import aiofiles
import os
from typing import Dict, List, Optional
import logging

from services.firebase import firebase_service
from utils.helpers import validate_audio_file, generate_unique_filename

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class EmotionDetectionRequest(BaseModel):
    user_id: str
    session_id: str
    context: str = "speech_training"  # context of the audio recording

class EmotionDetectionResponse(BaseModel):
    emotion: str
    confidence: float
    emotions_breakdown: Dict[str, float]
    recommendation: str
    timestamp: str

class EmotionHistoryResponse(BaseModel):
    user_id: str
    emotions: List[Dict]
    emotion_trends: Dict[str, float]
    recommendations: List[str]

@router.post("/detect", response_model=EmotionDetectionResponse)
async def detect_emotion(
    audio_file: UploadFile = File(...),
    request_data: EmotionDetectionRequest = Depends()
):
    """
    Detect emotion from audio file using voice analysis
    """
    try:
        # Validate audio file
        if not validate_audio_file(audio_file):
            raise HTTPException(status_code=400, detail="Invalid audio file format")
        
        # Save uploaded audio temporarily
        temp_filename = generate_unique_filename(audio_file.filename)
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        # TODO: Implement actual emotion detection ML model
        # For now, return simulated emotion detection
        emotion_result = simulate_emotion_detection(temp_path)
        
        # Save emotion data to Firebase
        await firebase_service.save_emotion_data(
            user_id=request_data.user_id,
            session_id=request_data.session_id,
            emotion=emotion_result["emotion"],
            confidence=emotion_result["confidence"],
            context=request_data.context
        )
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return EmotionDetectionResponse(**emotion_result)
        
    except Exception as e:
        # Clean up on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Emotion detection failed: {str(e)}")

@router.get("/history/{user_id}", response_model=EmotionHistoryResponse)
async def get_emotion_history(user_id: str, limit: int = 50):
    """
    Get emotion history for a specific user
    """
    try:
        # Get emotion history from Firebase
        emotion_data = await firebase_service.get_emotion_history(user_id, limit)
        
        # Calculate emotion trends
        emotion_trends = calculate_emotion_trends(emotion_data)
        
        # Generate recommendations based on emotion patterns
        recommendations = generate_emotion_recommendations(emotion_trends)
        
        return EmotionHistoryResponse(
            user_id=user_id,
            emotions=emotion_data,
            emotion_trends=emotion_trends,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get emotion history: {str(e)}")

@router.get("/analytics/{user_id}")
async def get_emotion_analytics(user_id: str, days: int = 7):
    """
    Get emotion analytics for the past N days
    """
    try:
        # Get recent emotion data
        analytics_data = await firebase_service.get_emotion_analytics(user_id, days)
        
        return {
            "user_id": user_id,
            "period_days": days,
            "dominant_emotion": analytics_data.get("dominant_emotion", "happy"),
            "emotion_stability": analytics_data.get("stability_score", 0.75),
            "improvement_areas": analytics_data.get("improvement_areas", []),
            "positive_emotion_ratio": analytics_data.get("positive_ratio", 0.8),
            "daily_breakdown": analytics_data.get("daily_breakdown", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get emotion analytics: {str(e)}")

# Helper functions
def simulate_emotion_detection(audio_path: str) -> Dict:
    """
    Simulate emotion detection (placeholder for ML model)
    TODO: Replace with actual ML model using MFCC features + MLP
    """
    import random
    from datetime import datetime
    
    emotions = ["happy", "sad", "excited", "calm", "frustrated", "confident"]
    weights = [0.4, 0.1, 0.3, 0.15, 0.05, 0.25]  # Bias towards positive emotions for children
    
    detected_emotion = random.choices(emotions, weights=weights)[0]
    confidence = random.uniform(0.75, 0.95)
    
    # Generate emotion breakdown
    emotions_breakdown = {}
    remaining_confidence = 1.0 - confidence
    
    for emotion in emotions:
        if emotion == detected_emotion:
            emotions_breakdown[emotion] = confidence
        else:
            emotions_breakdown[emotion] = random.uniform(0, remaining_confidence / (len(emotions) - 1))
    
    # Generate recommendation
    recommendation = generate_emotion_recommendation(detected_emotion, confidence)
    
    return {
        "emotion": detected_emotion,
        "confidence": confidence,
        "emotions_breakdown": emotions_breakdown,
        "recommendation": recommendation,
        "timestamp": datetime.utcnow().isoformat()
    }

def generate_emotion_recommendation(emotion: str, confidence: float) -> str:
    """
    Generate recommendation based on detected emotion
    """
    recommendations = {
        "happy": "Mood yang bagus! Terus semangat belajar! 😊",
        "excited": "Wah, kamu sangat antusias! Gunakan energi ini untuk belajar! 🌟",
        "calm": "Kamu terlihat tenang dan fokus. Waktu yang tepat untuk belajar! 😌",
        "confident": "Percaya diri! Coba tantangan yang lebih sulit! 💪",
        "sad": "Tidak apa-apa merasa sedih. Mari coba aktivitas yang menyenangkan! 🤗",
        "frustrated": "Jangan menyerah! Istirahatlah sebentar, lalu coba lagi! 💆‍♀️"
    }
    
    base_recommendation = recommendations.get(emotion, "Terus semangat belajar!")
    
    if confidence > 0.9:
        return f"{base_recommendation} (Deteksi sangat akurat)"
    elif confidence > 0.8:
        return f"{base_recommendation}"
    else:
        return f"{base_recommendation} (Mungkin perlu konfirmasi lebih lanjut)"

def calculate_emotion_trends(emotion_data: List[Dict]) -> Dict[str, float]:
    """
    Calculate emotion trends from historical data
    """
    if not emotion_data:
        return {}
    
    emotion_counts = {}
    total_sessions = len(emotion_data)
    
    for session in emotion_data:
        emotion = session.get("emotion", "unknown")
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Calculate percentages
    emotion_trends = {}
    for emotion, count in emotion_counts.items():
        emotion_trends[emotion] = (count / total_sessions) * 100
    
    return emotion_trends

def generate_emotion_recommendations(emotion_trends: Dict[str, float]) -> List[str]:
    """
    Generate recommendations based on emotion trends
    """
    recommendations = []
    
    # Check for concerning patterns
    if emotion_trends.get("frustrated", 0) > 30:
        recommendations.append("Coba atur tingkat kesulitan yang lebih mudah")
        recommendations.append("Berikan lebih banyak istirahat antar sesi")
    
    if emotion_trends.get("sad", 0) > 20:
        recommendations.append("Berikan aktivitas yang lebih menyenangkan")
        recommendations.append("Konsultasi dengan ahli jika pola ini berlanjut")
    
    # Positive reinforcement
    if emotion_trends.get("happy", 0) > 60:
        recommendations.append("Pertahankan pola belajar yang positif ini!")
    
    if emotion_trends.get("confident", 0) > 40:
        recommendations.append("Anak siap untuk tantangan yang lebih sulit")
    
    # Default recommendation
    if not recommendations:
        recommendations.append("Terus berikan dukungan dan motivasi positif")
    
    return recommendations
