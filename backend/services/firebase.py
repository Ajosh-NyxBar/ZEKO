import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

class FirebaseService:
    """
    Firebase service for authentication, Firestore, and storage operations
    """
    
    def __init__(self):
        self.app = None
        self.db = None
        self.bucket = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """
        Initialize Firebase Admin SDK
        """
        try:
            if not firebase_admin._apps:
                # Load service account credentials
                service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
                
                if service_account_path and os.path.exists(service_account_path):
                    # Load from file
                    cred = credentials.Certificate(service_account_path)
                else:
                    # Load from environment variable (JSON string)
                    service_account_info = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
                    if service_account_info:
                        service_account_dict = json.loads(service_account_info)
                        cred = credentials.Certificate(service_account_dict)
                    else:
                        logger.error("Firebase credentials not found")
                        return
                
                # Initialize Firebase app
                self.app = firebase_admin.initialize_app(cred, {
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'zeko-70d2a.appspot.com')
                })
                
                # Initialize services
                self.db = firestore.client()
                self.bucket = storage.bucket()
                
                logger.info("Firebase initialized successfully")
            else:
                # Use existing app
                self.app = firebase_admin.get_app()
                self.db = firestore.client()
                self.bucket = storage.bucket()
                
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
    
    # User Management
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user data from Firestore
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {str(e)}")
            return None
    
    def create_user_profile(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """
        Create or update user profile in Firestore
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.set(user_data, merge=True)
            logger.info(f"User profile created/updated for {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating user profile {user_id}: {str(e)}")
            return False
    
    def update_user_progress(self, user_id: str, progress_data: Dict[str, Any]) -> bool:
        """
        Update user learning progress
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.update({
                'progress': progress_data,
                'lastActive': firestore.SERVER_TIMESTAMP
            })
            return True
            
        except Exception as e:
            logger.error(f"Error updating progress for {user_id}: {str(e)}")
            return False
    
    # Speech Training Sessions
    def save_speech_session(self, user_id: str, session_data: Dict[str, Any]) -> Optional[str]:
        """
        Save speech training session data
        """
        try:
            doc_ref = self.db.collection('speech_sessions').add({
                'userId': user_id,
                'timestamp': firestore.SERVER_TIMESTAMP,
                **session_data
            })
            
            session_id = doc_ref[1].id
            logger.info(f"Speech session saved with ID: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Error saving speech session: {str(e)}")
            return None
    
    def get_user_sessions(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get user's recent speech training sessions
        """
        try:
            query = (self.db.collection('speech_sessions')
                    .where('userId', '==', user_id)
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)
                    .limit(limit))
            
            sessions = []
            for doc in query.stream():
                session_data = doc.to_dict()
                session_data['id'] = doc.id
                sessions.append(session_data)
            
            return sessions
            
        except Exception as e:
            logger.error(f"Error getting user sessions: {str(e)}")
            return []
    
    # Audio Storage
    def upload_audio(self, audio_data: bytes, filename: str, user_id: str) -> Optional[str]:
        """
        Upload audio file to Firebase Storage
        """
        try:
            blob_path = f"audio_recordings/{user_id}/{filename}"
            blob = self.bucket.blob(blob_path)
            
            blob.upload_from_string(
                audio_data,
                content_type='audio/mpeg'
            )
            
            # Make blob publicly readable (optional, depends on requirements)
            blob.make_public()
            
            logger.info(f"Audio uploaded successfully: {blob_path}")
            return blob.public_url
            
        except Exception as e:
            logger.error(f"Error uploading audio: {str(e)}")
            return None
    
    def delete_audio(self, file_path: str) -> bool:
        """
        Delete audio file from Firebase Storage
        """
        try:
            blob = self.bucket.blob(file_path)
            blob.delete()
            logger.info(f"Audio deleted: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting audio: {str(e)}")
            return False
    
    # Analytics and Reporting
    def get_user_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Get user analytics for specified period
        """
        try:
            from datetime import datetime, timedelta
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get sessions in date range
            query = (self.db.collection('speech_sessions')
                    .where('userId', '==', user_id)
                    .where('timestamp', '>=', start_date)
                    .where('timestamp', '<=', end_date))
            
            sessions = []
            total_score = 0
            total_duration = 0
            
            for doc in query.stream():
                session = doc.to_dict()
                sessions.append(session)
                total_score += session.get('score', 0)
                total_duration += session.get('duration', 0)
            
            analytics = {
                'totalSessions': len(sessions),
                'averageScore': total_score / len(sessions) if sessions else 0,
                'totalDuration': total_duration,
                'progressTrend': self._calculate_progress_trend(sessions),
                'strongAreas': self._identify_strong_areas(sessions),
                'improvementAreas': self._identify_improvement_areas(sessions)
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {str(e)}")
            return {}
    
    def _calculate_progress_trend(self, sessions: List[Dict]) -> str:
        """
        Calculate if user is improving, declining, or stable
        """
        if len(sessions) < 3:
            return "insufficient_data"
        
        # Sort by timestamp
        sessions.sort(key=lambda x: x.get('timestamp', 0))
        
        recent_avg = sum(s.get('score', 0) for s in sessions[-5:]) / min(5, len(sessions))
        earlier_avg = sum(s.get('score', 0) for s in sessions[:-5]) / max(1, len(sessions) - 5)
        
        if recent_avg > earlier_avg + 5:
            return "improving"
        elif recent_avg < earlier_avg - 5:
            return "declining"
        else:
            return "stable"
    
    def _identify_strong_areas(self, sessions: List[Dict]) -> List[str]:
        """
        Identify areas where user performs well
        """
        # Placeholder implementation
        return ["pronunciation", "rhythm"]
    
    def _identify_improvement_areas(self, sessions: List[Dict]) -> List[str]:
        """
        Identify areas needing improvement
        """
        # Placeholder implementation
        return ["clarity", "confidence"]

# Global instance
firebase_service = FirebaseService()
