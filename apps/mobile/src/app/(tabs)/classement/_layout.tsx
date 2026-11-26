import { Stack } from 'expo-router';

export default function LeaderboardLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="amis" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="mondial" options={{ headerShown: false, animation: 'none' }} />
      <Stack.Screen name="hebdomadaire" options={{ title: 'Classement des séries' }} />
    </Stack>
  );
}
