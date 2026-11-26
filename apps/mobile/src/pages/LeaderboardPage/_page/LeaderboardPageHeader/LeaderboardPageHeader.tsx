import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { LeaderboardScope } from '@/data/api.types';
import { useTheme } from '@/hooks/use-theme';
import { ButtonTokens } from '@/styles/theme';

import LeaderboardPageHero from '../LeaderboardPageHero';
import { styles } from './LeaderboardPageHeader.styles';

const tabs = [
  { scope: 'friends', label: 'Entre amis', href: '/classement' },
  { scope: 'world', label: 'Mondial', href: '/classement/mondial' },
] as const;

export default function LeaderboardPageHeader({ scope }: { scope: LeaderboardScope }) {
  const theme = useTheme();

  return (
    <View>
      <LeaderboardPageHero />
      <View accessibilityRole="tablist" style={[styles.tabs, { backgroundColor: theme.dailySurface }]}>
        {tabs.map((tab) => {
          const selected = scope === tab.scope;
          return (
            <Pressable
              key={tab.scope}
              disabled={selected}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => router.replace(tab.href)}
              style={[styles.tab, selected && styles.selectedTab]}
            >
              <Text style={[styles.tabLabel, { color: selected ? ButtonTokens.limeSolid.foreground : theme.dailyMuted }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
