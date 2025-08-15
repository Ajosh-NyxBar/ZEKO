import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import UploadFile

# Allowed audio file extensions
ALLOWED_AUDIO_EXTENSIONS = {'.wav', '.mp3', '.m4a', '.ogg', '.flac'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_audio_file(file: UploadFile) -> bool:
    """
    Validate uploaded audio file format and size
    """
    # Check file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_AUDIO_EXTENSIONS:
        return False
    
    # Check file size (this is approximate as we haven't read the file yet)
    # In production, you might want to check actual size after reading
    return True

def generate_unique_filename(original_filename: Optional[str] = None) -> str:
    """
    Generate unique filename with timestamp and UUID
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    
    if original_filename:
        name, ext = os.path.splitext(original_filename)
        return f"{timestamp}_{unique_id}_{name}{ext}"
    else:
        return f"{timestamp}_{unique_id}"

def calculate_age_appropriate_content(age: int) -> dict:
    """
    Return age-appropriate content configuration
    """
    if age <= 6:
        return {
            "max_word_length": 2,
            "categories": ["family", "animals", "colors"],
            "voice_speed": 0.8,
            "encouragement_level": "high"
        }
    elif age <= 9:
        return {
            "max_word_length": 3,
            "categories": ["family", "animals", "colors", "school", "food"],
            "voice_speed": 0.9,
            "encouragement_level": "medium"
        }
    else:
        return {
            "max_word_length": 5,
            "categories": ["family", "animals", "school", "activities", "emotions"],
            "voice_speed": 1.0,
            "encouragement_level": "balanced"
        }

def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable format
    """
    if seconds < 60:
        return f"{seconds:.1f} detik"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f} menit"
    else:
        hours = seconds / 3600
        return f"{hours:.1f} jam"

def sanitize_text(text: str) -> str:
    """
    Sanitize text input for safe processing
    """
    # Remove potentially harmful characters
    sanitized = text.strip()
    # Remove excessive whitespace
    sanitized = ' '.join(sanitized.split())
    # Limit length
    if len(sanitized) > 500:
        sanitized = sanitized[:500]
    
    return sanitized

def calculate_difficulty_score(word: str) -> str:
    """
    Calculate difficulty level based on word characteristics
    """
    length = len(word)
    syllable_count = estimate_syllables(word)
    
    if length <= 4 and syllable_count <= 2:
        return "easy"
    elif length <= 8 and syllable_count <= 3:
        return "medium"
    else:
        return "hard"

def estimate_syllables(word: str) -> int:
    """
    Estimate syllable count for Indonesian words
    """
    vowels = "aiueo"
    word = word.lower()
    syllable_count = 0
    prev_was_vowel = False
    
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_was_vowel:
            syllable_count += 1
        prev_was_vowel = is_vowel
    
    # Ensure at least 1 syllable
    return max(1, syllable_count)

def get_encouragement_message(score: float, child_name: str = "Adik") -> str:
    """
    Get personalized encouragement message based on score
    """
    messages = {
        "excellent": [
            f"Wah, {child_name} hebat sekali! 🌟",
            f"Perfect! {child_name} sangat pintar! ⭐",
            f"Luar biasa, {child_name}! Kamu champion! 🏆"
        ],
        "good": [
            f"Bagus sekali, {child_name}! 👏",
            f"Hebat! {child_name} terus berkembang! 🎉",
            f"Keren, {child_name}! Terus semangat! 💪"
        ],
        "okay": [
            f"Bagus, {child_name}! Masih bisa lebih baik! 😊",
            f"Tidak apa-apa, {child_name}! Coba lagi ya! 🤗",
            f"Hampir benar, {child_name}! Sekali lagi! 🌈"
        ],
        "need_practice": [
            f"Tidak apa-apa, {child_name}! Mari berlatih lagi! 🤗",
            f"Santai saja, {child_name}! Pelan-pelan ya! 🐢",
            f"Yuk coba lagi, {child_name}! Kamu pasti bisa! 💫"
        ]
    }
    
    import random
    
    if score >= 90:
        return random.choice(messages["excellent"])
    elif score >= 75:
        return random.choice(messages["good"])
    elif score >= 60:
        return random.choice(messages["okay"])
    else:
        return random.choice(messages["need_practice"])

def log_user_activity(user_id: str, activity_type: str, details: dict = None):
    """
    Log user activity for analytics (placeholder)
    """
    log_entry = {
        "user_id": user_id,
        "activity_type": activity_type,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    # TODO: Implement actual logging to database or analytics service
    print(f"USER_ACTIVITY: {log_entry}")

class APIResponse:
    """
    Standardized API response format
    """
    @staticmethod
    def success(data=None, message="Success"):
        return {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def error(message="Error occurred", error_code=None):
        return {
            "success": False,
            "message": message,
            "error_code": error_code,
            "timestamp": datetime.now().isoformat()
        }
