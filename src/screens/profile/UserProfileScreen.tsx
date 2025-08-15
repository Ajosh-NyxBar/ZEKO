import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserProfile {
  name: string;
  age: number;
  avatar: string;
  level: number;
  totalPoints: number;
  streakDays: number;
  favoriteActivity: string;
  joinDate: string;
  totalActivities: number;
  badges: string[];
}

interface ProfileSetting {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'switch' | 'navigation' | 'info';
  value?: boolean;
}

interface UserProfileScreenProps {
  onBack?: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileSettings, setProfileSettings] = useState<ProfileSetting[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserProfile();
    loadSettings();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserProfile = () => {
    // Mock user data
    const mockProfile: UserProfile = {
      name: 'Adik Kecil',
      age: 7,
      avatar: 'avatar_1',
      level: 5,
      totalPoints: 1250,
      streakDays: 12,
      favoriteActivity: 'Bercerita',
      joinDate: '2024-01-01',
      totalActivities: 45,
      badges: ['first_login', 'speech_master', 'story_lover', 'game_winner'],
    };

    setUserProfile(mockProfile);
    setEditName(mockProfile.name);
    setEditAge(mockProfile.age.toString());
    setSelectedAvatar(mockProfile.avatar);
  };

  const loadSettings = () => {
    const settings: ProfileSetting[] = [
      {
        id: 'notifications',
        title: 'Notifikasi',
        subtitle: 'Pengingat latihan harian',
        icon: 'notifications',
        type: 'switch',
        value: true,
      },
      {
        id: 'sound',
        title: 'Suara',
        subtitle: 'Efek suara dan musik',
        icon: 'volume-high',
        type: 'switch',
        value: true,
      },
      {
        id: 'auto_save',
        title: 'Simpan Otomatis',
        subtitle: 'Simpan progress secara otomatis',
        icon: 'save',
        type: 'switch',
        value: true,
      },
      {
        id: 'parent_dashboard',
        title: 'Dashboard Orang Tua',
        subtitle: 'Lihat laporan progress',
        icon: 'people',
        type: 'navigation',
      },
      {
        id: 'backup',
        title: 'Backup Data',
        subtitle: 'Cadangkan data ke cloud',
        icon: 'cloud-upload',
        type: 'navigation',
      },
      {
        id: 'help',
        title: 'Bantuan',
        subtitle: 'Panduan dan FAQ',
        icon: 'help-circle',
        type: 'navigation',
      },
      {
        id: 'about',
        title: 'Tentang ZEKO',
        subtitle: 'Versi 1.0.0',
        icon: 'information-circle',
        type: 'info',
      },
    ];

    setProfileSettings(settings);
  };

  const getLevelProgress = (): number => {
    if (!userProfile) return 0;
    const pointsForNextLevel = userProfile.level * 300;
    const currentLevelPoints = userProfile.totalPoints % 300;
    return (currentLevelPoints / pointsForNextLevel) * 100;
  };

  const getBadgeIcon = (badge: string): string => {
    switch (badge) {
      case 'first_login':
        return 'star';
      case 'speech_master':
        return 'mic';
      case 'story_lover':
        return 'book';
      case 'game_winner':
        return 'trophy';
      default:
        return 'medal';
    }
  };

  const getBadgeTitle = (badge: string): string => {
    switch (badge) {
      case 'first_login':
        return 'Pemula';
      case 'speech_master':
        return 'Master Bicara';
      case 'story_lover':
        return 'Pecinta Cerita';
      case 'game_winner':
        return 'Juara Game';
      default:
        return 'Badge';
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const saveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong!');
      return;
    }

    if (!editAge || parseInt(editAge) < 3 || parseInt(editAge) > 12) {
      Alert.alert('Error', 'Umur harus antara 3-12 tahun!');
      return;
    }

    if (userProfile) {
      setUserProfile({
        ...userProfile,
        name: editName,
        age: parseInt(editAge),
        avatar: selectedAvatar,
      });
    }

    setEditModalVisible(false);
    Alert.alert('✅ Berhasil!', 'Profile kamu sudah diperbarui!');
  };

  const handleSettingToggle = (id: string, value: boolean) => {
    setProfileSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  const handleSettingPress = (setting: ProfileSetting) => {
    switch (setting.id) {
      case 'parent_dashboard':
        Alert.alert('Dashboard Orang Tua', 'Fitur ini akan tersedia dalam update berikutnya!');
        break;
      case 'backup':
        Alert.alert('Backup Data', 'Data kamu akan dicadangkan ke cloud...');
        break;
      case 'help':
        Alert.alert('Bantuan', 'Jika ada pertanyaan, hubungi support@zeko.com');
        break;
      case 'about':
        Alert.alert(
          'Tentang ZEKO',
          'ZEKO adalah aplikasi pembelajaran bicara untuk anak ADHD.\n\nVersi: 1.0.0\nDeveloper: ZEKO Team\n\n© 2024 ZEKO. All rights reserved.'
        );
        break;
    }
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            transform: [{ scale: scaleAnimation }],
            opacity: fadeAnimation,
          },
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.avatarBorder}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../../assets/images/Imron.png')}
              style={styles.avatar}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile?.level}</Text>
            </View>
          </View>
        </LinearGradient>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={16} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.profileInfo,
          {
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation }],
          },
        ]}
      >
        <Text style={styles.userName}>{userProfile?.name}</Text>
        <Text style={styles.userAge}>{userProfile?.age} tahun</Text>
        
        {/* Level Progress */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelTitle}>Level {userProfile?.level}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {userProfile?.totalPoints} poin
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <LinearGradient
          colors={['#4CAF50', '#8BC34A']}
          style={styles.statGradient}
        >
          <Ionicons name="flame" size={24} color="white" />
          <Text style={styles.statNumber}>{userProfile?.streakDays}</Text>
          <Text style={styles.statLabel}>Hari Berturut</Text>
        </LinearGradient>
      </View>

      <View style={styles.statCard}>
        <LinearGradient
          colors={['#2196F3', '#03DAC6']}
          style={styles.statGradient}
        >
          <Ionicons name="checkmark-done" size={24} color="white" />
          <Text style={styles.statNumber}>{userProfile?.totalActivities}</Text>
          <Text style={styles.statLabel}>Total Aktivitas</Text>
        </LinearGradient>
      </View>

      <View style={styles.statCard}>
        <LinearGradient
          colors={['#FF9800', '#FFC107']}
          style={styles.statGradient}
        >
          <Ionicons name="heart" size={24} color="white" />
          <Text style={styles.statNumber}>{userProfile?.favoriteActivity}</Text>
          <Text style={styles.statLabel}>Aktivitas Favorit</Text>
        </LinearGradient>
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      <Text style={styles.sectionTitle}>🏆 Badge Koleksi</Text>
      <View style={styles.badgesGrid}>
        {userProfile?.badges.map((badge, index) => (
          <Animated.View
            key={badge}
            style={[
              styles.badgeItem,
              {
                opacity: fadeAnimation,
                transform: [{
                  scale: scaleAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.badgeGradient}
            >
              <Ionicons 
                name={getBadgeIcon(badge) as any} 
                size={20} 
                color="white" 
              />
            </LinearGradient>
            <Text style={styles.badgeTitle}>{getBadgeTitle(badge)}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>⚙️ Pengaturan</Text>
      {profileSettings.map((setting) => (
        <View key={setting.id} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon as any} size={20} color="#667eea" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
            </View>
          </View>
          
          <View style={styles.settingRight}>
            {setting.type === 'switch' && (
              <TouchableOpacity
                style={[
                  styles.switch,
                  setting.value && styles.switchActive,
                ]}
                onPress={() => handleSettingToggle(setting.id, !setting.value)}
              >
                <View style={[
                  styles.switchThumb,
                  setting.value && styles.switchThumbActive,
                ]} />
              </TouchableOpacity>
            )}
            
            {setting.type === 'navigation' && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => handleSettingPress(setting)}
              >
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            )}
            
            {setting.type === 'info' && (
              <TouchableOpacity onPress={() => handleSettingPress(setting)}>
                <Ionicons name="information-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
          
          {/* Avatar Selection */}
          <Text style={styles.modalLabel}>Pilih Avatar:</Text>
          <View style={styles.avatarSelection}>
            {['avatar_1', 'avatar_2', 'avatar_3'].map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatar && styles.selectedAvatar,
                ]}
                onPress={() => setSelectedAvatar(avatar)}
              >
                <Image
                  source={require('../../../assets/images/Imron.png')}
                  style={styles.avatarOptionImage}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Name Input */}
          <Text style={styles.modalLabel}>Nama:</Text>
          <TextInput
            style={styles.modalInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Masukkan nama kamu"
            maxLength={20}
          />
          
          {/* Age Input */}
          <Text style={styles.modalLabel}>Umur:</Text>
          <TextInput
            style={styles.modalInput}
            value={editAge}
            onChangeText={setEditAge}
            placeholder="Masukkan umur kamu"
            keyboardType="numeric"
            maxLength={2}
          />
          
          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalSaveButton} onPress={saveProfile}>
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.modalSaveGradient}
              >
                <Text style={styles.modalSaveText}>Simpan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!userProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Memuat profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        {renderProfileHeader()}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatsCards()}
        {renderBadges()}
        {renderSettings()}
      </ScrollView>

      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
  },
  avatarWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userAge: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    width: '100%',
  },
  levelTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  badgesContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'center',
    marginBottom: 15,
    width: '22%',
  },
  badgeGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 10,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  navigationButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  avatarSelection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: '#667eea',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    padding: 15,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserProfileScreen;
