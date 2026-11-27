import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, View, type ListRenderItemInfo } from 'react-native';

import ArchiveFeedback from '@/components/ui/ArchiveFeedback';
import ArchiveHero from '@/components/ui/ArchiveHero';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import NavigationLink from '@/components/ui/NavigationLink';
import SegmentedTabs from '@/components/ui/SegmentedTabs';
import ThemedText from '@/components/ui/ThemedText';
import type { ChallengeResult, PhotoGallery } from '@/data/adapters/challenge-history.adapters';
import { getChallengeHistory, getPhotoGallery } from '@/data/challenge-history';
import { useArchivePagination } from '@/hooks/use-archive-pagination';
import { useArchiveQuery } from '@/hooks/use-archive-query';
import { useRefreshHaptic } from '@/hooks/use-refresh-haptic';
import { useTheme } from '@/hooks/use-theme';
import { formatChallengeMonth, isChallengeMonth, shiftChallengeMonth } from '@/lib/challenge-calendar';

import ChallengeHistoryCalendar from './_page/ChallengeHistoryCalendar';
import ChallengeHistoryCard from './_page/ChallengeHistoryCard';
import { styles } from './ChallengeHistoryPage.styles';

const happyPix = require('@/assets/images/pix/happy.png');
const cameraPix = require('@/assets/images/pix/excited.png');
const chevron = require('@/assets/icons/chevron-right.svg');
const collection = require('@/assets/icons/collection.svg');

const views = [
  { value: 'calendar', label: 'Calendrier' },
  { value: 'gallery', label: 'Galerie' },
] as const;
const noPhotos: ChallengeResult[] = [];

function appendPhotos(current: PhotoGallery, next: PhotoGallery): PhotoGallery {
  return { ...next, entries: [...current.entries, ...next.entries] };
}

function renderGalleryPhoto({ item }: ListRenderItemInfo<ChallengeResult>) {
  return <ChallengeHistoryCard entry={item} />;
}

function GalleryRowSeparator() {
  return <View style={styles.rowSeparator} />;
}

export default function ChallengeHistoryPage({ initialView = 'calendar' }: { initialView?: 'calendar' | 'gallery' }) {
  const theme = useTheme();
  const playRefreshHaptic = useRefreshHaptic();
  const params = useLocalSearchParams<{ month?: string }>();
  const [view, setView] = useState(initialView);
  const [visitedGallery, setVisitedGallery] = useState(initialView === 'gallery');
  const [month, setMonth] = useState<string | undefined>(() => isChallengeMonth(params.month) ? params.month : undefined);
  const [range, setRange] = useState<{ today: string; firstMonth: string }>();
  const load = useCallback(async (signal: AbortSignal) => {
    const history = await getChallengeHistory(signal, month);
    if (!signal.aborted) setRange({ today: history.today, firstMonth: history.firstMonth });
    return history;
  }, [month]);
  const isGallery = view === 'gallery';
  const { data, error, retry, refreshIfStale } = useArchiveQuery('history:' + (month ?? 'current'), load, {
    enabled: !isGallery || !!range,
    reuseForMs: 5 * 60_000,
    reloadWhenActive: true,
  });
  const gallery = useArchivePagination('gallery', getPhotoGallery, appendPhotos, visitedGallery);
  const shownMonth = month ?? range?.today.slice(0, 7);
  const entries = new Map(data?.entries.map(entry => [entry.date, entry]));
  const count = entries.size;
  const calendarBadge = data ? `${count} défi${count === 1 ? '' : 's'} ce mois-ci` : '— défis ce mois-ci';

  function changeMonth(delta: number) {
    if (!shownMonth || !range) return;
    const next = shiftChallengeMonth(shownMonth, delta);
    if (next < range.firstMonth || next > range.today.slice(0, 7)) return;
    setMonth(next);
  }

  const galleryEntries = isGallery && gallery.data ? gallery.data.entries : noPhotos;
  const header = (
    <View style={[styles.header, galleryEntries.length > 0 && styles.headerWithPhotos]}>
      <ArchiveHero
        title={isGallery ? 'Mes photos' : 'Mon carnet de couleurs'}
        art={isGallery ? cameraPix : happyPix}
        detail={isGallery ? undefined : calendarBadge}
        transitionKey={view}
      />

      <SegmentedTabs
        label="Vue de l’historique"
        options={views}
        value={view}
        onChange={next => {
          setView(next);
          if (next === 'gallery') {
            if (visitedGallery) gallery.refreshIfStale();
            setVisitedGallery(true);
          } else if (range) {
            refreshIfStale();
          }
        }}
      />

      {isGallery ? (
        !gallery.data ? (
          <ArchiveFeedback
            kind={gallery.error ? 'error' : 'loading'}
            title={gallery.error ? 'Galerie indisponible' : 'Chargement des photos'}
            action={gallery.error ? { label: 'Réessayer', run: gallery.retry } : undefined}
          />
        ) : galleryEntries.length === 0 ? (
          <ArchiveFeedback kind="empty" title="Aucune photo" detail="Tes photos validées apparaissent ici." />
        ) : null
      ) : (
        <View style={[styles.panel, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
          {shownMonth && range && (
            <View style={styles.monthBar}>
              {[-1, 0, 1].map(delta => {
                if (delta === 0) return (
                  <ThemedText key={delta} accessibilityRole="header" themeColor="dailyInk" style={styles.monthText}>
                    {formatChallengeMonth(shownMonth)}
                  </ThemedText>
                );
                const previous = delta === -1;
                const disabled = previous ? shownMonth <= range.firstMonth : shownMonth >= range.today.slice(0, 7);
                return (
                  <Pressable
                    key={delta}
                    accessibilityRole="button"
                    accessibilityLabel={previous ? 'Mois précédent' : 'Mois suivant'}
                    accessibilityState={{ disabled }}
                    disabled={disabled}
                    onPress={() => changeMonth(delta)}
                    style={({ pressed }) => [
                      styles.arrow, previous && styles.previous, { backgroundColor: theme.dailySurface },
                      (disabled || pressed) && styles.pressed,
                    ]}>
                    <Image aria-hidden source={chevron} contentFit="contain" tintColor={theme.dailyAccent} style={styles.arrowIcon} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {!data ? (
            <ArchiveFeedback
              kind={error ? 'error' : 'loading'}
              title={error ? 'Historique indisponible' : 'Chargement du mois'}
              action={error ? { label: 'Réessayer', run: retry } : undefined}
            />
          ) : shownMonth ? (
            <ChallengeHistoryCalendar
              month={shownMonth}
              today={data.today}
              entries={entries}
              onOpenResult={date => router.push({ pathname: '/historique/[date]', params: { date } })}
            />
          ) : null}
        </View>
      )}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {isGallery && gallery.moreFailed && (
        <ThemedText accessibilityLiveRegion="polite" type="small" themeColor="dailyMuted">
          Impossible de charger les autres photos.
        </ThemedText>
      )}
      {isGallery && gallery.data?.nextCursor && (
        <Button
          label={gallery.adding ? 'Chargement…' : gallery.moreFailed ? 'Réessayer' : 'Voir plus de photos'}
          variant="primarySolid"
          disabled={gallery.adding}
          onPress={() => void gallery.loadMore()}
        />
      )}
      <NavigationLink
        href="/collection"
        label="Voir ma collection"
        variant="plain"
        style={[styles.collection, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }]}>
        <Image aria-hidden source={collection} tintColor={theme.dailyAccent} style={styles.arrowIcon} contentFit="contain" />
        <ThemedText type="smallBold" themeColor="dailyInk" style={styles.collectionText}>Ma collection de couleurs</ThemedText>
        <Image aria-hidden source={chevron} tintColor={theme.dailyAccent} style={styles.arrowIcon} contentFit="contain" />
      </NavigationLink>
    </View>
  );

  return (
    <Screen scroll={false} backgroundColor={theme.dailyCanvas}>
      <FlatList
        data={galleryEntries}
        renderItem={renderGalleryPhoto}
        keyExtractor={entry => entry.date}
        numColumns={2}
        columnWrapperStyle={styles.galleryRow}
        ItemSeparatorComponent={GalleryRowSeparator}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        onRefresh={isGallery && gallery.data ? () => {
          if (gallery.loading) return;
          playRefreshHaptic();
          void gallery.retry();
        } : undefined}
        refreshing={isGallery && !!gallery.data && gallery.loading}
      />
    </Screen>
  );
}
