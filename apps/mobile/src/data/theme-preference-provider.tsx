import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, use, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

const storageKey = 'katch:theme-preference';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceState = {
  ready: boolean;
  preference: ThemePreference;
  scheme: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemePreferenceContext = createContext<ThemePreferenceState>({
  ready: false, preference: 'system', scheme: 'light',
  setPreference: async () => {},
});

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setValue] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then(value => {
      if (active && (value === 'light' || value === 'dark')) setValue(value);
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function setPreference(next: ThemePreference) {
    await AsyncStorage.setItem(storageKey, next);
    setValue(next);
  }

  const scheme = preference === 'system' ? systemScheme === 'dark' ? 'dark' : 'light' : preference;
  return (
    <ThemePreferenceContext value={{ ready, preference, scheme, setPreference }}>
      {children}
    </ThemePreferenceContext>
  );
}

export function useThemePreference() {
  return use(ThemePreferenceContext);
}
