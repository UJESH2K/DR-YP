import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomRouter } from '../../src/hooks/useCustomRouter';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../src/state/auth';
import { useFonts } from 'expo-font';
import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
} from '@expo-google-fonts/josefin-sans';
import {
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

// ===================== PROFILE SCREEN =====================
export default function ProfileScreen() {
  const router = useCustomRouter();
  const { user, isAuthenticated, isGuest, guestId, logout } = useAuthStore();

  // Load fonts
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: <MaterialIcons name="local-shipping" size={22} color="#000" />, onPress: () => router.push('/account/orders') },
    { id: 'addresses', title: 'Addresses', icon: <Ionicons name="location-outline" size={22} color="#000" />, onPress: () => router.push('/account/addresses') },
    { id: 'payment', title: 'Payment Methods', icon: <Ionicons name="card-outline" size={22} color="#000" />, onPress: () => router.push('/account/payment') },
    { id: 'settings', title: 'Settings', icon: <Feather name="settings" size={22} color="#000" />, onPress: () => router.push('/account/settings') },
    { id: 'style', title: 'Style Preference', icon: <Ionicons name="shirt-outline" size={22} color="#000" />, onPress: () => router.push('/account/style') },
    { id: 'notifications', title: 'Notifications', icon: <Ionicons name="notifications-outline" size={22} color="#000" />, onPress: () => router.push('/account/notifications') },
    { id: 'help', title: 'Help & Support', icon: <Feather name="help-circle" size={22} color="#000" />, onPress: () => router.push('/account/help') },
    { id: 'about', title: 'About', icon: <Ionicons name="information-circle-outline" size={22} color="#000" />, onPress: () => router.push('/account/about') },
  ];

  // Show loader while fonts load
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // =============== GUEST VIEW ===============
  if (isGuest && !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarLetter}>G</Text>
            </View>

            <Text style={styles.profileName}>Guest User</Text>
            {guestId && <Text style={styles.profileEmail}>ID: {guestId}</Text>}
          </View>

          <View style={styles.menuSection}>
            <Pressable style={styles.menuItem} onPress={() => router.push('/account/orders')}>
              <View style={styles.rowLeft}>
                <MaterialIcons name="local-shipping" size={22} color="#000" />
                <Text style={styles.menuItemTitle}>My Orders</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.guestBox}>
            <Text style={styles.guestText}>Save your orders & preferences</Text>
            <Pressable style={styles.signInButton} onPress={() => router.push('/login')}>
              <Text style={styles.signInText}>Sign In / Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =============== AUTH VIEW ===============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>

        {/* MINIMAL CART ICON (replaces emoji) */}
        <Pressable onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.profileSection} onPress={() => router.push('/account/profile')}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Pressable>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <Pressable key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.rowLeft}>
                {item.icon}
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.signOutBox}>
          <Pressable style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============== STYLES ===============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'JosefinSans_400Regular',
  },

  // HEADER
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: '#000',
    fontFamily: 'JosefinSans_600SemiBold',
  },

  // PROFILE SECTION
  profileSection: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  avatarSmall: {
    width: 72,
    height: 72,
    borderRadius: 40,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond_700Bold',
    color: '#000',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'JosefinSans_600SemiBold',
    color: '#000',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
    fontFamily: 'JosefinSans_400Regular',
  },

  // MENU SECTION
  menuSection: {
    marginTop: 10,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemTitle: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'JosefinSans_500Medium',
  },
  arrow: {
    fontSize: 20,
    color: '#bbb',
  },

  // SIGN OUT
  signOutBox: {
    padding: 20,
  },
  signOutButton: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: 'JosefinSans_600SemiBold',
    fontSize: 15,
    color: '#ff3b30',
  },

  // GUEST CTA
  guestBox: {
    padding: 30,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 15,
    fontFamily: 'JosefinSans_400Regular',
    color: '#555',
    marginBottom: 14,
  },
  signInButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  signInText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'JosefinSans_600SemiBold',
  },
});
