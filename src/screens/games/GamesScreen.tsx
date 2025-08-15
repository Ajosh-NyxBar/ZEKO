import { Ionicons } from '@expo/vector-icons';
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
import { ScreenHeader } from '../../../components/ScreenHeader';

const { width, height } = Dimensions.get('window');

interface Game {
  id: string;
  title: string;
  description: string;
  type: 'memory' | 'speaking' | 'emotion' | 'puzzle';
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  icon: string;
  points: number;
  played: boolean;
  bestScore?: number;
}

interface MemoryCard {
  id: string;
  word: string;
  image: string;
  flipped: boolean;
  matched: boolean;
}

interface GamesScreenProps {
  onBack?: () => void;
}

const GamesScreen: React.FC<GamesScreenProps> = ({ onBack }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed'>('menu');
  
  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Speaking Game State
  const [currentWord, setCurrentWord] = useState('');
  const [speakingScore, setSpeakingScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  
  // Emotion Game State
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [emotionOptions, setEmotionOptions] = useState<string[]>([]);
  const [emotionScore, setEmotionScore] = useState(0);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadGames();
    animateEntrance();
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && selectedGame?.type === 'memory') {
      startTimer();
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [gameState]);

  const loadGames = () => {
    const mockGames: Game[] = [
      {
        id: '1',
        title: 'Ingat Kata',
        description: 'Cocokkan kartu kata yang sama untuk melatih ingatan',
        type: 'memory',
        difficulty: 'Mudah',
        icon: 'albums',
        points: 50,
        played: false,
      },
      {
        id: '2',
        title: 'Tebak Emosi',
        description: 'Tebak emosi yang ditampilkan karakter',
        type: 'emotion',
        difficulty: 'Mudah',
        icon: 'happy',
        points: 60,
        played: true,
        bestScore: 85,
      },
      {
        id: '3',
        title: 'Ucapkan Kata',
        description: 'Ucapkan kata-kata yang muncul dengan benar',
        type: 'speaking',
        difficulty: 'Sedang',
        icon: 'mic',
        points: 75,
        played: false,
      },
      {
        id: '4',
        title: 'Puzzle Kata',
        description: 'Susun huruf-huruf menjadi kata yang benar',
        type: 'puzzle',
        difficulty: 'Sedang',
        icon: 'puzzle',
        points: 80,
        played: false,
      },
      {
        id: '5',
        title: 'Memori Super',
        description: 'Versi sulit dari permainan ingat kata',
        type: 'memory',
        difficulty: 'Sulit',
        icon: 'library',
        points: 100,
        played: false,
      },
    ];
    
    setGames(mockGames);
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startTimer = () => {
    timer.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
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

  const startGame = (game: Game) => {
    setSelectedGame(game);
    setGameState('playing');
    
    switch (game.type) {
      case 'memory':
        initMemoryGame(game.difficulty);
        break;
      case 'speaking':
        initSpeakingGame();
        break;
      case 'emotion':
        initEmotionGame();
        break;
      case 'puzzle':
        initPuzzleGame();
        break;
    }
    
    animateScale();
  };

  const initMemoryGame = (difficulty: string) => {
    const words = ['kucing', 'anjing', 'burung', 'ikan', 'kelinci', 'hamster'];
    const pairs = difficulty === 'Mudah' ? 3 : difficulty === 'Sedang' ? 4 : 6;
    
    const selectedWords = words.slice(0, pairs);
    const gameCards: MemoryCard[] = [];
    
    selectedWords.forEach((word, index) => {
      // Add two cards for each word (pair)
      gameCards.push({
        id: `${word}_1`,
        word,
        image: `animal_${index + 1}`,
        flipped: false,
        matched: false,
      });
      gameCards.push({
        id: `${word}_2`,
        word,
        image: `animal_${index + 1}`,
        flipped: false,
        matched: false,
      });
    });
    
    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeElapsed(0);
  };

  const initSpeakingGame = () => {
    const words = ['aku', 'mama', 'papa', 'rumah', 'sekolah', 'main'];
    setCurrentWord(words[0]);
    setSpeakingScore(0);
    setWordsCompleted(0);
  };

  const initEmotionGame = () => {
    const emotions = ['senang', 'sedih', 'marah', 'takut', 'terkejut'];
    const current = emotions[Math.floor(Math.random() * emotions.length)];
    setCurrentEmotion(current);
    
    // Create options (correct + 2 wrong)
    const wrongOptions = emotions.filter(e => e !== current).slice(0, 2);
    const options = [current, ...wrongOptions].sort(() => Math.random() - 0.5);
    setEmotionOptions(options);
    setEmotionScore(0);
  };

  const initPuzzleGame = () => {
    // Initialize puzzle game logic here
    Alert.alert('Coming Soon', 'Puzzle game akan tersedia dalam update berikutnya!');
  };

  const handleMemoryCardPress = (cardId: string) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const card1 = memoryCards.find(c => c.id === newFlippedCards[0]);
      const card2 = memoryCards.find(c => c.id === newFlippedCards[1]);
      
      if (card1 && card2 && card1.word === card2.word) {
        // Match found
        setTimeout(() => {
          setMemoryCards(prev => 
            prev.map(card => 
              card.id === card1.id || card.id === card2.id 
                ? { ...card, matched: true }
                : card
            )
          );
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game completed
          if (matchedPairs + 1 === memoryCards.length / 2) {
            completeMemoryGame();
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const completeMemoryGame = () => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    
    const score = Math.max(100 - moves * 2 - Math.floor(timeElapsed / 10), 20);
    
    Alert.alert(
      '🎉 Permainan Selesai!',
      `Selamat! Kamu berhasil mencocokkan semua kartu!\n\nWaktu: ${timeElapsed}s\nLangkah: ${moves}\nScore: ${score}\n\n+${selectedGame?.points} poin`,
      [
        {
          text: 'Main Lagi',
          onPress: () => {
            if (selectedGame) {
              initMemoryGame(selectedGame.difficulty);
            }
          },
        },
        {
          text: 'Kembali',
          onPress: () => {
            setGameState('menu');
            setSelectedGame(null);
          },
        },
      ]
    );
  };

  const handleSpeaking = () => {
    // Mock speaking recognition
    const success = Math.random() > 0.3; // 70% success rate
    
    if (success) {
      const newScore = speakingScore + 10;
      setSpeakingScore(newScore);
      setWordsCompleted(prev => prev + 1);
      
      Alert.alert('👏 Bagus!', 'Pengucapan kamu benar!', [
        {
          text: 'Lanjut',
          onPress: () => {
            const words = ['aku', 'mama', 'papa', 'rumah', 'sekolah', 'main'];
            if (wordsCompleted + 1 >= words.length) {
              // Game completed
              Alert.alert(
                '🎉 Selesai!',
                `Kamu telah menguasai semua kata!\n\nScore: ${newScore}\n\n+${selectedGame?.points} poin`,
                [
                  {
                    text: 'Kembali',
                    onPress: () => {
                      setGameState('menu');
                      setSelectedGame(null);
                    },
                  },
                ]
              );
            } else {
              setCurrentWord(words[wordsCompleted + 1]);
            }
          },
        },
      ]);
    } else {
      Alert.alert('💪 Coba Lagi!', 'Coba ucapkan dengan lebih jelas ya!');
    }
  };

  const handleEmotionGuess = (emotion: string) => {
    if (emotion === currentEmotion) {
      const newScore = emotionScore + 20;
      setEmotionScore(newScore);
      
      Alert.alert('🎉 Benar!', `Emosi ${emotion} benar!`, [
        {
          text: 'Lanjut',
          onPress: () => {
            if (newScore >= 100) {
              Alert.alert(
                '🏆 Menang!',
                `Kamu hebat! Score: ${newScore}\n\n+${selectedGame?.points} poin`,
                [
                  {
                    text: 'Kembali',
                    onPress: () => {
                      setGameState('menu');
                      setSelectedGame(null);
                    },
                  },
                ]
              );
            } else {
              initEmotionGame(); // Next round
            }
          },
        },
      ]);
    } else {
      Alert.alert('❌ Salah', `Yang benar adalah "${currentEmotion}". Coba lagi!`);
      initEmotionGame(); // Try again
    }
  };

  const renderGameCard = (game: Game) => (
    <TouchableOpacity
      key={game.id}
      style={[styles.gameCard, game.played && styles.playedCard]}
      onPress={() => startGame(game)}
    >
      <LinearGradient
        colors={getDifficultyColor(game.difficulty)}
        style={styles.gameGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameIcon}>
            <Ionicons name={game.icon as any} size={30} color="white" />
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
            <View style={styles.gameMeta}>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{game.difficulty}</Text>
              </View>
              {game.bestScore && (
                <Text style={styles.bestScoreText}>Best: {game.bestScore}</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.gameFooter}>
          <View style={styles.pointsContainer}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.pointsText}>{game.points} poin</Text>
          </View>
          {game.played && (
            <View style={styles.playedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.playedText}>Dimainkan</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMemoryGame = () => (
    <View style={styles.gameInterface}>
      <View style={styles.gameStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Waktu</Text>
          <Text style={styles.statValue}>{timeElapsed}s</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Langkah</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pasangan</Text>
          <Text style={styles.statValue}>{matchedPairs}/{memoryCards.length / 2}</Text>
        </View>
      </View>
      
      <View style={styles.memoryGrid}>
        {memoryCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.memoryCard,
              (flippedCards.includes(card.id) || card.matched) && styles.flippedCard,
              card.matched && styles.matchedCard,
            ]}
            onPress={() => handleMemoryCardPress(card.id)}
          >
            {(flippedCards.includes(card.id) || card.matched) ? (
              <Text style={styles.cardText}>{card.word}</Text>
            ) : (
              <Ionicons name="help" size={24} color="#999" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSpeakingGame = () => (
    <View style={styles.gameInterface}>
      <View style={styles.speakingStats}>
        <Text style={styles.speakingScore}>Score: {speakingScore}</Text>
        <Text style={styles.wordsCount}>Kata: {wordsCompleted + 1}/6</Text>
      </View>
      
      <View style={styles.speakingCard}>
        <Text style={styles.speakingTitle}>Ucapkan kata ini:</Text>
        <Text style={styles.currentWordText}>{currentWord}</Text>
        
        <TouchableOpacity style={styles.speakButton} onPress={handleSpeaking}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.speakButtonGradient}
          >
            <Ionicons name="mic" size={30} color="white" />
            <Text style={styles.speakButtonText}>Bicara</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmotionGame = () => (
    <View style={styles.gameInterface}>
      <View style={styles.emotionStats}>
        <Text style={styles.emotionScore}>Score: {emotionScore}/100</Text>
      </View>
      
      <View style={styles.emotionCard}>
        <Text style={styles.emotionTitle}>Imron sedang merasa:</Text>
        <Image 
          source={require('../../../assets/images/Imron.png')} 
          style={styles.emotionCharacter} 
        />
        <Text style={styles.emotionQuestion}>Apa yang sedang dirasakan Imron?</Text>
        
        <View style={styles.emotionOptions}>
          {emotionOptions.map((emotion) => (
            <TouchableOpacity
              key={emotion}
              style={styles.emotionOption}
              onPress={() => handleEmotionGuess(emotion)}
            >
              <Text style={styles.emotionOptionText}>{emotion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderGameInterface = () => {
    if (!selectedGame) return null;

    return (
      <View style={styles.gameContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gameContainerHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setGameState('menu');
              setSelectedGame(null);
              if (timer.current) {
                clearInterval(timer.current);
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.gameHeaderTitle}>{selectedGame.title}</Text>
        </LinearGradient>

        {selectedGame.type === 'memory' && renderMemoryGame()}
        {selectedGame.type === 'speaking' && renderSpeakingGame()}
        {selectedGame.type === 'emotion' && renderEmotionGame()}
      </View>
    );
  };

  if (gameState === 'playing') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderGameInterface()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="🎮 Permainan Seru"
        subtitle="Main sambil belajar bersama Imron & Siti!"
        onBack={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Pilih Permainan</Text>
        {games.map(renderGameCard)}
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
  gameCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  gameGradient: {
    padding: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  gameMeta: {
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
  bestScoreText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  gameFooter: {
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
  playedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  gameContainer: {
    flex: 1,
  },
  gameContainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  gameHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  gameInterface: {
    flex: 1,
    padding: 20,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  memoryCard: {
    width: width * 0.25,
    height: width * 0.25,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  flippedCard: {
    backgroundColor: '#4CAF50',
  },
  matchedCard: {
    backgroundColor: '#2196F3',
  },
  cardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  speakingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  speakingScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  wordsCount: {
    fontSize: 16,
    color: '#666',
  },
  speakingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },
  speakingTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  currentWordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 30,
  },
  speakButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  speakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emotionStats: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  emotionScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emotionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },
  emotionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  emotionCharacter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  emotionQuestion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emotionOptions: {
    width: '100%',
  },
  emotionOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  emotionOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default GamesScreen;
