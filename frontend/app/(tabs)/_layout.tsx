import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIcon = () => {
    switch (name) {
      case 'home':
        return '🏠'
      case 'search':
        return '🔍'
      case 'wishlist':
        return '🛒'
      case 'profile':
        return focused ? '❤️' : '🤍'
      default:
        return '•'
    }
  }

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.iconText, { color: focused ? '#000000' : '#666666' }]}>
        {getIcon()}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabBarIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Liked',
          tabBarIcon: ({ focused }) => <TabBarIcon name="wishlist" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
})
