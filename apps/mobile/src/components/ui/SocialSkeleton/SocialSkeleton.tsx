import { View } from 'react-native';

import Skeleton, { SkeletonBlock } from '@/components/ui/Skeleton';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles as social } from '@/styles/social';

import { styles } from './SocialSkeleton.styles';

type Props = {
  label: string;
  variant?: 'list' | 'profile';
};

export default function SocialSkeleton({ label, variant = 'list' }: Props) {
  const theme = useTheme();
  const panel = { backgroundColor: theme.tabBarBackground, borderColor: theme.tabBarBorder };
  return (
    <Skeleton label={label}>
      <View style={social.section}>
        {variant === 'profile' && (
          <>
            <View style={[styles.profile, panel]}>
              <SkeletonBlock tone="contrast" style={styles.profileAvatar} />
              <SkeletonBlock tone="contrast" style={styles.profileName} />
              <SkeletonBlock tone="contrast" style={styles.profileStatus} />
            </View>
            <SkeletonBlock tone="contrast" style={styles.profileSubtitle} />
          </>
        )}
        {[0, 1].map(row => (
          <View key={row} style={[styles.row, variant === 'profile' && styles.result, panel]}>
            {variant === 'list' && <SkeletonBlock tone="contrast" style={styles.avatar} />}
            <View style={styles.lines}>
              <SkeletonBlock tone="contrast" style={[styles.name, row === 1 && styles.shortName]} />
              {variant === 'list' && <SkeletonBlock tone="contrast" style={styles.detail} />}
            </View>
            <SkeletonBlock tone="contrast" style={[styles.action, variant === 'profile' && styles.score]} />
          </View>
        ))}
      </View>
    </Skeleton>
  );
}
