import { useState } from 'react';
import { View } from 'react-native';

import FilterChips from '@/components/ui/FilterChips';
import Icon from '@/components/ui/Icon';
import IllustratedBanner from '@/components/ui/IllustratedBanner';
import ProgressBar from '@/components/ui/ProgressBar';
import ProgressionLayout from '@/components/ui/ProgressionLayout';
import ThemedText from '@/components/ui/ThemedText';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './BadgesPage.styles';

const filters = [
  { value: 'all', label: 'Tous' },
  { value: 'unlocked', label: 'Débloqués' },
  { value: 'locked', label: 'À débloquer' },
] as const;

type Filter = typeof filters[number]['value'];

const badgeTints = {
  first: OnboardingColors.avatarAmber,
  three: OnboardingColors.avatarCoral,
  seven: OnboardingColors.lavender,
  level: OnboardingColors.avatarAmethyst,
  ten: OnboardingColors.avatarAmethyst,
  style: OnboardingColors.avatarAmber,
};

export default function BadgesPage() {
  const theme = useTheme();
  const { summary, error, load } = useProgression();
  const [filter, setFilter] = useState<Filter>('all');
  const unlocked = summary?.badges.filter(badge => badge.unlocked).length ?? 0;
  const displayed = summary?.badges.filter(badge => filter === 'all' || badge.unlocked === (filter === 'unlocked'));

  return (
    <ProgressionLayout rewardsHeader loading={!summary && !error} error={error} retry={() => void load()}>
      {summary && displayed && (
        <>
          <IllustratedBanner
            title="Tes succès"
            detail={`${unlocked} badge${unlocked === 1 ? '' : 's'} sur ${summary.badges.length} débloqué${unlocked === 1 ? '' : 's'}`}
            art={{ icon: 'trophy' }}
          />
          <View style={styles.collection}>
            <FilterChips options={filters} value={filter} onChange={setFilter} label="Filtrer les badges" />
            <View style={styles.grid}>
              {displayed.map(badge => (
                <View key={badge.id} style={[styles.badge, { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow }]}>
                  <View style={[styles.medal, { backgroundColor: badge.unlocked ? badgeTints[badge.id] : theme.dailySurface }]}>
                    <Icon name={badge.art} size={72} style={!badge.unlocked && styles.locked} />
                    <View style={[styles.stamp, { backgroundColor: badge.unlocked ? OnboardingColors.lime : theme.dailyCard }]}>
                      <Icon name={badge.unlocked ? 'check' : 'lockIllustrated'}
                        size={badge.unlocked ? 15 : 23} color={OnboardingColors.ink} />
                    </View>
                  </View>
                  <View style={styles.copy}>
                    <ThemedText type="smallBold" style={[styles.title, { color: theme.dailyInk }]}>{badge.title}</ThemedText>
                    <ThemedText type="small" style={[styles.description, { color: theme.dailyMuted }]}>{badge.description}</ThemedText>
                    <View style={styles.progress}>
                      {badge.unlocked ? (
                        <ThemedText type="smallBold" style={[styles.state, { color: theme.dailyInk }]}>Débloqué</ThemedText>
                      ) : (
                        <>
                          <ProgressBar size="small" label={`Progression du badge ${badge.title}`} value={badge.progress} max={badge.goal} />
                          <ThemedText type="small" style={[styles.state, { color: theme.dailyMuted }]}>
                            {badge.progress} / {badge.goal} {badge.unit}
                          </ThemedText>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {displayed.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {filter === 'unlocked' ? 'Tes badges débloqués apparaîtront ici.' : 'Tu as débloqué tous les badges !'}
              </ThemedText>
            )}
          </View>
        </>
      )}
    </ProgressionLayout>
  );
}
