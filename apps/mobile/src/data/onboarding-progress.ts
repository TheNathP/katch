import AsyncStorage from '@react-native-async-storage/async-storage';

const completionKey = 'katch:onboarding:completed';

export async function hasCompletedOnboarding() {
  return (await AsyncStorage.getItem(completionKey)) === 'true';
}

export async function completeOnboarding() {
  if (!__DEV__) await AsyncStorage.setItem(completionKey, 'true');
}
