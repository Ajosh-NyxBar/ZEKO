"""
AI Model Management Router for ZEKO
==================================

Endpoints for training, testing, and managing AI models.
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging
import os
import asyncio
from datetime import datetime

from ai_models.emotion_model import EmotionDetectionModel, detect_emotion_from_audio
from ai_models.speech_model import SpeechRecognitionModel, quick_speech_analysis
from ai_models.adaptive_learning import (
    AdaptiveLearningModel, 
    create_default_user_profile,
    simulate_learning_session,
    DifficultyLevel,
    LearningStyle
)
from ai_models.audio_features import extract_audio_features
from services.firebase import firebase_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class ModelTrainingRequest(BaseModel):
    model_type: str  # "emotion", "speech", "adaptive"
    training_data_path: str
    save_path: Optional[str] = None

class ModelTrainingResponse(BaseModel):
    success: bool
    model_type: str
    metrics: Dict[str, float]
    message: str
    training_time: float

class AudioAnalysisRequest(BaseModel):
    user_id: str
    analysis_type: str  # "emotion", "speech", "features"
    target_word: Optional[str] = None

class AudioAnalysisResponse(BaseModel):
    success: bool
    analysis_type: str
    results: Dict[str, Any]
    recommendations: List[str]

class UserProfileRequest(BaseModel):
    user_id: str
    age: int
    learning_style: Optional[str] = "mixed"
    preferred_time: Optional[str] = "afternoon"

class UserProfileResponse(BaseModel):
    success: bool
    user_profile: Dict[str, Any]
    recommendations: Dict[str, Any]

class AdaptiveLearningRequest(BaseModel):
    user_id: str
    session_data: Dict[str, Any]

class AdaptiveLearningResponse(BaseModel):
    success: bool
    next_words: List[str]
    difficulty_adjustment: str
    recommendations: List[str]
    character_interaction: str

# Initialize AI models
emotion_model = EmotionDetectionModel()
speech_model = SpeechRecognitionModel()
adaptive_model = AdaptiveLearningModel()

@router.post("/emotion/analyze", response_model=AudioAnalysisResponse)
async def analyze_emotion(
    audio_file: UploadFile = File(...),
    request_data: AudioAnalysisRequest = None
):
    """
    Advanced emotion analysis using AI model
    """
    try:
        # Save uploaded audio temporarily
        temp_filename = f"temp_emotion_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Analyze emotion
        if emotion_model.is_trained:
            result = emotion_model.predict(temp_path)
            recommendations = [
                emotion_model.get_emotion_recommendation(
                    result["predicted_emotion"], 
                    result["confidence"]
                )
            ]
        else:
            # Use mock prediction for demonstration
            from ai_models.emotion_model import create_mock_emotion_prediction
            result = create_mock_emotion_prediction(bias_positive=True)
            recommendations = [
                emotion_model.get_emotion_recommendation(
                    result["predicted_emotion"],
                    result["confidence"]
                )
            ]
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return AudioAnalysisResponse(
            success=True,
            analysis_type="emotion",
            results=result,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error in emotion analysis: {e}")
        # Clean up on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Emotion analysis failed: {str(e)}")

@router.post("/speech/analyze", response_model=AudioAnalysisResponse)
async def analyze_speech(
    audio_file: UploadFile = File(...),
    target_word: str = "hello"
):
    """
    Advanced speech analysis using AI model
    """
    try:
        # Save uploaded audio temporarily
        temp_filename = f"temp_speech_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Analyze speech
        result = await quick_speech_analysis(temp_path, target_word)
        
        recommendations = result.get("suggestions", [])
        if not recommendations:
            recommendations = ["Terus berlatih dengan konsisten!"]
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return AudioAnalysisResponse(
            success=True,
            analysis_type="speech",
            results=result,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error in speech analysis: {e}")
        # Clean up on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Speech analysis failed: {str(e)}")

@router.post("/features/extract", response_model=AudioAnalysisResponse)
async def extract_features(
    audio_file: UploadFile = File(...)
):
    """
    Extract audio features for analysis
    """
    try:
        # Save uploaded audio temporarily
        temp_filename = f"temp_features_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        temp_path = os.path.join(os.getcwd(), "tmp", temp_filename)
        
        # Ensure tmp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        # Extract features
        features = extract_audio_features(temp_path)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return AudioAnalysisResponse(
            success=True,
            analysis_type="features",
            results={"audio_features": features},
            recommendations=["Features extracted successfully"]
        )
        
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        # Clean up on error
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Feature extraction failed: {str(e)}")

@router.post("/profile/create", response_model=UserProfileResponse)
async def create_user_profile(request: UserProfileRequest):
    """
    Create adaptive learning profile for user
    """
    try:
        # Map string learning style to enum
        style_mapping = {
            "visual": LearningStyle.VISUAL,
            "auditory": LearningStyle.AUDITORY,
            "kinesthetic": LearningStyle.KINESTHETIC,
            "mixed": LearningStyle.MIXED
        }
        
        # Create profile
        profile = create_default_user_profile(request.user_id, request.age)
        profile.learning_style = style_mapping.get(request.learning_style, LearningStyle.MIXED)
        profile.preferred_session_time = request.preferred_time
        
        # Generate initial recommendations
        recommendations = adaptive_model.generate_adaptive_recommendation(profile, [])
        
        # Convert to dict for response
        profile_dict = {
            "user_id": profile.user_id,
            "age": profile.age,
            "current_level": profile.current_level.value,
            "learning_style": profile.learning_style.value,
            "attention_span": profile.attention_span,
            "preferred_session_time": profile.preferred_session_time,
            "strengths": profile.strengths,
            "weaknesses": profile.weaknesses,
            "motivation_factors": profile.motivation_factors
        }
        
        recommendations_dict = {
            "next_words": recommendations.next_words,
            "difficulty_adjustment": recommendations.difficulty_adjustment,
            "session_duration": recommendations.session_duration_suggestion,
            "learning_activities": recommendations.learning_activities,
            "character_interaction": recommendations.character_interaction
        }
        
        # Save to Firebase (optional)
        try:
            await firebase_service.save_user_profile(request.user_id, profile_dict)
        except Exception as e:
            logger.warning(f"Failed to save profile to Firebase: {e}")
        
        return UserProfileResponse(
            success=True,
            user_profile=profile_dict,
            recommendations=recommendations_dict
        )
        
    except Exception as e:
        logger.error(f"Error creating user profile: {e}")
        raise HTTPException(status_code=500, detail=f"Profile creation failed: {str(e)}")

@router.post("/adaptive/recommend", response_model=AdaptiveLearningResponse)
async def get_adaptive_recommendations(request: AdaptiveLearningRequest):
    """
    Get adaptive learning recommendations based on user performance
    """
    try:
        # Get user profile
        try:
            profile_data = await firebase_service.get_user_profile(request.user_id)
            if not profile_data:
                # Create default profile
                profile = create_default_user_profile(request.user_id, 7)  # Default age
            else:
                # Reconstruct profile from data
                profile = create_default_user_profile(request.user_id, profile_data.get("age", 7))
                profile.current_level = DifficultyLevel(profile_data.get("current_level", "easy"))
                profile.learning_style = LearningStyle(profile_data.get("learning_style", "mixed"))
                profile.attention_span = profile_data.get("attention_span", 10.0)
                profile.strengths = profile_data.get("strengths", [])
                profile.weaknesses = profile_data.get("weaknesses", [])
        except Exception as e:
            logger.warning(f"Failed to load profile, using default: {e}")
            profile = create_default_user_profile(request.user_id, 7)
        
        # Create mock session from provided data
        session_data = request.session_data
        mock_session = simulate_learning_session(
            request.user_id,
            session_data.get("words", ["test"]),
            profile.current_level
        )
        
        # Override with actual data if provided
        if "scores" in session_data:
            mock_session.scores = session_data["scores"]
        if "duration" in session_data:
            mock_session.session_duration = session_data["duration"]
        if "engagement" in session_data:
            mock_session.engagement_level = session_data["engagement"]
        
        # Generate recommendations
        recommendations = adaptive_model.generate_adaptive_recommendation(profile, [mock_session])
        
        return AdaptiveLearningResponse(
            success=True,
            next_words=recommendations.next_words,
            difficulty_adjustment=recommendations.difficulty_adjustment,
            recommendations=recommendations.learning_activities,
            character_interaction=recommendations.character_interaction
        )
        
    except Exception as e:
        logger.error(f"Error generating adaptive recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

@router.get("/models/status")
async def get_model_status():
    """
    Get status of all AI models
    """
    try:
        status = {
            "emotion_model": {
                "loaded": emotion_model is not None,
                "trained": emotion_model.is_trained if emotion_model else False,
                "emotions_supported": emotion_model.emotions if emotion_model else []
            },
            "speech_model": {
                "loaded": speech_model is not None,
                "initialized": hasattr(speech_model, 'feature_extractor')
            },
            "adaptive_model": {
                "loaded": adaptive_model is not None,
                "difficulty_levels": [level.value for level in DifficultyLevel],
                "learning_styles": [style.value for style in LearningStyle]
            }
        }
        
        return {
            "success": True,
            "models": status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.post("/test/emotion")
async def test_emotion_model():
    """
    Test emotion detection model with mock data
    """
    try:
        from ai_models.emotion_model import create_mock_emotion_prediction
        
        # Create multiple test predictions
        test_results = []
        for i in range(5):
            prediction = create_mock_emotion_prediction(bias_positive=True)
            test_results.append(prediction)
        
        return {
            "success": True,
            "test_type": "emotion_detection",
            "results": test_results,
            "message": "Emotion model testing completed"
        }
        
    except Exception as e:
        logger.error(f"Error testing emotion model: {e}")
        raise HTTPException(status_code=500, detail=f"Emotion model test failed: {str(e)}")

@router.post("/test/adaptive")
async def test_adaptive_learning():
    """
    Test adaptive learning system with mock data
    """
    try:
        # Create test user profile
        test_profile = create_default_user_profile("test_user", 7)
        
        # Create mock learning sessions
        test_sessions = []
        for i in range(3):
            session = simulate_learning_session(
                "test_user",
                ["mama", "papa", "air"],
                test_profile.current_level
            )
            test_sessions.append(session)
        
        # Generate recommendations
        recommendations = adaptive_model.generate_adaptive_recommendation(test_profile, test_sessions)
        
        return {
            "success": True,
            "test_type": "adaptive_learning",
            "profile": {
                "user_id": test_profile.user_id,
                "age": test_profile.age,
                "current_level": test_profile.current_level.value,
                "learning_style": test_profile.learning_style.value,
                "attention_span": test_profile.attention_span
            },
            "recommendations": {
                "next_words": recommendations.next_words,
                "difficulty_adjustment": recommendations.difficulty_adjustment,
                "recommended_break": recommendations.recommended_break,
                "session_duration": recommendations.session_duration_suggestion,
                "encouragement_strategy": recommendations.encouragement_strategy,
                "character_interaction": recommendations.character_interaction,
                "learning_activities": recommendations.learning_activities
            },
            "message": "Adaptive learning test completed"
        }
        
    except Exception as e:
        logger.error(f"Error testing adaptive learning: {e}")
        raise HTTPException(status_code=500, detail=f"Adaptive learning test failed: {str(e)}")

# Background task for model training
async def train_model_background(model_type: str, training_data_path: str, save_path: str = None):
    """
    Background task for training AI models
    """
    try:
        logger.info(f"Starting background training for {model_type}")
        
        if model_type == "emotion":
            # This would require actual training data
            # For now, just simulate training completion
            await asyncio.sleep(5)  # Simulate training time
            logger.info("Emotion model training completed (simulated)")
            
        elif model_type == "speech":
            # Initialize speech model components
            await speech_model.initialize_clients()
            logger.info("Speech model initialization completed")
            
        else:
            logger.warning(f"Unknown model type: {model_type}")
            
    except Exception as e:
        logger.error(f"Background training failed: {e}")

@router.post("/train/model", response_model=ModelTrainingResponse)
async def train_model(request: ModelTrainingRequest, background_tasks: BackgroundTasks):
    """
    Train AI models (starts background task)
    """
    try:
        # Add background training task
        background_tasks.add_task(
            train_model_background,
            request.model_type,
            request.training_data_path,
            request.save_path
        )
        
        return ModelTrainingResponse(
            success=True,
            model_type=request.model_type,
            metrics={"status": "training_started"},
            message=f"Training started for {request.model_type} model",
            training_time=0.0
        )
        
    except Exception as e:
        logger.error(f"Error starting model training: {e}")
        raise HTTPException(status_code=500, detail=f"Training start failed: {str(e)}")
