import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import SocialAction from '@/components/ui/SocialAction';
import SocialSkeleton from '@/components/ui/SocialSkeleton';
import SocialPlayerRow from '@/components/ui/SocialPlayerRow';
import ThemedText from '@/components/ui/ThemedText';
import { getFriends } from '@/data/friends';
import type { SocialPlayer } from '@/data/social-api.types';
import { useFriendsQuery } from '@/hooks/use-friends-query';
import { useFriendshipActions } from '@/hooks/use-friendship-actions';
import { socialStyles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './FriendsPage.styles';

const corner = require('@/assets/icon-illus/decorations/onboarding-purple-corner.svg');
const duo = require('@/assets/images/pix/friends-high-five.png');
const emptyPix = require('@/assets/images/pix/happy-rose.png');
const chevron = require('@/assets/icons/chevron-right.svg');

const sections = [
  { relationship: 'incoming', title: 'Demandes reçues' },
  { relationship: 'friend', title: 'Ta liste d’amis' },
  { relationship: 'outgoing', title: 'Demandes envoyées' },
] as const;

export default function FriendsPage() {
  const { notification } = useLocalSearchParams<{ notification?: string }>();
  const { value, error, reload } = useFriendsQuery(getFriends, notification);
  const actions = useFriendshipActions(reload);
  const count = value?.players.filter(player => player.relationship === 'friend').length ?? 0;

  function confirmRemoval(player: SocialPlayer) {
    Alert.alert('Retirer cet ami ?', `${player.name} sera retiré de ta liste d’amis.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => void actions.change('remove', player.id) },
    ]);
  }

  return (
    <Screen>
      <View style={socialStyles.layout}>
        <View style={styles.friendsHero}>
          <Image source={corner} aria-hidden style={styles.friendsCorner} contentFit="fill" />
          <View aria-hidden pointerEvents="none" style={styles.friendsRibbon}>
            <Svg width="100%" height="100%" viewBox="0 0 360 78" preserveAspectRatio="none">
              <Path
                d="M-4 67C77 41 191 54 274 31C312 21 337 10 364 5V42C327 56 300 64 258 66C163 72 76 69 -4 83Z"
                fill={OnboardingColors.lilac}
                opacity={0.65}
              />
            </Svg>
          </View>
          <Image source={duo} aria-hidden style={styles.friendsPix} contentFit="contain" />
          <View style={styles.friendsCopy}>
            <ThemedText accessibilityRole="header" style={styles.friendsTitle}>
              Ton{'\n'}cercle
            </ThemedText>
            <View style={styles.friendsBadgeSlot}>
              {value ? (
                <View style={styles.friendsBadge}>
                  <ThemedText type="smallBold" style={socialStyles.onLime}>
                    {count > 1 ? `${count} amis` : `${count} ami`}
                  </ThemedText>
                </View>
              ) : !error && <SkeletonBlock style={styles.friendsBadgeSkeleton} />}
            </View>
          </View>
        </View>
        <Button label="Trouver des amis" trailingIcon={chevron} onPress={() => router.push('/amis/recherche')} />
        {(error || actions.error) && (
          <View style={socialStyles.section}>
            <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{actions.error ?? error}</ThemedText>
            {error && <SocialAction label="Réessayer" onPress={reload} />}
          </View>
        )}
        {!value && !error && <SocialSkeleton label="Chargement des amis" />}
        {sections.map(({ relationship, title }) => {
          const players = value?.players.filter(player => player.relationship === relationship) ?? [];
          if (!value || (players.length === 0 && relationship !== 'friend')) return null;

          return (
            <View style={socialStyles.section} key={relationship}>
              {players.length > 0 ? (
                <ThemedText accessibilityRole="header" style={socialStyles.groupTitle}>{title}</ThemedText>
              ) : (
                <View style={styles.emptyFriends}>
                  <View aria-hidden style={styles.emptyAvatars}>
                    <View style={styles.emptySeat} />
                    <View style={styles.emptyPixFrame}>
                      <Image source={emptyPix} style={styles.emptyPix} contentFit="contain" />
                    </View>
                    <View style={styles.emptySeat} />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.emptyFriendsText}>
                    Tes amis apparaîtront ici.
                  </ThemedText>
                </View>
              )}
              {players.map(player => (
                <SocialPlayerRow
                  key={player.id}
                  player={player}
                  onOpen={() => router.push({ pathname: '/joueurs/[playerId]', params: { playerId: player.id } })}
                  trailing={relationship === 'incoming' ? (
                    <View style={styles.requestActions}>
                      <SocialAction label="Refuser" icon="xMark" accessibilityLabel={`Refuser la demande de ${player.name}`}
                        disabled={actions.busy} onPress={() => void actions.change('remove', player.id)} />
                      <SocialAction label="Accepter" icon="check" accent accessibilityLabel={`Accepter la demande de ${player.name}`}
                        disabled={actions.busy} onPress={() => void actions.change('accept', player.id)} />
                    </View>
                  ) : relationship === 'outgoing' ? (
                    <SocialAction label="Annuler" accessibilityLabel={`Annuler la demande à ${player.name}`}
                      disabled={actions.busy} onPress={() => void actions.change('remove', player.id)} />
                  ) : (
                    <SocialAction label="Options" icon="moreHorizontal" quiet accessibilityLabel={`Options pour ${player.name}`}
                      disabled={actions.busy} onPress={() => confirmRemoval(player)} />
                  )}
                />
              ))}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
