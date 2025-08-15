/**
 * Speech Training Screen for ZEKO
 * ===============================
 * 
 * Interactive speech therapy training interface with real-time AI analysis.
 * Features emotion detection, pronunciation scoring, and adaptive learning.
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SpeechTrainingProps {
  onBack: () => void;
}

interface TrainingWord {
  id: string;
  word: string;
  phonetic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

const trainingWords: TrainingWord[] = [
  { id: '1', word: 'Mama', phonetic: '/ma-ma/', difficulty: 'easy', category: 'keluarga' },
  { id: '2', word: 'Papa', phonetic: '/pa-pa/', difficulty: 'easy', category: 'keluarga' },
  { id: '3', word: 'Kucing', phonetic: '/ku-cing/', difficulty: 'medium', category: 'hewan' },
  { id: '4', word: 'Sekolah', phonetic: '/se-ko-lah/', difficulty: 'medium', category: 'tempat' },
  { id: '5', word: 'Permainan', phonetic: '/per-mai-nan/', difficulty: 'hard', category: 'benda' },
];

export const SpeechTrainingScreen = ({ onBack }: SpeechTrainingProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [animationValue] = useState(new Animated.Value(1));

  const currentWord = trainingWords[currentWordIndex];

  useEffect(() => {
    // Animation for character breathing effect
    const breathingAnimation = () => {
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => breathingAnimation());
    };

    breathingAnimation();
  }, []);

  const handlePlayWord = async () => {
    setIsPlaying(true);
    // TODO: Implement Text-to-Speech
    Alert.alert('Playing Word', `Mengucapkan: ${currentWord.word}`);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    setAttempts(attempts + 1);
    
    // TODO: Implement Speech-to-Text
    Alert.alert('Recording', 'Mikrofon aktif, silakan ucapkan kata yang ditampilkan');
    
    setTimeout(() => {
      setIsRecording(false);
      handleRecordingComplete();
    }, 3000);
  };

  const handleRecordingComplete = () => {
    // TODO: Process speech recognition result
    const accuracy = Math.random() * 100; // Simulated accuracy
    
    if (accuracy > 80) {
      setScore(score + 10);
      Alert.alert('Bagus!', `Kamu berhasil! Akurasi: ${accuracy.toFixed(0)}%`, [
        { text: 'Lanjut', onPress: handleNextWord }
      ]);
    } else if (accuracy > 60) {
      setScore(score + 5);
      Alert.alert('Hampir Benar!', `Coba lagi ya! Akurasi: ${accuracy.toFixed(0)}%`);
    } else {
      Alert.alert('Coba Lagi!', 'Dengarkan dulu, lalu ucapkan dengan jelas ya!');
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < trainingWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setAttempts(0);
    } else {
      Alert.alert('Selesai!', `Latihan selesai! Skor akhir: ${score}`, [
        { text: 'Kembali ke Menu', onPress: onBack }
      ]);
    }
  };

  const handleSkipWord = () => {
    Alert.alert('Skip Word', 'Yakin ingin melewati kata ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Skip', onPress: handleNextWord }
    ]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sedang';
      case 'hard': return 'Sulit';
      default: return 'Normal';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Latihan Bicara</Text>
          
          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Kata {currentWordIndex + 1} dari {trainingWords.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentWordIndex + 1) / trainingWords.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Character Section */}
        <View style={styles.characterSection}>
          <Animated.View style={[styles.characterContainer, { transform: [{ scale: animationValue }] }]}>
            <Image 
              source={require('@/assets/images/Imron.png')} 
              style={styles.characterImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          <View style={styles.speechBubble}>
            <Text style={styles.instructionText}>
              {isRecording ? 'Ucapkan kata ini!' : 'Dengarkan dan tirukan!'}
            </Text>
          </View>
        </View>

        {/* Word Display */}
        <View style={styles.wordContainer}>
          <View style={styles.wordCard}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentWord.difficulty) }]}>
              <Text style={styles.difficultyText}>{getDifficultyText(currentWord.difficulty)}</Text>
            </View>
            
            <Text style={styles.wordText}>{currentWord.word}</Text>
            <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
            <Text style={styles.categoryText}>Kategori: {currentWord.category}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayWord}
            disabled={isPlaying || isRecording}
          >
            <Ionicons 
              name={isPlaying ? "volume-high" : "play"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {isPlaying ? 'Memutar...' : 'Dengar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.recordButton, isRecording && styles.recordingButton]}
            onPress={handleStartRecording}
            disabled={isRecording}
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {isRecording ? 'Merekam...' : 'Bicara'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={handleSkipWord} style={styles.skipButton}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
          
          <Text style={styles.attemptsText}>Percobaan: {attempts}</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  characterSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  characterContainer: {
    marginBottom: 15,
  },
  characterImage: {
    width: 120,
    height: 150,
  },
  speechBubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    maxWidth: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  wordContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  phoneticText: {
    fontSize: 18,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 14,
    color: '#999',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  recordButton: {
    backgroundColor: '#F44336',
  },
  recordingButton: {
    backgroundColor: '#FF1744',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  attemptsText: {
    color: '#666',
    fontSize: 14,
  },
});
