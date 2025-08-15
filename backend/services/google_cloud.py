import os
import json
import logging
from typing import Optional, Dict, Any
from google.cloud import speech, texttospeech
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

class GoogleCloudService:
    """
    Google Cloud Speech-to-Text and Text-to-Speech service
    """
    
    def __init__(self):
        self.credentials = None
        self.speech_client = None
        self.tts_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """
        Initialize Google Cloud clients with service account credentials
        """
        try:
            # Load service account from environment or file
            service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            
            if service_account_path and os.path.exists(service_account_path):
                # Load from file
                self.credentials = service_account.Credentials.from_service_account_file(
                    service_account_path
                )
            else:
                # Load from environment variable (JSON string)
                service_account_info = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')
                if service_account_info:
                    service_account_dict = json.loads(service_account_info)
                    self.credentials = service_account.Credentials.from_service_account_info(
                        service_account_dict
                    )
            
            if self.credentials:
                self.speech_client = speech.SpeechClient(credentials=self.credentials)
                self.tts_client = texttospeech.TextToSpeechClient(credentials=self.credentials)
                logger.info("Google Cloud clients initialized successfully")
            else:
                logger.warning("Google Cloud credentials not found. Services will be limited.")
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud clients: {str(e)}")
    
    def speech_to_text(self, audio_content: bytes, language_code: str = "id-ID") -> Optional[str]:
        """
        Convert speech audio to text using Google Cloud Speech-to-Text
        """
        if not self.speech_client:
            logger.error("Speech client not initialized")
            return None
        
        try:
            # Configure audio settings
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_confidence=True,
                enable_word_time_offsets=True,
            )
            
            # Perform speech recognition
            response = self.speech_client.recognize(config=config, audio=audio)
            
            if response.results:
                # Get the first (most confident) result
                result = response.results[0]
                transcript = result.alternatives[0].transcript
                confidence = result.alternatives[0].confidence
                
                logger.info(f"Speech recognition successful. Confidence: {confidence}")
                return transcript
            else:
                logger.warning("No speech recognized")
                return None
                
        except Exception as e:
            logger.error(f"Speech-to-text error: {str(e)}")
            return None
    
    def text_to_speech(self, text: str, language_code: str = "id-ID", 
                      voice_name: str = "id-ID-Standard-A", speed: float = 1.0) -> Optional[bytes]:
        """
        Convert text to speech audio using Google Cloud Text-to-Speech
        """
        if not self.tts_client:
            logger.error("TTS client not initialized")
            return None
        
        try:
            # Set up the input text
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configure voice settings
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name,
                ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
            )
            
            # Configure audio settings
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speed,
                pitch=2.0,  # Higher pitch for children
                volume_gain_db=1.0
            )
            
            # Perform text-to-speech
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            logger.info("Text-to-speech conversion successful")
            return response.audio_content
            
        except Exception as e:
            logger.error(f"Text-to-speech error: {str(e)}")
            return None
    
    def get_available_voices(self, language_code: str = "id-ID") -> list:
        """
        Get list of available voices for specified language
        """
        if not self.tts_client:
            return []
        
        try:
            response = self.tts_client.list_voices(language_code=language_code)
            voices = []
            
            for voice in response.voices:
                voices.append({
                    "name": voice.name,
                    "language_codes": list(voice.language_codes),
                    "gender": voice.ssml_gender.name
                })
            
            return voices
            
        except Exception as e:
            logger.error(f"Error getting available voices: {str(e)}")
            return []

# Global instance
google_cloud_service = GoogleCloudService()
