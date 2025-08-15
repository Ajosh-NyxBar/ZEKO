/**
 * AI Services Hook for ZEKO
 * =========================
 * 
 * React hooks for integrating AI services with speech training.
 * Provides state management and error handling for AI operations.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    AdaptiveRecommendation,
    AIModelsStatus,
    aiServices,
    EmotionAnalysisResult,
    showAIError,
    SpeechAnalysisResult,
    UserProfile
} from '../services/aiServices';

// Hook state interfaces
interface AIServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface SpeechTrainingState {
  currentWord: string;
  targetWords: string[];
  userProfile: UserProfile | null;
  sessionData: {
    wordsAttempted: string[];
    scores: number[];
    emotions: string[];
    startTime: Date;
    duration: number;
  };
}

/**
 * Main AI Services Hook
 */
export const useAIServices = () => {
  const [modelsStatus, setModelsStatus] = useState<AIServiceState<AIModelsStatus>>({
    data: null,
    loading: false,
    error: null,
  });

  // Check AI models status
  const checkModelsStatus = useCallback(async () => {
    setModelsStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const status = await aiServices.getModelsStatus();
      setModelsStatus({ data: status, loading: false, error: null });
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setModelsStatus({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      return await aiServices.healthCheck();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', services: {} };
    }
  }, []);

  return {
    modelsStatus,
    checkModelsStatus,
    healthCheck,
  };
};

/**
 * Emotion Analysis Hook
 */
export const useEmotionAnalysis = () => {
  const [emotionState, setEmotionState] = useState<AIServiceState<EmotionAnalysisResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const analyzeEmotion = useCallback(async (audioUri: string, userId?: string) => {
    setEmotionState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await aiServices.analyzeEmotion(audioUri, userId);
      setEmotionState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Emotion analysis failed';
      setEmotionState({ data: null, loading: false, error: errorMessage });
      showAIError(error as Error, 'Emotion Analysis');
      throw error;
    }
  }, []);

  const clearEmotionState = useCallback(() => {
    setEmotionState({ data: null, loading: false, error: null });
  }, []);

  return {
    emotionState,
    analyzeEmotion,
    clearEmotionState,
  };
};

/**
 * Speech Analysis Hook
 */
export const useSpeechAnalysis = () => {
  const [speechState, setSpeechState] = useState<AIServiceState<SpeechAnalysisResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const analyzeSpeech = useCallback(async (audioUri: string, targetWord: string) => {
    setSpeechState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await aiServices.analyzeSpeech(audioUri, targetWord);
      setSpeechState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech analysis failed';
      setSpeechState({ data: null, loading: false, error: errorMessage });
      showAIError(error as Error, 'Speech Analysis');
      throw error;
    }
  }, []);

  const clearSpeechState = useCallback(() => {
    setSpeechState({ data: null, loading: false, error: null });
  }, []);

  return {
    speechState,
    analyzeSpeech,
    clearSpeechState,
  };
};

/**
 * Adaptive Learning Hook
 */
export const useAdaptiveLearning = () => {
  const [profileState, setProfileState] = useState<AIServiceState<UserProfile>>({
    data: null,
    loading: false,
    error: null,
  });

  const [recommendationState, setRecommendationState] = useState<AIServiceState<AdaptiveRecommendation>>({
    data: null,
    loading: false,
    error: null,
  });

  // Create user profile
  const createProfile = useCallback(async (
    userId: string, 
    age: number, 
    learningStyle: string = 'mixed',
    preferredTime: string = 'afternoon'
  ) => {
    setProfileState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await aiServices.createUserProfile(userId, age, learningStyle, preferredTime);
      setProfileState({ data: result.user_profile, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile creation failed';
      setProfileState({ data: null, loading: false, error: errorMessage });
      showAIError(error as Error, 'Profile Creation');
      throw error;
    }
  }, []);

  // Get adaptive recommendations
  const getRecommendations = useCallback(async (
    userId: string,
    sessionData: {
      words?: string[];
      scores?: number[];
      duration?: number;
      engagement?: number;
    }
  ) => {
    setRecommendationState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await aiServices.getAdaptiveRecommendations(userId, sessionData);
      setRecommendationState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recommendations failed';
      setRecommendationState({ data: null, loading: false, error: errorMessage });
      showAIError(error as Error, 'Adaptive Learning');
      throw error;
    }
  }, []);

  return {
    profileState,
    recommendationState,
    createProfile,
    getRecommendations,
  };
};

/**
 * Complete Speech Training Hook
 * Combines all AI services for speech training sessions
 */
export const useSpeechTraining = (userId: string) => {
  const { analyzeEmotion } = useEmotionAnalysis();
  const { analyzeSpeech } = useSpeechAnalysis();
  const { createProfile, getRecommendations, profileState } = useAdaptiveLearning();

  const [trainingState, setTrainingState] = useState<SpeechTrainingState>({
    currentWord: '',
    targetWords: [],
    userProfile: null,
    sessionData: {
      wordsAttempted: [],
      scores: [],
      emotions: [],
      startTime: new Date(),
      duration: 0,
    },
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize user profile
  const initializeProfile = useCallback(async (age: number, learningStyle?: string) => {
    try {
      const result = await createProfile(userId, age, learningStyle);
      setTrainingState(prev => ({
        ...prev,
        userProfile: result.user_profile,
        targetWords: result.recommendations.next_words || [],
        currentWord: result.recommendations.next_words?.[0] || '',
      }));
      return result;
    } catch (error) {
      console.error('Profile initialization failed:', error);
      throw error;
    }
  }, [userId, createProfile]);

  // Process audio recording with both emotion and speech analysis
  const processAudio = useCallback(async (audioUri: string) => {
    if (!trainingState.currentWord) {
      throw new Error('No target word set for analysis');
    }

    setIsAnalyzing(true);
    
    try {
      // Run emotion and speech analysis in parallel
      const [emotionResult, speechResult] = await Promise.all([
        analyzeEmotion(audioUri, userId),
        analyzeSpeech(audioUri, trainingState.currentWord),
      ]);

      // Update session data
      const newScore = speechResult.results.score;
      const newEmotion = emotionResult.results.predicted_emotion;
      
      setTrainingState(prev => ({
        ...prev,
        sessionData: {
          ...prev.sessionData,
          wordsAttempted: [...prev.sessionData.wordsAttempted, trainingState.currentWord],
          scores: [...prev.sessionData.scores, newScore],
          emotions: [...prev.sessionData.emotions, newEmotion],
          duration: (Date.now() - prev.sessionData.startTime.getTime()) / 1000,
        },
      }));

      return {
        emotion: emotionResult,
        speech: speechResult,
        sessionUpdated: true,
      };
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [trainingState.currentWord, userId, analyzeEmotion, analyzeSpeech]);

  // Get next word recommendations
  const getNextWords = useCallback(async () => {
    try {
      const recommendations = await getRecommendations(userId, {
        words: trainingState.sessionData.wordsAttempted,
        scores: trainingState.sessionData.scores,
        duration: trainingState.sessionData.duration,
        engagement: trainingState.sessionData.emotions.includes('excited') ? 0.8 : 0.6,
      });

      setTrainingState(prev => ({
        ...prev,
        targetWords: recommendations.next_words,
        currentWord: recommendations.next_words[0] || prev.currentWord,
      }));

      return recommendations;
    } catch (error) {
      console.error('Failed to get next words:', error);
      throw error;
    }
  }, [userId, trainingState.sessionData, getRecommendations]);

  // Move to next word
  const nextWord = useCallback(() => {
    setTrainingState(prev => {
      const currentIndex = prev.targetWords.indexOf(prev.currentWord);
      const nextIndex = (currentIndex + 1) % prev.targetWords.length;
      return {
        ...prev,
        currentWord: prev.targetWords[nextIndex] || prev.targetWords[0],
      };
    });
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setTrainingState(prev => ({
      ...prev,
      sessionData: {
        wordsAttempted: [],
        scores: [],
        emotions: [],
        startTime: new Date(),
        duration: 0,
      },
    }));
  }, []);

  return {
    trainingState,
    isAnalyzing,
    profileState,
    initializeProfile,
    processAudio,
    getNextWords,
    nextWord,
    resetSession,
  };
};

/**
 * AI Status Monitor Hook
 */
export const useAIStatusMonitor = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { healthCheck } = useAIServices();

  const checkStatus = useCallback(async () => {
    try {
      const health = await healthCheck();
      setIsOnline(health.status === 'healthy');
      setLastCheck(new Date());
      return health.status === 'healthy';
    } catch (error) {
      setIsOnline(false);
      setLastCheck(new Date());
      return false;
    }
  }, [healthCheck]);

  // Auto-check status on mount and periodically
  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    isOnline,
    lastCheck,
    checkStatus,
  };
};

export default {
  useAIServices,
  useEmotionAnalysis,
  useSpeechAnalysis,
  useAdaptiveLearning,
  useSpeechTraining,
  useAIStatusMonitor,
};
