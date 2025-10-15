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

export default function ProfileScreen() {
  const router = useRouter()

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: '📦', onPress: () => {} },
    { id: 'addresses', title: 'Addresses', icon: '📍', onPress: () => {} },
    { id: 'payment', title: 'Payment Methods', icon: '💳', onPress: () => {} },
    { id: 'preferences', title: 'Style Preferences', icon: '⚙️', onPress: () => router.push('/onboarding') },
    { id: 'notifications', title: 'Notifications', icon: '🔔', onPress: () => {} },
    { id: 'help', title: 'Help & Support', icon: '❓', onPress: () => {} },
    { id: 'about', title: 'About DRYP', icon: 'ℹ️', onPress: () => {} },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CASA</Text>
        <Text style={styles.headerSubtitle}>Account</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>Welcome to CASA</Text>
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
    fontSize: 28,
    fontWeight: '300',
    color: '#000000',
    letterSpacing: 1,
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
