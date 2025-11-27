import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/state/auth';
import Toast from '../src/components/Toast';
import { useCustomRouter } from '../src/hooks/useCustomRouter';

// ⭐ FONTS
import {
  useFonts,
  CormorantGaramond_700Bold
} from '@expo-google-fonts/cormorant-garamond';

import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold
} from '@expo-google-fonts/josefin-sans';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useCustomRouter();
  const { isAuthenticated, isGuest, user, loadUser } = useAuthStore();

  // ⭐ load fonts
  const [fontsLoaded] = useFonts({
    CormorantGaramond_700Bold,
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
  });

  // ⭐ load user
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await loadUser();
      } catch (err) {
        console.log(err);
      } finally {
        setUserLoaded(true);
      }
    }
    init();
  }, []);

  // ⭐ hide splash only when BOTH are ready
  useEffect(() => {
    if (fontsLoaded && userLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, userLoaded]);

  // ⭐ Only run navigation AFTER fonts + user are BOTH loaded
  useEffect(() => {
    if (!fontsLoaded || !userLoaded) return;

    if (isAuthenticated) {
      const done =
        user?.preferences &&
        (user.preferences.categories.length > 0 ||
          user.preferences.colors.length > 0 ||
          user.preferences.brands.length > 0);

      if (user?.role === 'vendor') {
        router.replace('/(vendor-tabs)/products');
      } else if (done) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    } else if (isGuest) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/login');
    }
  }, [fontsLoaded, userLoaded, isAuthenticated, isGuest, user]);

  // ⭐ prevent layout until everything is ready — BUT hooks already executed (safe)
  if (!fontsLoaded || !userLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
