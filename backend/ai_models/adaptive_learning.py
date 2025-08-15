"""
Adaptive Learning Model for ZEKO
===============================

Intelligent difficulty adjustment and personalized learning path system.
Adapts to each child's learning pace and performance patterns.
"""

import numpy as np
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
from enum import Enum

logger = logging.getLogger(__name__)

class DifficultyLevel(Enum):
    """Difficulty levels for adaptive learning"""
    VERY_EASY = "very_easy"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"

class LearningStyle(Enum):
    """Learning style preferences"""
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    MIXED = "mixed"

@dataclass
class LearningSession:
    """Data class for learning session"""
    user_id: str
    session_id: str
    words_practiced: List[str]
    scores: List[float]
    difficulty_level: DifficultyLevel
    session_duration: float
    mistakes: List[str]
    timestamp: datetime
    engagement_level: float  # 0-1 based on session metrics

@dataclass
class UserProfile:
    """Data class for user learning profile"""
    user_id: str
    age: int
    current_level: DifficultyLevel
    learning_style: LearningStyle
    attention_span: float  # Average session duration in minutes
    preferred_session_time: str  # morning, afternoon, evening
    strengths: List[str]  # Words/categories user excels at
    weaknesses: List[str]  # Words/categories that need work
    motivation_factors: List[str]  # What motivates the user
    last_updated: datetime

@dataclass
class AdaptiveRecommendation:
    """Data class for adaptive learning recommendations"""
    next_words: List[str]
    difficulty_adjustment: str  # "increase", "decrease", "maintain"
    recommended_break: bool
    session_duration_suggestion: float  # in minutes
    encouragement_strategy: str
    character_interaction: str
    learning_activities: List[str]

class AdaptiveLearningModel:
    """
    Adaptive learning system that personalizes difficulty and content
    """
    
    def __init__(self):
        """Initialize adaptive learning model"""
        self.difficulty_progression = {
            DifficultyLevel.VERY_EASY: DifficultyLevel.EASY,
            DifficultyLevel.EASY: DifficultyLevel.MEDIUM,
            DifficultyLevel.MEDIUM: DifficultyLevel.HARD,
            DifficultyLevel.HARD: DifficultyLevel.VERY_HARD,
            DifficultyLevel.VERY_HARD: DifficultyLevel.VERY_HARD
        }
        
        self.difficulty_regression = {
            DifficultyLevel.VERY_HARD: DifficultyLevel.HARD,
            DifficultyLevel.HARD: DifficultyLevel.MEDIUM,
            DifficultyLevel.MEDIUM: DifficultyLevel.EASY,
            DifficultyLevel.EASY: DifficultyLevel.VERY_EASY,
            DifficultyLevel.VERY_EASY: DifficultyLevel.VERY_EASY
        }
        
        # Word categories by difficulty and topic
        self.word_categories = {
            DifficultyLevel.VERY_EASY: {
                'family': ['mama', 'papa', 'kakak', 'adik'],
                'basic_needs': ['makan', 'minum', 'tidur', 'main'],
                'simple_objects': ['bola', 'air', 'nasi', 'susu'],
                'actions': ['duduk', 'berdiri', 'jalan', 'lari']
            },
            DifficultyLevel.EASY: {
                'family': ['keluarga', 'orangtua', 'saudara', 'nenek', 'kakek'],
                'school': ['sekolah', 'guru', 'teman', 'buku', 'pensil'],
                'home': ['rumah', 'kamar', 'dapur', 'kursi', 'meja'],
                'activities': ['bermain', 'belajar', 'membaca', 'menulis']
            },
            DifficultyLevel.MEDIUM: {
                'emotions': ['senang', 'sedih', 'marah', 'takut', 'excited'],
                'descriptions': ['besar', 'kecil', 'tinggi', 'pendek', 'cantik'],
                'complex_actions': ['berlari', 'melompat', 'bercerita', 'menyanyi'],
                'abstract': ['impian', 'harapan', 'cita-cita', 'kreativitas']
            },
            DifficultyLevel.HARD: {
                'academic': ['pembelajaran', 'pengetahuan', 'eksperimen', 'observasi'],
                'social': ['komunikasi', 'kolaborasi', 'kerjasama', 'kepemimpinan'],
                'complex_concepts': ['perpustakaan', 'matematika', 'kreativitas'],
                'advanced_emotions': ['antusiasme', 'kecemasan', 'kepercayaan']
            },
            DifficultyLevel.VERY_HARD: {
                'advanced_academic': ['metamorfosis', 'fotosintesis', 'gravitasi'],
                'complex_social': ['empati', 'toleransi', 'demokratis', 'pluralisme'],
                'abstract_concepts': ['filosofi', 'metodologi', 'epistemologi'],
                'scientific': ['mikroorganisme', 'ekosistem', 'biodiversitas']
            }
        }
        
        # Learning activities by style
        self.learning_activities = {
            LearningStyle.VISUAL: [
                "Lihat gambar sambil mengucapkan kata",
                "Buat kartu kata bergambar",
                "Tonton video pengucapan",
                "Mainkan tebak gambar"
            ],
            LearningStyle.AUDITORY: [
                "Dengarkan contoh berkali-kali",
                "Nyanyikan kata-kata",
                "Rekam suara sendiri",
                "Mainkan permainan rima"
            ],
            LearningStyle.KINESTHETIC: [
                "Gerakan tangan saat mengucapkan",
                "Berjalan sambil berlatih",
                "Mainkan peran dengan kata",
                "Buat kata dengan gestur"
            ],
            LearningStyle.MIXED: [
                "Kombinasi visual dan audio",
                "Bergerak sambil melihat dan mendengar",
                "Variasi aktivitas setiap sesi",
                "Eksplorasi multi-sensori"
            ]
        }
    
    def analyze_session_performance(self, session: LearningSession) -> Dict[str, float]:
        """
        Analyze performance metrics from a learning session
        
        Args:
            session: Learning session data
            
        Returns:
            Performance metrics
        """
        try:
            scores = session.scores
            
            if not scores:
                return {
                    'average_score': 0.0,
                    'consistency': 0.0,
                    'improvement_trend': 0.0,
                    'difficulty_appropriateness': 0.5
                }
            
            # Calculate basic metrics
            average_score = np.mean(scores)
            score_std = np.std(scores) if len(scores) > 1 else 0
            consistency = max(0, 1 - score_std)  # High consistency = low standard deviation
            
            # Calculate improvement trend (if multiple attempts)
            if len(scores) > 1:
                # Simple linear trend
                x = np.arange(len(scores))
                trend_coef = np.polyfit(x, scores, 1)[0]
                improvement_trend = max(-1, min(1, trend_coef * 10))  # Normalize to [-1, 1]
            else:
                improvement_trend = 0.0
            
            # Assess difficulty appropriateness
            if average_score > 0.9:
                difficulty_appropriateness = 0.3  # Too easy
            elif average_score > 0.7:
                difficulty_appropriateness = 1.0  # Just right
            elif average_score > 0.5:
                difficulty_appropriateness = 0.8  # Slightly challenging, good
            elif average_score > 0.3:
                difficulty_appropriateness = 0.5  # Challenging but manageable
            else:
                difficulty_appropriateness = 0.2  # Too difficult
            
            return {
                'average_score': average_score,
                'consistency': consistency,
                'improvement_trend': improvement_trend,
                'difficulty_appropriateness': difficulty_appropriateness,
                'engagement_level': session.engagement_level
            }
            
        except Exception as e:
            logger.error(f"Error analyzing session performance: {e}")
            return {
                'average_score': 0.0,
                'consistency': 0.0,
                'improvement_trend': 0.0,
                'difficulty_appropriateness': 0.5,
                'engagement_level': 0.5
            }
    
    def update_user_profile(self, profile: UserProfile, sessions: List[LearningSession]) -> UserProfile:
        """
        Update user profile based on recent sessions
        
        Args:
            profile: Current user profile
            sessions: Recent learning sessions
            
        Returns:
            Updated user profile
        """
        try:
            if not sessions:
                return profile
            
            # Analyze recent performance
            recent_scores = []
            recent_durations = []
            word_performance = {}
            
            for session in sessions[-10:]:  # Last 10 sessions
                recent_scores.extend(session.scores)
                recent_durations.append(session.session_duration)
                
                # Track word-specific performance
                for word, score in zip(session.words_practiced, session.scores):
                    if word not in word_performance:
                        word_performance[word] = []
                    word_performance[word].append(score)
            
            # Update attention span
            if recent_durations:
                profile.attention_span = np.mean(recent_durations)
            
            # Update strengths and weaknesses
            strengths = []
            weaknesses = []
            
            for word, scores in word_performance.items():
                avg_score = np.mean(scores)
                if avg_score >= 0.8:
                    strengths.append(word)
                elif avg_score <= 0.5:
                    weaknesses.append(word)
            
            profile.strengths = strengths[-20:]  # Keep top 20
            profile.weaknesses = weaknesses[-20:]  # Keep bottom 20
            
            # Determine learning style based on session patterns
            # This is a simplified heuristic - in practice, would use more sophisticated analysis
            avg_engagement = np.mean([s.engagement_level for s in sessions[-5:]])
            if avg_engagement > 0.8:
                # Current style is working well, keep it
                pass
            else:
                # Might need to try different learning style
                current_style = profile.learning_style
                if current_style != LearningStyle.MIXED:
                    profile.learning_style = LearningStyle.MIXED
            
            profile.last_updated = datetime.now()
            return profile
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return profile
    
    def determine_difficulty_adjustment(self, sessions: List[LearningSession], 
                                      current_difficulty: DifficultyLevel) -> str:
        """
        Determine if difficulty should be adjusted
        
        Args:
            sessions: Recent learning sessions
            current_difficulty: Current difficulty level
            
        Returns:
            Adjustment recommendation: "increase", "decrease", "maintain"
        """
        try:
            if not sessions:
                return "maintain"
            
            # Analyze last 5 sessions
            recent_sessions = sessions[-5:]
            performance_metrics = []
            
            for session in recent_sessions:
                metrics = self.analyze_session_performance(session)
                performance_metrics.append(metrics)
            
            # Calculate average metrics
            avg_score = np.mean([m['average_score'] for m in performance_metrics])
            avg_difficulty_appropriateness = np.mean([m['difficulty_appropriateness'] for m in performance_metrics])
            avg_engagement = np.mean([m['engagement_level'] for m in performance_metrics])
            
            # Decision logic
            if avg_score >= 0.85 and avg_engagement >= 0.7 and avg_difficulty_appropriateness < 0.5:
                # High performance and engagement, but difficulty too easy
                return "increase"
            elif avg_score <= 0.4 or avg_engagement <= 0.3:
                # Poor performance or low engagement
                return "decrease"
            elif avg_score >= 0.6 and avg_score <= 0.8 and avg_engagement >= 0.6:
                # Good performance range, maintain current level
                return "maintain"
            else:
                # Edge cases, default to maintain
                return "maintain"
                
        except Exception as e:
            logger.error(f"Error determining difficulty adjustment: {e}")
            return "maintain"
    
    def select_next_words(self, profile: UserProfile, difficulty: DifficultyLevel, 
                         count: int = 5) -> List[str]:
        """
        Select next words for practice based on user profile
        
        Args:
            profile: User profile
            difficulty: Target difficulty level
            count: Number of words to select
            
        Returns:
            List of selected words
        """
        try:
            # Get available words for difficulty level
            available_categories = self.word_categories.get(difficulty, {})
            
            if not available_categories:
                # Fallback to easy words
                available_categories = self.word_categories[DifficultyLevel.EASY]
            
            all_words = []
            for category, words in available_categories.items():
                all_words.extend(words)
            
            # Filter out words user has mastered (in strengths)
            candidate_words = [w for w in all_words if w not in profile.strengths]
            
            # Prioritize words from weaknesses for review
            priority_words = [w for w in profile.weaknesses if w in candidate_words]
            
            # Select words
            selected_words = []
            
            # Add some weakness words for review (max 30% of selection)
            review_count = min(len(priority_words), max(1, count // 3))
            if priority_words:
                selected_words.extend(np.random.choice(priority_words, review_count, replace=False))
            
            # Fill remaining slots with new words
            remaining_count = count - len(selected_words)
            new_words = [w for w in candidate_words if w not in selected_words]
            
            if len(new_words) >= remaining_count:
                selected_words.extend(np.random.choice(new_words, remaining_count, replace=False))
            else:
                selected_words.extend(new_words)
                # If still need more, add from all available
                if len(selected_words) < count:
                    additional_words = [w for w in all_words if w not in selected_words]
                    if additional_words:
                        needed = count - len(selected_words)
                        selected_words.extend(np.random.choice(
                            additional_words, 
                            min(needed, len(additional_words)), 
                            replace=False
                        ))
            
            return selected_words[:count]
            
        except Exception as e:
            logger.error(f"Error selecting next words: {e}")
            # Fallback selection
            fallback_words = ['mama', 'papa', 'air', 'makan', 'tidur']
            return fallback_words[:count]
    
    def generate_adaptive_recommendation(self, profile: UserProfile, 
                                       sessions: List[LearningSession]) -> AdaptiveRecommendation:
        """
        Generate comprehensive adaptive learning recommendation
        
        Args:
            profile: User profile
            sessions: Recent learning sessions
            
        Returns:
            Adaptive learning recommendation
        """
        try:
            # Determine difficulty adjustment
            difficulty_adjustment = self.determine_difficulty_adjustment(sessions, profile.current_level)
            
            # Apply difficulty adjustment
            if difficulty_adjustment == "increase":
                new_difficulty = self.difficulty_progression.get(profile.current_level, profile.current_level)
            elif difficulty_adjustment == "decrease":
                new_difficulty = self.difficulty_regression.get(profile.current_level, profile.current_level)
            else:
                new_difficulty = profile.current_level
            
            # Select next words
            next_words = self.select_next_words(profile, new_difficulty)
            
            # Determine if break is needed
            recent_sessions = sessions[-3:] if len(sessions) >= 3 else sessions
            avg_recent_duration = np.mean([s.session_duration for s in recent_sessions]) if recent_sessions else 0
            recommended_break = avg_recent_duration > profile.attention_span * 1.5
            
            # Session duration suggestion
            if profile.age <= 6:
                base_duration = 5  # 5 minutes for very young children
            elif profile.age <= 8:
                base_duration = 10  # 10 minutes
            else:
                base_duration = 15  # 15 minutes for older children
            
            # Adjust based on attention span and recent performance
            if profile.attention_span > 0:
                suggested_duration = min(base_duration, profile.attention_span * 0.8)
            else:
                suggested_duration = base_duration
            
            # Generate encouragement strategy
            if sessions:
                last_session = sessions[-1]
                avg_score = np.mean(last_session.scores) if last_session.scores else 0
                
                if avg_score >= 0.8:
                    encouragement = "celebration"  # Celebrate success
                elif avg_score >= 0.6:
                    encouragement = "positive_reinforcement"  # Positive feedback
                elif avg_score >= 0.4:
                    encouragement = "gentle_motivation"  # Gentle encouragement
                else:
                    encouragement = "supportive_comfort"  # Extra support
            else:
                encouragement = "welcome_introduction"  # First time user
            
            # Character interaction based on encouragement strategy
            character_interactions = {
                "celebration": "Imron dan Siti akan memberikan pujian khusus! 🎉",
                "positive_reinforcement": "Imron akan memberikan high-five virtual! ✋",
                "gentle_motivation": "Siti akan memberikan semangat dengan lagu! 🎵",
                "supportive_comfort": "Imron dan Siti akan memberikan pelukan virtual! 🤗",
                "welcome_introduction": "Imron dan Siti akan memperkenalkan diri! 👋"
            }
            
            character_interaction = character_interactions.get(encouragement, 
                                                             "Imron dan Siti siap membantu! 😊")
            
            # Select learning activities based on learning style
            learning_activities = self.learning_activities.get(profile.learning_style, 
                                                             self.learning_activities[LearningStyle.MIXED])
            
            return AdaptiveRecommendation(
                next_words=next_words,
                difficulty_adjustment=difficulty_adjustment,
                recommended_break=recommended_break,
                session_duration_suggestion=suggested_duration,
                encouragement_strategy=encouragement,
                character_interaction=character_interaction,
                learning_activities=learning_activities[:3]  # Top 3 activities
            )
            
        except Exception as e:
            logger.error(f"Error generating adaptive recommendation: {e}")
            # Fallback recommendation
            return AdaptiveRecommendation(
                next_words=['mama', 'papa', 'air'],
                difficulty_adjustment="maintain",
                recommended_break=False,
                session_duration_suggestion=10.0,
                encouragement_strategy="positive_reinforcement",
                character_interaction="Imron dan Siti siap membantu! 😊",
                learning_activities=["Dengarkan contoh dengan baik", "Ucapkan pelan-pelan", "Jangan terburu-buru"]
            )
    
    def calculate_learning_velocity(self, sessions: List[LearningSession]) -> float:
        """
        Calculate how quickly user is learning (words mastered per session)
        
        Args:
            sessions: Learning sessions
            
        Returns:
            Learning velocity
        """
        try:
            if len(sessions) < 2:
                return 0.0
            
            mastery_threshold = 0.8
            mastered_words_per_session = []
            
            for session in sessions:
                mastered = sum(1 for score in session.scores if score >= mastery_threshold)
                mastered_words_per_session.append(mastered)
            
            return np.mean(mastered_words_per_session)
            
        except Exception as e:
            logger.error(f"Error calculating learning velocity: {e}")
            return 0.0
    
    def predict_optimal_study_time(self, profile: UserProfile, sessions: List[LearningSession]) -> str:
        """
        Predict optimal study time for user
        
        Args:
            profile: User profile
            sessions: Learning sessions
            
        Returns:
            Recommended study time
        """
        try:
            if not sessions:
                return profile.preferred_session_time
            
            # Analyze performance by time of day (simplified)
            time_performance = {}
            
            for session in sessions:
                hour = session.timestamp.hour
                if hour < 12:
                    time_period = "morning"
                elif hour < 17:
                    time_period = "afternoon"
                else:
                    time_period = "evening"
                
                if time_period not in time_performance:
                    time_performance[time_period] = []
                
                if session.scores:
                    time_performance[time_period].append(np.mean(session.scores))
            
            if not time_performance:
                return profile.preferred_session_time
            
            # Find best performing time
            best_time = max(time_performance.keys(), 
                          key=lambda x: np.mean(time_performance[x]))
            
            return best_time
            
        except Exception as e:
            logger.error(f"Error predicting optimal study time: {e}")
            return profile.preferred_session_time


# Helper functions
def create_default_user_profile(user_id: str, age: int) -> UserProfile:
    """
    Create default user profile for new users
    
    Args:
        user_id: User identifier
        age: User age
        
    Returns:
        Default user profile
    """
    # Determine initial difficulty based on age
    if age <= 5:
        initial_difficulty = DifficultyLevel.VERY_EASY
        attention_span = 5.0
    elif age <= 7:
        initial_difficulty = DifficultyLevel.EASY
        attention_span = 10.0
    elif age <= 9:
        initial_difficulty = DifficultyLevel.EASY
        attention_span = 15.0
    else:
        initial_difficulty = DifficultyLevel.MEDIUM
        attention_span = 20.0
    
    return UserProfile(
        user_id=user_id,
        age=age,
        current_level=initial_difficulty,
        learning_style=LearningStyle.MIXED,
        attention_span=attention_span,
        preferred_session_time="afternoon",
        strengths=[],
        weaknesses=[],
        motivation_factors=["character_interaction", "achievement_badges", "point_scoring"],
        last_updated=datetime.now()
    )

def simulate_learning_session(user_id: str, words: List[str], 
                            difficulty: DifficultyLevel) -> LearningSession:
    """
    Simulate a learning session for testing
    
    Args:
        user_id: User identifier
        words: Words practiced
        difficulty: Difficulty level
        
    Returns:
        Simulated learning session
    """
    # Simulate realistic scores based on difficulty
    difficulty_multipliers = {
        DifficultyLevel.VERY_EASY: 0.9,
        DifficultyLevel.EASY: 0.8,
        DifficultyLevel.MEDIUM: 0.7,
        DifficultyLevel.HARD: 0.6,
        DifficultyLevel.VERY_HARD: 0.5
    }
    
    base_performance = difficulty_multipliers.get(difficulty, 0.7)
    scores = []
    
    for _ in words:
        # Add some randomness to simulate real performance
        score = np.random.normal(base_performance, 0.15)
        score = max(0, min(1, score))  # Clamp to [0, 1]
        scores.append(score)
    
    return LearningSession(
        user_id=user_id,
        session_id=f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        words_practiced=words,
        scores=scores,
        difficulty_level=difficulty,
        session_duration=np.random.uniform(5, 20),  # 5-20 minutes
        mistakes=[word for word, score in zip(words, scores) if score < 0.6],
        timestamp=datetime.now(),
        engagement_level=np.random.uniform(0.5, 1.0)
    )
