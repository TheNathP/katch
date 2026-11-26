import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { challengePhotoImageSource, type ChallengePhotoSource } from '@/lib/challenge-photo';

import { styles } from './ChallengePhoto.styles';

const camera = require('@/assets/icons/camera.svg');

export default function ChallengePhoto({ photo, hex, style, label, full = false, onRetry, reloading = false }: {
  photo: ChallengePhotoSource | null;
  hex?: string | null;
  style?: StyleProp<ViewStyle>;
  label?: string;
  full?: boolean;
  onRetry?: () => void | Promise<void>;
  reloading?: boolean;
}) {
  const theme = useTheme();
  const [failedUri, setFailedUri] = useState<string>();
  const autoRetriedPhoto = useRef<string | null>(null);
  const canShow = !!photo && photo.uri !== failedUri;
  const source = canShow ? challengePhotoImageSource(photo, full ? 'detail' : 'preview') : undefined;

  function handlePhotoError(failed: ChallengePhotoSource) {
    setFailedUri(failed.uri);
    if (onRetry && autoRetriedPhoto.current !== failed.identity) {
      autoRetriedPhoto.current = failed.identity;
      void onRetry();
    }
  }

  async function retryPhoto() {
    await onRetry?.();
    setFailedUri(undefined);
  }

  return (
    <View style={[styles.photo, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }, style]}>
      {hex && <View aria-hidden style={[styles.color, { backgroundColor: hex }]} />}
      {source && photo ? (
        <Image
          source={source}
          recyclingKey={source.cacheKey}
          contentFit={full ? 'contain' : 'cover'}
          cachePolicy="memory"
          allowDownscaling
          enforceEarlyResizing={!full}
          priority={full ? 'high' : 'normal'}
          transition={120}
          style={styles.fill}
          accessible={!!label}
          accessibilityLabel={label}
          aria-hidden={!label}
          onError={() => handlePhotoError(photo)}
        />
      ) : (
        <View style={styles.fallback}>
          <Image aria-hidden source={camera} contentFit="contain" tintColor={theme.dailyMuted} style={styles.icon} />
          {label && <ThemedText type="small" themeColor="dailyMuted">Photo indisponible</ThemedText>}
          {onRetry && (
            <Pressable accessibilityRole="button" disabled={reloading} onPress={() => void retryPhoto()} style={styles.retry}>
              <ThemedText type="smallBold" themeColor="dailyAccent">
                {reloading ? 'Rechargement…' : 'Réessayer la photo'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
