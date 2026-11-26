import { useThemePreference } from '@/data/theme-preference-provider';

export function useColorScheme() {
  return useThemePreference().scheme;
}
