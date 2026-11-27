import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import type { ChallengeResult } from '@/data/adapters/challenge-history.adapters';
import { useTheme } from '@/hooks/use-theme';
import { calendarWeeks, formatChallengeDay, formatChallengeScore } from '@/lib/challenge-calendar';
import { challengePhotoImageSource } from '@/lib/challenge-photo';
import { ComicFeedbackColors, OnboardingColors } from '@/styles/theme';

import { styles } from './ChallengeHistoryCalendar.styles';

const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function ChallengeHistoryCalendar({ month, today, entries, onOpenResult }: {
  month: string;
  today: string;
  entries: ReadonlyMap<string, ChallengeResult>;
  onOpenResult(date: string): void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.calendar}>
      <View aria-hidden style={styles.week}>
        {weekdays.map(day => (
          <ThemedText key={day} type="smallBold" themeColor="dailyMuted" style={styles.weekday}>{day}</ThemedText>
        ))}
      </View>
      {calendarWeeks(month).map((week, index) => (
        <View key={index} style={styles.week}>
          {week.map((day, column) => {
            if (!day) return <View key={column} style={styles.space} />;
            const entry = entries.get(day);
            const dayNumber = String(Number(day.slice(-2)));
            const cellStyle = [styles.cell, {
              backgroundColor: entry?.targetHex ?? theme.dailySurface,
              borderColor: day === today ? theme.dailyAccent : theme.dailyBorder,
            }, day === today && styles.today, day > today && styles.future];

            if (!entry) {
              return (
                <View key={day} accessible={day === today} accessibilityLabel={day === today ? "Aujourd’hui, sans score" : undefined} style={cellStyle}>
                  <ThemedText type="smallBold" themeColor="dailyMuted" style={styles.number}>{dayNumber}</ThemedText>
                </View>
              );
            }

            const thumbnail = entry.photo && challengePhotoImageSource(entry.photo, 'calendar');
            return (
              <Pressable
                key={day}
                testID={day === today ? 'history-today-result' : undefined}
                accessibilityRole="button"
                accessibilityLabel={formatChallengeDay(day) + ', ' + formatChallengeScore(entry.score) + ', voir le résultat'}
                onPress={() => onOpenResult(day)}
                style={({ pressed }) => [cellStyle, pressed && styles.pressed]}>
                {thumbnail && (
                  <Image
                    aria-hidden
                    source={thumbnail}
                    recyclingKey={thumbnail.cacheKey}
                    cachePolicy="memory"
                    contentFit="cover"
                    allowDownscaling
                    enforceEarlyResizing
                    priority="low"
                    style={styles.thumbnail}
                  />
                )}
                <View aria-hidden style={[styles.tint, { backgroundColor: theme.modalBackdrop }]} />
                <ThemedText aria-hidden style={[styles.number, { color: OnboardingColors.white }]}>{dayNumber}</ThemedText>
                <ThemedText
                  aria-hidden
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  maxFontSizeMultiplier={1.2}
                  numberOfLines={1}
                  style={[
                    styles.score,
                    {
                      color: entry.collected ? OnboardingColors.ink : OnboardingColors.white,
                      backgroundColor: entry.collected ? OnboardingColors.lime : ComicFeedbackColors.ink,
                    },
                  ]}>
                    {formatChallengeScore(entry.score).replace('\u00a0', '')}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
