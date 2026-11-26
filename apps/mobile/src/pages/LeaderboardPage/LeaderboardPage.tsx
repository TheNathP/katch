import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import type { LeaderboardScope } from '@/data/api.types';
import { getLeaderboardPage } from '@/data/get-leaderboard-page';
import { useTheme } from '@/hooks/use-theme';

import LeaderboardPageHeader from './_page/LeaderboardPageHeader';
import LeaderboardPageRow from './_page/LeaderboardPageRow';
import { styles } from './LeaderboardPage.styles';

type Board = Awaited<ReturnType<typeof getLeaderboardPage>>;
type LoadState = { board: Board | null; loading: boolean; error: boolean };

export default function LeaderboardPage({ scope }: { scope: LeaderboardScope }) {
  const theme = useTheme();
  const [{ board, loading, error }, setState] = useState<LoadState>({ board: null, loading: true, error: false });
  const [refreshing, setRefreshing] = useState(false);
  const reload = useRef<((pulledToRefresh?: boolean) => void) | null>(null);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    let pending = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const load = async (pulledToRefresh = false) => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      clearTimeout(refreshTimer);
      setRefreshing(pulledToRefresh);
      setState(({ board }) => ({
        board: board && board.refreshAt > performance.now() ? board : null,
        loading: true,
        error: false,
      }));

      try {
        const next = await getLeaderboardPage(scope, controller.signal);
        if (controller.signal.aborted) return;
        setState({ board: next, loading: false, error: false });
        refreshTimer = setTimeout(() => void load(), Math.max(0, next.refreshAt - performance.now()));
      } catch {
        if (!controller.signal.aborted) {
          setState({ board: null, loading: false, error: true });
        }
      } finally {
        pending = false;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    };

    reload.current = (pulledToRefresh) => void load(pulledToRefresh);
    reload.current();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void load();
    });

    return () => {
      reload.current = null;
      controller.abort();
      clearTimeout(refreshTimer);
      subscription.remove();
    };
  }, [scope]));

  const ownEntry = board?.ownEntry;
  const showListHeader = Boolean(ownEntry || error);
  const openPlayer = (playerId: string) => {
    router.push({ pathname: '/classement-joueur/[playerId]', params: { playerId } });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: theme.dailyCanvas }]}>
      <LeaderboardPageHeader scope={scope} />
      <FlatList
        data={board?.entries ?? []}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => <LeaderboardPageRow entry={item} onPress={() => openPlayer(item.id)} />}
        contentContainerStyle={styles.list}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        ItemSeparatorComponent={RowSeparator}
        onRefresh={() => reload.current?.(true)}
        refreshing={refreshing}
        ListHeaderComponentStyle={styles.headerSpacing}
        ListHeaderComponent={showListHeader ? (
          <View style={styles.listHeader}>
            {ownEntry && <LeaderboardPageRow entry={ownEntry} onPress={() => openPlayer(ownEntry.id)} />}
            {error && (
              <View style={[styles.message, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
                <Text accessibilityLiveRegion="polite" style={[styles.messageText, { color: theme.dailyInk }]}>
                  Impossible de charger le classement.
                </Text>
                <Button label="Réessayer" onPress={() => reload.current?.()} />
              </View>
            )}
          </View>
        ) : undefined}
        ListEmptyComponent={loading && !board ? (
          <ActivityIndicator accessibilityLabel="Chargement du classement" size="large" color={theme.dailyAccent} style={styles.spinner} />
        ) : board ? (
          <View style={[styles.message, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
            <Text style={[styles.messageText, { color: theme.dailyMuted }]}>
              {scope === 'friends' ? 'Aucun score entre amis aujourd’hui.' : 'Aucun score mondial aujourd’hui.'}
            </Text>
          </View>
        ) : undefined}
      />
    </SafeAreaView>
  );
}

function RowSeparator() {
  return <View style={styles.separator} />;
}
