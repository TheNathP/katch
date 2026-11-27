import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import ChallengePhoto from '@/components/ui/ChallengePhoto';
import Dialog from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import PhotoReactionBadge from '@/components/ui/PhotoReactionBadge';
import PixReactionBar from '@/components/ui/PixReactionBar';
import ThemedText from '@/components/ui/ThemedText';
import type { FriendResult, PixReaction } from '@/data/social-api.types';
import { useTheme } from '@/hooks/use-theme';
import { formatChallengeDay, formatChallengeScore, formatCompactChallengeDay } from '@/lib/challenge-calendar';
import { readChallengePhotoSource } from '@/lib/challenge-photo';

import { styles } from './PlayerProfileResult.styles';

type Props = {
  result: FriendResult;
  viewerId: string;
  canReact: boolean;
  wide: boolean;
  busy: boolean;
  error?: string;
  onReact: (reaction: PixReaction | null) => Promise<boolean>;
  onReload: () => void;
};

export default function PlayerProfileResult({ result, viewerId, canReact, wide, busy, error, onReact, onReload }: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [preview, setPreview] = useState(false);
  const day = formatChallengeDay(result.date);
  const score = formatChallengeScore(result.score);
  const photo = result.photo?.status === 'available' ? result.photo : undefined;
  const source = photo ? readChallengePhotoSource(photo.url) : null;
  const scopedSource = source && { ...source, identity: viewerId + ':' + source.identity };
  const closePreview = () => setPreview(false);

  return (
    <View style={[styles.card, wide && styles.wide, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
      {scopedSource ? (
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Agrandir la photo du ${day}, score ${score}`}
            accessibilityHint={canReact ? 'Ouvre la photo et les réactions Pix' : undefined}
            onPress={() => setPreview(true)}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <ChallengePhoto photo={scopedSource} style={styles.photo} />
          </Pressable>
          {canReact && photo && (
            <PhotoReactionBadge value={photo.reactions} onReact={onReact} busy={busy} error={error} />
          )}
        </View>
      ) : result.photo?.status === 'unavailable' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Recharger la photo du ${day}`}
          onPress={onReload}
          style={({ pressed }) => [styles.photo, styles.photoPlaceholder,
            { backgroundColor: theme.dailySurface }, pressed && styles.pressed]}>
          <ThemedText type="small" themeColor="dailyMuted" style={styles.placeholderLabel}>Photo indisponible</ThemedText>
          <ThemedText type="smallBold" themeColor="dailyAccent" style={styles.placeholderLabel}>Réessayer</ThemedText>
        </Pressable>
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: theme.dailySurface }]}>
          {result.photo?.status === 'locked' && <Icon name="lock" size={19} color={theme.dailyMuted} />}
          <ThemedText type="small" themeColor="dailyMuted" style={styles.placeholderLabel}>
            {result.photo?.status === 'locked' ? 'Joue pour voir la photo' : 'Photo indisponible'}
          </ThemedText>
        </View>
      )}

      <View style={styles.caption}>
        <ThemedText type="smallBold" themeColor="dailyInk" style={styles.date}>
          {formatCompactChallengeDay(result.date)}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="dailyAccent" style={[styles.score, { backgroundColor: theme.dailySurface }]}>
          {score}
        </ThemedText>
      </View>

      {scopedSource && preview && (
        <Dialog onClose={closePreview} animationType={reduceMotion ? 'none' : 'fade'} panelStyle={styles.previewPanel}>
          <View style={styles.previewHeader}>
            <View style={styles.previewInfo}>
              <ThemedText accessibilityRole="header" themeColor="dailyInk" style={styles.previewTitle}>{day}</ThemedText>
              <ThemedText
                accessibilityLabel={`Score ${score}`}
                type="smallBold"
                themeColor="dailyAccent"
                style={[styles.score, { backgroundColor: theme.dailySurface }]}>
                {score}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer la photo"
              onPress={closePreview}
              style={({ pressed }) => [
                styles.closePreview, { backgroundColor: theme.dailySurface }, pressed && styles.pressed,
              ]}>
              <Icon name="xMark" size={18} color={theme.dailyInk} />
            </Pressable>
          </View>
          {photo && <PixReactionBar value={photo.reactions} onReact={canReact ? onReact : undefined} busy={busy} error={error} />}
          <View>
            <ChallengePhoto photo={scopedSource} label={`Photo du défi du ${day}`} full onRetry={onReload} style={styles.fullPhoto} />
            {photo && <PhotoReactionBadge value={photo.reactions} />}
          </View>
        </Dialog>
      )}
    </View>
  );
}
