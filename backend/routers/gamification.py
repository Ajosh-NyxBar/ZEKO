from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

from services.firebase import firebase_service

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class PointAwardRequest(BaseModel):
    user_id: str
    points: int
    reason: str
    activity_type: str
    metadata: Optional[Dict] = None

class PointAwardResponse(BaseModel):
    success: bool
    points_awarded: int
    total_points: int
    level_up: bool = False
    new_level: int = None
    message: str

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str
    points_reward: int
    rarity: str = "common"  # common, rare, epic, legendary

class UserLevelInfo(BaseModel):
    user_id: str
    current_level: int
    current_xp: int
    xp_for_next_level: int
    level_progress_percentage: float
    level_benefits: List[str]

class GameificationStatsResponse(BaseModel):
    user_id: str
    total_points: int
    current_level: int
    achievements_count: int
    daily_streak: int
    weekly_rank: int = None
    badges: List[Dict]
    recent_rewards: List[Dict]

@router.post("/points/award", response_model=PointAwardResponse)
async def award_points(request: PointAwardRequest):
    """
    Award points to a user for completing activities
    """
    try:
        # Get current user progress
        current_progress = await firebase_service.get_user_progress(request.user_id)
        
        if not current_progress:
            current_progress = await firebase_service.initialize_user_progress(request.user_id)
        
        # Calculate new total points
        old_total = current_progress.get("total_points", 0)
        new_total = old_total + request.points
        
        # Check for level up
        old_level = current_progress.get("current_level", 1)
        new_level = calculate_level_from_points(new_total)
        level_up = new_level > old_level
        
        # Update user progress
        await firebase_service.update_user_points(
            user_id=request.user_id,
            new_total=new_total,
            new_level=new_level
        )
        
        # Log point transaction
        await firebase_service.log_point_transaction(
            user_id=request.user_id,
            points=request.points,
            reason=request.reason,
            activity_type=request.activity_type,
            metadata=request.metadata
        )
        
        # Generate response message
        message = generate_point_award_message(request.points, level_up, new_level)
        
        return PointAwardResponse(
            success=True,
            points_awarded=request.points,
            total_points=new_total,
            level_up=level_up,
            new_level=new_level if level_up else None,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to award points: {str(e)}")

@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """
    Get all achievements for a user
    """
    try:
        # Get user achievements
        user_achievements = await firebase_service.get_user_achievements(user_id)
        
        # Get all available achievements
        all_achievements = get_all_achievements()
        
        # Calculate progress
        earned_ids = [ach["id"] for ach in user_achievements]
        
        achievement_progress = []
        for achievement in all_achievements:
            is_earned = achievement["id"] in earned_ids
            earned_date = None
            
            if is_earned:
                earned_achievement = next(ach for ach in user_achievements if ach["id"] == achievement["id"])
                earned_date = earned_achievement.get("earned_date")
            
            achievement_progress.append({
                **achievement,
                "is_earned": is_earned,
                "earned_date": earned_date,
                "progress": 100 if is_earned else await calculate_achievement_progress(user_id, achievement["id"])
            })
        
        return {
            "user_id": user_id,
            "achievements": achievement_progress,
            "total_earned": len(user_achievements),
            "total_available": len(all_achievements),
            "completion_percentage": (len(user_achievements) / len(all_achievements)) * 100 if all_achievements else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get achievements: {str(e)}")

@router.get("/level/{user_id}", response_model=UserLevelInfo)
async def get_user_level_info(user_id: str):
    """
    Get detailed level information for a user
    """
    try:
        progress = await firebase_service.get_user_progress(user_id)
        
        if not progress:
            progress = await firebase_service.initialize_user_progress(user_id)
        
        current_level = progress.get("current_level", 1)
        total_points = progress.get("total_points", 0)
        
        # Calculate XP and next level requirements
        current_level_min_points = calculate_points_for_level(current_level)
        next_level_min_points = calculate_points_for_level(current_level + 1)
        
        current_xp = total_points - current_level_min_points
        xp_for_next_level = next_level_min_points - current_level_min_points
        
        progress_percentage = (current_xp / xp_for_next_level) * 100 if xp_for_next_level > 0 else 100
        
        # Get level benefits
        level_benefits = get_level_benefits(current_level)
        
        return UserLevelInfo(
            user_id=user_id,
            current_level=current_level,
            current_xp=current_xp,
            xp_for_next_level=xp_for_next_level,
            level_progress_percentage=progress_percentage,
            level_benefits=level_benefits
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get level info: {str(e)}")

@router.post("/level/update")
async def update_user_level(user_id: str, new_level: int):
    """
    Manually update user level (admin function)
    """
    try:
        # Verify the new level is valid
        if new_level < 1 or new_level > 100:
            raise HTTPException(status_code=400, detail="Invalid level range")
        
        # Update user level
        await firebase_service.update_user_level(user_id, new_level)
        
        # Log level change
        await firebase_service.log_level_change(user_id, new_level)
        
        return {
            "success": True,
            "message": f"User level updated to {new_level}",
            "new_level": new_level
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update level: {str(e)}")

@router.get("/stats/{user_id}", response_model=GameificationStatsResponse)
async def get_gamification_stats(user_id: str):
    """
    Get comprehensive gamification statistics for a user
    """
    try:
        # Get user progress
        progress = await firebase_service.get_user_progress(user_id)
        if not progress:
            progress = await firebase_service.initialize_user_progress(user_id)
        
        # Get achievements
        achievements = await firebase_service.get_user_achievements(user_id)
        
        # Get badges
        badges = await get_user_badges(user_id)
        
        # Get recent rewards
        recent_rewards = await firebase_service.get_recent_rewards(user_id, limit=5)
        
        # Calculate weekly rank
        weekly_rank = await firebase_service.get_user_weekly_rank(user_id)
        
        return GameificationStatsResponse(
            user_id=user_id,
            total_points=progress.get("total_points", 0),
            current_level=progress.get("current_level", 1),
            achievements_count=len(achievements),
            daily_streak=progress.get("current_streak", 0),
            weekly_rank=weekly_rank,
            badges=badges,
            recent_rewards=recent_rewards
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get gamification stats: {str(e)}")

@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """
    Get user badges based on achievements and performance
    """
    try:
        # Get user data
        progress = await firebase_service.get_user_progress(user_id)
        achievements = await firebase_service.get_user_achievements(user_id)
        
        badges = []
        
        # Activity badges
        if progress.get("total_sessions", 0) >= 10:
            badges.append({
                "id": "active_learner",
                "name": "Pelajar Aktif",
                "description": "Menyelesaikan 10+ sesi pembelajaran",
                "icon": "🎯",
                "color": "#4CAF50"
            })
        
        # Accuracy badges
        if progress.get("average_accuracy", 0) >= 90:
            badges.append({
                "id": "accuracy_expert",
                "name": "Ahli Akurasi",
                "description": "Rata-rata akurasi 90%+",
                "icon": "🎖️",
                "color": "#FF9800"
            })
        
        # Streak badges
        if progress.get("current_streak", 0) >= 7:
            badges.append({
                "id": "streak_master",
                "name": "Master Konsistensi",
                "description": "Belajar 7 hari berturut-turut",
                "icon": "🔥",
                "color": "#F44336"
            })
        
        # Level badges
        current_level = progress.get("current_level", 1)
        if current_level >= 5:
            badges.append({
                "id": "level_explorer",
                "name": "Penjelajah Tingkat Tinggi",
                "description": f"Mencapai Level {current_level}",
                "icon": "⭐",
                "color": "#9C27B0"
            })
        
        # Achievement badges
        if len(achievements) >= 5:
            badges.append({
                "id": "achievement_hunter",
                "name": "Pemburu Prestasi",
                "description": "Meraih 5+ prestasi",
                "icon": "🏆",
                "color": "#FFD700"
            })
        
        return badges
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get badges: {str(e)}")

@router.get("/daily-bonus/{user_id}")
async def get_daily_bonus(user_id: str):
    """
    Get daily login bonus for user
    """
    try:
        # Check if user already claimed today's bonus
        last_bonus_date = await firebase_service.get_last_bonus_date(user_id)
        today = datetime.utcnow().date()
        
        if last_bonus_date and last_bonus_date == today.isoformat():
            return {
                "bonus_available": False,
                "message": "Bonus hari ini sudah diambil!",
                "next_bonus_in": "24 jam",
                "bonus_points": 0
            }
        
        # Calculate bonus based on streak
        streak = await firebase_service.get_user_streak(user_id)
        base_bonus = 10
        streak_multiplier = min(streak, 7)  # Max 7x multiplier
        bonus_points = base_bonus + (streak_multiplier * 5)
        
        # Award bonus
        await firebase_service.award_daily_bonus(user_id, bonus_points)
        
        return {
            "bonus_available": True,
            "message": f"🎉 Selamat! Kamu mendapat {bonus_points} poin bonus harian!",
            "bonus_points": bonus_points,
            "streak_bonus": streak_multiplier * 5,
            "current_streak": streak
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily bonus: {str(e)}")

# Helper functions
def calculate_level_from_points(total_points: int) -> int:
    """
    Calculate user level based on total points
    Level 1: 0-99 points
    Level 2: 100-249 points
    Level 3: 250-449 points
    Level 4: 500-699 points
    And so on...
    """
    if total_points < 100:
        return 1
    
    # Formula: level = floor(sqrt(total_points / 50)) + 1
    import math
    level = math.floor(math.sqrt(total_points / 50)) + 1
    return min(level, 100)  # Cap at level 100

def calculate_points_for_level(level: int) -> int:
    """
    Calculate minimum points required for a specific level
    """
    if level <= 1:
        return 0
    
    # Inverse of level calculation
    return ((level - 1) ** 2) * 50

def generate_point_award_message(points: int, level_up: bool, new_level: int = None) -> str:
    """
    Generate encouraging message for point awards
    """
    messages = [
        f"🌟 Luar biasa! Kamu mendapat {points} poin!",
        f"👏 Bagus sekali! +{points} poin untuk kamu!",
        f"🎉 Hebat! Kamu berhasil meraih {points} poin!",
        f"💫 Fantastis! {points} poin telah ditambahkan!"
    ]
    
    import random
    base_message = random.choice(messages)
    
    if level_up:
        base_message += f" 🚀 DAN KAMU NAIK KE LEVEL {new_level}!"
    
    return base_message

def get_all_achievements() -> List[Dict]:
    """
    Get all available achievements in the system
    """
    return [
        {
            "id": "first_speech",
            "name": "Pembicara Pertama",
            "description": "Menyelesaikan latihan bicara pertama",
            "icon": "🎤",
            "category": "speech_training",
            "points_reward": 25,
            "rarity": "common"
        },
        {
            "id": "accuracy_master",
            "name": "Master Akurasi",
            "description": "Mencapai akurasi 95% atau lebih",
            "icon": "🎯",
            "category": "performance",
            "points_reward": 50,
            "rarity": "rare"
        },
        {
            "id": "point_collector_100",
            "name": "Kolektor Poin Pemula",
            "description": "Mengumpulkan 100 poin",
            "icon": "💰",
            "category": "milestone",
            "points_reward": 20,
            "rarity": "common"
        },
        {
            "id": "point_collector_1000",
            "name": "Kolektor Poin Master",
            "description": "Mengumpulkan 1000 poin",
            "icon": "💎",
            "category": "milestone",
            "points_reward": 100,
            "rarity": "epic"
        },
        {
            "id": "streak_warrior_3",
            "name": "Konsisten 3 Hari",
            "description": "Belajar 3 hari berturut-turut",
            "icon": "🔥",
            "category": "consistency",
            "points_reward": 30,
            "rarity": "common"
        },
        {
            "id": "streak_warrior_7",
            "name": "Pejuang Mingguan",
            "description": "Belajar 7 hari berturut-turut",
            "icon": "🔥",
            "category": "consistency",
            "points_reward": 75,
            "rarity": "rare"
        },
        {
            "id": "storyteller",
            "name": "Tukang Cerita",
            "description": "Menyelesaikan 10 sesi bercerita",
            "icon": "📚",
            "category": "storytelling",
            "points_reward": 50,
            "rarity": "rare"
        },
        {
            "id": "singer",
            "name": "Penyanyi Cilik",
            "description": "Menyelesaikan 10 sesi bernyanyi",
            "icon": "🎵",
            "category": "singing",
            "points_reward": 50,
            "rarity": "rare"
        },
        {
            "id": "level_5",
            "name": "Penjelajah Level 5",
            "description": "Mencapai Level 5",
            "icon": "⭐",
            "category": "level",
            "points_reward": 100,
            "rarity": "epic"
        },
        {
            "id": "perfect_week",
            "name": "Minggu Sempurna",
            "description": "Akurasi 100% selama seminggu",
            "icon": "👑",
            "category": "performance",
            "points_reward": 200,
            "rarity": "legendary"
        }
    ]

async def calculate_achievement_progress(user_id: str, achievement_id: str) -> float:
    """
    Calculate progress towards a specific achievement
    """
    try:
        progress = await firebase_service.get_user_progress(user_id)
        sessions = await firebase_service.get_user_sessions(user_id, days=30)
        
        if achievement_id == "first_speech":
            speech_sessions = [s for s in sessions if s.get("activity_type") == "speech_training"]
            return min(len(speech_sessions) * 100, 100)
        
        elif achievement_id == "accuracy_master":
            if progress.get("average_accuracy", 0) >= 95:
                return 100
            return progress.get("average_accuracy", 0)
        
        elif achievement_id == "point_collector_100":
            return min((progress.get("total_points", 0) / 100) * 100, 100)
        
        elif achievement_id == "point_collector_1000":
            return min((progress.get("total_points", 0) / 1000) * 100, 100)
        
        elif achievement_id == "streak_warrior_3":
            return min((progress.get("current_streak", 0) / 3) * 100, 100)
        
        elif achievement_id == "streak_warrior_7":
            return min((progress.get("current_streak", 0) / 7) * 100, 100)
        
        elif achievement_id == "storyteller":
            storytelling_sessions = [s for s in sessions if s.get("activity_type") == "storytelling"]
            return min((len(storytelling_sessions) / 10) * 100, 100)
        
        elif achievement_id == "singer":
            singing_sessions = [s for s in sessions if s.get("activity_type") == "singing"]
            return min((len(singing_sessions) / 10) * 100, 100)
        
        elif achievement_id == "level_5":
            return min((progress.get("current_level", 1) / 5) * 100, 100)
        
        elif achievement_id == "perfect_week":
            # Check for perfect accuracy in the last 7 days
            recent_sessions = [s for s in sessions if s.get("accuracy_score", 0) == 100]
            if len(recent_sessions) >= 7:
                return 100
            return (len(recent_sessions) / 7) * 100
        
        return 0
        
    except Exception as e:
        logger.error(f"Error calculating achievement progress: {str(e)}")
        return 0

def get_level_benefits(level: int) -> List[str]:
    """
    Get benefits/rewards for reaching a specific level
    """
    benefits = []
    
    if level >= 2:
        benefits.append("🎨 Unlock new character customization")
    if level >= 3:
        benefits.append("🎵 Unlock singing activities")
    if level >= 5:
        benefits.append("📚 Unlock advanced storytelling")
    if level >= 7:
        benefits.append("🌟 Special avatar decorations")
    if level >= 10:
        benefits.append("🏆 Join weekly leaderboard")
    if level >= 15:
        benefits.append("🎁 Daily bonus multiplier x2")
    if level >= 20:
        benefits.append("👑 VIP status and exclusive content")
    
    # Always include current level benefit
    current_benefits = [
        f"💪 Level {level} status",
        f"⚡ {level * 10}% bonus points multiplier"
    ]
    
    return current_benefits + benefits
