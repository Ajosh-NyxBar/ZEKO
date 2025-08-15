from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
import aiofiles
import os
from typing import Dict, Any
from pydantic import BaseModel

from services.google_cloud import google_cloud_service
from services.firebase import firebase_service
from utils.helpers import validate_audio_file, generate_unique_filename

router = APIRouter()

# Pydantic models for request/response
class SpeechToTextRequest(BaseModel):
    user_id: str
    session_id: str
    expected_text: str = None
    difficulty_level: str = "easy"

class SpeechToTextResponse(BaseModel):
    recognized_text: str
    confidence: float
    accuracy_score: float = None
    pronunciation_score: float = None
    feedback: str
    points_awarded: int

class TextToSpeechRequest(BaseModel):
    text: str
    voice_name: str = "id-ID-Standard-A"  # Indonesian female voice
    speed: float = 1.0
    pitch: float = 0.0

class PronunciationAnalysisResponse(BaseModel):
    overall_score: float
    phoneme_scores: Dict[str, float]
    suggestions: list[str]
    common_mistakes: list[str]

# Initialize services (already imported as instances)
# google_cloud_service and firebase_service are ready to use

@router.post("/stt", response_model=SpeechToTextResponse)
async def speech_to_text(
    audio_file: UploadFile = File(...),
    request_data: SpeechToTextRequest = Depends()
):
    """
    Convert speech audio to text and analyze pronunciation accuracy
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
        
        # Process speech-to-text with Google Cloud
        recognition_result = google_cloud_service.speech_to_text(
            audio_path=temp_path,
            language_code="id-ID"  # Indonesian
        )
        
        # Calculate accuracy if expected text is provided
        accuracy_score = None
        pronunciation_score = None
        points_awarded = 0
        
        if request_data.expected_text:
            accuracy_score = calculate_text_accuracy(
                expected=request_data.expected_text,
                actual=recognition_result["text"]
            )
            
            pronunciation_score = await analyze_pronunciation(
                audio_path=temp_path,
                expected_text=request_data.expected_text
            )
            
            # Award points based on performance
            points_awarded = calculate_points(accuracy_score, pronunciation_score)
        
        # Generate feedback message
        feedback = generate_feedback(accuracy_score, pronunciation_score)
        
        # Save progress to Firebase
        await firebase_service.save_speech_progress(
            user_id=request_data.user_id,
            session_id=request_data.session_id,
            recognized_text=recognition_result["text"],
            expected_text=request_data.expected_text,
            accuracy_score=accuracy_score,
            points_awarded=points_awarded
        )
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return SpeechToTextResponse(
            recognized_text=recognition_result["text"],
            confidence=recognition_result["confidence"],
            accuracy_score=accuracy_score,
            pronunciation_score=pronunciation_score,
            feedback=feedback,
            points_awarded=points_awarded
        )
        
    except Exception as e:
        # Clean up on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Speech processing failed: {str(e)}")

@router.post("/tts")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech audio file
    """
    try:
        # Generate speech audio using Google Cloud TTS
        audio_content = google_cloud_service.text_to_speech(
            text=request.text,
            voice_name=request.voice_name,
            speed=request.speed,
            pitch=request.pitch
        )
        
        # Save audio to temporary file
        temp_filename = f"tts_{generate_unique_filename('audio.mp3')}"
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        async with aiofiles.open(temp_path, 'wb') as f:
            await f.write(audio_content)
        
        # Return audio file
        return FileResponse(
            path=temp_path,
            media_type="audio/mpeg",
            filename=temp_filename,
            headers={"Content-Disposition": f"attachment; filename={temp_filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech failed: {str(e)}")

@router.post("/analyze", response_model=PronunciationAnalysisResponse)
async def analyze_pronunciation_detailed(
    audio_file: UploadFile = File(...),
    expected_text: str = None
):
    """
    Detailed pronunciation analysis with phoneme-level feedback
    """
    try:
        if not expected_text:
            raise HTTPException(status_code=400, detail="Expected text is required for analysis")
        
        # Save uploaded audio temporarily
        temp_filename = generate_unique_filename(audio_file.filename)
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        # Perform basic pronunciation analysis
        # TODO: Implement detailed pronunciation analysis
        analysis_result = {
            "similarity_score": 0.85,
            "pronunciation_feedback": "Good pronunciation!",
            "areas_for_improvement": ["Speak slightly slower"],
            "overall_score": 85
        }
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return PronunciationAnalysisResponse(**analysis_result)
        
    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Pronunciation analysis failed: {str(e)}")

# Helper functions
def calculate_text_accuracy(expected: str, actual: str) -> float:
    """Calculate text similarity/accuracy percentage"""
    from difflib import SequenceMatcher
    return SequenceMatcher(None, expected.lower(), actual.lower()).ratio() * 100

async def analyze_pronunciation(audio_path: str, expected_text: str) -> float:
    """Analyze pronunciation quality (placeholder for ML model)"""
    # TODO: Implement actual pronunciation analysis using ML model
    # For now, return a simulated score
    import random
    return random.uniform(70.0, 95.0)

def calculate_points(accuracy_score: float = None, pronunciation_score: float = None) -> int:
    """Calculate points based on performance"""
    if not accuracy_score:
        return 0
    
    base_points = 10
    accuracy_bonus = int(accuracy_score / 10)  # 1 point per 10% accuracy
    
    if pronunciation_score:
        pronunciation_bonus = int(pronunciation_score / 20)  # 1 point per 20% pronunciation
        return base_points + accuracy_bonus + pronunciation_bonus
    
    return base_points + accuracy_bonus

def generate_feedback(accuracy_score: float = None, pronunciation_score: float = None) -> str:
    """Generate encouraging feedback message"""
    if not accuracy_score:
        return "Coba lagi! Dengarkan dengan baik dan ulangi kata yang diucapkan."
    
    if accuracy_score >= 90:
        return "Excellent! Kamu berhasil mengucapkan dengan sangat baik! 🌟"
    elif accuracy_score >= 80:
        return "Bagus sekali! Hampir sempurna, terus berlatih! 👏"
    elif accuracy_score >= 70:
        return "Bagus! Masih bisa lebih baik lagi, coba sekali lagi! 😊"
    elif accuracy_score >= 60:
        return "Hampir benar! Dengarkan sekali lagi dan coba ulangi dengan jelas! 💪"
    else:
        return "Tidak apa-apa! Mari dengarkan contohnya lagi dan coba perlahan-lahan! 🤗"
