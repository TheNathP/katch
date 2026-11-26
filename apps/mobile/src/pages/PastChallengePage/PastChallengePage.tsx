import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import ArchiveFeedback from '@/components/ui/ArchiveFeedback';
import ChallengePhoto from '@/components/ui/ChallengePhoto';
import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';
import ThemedText from '@/components/ui/ThemedText';
import { getPastChallenge } from '@/data/challenge-history';
import { useArchiveQuery } from '@/hooks/use-archive-query';
import { useTheme } from '@/hooks/use-theme';
import { formatChallengeDay, formatChallengeScore, isChallengeDate } from '@/lib/challenge-calendar';

import { styles } from './PastChallengePage.styles';

export default function PastChallengePage() {
  const theme = useTheme();
  const { date: param } = useLocalSearchParams<{ date?: string }>();
  const date = isChallengeDate(param) ? param : undefined;
  const load = useCallback((signal: AbortSignal) => date ? getPastChallenge(signal, date) : Promise.resolve(null), [date]);
  const { data, error, retry } = useArchiveQuery('date:' + date, load);

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <View style={styles.layout}>
        {data ? (
          <>
            <View style={[styles.result, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder, boxShadow: theme.dailyShadow }]}>
              <ThemedText accessibilityRole="header" type="smallBold" themeColor="dailyMuted">{formatChallengeDay(data.date)}</ThemedText>
              <View style={styles.resultRow}>
                <ThemedText accessibilityLabel={'Score ' + formatChallengeScore(data.score)} themeColor="dailyAccent" style={styles.score}>{formatChallengeScore(data.score)}</ThemedText>
                {data.targetHex && (
                  <View style={[styles.target, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }]}>
                    <View aria-hidden style={[styles.swatch, { backgroundColor: data.targetHex, borderColor: theme.dailySwatchBorder }]} />
                    <View>
                      <ThemedText type="small" themeColor="dailyMuted">Couleur du jour</ThemedText>
                      <ThemedText type="smallBold" themeColor="dailyInk">{data.targetHex}</ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <ChallengePhoto uri={data.photoUrl} hex={data.targetHex} full label={'Photo du défi du ' + formatChallengeDay(data.date)} style={styles.photo} />
            {data.collected && (
              <NavigationLink href="/collection" label="Voir la couleur dans ma collection" variant="plain" style={styles.collection}>
                <ThemedText type="smallBold" style={styles.collectionText}>Couleur collectionnée · Voir ma collection</ThemedText>
              </NavigationLink>
            )}
          </>
        ) : (
          <ArchiveFeedback
            kind={error ? 'error' : data === undefined && date ? 'loading' : 'empty'}
            title={error ? 'Résultat indisponible' : data === undefined && date ? 'Chargement du résultat' : 'Aucun défi à cette date'}
            action={error ? { label: 'Réessayer', run: retry } : undefined}
          />
        )}
      </View>
    </Screen>
  );
}
