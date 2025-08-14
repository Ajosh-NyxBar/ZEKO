import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AuthStatus = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              Alert.alert('Success', 'Logged out successfully!');
            } else {
              Alert.alert('Error', result.error || 'Logout failed');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Ionicons name="person-circle" size={40} color="#0377DD" />
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          {user.displayName && (
            <Text style={styles.nameText}>{user.displayName}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        disabled={loading}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0377DD',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 13,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
