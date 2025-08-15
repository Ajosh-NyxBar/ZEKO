from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class EmotionState(str, Enum):
    HAPPY = "happy"
    EXCITED = "excited"
    CALM = "calm"
    FRUSTRATED = "frustrated"
    CONFUSED = "confused"
    TIRED = "tired"

class SpeechRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    language_code: str = Field(default="id-ID", description="Language code for TTS")
    voice_name: str = Field(default="id-ID-Standard-A", description="Voice to use")
    speed: float = Field(default=1.0, ge=0.5, le=2.0, description="Speech speed")
    user_id: Optional[str] = Field(None, description="User ID for logging")

class SpeechResponse(BaseModel):
    success: bool
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    duration: Optional[float] = None
    message: str

class STTRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    target_word: str = Field(..., description="Word user should pronounce")
    language_code: str = Field(default="id-ID", description="Language code")
    difficulty_level: DifficultyLevel = Field(default=DifficultyLevel.EASY)

class STTResponse(BaseModel):
    success: bool
    transcript: Optional[str] = None
    confidence: Optional[float] = None
    pronunciation_score: Optional[float] = None
    feedback: str
    encouragement: str
    session_id: Optional[str] = None

class PronunciationAnalysis(BaseModel):
    target_word: str
    recognized_word: str
    similarity_score: float
    phonetic_accuracy: float
    rhythm_score: float
    clarity_score: float
    overall_score: float
    feedback_points: List[str]

class UserProfile(BaseModel):
    user_id: str
    name: str
    age: int = Field(..., ge=3, le=18)
    grade_level: Optional[str] = None
    adhd_profile: Optional[Dict[str, Any]] = None
    preferred_characters: List[str] = Field(default=["imron", "siti"])
    learning_preferences: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    last_active: Optional[datetime] = None

class LearningProgress(BaseModel):
    user_id: str
    total_sessions: int = 0
    total_words_practiced: int = 0
    average_score: float = 0.0
    current_level: DifficultyLevel = DifficultyLevel.EASY
    mastered_words: List[str] = Field(default_factory=list)
    struggling_words: List[str] = Field(default_factory=list)
    weekly_goals: Dict[str, int] = Field(default_factory=dict)
    achievements: List[str] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.now)

class SpeechSession(BaseModel):
    session_id: Optional[str] = None
    user_id: str
    word_practiced: str
    difficulty_level: DifficultyLevel
    pronunciation_score: float
    emotion_detected: Optional[EmotionState] = None
    duration_seconds: float
    attempts_count: int = 1
    success_rate: float
    feedback_given: str
    audio_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    
class EmotionAnalysisRequest(BaseModel):
    user_id: str
    audio_features: Dict[str, float]  # MFCC features
    context: Optional[Dict[str, Any]] = None

class EmotionAnalysisResponse(BaseModel):
    success: bool
    emotion: Optional[EmotionState] = None
    confidence: float = 0.0
    recommendations: List[str] = Field(default_factory=list)
    adaptive_response: str = ""

class WordPracticeSet(BaseModel):
    category: str
    difficulty: DifficultyLevel
    words: List[str]
    phonetic_guides: Dict[str, str] = Field(default_factory=dict)
    age_appropriate: bool = True

class GameificationReward(BaseModel):
    user_id: str
    reward_type: str  # "badge", "points", "character_unlock"
    reward_name: str
    points_earned: int = 0
    description: str
    earned_at: datetime = Field(default_factory=datetime.now)

class AdaptiveLearningResponse(BaseModel):
    next_words: List[str]
    difficulty_adjustment: str  # "increase", "decrease", "maintain"
    recommended_break: bool = False
    encouragement_strategy: str
    character_interaction: str

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, bool]
    version: str = "1.0.0"
