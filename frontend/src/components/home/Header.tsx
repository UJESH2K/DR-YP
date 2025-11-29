import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ onSearchPress, onNotificationsPress, onLikedPress }) {
  const theme = useColorScheme();
  const light = theme !== "dark";

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: light ? "#111" : "#eee",
            fontFamily: "JosefinSans_600SemiBold", // SAME AS LOGIN
          }
        ]}
      >
        DRYP
      </Text>

      <View style={styles.iconsContainer}>
        <Pressable onPress={onSearchPress} style={styles.iconButton}>
          <Ionicons name="search" size={24} color={light ? "#111" : "#eee"} />
        </Pressable>

        <Pressable onPress={onNotificationsPress} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={light ? "#111" : "#eee"} />
        </Pressable>

        <Pressable onPress={onLikedPress} style={styles.iconButton}>
          <Ionicons name="heart-outline" size={24} color={light ? "#111" : "#eee"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  // ⭐ EXACT SAME FEEL AS LOGIN PAGE DRYP
  title: {
    fontSize: 42,              // From Login fontSize: 48 (slightly reduced for header)
    letterSpacing: 3,          // Same as login
    fontFamily: "JosefinSans_600SemiBold",
  },

  iconsContainer: {
    flexDirection: 'row',
    gap: 16,
  },

  iconButton: {
    padding: 4,
  },
});
