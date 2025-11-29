// hooks/useFonts.js
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JosefinSans_400Regular,
  JosefinSans_500Medium,
  JosefinSans_600SemiBold,
} from '@expo-google-fonts/josefin-sans';
import {
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JosefinSans_400Regular,
    JosefinSans_500Medium,
    JosefinSans_600SemiBold,
    CormorantGaramond_700Bold,
  });

  return { fontsLoaded, fontError };
}