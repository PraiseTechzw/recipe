import { Stack } from 'expo-router';

export default function AiChefLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="review" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
