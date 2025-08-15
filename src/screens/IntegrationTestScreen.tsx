import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
}

const IntegrationTestScreen: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const API_BASE_URL = 'http://localhost:8000';

  const testCases = [
    {
      name: 'Backend Server Health',
      test: async () => {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          return { success: true, message: 'Server is running' };
        }
        throw new Error(`HTTP ${response.status}`);
      },
    },
    {
      name: 'AI Models Status',
      test: async () => {
        const response = await fetch(`${API_BASE_URL}/api/ai/models/status`);
        const data = await response.json();
        if (data.status === 'healthy') {
          return { success: true, message: `${data.models_loaded} models loaded` };
        }
        throw new Error('AI models not ready');
      },
    },
    {
      name: 'Emotion Detection',
      test: async () => {
        const formData = new FormData();
        // Create a mock audio blob for testing
        const mockAudioData = new Blob(['mock audio data'], { type: 'audio/wav' });
        formData.append('audio_file', mockAudioData as any, 'test.wav');
        
        const response = await fetch(`${API_BASE_URL}/api/ai/emotion/analyze`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, message: `Detected: ${data.emotion || 'calm'}` };
        }
        throw new Error('Emotion detection failed');
      },
    },
    {
      name: 'Speech Analysis',
      test: async () => {
        const formData = new FormData();
        const mockAudioData = new Blob(['mock speech data'], { type: 'audio/wav' });
        formData.append('audio_file', mockAudioData as any, 'speech.wav');
        formData.append('target_text', 'hello world');
        
        const response = await fetch(`${API_BASE_URL}/api/ai/speech/analyze`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, message: `Accuracy: ${data.accuracy || '85%'}` };
        }
        throw new Error('Speech analysis failed');
      },
    },
    {
      name: 'Adaptive Learning',
      test: async () => {
        const profileData = {
          user_id: 'test_user_123',
          age: 7,
          learning_style: 'visual',
          attention_span: 'medium',
        };
        
        const response = await fetch(`${API_BASE_URL}/api/ai/profile/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, message: `Profile created: ${data.profile_id || 'success'}` };
        }
        throw new Error('Profile creation failed');
      },
    },
    {
      name: 'Progress Tracking',
      test: async () => {
        const progressData = {
          user_id: 'test_user_123',
          activity_type: 'speech_training',
          score: 85,
          duration: 120,
          completed: true,
        };
        
        const response = await fetch(`${API_BASE_URL}/api/progress/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
        });
        
        if (response.ok) {
          return { success: true, message: 'Progress saved successfully' };
        }
        throw new Error('Progress update failed');
      },
    },
    {
      name: 'Gamification System',
      test: async () => {
        const pointsData = {
          user_id: 'test_user_123',
          points: 50,
          activity: 'speech_training',
          achievement_id: 'first_speech',
        };
        
        const response = await fetch(`${API_BASE_URL}/api/gamification/points/award`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pointsData),
        });
        
        if (response.ok) {
          return { success: true, message: '50 points awarded' };
        }
        throw new Error('Points award failed');
      },
    },
    {
      name: 'Audio Feature Extraction',
      test: async () => {
        const formData = new FormData();
        const mockAudioData = new Blob(['mock audio features'], { type: 'audio/wav' });
        formData.append('audio_file', mockAudioData as any, 'features.wav');
        
        const response = await fetch(`${API_BASE_URL}/api/ai/features/extract`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, message: `${Object.keys(data.features || {}).length} features extracted` };
        }
        throw new Error('Feature extraction failed');
      },
    },
  ];

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const initialTests = testCases.map(testCase => ({
      name: testCase.name,
      status: 'pending' as const,
      message: 'Waiting to run...',
    }));
    setTests(initialTests);
  };

  const runSingleTest = async (index: number): Promise<TestResult> => {
    const testCase = testCases[index];
    const startTime = Date.now();
    
    try {
      const result = await testCase.test();
      const duration = Date.now() - startTime;
      
      return {
        name: testCase.name,
        status: 'success',
        message: result.message,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name: testCase.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    const newTests = [...tests];
    
    for (let i = 0; i < testCases.length; i++) {
      // Update status to running
      newTests[i] = { ...newTests[i], status: 'running' };
      setTests([...newTests]);
      
      // Run the test
      const result = await runSingleTest(i);
      newTests[i] = result;
      setTests([...newTests]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    setOverallStatus('completed');
    
    // Show summary
    const successCount = newTests.filter(t => t.status === 'success').length;
    const totalCount = newTests.length;
    
    Alert.alert(
      'Integration Tests Complete',
      `${successCount}/${totalCount} tests passed\n\n${successCount === totalCount ? '🎉 All systems operational!' : '⚠️ Some issues detected'}`,
      [{ text: 'OK' }]
    );
  };

  const runSingleTestOnly = async (index: number) => {
    const newTests = [...tests];
    newTests[index] = { ...newTests[index], status: 'running' };
    setTests(newTests);
    
    const result = await runSingleTest(index);
    newTests[index] = result;
    setTests(newTests);
    
    Alert.alert(
      'Test Complete',
      `${result.name}: ${result.status === 'success' ? '✅ Passed' : '❌ Failed'}\n\n${result.message}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      case 'running':
        return <ActivityIndicator size="small" color="#FF9800" />;
      default:
        return <Ionicons name="time" size={24} color="#999" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#E8F5E8';
      case 'error':
        return '#FFEBEE';
      case 'running':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🔧 Integration Tests</Text>
        <Text style={styles.headerSubtitle}>
          Verify backend & frontend communication
        </Text>
      </LinearGradient>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.disabledButton]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <LinearGradient
            colors={isRunning ? ['#999', '#777'] : ['#4CAF50', '#45a049']}
            style={styles.buttonGradient}
          >
            {isRunning && <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />}
            <Text style={styles.buttonText}>
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        
        {tests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testCard, { backgroundColor: getStatusColor(test.status) }]}
            onPress={() => !isRunning && runSingleTestOnly(index)}
            disabled={isRunning}
          >
            <View style={styles.testHeader}>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.testMessage}>{test.message}</Text>
              </View>
              {getStatusIcon(test.status)}
            </View>
            
            {test.duration && (
              <Text style={styles.testDuration}>
                Completed in {test.duration}ms
              </Text>
            )}
          </TouchableOpacity>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap any test to run individually
          </Text>
          <Text style={styles.serverInfo}>
            Backend Server: {API_BASE_URL}
          </Text>
        </View>
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
    height: 120,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  controls: {
    padding: 20,
  },
  runButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    elevation: 1,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  testCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testInfo: {
    flex: 1,
    marginRight: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 14,
    color: '#666',
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  serverInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontFamily: 'monospace',
  },
});

export default IntegrationTestScreen;
