import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../state/toast';

const Toast = () => {
  const { message, type, isVisible, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: insets.top + 20,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, insets.top, hideToast, translateY]);

  if (!isVisible) return null;

  const backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
  const icon = type === 'success' ? 'checkmark-circle' : 'alert-circle';

  return (
    <Animated.View style={[styles.container, { backgroundColor, transform: [{ translateY }] }]}>
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
  },
  message: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Toast;