import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import SocialAction from '@/components/ui/SocialAction';
import SocialSkeleton from '@/components/ui/SocialSkeleton';
import ThemedText from '@/components/ui/ThemedText';
import { getFriendProfile, renamePlayer } from '@/data/friends';
import { useSession } from '@/data/session-provider';
import { useFriendsQuery } from '@/hooks/use-friends-query';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles as styles } from '@/styles/social';

export default function EditProfilePage() {
  const theme = useTheme();
  const { user } = useSession();
  const userId = user?.id;
  const load = useCallback(() => userId ? getFriendProfile(userId) : Promise.reject(new Error('Reconnecte-toi pour modifier ton profil.')), [userId]);
  const { value, error, reload } = useFriendsQuery(load);
  const [draft, setDraft] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  async function save() {
    if (!value || saving) return;
    const name = (draft ?? value.name).trim();
    if (name.length < 2) {
      setSaveError('Ton pseudo doit contenir au moins deux caractères.');
      return;
    }
    setSaving(true);
    setSaveError(undefined);
    try {
      await renamePlayer(name);
      router.back();
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Impossible de modifier ton pseudo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      {!value && !error && <SocialSkeleton label="Chargement du pseudo" variant="form" />}
      {error && (
        <View style={styles.section}>
          <ThemedText themeColor="danger">{error}</ThemedText>
          <SocialAction label="Réessayer" onPress={reload} />
        </View>
      )}
      {value && (
        <View style={styles.section}>
          <ThemedText type="smallBold">Pseudo public</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Les autres joueurs peuvent te retrouver avec ce pseudo.</ThemedText>
          <TextInput accessibilityLabel="Pseudo public" value={draft ?? value.name}
            onChangeText={text => { setDraft(text); setSaveError(undefined); }}
            maxLength={32} autoCorrect={false} editable={!saving}
            style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.tabBarBorder, color: theme.text }]}
          />
          {saveError && <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{saveError}</ThemedText>}
          <Button label={saving ? 'Enregistrement…' : 'Enregistrer'} disabled={saving} onPress={() => void save()} />
        </View>
      )}
    </Screen>
  );
}
