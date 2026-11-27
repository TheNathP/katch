import { router } from 'expo-router';
import { View } from 'react-native';

import SegmentedTabs from '@/components/ui/SegmentedTabs';
import type { LeaderboardScope } from '@/data/api.types';

import LeaderboardPageHero from '../LeaderboardPageHero';
import { styles } from './LeaderboardPageHeader.styles';

const tabs = [
  { value: 'friends', label: 'Entre amis' },
  { value: 'world', label: 'Mondial' },
] as const;

const routes = {
  friends: '/classement',
  world: '/classement/mondial',
} as const;

export default function LeaderboardPageHeader({ scope }: { scope: LeaderboardScope }) {
  return (
    <View>
      <LeaderboardPageHero />
      <SegmentedTabs
        label="Type de classement"
        options={tabs}
        value={scope}
        onChange={value => router.replace(routes[value])}
        variant="gradient"
        style={styles.tabs}
      />
    </View>
  );
}
