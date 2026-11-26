import { useState } from 'react';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
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
  { value: 'claimable', label: 'À récupérer' },
  { value: 'unlocked', label: 'Obtenus' },
  { value: 'locked', label: 'En cours' },
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
  const { summary, error, load, busy, change, actionError } = useProgression();
  const [filter, setFilter] = useState<Filter>('all');
  const unlocked = summary?.badges.filter(badge => badge.claimed).length ?? 0;
  const displayed = summary?.badges.filter(badge => {
    if (filter === 'claimable') return badge.eligible && !badge.claimed;
    if (filter === 'unlocked') return badge.claimed;
    if (filter === 'locked') return !badge.eligible;
    return true;
  });

  return (
    <ProgressionLayout rewardsHeader loading={!summary && !error} error={error} retry={() => void load()}>
      {summary && displayed && (
        <>
          <IllustratedBanner
            title="Tes succès"
            detail={`${unlocked} badge${unlocked === 1 ? '' : 's'} sur ${summary.badges.length} obtenu${unlocked === 1 ? '' : 's'}`}
            art={{ icon: 'trophy' }}
          />
          <View style={styles.collection}>
            {actionError && (
              <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{actionError}</ThemedText>
            )}
            <FilterChips options={filters} value={filter} onChange={setFilter} label="Filtrer les badges" />
            <View style={styles.grid}>
              {displayed.map(badge => (
                <View key={badge.id} style={[styles.badge, { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow }]}>
                  <View style={[styles.medal, { backgroundColor: badge.claimed ? badgeTints[badge.id] : theme.dailySurface }]}>
                    <Icon name={badge.art} size={72} style={!badge.eligible && styles.locked} />
                    <View style={[styles.stamp, { backgroundColor: badge.claimed ? OnboardingColors.lime : theme.dailyCard }]}>
                      <Icon name={badge.claimed ? 'check' : badge.eligible ? 'coin' : 'lockIllustrated'}
                        size={badge.claimed ? 15 : 23} color={OnboardingColors.ink} />
                    </View>
                  </View>
                  <View style={styles.copy}>
                    <ThemedText type="smallBold" style={[styles.title, { color: theme.dailyInk }]}>{badge.title}</ThemedText>
                    <ThemedText type="small" style={[styles.description, { color: theme.dailyMuted }]}>{badge.description}</ThemedText>
                    <View style={styles.progress}>
                      {badge.claimed ? (
                        <ThemedText type="smallBold" style={[styles.state, { color: theme.dailyInk }]}>Obtenu</ThemedText>
                      ) : badge.eligible ? (
                        <ThemedText type="smallBold" style={[styles.state, { color: theme.dailyInk }]}>À récupérer</ThemedText>
                      ) : (
                        <>
                          <ProgressBar size="small" label={`Progression du badge ${badge.title}`} value={badge.progress} max={badge.goal} />
                          <ThemedText type="small" style={[styles.state, { color: theme.dailyMuted }]}>
                            {badge.progress} / {badge.goal} {badge.unit}
                          </ThemedText>
                        </>
                      )}
                    </View>
                    <View style={styles.coins}>
                      <Icon name="coin" size={19} />
                      <ThemedText type="smallBold" style={{ color: theme.dailyInk }}>
                        +{badge.coins} KatchCoins
                      </ThemedText>
                    </View>
                    {badge.eligible && !badge.claimed && (
                      <Button
                        size="compact"
                        label="Récupérer"
                        accessibilityLabel={`Récupérer ${badge.title} et ${badge.coins} KatchCoins`}
                        variant="limeSolid"
                        style={styles.claim}
                        disabled={busy}
                        onPress={() => { void change({ action: 'claim', badgeId: badge.id }); }}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
            {displayed.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {filter === 'claimable' ? 'Aucun badge à récupérer pour le moment.'
                  : filter === 'unlocked' ? 'Tes badges obtenus apparaîtront ici.'
                    : 'Tu as terminé tous les objectifs !'}
              </ThemedText>
            )}
          </View>
        </>
      )}
    </ProgressionLayout>
  );
}
