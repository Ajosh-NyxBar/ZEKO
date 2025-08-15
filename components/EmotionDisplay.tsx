/**
 * Emotion Detection Display Component for ZEKO
 * ============================================
 * 
 * Visual emotion detection interface with real-time feedback.
 * Displays emotion analysis results with animated character responses.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface EmotionDisplayProps {
  emotion: string;
  confidence: number;
  isDetecting: boolean;
  characterImage?: any;
}

const EMOTION_COLORS = {
  happy: ['#FFE082', '#FFC107'],
  excited: ['#81C784', '#4CAF50'],
  sad: ['#90A4AE', '#607D8B'],
  angry: ['#E57373', '#F44336'],
  frustrated: ['#FFB74D', '#FF9800'],
  neutral: ['#B0BEC5', '#78909C'],
  surprised: ['#CE93D8', '#9C27B0'],
  focused: ['#64B5F6', '#2196F3'],
};

const EMOTION_EMOJIS = {
  happy: '😊',
  excited: '🤩',
  sad: '😢',
  angry: '😠',
  frustrated: '😤',
  neutral: '😐',
  surprised: '😲',
  focused: '🤔',
};

const EMOTION_MESSAGES = {
  happy: 'Kamu terlihat senang!',
  excited: 'Wah, semangat sekali!',
  sad: 'Ayo tetap semangat!',
  angry: 'Tenang dulu ya',
  frustrated: 'Tarik napas dalam',
  neutral: 'Siap untuk belajar',
  surprised: 'Ada yang mengejutkan?',
  focused: 'Fokus yang bagus!',
};

export const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotion,
  confidence,
  isDetecting,
  characterImage,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDetecting) {
      // Start pulse animation when detecting
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isDetecting]);

  useEffect(() => {
    if (emotion && !isDetecting) {
      // Show emotion result animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset after showing
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start();
        }, 2000);
      });
    }
  }, [emotion, isDetecting]);

  const emotionColors = EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || EMOTION_COLORS.neutral;
  const emotionEmoji = EMOTION_EMOJIS[emotion as keyof typeof EMOTION_EMOJIS] || '😐';
  const emotionMessage = EMOTION_MESSAGES[emotion as keyof typeof EMOTION_MESSAGES] || 'Mendeteksi emosi...';

  return (
    <View style={styles.container}>
      {/* Character with Emotion Overlay */}
      <View style={styles.characterContainer}>
        <Animated.View
          style={[
            styles.characterWrapper,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {characterImage && (
            <Image
              source={characterImage}
              style={styles.characterImage}
              resizeMode="contain"
            />
          )}
          
          {/* Emotion Indicator Overlay */}
          <Animated.View
            style={[
              styles.emotionOverlay,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={emotionColors as [string, string]}
              style={styles.emotionGradient}
            >
              <Text style={styles.emotionEmoji}>{emotionEmoji}</Text>
              <Text style={styles.emotionText}>{emotion}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${confidence * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}% yakin
              </Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Emotion Message */}
      {!isDetecting && emotion && (
        <Animated.View
          style={[
            styles.messageContainer,
            { opacity: opacityAnim },
          ]}
        >
          <Text style={styles.messageText}>{emotionMessage}</Text>
        </Animated.View>
      )}

      {/* Detection Status */}
      {isDetecting && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Mendeteksi ekspresi wajah...</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      )}
    </View>
  );
};

export const EmotionHistory: React.FC<{ emotions: string[] }> = ({ emotions }) => {
  const recentEmotions = emotions.slice(-5); // Show last 5 emotions

  return (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Riwayat Emosi</Text>
      <View style={styles.emotionsList}>
        {recentEmotions.map((emotion, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyEmoji}>
              {EMOTION_EMOJIS[emotion as keyof typeof EMOTION_EMOJIS] || '😐'}
            </Text>
            <Text style={styles.historyLabel}>{emotion}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterContainer: {
    position: 'relative',
    marginVertical: 20,
  },
  characterWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  characterImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
  },
  emotionOverlay: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -60,
    width: 120,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emotionGradient: {
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  confidenceBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginVertical: 5,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976D2',
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  historyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    width: '100%',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
    textAlign: 'center',
  },
  emotionsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  historyItem: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
  },
  historyEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  historyLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
});

export default EmotionDisplay;
