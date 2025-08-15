import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { useAuth } from '@/hooks/useAuth';
import ProgressMoodScreen from '@/src/screens/dashboard/ProgressMoodScreen';
import GamesScreen from '@/src/screens/games/GamesScreen';
import { MainMenuScreen } from '@/src/screens/MainMenuScreen';
import UserProfileScreen from '@/src/screens/profile/UserProfileScreen';
import SingingScreen from '@/src/screens/singing/SingingScreen';
import SpeechTrainingScreen from '@/src/screens/speech/SpeechTrainingScreen';
import StorytellingScreen from '@/src/screens/storytelling/StorytellingScreen';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'main' | 'speech-training' | 'storytelling' | 'singing' | 'games' | 'progress' | 'profile' | 'emotion-tracker'>('main');
  const { user, loading } = useAuth();

  const handleNavigateToRegister = () => {
    setShowRegister(true);
  };

  const handleNavigateToLogin = () => {
    setShowRegister(false);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleNavigateToFeature = (feature: string) => {
    setCurrentScreen(feature as any);
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  const handleLoginSuccess = () => {
    // User berhasil login, bisa navigasi ke halaman lain atau update state
    console.log('User logged in successfully');
  };

  const handleRegisterSuccess = () => {
    // User berhasil register dan login, navigasi kembali ke login screen atau home
    console.log('User registered successfully');
    setShowRegister(false); // Kembali ke login screen
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0377DD" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Jika user sudah login, tampilkan aplikasi utama
  if (user) {
    // Render different screens based on currentScreen state
    switch (currentScreen) {
      case 'speech-training':
        return <SpeechTrainingScreen onBack={handleBackToMain} />;
      case 'storytelling':
        return <StorytellingScreen onBack={handleBackToMain} />;
      case 'singing':
        return <SingingScreen onBack={handleBackToMain} />;
      case 'games':
        return <GamesScreen onBack={handleBackToMain} />;
      case 'progress':
        return <ProgressMoodScreen onBack={handleBackToMain} />;
      case 'profile':
        return <UserProfileScreen onBack={handleBackToMain} />;
      case 'emotion-tracker':
        return <ProgressMoodScreen onBack={handleBackToMain} />;
      default:
        return <MainMenuScreen onNavigateToFeature={handleNavigateToFeature} userName={user.displayName || 'Adik'} />;
    }
  }

  // Jika user belum login, tampilkan welcome screen atau form login/register
  if (!user) {
    if (showWelcome) {
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }

    if (showRegister) {
      return (
        <RegisterScreen 
          onNavigateToLogin={handleNavigateToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }

    return (
      <LoginScreen 
        onNavigateToRegister={handleNavigateToRegister}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0377DD',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
