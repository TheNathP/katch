import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import SocialAction from '@/components/ui/SocialAction';
import SocialSkeleton from '@/components/ui/SocialSkeleton';
import SocialPlayerRow from '@/components/ui/SocialPlayerRow';
import ThemedText from '@/components/ui/ThemedText';
import { getFriends } from '@/data/friends';
import type { SocialPlayer } from '@/data/social-api.types';
import { useFriendsQuery } from '@/hooks/use-friends-query';
import { useFriendshipActions } from '@/hooks/use-friendship-actions';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles as styles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

const corner = require('@/assets/icon-illus/decorations/onboarding-purple-corner.svg');
const duo = require('@/assets/images/pix/friends-high-five.png');
const emptyPix = require('@/assets/images/pix/happy-rose.png');
const chevron = require('@/assets/icons/chevron-right.svg');
const check = require('@/assets/icons/check.svg');
const close = require('@/assets/icons/close.svg');

const sections = [
  { relationship: 'incoming', title: 'Demandes reçues' },
  { relationship: 'friend', title: 'Ta liste d’amis' },
  { relationship: 'outgoing', title: 'Demandes envoyées' },
] as const;

export default function FriendsPage() {
  const theme = useTheme();
  const { value, error, reload } = useFriendsQuery(getFriends);
  const actions = useFriendshipActions(reload);
  const [confirm, setConfirm] = useState<SocialPlayer>();
  const count = value?.players.filter(player => player.relationship === 'friend').length ?? 0;

  return (
    <Screen>
      <View style={styles.layout}>
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
                  <ThemedText type="smallBold" style={styles.friendsBadgeText}>
                    {count > 1 ? `${count} amis` : `${count} ami`}
                  </ThemedText>
                </View>
              ) : !error && <View aria-hidden style={styles.friendsBadgeSkeleton} />}
            </View>
          </View>
        </View>
        <Button label="Trouver des amis" trailingIcon={chevron} onPress={() => router.push('/amis/recherche')} />
        {(error || actions.error) && (
          <View style={styles.section}>
            <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{actions.error ?? error}</ThemedText>
            {error && <SocialAction label="Réessayer" onPress={reload} />}
          </View>
        )}
        {!value && !error && <SocialSkeleton label="Chargement des amis" />}
        {sections.map(({ relationship, title }) => {
          const players = value?.players.filter(player => player.relationship === relationship) ?? [];
          if (!value || (players.length === 0 && relationship !== 'friend')) return null;

          return (
            <View style={styles.section} key={relationship}>
              {players.length > 0 ? (
                <ThemedText accessibilityRole="header" style={styles.groupTitle}>{title}</ThemedText>
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
                <View key={player.id} style={styles.section}>
                  <SocialPlayerRow
                    player={player}
                    onOpen={() => router.push({ pathname: '/joueurs/[playerId]', params: { playerId: player.id } })}
                    trailing={relationship === 'incoming' ? (
                      <View style={styles.requestActions}>
                        <SocialAction label="Refuser" icon={close} accessibilityLabel={`Refuser la demande de ${player.name}`}
                          disabled={actions.busy} onPress={() => void actions.change('remove', player.id)} />
                        <SocialAction label="Accepter" icon={check} accent accessibilityLabel={`Accepter la demande de ${player.name}`}
                          disabled={actions.busy} onPress={() => void actions.change('accept', player.id)} />
                      </View>
                    ) : (
                      <SocialAction label={relationship === 'outgoing' ? 'Annuler' : 'Gérer'}
                        accessibilityLabel={relationship === 'outgoing' ? `Annuler la demande à ${player.name}` : `Gérer ${player.name}`}
                        disabled={actions.busy}
                        onPress={() => relationship === 'outgoing' ? void actions.change('remove', player.id) : setConfirm(player)} />
                    )}
                  />
                  {confirm?.id === player.id && (
                    <View style={[styles.confirmation, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText type="smallBold">Retirer {player.name} de tes amis ?</ThemedText>
                      <View style={styles.confirmationActions}>
                        <SocialAction label="Garder" onPress={() => setConfirm(undefined)} />
                        <SocialAction label="Retirer" danger disabled={actions.busy}
                          onPress={() => {
                            setConfirm(undefined);
                            void actions.change('remove', player.id);
                          }} />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
