import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface MainMenuProps {
  onNavigateToFeature: (feature: string) => void;
  userName?: string;
}

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string[];
  image?: any;
}

const features: FeatureCard[] = [
  {
    id: 'speech-training',
    title: 'Latihan Bicara',
    subtitle: 'Berlatih mengucapkan kata dengan Imron & Siti',
    icon: 'mic',
    color: ['#FF6B6B', '#FF8E53'],
    image: require('@/assets/images/Imron.png'),
  },
  {
    id: 'storytelling',
    title: 'Cerita Interaktif',
    subtitle: 'Dengarkan cerita seru dan jawab pertanyaan',
    icon: 'book',
    color: ['#4ECDC4', '#44A08D'],
    image: require('@/assets/images/siti.png'),
  },
  {
    id: 'singing',
    title: 'Bernyanyi',
    subtitle: 'Bernyanyi bersama karakter favorit',
    icon: 'musical-notes',
    color: ['#A8E6CF', '#7FCDCD'],
  },
  {
    id: 'games',
    title: 'Permainan',
    subtitle: 'Kumpulkan bintang dan naik level',
    icon: 'game-controller',
    color: ['#FFD93D', '#6BCF7F'],
  },
  {
    id: 'progress',
    title: 'Progres Saya',
    subtitle: 'Lihat pencapaian dan statistik',
    icon: 'stats-chart',
    color: ['#A8C8EC', '#7D8DC1'],
  },
  {
    id: 'emotion-tracker',
    title: 'Mood Tracker',
    subtitle: 'Bagaimana perasaanmu hari ini?',
    icon: 'happy',
    color: ['#F093FB', '#F5576C'],
  },
];

export const MainMenuScreen = ({ onNavigateToFeature, userName = 'Adik' }: MainMenuProps) => {
  const handleFeaturePress = (featureId: string) => {
    onNavigateToFeature(featureId);
  };

  const renderFeatureCard = (feature: FeatureCard, index: number) => (
    <TouchableOpacity
      key={feature.id}
      style={[styles.featureCard, index % 2 === 1 && styles.featureCardOffset]}
      onPress={() => handleFeaturePress(feature.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={feature.color as [string, string]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name={feature.icon as any} size={32} color="white" />
            {feature.image && (
              <Image source={feature.image} style={styles.characterImage} resizeMode="contain" />
            )}
          </View>
          
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Halo, {userName}! 👋</Text>
          <Text style={styles.subWelcomeText}>Ayo belajar bersama hari ini!</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => handleFeaturePress('profile')}
        >
          <Ionicons name="person-circle" size={40} color="#0077DD" />
        </TouchableOpacity>
      </View>

      {/* Character Section */}
      <View style={styles.characterSection}>
        <View style={styles.charactersContainer}>
          <Image 
            source={require('@/assets/images/siti.png')} 
            style={styles.mainCharacterLeft}
            resizeMode="contain"
          />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>Pilih aktivitas yang ingin kamu lakukan!</Text>
          </View>
          <Image 
            source={require('@/assets/images/Imron.png')} 
            style={styles.mainCharacterRight}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Features Grid */}
      <ScrollView 
        style={styles.featuresContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => renderFeatureCard(feature, index))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Hint */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>Geser ke atas untuk melihat lebih banyak aktivitas</Text>
        <Ionicons name="chevron-up" size={20} color="#666" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subWelcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  characterSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    marginBottom: 10,
  },
  charactersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  mainCharacterLeft: {
    width: 80,
    height: 100,
  },
  mainCharacterRight: {
    width: 80,
    height: 100,
  },
  speechBubble: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 15,
    flex: 1,
    marginHorizontal: 15,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  speechText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    paddingVertical: 10,
  },
  featureCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featureCardOffset: {
    marginLeft: 20,
  },
  cardGradient: {
    height: 120,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  characterImage: {
    width: 50,
    height: 60,
    marginLeft: 10,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  bottomHint: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});
