"""
Emotion Detection Model for ZEKO
================================

Custom emotion detection model using MFCC features and Multi-Layer Perceptron (MLP).
Designed specifically for children's speech emotion detection.
"""

import numpy as np
import pickle
import logging
from typing import Dict, List, Tuple, Optional
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from pathlib import Path

from .audio_features import AudioFeatureExtractor

logger = logging.getLogger(__name__)

class EmotionDetectionModel:
    """
    Emotion detection model for children's speech
    Detects: happy, sad, excited, calm, frustrated, confident
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize emotion detection model
        
        Args:
            model_path: Path to pre-trained model file
        """
        self.emotions = ['happy', 'sad', 'excited', 'calm', 'frustrated', 'confident']
        self.feature_extractor = AudioFeatureExtractor()
        self.model = None
        self.scaler = None
        self.is_trained = False
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
    
    def create_model(self) -> MLPClassifier:
        """
        Create and configure MLP model for emotion detection
        
        Returns:
            Configured MLPClassifier
        """
        model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),  # 3 hidden layers
            activation='relu',
            solver='adam',
            alpha=0.001,  # L2 regularization
            batch_size='auto',
            learning_rate='constant',
            learning_rate_init=0.001,
            max_iter=500,
            shuffle=True,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=10
        )
        return model
    
    def prepare_training_data(self, audio_files: List[str], labels: List[str]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from audio files and labels
        
        Args:
            audio_files: List of paths to audio files
            labels: List of emotion labels corresponding to audio files
            
        Returns:
            Tuple of (features, encoded_labels)
        """
        try:
            features = []
            encoded_labels = []
            
            logger.info(f"Processing {len(audio_files)} audio files for training...")
            
            for audio_file, label in zip(audio_files, labels):
                try:
                    # Extract features
                    feature_vector = self.feature_extractor.preprocess_for_emotion_model(audio_file)
                    features.append(feature_vector)
                    
                    # Encode label
                    if label in self.emotions:
                        encoded_labels.append(self.emotions.index(label))
                    else:
                        logger.warning(f"Unknown emotion label: {label}")
                        continue
                        
                except Exception as e:
                    logger.error(f"Error processing {audio_file}: {e}")
                    continue
            
            if not features:
                raise ValueError("No valid features extracted from audio files")
            
            features_array = np.array(features)
            labels_array = np.array(encoded_labels)
            
            logger.info(f"Prepared {len(features)} samples with {features_array.shape[1]} features")
            return features_array, labels_array
            
        except Exception as e:
            logger.error(f"Error preparing training data: {e}")
            raise
    
    def train(self, audio_files: List[str], labels: List[str], 
              test_size: float = 0.2, save_path: Optional[str] = None) -> Dict[str, float]:
        """
        Train the emotion detection model
        
        Args:
            audio_files: List of paths to training audio files
            labels: List of emotion labels
            test_size: Fraction of data to use for testing
            save_path: Path to save trained model
            
        Returns:
            Training metrics
        """
        try:
            # Prepare data
            X, y = self.prepare_training_data(audio_files, labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, stratify=y
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Create and train model
            self.model = self.create_model()
            
            logger.info("Training emotion detection model...")
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            train_predictions = self.model.predict(X_train_scaled)
            test_predictions = self.model.predict(X_test_scaled)
            
            train_accuracy = accuracy_score(y_train, train_predictions)
            test_accuracy = accuracy_score(y_test, test_predictions)
            
            # Generate classification report
            report = classification_report(
                y_test, test_predictions, 
                target_names=self.emotions,
                output_dict=True
            )
            
            metrics = {
                'train_accuracy': train_accuracy,
                'test_accuracy': test_accuracy,
                'precision': report['weighted avg']['precision'],
                'recall': report['weighted avg']['recall'],
                'f1_score': report['weighted avg']['f1-score']
            }
            
            self.is_trained = True
            
            logger.info(f"Training completed. Test accuracy: {test_accuracy:.3f}")
            
            # Save model if path provided
            if save_path:
                self.save_model(save_path)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training emotion detection model: {e}")
            raise
    
    def predict(self, audio_file: str) -> Dict[str, float]:
        """
        Predict emotion from audio file
        
        Args:
            audio_file: Path to audio file
            
        Returns:
            Dictionary with emotion probabilities
        """
        try:
            if not self.is_trained:
                raise ValueError("Model is not trained. Call train() first or load a pre-trained model.")
            
            # Extract features
            features = self.feature_extractor.preprocess_for_emotion_model(audio_file)
            features = features.reshape(1, -1)  # Reshape for single prediction
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Get prediction probabilities
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Create result dictionary
            result = {}
            for i, emotion in enumerate(self.emotions):
                result[emotion] = float(probabilities[i])
            
            # Get predicted emotion
            predicted_idx = np.argmax(probabilities)
            predicted_emotion = self.emotions[predicted_idx]
            confidence = probabilities[predicted_idx]
            
            return {
                'predicted_emotion': predicted_emotion,
                'confidence': float(confidence),
                'emotion_probabilities': result
            }
            
        except Exception as e:
            logger.error(f"Error predicting emotion: {e}")
            raise
    
    def predict_batch(self, audio_files: List[str]) -> List[Dict[str, float]]:
        """
        Predict emotions for multiple audio files
        
        Args:
            audio_files: List of paths to audio files
            
        Returns:
            List of prediction dictionaries
        """
        results = []
        for audio_file in audio_files:
            try:
                result = self.predict(audio_file)
                results.append(result)
            except Exception as e:
                logger.error(f"Error predicting emotion for {audio_file}: {e}")
                results.append({
                    'predicted_emotion': 'unknown',
                    'confidence': 0.0,
                    'emotion_probabilities': {emotion: 0.0 for emotion in self.emotions}
                })
        return results
    
    def save_model(self, save_path: str):
        """
        Save trained model and scaler to disk
        
        Args:
            save_path: Path to save model file
        """
        try:
            if not self.is_trained:
                raise ValueError("No trained model to save")
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'emotions': self.emotions,
                'feature_extractor_config': {
                    'sample_rate': self.feature_extractor.sample_rate,
                    'n_mfcc': self.feature_extractor.n_mfcc,
                    'n_fft': self.feature_extractor.n_fft,
                    'hop_length': self.feature_extractor.hop_length
                }
            }
            
            joblib.dump(model_data, save_path)
            logger.info(f"Model saved to {save_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise
    
    def load_model(self, model_path: str):
        """
        Load trained model from disk
        
        Args:
            model_path: Path to model file
        """
        try:
            model_data = joblib.load(model_path)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.emotions = model_data['emotions']
            
            # Update feature extractor config if available
            if 'feature_extractor_config' in model_data:
                config = model_data['feature_extractor_config']
                self.feature_extractor = AudioFeatureExtractor(
                    sample_rate=config['sample_rate'],
                    n_mfcc=config['n_mfcc'],
                    n_fft=config['n_fft'],
                    hop_length=config['hop_length']
                )
            
            self.is_trained = True
            logger.info(f"Model loaded from {model_path}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def get_emotion_recommendation(self, emotion: str, confidence: float) -> str:
        """
        Generate recommendation based on detected emotion
        
        Args:
            emotion: Detected emotion
            confidence: Confidence level
            
        Returns:
            Recommendation message
        """
        recommendations = {
            'happy': [
                "Bagus sekali! Kamu terdengar senang hari ini! 😊",
                "Semangat yang luar biasa! Terus seperti ini ya! 🌟",
                "Wah, suaramu ceria sekali! Ayo lanjut belajar! 🎉"
            ],
            'excited': [
                "Wah, kamu sangat antusias! Tapi coba pelan-pelan ya 😄",
                "Semangat yang bagus! Mari kita fokus bersama 🚀",
                "Energi yang luar biasa! Coba tarik napas dulu ya 🌈"
            ],
            'calm': [
                "Suaramu sangat tenang, bagus sekali! 😌",
                "Kamu terdengar fokus dan siap belajar! 👍",
                "Sikap yang tenang membantu kamu belajar lebih baik! 🧘"
            ],
            'frustrated': [
                "Tidak apa-apa kalau sulit, kita bisa coba lagi pelan-pelan 💪",
                "Yuk istirahat sebentar, lalu kita coba lagi ya! 🤗",
                "Jangan khawatir, setiap orang butuh waktu untuk belajar 🌱"
            ],
            'sad': [
                "Kamu baik-baik saja? Mari kita buat hari ini lebih menyenangkan! 🤗",
                "Tidak apa-apa merasa sedih, kita akan belajar bersama ya! 💙",
                "Yuk kita mainkan sesuatu yang menyenangkan dulu! 🎮"
            ],
            'confident': [
                "Percaya diri yang bagus! Terus seperti ini! 🌟",
                "Kamu terdengar yakin sekali! Lanjutkan! 💪",
                "Sikap percaya diri membantu kamu belajar lebih cepat! 🚀"
            ]
        }
        
        emotion_recs = recommendations.get(emotion, [
            "Terus semangat belajar ya! 😊"
        ])
        
        # Add confidence-based modifier
        if confidence < 0.6:
            return f"Hmm, sepertinya {emotion}... {emotion_recs[0]}"
        elif confidence < 0.8:
            return emotion_recs[0]
        else:
            return emotion_recs[np.random.randint(len(emotion_recs))]


# Helper functions for convenience
def detect_emotion_from_audio(audio_file: str, model_path: Optional[str] = None) -> Dict[str, float]:
    """
    Convenience function to detect emotion from audio file
    
    Args:
        audio_file: Path to audio file
        model_path: Path to trained model (optional)
        
    Returns:
        Emotion detection result
    """
    model = EmotionDetectionModel(model_path)
    return model.predict(audio_file)


def create_mock_emotion_prediction(bias_positive: bool = True) -> Dict[str, float]:
    """
    Create mock emotion prediction for testing (when no model is available)
    
    Args:
        bias_positive: Whether to bias towards positive emotions
        
    Returns:
        Mock emotion prediction
    """
    emotions = ['happy', 'sad', 'excited', 'calm', 'frustrated', 'confident']
    
    if bias_positive:
        # Bias towards positive emotions for children
        weights = [0.3, 0.05, 0.25, 0.2, 0.05, 0.15]
    else:
        # Equal distribution
        weights = [1/6] * 6
    
    # Simulate prediction
    predicted_idx = np.random.choice(len(emotions), p=weights)
    predicted_emotion = emotions[predicted_idx]
    confidence = np.random.uniform(0.7, 0.95)
    
    # Create probability distribution
    probabilities = np.random.dirichlet([1] * len(emotions))
    probabilities[predicted_idx] = confidence
    probabilities = probabilities / np.sum(probabilities)  # Normalize
    
    emotion_probabilities = {emotion: float(prob) for emotion, prob in zip(emotions, probabilities)}
    
    return {
        'predicted_emotion': predicted_emotion,
        'confidence': confidence,
        'emotion_probabilities': emotion_probabilities
    }
