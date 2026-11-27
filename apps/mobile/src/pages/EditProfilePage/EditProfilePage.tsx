import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import AvatarPicker from "@/components/ui/AvatarPicker";
import Button from "@/components/ui/Button";
import IconLink from "@/components/ui/IconLink";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import ThemedText from "@/components/ui/ThemedText";
import {
  toMyProfileErrorMessage,
  type MyProfileChanges,
} from "@/data/adapters/my-profile.adapters";
import { useAvatarCatalog } from "@/data/avatar-catalog-provider";
import { useMyProfile } from "@/hooks/use-my-profile";
import {
  DISPLAY_NAME_MAX_LENGTH,
  validateDisplayName,
  type AvatarChoice,
} from "@/lib/profile";

import { styles } from "./EditProfilePage.styles";

export default function EditProfilePage() {
  const avatarCatalog = useAvatarCatalog();
  const { profile, loadFailed, load, update } = useMyProfile();
  // null = untouched, the saved value is shown.
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftAvatar, setDraftAvatar] = useState<AvatarChoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    return (
      <Screen>
        {loadFailed ? (
          <View style={styles.form}>
            <ThemedText themeColor="danger" accessibilityRole="alert">
              Impossible de charger ton profil.
            </ThemedText>
            <Button
              label="Réessayer"
              onPress={() => void load(true)}
            />
          </View>
        ) : (
          <ThemedText themeColor="textSecondary">Chargement du profil…</ThemedText>
        )}
      </Screen>
    );
  }

  const displayName = draftName ?? profile.displayName;
  const avatar = draftAvatar ?? profile.avatar;

  const changes: MyProfileChanges = {};
  if (displayName.trim() !== profile.displayName) changes.displayName = displayName;
  if (
    avatar.avatar !== profile.avatar.avatar ||
    avatar.background !== profile.avatar.background
  ) {
    changes.avatar = avatar;
  }
  const hasChanges = Object.keys(changes).length > 0;

  async function handleSave() {
    if (changes.displayName !== undefined) {
      const displayNameError = validateDisplayName(changes.displayName);
      if (displayNameError) {
        setError(displayNameError);
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      await update(changes);
      router.back();
    } catch (saveError) {
      setError(toMyProfileErrorMessage(saveError));
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.form}>
        <AvatarPicker
          catalog={avatarCatalog.catalog}
          loadFailed={avatarCatalog.loadFailed}
          onRetry={avatarCatalog.retry}
          value={avatar}
          onChange={setDraftAvatar}
        />
        <IconLink href="/recompenses" icon="gift" label="Gérer mes accessoires Pix" />
        <TextField
          label="Pseudo"
          value={displayName}
          onChangeText={(text) => {
            setDraftName(text);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="nickname"
          textContentType="nickname"
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          editable={!saving}
          returnKeyType="done"
          onSubmitEditing={hasChanges ? handleSave : undefined}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Les autres joueurs te retrouvent avec ce pseudo.
        </ThemedText>

        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        )}

        <Button
          label={saving ? "Enregistrement…" : "Enregistrer"}
          onPress={handleSave}
          disabled={saving || !hasChanges}
        />
      </View>
    </Screen>
  );
}
