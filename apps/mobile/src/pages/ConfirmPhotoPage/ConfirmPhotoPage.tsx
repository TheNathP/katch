import { Image, type ImageLoadEventData } from 'expo-image';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { submitChallengePhoto, SubmitPhotoError, type ChallengeAttempt, type SubmitPhotoErrorCode } from '@/data/challenge-attempt';
import { discardChallengePhotoDraft, getChallengePhotoDraft } from '@/data/challenge-photo-draft';
import { useSession } from '@/data/session-provider';
import { useTheme } from '@/hooks/use-theme';

import ConfirmPhotoPageScan from './_page/ConfirmPhotoPageScan';
import { styles } from './ConfirmPhotoPage.styles';

const errorMessages: Record<SubmitPhotoErrorCode, string> = {
  challenge_ended: 'Le défi du jour vient de se terminer. Découvre la nouvelle couleur sur l’accueil.',
  invalid_photo: 'Cette image n’a pas pu être analysée. Essaie avec une autre photo.',
  photo_unreadable: 'Impossible de lire la photo. Reprends-en une ou importe une autre image.',
  unknown: 'Impossible de valider la photo. Réessaie.',
};

export default function ConfirmPhotoPage() {
  const theme = useTheme();
  const photoSurface = { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder };
  const { user } = useSession();
  const { photoId } = useLocalSearchParams<{ photoId?: string }>();
  const photo = typeof photoId === 'string' ? getChallengePhotoDraft(photoId) : undefined;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [previewErrorId, setPreviewErrorId] = useState<string>();
  const previewFailed = !!photo && previewErrorId === photo.id;
  const [attempt, setAttempt] = useState<ChallengeAttempt>();
  const [analysisFrame, setAnalysisFrame] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<{ id: string; width: number; height: number }>();
  const submission = useRef<AbortController | null>(null);

  useFocusEffect(useCallback(() => () => {
    submission.current?.abort();
    submission.current = null;
  }, []));

  const rememberSize = ({ source }: ImageLoadEventData) => {
    if (photo && source.width > 0 && source.height > 0) {
      setImageSize({ id: photo.id, width: source.width, height: source.height });
    }
  };

  const showOutcome = useCallback(() => {
    if (!photo || !attempt || submission.current?.signal.aborted || !submission.current) return;
    discardChallengePhotoDraft(photo.id);
    router.replace({ pathname: '/defi/resultat', params: { attemptId: attempt.id } });
  }, [attempt, photo]);

  const retake = () => {
    if (photo) discardChallengePhotoDraft(photo.id);
    if (router.canGoBack()) router.back();
    else router.replace('/defi');
  };

  const submit = async () => {
    if (!user || !photo || previewFailed || submission.current) return;
    const controller = new AbortController();
    submission.current = controller;
    setSubmitting(true);
    setError(undefined);
    try {
      const result = await submitChallengePhoto(photo.uri, photo.takenAt, user.id, controller.signal);
      if (!controller.signal.aborted) setAttempt(result);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(errorMessages[cause instanceof SubmitPhotoError ? cause.code : 'unknown']);
      submission.current = null;
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.dailyCanvas }]}>
      <Stack.Screen options={{ headerShown: !submitting }} />
      {submitting && photo ? (
        <SafeAreaView style={styles.analysis}>
          <View
            style={[styles.analysisFrame, photoSurface]}
            onLayout={({ nativeEvent: { layout } }) => {
              setAnalysisFrame({ width: layout.width, height: layout.height });
            }}>
            <Image
              source={{ uri: photo.uri }}
              contentFit="contain"
              accessibilityLabel="Photo en cours d’analyse"
              style={styles.photo}
              onLoad={rememberSize}
            />
            <ConfirmPhotoPageScan
              frame={analysisFrame}
              photoSize={imageSize?.id === photo.id ? imageSize : undefined}
              attempt={attempt}
              onComplete={showOutcome}
            />
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.dailyInk }]}>
              {photo ? 'Cette photo te convient ?' : 'Photo introuvable'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.dailyMuted }]}>
              {photo
                ? 'Vérifie que la couleur que tu vises est bien visible sur l’image.'
                : 'La photo n’a pas pu être chargée. Reprends-en une.'}
            </Text>
            <View style={[styles.photoCard, photoSurface]}>
              {photo && (
                <Image
                  source={{ uri: photo.uri }}
                  contentFit="contain"
                  accessibilityLabel="Photo à valider"
                  style={styles.photo}
                  onLoad={rememberSize}
                  onError={() => setPreviewErrorId(photo.id)}
                />
              )}
            </View>
            {(previewFailed || error) && (
              <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.danger }]}>
                {previewFailed ? errorMessages.photo_unreadable : error}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={retake}
              style={({ pressed }) => [styles.secondary, { backgroundColor: pressed ? theme.dailySurface : theme.dailyCard, borderColor: theme.dailyBorder }]}>
              <Image
                source={require('@/assets/icons/refresh.svg')}
                contentFit="contain"
                tintColor={theme.dailyInk}
                style={styles.secondaryIcon}
              />
              <Text style={[styles.secondaryLabel, { color: theme.dailyInk }]}>Refaire</Text>
            </Pressable>
            <Button
              label="Valider"
              variant="primarySolid"
              disabled={!photo || previewFailed}
              onPress={() => void submit()}
              style={styles.primary}
            />
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
