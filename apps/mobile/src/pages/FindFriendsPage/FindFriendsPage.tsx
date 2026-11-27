import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import Screen from '@/components/ui/Screen';
import SocialAction from '@/components/ui/SocialAction';
import SocialPlayerRow from '@/components/ui/SocialPlayerRow';
import SocialSkeleton from '@/components/ui/SocialSkeleton';
import ThemedText from '@/components/ui/ThemedText';
import { searchFriends } from '@/data/friends';
import { useFriendsQuery } from '@/hooks/use-friends-query';
import { useFriendshipActions } from '@/hooks/use-friendship-actions';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './FindFriendsPage.styles';

const pix = require('@/assets/images/pix/confident-aqua.png');
const restingPix = require('@/assets/images/pix/sleeping.png');
const corner = require('@/assets/icon-illus/decorations/onboarding-purple-corner.svg');
const closeIcon = require('@/assets/icons/close.svg');
const searchDelay = 280;

export default function FindFriendsPage() {
  const theme = useTheme();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [input, setInput] = useState(q ?? '');
  const [query, setQuery] = useState(q ?? '');
  const term = input.trim();
  const searching = term.length >= 2;
  const load = useCallback((signal: AbortSignal) => query ? searchFriends(query, signal) : Promise.resolve([]), [query]);
  const { value, error, reload, update } = useFriendsQuery(load);
  const actions = useFriendshipActions((action, target) => {
    update(players => players.map(player => player.id === target
      ? { ...player, relationship: action === 'accept' ? 'friend' : 'outgoing' }
      : player));
    reload();
  });
  const matchesQuery = searching && term === query;
  const results = matchesQuery ? value : undefined;
  const searchError = matchesQuery ? error : undefined;
  const loading = searching && !results && !searchError;

  const commitQuery = useCallback((text: string) => {
    setQuery(text);
    router.setParams({ q: text });
  }, []);

  useEffect(() => {
    if (!searching || matchesQuery) return;
    const timer = setTimeout(() => commitQuery(term), searchDelay);
    return () => clearTimeout(timer);
  }, [commitQuery, matchesQuery, searching, term]);

  function changeInput(text: string) {
    setInput(text);
    if (text.trim().length < 2 && query) commitQuery('');
  }

  return (
    <Screen>
      <View style={socialStyles.layout}>
        <View style={styles.searchCard}>
          <Image source={corner} style={styles.corner} aria-hidden contentFit="contain" />
          <View style={styles.intro}>
            <ThemedText accessibilityRole="header" style={styles.title}>Un pseudo suffit.</ThemedText>
            <Image source={pix} style={styles.pix} aria-hidden contentFit="contain" />
          </View>
          <View style={styles.searchField}>
            <View aria-hidden style={styles.searchIcon}>
              <Svg width={21} height={21} viewBox="0 0 24 24" stroke={OnboardingColors.purple} strokeWidth={2.2} fill="none">
                <Circle cx={10.5} cy={10.5} r={6} />
                <Path d="m15 15 4.5 4.5" strokeLinecap="round" />
              </Svg>
            </View>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Pseudo du joueur"
              value={input}
              onChangeText={changeInput}
              onSubmitEditing={() => { if (searching && !matchesQuery) commitQuery(term); }}
              returnKeyType="search"
              maxLength={32}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Chercher un pseudo"
              placeholderTextColor={OnboardingColors.muted}
              style={styles.input}
            />
            {input !== '' && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Effacer la recherche"
                onPress={() => { changeInput(''); inputRef.current?.focus(); }}
                style={styles.clearButton}>
                <Image source={closeIcon} aria-hidden style={styles.closeIcon} tintColor={OnboardingColors.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {!searching && term !== '' && (
          <ThemedText type="small" themeColor="textSecondary">Saisis au moins deux caractères.</ThemedText>
        )}
        {(searchError || actions.error) && (
          <View style={socialStyles.section}>
            <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{actions.error ?? searchError}</ThemedText>
            {searchError && <SocialAction label="Réessayer" onPress={reload} />}
          </View>
        )}
        {searching && (loading || results) && (
          <View style={socialStyles.section}>
            <ThemedText accessibilityRole="header" style={socialStyles.groupTitle}>Joueurs</ThemedText>
            {loading && <SocialSkeleton label="Recherche en cours" />}
            {results?.length === 0 && (
              <View style={[styles.noResults, { borderColor: theme.tabBarBorder, backgroundColor: theme.tabBarBackground }]}>
                <Image source={restingPix} aria-hidden style={styles.restingPix} contentFit="contain" />
                <View style={styles.noResultsCopy}>
                  <ThemedText type="smallBold" accessibilityLiveRegion="polite">Aucun joueur trouvé</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Vérifie le pseudo ou essaie une autre recherche.</ThemedText>
                </View>
              </View>
            )}
            {results?.map(player => (
              <SocialPlayerRow
                key={player.id}
                player={player}
                subtitle={player.relationship === 'friend' ? 'Déjà dans tes amis'
                  : player.relationship === 'outgoing' ? 'Demande envoyée'
                  : player.relationship === 'incoming' ? 'T’a envoyé une demande' : undefined}
                onOpen={() => router.push({ pathname: '/joueurs/[playerId]', params: { playerId: player.id } })}
                trailing={(player.relationship === 'none' || player.relationship === 'incoming') && (
                  <SocialAction
                    accent
                    label={player.relationship === 'none' ? 'Ajouter' : 'Accepter'}
                    accessibilityLabel={player.relationship === 'none' ? `Ajouter ${player.name}` : `Accepter la demande de ${player.name}`}
                    disabled={actions.busy}
                    onPress={() => void actions.change(player.relationship === 'none' ? 'request' : 'accept', player.id)}
                  />
                )}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
