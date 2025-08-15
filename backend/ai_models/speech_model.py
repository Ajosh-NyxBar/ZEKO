"""
Speech Recognition Model for ZEKO
=================================

Custom speech recognition and pronunciation scoring system.
Integrates with Google Cloud Speech-to-Text for transcription and 
provides pronunciation analysis for children's speech therapy.
"""

import numpy as np
import logging
from typing import Dict, List, Tuple, Optional, Any
import difflib
import re
from dataclasses import dataclass
import asyncio
import aiofiles
import os
from pathlib import Path

# Google Cloud imports
from google.cloud import speech
from google.cloud import texttospeech

from .audio_features import AudioFeatureExtractor
from services.google_cloud import get_speech_client, get_tts_client

logger = logging.getLogger(__name__)

@dataclass
class PronunciationResult:
    """Data class for pronunciation analysis results"""
    word: str
    target_word: str
    similarity_score: float
    phonetic_accuracy: float
    confidence: float
    feedback: str
    suggestions: List[str]

@dataclass
class SpeechAnalysis:
    """Data class for comprehensive speech analysis"""
    transcript: str
    confidence: float
    pronunciation_results: List[PronunciationResult]
    overall_score: float
    feedback: str
    recommendations: List[str]

class SpeechRecognitionModel:
    """
    Advanced speech recognition and pronunciation analysis for children
    """
    
    def __init__(self):
        """Initialize speech recognition model"""
        self.feature_extractor = AudioFeatureExtractor()
        self.speech_client = None
        self.tts_client = None
        
        # Indonesian phonetic mapping for common pronunciation issues
        self.phonetic_rules = {
            'th': 't',  # Common substitution in Indonesian
            'f': 'p',   # Common substitution
            'v': 'b',   # Common substitution
            'z': 's',   # Common substitution
            'ch': 'c',  # Simplification
        }
        
        # Word difficulty levels
        self.difficulty_words = {
            'easy': [
                'mama', 'papa', 'air', 'nasi', 'minum', 'makan', 'tidur', 'main',
                'bola', 'rumah', 'sekolah', 'teman', 'buku', 'pensil', 'kursi', 'meja'
            ],
            'medium': [
                'sepatu', 'belajar', 'bermain', 'keluarga', 'sarapan', 'bercerita',
                'menyanyi', 'membaca', 'menulis', 'menggambar', 'berlari', 'melompat'
            ],
            'hard': [
                'pembelajaran', 'kesempatan', 'kreativitas', 'komunikasi', 'kolaborasi',
                'perpustakaan', 'matematika', 'pengetahuan', 'eksperimen', 'observasi'
            ]
        }
    
    async def initialize_clients(self):
        """Initialize Google Cloud clients"""
        try:
            self.speech_client = get_speech_client()
            self.tts_client = get_tts_client()
            logger.info("Google Cloud clients initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Google Cloud clients: {e}")
            raise
    
    def get_words_by_difficulty(self, difficulty: str, count: int = 5) -> List[str]:
        """
        Get words for practice based on difficulty level
        
        Args:
            difficulty: Difficulty level ('easy', 'medium', 'hard')
            count: Number of words to return
            
        Returns:
            List of words for practice
        """
        words = self.difficulty_words.get(difficulty, self.difficulty_words['easy'])
        return np.random.choice(words, min(count, len(words)), replace=False).tolist()
    
    async def transcribe_audio(self, audio_file_path: str, language_code: str = "id-ID") -> Dict[str, Any]:
        """
        Transcribe audio using Google Cloud Speech-to-Text
        
        Args:
            audio_file_path: Path to audio file
            language_code: Language code for transcription
            
        Returns:
            Transcription result with confidence
        """
        try:
            if not self.speech_client:
                await self.initialize_clients()
            
            # Read audio file
            async with aiofiles.open(audio_file_path, "rb") as audio_file:
                content = await audio_file.read()
            
            # Configure recognition
            audio = speech.RecognitionAudio(content=content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=language_code,
                enable_word_confidence=True,
                enable_automatic_punctuation=True,
                model="latest_short"
            )
            
            # Perform transcription
            response = self.speech_client.recognize(config=config, audio=audio)
            
            if not response.results:
                return {
                    'transcript': '',
                    'confidence': 0.0,
                    'words': [],
                    'error': 'No speech detected'
                }
            
            # Extract results
            result = response.results[0]
            alternative = result.alternatives[0]
            
            transcript = alternative.transcript
            confidence = alternative.confidence
            
            # Extract word-level confidence if available
            words = []
            if hasattr(alternative, 'words'):
                for word in alternative.words:
                    words.append({
                        'word': word.word,
                        'confidence': word.confidence,
                        'start_time': word.start_time.total_seconds() if word.start_time else 0,
                        'end_time': word.end_time.total_seconds() if word.end_time else 0
                    })
            
            return {
                'transcript': transcript,
                'confidence': confidence,
                'words': words
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return {
                'transcript': '',
                'confidence': 0.0,
                'words': [],
                'error': str(e)
            }
    
    def calculate_word_similarity(self, spoken_word: str, target_word: str) -> float:
        """
        Calculate similarity between spoken and target words
        
        Args:
            spoken_word: Word as transcribed
            target_word: Expected word
            
        Returns:
            Similarity score (0-1)
        """
        # Normalize words
        spoken = self.normalize_text(spoken_word.lower())
        target = self.normalize_text(target_word.lower())
        
        # Calculate sequence similarity
        similarity = difflib.SequenceMatcher(None, spoken, target).ratio()
        
        # Apply phonetic rules for common mispronunciations
        phonetic_spoken = self.apply_phonetic_rules(spoken)
        phonetic_target = self.apply_phonetic_rules(target)
        phonetic_similarity = difflib.SequenceMatcher(None, phonetic_spoken, phonetic_target).ratio()
        
        # Use the better of the two scores
        return max(similarity, phonetic_similarity)
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text for comparison
        
        Args:
            text: Input text
            
        Returns:
            Normalized text
        """
        # Remove punctuation and extra spaces
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def apply_phonetic_rules(self, word: str) -> str:
        """
        Apply phonetic rules for common mispronunciations
        
        Args:
            word: Input word
            
        Returns:
            Phonetically adjusted word
        """
        adjusted = word
        for pattern, replacement in self.phonetic_rules.items():
            adjusted = adjusted.replace(pattern, replacement)
        return adjusted
    
    def analyze_pronunciation(self, spoken_word: str, target_word: str, confidence: float) -> PronunciationResult:
        """
        Analyze pronunciation quality
        
        Args:
            spoken_word: Transcribed word
            target_word: Expected word
            confidence: Speech recognition confidence
            
        Returns:
            Pronunciation analysis result
        """
        # Calculate similarity
        similarity = self.calculate_word_similarity(spoken_word, target_word)
        
        # Calculate pronunciation score
        pronunciation_score = (similarity * 0.7 + confidence * 0.3)
        
        # Generate feedback
        feedback, suggestions = self.generate_pronunciation_feedback(
            spoken_word, target_word, similarity, confidence
        )
        
        return PronunciationResult(
            word=spoken_word,
            target_word=target_word,
            similarity_score=similarity,
            phonetic_accuracy=pronunciation_score,
            confidence=confidence,
            feedback=feedback,
            suggestions=suggestions
        )
    
    def generate_pronunciation_feedback(self, spoken: str, target: str, 
                                      similarity: float, confidence: float) -> Tuple[str, List[str]]:
        """
        Generate feedback and suggestions for pronunciation
        
        Args:
            spoken: Spoken word
            target: Target word
            similarity: Similarity score
            confidence: Recognition confidence
            
        Returns:
            Tuple of (feedback, suggestions)
        """
        suggestions = []
        
        if similarity >= 0.9:
            feedback = "Bagus sekali! Pengucapan sempurna! 🌟"
        elif similarity >= 0.8:
            feedback = "Bagus! Pengucapan sudah sangat baik! 👍"
            suggestions.append("Coba ucapkan sedikit lebih jelas lagi")
        elif similarity >= 0.6:
            feedback = "Lumayan bagus! Mari coba lagi dengan lebih pelan 😊"
            suggestions.extend([
                "Ucapkan kata dengan lebih pelan",
                "Perhatikan setiap suku kata",
                "Coba dengarkan contoh lagi"
            ])
        elif similarity >= 0.4:
            feedback = "Belum tepat, tapi jangan menyerah! Coba lagi ya 💪"
            suggestions.extend([
                "Dengarkan contoh pengucapan yang benar",
                "Pecah kata menjadi suku kata",
                "Latih satu suku kata dulu",
                "Minta bantuan kakak atau orangtua"
            ])
        else:
            feedback = "Ayo coba lagi! Dengarkan baik-baik contohnya ya 🤗"
            suggestions.extend([
                "Dengarkan contoh berulang kali",
                "Tiru pengucapan persis seperti contoh",
                "Mulai dari kata yang lebih mudah dulu",
                "Istirahat sebentar lalu coba lagi"
            ])
        
        # Add confidence-based suggestions
        if confidence < 0.6:
            suggestions.append("Coba bicara lebih keras dan jelas")
            suggestions.append("Pastikan tidak ada suara bising di sekitar")
        
        return feedback, suggestions
    
    async def analyze_speech_comprehensive(self, audio_file_path: str, 
                                         target_words: List[str]) -> SpeechAnalysis:
        """
        Perform comprehensive speech analysis
        
        Args:
            audio_file_path: Path to audio file
            target_words: List of expected words
            
        Returns:
            Comprehensive speech analysis
        """
        try:
            # Transcribe audio
            transcription_result = await self.transcribe_audio(audio_file_path)
            
            if 'error' in transcription_result:
                return SpeechAnalysis(
                    transcript='',
                    confidence=0.0,
                    pronunciation_results=[],
                    overall_score=0.0,
                    feedback="Maaf, tidak bisa mendengar suara. Coba lagi ya! 🎤",
                    recommendations=[
                        "Pastikan mikrofon berfungsi dengan baik",
                        "Bicara lebih keras dan jelas",
                        "Kurangi suara bising di sekitar"
                    ]
                )
            
            transcript = transcription_result['transcript']
            confidence = transcription_result['confidence']
            
            # Split transcript into words
            spoken_words = self.normalize_text(transcript).split()
            
            # Analyze each word
            pronunciation_results = []
            total_score = 0.0
            
            for i, target_word in enumerate(target_words):
                if i < len(spoken_words):
                    spoken_word = spoken_words[i]
                    word_confidence = confidence  # Use overall confidence for now
                    
                    # Find word-specific confidence if available
                    if transcription_result['words']:
                        for word_info in transcription_result['words']:
                            if word_info['word'].lower() == spoken_word.lower():
                                word_confidence = word_info['confidence']
                                break
                    
                    result = self.analyze_pronunciation(spoken_word, target_word, word_confidence)
                    pronunciation_results.append(result)
                    total_score += result.phonetic_accuracy
                else:
                    # Word not spoken
                    result = PronunciationResult(
                        word='',
                        target_word=target_word,
                        similarity_score=0.0,
                        phonetic_accuracy=0.0,
                        confidence=0.0,
                        feedback=f"Kata '{target_word}' belum diucapkan",
                        suggestions=["Coba ucapkan kata ini juga"]
                    )
                    pronunciation_results.append(result)
            
            # Calculate overall score
            overall_score = total_score / len(target_words) if target_words else 0.0
            
            # Generate overall feedback
            overall_feedback, recommendations = self.generate_overall_feedback(
                overall_score, len(spoken_words), len(target_words)
            )
            
            return SpeechAnalysis(
                transcript=transcript,
                confidence=confidence,
                pronunciation_results=pronunciation_results,
                overall_score=overall_score,
                feedback=overall_feedback,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Error in comprehensive speech analysis: {e}")
            return SpeechAnalysis(
                transcript='',
                confidence=0.0,
                pronunciation_results=[],
                overall_score=0.0,
                feedback="Terjadi kesalahan saat menganalisis suara",
                recommendations=["Coba lagi beberapa saat"]
            )
    
    def generate_overall_feedback(self, score: float, spoken_count: int, 
                                target_count: int) -> Tuple[str, List[str]]:
        """
        Generate overall feedback and recommendations
        
        Args:
            score: Overall pronunciation score
            spoken_count: Number of words spoken
            target_count: Number of target words
            
        Returns:
            Tuple of (feedback, recommendations)
        """
        recommendations = []
        
        if score >= 0.9:
            feedback = "Luar biasa! Pengucapan sangat sempurna! 🌟🎉"
            recommendations.append("Coba kata-kata yang lebih sulit")
        elif score >= 0.8:
            feedback = "Bagus sekali! Pengucapan sudah sangat baik! 👏"
            recommendations.append("Terus berlatih dengan konsisten")
        elif score >= 0.6:
            feedback = "Lumayan bagus! Masih ada yang bisa diperbaiki 😊"
            recommendations.extend([
                "Latih kata-kata yang masih sulit",
                "Dengarkan contoh lebih sering",
                "Berlatih 10-15 menit setiap hari"
            ])
        elif score >= 0.4:
            feedback = "Perlu latihan lebih banyak, tapi sudah bagus kok! 💪"
            recommendations.extend([
                "Mulai dari kata-kata yang lebih mudah",
                "Berlatih dengan sabar",
                "Minta bantuan orangtua atau guru"
            ])
        else:
            feedback = "Ayo semangat! Mari kita belajar pelan-pelan 🤗"
            recommendations.extend([
                "Mulai dari kata sangat mudah",
                "Dengarkan contoh berulang kali",
                "Jangan terburu-buru"
            ])
        
        # Add recommendations based on word count
        if spoken_count < target_count:
            recommendations.append("Coba ucapkan semua kata yang diminta")
        elif spoken_count > target_count:
            recommendations.append("Fokus pada kata-kata yang diminta saja")
        
        return feedback, recommendations
    
    async def generate_speech_audio(self, text: str, voice_name: str = "id-ID-Standard-A", 
                                  speed: float = 1.0) -> bytes:
        """
        Generate speech audio from text using Google Cloud TTS
        
        Args:
            text: Text to convert to speech
            voice_name: Voice to use
            speed: Speech speed (0.25 to 4.0)
            
        Returns:
            Audio content as bytes
        """
        try:
            if not self.tts_client:
                await self.initialize_clients()
            
            # Configure TTS request
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice = texttospeech.VoiceSelectionParams(
                language_code="id-ID",
                name=voice_name
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speed
            )
            
            # Generate speech
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return response.audio_content
            
        except Exception as e:
            logger.error(f"Error generating speech audio: {e}")
            raise

# Helper functions
def calculate_pronunciation_score(spoken: str, target: str) -> float:
    """
    Calculate pronunciation score between spoken and target words
    
    Args:
        spoken: Spoken word
        target: Target word
        
    Returns:
        Pronunciation score (0-1)
    """
    model = SpeechRecognitionModel()
    return model.calculate_word_similarity(spoken, target)

async def quick_speech_analysis(audio_file: str, target_word: str) -> Dict[str, Any]:
    """
    Quick speech analysis for single word
    
    Args:
        audio_file: Path to audio file
        target_word: Expected word
        
    Returns:
        Analysis result
    """
    model = SpeechRecognitionModel()
    analysis = await model.analyze_speech_comprehensive(audio_file, [target_word])
    
    if analysis.pronunciation_results:
        result = analysis.pronunciation_results[0]
        return {
            'spoken_word': result.word,
            'target_word': result.target_word,
            'score': result.phonetic_accuracy,
            'feedback': result.feedback,
            'suggestions': result.suggestions,
            'overall_feedback': analysis.feedback
        }
    
    return {
        'spoken_word': '',
        'target_word': target_word,
        'score': 0.0,
        'feedback': analysis.feedback,
        'suggestions': analysis.recommendations,
        'overall_feedback': analysis.feedback
    }
