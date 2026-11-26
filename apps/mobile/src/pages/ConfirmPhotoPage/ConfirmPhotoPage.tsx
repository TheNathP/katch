import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { submitChallengePhoto, SubmitPhotoError, type SubmitPhotoErrorCode } from '@/data/challenge-attempt';
import { discardChallengePhotoDraft, getChallengePhotoDraft } from '@/data/challenge-photo-draft';
import { CaptureColors } from '@/styles/theme';

import { styles } from './ConfirmPhotoPage.styles';

const errorMessages: Record<SubmitPhotoErrorCode, string> = {
  challenge_ended: 'Le défi du jour vient de se terminer. Découvre la nouvelle couleur sur l’accueil.',
  invalid_photo: 'Cette image n’a pas pu être analysée. Essaie avec une autre photo.',
  photo_unreadable: 'Impossible de lire la photo. Reprends-en une ou importe une autre image.',
  unknown: 'Impossible de valider la photo. Réessaie.',
};

export default function ConfirmPhotoPage() {
  const { photoId } = useLocalSearchParams<{ photoId?: string }>();
  const photo = typeof photoId === 'string' ? getChallengePhotoDraft(photoId) : undefined;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [previewErrorId, setPreviewErrorId] = useState<string>();
  const previewFailed = !!photo && previewErrorId === photo.id;
  const submission = useRef(false);

  const retake = () => {
    if (photo) discardChallengePhotoDraft(photo.id);
    if (router.canGoBack()) router.back();
    else router.replace('/defi');
  };

  const submit = async () => {
    if (!photo || previewFailed || submission.current) return;
    submission.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      const attempt = await submitChallengePhoto(photo.uri, photo.takenAt);
      discardChallengePhotoDraft(photo.id);
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
          {!photo ? 'Photo introuvable' : submitting ? 'Analyse en cours…' : 'Cette photo te convient ?'}
        </Text>
        <Text style={styles.subtitle}>
          {!photo
            ? 'La photo n’a pas pu être chargée. Reprends-en une.'
            : submitting
              ? 'On cherche dans ta photo la couleur la plus proche de celle du jour.'
              : 'Vérifie que la couleur que tu vises est bien visible sur l’image.'}
        </Text>
        <View style={styles.photoCard}>
          {photo && (
            <Image
              source={{ uri: photo.uri }}
              contentFit="cover"
              accessibilityLabel="Photo à valider"
              style={styles.photo}
              onError={() => setPreviewErrorId(photo.id)}
            />
          )}
          {submitting && (
            <View style={styles.analyzing}>
              <ActivityIndicator size="large" color={CaptureColors.accent} />
            </View>
          )}
        </View>
        {(previewFailed || error) && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {previewFailed ? errorMessages.photo_unreadable : error}
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
          disabled={!photo || previewFailed || submitting}
          onPress={() => void submit()}
          style={styles.primary}
        />
      </View>
    </SafeAreaView>
  );
}
