import { auth } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Import Google Sign In only for native platforms
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (error) {
    console.warn('Google Sign In package not available for this platform');
  }
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Configure Google Sign In only for native platforms
    if (GoogleSignin && Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id-here',
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      if (Platform.OS === 'web') {
        // Use Firebase's native web Google sign-in
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
      } else {
        // Use react-native-google-signin for native platforms
        if (!GoogleSignin) {
          throw new Error('Google Sign In is not available for this platform');
        }
        
        // Check if device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        // Get the user's ID token
        const signInResult = await GoogleSignin.signIn();
        const idToken = signInResult.data?.idToken;
        
        if (!idToken) {
          throw new Error('Failed to get ID token from Google Sign-In');
        }
        
        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(idToken);
        
        // Sign in the user with the credential
        const result = await signInWithCredential(auth, googleCredential);
        
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Sign out from Google on native platforms only
      if (GoogleSignin && Platform.OS !== 'web') {
        await GoogleSignin.signOut();
      }
      
      // Sign out from Firebase
      await signOut(auth);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  };
};
