import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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

const { width } = Dimensions.get('window');

interface SpeechExercise {
  id: string;
  word: string;
  category: 'vowels' | 'consonants' | 'words' | 'sentences';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  completed: boolean;
  audioExample?: string;
}

interface SpeechResult {
  accuracy: number;
  clarity: number;
  speed: number;
  overall: number;
}

interface SpeechTrainingScreenProps {
  onBack?: () => void;
}

const SpeechTrainingScreen: React.FC<SpeechTrainingScreenProps> = ({ onBack }) => {
  const [exercises, setExercises] = useState<SpeechExercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('vowels');
  const [currentExercise, setCurrentExercise] = useState<SpeechExercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadExercises();
    setupAudio();
    animateEntrance();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
      Alert.alert('Error', 'Tidak bisa mengakses mikrofon. Pastikan izin sudah diberikan.');
    }
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const loadExercises = () => {
    const mockExercises: SpeechExercise[] = [
      // Vowels
      {
        id: '1',
        word: 'A',
        category: 'vowels',
        difficulty: 'easy',
        points: 10,
        completed: false,
      },
      {
        id: '2',
        word: 'I',
        category: 'vowels',
        difficulty: 'easy',
        points: 10,
        completed: true,
      },
      {
        id: '3',
        word: 'U',
        category: 'vowels',
        difficulty: 'easy',
        points: 10,
        completed: false,
      },
      {
        id: '4',
        word: 'E',
        category: 'vowels',
        difficulty: 'easy',
        points: 10,
        completed: false,
      },
      {
        id: '5',
        word: 'O',
        category: 'vowels',
        difficulty: 'easy',
        points: 10,
        completed: true,
      },
      
      // Consonants
      {
        id: '6',
        word: 'MA',
        category: 'consonants',
        difficulty: 'easy',
        points: 15,
        completed: false,
      },
      {
        id: '7',
        word: 'PA',
        category: 'consonants',
        difficulty: 'easy',
        points: 15,
        completed: false,
      },
      {
        id: '8',
        word: 'BA',
        category: 'consonants',
        difficulty: 'easy',
        points: 15,
        completed: false,
      },
      
      // Words
      {
        id: '9',
        word: 'MAMA',
        category: 'words',
        difficulty: 'medium',
        points: 25,
        completed: false,
      },
      {
        id: '10',
        word: 'PAPA',
        category: 'words',
        difficulty: 'medium',
        points: 25,
        completed: false,
      },
      {
        id: '11',
        word: 'RUMAH',
        category: 'words',
        difficulty: 'medium',
        points: 30,
        completed: false,
      },
      
      // Sentences
      {
        id: '12',
        word: 'AKU SUKA MAIN',
        category: 'sentences',
        difficulty: 'hard',
        points: 50,
        completed: false,
      },
      {
        id: '13',
        word: 'NAMA SAYA ADI',
        category: 'sentences',
        difficulty: 'hard',
        points: 50,
        completed: false,
      },
    ];

    setExercises(mockExercises);
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'vowels':
        return 'text';
      case 'consonants':
        return 'chatbubble';
      case 'words':
        return 'library';
      case 'sentences':
        return 'document-text';
      default:
        return 'mic';
    }
  };

  const getCategoryTitle = (category: string): string => {
    switch (category) {
      case 'vowels':
        return 'Huruf Vokal';
      case 'consonants':
        return 'Konsonan';
      case 'words':
        return 'Kata';
      case 'sentences':
        return 'Kalimat';
      default:
        return 'Latihan';
    }
  };

  const getDifficultyColor = (difficulty: string): [string, string] => {
    switch (difficulty) {
      case 'easy':
        return ['#4CAF50', '#8BC34A'];
      case 'medium':
        return ['#FF9800', '#FFC107'];
      case 'hard':
        return ['#F44336', '#E91E63'];
      default:
        return ['#2196F3', '#03DAC6'];
    }
  };

  const startRecording = async () => {
    try {
      if (!currentExercise) return;

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Auto stop after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Gagal memulai rekaman. Coba lagi.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      stopPulseAnimation();
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording saved to', uri);

      // Simulate speech analysis
      analyzeSpeech();
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Gagal menghentikan rekaman.');
    }
  };

  const analyzeSpeech = () => {
    // Simulate AI analysis with random but realistic results
    const baseAccuracy = 70 + Math.random() * 25; // 70-95%
    const baseClarity = 60 + Math.random() * 35;  // 60-95%
    const baseSpeed = 70 + Math.random() * 25;    // 70-95%
    
    const result: SpeechResult = {
      accuracy: Math.round(baseAccuracy),
      clarity: Math.round(baseClarity),
      speed: Math.round(baseSpeed),
      overall: Math.round((baseAccuracy + baseClarity + baseSpeed) / 3),
    };

    setSpeechResult(result);
    setShowResult(true);

    // Animate result display
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Mark exercise as completed if score is good
    if (result.overall >= 70 && currentExercise) {
      setExercises(prev =>
        prev.map(ex =>
          ex.id === currentExercise.id ? { ...ex, completed: true } : ex
        )
      );
    }
  };

  const playExample = async () => {
    try {
      setIsPlaying(true);
      
      // Mock: Play a beep sound as example
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
        }
      });

    } catch (error) {
      console.error('Failed to play example:', error);
      setIsPlaying(false);
      
      // Fallback: Show text example
      Alert.alert(
        '🔊 Contoh Pengucapan',
        `Dengarkan dan tirukan: "${currentExercise?.word}"`
      );
    }
  };

  const selectExercise = (exercise: SpeechExercise) => {
    setCurrentExercise(exercise);
    setShowResult(false);
    setSpeechResult(null);
    setRecordingDuration(0);
    progressAnimation.setValue(0);
  };

  const nextExercise = () => {
    if (!currentExercise) return;
    
    const currentIndex = exercises.findIndex(ex => ex.id === currentExercise.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < exercises.length) {
      selectExercise(exercises[nextIndex]);
    } else {
      Alert.alert(
        '🎉 Selamat!',
        'Kamu sudah menyelesaikan semua latihan hari ini!\n\nKembali besok untuk latihan baru.',
        [
          {
            text: 'OK',
            onPress: () => setCurrentExercise(null),
          },
        ]
      );
    }
  };

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabs}>
      {['vowels', 'consonants', 'words', 'sentences'].map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryTab,
            selectedCategory === category && styles.activeCategoryTab,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Ionicons
            name={getCategoryIcon(category) as any}
            size={20}
            color={selectedCategory === category ? 'white' : '#666'}
          />
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === category && styles.activeCategoryTabText,
            ]}
          >
            {getCategoryTitle(category)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderExerciseList = () => {
    const filteredExercises = exercises.filter(ex => ex.category === selectedCategory);
    
    return (
      <View style={styles.exerciseList}>
        {filteredExercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              exercise.completed && styles.completedExercise,
              currentExercise?.id === exercise.id && styles.selectedExercise,
            ]}
            onPress={() => selectExercise(exercise)}
          >
            <LinearGradient
              colors={getDifficultyColor(exercise.difficulty)}
              style={styles.exerciseGradient}
            >
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseWord}>{exercise.word}</Text>
                {exercise.completed && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
              </View>
              <Text style={styles.exercisePoints}>+{exercise.points} poin</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTrainingInterface = () => {
    if (!currentExercise) {
      return (
        <View style={styles.noExerciseContainer}>
          <Ionicons name="mic-outline" size={80} color="#ccc" />
          <Text style={styles.noExerciseText}>
            Pilih latihan untuk memulai
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.trainingInterface}>
        <Text style={styles.trainingTitle}>Latihan Bicara</Text>
        <Text style={styles.currentWord}>{currentExercise.word}</Text>
        
        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.exampleButton}
            onPress={playExample}
            disabled={isPlaying}
          >
            <LinearGradient
              colors={['#2196F3', '#03DAC6']}
              style={styles.buttonGradient}
            >
              <Ionicons
                name={isPlaying ? 'stop' : 'volume-high'}
                size={24}
                color="white"
              />
              <Text style={styles.buttonText}>
                {isPlaying ? 'Stop' : 'Dengar'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.recordButton,
              { transform: [{ scale: pulseAnimation }] },
            ]}
          >
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isPlaying}
            >
              <LinearGradient
                colors={isRecording ? ['#F44336', '#E91E63'] : ['#FF9800', '#F57C00']}
                style={styles.recordButtonGradient}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={32}
                  color="white"
                />
                <Text style={styles.recordButtonText}>
                  {isRecording ? `${recordingDuration}s` : 'Bicara'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Speech Result */}
        {showResult && speechResult && (
          <Animated.View
            style={[
              styles.resultContainer,
              { opacity: fadeAnimation },
            ]}
          >
            <Text style={styles.resultTitle}>📊 Hasil Analisis</Text>
            
            <View style={styles.scoreGrid}>
              {[
                { label: 'Akurasi', value: speechResult.accuracy, color: '#4CAF50' },
                { label: 'Kejelasan', value: speechResult.clarity, color: '#2196F3' },
                { label: 'Kecepatan', value: speechResult.speed, color: '#FF9800' },
                { label: 'Overall', value: speechResult.overall, color: '#9C27B0' },
              ].map((score, index) => (
                <View key={score.label} style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>{score.label}</Text>
                  <View style={styles.scoreBar}>
                    <Animated.View
                      style={[
                        styles.scoreProgress,
                        {
                          backgroundColor: score.color,
                          width: progressAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', `${score.value}%`],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreValue}>{score.value}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={() => setShowResult(false)}
              >
                <Text style={styles.tryAgainText}>Coba Lagi</Text>
              </TouchableOpacity>
              
              {speechResult.overall >= 70 && (
                <TouchableOpacity style={styles.nextButton} onPress={nextExercise}>
                  <LinearGradient
                    colors={['#4CAF50', '#8BC34A']}
                    style={styles.nextButtonGradient}
                  >
                    <Text style={styles.nextButtonText}>Lanjut</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnimation },
          ]}
        >
          <View style={styles.headerTop}>
            {onBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>🎤 Latihan Bicara</Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.headerSubtitle}>
            Berlatih bicara bersama Imron & Siti!
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategoryTabs()}
        {renderExerciseList()}
        {renderTrainingInterface()}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  placeholder: {
    width: 40, // Same width as back button to center the title
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    elevation: 2,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  activeCategoryTab: {
    backgroundColor: '#667eea',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: 'white',
  },
  exerciseList: {
    marginBottom: 30,
  },
  exerciseCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  completedExercise: {
    opacity: 0.8,
  },
  selectedExercise: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  exerciseGradient: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseWord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  exercisePoints: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  noExerciseContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noExerciseText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  trainingInterface: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  trainingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  currentWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 30,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  exampleButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recordButton: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreGrid: {
    marginBottom: 20,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    width: 40,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tryAgainButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    alignItems: 'center',
  },
  tryAgainText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 10,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default SpeechTrainingScreen;
