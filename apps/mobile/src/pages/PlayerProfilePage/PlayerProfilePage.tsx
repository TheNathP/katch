import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import SocialAction from '@/components/ui/SocialAction';
import { getSocialAvatar } from '@/components/ui/SocialPlayerRow';
import SocialSkeleton from '@/components/ui/SocialSkeleton';
import ThemedText from '@/components/ui/ThemedText';
import { getPlayerSocialProfile } from '@/data/friends';
import { useSession } from '@/data/session-provider';
import { useFriendsQuery } from '@/hooks/use-friends-query';
import { useFriendshipActions } from '@/hooks/use-friendship-actions';
import { usePhotoReactions } from '@/hooks/use-photo-reactions';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

import PlayerProfileResult from './_page/PlayerProfileResult';
import { styles } from './PlayerProfilePage.styles';

const lock = require('@/assets/icons/lock.svg');
const corner = require('@/assets/icon-illus/decorations/onboarding-purple-corner.svg');

export default function PlayerProfilePage() {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const { user } = useSession();
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const ownProfile = user?.id === playerId;
  const load = useCallback((signal: AbortSignal) => getPlayerSocialProfile(playerId, user?.id, signal), [playerId, user?.id]);
  const { value, error, reload, update } = useFriendsQuery(load);
  const actions = useFriendshipActions(action => {
    update(profile => ({
      ...profile,
      relationship: action === 'remove' ? 'none' : action === 'accept' ? 'friend' : 'outgoing',
    }));
    reload();
  });
  const avatar = value ? getSocialAvatar(value.id) : undefined;
  const { pending, reactionErrors, react } = usePhotoReactions(user?.id, (attempt, reactions) => {
    update(profile => ({
      ...profile,
      results: profile.results.map(result => result.photo?.status === 'available' && result.photo.id === attempt
        ? { ...result, photo: { ...result.photo, reactions } }
        : result),
    }));
  });

  return (
    <Screen>
      {!value && !error && <SocialSkeleton label="Chargement du profil" variant="profile" />}
      {(error || actions.error) && (
        <View style={socialStyles.section}>
          <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{actions.error ?? error}</ThemedText>
          {error && <SocialAction label="Réessayer" onPress={reload} />}
        </View>
      )}
      {value && avatar && (
        <View style={socialStyles.layout}>
          <View style={styles.card}>
            <Image source={corner} aria-hidden contentFit="contain" style={styles.corner} />
            <View aria-hidden style={[styles.medallion, { backgroundColor: avatar[1] }]}>
              <Image source={avatar[0]} style={styles.avatar} contentFit="contain" />
            </View>
            <ThemedText accessibilityRole="header" style={styles.name}>{value.name}</ThemedText>
            <View style={styles.statusSlot}>
              {(value.relationship !== 'none' || ownProfile) && (
                <View style={[styles.status, value.relationship === 'friend' && styles.friendStatus]}>
                  <ThemedText type="smallBold" style={styles.statusLabel} accessibilityLiveRegion="polite">
                    {ownProfile ? 'Ton profil' : value.relationship === 'friend' ? 'Dans tes amis'
                      : value.relationship === 'outgoing' ? 'Demande envoyée' : 'Demande reçue'}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {!ownProfile && value.relationship !== 'friend' && (
            value.relationship === 'outgoing' ? (
              <SocialAction label="Annuler la demande" disabled={actions.busy}
                onPress={() => void actions.change('remove', playerId)} />
            ) : (
              <Button label={value.relationship === 'incoming' ? 'Accepter la demande' : 'Ajouter en ami'}
                disabled={actions.busy}
                onPress={() => void actions.change(value.relationship === 'incoming' ? 'accept' : 'request', playerId)} />
            )
          )}

          <View style={socialStyles.section}>
            <ThemedText accessibilityRole="header" style={socialStyles.groupTitle}>Résultats récents</ThemedText>
            {user && value.canViewResults && value.results.length > 0 && (
              <>
                <ThemedText type="small" themeColor="textSecondary">Les 4 derniers jours</ThemedText>
                <View style={styles.resultGrid}>
                  {value.results.slice(0, 4).map(result => {
                    const attempt = result.photo?.status === 'available' ? result.photo.id : undefined;
                    return (
                      <PlayerProfileResult
                        key={attempt ?? result.date}
                        result={result}
                        viewerId={user.id}
                        canReact={value.relationship === 'friend'}
                        wide={fontScale > 1.4}
                        busy={!!attempt && pending.has(attempt)}
                        error={attempt ? reactionErrors[attempt] : undefined}
                        onReact={reaction => attempt ? react(attempt, reaction) : Promise.resolve(false)}
                        onReload={reload}
                      />
                    );
                  })}
                </View>
              </>
            )}
            {value.results.length === 0 && (
              <View style={[styles.result, { backgroundColor: theme.tabBarBackground, borderColor: theme.tabBarBorder }]}>
                {!value.canViewResults && (
                  <View aria-hidden style={styles.lockFrame}>
                    <Image source={lock} style={styles.lockIcon} tintColor={OnboardingColors.purple} contentFit="contain" />
                  </View>
                )}
                <View style={styles.resultCopy}>
                  <ThemedText type="smallBold">{value.canViewResults ? 'Aucun résultat pour le moment' : 'Résultats privés'}</ThemedText>
                  {!value.canViewResults && (
                    <ThemedText type="small" themeColor="textSecondary">Les résultats sont visibles par ses amis.</ThemedText>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}
