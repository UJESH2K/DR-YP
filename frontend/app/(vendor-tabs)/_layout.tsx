import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIcon = () => {
    switch (name) {
      case 'products':
        return focused ? 'list-circle' : 'list-circle-outline';
      case 'orders':
        return focused ? 'receipt' : 'receipt-outline';
      case 'analytics':
        return focused ? 'analytics' : 'analytics-outline';
      case 'settings':
        return focused ? 'settings' : 'settings-outline';
      default:
        return 'ellipse';
    }
  };

  return <Ionicons name={getIcon()} size={26} color={focused ? '#1a1a1a' : '#888'} />;
}

export default function VendorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a1a1a',
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => <TabBarIcon name="products" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabBarIcon name="orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => <TabBarIcon name="analytics" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
