import React from 'react';
import {
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0377DD" barStyle="light-content" />
      
      {/* Background */}
      <View style={styles.background} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Text Section */}
        <View style={styles.textSection}>
          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Hi Welcome to</Text>
          
          {/* App Name */}
          <Text style={styles.appName}>Zeko</Text>
        </View>
        
        {/* Character Images */}
        <View style={styles.charactersContainer}>
          <Image 
            source={require('../assets/images/siti.png')} 
            style={styles.characterLeft}
            resizeMode="contain"
          />
          <Image 
            source={require('../assets/images/Imron.png')} 
            style={styles.characterRight}
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Get Started Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={onGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0077DD', // Warna biru yang lebih sesuai dengan gambar
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  textSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
  },
  appName: {
    fontSize: 64,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  charactersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: width * 0.8,
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  characterLeft: {
    width: 120,
    height: 160,
  },
  characterRight: {
    width: 120,
    height: 160,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    paddingTop: 20,
  },
  getStartedButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#0377DD',
    fontSize: 18,
    fontWeight: '600',
  },
});
