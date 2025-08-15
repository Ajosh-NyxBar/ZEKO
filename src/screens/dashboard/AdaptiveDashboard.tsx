/**
 * Adaptive Learning Dashboard for ZEKO
 * ====================================
 * 
 * Personalized learning analytics and recommendations interface.
 * Displays user progress, adaptive content, and learning insights.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdaptiveLearning } from '../../../hooks/useAI';

const { width } = Dimensions.get('window');

interface AdaptiveDashboardProps {
  userId: string;
  navigation: any;
}

interface ProgressMetrics {
  totalSessions: number;
  averageScore: number;
  wordsLearned: number;
  streakDays: number;
  timeSpent: number;
  improvementRate: number;
}

interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation';
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function AdaptiveDashboard({ userId, navigation }: AdaptiveDashboardProps) {
  const {
    profileState,
    recommendationState,
    createProfile,
    getRecommendations,
  } = useAdaptiveLearning();

  const [isLoading, setIsLoading] = useState(true);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics>({
    totalSessions: 0,
    averageScore: 0,
    wordsLearned: 0,
    streakDays: 0,
    timeSpent: 0,
    improvementRate: 0,
  });

  const [insights, setInsights] = useState<LearningInsight[]>([]);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      // Load user profile if not exists
      if (!profileState.data) {
        await createProfile(userId, 6, 'visual', 'afternoon');
      }

      // Get latest recommendations
      await loadRecommendations();
      
      // Load progress metrics (mock data for now)
      loadProgressMetrics();
      
      // Generate insights
      generateInsights();
      
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      await getRecommendations(userId, {
        words: ['mama', 'papa', 'kucing'],
        scores: [85, 78, 92],
        duration: 300,
        engagement: 0.8,
      });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadProgressMetrics = () => {
    // Mock data - in real app, this would come from backend
    setProgressMetrics({
      totalSessions: 15,
      averageScore: 78,
      wordsLearned: 45,
      streakDays: 5,
      timeSpent: 120, // minutes
      improvementRate: 12, // percentage
    });
  };

  const generateInsights = () => {
    const mockInsights: LearningInsight[] = [
      {
        type: 'strength',
        title: 'Pronunciation Excellent',
        description: 'Skor pronounciation kamu meningkat 25% minggu ini!',
        icon: 'trophy',
        color: '#4CAF50',
      },
      {
        type: 'weakness',
        title: 'Focus on Vowels',
        description: 'Latih lebih banyak kata dengan huruf vokal "a" dan "i"',
        icon: 'flag',
        color: '#FF9800',
      },
      {
        type: 'recommendation',
        title: 'Try Longer Words',
        description: 'Kamu sudah siap untuk kata-kata yang lebih panjang!',
        icon: 'rocket',
        color: '#2196F3',
      },
    ];
    setInsights(mockInsights);
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderInsightCard = (insight: LearningInsight) => (
    <TouchableOpacity
      key={insight.title}
      style={[styles.insightCard, { borderLeftColor: insight.color }]}
      onPress={() => {
        Alert.alert(insight.title, insight.description);
      }}
    >
      <View style={styles.insightHeader}>
        <Ionicons name={insight.icon as any} size={20} color={insight.color} />
        <Text style={[styles.insightTitle, { color: insight.color }]}>
          {insight.title}
        </Text>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
    </TouchableOpacity>
  );

  const renderRecommendations = () => {
    if (!recommendationState.data) return null;

    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>Rekomendasi Kata Berikutnya</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendationState.data.next_words.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordCard}
              onPress={() => {
                navigation.navigate('SpeechTraining', {
                  userId,
                  difficulty: 'beginner',
                  targetWords: [word],
                  userAge: profileState.data?.age || 6,
                  learningStyle: profileState.data?.learning_style || 'visual',
                });
              }}
            >
              <Text style={styles.wordText}>{word}</Text>
              <Text style={styles.wordDifficulty}>
                Level: Beginner
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E8F5E8', '#F3E5F5']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Memuat dashboard pembelajaran...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E8', '#F3E5F5']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Halo!</Text>
              <Text style={styles.userText}>
                {profileState.data?.user_id || userId}
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* Progress Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress Pembelajaran</Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard('Total Sesi', progressMetrics.totalSessions, 'calendar', '#4CAF50')}
              {renderMetricCard('Skor Rata-rata', `${progressMetrics.averageScore}%`, 'star', '#FF9800')}
              {renderMetricCard('Kata Dipelajari', progressMetrics.wordsLearned, 'book', '#2196F3')}
              {renderMetricCard('Streak Hari', progressMetrics.streakDays, 'flame', '#FF5722')}
            </View>
          </View>

          {/* Adaptive Recommendations */}
          {renderRecommendations()}

          {/* Learning Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insight Pembelajaran</Text>
            {insights.map(renderInsightCard)}
          </View>

          {/* Profile Information */}
          {profileState.data && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profil Belajar</Text>
              <View style={styles.profileCard}>
                <View style={styles.profileRow}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.profileLabel}>Umur:</Text>
                  <Text style={styles.profileValue}>{profileState.data.age} tahun</Text>
                </View>
                <View style={styles.profileRow}>
                  <Ionicons name="eye" size={16} color="#666" />
                  <Text style={styles.profileLabel}>Gaya Belajar:</Text>
                  <Text style={styles.profileValue}>{profileState.data.learning_style}</Text>
                </View>
                <View style={styles.profileRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.profileLabel}>Waktu Belajar:</Text>
                  <Text style={styles.profileValue}>Afternoon</Text>
                </View>
                <View style={styles.profileRow}>
                  <Ionicons name="trending-up" size={16} color="#666" />
                  <Text style={styles.profileLabel}>Level:</Text>
                  <Text style={styles.profileValue}>{profileState.data.current_level}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => {
                navigation.navigate('SpeechTraining', {
                  userId,
                  difficulty: 'beginner',
                  targetWords: recommendationState.data?.next_words || ['mama', 'papa'],
                  userAge: profileState.data?.age || 6,
                  learningStyle: profileState.data?.learning_style || 'visual',
                });
              }}
            >
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Mulai Latihan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {
                initializeDashboard();
              }}
            >
              <Ionicons name="refresh" size={20} color="#4CAF50" />
              <Text style={styles.secondaryButtonText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  userText: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  profileButton: {
    padding: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    width: (width - 50) / 2,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginBottom: 25,
  },
  wordCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  wordDifficulty: {
    fontSize: 12,
    color: '#666',
  },
  insightCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.48,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
