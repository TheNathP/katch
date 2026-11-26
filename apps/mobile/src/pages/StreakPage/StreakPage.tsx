import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import Icon from '@/components/ui/Icon';
import IconLink from '@/components/ui/IconLink';
import IllustratedBanner from '@/components/ui/IllustratedBanner';
import ProgressionLayout from '@/components/ui/ProgressionLayout';
import ProgressPanel from '@/components/ui/ProgressPanel';
import ThemedText from '@/components/ui/ThemedText';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './StreakPage.styles';

const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' });
const accessibleDayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const goals = [3, 7, 14, 30];
const maxMarkSize = 37;
const weekGap = 3;
const daysInWeek = 7;

function formatDays(days: number) {
  return `${days} ${days > 1 ? 'jours' : 'jour'}`;
}

export default function StreakPage() {
  const theme = useTheme();
  const { summary, error, load } = useProgression();
  const [markSize, setMarkSize] = useState(26);
  const markDimensions = { width: markSize, height: markSize, borderRadius: markSize / 2 };

  function measureWeek({ nativeEvent }: LayoutChangeEvent) {
    const available = nativeEvent.layout.width - weekGap * (daysInWeek - 1);
    setMarkSize(Math.max(0, Math.min(maxMarkSize, Math.floor(available / daysInWeek))));
  }

  const nextGoal = summary && goals.find(goal => goal > summary.currentStreak);
  const panel = { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow };
  const record = summary && (
    <View style={styles.record}>
      <Icon name="trophy" size={27} />
      <View style={styles.recordLabel}>
        <ThemedText type="small" style={{ color: theme.dailyMuted }}>Record personnel</ThemedText>
        {nextGoal === undefined && (
          <ThemedText type="small" style={{ color: theme.dailyMuted }}>Tous les paliers sont atteints</ThemedText>
        )}
      </View>
      <ThemedText type="smallBold" style={[styles.recordValue, { color: theme.dailyInk }]}>
        {formatDays(summary.bestStreak)}
      </ThemedText>
    </View>
  );

  return (
    <ProgressionLayout rewardsHeader contentStyle={styles.layout} loading={!summary && !error} error={error} retry={() => void load()}>
      {summary && (
        <>
          <IllustratedBanner
            title={`${formatDays(summary.currentStreak)} de suite`}
            detail={summary.todayValidated ? 'Défi du jour validé !' : 'Le défi du jour t’attend.'}
            art={{ icon: 'flame' }}
          />

          <View style={[styles.weekPanel, panel]}>
            <View style={styles.weekHeader}>
              <Icon name="calendarIllustrated" size={32} />
              <ThemedText accessibilityRole="header" style={[styles.weekTitle, { color: theme.dailyInk }]}>
                Les 7 derniers jours
              </ThemedText>
            </View>
            <View onLayout={measureWeek} style={[styles.week, { gap: weekGap }]}>
              {summary.week.map(day => {
                const date = new Date(`${day.date}T00:00:00Z`);
                const status = day.done ? 'validé' : day.isToday ? 'à valider' : 'non validé';
                return (
                  <View
                    key={day.date}
                    accessible
                    accessibilityLabel={`${accessibleDayFormat.format(date)}, ${status}${day.isToday ? ', aujourd’hui' : ''}`}
                    style={styles.day}>
                    <ThemedText
                      type="smallBold"
                      aria-hidden
                      style={[styles.dayLabel, { color: day.isToday ? theme.dailyAccent : theme.dailyMuted }]}>
                      {dayFormat.format(date).replace('.', '')}
                    </ThemedText>
                    <View aria-hidden style={[styles.mark, markDimensions, {
                      backgroundColor: day.done ? OnboardingColors.lime : theme.dailySurface,
                      borderColor: day.isToday ? OnboardingColors.violetEdge : 'transparent',
                    }]}>
                      {day.done
                        ? <Icon name="check" size={18} color={OnboardingColors.ink} />
                        : <View style={[styles.dot, { backgroundColor: theme.dailyMuted }]} />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {nextGoal !== undefined ? (
            <ProgressPanel
              icon="target"
              title="Prochain palier"
              detail={`Encore ${formatDays(nextGoal - summary.currentStreak)}`}
              label="Progression vers le prochain palier"
              value={summary.currentStreak}
              max={nextGoal}
              unit="jours"
              footer={record}
            />
          ) : (
            <View style={[styles.recordPanel, panel]}>{record}</View>
          )}

          <IconLink href="/progression" label="Voir ma progression" variant="plain" />
        </>
      )}
    </ProgressionLayout>
  );
}
