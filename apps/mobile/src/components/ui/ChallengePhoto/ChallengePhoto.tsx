import { Image } from 'expo-image';
import { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './ChallengePhoto.styles';

const camera = require('@/assets/icons/camera.svg');

export default function ChallengePhoto({ uri, hex, style, label, full = false }: {
  uri: string | null;
  hex?: string | null;
  style?: StyleProp<ViewStyle>;
  label?: string;
  full?: boolean;
}) {
  const theme = useTheme();
  const [failedUri, setFailedUri] = useState<string>();
  const canShow = !!uri && uri !== failedUri;

  return (
    <View style={[styles.photo, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }, style]}>
      {canShow ? (
        <Image
          source={{ uri }}
          recyclingKey={uri}
          contentFit={full ? 'contain' : 'cover'}
          cachePolicy="memory"
          transition={150}
          style={styles.fill}
          accessibilityLabel={label}
          aria-hidden={!label}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View style={styles.fallback}>
          {hex && <View aria-hidden style={[styles.color, { backgroundColor: hex }]} />}
          <Image aria-hidden source={camera} contentFit="contain" tintColor={theme.dailyMuted} style={styles.icon} />
          {label && <ThemedText type="small" themeColor="dailyMuted">Photo indisponible</ThemedText>}
        </View>
      )}
    </View>
  );
}
