import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="addresses" options={{ headerShown: false }} />
      <Stack.Screen name="edit-address" options={{ headerShown: false }} />
      <Stack.Screen name="add-address" options={{ headerShown: false }} />
      <Stack.Screen name="add-payment-method" options={{ headerShown: false }} />
      <Stack.Screen name="edit-payment-method" options={{ headerShown: false }} />
    </Stack>
  );
}
