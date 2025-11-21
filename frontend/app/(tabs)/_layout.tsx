import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/state/auth';

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIcon = () => {
    switch (name) {
      case 'home':
        return focused ? 'home' : 'home-outline';
      case 'search':
        return focused ? 'search' : 'search-outline';
      case 'wishlist':
        return focused ? 'heart' : 'heart-outline';
      case 'cart':
        return focused ? 'cart' : 'cart-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'ellipse';
    }
  };

  return (
    <Ionicons
      name={getIcon()}
      size={26}
      color={focused ? '#000' : '#888'}
      style={{ marginBottom: -3 }}
    />
  );
}

export default function TabLayout() {
  const { user } = useAuthStore();

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
          title: 'Wishlist',
          tabBarIcon: ({ focused }) => <TabBarIcon name="wishlist" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabBarIcon name="cart" focused={focused} />,
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
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
});