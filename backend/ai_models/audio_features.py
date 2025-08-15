"""
Audio Feature Extraction for ZEKO
=================================

This module handles audio feature extraction for emotion detection and speech analysis.
Uses MFCC (Mel-Frequency Cepstral Coefficients) and other audio features.
"""

import numpy as np
import librosa
import librosa.display
from typing import Dict, List, Tuple, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class AudioFeatureExtractor:
    """
    Extract audio features for ML models
    """
    
    def __init__(self, 
                 sample_rate: int = 22050,
                 n_mfcc: int = 13,
                 n_fft: int = 2048,
                 hop_length: int = 512):
        """
        Initialize audio feature extractor
        
        Args:
            sample_rate: Audio sample rate (Hz)
            n_mfcc: Number of MFCC coefficients
            n_fft: FFT window size
            hop_length: Hop length for analysis
        """
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.n_fft = n_fft
        self.hop_length = hop_length
        
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load audio file and return waveform and sample rate
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Tuple of (audio_data, sample_rate)
        """
        try:
            audio, sr = librosa.load(file_path, sr=self.sample_rate)
            return audio, sr
        except Exception as e:
            logger.error(f"Error loading audio file {file_path}: {e}")
            raise
    
    def extract_mfcc(self, audio: np.ndarray) -> np.ndarray:
        """
        Extract MFCC features from audio
        
        Args:
            audio: Audio waveform
            
        Returns:
            MFCC feature matrix (n_mfcc, time_frames)
        """
        try:
            mfcc = librosa.feature.mfcc(
                y=audio,
                sr=self.sample_rate,
                n_mfcc=self.n_mfcc,
                n_fft=self.n_fft,
                hop_length=self.hop_length
            )
            return mfcc
        except Exception as e:
            logger.error(f"Error extracting MFCC: {e}")
            raise
    
    def extract_chroma(self, audio: np.ndarray) -> np.ndarray:
        """
        Extract chroma features (pitch class profiles)
        
        Args:
            audio: Audio waveform
            
        Returns:
            Chroma feature matrix
        """
        try:
            chroma = librosa.feature.chroma_stft(
                y=audio,
                sr=self.sample_rate,
                hop_length=self.hop_length
            )
            return chroma
        except Exception as e:
            logger.error(f"Error extracting chroma: {e}")
            raise
    
    def extract_spectral_centroid(self, audio: np.ndarray) -> np.ndarray:
        """
        Extract spectral centroid (brightness measure)
        
        Args:
            audio: Audio waveform
            
        Returns:
            Spectral centroid values
        """
        try:
            centroid = librosa.feature.spectral_centroid(
                y=audio,
                sr=self.sample_rate,
                hop_length=self.hop_length
            )
            return centroid
        except Exception as e:
            logger.error(f"Error extracting spectral centroid: {e}")
            raise
    
    def extract_zero_crossing_rate(self, audio: np.ndarray) -> np.ndarray:
        """
        Extract zero crossing rate (speech vs music discrimination)
        
        Args:
            audio: Audio waveform
            
        Returns:
            Zero crossing rate values
        """
        try:
            zcr = librosa.feature.zero_crossing_rate(
                audio,
                hop_length=self.hop_length
            )
            return zcr
        except Exception as e:
            logger.error(f"Error extracting ZCR: {e}")
            raise
    
    def extract_tempo_and_beats(self, audio: np.ndarray) -> Tuple[float, np.ndarray]:
        """
        Extract tempo and beat frames
        
        Args:
            audio: Audio waveform
            
        Returns:
            Tuple of (tempo, beat_frames)
        """
        try:
            tempo, beat_frames = librosa.beat.beat_track(
                y=audio,
                sr=self.sample_rate,
                hop_length=self.hop_length
            )
            return tempo, beat_frames
        except Exception as e:
            logger.error(f"Error extracting tempo/beats: {e}")
            return 0.0, np.array([])
    
    def extract_all_features(self, file_path: str) -> Dict[str, np.ndarray]:
        """
        Extract comprehensive feature set from audio file
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Dictionary containing all extracted features
        """
        try:
            # Load audio
            audio, sr = self.load_audio(file_path)
            
            # Extract all features
            features = {
                'mfcc': self.extract_mfcc(audio),
                'chroma': self.extract_chroma(audio),
                'spectral_centroid': self.extract_spectral_centroid(audio),
                'zero_crossing_rate': self.extract_zero_crossing_rate(audio),
                'audio_length': len(audio) / sr,
                'sample_rate': sr
            }
            
            # Extract tempo (optional, may fail for speech)
            try:
                tempo, beats = self.extract_tempo_and_beats(audio)
                features['tempo'] = tempo
                features['beat_frames'] = beats
            except:
                features['tempo'] = 0.0
                features['beat_frames'] = np.array([])
            
            logger.info(f"Successfully extracted features from {file_path}")
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features from {file_path}: {e}")
            raise
    
    def compute_feature_statistics(self, features: Dict[str, np.ndarray]) -> Dict[str, float]:
        """
        Compute statistical measures from extracted features
        
        Args:
            features: Dictionary of extracted features
            
        Returns:
            Dictionary of statistical measures
        """
        stats = {}
        
        try:
            # MFCC statistics
            if 'mfcc' in features:
                mfcc = features['mfcc']
                stats.update({
                    'mfcc_mean': np.mean(mfcc),
                    'mfcc_std': np.std(mfcc),
                    'mfcc_min': np.min(mfcc),
                    'mfcc_max': np.max(mfcc)
                })
                
                # Per-coefficient statistics
                for i in range(mfcc.shape[0]):
                    stats[f'mfcc_{i}_mean'] = np.mean(mfcc[i])
                    stats[f'mfcc_{i}_std'] = np.std(mfcc[i])
            
            # Chroma statistics
            if 'chroma' in features:
                chroma = features['chroma']
                stats.update({
                    'chroma_mean': np.mean(chroma),
                    'chroma_std': np.std(chroma),
                    'chroma_var': np.var(chroma)
                })
            
            # Spectral centroid statistics
            if 'spectral_centroid' in features:
                centroid = features['spectral_centroid']
                stats.update({
                    'spectral_centroid_mean': np.mean(centroid),
                    'spectral_centroid_std': np.std(centroid),
                    'spectral_centroid_median': np.median(centroid)
                })
            
            # Zero crossing rate statistics
            if 'zero_crossing_rate' in features:
                zcr = features['zero_crossing_rate']
                stats.update({
                    'zcr_mean': np.mean(zcr),
                    'zcr_std': np.std(zcr),
                    'zcr_var': np.var(zcr)
                })
            
            # Other features
            if 'tempo' in features:
                stats['tempo'] = features['tempo']
            
            if 'audio_length' in features:
                stats['audio_length'] = features['audio_length']
            
            return stats
            
        except Exception as e:
            logger.error(f"Error computing feature statistics: {e}")
            raise
    
    def preprocess_for_emotion_model(self, file_path: str) -> np.ndarray:
        """
        Preprocess audio specifically for emotion detection model
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Feature vector for emotion model
        """
        try:
            # Extract features
            features = self.extract_all_features(file_path)
            
            # Compute statistics
            stats = self.compute_feature_statistics(features)
            
            # Create feature vector for emotion model
            feature_vector = []
            
            # Add MFCC statistics (39 features: 13 coefficients * 3 stats each)
            for i in range(self.n_mfcc):
                feature_vector.extend([
                    stats.get(f'mfcc_{i}_mean', 0),
                    stats.get(f'mfcc_{i}_std', 0),
                    stats.get(f'mfcc_{i}_var', 0) if f'mfcc_{i}_var' in stats else 0
                ])
            
            # Add other features
            feature_vector.extend([
                stats.get('chroma_mean', 0),
                stats.get('chroma_std', 0),
                stats.get('spectral_centroid_mean', 0),
                stats.get('spectral_centroid_std', 0),
                stats.get('zcr_mean', 0),
                stats.get('zcr_std', 0),
                stats.get('tempo', 0),
                stats.get('audio_length', 0)
            ])
            
            return np.array(feature_vector)
            
        except Exception as e:
            logger.error(f"Error preprocessing audio for emotion model: {e}")
            raise


def extract_audio_features(file_path: str) -> Dict[str, float]:
    """
    Convenience function to extract audio features
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Dictionary of audio features
    """
    extractor = AudioFeatureExtractor()
    features = extractor.extract_all_features(file_path)
    stats = extractor.compute_feature_statistics(features)
    return stats


def preprocess_audio_for_ml(file_path: str) -> np.ndarray:
    """
    Convenience function to preprocess audio for ML models
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Feature vector ready for ML models
    """
    extractor = AudioFeatureExtractor()
    return extractor.preprocess_for_emotion_model(file_path)
