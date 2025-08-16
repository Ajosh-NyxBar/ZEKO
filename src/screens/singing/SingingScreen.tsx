import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Song {
  id: string;
  title: string;
  lyrics: string[];
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  character: 'Imron' | 'Siti';
  melody: string;
  points: number;
  completed: boolean;
  duration: string;
}

interface SingingScreenProps {
  onBack?: () => void;
}

const SingingScreen: React.FC<SingingScreenProps> = ({ onBack }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [showLyrics, setShowLyrics] = useState(true);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const bounceAnimation = useRef(new Animated.Value(1)).current;
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadSongs();
    animateEntrance();
  }, []);

  const loadSongs = () => {
    const mockSongs: Song[] = [
      {
        id: '1',
        title: 'Bintang Kecil',
        lyrics: [
          'Bintang kecil di langit yang biru',
          'Amat banyak menghias angkasa',
          'Aku ingin terbang dan menari',
          'Jauh tinggi ke tempat kau berada'
        ],
        difficulty: 'Mudah',
        character: 'Siti',
        melody: 'C-C-G-G-A-A-G',
        points: 50,
        completed: false,
        duration: '1:30',
      },
      {
        id: '2',
        title: 'Pelangi-Pelangi',
        lyrics: [
          'Pelangi-pelangi alangkah indahmu',
          'Merah kuning hijau di langit yang biru',
          'Pelukismu agung siapa gerangan',
          'Pelangi-pelangi ciptaan Tuhan'
        ],
        difficulty: 'Mudah',
        character: 'Imron',
        melody: 'G-A-G-F-E-D-C',
        points: 50,
        completed: true,
        duration: '2:00',
      },
      {
        id: '3',
        title: 'Naik Delman',
        lyrics: [
          'Naik delman istimewa',
          'Kududuk di muka',
          'Saya naik delman istimewa',
          'Kududuk di muka bersama pak kusir'
        ],
        difficulty: 'Sedang',
        character: 'Imron',
        melody: 'C-D-E-F-G-A-B-C',
        points: 75,
        completed: false,
        duration: '1:45',
      },
      {
        id: '4',
        title: 'Burung Kakak Tua',
        lyrics: [
          'Burung kakak tua hinggap di jendela',
          'Nenek sudah tua giginya tinggal dua',
          'Asyik bernyanyi la la la la la',
          'Asyik bernyanyi la la la la la'
        ],
        difficulty: 'Sedang',
        character: 'Siti',
        melody: 'E-F-G-E-C-D-E',
        points: 75,
        completed: false,
        duration: '2:15',
      },
      {
        id: '5',
        title: 'Indonesia Raya',
        lyrics: [
          'Indonesia tanah airku',
          'Tanah tumpah darahku',
          'Di sanalah aku berdiri',
          'Jadi pandu ibuku'
        ],
        difficulty: 'Sulit',
        character: 'Imron',
        melody: 'C-E-G-C-A-F-D-G',
        points: 100,
        completed: false,
        duration: '3:00',
      },
    ];
    
    setSongs(mockSongs);
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const animateBounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 1,
        duration: 200,
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

  const startSinging = (song: Song) => {
    setSelectedSong(song);
    setCurrentLyricIndex(0);
    setUserScore(0);
    setShowLyrics(true);
    animateBounce();
  };

  const playMelody = async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      // Mock melody playback - replace with actual audio file
      setIsPlaying(true);
      
      // Simulate melody duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
      
      Alert.alert('🎵 Melody', 'Dengarkan melodinya dan ikuti nadanya!');
    } catch (error) {
      console.error('Error playing melody:', error);
      Alert.alert('Error', 'Tidak dapat memutar melodi');
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
      animateBounce();
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
      
      // Process the recording with AI (mock)
      await processSinging(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const processSinging = async (uri: string | null) => {
    if (!uri || !selectedSong) return;

    try {
      // Mock AI singing analysis
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
      setUserScore(mockScore);
      
      setTimeout(() => {
        if (mockScore >= 80) {
          Alert.alert(
            '🎉 Luar Biasa!',
            `Kamu menyanyi dengan sangat bagus! Score: ${mockScore}/100\n\n+${selectedSong.points} poin`,
            [
              {
                text: 'Lanjut Baris Berikutnya',
                onPress: () => {
                  if (currentLyricIndex < selectedSong.lyrics.length - 1) {
                    setCurrentLyricIndex(currentLyricIndex + 1);
                  } else {
                    completeSong();
                  }
                },
              },
            ]
          );
        } else if (mockScore >= 60) {
          Alert.alert(
            '👏 Bagus!',
            `Coba lagi untuk hasil yang lebih baik! Score: ${mockScore}/100`,
            [
              {
                text: 'Coba Lagi',
                onPress: () => {
                  // Stay on same lyric
                },
              },
              {
                text: 'Lanjut',
                onPress: () => {
                  if (currentLyricIndex < selectedSong.lyrics.length - 1) {
                    setCurrentLyricIndex(currentLyricIndex + 1);
                  } else {
                    completeSong();
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert(
            '💪 Coba Lagi!',
            `Ayo berlatih lagi! Score: ${mockScore}/100\n\nTip: Dengarkan melodinya terlebih dahulu`,
            [
              {
                text: 'Dengar Melodi',
                onPress: playMelody,
              },
              {
                text: 'Coba Lagi',
                onPress: () => {
                  // Stay on same lyric
                },
              },
            ]
          );
        }
      }, 1500);
    } catch (error) {
      console.error('Error processing singing:', error);
    }
  };

  const completeSong = () => {
    if (!selectedSong) return;

    Alert.alert(
      '🎵 Lagu Selesai! 🎵',
      `Selamat! Kamu telah menyelesaikan "${selectedSong.title}"!\n\nScore rata-rata: ${userScore}/100\n+${selectedSong.points} poin`,
      [
        {
          text: 'Kembali ke Daftar',
          onPress: () => {
            setSelectedSong(null);
            setCurrentLyricIndex(0);
            // Update song completion status
            setSongs(prev => 
              prev.map(song => 
                song.id === selectedSong.id 
                  ? { ...song, completed: true }
                  : song
              )
            );
          },
        },
        {
          text: 'Nyanyikan Lagi',
          onPress: () => {
            setCurrentLyricIndex(0);
            setUserScore(0);
          },
        },
      ]
    );
  };

  const renderSongCard = (song: Song) => (
    <TouchableOpacity
      key={song.id}
      style={[styles.songCard, song.completed && styles.completedCard]}
      onPress={() => startSinging(song)}
    >
      <LinearGradient
        colors={getDifficultyColor(song.difficulty)}
        style={styles.songGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.songHeader}>
          <Image source={getCharacterImage(song.character)} style={styles.characterImage} />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{song.title}</Text>
            <Text style={styles.songDuration}>Durasi: {song.duration}</Text>
            <View style={styles.songMeta}>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{song.difficulty}</Text>
              </View>
              <Text style={styles.melodyText}>♪ {song.melody}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.songFooter}>
          <View style={styles.pointsContainer}>
            <Ionicons name="musical-notes" size={16} color="#FFD700" />
            <Text style={styles.pointsText}>{song.points} poin</Text>
          </View>
          {song.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Selesai</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSingingInterface = () => {
    if (!selectedSong) return null;

    const currentLyric = selectedSong.lyrics[currentLyricIndex];

    return (
      <View style={styles.singingContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.singingHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedSong(null)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.singingTitle}>{selectedSong.title}</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {currentLyricIndex + 1}/{selectedSong.lyrics.length}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.characterSection}>
          <Animated.Image 
            source={getCharacterImage(selectedSong.character)} 
            style={[
              styles.singingCharacter,
              {
                transform: [{ scale: bounceAnimation }],
              },
            ]} 
          />
          {userScore > 0 && (
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreText}>Score: {userScore}/100</Text>
            </View>
          )}
        </View>

        <View style={styles.lyricsSection}>
          <Text style={styles.lyricsTitle}>🎵 Baris {currentLyricIndex + 1}:</Text>
          <Text style={styles.currentLyric}>{currentLyric}</Text>
          
          <View style={styles.melodyInfo}>
            <Text style={styles.melodyLabel}>Nada: {selectedSong.melody}</Text>
          </View>
        </View>

        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.controlButton, styles.melodyButton]}
            onPress={playMelody}
            disabled={isPlaying}
          >
            <LinearGradient
              colors={isPlaying ? ['#999', '#777'] : ['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
            >
              <Ionicons 
                name={isPlaying ? "volume-high" : "headset"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.buttonText}>
                {isPlaying ? 'Memainkan...' : 'Dengar Melodi'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.recordButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <LinearGradient
              colors={isRecording ? ['#F44336', '#E53935'] : ['#FF9800', '#F57C00']}
              style={styles.buttonGradient}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.buttonText}>
                {isRecording ? 'Berhenti Nyanyi' : 'Mulai Nyanyi'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {showLyrics && (
          <View style={styles.allLyricsSection}>
            <Text style={styles.allLyricsTitle}>Lirik Lengkap:</Text>
            {selectedSong.lyrics.map((lyric, index) => (
              <Text 
                key={index} 
                style={[
                  styles.lyricLine,
                  index === currentLyricIndex && styles.activeLyricLine
                ]}
              >
                {index + 1}. {lyric}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (selectedSong) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderSingingInterface()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            style={styles.testBackButton}
            onPress={onBack || (() => console.log('Back pressed but no onBack provided'))}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnimation,
            },
          ]}
        >
          <Text style={styles.headerTitle}>🎵 Belajar Bernyanyi</Text>
          <Text style={styles.headerSubtitle}>
            Nyanyikan lagu-lagu indah dengan Imron & Siti!
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Pilih Lagu Favoritmu</Text>
        {songs.map(renderSongCard)}
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
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 5,
  },
  testBackButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  songCard: {
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
  songGradient: {
    padding: 20,
  },
  songHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  characterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  songDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  songMeta: {
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
  melodyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  songFooter: {
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
  singingContainer: {
    flex: 1,
  },
  singingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  singingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  progressIndicator: {
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
  characterSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  singingCharacter: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  scoreDisplay: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lyricsSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  lyricsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  currentLyric: {
    fontSize: 20,
    lineHeight: 30,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  melodyInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  melodyLabel: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
  },
  melodyButton: {
    // Additional styling for melody button
  },
  recordButton: {
    // Additional styling for record button
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  allLyricsSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  allLyricsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  lyricLine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  activeLyricLine: {
    color: '#667eea',
    fontWeight: 'bold',
    backgroundColor: '#f0f4ff',
    padding: 8,
    borderRadius: 8,
  },
});

export default SingingScreen;
