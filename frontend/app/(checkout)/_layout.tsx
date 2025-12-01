import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack>
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="order-confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="select-address" options={{ headerShown: false }} />
      <Stack.Screen name="add-address" options={{ headerShown: false }} />
    </Stack>
  );
}
