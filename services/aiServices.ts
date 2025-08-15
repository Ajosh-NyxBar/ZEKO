/**
 * AI Services Client for ZEKO
 * ===========================
 * 
 * Comprehensive client for interacting with ZEKO AI backend services.
 * Provides speech analysis, emotion detection, and adaptive learning.
 */

import { Alert } from 'react-native';

// Configuration
const AI_BASE_URL = 'http://localhost:8000/api/ai';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Types
export interface EmotionAnalysisResult {
  success: boolean;
  analysis_type: string;
  results: {
    predicted_emotion: string;
    confidence: number;
    emotion_probabilities: Record<string, number>;
  };
  recommendations: string[];
}

export interface SpeechAnalysisResult {
  success: boolean;
  analysis_type: string;
  results: {
    spoken_word: string;
    target_word: string;
    score: number;
    feedback: string;
    suggestions: string[];
    overall_feedback: string;
  };
  recommendations: string[];
}

export interface AudioFeaturesResult {
  success: boolean;
  analysis_type: string;
  results: {
    audio_features: Record<string, number>;
  };
  recommendations: string[];
}

export interface UserProfile {
  user_id: string;
  age: number;
  current_level: string;
  learning_style: string;
  attention_span: number;
  preferred_session_time: string;
  strengths: string[];
  weaknesses: string[];
  motivation_factors: string[];
}

export interface AdaptiveRecommendation {
  success: boolean;
  next_words: string[];
  difficulty_adjustment: string;
  recommendations: string[];
  character_interaction: string;
}

export interface AIModelsStatus {
  success: boolean;
  models: {
    emotion_model: {
      loaded: boolean;
      trained: boolean;
      emotions_supported: string[];
    };
    speech_model: {
      loaded: boolean;
      initialized: boolean;
    };
    adaptive_model: {
      loaded: boolean;
      difficulty_levels: string[];
      learning_styles: string[];
    };
  };
  timestamp: string;
}

class AIServicesClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = AI_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Create FormData for file upload
   */
  private createFormData(audioUri: string, additionalData?: Record<string, any>): FormData {
    const formData = new FormData();
    
    // Add audio file
    formData.append('audio_file', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'recording.wav',
    } as any);

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return formData;
  }

  /**
   * Make API request with timeout and error handling
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if ((error as any)?.name === 'AbortError') {
        throw new Error('Request timeout - AI service may be busy');
      }
      
      console.error(`AI Service Error (${endpoint}):`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Analyze emotion from audio recording
   */
  async analyzeEmotion(
    audioUri: string, 
    userId?: string
  ): Promise<EmotionAnalysisResult> {
    try {
      const formData = this.createFormData(audioUri);
      
      if (userId) {
        // Add request data as JSON string in form
        const requestData = {
          user_id: userId,
          analysis_type: 'emotion'
        };
        formData.append('request_data', JSON.stringify(requestData));
      }

      return await this.makeRequest<EmotionAnalysisResult>('/emotion/analyze', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Emotion analysis failed: ${message}`);
    }
  }

  /**
   * Analyze speech pronunciation and accuracy
   */
  async analyzeSpeech(
    audioUri: string, 
    targetWord: string = 'hello'
  ): Promise<SpeechAnalysisResult> {
    try {
      const formData = this.createFormData(audioUri, { target_word: targetWord });

      return await this.makeRequest<SpeechAnalysisResult>('/speech/analyze', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Speech analysis failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Speech analysis failed: ${message}`);
    }
  }

  /**
   * Extract audio features for analysis
   */
  async extractAudioFeatures(audioUri: string): Promise<AudioFeaturesResult> {
    try {
      const formData = this.createFormData(audioUri);

      return await this.makeRequest<AudioFeaturesResult>('/features/extract', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Audio feature extraction failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Feature extraction failed: ${message}`);
    }
  }

  /**
   * Create user profile for adaptive learning
   */
  async createUserProfile(
    userId: string,
    age: number,
    learningStyle: string = 'mixed',
    preferredTime: string = 'afternoon'
  ): Promise<{ success: boolean; user_profile: UserProfile; recommendations: any }> {
    try {
      const requestData = {
        user_id: userId,
        age,
        learning_style: learningStyle,
        preferred_time: preferredTime,
      };

      return await this.makeRequest('/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      console.error('User profile creation failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Profile creation failed: ${message}`);
    }
  }

  /**
   * Get adaptive learning recommendations
   */
  async getAdaptiveRecommendations(
    userId: string,
    sessionData: {
      words?: string[];
      scores?: number[];
      duration?: number;
      engagement?: number;
    }
  ): Promise<AdaptiveRecommendation> {
    try {
      const requestData = {
        user_id: userId,
        session_data: sessionData,
      };

      return await this.makeRequest<AdaptiveRecommendation>('/adaptive/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      console.error('Adaptive recommendations failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Recommendations failed: ${message}`);
    }
  }

  /**
   * Get AI models status and health
   */
  async getModelsStatus(): Promise<AIModelsStatus> {
    try {
      return await this.makeRequest<AIModelsStatus>('/models/status');
    } catch (error) {
      console.error('Models status check failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Status check failed: ${message}`);
    }
  }

  /**
   * Test emotion model with mock data
   */
  async testEmotionModel(): Promise<any> {
    try {
      return await this.makeRequest('/test/emotion', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Emotion model test failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Emotion test failed: ${message}`);
    }
  }

  /**
   * Test adaptive learning system
   */
  async testAdaptiveLearning(): Promise<any> {
    try {
      return await this.makeRequest('/test/adaptive', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Adaptive learning test failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adaptive test failed: ${message}`);
    }
  }

  /**
   * Health check for all AI services
   */
  async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
    try {
      const baseHealthUrl = this.baseUrl.replace('/api/ai', '/api/health');
      return await this.makeRequest(baseHealthUrl.replace(this.baseUrl, ''));
    } catch (error) {
      console.error('Health check failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'unhealthy',
        services: {
          ai_backend: 'offline',
          error: message,
        },
      };
    }
  }
}

// Create singleton instance
export const aiServices = new AIServicesClient();

// Utility functions
export const showAIError = (error: Error, context: string = 'AI Service') => {
  console.error(`${context} Error:`, error);
  Alert.alert(
    `${context} Error`,
    error.message.includes('timeout') 
      ? 'AI service is taking too long to respond. Please try again.'
      : error.message.includes('Network')
      ? 'Network connection error. Please check your connection.'
      : error.message,
    [{ text: 'OK' }]
  );
};

export const handleAIServiceError = async (
  operation: () => Promise<any>,
  context: string = 'AI Operation'
): Promise<any> => {
  try {
    return await operation();
  } catch (error) {
    showAIError(error as Error, context);
    throw error;
  }
};

export default aiServices;
