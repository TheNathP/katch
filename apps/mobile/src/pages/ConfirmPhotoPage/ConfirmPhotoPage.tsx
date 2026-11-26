import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { submitChallengePhoto, SubmitPhotoError, type SubmitPhotoErrorCode } from '@/data/challenge-attempt';
import { CaptureColors } from '@/styles/theme';

import { styles } from './ConfirmPhotoPage.styles';

/** Only local files produced by the camera or the photo library are accepted. */
const isLocalPhoto = (uri: unknown): uri is string =>
  typeof uri === 'string' && /^(file|content|ph):\/\//.test(uri);

const errorMessages: Record<SubmitPhotoErrorCode, string> = {
  attempt_limit_reached: 'Tu as utilisé tous tes essais du jour. Reviens demain pour une nouvelle couleur !',
  challenge_ended: 'Le défi du jour vient de se terminer. Découvre la nouvelle couleur sur l’accueil.',
  invalid_photo: 'Cette image n’a pas pu être analysée. Essaie avec une autre photo.',
  unknown: 'L’analyse a échoué. Vérifie ta connexion et réessaie.',
};

export default function ConfirmPhotoPage() {
  const { uri, takenAt } = useLocalSearchParams<{ uri?: string; takenAt?: string }>();
  const photoUri = isLocalPhoto(uri) ? uri : undefined;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const submission = useRef(false);

  const retake = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/defi');
  };

  const submit = async () => {
    if (!photoUri || submission.current) return;
    submission.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      const attempt = await submitChallengePhoto(photoUri, typeof takenAt === 'string' ? takenAt : null);
      router.replace({ pathname: '/defi/resultat', params: { attemptId: attempt.id } });
    } catch (cause) {
      setError(errorMessages[cause instanceof SubmitPhotoError ? cause.code : 'unknown']);
      submission.current = false;
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {!photoUri ? 'Photo introuvable' : submitting ? 'Analyse en cours…' : 'Cette photo te convient ?'}
        </Text>
        <Text style={styles.subtitle}>
          {!photoUri
            ? 'La photo n’a pas pu être chargée. Reprends-en une.'
            : submitting
              ? 'On cherche dans ta photo la couleur la plus proche de celle du jour.'
              : 'Vérifie que la couleur que tu vises est bien visible sur l’image.'}
        </Text>
        <View style={styles.photoCard}>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              contentFit="cover"
              accessibilityLabel="Photo à valider"
              style={styles.photo}
            />
          )}
          {submitting && (
            <View style={styles.analyzing}>
              <ActivityIndicator size="large" color={CaptureColors.accent} />
            </View>
          )}
        </View>
        {error && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={retake}
          style={({ pressed }) => [styles.secondary, (pressed || submitting) && styles.secondaryPressed]}>
          <Image
            source={require('@/assets/icons/refresh.svg')}
            contentFit="contain"
            tintColor={CaptureColors.foreground}
            style={styles.secondaryIcon}
          />
          <Text style={styles.secondaryLabel}>Refaire</Text>
        </Pressable>
        <Button
          label={submitting ? 'Analyse…' : 'Valider'}
          variant="limeSolid"
          disabled={!photoUri || submitting}
          onPress={() => void submit()}
          style={styles.primary}
        />
      </View>
    </SafeAreaView>
  );
}
