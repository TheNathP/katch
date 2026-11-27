import { Image } from 'expo-image';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './ArchiveFeedback.styles';

const pix = require('@/assets/images/pix/confident.png');

export default function ArchiveFeedback({ kind, title, detail, action }: {
  kind: 'loading' | 'empty' | 'error';
  title: string;
  detail?: string;
  action?: { label: string; run(): void };
}) {
  const theme = useTheme();
  return (
    <View
      accessible={kind === 'loading' || undefined}
      accessibilityLabel={kind === 'loading' ? title : undefined}
      accessibilityState={kind === 'loading' ? { busy: true } : undefined}
      style={[styles.card, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
      {kind === 'loading' ? (
        <>
          <View aria-hidden style={[styles.line, { backgroundColor: theme.dailySurface }]} />
          <View aria-hidden style={[styles.block, { backgroundColor: theme.dailySurface }]} />
        </>
      ) : (
        <>
          <Image aria-hidden source={pix} style={styles.pix} contentFit="contain" />
          <ThemedText type="subtitle" themeColor="dailyInk" style={styles.center}>{title}</ThemedText>
          {detail && <ThemedText type="small" themeColor="dailyMuted" style={styles.center}>{detail}</ThemedText>}
          {action && <Button label={action.label} onPress={action.run} variant="primarySolid" />}
        </>
      )}
    </View>
  );
}
