import AsyncStorage from '@react-native-async-storage/async-storage';

const revealKey = 'katch:daily-color:revealed-date';

export async function isDailyColorRevealed(date: string) {
  return (await AsyncStorage.getItem(revealKey)) === date;
}

export async function rememberDailyColorReveal(date: string) {
  await AsyncStorage.setItem(revealKey, date);
}

export async function forgetDailyColorReveal() {
  await AsyncStorage.removeItem(revealKey);
}
