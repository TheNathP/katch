import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import ArchiveFeedback from '@/components/ui/ArchiveFeedback';
import ArchiveHero from '@/components/ui/ArchiveHero';
import Button from '@/components/ui/Button';
import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';
import ThemedText from '@/components/ui/ThemedText';
import type { PhotoGallery } from '@/data/adapters/challenge-history.adapters';
import { getChallengeHistory, getPhotoGallery } from '@/data/challenge-history';
import { useArchivePagination } from '@/hooks/use-archive-pagination';
import { useArchiveQuery } from '@/hooks/use-archive-query';
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
  { id: 'calendar', label: 'Calendrier' },
  { id: 'gallery', label: 'Galerie' },
] as const;

function appendPhotos(current: PhotoGallery, next: PhotoGallery): PhotoGallery {
  return { ...next, entries: [...current.entries, ...next.entries] };
}

export default function ChallengeHistoryPage({ initialView = 'calendar' }: { initialView?: 'calendar' | 'gallery' }) {
  const theme = useTheme();
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
  const { data, error, retry } = useArchiveQuery('history:' + (month ?? 'current'), load, {
    enabled: !isGallery || !!range,
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

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <View style={styles.layout}>
        <ArchiveHero
          title={isGallery ? 'Mes photos' : 'Mon carnet de couleurs'}
          art={isGallery ? cameraPix : happyPix}
          detail={isGallery ? undefined : calendarBadge}
          transitionKey={view}
        />

        <View accessibilityRole="tablist" style={[styles.tabs, { backgroundColor: theme.dailySurface }]}>
          {views.map(({ id, label }) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === id }}
              onPress={() => {
                setView(id);
                if (id === 'gallery') setVisitedGallery(true);
              }}
              style={({ pressed }) => [styles.tab, view === id && styles.activeTab, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={view === id ? styles.activeTabText : { color: theme.dailyMuted }}>{label}</ThemedText>
            </Pressable>
          ))}
        </View>

        {isGallery ? (
          gallery.data ? (
            gallery.data.entries.length ? (
              <>
                <View style={styles.gallery}>
                  {gallery.data.entries.map(entry => <ChallengeHistoryCard key={entry.date} entry={entry} />)}
                </View>
                {gallery.moreFailed && (
                  <ThemedText accessibilityLiveRegion="polite" type="small" themeColor="dailyMuted">
                    Impossible de charger les autres photos.
                  </ThemedText>
                )}
                {gallery.data.nextCursor && (
                  <Button
                    label={gallery.adding ? 'Chargement…' : gallery.moreFailed ? 'Réessayer' : 'Voir plus de photos'}
                    variant="primarySolid"
                    disabled={gallery.adding}
                    onPress={() => void gallery.loadMore()}
                  />
                )}
              </>
            ) : <ArchiveFeedback kind="empty" title="Aucune photo" detail="Tes photos validées apparaissent ici." />
          ) : (
            <ArchiveFeedback
              kind={gallery.error ? 'error' : 'loading'}
              title={gallery.error ? 'Galerie indisponible' : 'Chargement des photos'}
              action={gallery.error ? { label: 'Réessayer', run: gallery.retry } : undefined}
            />
          )
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
    </Screen>
  );
}
