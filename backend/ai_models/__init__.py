"""
ZEKO AI Models Package
======================

This package contains all AI and ML models for the ZEKO speech therapy application.

Models included:
- EmotionDetectionModel: Detects emotions from audio using MFCC + MLP
- SpeechRecognitionModel: Custom STT with pronunciation scoring
- AdaptiveLearningModel: Adjusts difficulty based on user performance
- AudioFeatureExtractor: Extracts MFCC and other audio features
"""

from .emotion_model import EmotionDetectionModel
from .speech_model import SpeechRecognitionModel
from .adaptive_learning import AdaptiveLearningModel
from .audio_features import AudioFeatureExtractor

__all__ = [
    'EmotionDetectionModel',
    'SpeechRecognitionModel', 
    'AdaptiveLearningModel',
    'AudioFeatureExtractor'
]

__version__ = "1.0.0"
