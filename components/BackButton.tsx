import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  onPress, 
  color = '#007AFF', 
  size = 24 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity style={styles.backButton} onPress={handlePress}>
      <IconSymbol name="chevron.left" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});
