import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
const { width, height } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  points: number;
}

interface Level {
  level: number;
  title: string;
  requiredPoints: number;
  color: string;
  icon: string;
}

const GamificationScreen: React.FC = () => {
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(3);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentLevelProgress, setCurrentLevelProgress] = useState(0.65);
  const [dailyStreak, setDailyStreak] = useState(7);
  
  const progressAnimation = new Animated.Value(0);
  const pointsAnimation = new Animated.Value(0);

  // Level system configuration
  const levels: Level[] = [
    { level: 1, title: 'Pemula Berani', requiredPoints: 0, color: '#4CAF50', icon: 'happy-outline' },
    { level: 2, title: 'Penjelajah Kata', requiredPoints: 500, color: '#2196F3', icon: 'library-outline' },
    { level: 3, title: 'Pembicara Hebat', requiredPoints: 1000, color: '#FF9800', icon: 'mic-outline' },
    { level: 4, title: 'Master Cerita', requiredPoints: 2000, color: '#9C27B0', icon: 'book-outline' },
    { level: 5, title: 'Legenda ZEKO', requiredPoints: 4000, color: '#F44336', icon: 'trophy-outline' },
  ];

  useEffect(() => {
    loadGamificationData();
    animateProgress();
    animatePoints();
  }, []);

  const loadGamificationData = async () => {
    try {
      // Mock achievements data - replace with actual API call
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Bicara Pertama',
          description: 'Selesaikan latihan bicara pertama',
          icon: 'mic',
          unlocked: true,
          progress: 1,
          maxProgress: 1,
          points: 50,
        },
        {
          id: '2',
          title: 'Emosi Master',
          description: 'Ekspresikan 10 emosi berbeda',
          icon: 'happy',
          unlocked: true,
          progress: 10,
          maxProgress: 10,
          points: 100,
        },
        {
          id: '3',
          title: 'Streak Champion',
          description: 'Latihan selama 7 hari berturut-turut',
          icon: 'flash',
          unlocked: true,
          progress: 7,
          maxProgress: 7,
          points: 200,
        },
        {
          id: '4',
          title: 'Pembaca Cerita',
          description: 'Baca 5 cerita dengan sempurna',
          icon: 'book',
          unlocked: false,
          progress: 3,
          maxProgress: 5,
          points: 150,
        },
        {
          id: '5',
          title: 'Penyanyi Kecil',
          description: 'Nyanyikan 10 lagu berbeda',
          icon: 'musical-notes',
          unlocked: false,
          progress: 2,
          maxProgress: 10,
          points: 300,
        },
        {
          id: '6',
          title: 'Guru Kecil',
          description: 'Bantu teman belajar 5 kali',
          icon: 'school',
          unlocked: false,
          progress: 0,
          maxProgress: 5,
          points: 400,
        },
      ];
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const animateProgress = () => {
    Animated.timing(progressAnimation, {
      toValue: currentLevelProgress,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const animatePoints = () => {
    Animated.timing(pointsAnimation, {
      toValue: userPoints,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const getCurrentLevel = () => {
    return levels.find(level => level.level === userLevel) || levels[0];
  };

  const getNextLevel = () => {
    return levels.find(level => level.level === userLevel + 1) || levels[levels.length - 1];
  };

  const renderLevelProgress = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    const progressWidth = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.levelCard}>
        <LinearGradient
          colors={[currentLevel.color, currentLevel.color + '80']}
          style={styles.levelGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelHeader}>
            <Ionicons name={currentLevel.icon as any} size={30} color="white" />
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {currentLevel.level}</Text>
              <Text style={styles.levelSubtitle}>{currentLevel.title}</Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>
                {userPoints}
              </Text>
              <Text style={styles.pointsLabel}>Poin</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[styles.progressFill, { width: progressWidth }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.floor(currentLevelProgress * 100)}% menuju {nextLevel.title}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderDailyStreak = () => (
    <View style={styles.streakCard}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.streakGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="flash" size={40} color="white" />
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{dailyStreak}</Text>
          <Text style={styles.streakLabel}>Hari Berturut-turut</Text>
        </View>
        <Ionicons name="flame" size={30} color="#FFD700" />
      </LinearGradient>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsSection}>
      <Text style={styles.sectionTitle}>🏆 Pencapaian</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={[
              styles.achievementCard,
              achievement.unlocked ? styles.unlockedCard : styles.lockedCard
            ]}
          >
            <View style={styles.achievementIcon}>
              <Ionicons 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.unlocked ? '#FFD700' : '#999'} 
              />
            </View>
            <Text style={[
              styles.achievementTitle,
              achievement.unlocked ? styles.unlockedText : styles.lockedText
            ]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
            <View style={styles.achievementProgress}>
              <View style={styles.achievementProgressBar}>
                <View 
                  style={[
                    styles.achievementProgressFill,
                    { 
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      backgroundColor: achievement.unlocked ? '#4CAF50' : '#ddd'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.achievementProgressText}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
            {achievement.unlocked && (
              <Text style={styles.achievementPoints}>+{achievement.points} poin</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>⚡ Aksi Cepat</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="mic" size={30} color="white" />
            <Text style={styles.quickActionText}>Latihan Bicara</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="book" size={30} color="white" />
            <Text style={styles.quickActionText}>Baca Cerita</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="musical-notes" size={30} color="white" />
            <Text style={styles.quickActionText}>Nyanyikan Lagu</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="happy" size={30} color="white" />
            <Text style={styles.quickActionText}>Latihan Emosi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Pencapaianku</Text>
            <Text style={styles.headerSubtitle}>Mari lihat progresmu!</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="trophy" size={40} color="#FFD700" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {renderLevelProgress()}
        {renderDailyStreak()}
        {renderAchievements()}
        {renderQuickActions()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 120,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  levelCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  levelGradient: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 15,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  pointsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  streakCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  streakGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  achievementCard: {
    width: 160,
    padding: 15,
    marginRight: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  unlockedCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  lockedCard: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  unlockedText: {
    color: '#333',
  },
  lockedText: {
    color: '#999',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 5,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#666',
  },
  achievementPoints: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default GamificationScreen;
