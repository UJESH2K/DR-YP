import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/state/auth';
import Toast from '../src/components/Toast';
import { BackHandler } from 'react-native'; // Import BackHandler

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadUser();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      if (isAuthenticated) {
        const hasCompletedOnboarding =
          user?.preferences &&
          (user.preferences.categories.length > 0 ||
            user.preferences.colors.length > 0 ||
            user.preferences.brands.length > 0);

        if (user?.role === 'vendor') {
          router.replace('/(vendor-tabs)/products');
        } else if (hasCompletedOnboarding) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, appIsReady]);

  // Add BackHandler useEffect
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []); // Empty dependency array means this runs once on mount and unmount


  if (!appIsReady) {
    return null; // Or a loading indicator
  }

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