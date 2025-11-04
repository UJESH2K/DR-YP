import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter()

const menuItems = [
  { id: 'orders', title: 'My Orders', icon: <MaterialIcons name="local-shipping" size={22} color="#000" />, onPress: () => router.push('/account/orders') },
  { id: 'addresses', title: 'Addresses', icon: <Ionicons name="location-outline" size={22} color="#000" />, onPress: () => router.push('/account/addresses') },
  { id: 'payment', title: 'Payment Methods', icon: <Ionicons name="card-outline" size={22} color="#000" />, onPress: () => router.push('/account/payment') },
  { id: 'style', title: 'Style Preference', icon: <Ionicons name="shirt-outline" size={22} color="#000" />, onPress: () => router.push('/account/style') },
  { id: 'notifications', title: 'Notifications', icon: <Ionicons name="notifications-outline" size={22} color="#000" />, onPress: () => router.push('/account/notifications') },
  { id: 'help', title: 'Help & Support', icon: <Feather name="help-circle" size={22} color="#000" />, onPress: () => router.push('/account/help') },
  { id: 'about', title: 'About', icon: <Ionicons name="information-circle-outline" size={22} color="#000" />, onPress: () => router.push('/account/about') },
];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 10,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eaeaea',
        }}
      >
        {/* Logo */}
        <Text
          style={{
            fontSize: 33,
            fontWeight: '00',
            color: '#000',
            letterSpacing: 1.5,
          }}
        >
          DRYP
        </Text>

        {/* Account Text */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
            letterSpacing: 0.5,
          }}
        >
          Account
        </Text>

        {/* Cart Icon */}
        <Pressable>
          <Text style={{ fontSize: 31, color: '#000' }}>🛒</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>Welcome to DRYP</Text>
          <Text style={styles.profileEmail}>Discover your style</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Pressable style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
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
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 0,
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
    paddingTop: 40,
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
})
