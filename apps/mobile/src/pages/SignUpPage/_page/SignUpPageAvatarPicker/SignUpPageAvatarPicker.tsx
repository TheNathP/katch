import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import ThemedText from "@/components/ui/ThemedText";
import type { AvatarCatalog } from "@/data/adapters/avatar-catalog.adapters";
import type { AvatarChoice } from "@/lib/profile";

import { styles } from "./SignUpPageAvatarPicker.styles";

type SignUpPageAvatarPickerProps = {
  /** null while loading, or when loading failed and nothing is cached. */
  catalog: AvatarCatalog | null;
  loadFailed: boolean;
  onRetry: () => void;
  value: AvatarChoice | null;
  onChange: (value: AvatarChoice) => void;
};

/** Shows the profile picture; tapping it reveals the avatar and background lists. */
export default function SignUpPageAvatarPicker({
  catalog,
  loadFailed,
  onRetry,
  value,
  onChange,
}: SignUpPageAvatarPickerProps) {
  const [open, setOpen] = useState(false);

  if (!catalog || !value) {
    return (
      <View style={styles.picker}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Photo de profil"
          accessibilityHint={loadFailed ? "Réessaie de charger les photos" : undefined}
          disabled={!loadFailed}
          onPress={onRetry}
          style={styles.preview}
        >
          <Avatar size={112} />
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary" style={styles.status}>
          {loadFailed
            ? "Impossible de charger les photos. Touche pour réessayer."
            : "Chargement des photos…"}
        </ThemedText>
      </View>
    );
  }

  const avatar = catalog.avatars.find((item) => item.id === value.avatar);
  const background = catalog.backgrounds.find(
    (item) => item.id === value.background,
  );

  return (
    <View style={styles.picker}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Photo de profil"
        accessibilityHint={
          open ? "Masque les choix de photo" : "Affiche les choix de photo"
        }
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [
          styles.preview,
          pressed && styles.previewPressed,
        ]}
      >
        <Avatar
          imageUrl={avatar?.imageUrl}
          backgroundHex={background?.hex}
          size={112}
        />
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeLabel}>
            {open ? "Terminé" : "Modifier"}
          </Text>
        </View>
      </Pressable>

      {open && (
        <View style={styles.lists}>
          <ThemedText type="small" themeColor="textSecondary">
            Avatar
          </ThemedText>
          <View style={styles.grid}>
            {catalog.avatars.map((item, index) => {
              const selected = item.id === value.avatar;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`Avatar ${index + 1}`}
                  accessibilityState={{ selected }}
                  onPress={() => onChange({ ...value, avatar: item.id })}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Avatar
                    imageUrl={item.imageUrl}
                    backgroundHex={background?.hex}
                    size={52}
                  />
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            Couleur de fond
          </ThemedText>
          <View style={styles.grid}>
            {catalog.backgrounds.map((item) => {
              const selected = item.id === value.background;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected }}
                  onPress={() => onChange({ ...value, background: item.id })}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View
                    style={[styles.swatch, { backgroundColor: item.hex }]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
