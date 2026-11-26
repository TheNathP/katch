import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import type { LeaderboardPlayer } from '@/data/adapters/leaderboard-player.adapters';
import { getLeaderboardPlayerPage } from '@/data/get-leaderboard-player-page';
import { useFriendshipActions } from '@/hooks/use-friendship-actions';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './LeaderboardPlayerPage.styles';

const closeIcon = require('@/assets/icons/x-mark.svg');

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; player: LeaderboardPlayer };

export default function LeaderboardPlayerPage() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const theme = useTheme();
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State>({ status: 'loading' });
  const reload = () => setVersion((previous) => previous + 1);
  const friendship = useFriendshipActions(reload);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ status: 'loading' });
      try {
        const player = await getLeaderboardPlayerPage(playerId, controller.signal);
        if (!controller.signal.aborted) setState({ status: 'ready', player });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ status: 'error', message: error instanceof Error ? error.message : 'Impossible de charger le profil.' });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [playerId, version]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/classement');
  };

  const player = state.status === 'ready' ? state.player : undefined;
  const photo = player?.photo;
  const pendingLabel = player?.relationship === 'outgoing' ? 'Demande envoyée'
    : player?.relationship === 'incoming' ? 'Demande reçue'
      : undefined;

  return (
    <SafeAreaView style={styles.overlay}>
      <Pressable accessible={false} onPress={close} style={[styles.backdrop, { backgroundColor: theme.modalBackdrop }]} />
      <View accessibilityViewIsModal style={[styles.card, {
        backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder, boxShadow: theme.dailyShadow,
      }]}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.dailyInk }]}>
              {player?.name ?? 'Profil du joueur'}
            </Text>
            {player && (
              <Text
                accessibilityLabel={player.scoreLabel ? `Score ${player.scoreLabel}` : 'Sans score'}
                style={[styles.score, { backgroundColor: theme.dailySurface, color: theme.dailyAccent }]}
              >
                {player.scoreLabel ?? 'Sans score'}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={close}
            hitSlop={8}
            style={[styles.close, { backgroundColor: theme.dailySurface }]}
          >
            <Image aria-hidden source={closeIcon} style={styles.closeIcon} tintColor={theme.dailyInk} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          {state.status === 'loading' && (
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Chargement du profil"
              accessibilityState={{ busy: true }}
              style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}
            />
          )}
          {state.status === 'error' && (
            <>
              <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.dailyInk }]}>{state.message}</Text>
              <Button label="Réessayer" onPress={reload} />
            </>
          )}
          {photo?.status === 'available' && (
            <Image
              accessible
              accessibilityLabel={`Photo du défi de ${player?.name}`}
              source={photo.url}
              cachePolicy="none"
              contentFit="contain"
              style={[styles.photo, { backgroundColor: theme.dailySurface }]}
              onError={() => setState((previous) => previous.status === 'ready'
                ? { status: 'ready', player: { ...previous.player, photo: { status: 'missing' } } }
                : previous)}
            />
          )}
          {photo && photo.status !== 'available' && (
            <View style={[styles.photoMessage, { backgroundColor: theme.dailySurface }]}>
              <Text style={[styles.message, { color: theme.dailyMuted }]}>
                {photo.status === 'locked' ? 'Termine ton défi pour voir cette photo.' : 'Photo du défi indisponible.'}
              </Text>
            </View>
          )}
          {player?.relationship === 'none' && (
            <Button
              label={friendship.busy ? 'Envoi…' : 'Envoyer une demande d’amis'}
              disabled={friendship.busy}
              onPress={() => void friendship.change('request', playerId)}
            />
          )}
          {pendingLabel && <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.dailyAccent }]}>{pendingLabel}</Text>}
          {friendship.error && (
            <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.danger }]}>{friendship.error}</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
