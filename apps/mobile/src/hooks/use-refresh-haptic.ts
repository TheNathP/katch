import { AndroidHaptics, performAndroidHapticsAsync, selectionAsync } from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function useRefreshHaptic() {
  const reduceMotion = useReducedMotion();

  return useCallback(() => {
    if (reduceMotion) return;
    const feedback = Platform.OS === 'android'
      ? performAndroidHapticsAsync(AndroidHaptics.Gesture_End)
      : selectionAsync();
    void feedback.catch(() => {});
  }, [reduceMotion]);
}
