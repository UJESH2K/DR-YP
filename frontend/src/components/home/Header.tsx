import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onLikedPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onNotificationsPress,
  onLikedPress,
}) => {
  const theme = useColorScheme();
  const light = theme !== 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: light ? '#111' : '#eee' }]}>
        DRYP
      </Text>
      <View style={styles.iconsContainer}>
        <Pressable 
          onPress={onSearchPress} 
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.5 : 1 }
          ]}
        >
          <Ionicons 
            name="search" 
            size={24} 
            color={light ? "#111" : "#eee"} 
          />
        </Pressable>
        
        <Pressable 
          onPress={onNotificationsPress}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.5 : 1 }
          ]}
        >
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={light ? "#111" : "#eee"} 
          />
        </Pressable>
        
        <Pressable 
          onPress={onLikedPress}
          style={({ pressed }) => [
            styles.iconButton,
            { opacity: pressed ? 0.5 : 1 }
          ]}
        >
          <Ionicons 
            name="heart-outline" 
            size={24} 
            color={light ? "#111" : "#eee"} 
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'JosefinSans_700Bold',
    letterSpacing: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
});