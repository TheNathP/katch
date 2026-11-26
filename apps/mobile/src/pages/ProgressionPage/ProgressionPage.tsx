import { View } from 'react-native';

import Icon from '@/components/ui/Icon';
import IconLink from '@/components/ui/IconLink';
import IllustratedBanner from '@/components/ui/IllustratedBanner';
import ProgressPanel from '@/components/ui/ProgressPanel';
import ProgressionLayout from '@/components/ui/ProgressionLayout';
import ThemedText from '@/components/ui/ThemedText';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format-number';
import { styles as common } from '@/styles/progression';

import { styles } from './ProgressionPage.styles';

const amethyst = require('@/assets/images/pix/star-eyes-amethyst.png');

export default function ProgressionPage() {
  const theme = useTheme();
  const { summary, error, load } = useProgression();
  const panel = { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow };

  return (
    <ProgressionLayout rewardsHeader loading={!summary && !error} error={error} retry={() => void load()}>
      {summary && (
        <>
          <IllustratedBanner
            title={`Niveau ${summary.level}`}
            detail={`${formatNumber(summary.xp)} XP cumulés`}
            art={{ source: amethyst }}
          />

          <ProgressPanel
            icon="xpIllustrated"
            title={`Vers le niveau ${summary.level + 1}`}
            detail={`Encore ${formatNumber(summary.xpPerLevel - summary.levelXp)} XP`}
            label="Expérience vers le prochain niveau"
            value={summary.levelXp}
            max={summary.xpPerLevel}
            unit="XP"
          />

          <View style={common.section}>
            <ThemedText accessibilityRole="header" style={[common.heading, { color: theme.dailyInk }]}>Ton activité</ThemedText>
            <View style={styles.stats}>
              <View style={[styles.stat, panel]}>
                <View style={[styles.statArt, styles.challengeArt]}>
                  <Icon name="target" size={53} />
                </View>
                <View style={styles.statCopy}>
                  <ThemedText style={[styles.statValue, { color: theme.dailyInk }]}>{formatNumber(summary.total)}</ThemedText>
                  <ThemedText type="small" style={[styles.statLabel, { color: theme.dailyMuted }]}>Défis validés</ThemedText>
                </View>
              </View>
              <View style={[styles.stat, panel]}>
                <View style={[styles.statArt, styles.streakArt]}>
                  <Icon name="flame" size={53} />
                </View>
                <View style={styles.statCopy}>
                  <ThemedText style={[styles.statValue, { color: theme.dailyInk }]}>
                    {summary.currentStreak} {summary.currentStreak > 1 ? 'jours' : 'jour'}
                  </ThemedText>
                  <ThemedText type="small" style={[styles.statLabel, { color: theme.dailyMuted }]}>Série actuelle</ThemedText>
                </View>
              </View>
            </View>
            <IconLink href="/progression/serie" icon="calendarIllustrated" label="Détail de ma série" />
            <IconLink href="/recompenses/badges" icon="trophy" label="Mes badges" />
          </View>
        </>
      )}
    </ProgressionLayout>
  );
}
