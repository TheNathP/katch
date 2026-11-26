import { Stack } from 'expo-router';

export default function LeaderboardLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Classement mondial' }} />
      <Stack.Screen name="amis" options={{ title: 'Classement entre amis' }} />
      <Stack.Screen name="hebdomadaire" options={{ title: 'Classement des séries' }} />
    </Stack>
  );
}
