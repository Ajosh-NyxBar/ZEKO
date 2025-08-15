from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

from services.firebase import firebase_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class ProgressUpdateRequest(BaseModel):
    user_id: str
    session_id: str
    activity_type: str  # "speech_training", "storytelling", "singing", etc.
    points_earned: int
    accuracy_score: float = None
    completion_time: int = None  # in seconds
    difficulty_level: str = "easy"
    metadata: Optional[Dict] = None

class ProgressResponse(BaseModel):
    user_id: str
    total_points: int
    current_level: int
    current_streak: int
    total_sessions: int
    average_accuracy: float
    favorite_activity: str
    weekly_progress: Dict[str, int]
    achievements: List[Dict]

class UserStatsResponse(BaseModel):
    user_id: str
    stats: Dict[str, Any]
    learning_insights: List[str]
    next_goals: List[str]
    performance_trends: Dict[str, List[float]]

class LeaderboardResponse(BaseModel):
    rankings: List[Dict]
    user_rank: int = None
    total_participants: int

@router.get("/{user_id}", response_model=ProgressResponse)
async def get_user_progress(user_id: str):
    """
    Get comprehensive user progress information
    """
    try:
        # Get user progress from Firebase
        progress_data = await firebase_service.get_user_progress(user_id)
        
        if not progress_data:
            # Initialize new user progress
            progress_data = await firebase_service.initialize_user_progress(user_id)
        
        # Calculate weekly progress
        weekly_progress = await calculate_weekly_progress(user_id)
        
        # Get achievements
        achievements = await firebase_service.get_user_achievements(user_id)
        
        return ProgressResponse(
            user_id=user_id,
            total_points=progress_data.get("total_points", 0),
            current_level=progress_data.get("current_level", 1),
            current_streak=progress_data.get("current_streak", 0),
            total_sessions=progress_data.get("total_sessions", 0),
            average_accuracy=progress_data.get("average_accuracy", 0.0),
            favorite_activity=progress_data.get("favorite_activity", "speech_training"),
            weekly_progress=weekly_progress,
            achievements=achievements
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user progress: {str(e)}")

@router.post("/update")
async def update_progress(request: ProgressUpdateRequest):
    """
    Update user progress after completing an activity
    """
    try:
        # Get current progress
        current_progress = await firebase_service.get_user_progress(request.user_id)
        
        if not current_progress:
            current_progress = await firebase_service.initialize_user_progress(request.user_id)
        
        # Calculate new progress
        updated_progress = calculate_progress_update(current_progress, request)
        
        # Check for level up
        level_up_data = check_level_up(updated_progress)
        
        # Check for new achievements
        new_achievements = await check_new_achievements(request.user_id, updated_progress, request)
        
        # Save updated progress
        await firebase_service.update_user_progress(request.user_id, updated_progress)
        
        # Save session data
        await firebase_service.save_session_data(request.user_id, {
            "session_id": request.session_id,
            "activity_type": request.activity_type,
            "points_earned": request.points_earned,
            "accuracy_score": request.accuracy_score,
            "completion_time": request.completion_time,
            "difficulty_level": request.difficulty_level,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": request.metadata
        })
        
        response_data = {
            "success": True,
            "message": "Progress updated successfully",
            "points_earned": request.points_earned,
            "total_points": updated_progress["total_points"],
            "current_level": updated_progress["current_level"],
            "level_up": level_up_data["level_up"],
            "new_achievements": new_achievements
        }
        
        if level_up_data["level_up"]:
            response_data["level_up_message"] = f"🎉 Selamat! Kamu naik ke Level {updated_progress['current_level']}!"
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

@router.get("/stats/{user_id}", response_model=UserStatsResponse)
async def get_user_stats(user_id: str, days: int = 30):
    """
    Get detailed user statistics and insights
    """
    try:
        # Get user sessions from the last N days
        sessions_data = await firebase_service.get_user_sessions(user_id, days)
        
        # Calculate statistics
        stats = calculate_user_statistics(sessions_data)
        
        # Generate learning insights
        insights = generate_learning_insights(stats, sessions_data)
        
        # Generate next goals
        next_goals = generate_next_goals(stats)
        
        # Calculate performance trends
        performance_trends = calculate_performance_trends(sessions_data)
        
        return UserStatsResponse(
            user_id=user_id,
            stats=stats,
            learning_insights=insights,
            next_goals=next_goals,
            performance_trends=performance_trends
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user stats: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(period: str = "weekly", limit: int = 10, user_id: str = None):
    """
    Get leaderboard rankings
    """
    try:
        # Get leaderboard data from Firebase
        leaderboard_data = await firebase_service.get_leaderboard(period, limit)
        
        # Find user rank if user_id is provided
        user_rank = None
        if user_id:
            user_rank = await firebase_service.get_user_rank(user_id, period)
        
        total_participants = await firebase_service.get_total_participants(period)
        
        return LeaderboardResponse(
            rankings=leaderboard_data,
            user_rank=user_rank,
            total_participants=total_participants
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

@router.get("/achievements/{user_id}")
async def get_achievements(user_id: str):
    """
    Get all achievements for a user
    """
    try:
        achievements = await firebase_service.get_user_achievements(user_id)
        available_achievements = await firebase_service.get_available_achievements()
        
        return {
            "user_id": user_id,
            "earned_achievements": achievements,
            "available_achievements": available_achievements,
            "completion_percentage": len(achievements) / len(available_achievements) * 100 if available_achievements else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get achievements: {str(e)}")

# Helper functions
async def calculate_weekly_progress(user_id: str) -> Dict[str, int]:
    """
    Calculate progress for the past 7 days
    """
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        sessions = await firebase_service.get_user_sessions_by_date_range(user_id, start_date, end_date)
        
        weekly_progress = {}
        for i in range(7):
            date_key = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
            weekly_progress[date_key] = 0
        
        for session in sessions:
            session_date = session.get("timestamp", "").split("T")[0]
            if session_date in weekly_progress:
                weekly_progress[session_date] += session.get("points_earned", 0)
        
        return weekly_progress
        
    except Exception as e:
        logger.error(f"Error calculating weekly progress: {str(e)}")
        return {}

def calculate_progress_update(current_progress: Dict, request: ProgressUpdateRequest) -> Dict:
    """
    Calculate updated progress based on new session
    """
    updated_progress = current_progress.copy()
    
    # Update total points
    updated_progress["total_points"] = current_progress.get("total_points", 0) + request.points_earned
    
    # Update total sessions
    updated_progress["total_sessions"] = current_progress.get("total_sessions", 0) + 1
    
    # Update average accuracy
    if request.accuracy_score is not None:
        current_avg = current_progress.get("average_accuracy", 0.0)
        current_sessions = current_progress.get("total_sessions", 0)
        
        if current_sessions > 0:
            new_avg = ((current_avg * current_sessions) + request.accuracy_score) / (current_sessions + 1)
        else:
            new_avg = request.accuracy_score
        
        updated_progress["average_accuracy"] = new_avg
    
    # Update activity frequency
    activity_freq = current_progress.get("activity_frequency", {})
    activity_freq[request.activity_type] = activity_freq.get(request.activity_type, 0) + 1
    updated_progress["activity_frequency"] = activity_freq
    
    # Update favorite activity
    most_frequent_activity = max(activity_freq.items(), key=lambda x: x[1])[0]
    updated_progress["favorite_activity"] = most_frequent_activity
    
    # Update streak
    last_session_date = current_progress.get("last_session_date")
    today = datetime.utcnow().date()
    
    if last_session_date:
        last_date = datetime.fromisoformat(last_session_date).date()
        if (today - last_date).days == 1:
            # Consecutive day
            updated_progress["current_streak"] = current_progress.get("current_streak", 0) + 1
        elif (today - last_date).days == 0:
            # Same day, maintain streak
            updated_progress["current_streak"] = current_progress.get("current_streak", 1)
        else:
            # Streak broken
            updated_progress["current_streak"] = 1
    else:
        updated_progress["current_streak"] = 1
    
    updated_progress["last_session_date"] = today.isoformat()
    updated_progress["last_updated"] = datetime.utcnow().isoformat()
    
    return updated_progress

def check_level_up(progress_data: Dict) -> Dict:
    """
    Check if user has leveled up
    """
    current_level = progress_data.get("current_level", 1)
    total_points = progress_data.get("total_points", 0)
    
    # Level calculation: Level 1 = 0-99 points, Level 2 = 100-299 points, etc.
    required_points_for_current_level = (current_level - 1) * 100 + (current_level - 1) * 50
    required_points_for_next_level = current_level * 100 + current_level * 50
    
    if total_points >= required_points_for_next_level:
        progress_data["current_level"] = current_level + 1
        return {"level_up": True, "new_level": current_level + 1}
    
    return {"level_up": False}

async def check_new_achievements(user_id: str, progress_data: Dict, session_data: ProgressUpdateRequest) -> List[Dict]:
    """
    Check for new achievements earned
    """
    new_achievements = []
    current_achievements = await firebase_service.get_user_achievements(user_id)
    earned_achievement_ids = [ach["id"] for ach in current_achievements]
    
    # Define achievement criteria
    achievements_criteria = [
        {
            "id": "first_speech",
            "name": "Pembicara Pertama",
            "description": "Menyelesaikan latihan bicara pertama",
            "icon": "🎤",
            "criteria": lambda p, s: s.activity_type == "speech_training"
        },
        {
            "id": "accuracy_master",
            "name": "Master Akurasi",
            "description": "Mencapai akurasi 95% atau lebih",
            "icon": "🎯",
            "criteria": lambda p, s: s.accuracy_score and s.accuracy_score >= 95
        },
        {
            "id": "point_collector",
            "name": "Kolektor Poin",
            "description": "Mengumpulkan 1000 poin",
            "icon": "💎",
            "criteria": lambda p, s: p.get("total_points", 0) >= 1000
        },
        {
            "id": "streak_warrior",
            "name": "Pejuang Konsisten",
            "description": "Belajar 7 hari berturut-turut",
            "icon": "🔥",
            "criteria": lambda p, s: p.get("current_streak", 0) >= 7
        },
        {
            "id": "level_5",
            "name": "Penjelajah Level 5",
            "description": "Mencapai Level 5",
            "icon": "⭐",
            "criteria": lambda p, s: p.get("current_level", 1) >= 5
        }
    ]
    
    for achievement in achievements_criteria:
        if achievement["id"] not in earned_achievement_ids:
            if achievement["criteria"](progress_data, session_data):
                new_achievement = {
                    "id": achievement["id"],
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "icon": achievement["icon"],
                    "earned_date": datetime.utcnow().isoformat()
                }
                new_achievements.append(new_achievement)
                
                # Save achievement to Firebase
                await firebase_service.save_user_achievement(user_id, new_achievement)
    
    return new_achievements

def calculate_user_statistics(sessions_data: List[Dict]) -> Dict:
    """
    Calculate comprehensive user statistics
    """
    if not sessions_data:
        return {
            "total_sessions": 0,
            "total_time_spent": 0,
            "average_accuracy": 0,
            "favorite_activity": "speech_training",
            "best_streak": 0,
            "total_points": 0
        }
    
    total_sessions = len(sessions_data)
    total_time = sum(session.get("completion_time", 0) for session in sessions_data)
    accuracies = [s.get("accuracy_score", 0) for s in sessions_data if s.get("accuracy_score")]
    average_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
    
    # Count activity types
    activity_counts = {}
    for session in sessions_data:
        activity = session.get("activity_type", "unknown")
        activity_counts[activity] = activity_counts.get(activity, 0) + 1
    
    favorite_activity = max(activity_counts.items(), key=lambda x: x[1])[0] if activity_counts else "speech_training"
    total_points = sum(session.get("points_earned", 0) for session in sessions_data)
    
    return {
        "total_sessions": total_sessions,
        "total_time_spent": total_time,
        "average_accuracy": average_accuracy,
        "favorite_activity": favorite_activity,
        "activity_breakdown": activity_counts,
        "total_points": total_points
    }

def generate_learning_insights(stats: Dict, sessions_data: List[Dict]) -> List[str]:
    """
    Generate learning insights based on user statistics
    """
    insights = []
    
    if stats["average_accuracy"] > 90:
        insights.append("🌟 Kamu memiliki akurasi yang sangat baik! Pertahankan!")
    elif stats["average_accuracy"] > 80:
        insights.append("👍 Akurasi kamu bagus, masih bisa ditingkatkan lagi!")
    else:
        insights.append("💪 Terus berlatih untuk meningkatkan akurasi!")
    
    if stats["total_sessions"] > 50:
        insights.append("🏆 Kamu adalah pelajar yang rajin! Sudah banyak sesi yang diselesaikan!")
    
    if stats.get("activity_breakdown", {}).get("speech_training", 0) > 20:
        insights.append("🎤 Kamu ahli dalam latihan bicara!")
    
    if len(insights) == 0:
        insights.append("🚀 Terus belajar dan kamu akan melihat kemajuan yang luar biasa!")
    
    return insights

def generate_next_goals(stats: Dict) -> List[str]:
    """
    Generate next learning goals for the user
    """
    goals = []
    
    if stats["average_accuracy"] < 90:
        goals.append("🎯 Tingkatkan akurasi menjadi 90% atau lebih")
    
    if stats["total_sessions"] < 30:
        goals.append("📈 Selesaikan 30 sesi latihan")
    
    activity_counts = stats.get("activity_breakdown", {})
    if activity_counts.get("storytelling", 0) < 5:
        goals.append("📚 Coba lebih banyak latihan bercerita")
    
    if activity_counts.get("singing", 0) < 5:
        goals.append("🎵 Eksplorasi latihan bernyanyi")
    
    if len(goals) == 0:
        goals.append("⭐ Pertahankan performa yang luar biasa!")
    
    return goals

def calculate_performance_trends(sessions_data: List[Dict]) -> Dict[str, List[float]]:
    """
    Calculate performance trends over time
    """
    if not sessions_data:
        return {}
    
    # Sort sessions by timestamp
    sorted_sessions = sorted(sessions_data, key=lambda x: x.get("timestamp", ""))
    
    accuracy_trend = []
    points_trend = []
    time_trend = []
    
    for session in sorted_sessions:
        if session.get("accuracy_score"):
            accuracy_trend.append(session["accuracy_score"])
        
        points_trend.append(session.get("points_earned", 0))
        time_trend.append(session.get("completion_time", 0))
    
    return {
        "accuracy_trend": accuracy_trend,
        "points_trend": points_trend,
        "completion_time_trend": time_trend
    }
