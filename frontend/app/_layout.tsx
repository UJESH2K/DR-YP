import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/state/auth';
import Toast from '../src/components/Toast';
import { useCustomRouter } from '../src/hooks/useCustomRouter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isGuest, user, loadUser } = useAuthStore();
  const [appIsReady, setAppIsReady] = React.useState(false);
  const router = useCustomRouter();

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
      } else if (isGuest) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isGuest, user, appIsReady]);


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
