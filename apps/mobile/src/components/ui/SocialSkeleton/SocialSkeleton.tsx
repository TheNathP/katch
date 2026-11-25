import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { socialStyles as social } from '@/styles/social';

import { styles } from './SocialSkeleton.styles';

type Props = {
  label: string;
  variant?: 'list' | 'profile' | 'form';
};

export default function SocialSkeleton({ label, variant = 'list' }: Props) {
  const theme = useTheme();
  const panel = { backgroundColor: theme.tabBarBackground, borderColor: theme.tabBarBorder };
  const block = { backgroundColor: theme.backgroundSelected };

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }}>
      <View aria-hidden style={social.section}>
        {variant === 'form' ? (
          <>
            <View style={[styles.label, block]} />
            <View style={[styles.caption, block]} />
            <View style={[social.input, panel]} />
            <View style={[styles.formButton, block]} />
          </>
        ) : (
          <>
            {variant === 'profile' && (
              <>
                <View style={[styles.profile, panel]}>
                  <View style={[styles.profileAvatar, block]} />
                  <View style={[styles.profileName, block]} />
                  <View style={[styles.profileStatus, block]} />
                </View>
                <View style={[styles.profileSubtitle, block]} />
              </>
            )}
            {[0, 1].map(row => (
              <View key={row} style={[styles.row, variant === 'profile' && styles.result, panel]}>
                {variant === 'list' && <View style={[styles.avatar, block]} />}
                <View style={styles.lines}>
                  <View style={[styles.name, row === 1 && styles.shortName, block]} />
                  {variant === 'list' && <View style={[styles.detail, block]} />}
                </View>
                <View style={[styles.action, variant === 'profile' && styles.score, block]} />
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
