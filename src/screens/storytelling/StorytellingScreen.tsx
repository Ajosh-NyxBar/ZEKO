import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  title: string;
  description: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  estimatedTime: string;
  points: number;
  completed: boolean;
  coverImage: any;
  content: StoryPage[];
  character: 'Imron' | 'Siti';
}

interface StoryPage {
  id: string;
  text: string;
  image?: any;
  audioPrompt?: string;
  speakingChallenge?: boolean;
  emotionTarget?: string;
}

const StorytellingScreen: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const recording = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    loadStories();
    animateEntrance();
  }, []);

  const loadStories = () => {
    // Mock stories data - replace with actual API call
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'Petualangan Imron di Hutan Ajaib',
        description: 'Ikuti Imron dalam petualangan seru di hutan penuh keajaiban!',
        difficulty: 'Mudah',
        estimatedTime: '10 menit',
        points: 100,
        completed: true,
        coverImage: require('../../../assets/images/Imron.png'),
        character: 'Imron',
        content: [
          {
            id: '1-1',
            text: 'Pada suatu hari yang cerah, Imron berjalan-jalan di hutan.',
            speakingChallenge: true,
            emotionTarget: 'gembira',
          },
          {
            id: '1-2',
            text: 'Tiba-tiba, dia mendengar suara aneh dari balik pohon besar.',
            speakingChallenge: true,
            emotionTarget: 'penasaran',
          },
          {
            id: '1-3',
            text: 'Imron memberanikan diri untuk melihat apa yang terjadi.',
            speakingChallenge: true,
            emotionTarget: 'berani',
          },
        ],
      },
      {
        id: '2',
        title: 'Siti dan Teman-teman Baru',
        description: 'Siti bertemu teman-teman baru di sekolah dan belajar tentang persahabatan.',
        difficulty: 'Sedang',
        estimatedTime: '15 menit',
        points: 150,
        completed: false,
        coverImage: require('../../../assets/images/siti.png'),
        character: 'Siti',
        content: [
          {
            id: '2-1',
            text: 'Hari pertama Siti di sekolah baru. Dia merasa gugup tapi excited.',
            speakingChallenge: true,
            emotionTarget: 'gugup dan excited',
          },
          {
            id: '2-2',
            text: 'Di kelas, Siti bertemu dengan Ana dan Budi yang sangat ramah.',
            speakingChallenge: true,
            emotionTarget: 'senang',
          },
        ],
      },
      {
        id: '3',
        title: 'Mencari Harta Karun Bersama',
        description: 'Imron dan Siti bekerja sama mencari harta karun yang tersembunyi.',
        difficulty: 'Sulit',
        estimatedTime: '20 menit',
        points: 200,
        completed: false,
        coverImage: require('../../../assets/images/atas.png'),
        character: 'Imron',
        content: [
          {
            id: '3-1',
            text: 'Imron dan Siti menemukan peta harta karun tua di loteng.',
            speakingChallenge: true,
            emotionTarget: 'excited',
          },
        ],
      },
    ];
    
    setStories(mockStories);
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getDifficultyColor = (difficulty: string): [string, string] => {
    switch (difficulty) {
      case 'Mudah':
        return ['#4CAF50', '#8BC34A'];
      case 'Sedang':
        return ['#FF9800', '#FFC107'];
      case 'Sulit':
        return ['#F44336', '#E91E63'];
      default:
        return ['#2196F3', '#03DAC6'];
    }
  };

  const getCharacterImage = (character: string) => {
    switch (character) {
      case 'Imron':
        return require('../../../assets/images/Imron.png');
      case 'Siti':
        return require('../../../assets/images/siti.png');
      default:
        return require('../../../assets/images/Imron.png');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan izin mikrofon untuk merekam suara');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Gagal memulai perekaman');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    setIsRecording(false);
    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      
      // Process the recording with AI
      await processRecording(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const processRecording = async (uri: string | null) => {
    if (!uri || !selectedStory) return;

    try {
      // Mock AI processing - replace with actual API call
      setTimeout(() => {
        Alert.alert(
          'Bagus Sekali!',
          'Kamu sudah membaca dengan emosi yang tepat! +10 poin',
          [
            {
              text: 'Lanjut',
              onPress: () => {
                if (currentPage < selectedStory.content.length - 1) {
                  setCurrentPage(currentPage + 1);
                } else {
                  completeStory();
                }
              },
            },
          ]
        );
      }, 1000);
    } catch (error) {
      console.error('Error processing recording:', error);
    }
  };

  const completeStory = () => {
    if (!selectedStory) return;

    Alert.alert(
      'Selamat! 🎉',
      `Kamu telah menyelesaikan cerita "${selectedStory.title}"! \n\n+${selectedStory.points} poin`,
      [
        {
          text: 'Kembali ke Daftar Cerita',
          onPress: () => {
            setShowStoryModal(false);
            setSelectedStory(null);
            setCurrentPage(0);
            // Update story completion status
            setStories(prev => 
              prev.map(story => 
                story.id === selectedStory.id 
                  ? { ...story, completed: true }
                  : story
              )
            );
          },
        },
      ]
    );
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setShowStoryModal(true);
  };

  const renderStoryCard = (story: Story) => (
    <TouchableOpacity
      key={story.id}
      style={[styles.storyCard, story.completed && styles.completedCard]}
      onPress={() => openStory(story)}
    >
      <LinearGradient
        colors={getDifficultyColor(story.difficulty)}
        style={styles.storyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.storyHeader}>
          <Image source={story.coverImage} style={styles.storyImage} />
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyDescription}>{story.description}</Text>
            <View style={styles.storyMeta}>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{story.difficulty}</Text>
              </View>
              <Text style={styles.timeText}>{story.estimatedTime}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.storyFooter}>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.pointsText}>{story.points} poin</Text>
          </View>
          {story.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Selesai</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderStoryModal = () => {
    if (!selectedStory) return null;

    const currentStoryPage = selectedStory.content[currentPage];

    return (
      <Modal
        visible={showStoryModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowStoryModal(false);
                setSelectedStory(null);
                setCurrentPage(0);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedStory.title}</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {currentPage + 1}/{selectedStory.content.length}
              </Text>
            </View>
          </View>

          <View style={styles.storyContent}>
            <View style={styles.characterContainer}>
              <Image 
                source={getCharacterImage(selectedStory.character)} 
                style={styles.characterImage} 
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.storyText}>{currentStoryPage.text}</Text>
              
              {currentStoryPage.speakingChallenge && (
                <View style={styles.challengeContainer}>
                  <Text style={styles.challengeTitle}>
                    🎯 Tantangan Bicara
                  </Text>
                  <Text style={styles.challengeText}>
                    Bacakan kalimat ini dengan emosi: <Text style={styles.emotionText}>
                      {currentStoryPage.emotionTarget}
                    </Text>
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.recordButton, isRecording && styles.recordingButton]}
                    onPress={isRecording ? stopRecording : startRecording}
                  >
                    <Ionicons 
                      name={isRecording ? "stop" : "mic"} 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.recordButtonText}>
                      {isRecording ? 'Berhenti Merekam' : 'Mulai Merekam'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.navigationContainer}>
            {currentPage > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentPage(currentPage - 1)}
              >
                <Ionicons name="arrow-back" size={20} color="#667eea" />
                <Text style={styles.navButtonText}>Sebelumnya</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.spacer} />
            
            {currentPage < selectedStory.content.length - 1 ? (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setCurrentPage(currentPage + 1)}
              >
                <Text style={styles.navButtonText}>Selanjutnya</Text>
                <Ionicons name="arrow-forward" size={20} color="#667eea" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.finishButton]}
                onPress={completeStory}
              >
                <Text style={styles.finishButtonText}>Selesai</Text>
                <Ionicons name="checkmark" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Modal>
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
            {
              opacity: fadeAnimation,
              transform: [{
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>📖 Cerita Interaktif</Text>
          <Text style={styles.headerSubtitle}>
            Latih kemampuan bicara sambil menikmati cerita seru!
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Pilih Ceritamu</Text>
        {stories.map(renderStoryCard)}
      </ScrollView>

      {renderStoryModal()}
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
  storyCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  storyGradient: {
    padding: 20,
  },
  storyHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  storyDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storyContent: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  characterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textContainer: {
    flex: 1,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  challengeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emotionText: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  recordButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  navButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  spacer: {
    flex: 1,
  },
});

export default StorytellingScreen;
