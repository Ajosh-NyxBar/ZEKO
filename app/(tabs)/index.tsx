import { AuthStatus } from '@/components/AuthStatus';
import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuth();

  const handleNavigateToRegister = () => {
    setShowRegister(true);
  };

  const handleNavigateToLogin = () => {
    setShowRegister(false);
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

  // Jika user sudah login, tampilkan halaman utama
  if (user) {
    return (
      <View style={styles.container}>
        <AuthStatus />
        <View style={styles.contentContainer}>
          <Text style={styles.welcomeTitle}>Welcome to ZEKO!</Text>
          <Text style={styles.welcomeSubtitle}>
            You are successfully logged in with Firebase Authentication.
          </Text>
        </View>
      </View>
    );
  }

  // Jika user belum login, tampilkan form login/register
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
