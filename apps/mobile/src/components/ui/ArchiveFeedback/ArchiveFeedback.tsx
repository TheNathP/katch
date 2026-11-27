import { Image } from 'expo-image';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Skeleton, { SkeletonBlock } from '@/components/ui/Skeleton';
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
  const card = [styles.card, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }];

  if (kind === 'loading') {
    return (
      <Skeleton label={title} style={[card, styles.stretch]}>
        <View style={styles.placeholder}>
          <SkeletonBlock style={styles.line} />
          <SkeletonBlock style={styles.block} />
        </View>
      </Skeleton>
    );
  }

  return (
    <View style={card}>
      <Image aria-hidden source={pix} style={styles.pix} contentFit="contain" />
      <ThemedText type="subtitle" themeColor="dailyInk" style={styles.center}>{title}</ThemedText>
      {detail && <ThemedText type="small" themeColor="dailyMuted" style={styles.center}>{detail}</ThemedText>}
      {action && <Button label={action.label} onPress={action.run} variant="primarySolid" />}
    </View>
  );
}
