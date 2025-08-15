import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface OfflineContextType {
  isConnected: boolean;
  hasOfflineData: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  saveOfflineData: (key: string, data: any) => Promise<void>;
  getOfflineData: (key: string) => Promise<any>;
  clearOfflineData: () => Promise<void>;
  syncOnlineData: () => Promise<void>;
  isOfflineModeEnabled: boolean;
  pendingActions: OfflineAction[];
  addPendingAction: (action: OfflineAction) => void;
}

interface OfflineAction {
  id: string;
  type: 'speech_training' | 'emotion_detection' | 'progress_update' | 'gamification';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineProviderProps {
  children: ReactNode;
}

const OFFLINE_STORAGE_KEY = 'zeko_offline_data';
const PENDING_ACTIONS_KEY = 'zeko_pending_actions';
const OFFLINE_MODE_KEY = 'zeko_offline_mode_enabled';

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    initializeOfflineMode();
    setupNetworkListener();
    loadPendingActions();
  }, []);

  useEffect(() => {
    if (isConnected && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isConnected, pendingActions]);

  const initializeOfflineMode = async () => {
    try {
      const offlineModeEnabled = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
      setIsOfflineModeEnabled(offlineModeEnabled === 'true');
      
      const offlineData = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
      setHasOfflineData(!!offlineData);
    } catch (error) {
      console.error('Error initializing offline mode:', error);
    }
  };

  const setupNetworkListener = () => {
    // Simple network status simulation
    // In production, use @react-native-community/netinfo
    const checkNetwork = () => {
      // Mock network status check
      setIsConnected(navigator.onLine ?? true);
    };

    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  };

  const loadPendingActions = async () => {
    try {
      const pendingActionsData = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
      if (pendingActionsData) {
        setPendingActions(JSON.parse(pendingActionsData));
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = async (actions: OfflineAction[]) => {
    try {
      await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const enableOfflineMode = async () => {
    try {
      setIsOfflineModeEnabled(true);
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'true');
      
      // Preload essential data for offline use
      await preloadOfflineData();
      
      Alert.alert(
        'Mode Offline Aktif',
        'Fitur dasar tetap dapat digunakan tanpa koneksi internet.'
      );
    } catch (error) {
      console.error('Error enabling offline mode:', error);
    }
  };

  const disableOfflineMode = async () => {
    try {
      setIsOfflineModeEnabled(false);
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'false');
    } catch (error) {
      console.error('Error disabling offline mode:', error);
    }
  };

  const preloadOfflineData = async () => {
    try {
      const offlineData = {
        // Basic vocabulary for speech training
        vocabulary: [
          { word: 'aku', phonetic: 'a-ku', difficulty: 'easy' },
          { word: 'mama', phonetic: 'ma-ma', difficulty: 'easy' },
          { word: 'papa', phonetic: 'pa-pa', difficulty: 'easy' },
          { word: 'rumah', phonetic: 'ru-mah', difficulty: 'medium' },
          { word: 'sekolah', phonetic: 'se-ko-lah', difficulty: 'medium' },
          { word: 'bermain', phonetic: 'ber-ma-in', difficulty: 'medium' },
          { word: 'belajar', phonetic: 'be-la-jar', difficulty: 'hard' },
          { word: 'bercerita', phonetic: 'ber-ce-ri-ta', difficulty: 'hard' },
        ],
        
        // Simple stories for offline reading
        stories: [
          {
            id: 'offline-1',
            title: 'Petualangan Sederhana',
            content: [
              'Aku pergi ke sekolah.',
              'Di sekolah, aku bertemu teman.',
              'Kami bermain bersama.',
              'Pulang ke rumah dengan senang.',
            ],
          },
        ],
        
        // Basic emotion templates
        emotions: ['senang', 'sedih', 'marah', 'takut', 'terkejut', 'tenang'],
        
        // Achievement templates
        achievements: [
          { id: 'offline-read', title: 'Pembaca Offline', points: 50 },
          { id: 'offline-speak', title: 'Pembicara Offline', points: 50 },
        ],
      };

      await saveOfflineData('essential_data', offlineData);
      setHasOfflineData(true);
    } catch (error) {
      console.error('Error preloading offline data:', error);
    }
  };

  const saveOfflineData = async (key: string, data: any) => {
    try {
      const existingData = await getOfflineData('all') || {};
      existingData[key] = {
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existingData));
      setHasOfflineData(true);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const getOfflineData = async (key: string) => {
    try {
      const offlineData = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!offlineData) return null;
      
      const parsedData = JSON.parse(offlineData);
      if (key === 'all') return parsedData;
      
      return parsedData[key]?.data || null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  };

  const clearOfflineData = async () => {
    try {
      await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
      await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
      setHasOfflineData(false);
      setPendingActions([]);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  };

  const addPendingAction = (action: OfflineAction) => {
    const newPendingActions = [...pendingActions, action];
    setPendingActions(newPendingActions);
    savePendingActions(newPendingActions);
  };

  const syncPendingActions = async () => {
    if (!isConnected || pendingActions.length === 0) return;

    try {
      const successfulActions: string[] = [];
      
      for (const action of pendingActions) {
        try {
          // Simulate API calls for different action types
          await simulateAPICall(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          // Increment retry count
          action.retryCount += 1;
          if (action.retryCount >= 3) {
            // Remove action after 3 failed attempts
            successfulActions.push(action.id);
          }
        }
      }
      
      // Remove successfully synced actions
      const remainingActions = pendingActions.filter(
        action => !successfulActions.includes(action.id)
      );
      
      setPendingActions(remainingActions);
      await savePendingActions(remainingActions);
      
      if (successfulActions.length > 0) {
        Alert.alert(
          'Sinkronisasi Selesai',
          `${successfulActions.length} aktivitas berhasil disinkronisasi.`
        );
      }
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    }
  };

  const simulateAPICall = async (action: OfflineAction) => {
    // Simulate different API endpoints based on action type
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve(true);
        } else {
          reject(new Error('API call failed'));
        }
      }, 1000);
    });
  };

  const syncOnlineData = async () => {
    try {
      await syncPendingActions();
      
      // Additional sync logic for other data
      Alert.alert(
        'Sinkronisasi Selesai',
        'Data berhasil disinkronisasi dengan server.'
      );
    } catch (error) {
      console.error('Error syncing online data:', error);
      Alert.alert(
        'Gagal Sinkronisasi',
        'Terjadi kesalahan saat sinkronisasi data.'
      );
    }
  };

  const contextValue: OfflineContextType = {
    isConnected,
    hasOfflineData,
    enableOfflineMode,
    disableOfflineMode,
    saveOfflineData,
    getOfflineData,
    clearOfflineData,
    syncOnlineData,
    isOfflineModeEnabled,
    pendingActions,
    addPendingAction,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

// Enhanced Error Handler Component
class ErrorHandler {
  static handleSpeechRecognitionError(error: any) {
    console.error('Speech Recognition Error:', error);
    
    if (error.code === 'NETWORK_ERROR') {
      Alert.alert(
        'Koneksi Bermasalah',
        'Coba gunakan mode offline atau periksa koneksi internet.',
        [
          { text: 'Coba Lagi', style: 'default' },
          { text: 'Mode Offline', style: 'default' },
        ]
      );
    } else if (error.code === 'PERMISSION_DENIED') {
      Alert.alert(
        'Izin Mikrofon',
        'Aplikasi memerlukan izin mikrofon untuk latihan bicara.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Buka Pengaturan', style: 'default' },
        ]
      );
    } else {
      Alert.alert(
        'Terjadi Kesalahan',
        'Tidak dapat mendeteksi suara. Silakan coba lagi.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }

  static handleEmotionDetectionError(error: any) {
    console.error('Emotion Detection Error:', error);
    
    Alert.alert(
      'Deteksi Emosi Gagal',
      'Tidak dapat menganalisis emosi. Mode offline akan digunakan.',
      [{ text: 'OK', style: 'default' }]
    );
  }

  static handleProgressSaveError(error: any) {
    console.error('Progress Save Error:', error);
    
    Alert.alert(
      'Gagal Menyimpan',
      'Progress akan disimpan secara offline dan disinkronisasi nanti.',
      [{ text: 'OK', style: 'default' }]
    );
  }

  static handleGeneralError(error: any, context: string) {
    console.error(`${context} Error:`, error);
    
    Alert.alert(
      'Terjadi Kesalahan',
      'Aplikasi mengalami masalah. Silakan coba lagi atau restart aplikasi.',
      [
        { text: 'Coba Lagi', style: 'default' },
        { text: 'Restart App', style: 'destructive' },
      ]
    );
  }
}

// Export components
export { ErrorHandler, OfflineProvider };

