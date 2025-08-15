import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScreenHeader } from '../../../components/ScreenHeader';

const { width } = Dimensions.get('window');

interface ProgressData {
  date: string;
  speechScore: number;
  gamesPlayed: number;
  storiesCompleted: number;
  songsLearned: number;
  totalPoints: number;
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
}

interface WeeklyData {
  week: string;
  totalActivities: number;
  averageScore: number;
  improvement: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface ProgressMoodScreenProps {
  onBack?: () => void;
}

const ProgressMoodScreen: React.FC<ProgressMoodScreenProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'progress' | 'mood' | 'achievements'>('progress');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [todayMoodSaved, setTodayMoodSaved] = useState(false);

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    loadProgressData();
    loadAchievements();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadProgressData = () => {
    // Mock data for last 7 days
    const mockData: ProgressData[] = [
      {
        date: '2024-01-15',
        speechScore: 85,
        gamesPlayed: 3,
        storiesCompleted: 2,
        songsLearned: 1,
        totalPoints: 150,
        mood: 'happy',
      },
      {
        date: '2024-01-14',
        speechScore: 78,
        gamesPlayed: 2,
        storiesCompleted: 1,
        songsLearned: 0,
        totalPoints: 120,
        mood: 'neutral',
      },
      {
        date: '2024-01-13',
        speechScore: 92,
        gamesPlayed: 4,
        storiesCompleted: 3,
        songsLearned: 2,
        totalPoints: 200,
        mood: 'very_happy',
      },
      {
        date: '2024-01-12',
        speechScore: 70,
        gamesPlayed: 1,
        storiesCompleted: 1,
        songsLearned: 0,
        totalPoints: 80,
        mood: 'sad',
      },
      {
        date: '2024-01-11',
        speechScore: 88,
        gamesPlayed: 3,
        storiesCompleted: 2,
        songsLearned: 1,
        totalPoints: 160,
        mood: 'happy',
      },
      {
        date: '2024-01-10',
        speechScore: 95,
        gamesPlayed: 5,
        storiesCompleted: 4,
        songsLearned: 3,
        totalPoints: 250,
        mood: 'very_happy',
      },
      {
        date: '2024-01-09',
        speechScore: 82,
        gamesPlayed: 2,
        storiesCompleted: 2,
        songsLearned: 1,
        totalPoints: 140,
        mood: 'happy',
      },
    ];

    setProgressData(mockData);

    // Calculate weekly data
    const weekly: WeeklyData[] = [
      {
        week: 'Minggu ini',
        totalActivities: 15,
        averageScore: 85,
        improvement: 12,
      },
      {
        week: 'Minggu lalu',
        totalActivities: 12,
        averageScore: 78,
        improvement: 8,
      },
      {
        week: '2 minggu lalu',
        totalActivities: 10,
        averageScore: 72,
        improvement: 5,
      },
    ];

    setWeeklyData(weekly);
  };

  const loadAchievements = () => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Pemula Bicara',
        description: 'Selesaikan 10 latihan bicara',
        icon: 'mic',
        unlocked: true,
        progress: 10,
        target: 10,
      },
      {
        id: '2',
        title: 'Pembaca Cerita',
        description: 'Baca 5 cerita lengkap',
        icon: 'book',
        unlocked: true,
        progress: 5,
        target: 5,
      },
      {
        id: '3',
        title: 'Penyanyi Kecil',
        description: 'Pelajari 3 lagu baru',
        icon: 'musical-notes',
        unlocked: false,
        progress: 2,
        target: 3,
      },
      {
        id: '4',
        title: 'Juara Permainan',
        description: 'Menangkan 20 permainan',
        icon: 'trophy',
        unlocked: false,
        progress: 15,
        target: 20,
      },
      {
        id: '5',
        title: 'Konsisten 7 Hari',
        description: 'Login setiap hari selama seminggu',
        icon: 'calendar',
        unlocked: false,
        progress: 6,
        target: 7,
      },
      {
        id: '6',
        title: 'Master Emosi',
        description: 'Kenali semua jenis emosi',
        icon: 'happy',
        unlocked: false,
        progress: 8,
        target: 10,
      },
    ];

    setAchievements(mockAchievements);
  };

  const getMoodIcon = (mood: string): string => {
    switch (mood) {
      case 'very_happy':
        return '😄';
      case 'happy':
        return '😊';
      case 'neutral':
        return '😐';
      case 'sad':
        return '😢';
      case 'very_sad':
        return '😭';
      default:
        return '😊';
    }
  };

  const getMoodColor = (mood: string): string => {
    switch (mood) {
      case 'very_happy':
        return '#4CAF50';
      case 'happy':
        return '#8BC34A';
      case 'neutral':
        return '#FFC107';
      case 'sad':
        return '#FF9800';
      case 'very_sad':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const saveTodayMood = () => {
    if (!selectedMood) {
      Alert.alert('Pilih Mood', 'Silakan pilih mood kamu hari ini!');
      return;
    }

    setTodayMoodSaved(true);
    Alert.alert(
      '✅ Mood Tersimpan!', 
      `Terima kasih sudah berbagi perasaan kamu hari ini! ${getMoodIcon(selectedMood)}`
    );
  };

  const renderTabButton = (tab: 'progress' | 'mood' | 'achievements', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
      onPress={() => setSelectedTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={selectedTab === tab ? 'white' : '#666'} 
      />
      <Text style={[
        styles.tabText, 
        selectedTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProgressChart = () => {
    const maxPoints = Math.max(...progressData.map(d => d.totalPoints));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Perkembangan Poin (7 Hari Terakhir)</Text>
        <View style={styles.chart}>
          {progressData.map((data, index) => {
            const height = (data.totalPoints / maxPoints) * 150;
            const date = new Date(data.date);
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
            
            return (
              <View key={data.date} style={styles.chartBar}>
                <View style={[styles.bar, { height }]}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.barGradient}
                  />
                </View>
                <Text style={styles.barLabel}>{dayName}</Text>
                <Text style={styles.barValue}>{data.totalPoints}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderProgressStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>📊 Statistik Mingguan</Text>
      {weeklyData.map((week, index) => (
        <View key={week.week} style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statWeek}>{week.week}</Text>
            <View style={[
              styles.improvementBadge,
              { backgroundColor: week.improvement > 10 ? '#4CAF50' : '#FF9800' }
            ]}>
              <Ionicons 
                name={week.improvement > 0 ? 'trending-up' : 'trending-down'} 
                size={14} 
                color="white" 
              />
              <Text style={styles.improvementText}>+{week.improvement}%</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{week.totalActivities}</Text>
              <Text style={styles.statLabel}>Aktivitas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{week.averageScore}</Text>
              <Text style={styles.statLabel}>Rata-rata</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMoodTracker = () => (
    <View style={styles.moodContainer}>
      <Text style={styles.sectionTitle}>😊 Bagaimana perasaan kamu hari ini?</Text>
      
      {!todayMoodSaved ? (
        <View style={styles.moodSelector}>
          <Text style={styles.moodQuestion}>Pilih mood kamu:</Text>
          <View style={styles.moodOptions}>
            {[
              { key: 'very_happy', label: 'Sangat Senang', emoji: '😄' },
              { key: 'happy', label: 'Senang', emoji: '😊' },
              { key: 'neutral', label: 'Biasa saja', emoji: '😐' },
              { key: 'sad', label: 'Sedih', emoji: '😢' },
              { key: 'very_sad', label: 'Sangat Sedih', emoji: '😭' },
            ].map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodOption,
                  selectedMood === mood.key && styles.selectedMoodOption,
                ]}
                onPress={() => setSelectedMood(mood.key)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === mood.key && styles.selectedMoodLabel,
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.saveMoodButton} onPress={saveTodayMood}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.saveMoodGradient}
            >
              <Ionicons name="heart" size={20} color="white" />
              <Text style={styles.saveMoodText}>Simpan Mood</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.moodSaved}>
          <Text style={styles.moodSavedText}>
            Mood hari ini: {getMoodIcon(selectedMood)} 
          </Text>
          <Text style={styles.moodSavedSubtext}>
            Terima kasih sudah berbagi! 💕
          </Text>
        </View>
      )}

      {/* Mood History */}
      <View style={styles.moodHistory}>
        <Text style={styles.moodHistoryTitle}>📅 Riwayat Mood (7 Hari)</Text>
        <View style={styles.moodHistoryGrid}>
          {progressData.map((data, index) => {
            const date = new Date(data.date);
            const day = date.getDate();
            
            return (
              <View key={data.date} style={styles.moodHistoryItem}>
                <View 
                  style={[
                    styles.moodHistoryCircle,
                    { backgroundColor: getMoodColor(data.mood) }
                  ]}
                >
                  <Text style={styles.moodHistoryEmoji}>
                    {getMoodIcon(data.mood)}
                  </Text>
                </View>
                <Text style={styles.moodHistoryDate}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>🏆 Pencapaian</Text>
      {achievements.map((achievement) => (
        <View 
          key={achievement.id} 
          style={[
            styles.achievementCard,
            achievement.unlocked && styles.unlockedAchievement,
          ]}
        >
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIcon,
              achievement.unlocked && styles.unlockedIcon,
            ]}>
              <Ionicons 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.unlocked ? '#FFD700' : '#999'} 
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                achievement.unlocked && styles.unlockedTitle,
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
            {achievement.unlocked && (
              <View style={styles.unlockedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
            )}
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(achievement.progress / achievement.target) * 100}%`,
                    backgroundColor: achievement.unlocked ? '#4CAF50' : '#2196F3',
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.target}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>📈 Progress & Mood</Text>
          <Text style={styles.headerSubtitle}>
            Lihat perkembangan dan bagikan perasaan kamu!
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {renderTabButton('progress', 'Progress', 'trending-up')}
        {renderTabButton('mood', 'Mood', 'heart')}
        {renderTabButton('achievements', 'Prestasi', 'trophy')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'progress' && (
          <>
            {renderProgressChart()}
            {renderProgressStats()}
          </>
        )}
        
        {selectedTab === 'mood' && renderMoodTracker()}
        
        {selectedTab === 'achievements' && renderAchievements()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 140,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barGradient: {
    flex: 1,
    width: '100%',
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statWeek: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  moodContainer: {
    marginBottom: 20,
  },
  moodSelector: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
  },
  moodQuestion: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  moodOptions: {
    marginBottom: 25,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedMoodOption: {
    borderColor: '#667eea',
    backgroundColor: '#f3f4ff',
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  moodLabel: {
    fontSize: 16,
    color: '#666',
  },
  selectedMoodLabel: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  saveMoodButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  saveMoodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveMoodText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  moodSaved: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  moodSavedText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  moodSavedSubtext: {
    fontSize: 14,
    color: '#666',
  },
  moodHistory: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
  },
  moodHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  moodHistoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodHistoryItem: {
    alignItems: 'center',
  },
  moodHistoryCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodHistoryEmoji: {
    fontSize: 20,
  },
  moodHistoryDate: {
    fontSize: 12,
    color: '#666',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    opacity: 0.6,
  },
  unlockedAchievement: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  unlockedIcon: {
    backgroundColor: '#fff3cd',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#888',
  },
  unlockedBadge: {
    marginLeft: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default ProgressMoodScreen;
