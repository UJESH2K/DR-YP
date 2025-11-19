import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../src/state/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)/home'); // Go to home after logout
        },
      },
    ]);
  };

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: <MaterialIcons name="local-shipping" size={22} color="#000" />, onPress: () => router.push('/account/orders') },
    { id: 'addresses', title: 'Addresses', icon: <Ionicons name="location-outline" size={22} color="#000" />, onPress: () => router.push('/account/addresses') },
    { id: 'payment', title: 'Payment Methods', icon: <Ionicons name="card-outline" size={22} color="#000" />, onPress: () => router.push('/account/payment') },
    { id: 'style', title: 'Style Preference', icon: <Ionicons name="shirt-outline" size={22} color="#000" />, onPress: () => router.push('/account/style') },
    { id: 'notifications', title: 'Notifications', icon: <Ionicons name="notifications-outline" size={22} color="#000" />, onPress: () => router.push('/account/notifications') },
    { id: 'help', title: 'Help & Support', icon: <Feather name="help-circle" size={22} color="#000" />, onPress: () => router.push('/account/help') },
    { id: 'about', title: 'About', icon: <Ionicons name="information-circle-outline" size={22} color="#000" />, onPress: () => router.push('/account/about') },
  ];

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.guestHeader}>
          <Text style={styles.guestHeaderText}>Account</Text>
        </View>
        <View style={styles.guestView}>
          <Text style={styles.profileName}>Welcome to DR-YP</Text>
          <Text style={styles.guestSubtitle}>Sign in to manage your orders, wishlist, and more.</Text>
          <Pressable style={styles.signInButton} onPress={() => router.push('/login')}>
            <Text style={styles.signInButtonText}>Sign In or Create Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <Pressable onPress={() => router.push('/cart')}>
          <Text style={{ fontSize: 31, color: '#000' }}>🛒</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.profileSection} onPress={() => router.push('/account/profile')}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Pressable>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <Pressable key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.signOutSection}>
          <Pressable style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#cccccc',
    fontWeight: '300',
  },
  signOutSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  signOutButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  // Guest view styles
  guestHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  guestHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  guestView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
