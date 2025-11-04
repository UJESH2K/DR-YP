import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

type Notification = {
  id: string
  title: string
  message: string
  time: string
  type: 'order' | 'promotion' | 'system'
  read: boolean
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped and is on its way!',
      time: '2 hours ago',
      type: 'order',
      read: false,
    },
    {
      id: '2',
      title: 'Flash Sale Alert',
      message: '50% off on all DRYP Essentials. Limited time offer!',
      time: '4 hours ago',
      type: 'promotion',
      read: false,
    },
    {
      id: '3',
      title: 'Welcome to DRYP',
      message: 'Thanks for joining DRYP! Discover your perfect style.',
      time: '1 day ago',
      type: 'system',
      read: true,
    },
    {
      id: '4',
      title: 'New Arrivals',
      message: 'Check out the latest collection from DRYP Street',
      time: '2 days ago',
      type: 'promotion',
      read: true,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦'
      case 'promotion': return '🏷️'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return '#10B981'
      case 'promotion': return '#F59E0B'
      case 'system': return '#6B7280'
      default: return '#6B7280'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadItem
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.typeIndicator}>
                  <Text style={styles.typeIcon}>{getTypeIcon(notification.type)}</Text>
                  <View 
                    style={[
                      styles.typeDot, 
                      { backgroundColor: getTypeColor(notification.type) }
                    ]} 
                  />
                </View>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              
              <Text style={[
                styles.notificationTitle,
                !notification.read && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
              
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              
              {!notification.read && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
          </Pressable>
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 24,
    color: '#111111',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  unreadItem: {
    backgroundColor: '#f8fafc',
  },
  notificationContent: {
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0A84FF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
})
