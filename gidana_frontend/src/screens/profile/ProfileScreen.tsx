import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { 
  Alert, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Avatar, Button, Divider, Text, ActivityIndicator } from 'react-native-paper';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../utils/theme';

function GuestProfilePrompt() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={guestStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={guestStyles.content}>
        <View style={guestStyles.iconContainer}>
          <Ionicons name="person-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={guestStyles.title}>Connectez-vous à votre compte</Text>
        <Text style={guestStyles.sub}>
          Accédez à votre profil, vos annonces et vos favoris
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Login')} 
          style={guestStyles.btn}
          buttonColor={COLORS.primary}
          labelStyle={guestStyles.btnLabel}
        >
          Se connecter
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('Register')} 
          style={guestStyles.regBtn} 
          textColor={COLORS.primary}
          labelStyle={guestStyles.btnLabel}
        >
          Créer un compte
        </Button>
      </View>
    </SafeAreaView>
  );
}

const guestStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#333', 
    textAlign: 'center',
  },
  sub: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 8,
    lineHeight: 20,
  },
  btn: { 
    width: '100%', 
    borderRadius: 12,
    marginTop: 8,
  },
  btnLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    paddingVertical: 4,
  },
  regBtn: { 
    width: '100%', 
    borderRadius: 12,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
});

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  async function handlePickAvatar() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour changer votre photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (result.canceled) return;

    setUploading(true);
    const uri = result.assets[0].uri;
    const ext = uri.split('.').pop() ?? 'jpg';
    const formData = new FormData();
    formData.append('picture', { 
      uri, 
      type: `image/${ext}`, 
      name: `avatar_${Date.now()}.${ext}` 
    } as any);

    try {
      const { data } = await apiClient.post('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data);
      Alert.alert('Succès', 'Photo de profil mise à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Déconnexion', 
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  }

  if (!user) return <GuestProfilePrompt />;

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).getFullYear() : '2024';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handlePickAvatar} 
            disabled={uploading}
            style={styles.avatarContainer}
            activeOpacity={0.8}
          >
            {uploading ? (
              <View style={[styles.avatar, styles.avatarUploading]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : user.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <Avatar.Text 
                size={80} 
                label={initials} 
                style={{ backgroundColor: COLORS.primary }} 
                labelStyle={{ fontSize: 32, fontFamily: 'Poppins-Bold' }}
              />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.name}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.memberSince}>
            Membre depuis {memberSince}
          </Text>
          <Text style={styles.contactInfo}>
            {user.email || user.phone_number}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Propriétés</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyProperties')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="home-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes annonces</Text>
              <Text style={styles.menuDescription}>Gérer mes propriétés</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyRentals')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="key-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes locations</Text>
              <Text style={styles.menuDescription}>Voir mes locations en cours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Mes favoris</Text>
              <Text style={styles.menuDescription}>Propriétés sauvegardées</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Paramètres du compte</Text>
              <Text style={styles.menuDescription}>Modifier mes informations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: { 
    alignItems: 'center', 
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50,
  },
  avatarUploading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', 
    bottom: 0, 
    right: 0,
    backgroundColor: COLORS.primary, 
    borderRadius: 15, 
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { 
    fontSize: 24, 
    fontFamily: 'Poppins-Bold', 
    color: '#333',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 4,
  },
  contactInfo: { 
    fontFamily: 'Poppins-Regular',
    fontSize: 14, 
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
  },
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  divider: {
    backgroundColor: '#e9ecef',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ef4444',
  },
});