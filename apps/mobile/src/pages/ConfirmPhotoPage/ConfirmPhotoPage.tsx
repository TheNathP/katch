import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import { CaptureColors } from "@/styles/theme";

import { styles } from "./ConfirmPhotoPage.styles";

/** Only local files produced by the camera or the photo library are accepted. */
const isLocalPhoto = (uri: unknown): uri is string =>
  typeof uri === "string" && /^(file|content|ph):\/\//.test(uri);

export default function ConfirmPhotoPage() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const photoUri = isLocalPhoto(uri) ? uri : undefined;

  const retake = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/defi");
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {photoUri ? "Cette photo te convient ?" : "Photo introuvable"}
        </Text>
        <Text style={styles.subtitle}>
          {photoUri
            ? "Vérifie que la couleur que tu vises est bien visible au centre de l’image."
            : "La photo n’a pas pu être chargée. Reprends-en une."}
        </Text>
        <View style={styles.photoCard}>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              contentFit="cover"
              accessibilityLabel="Photo à valider"
              style={styles.photo}
            />
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={retake}
          style={({ pressed }) => [
            styles.secondary,
            pressed && styles.secondaryPressed,
          ]}
        >
          <Image
            source={require("@/assets/icons/refresh.svg")}
            contentFit="contain"
            tintColor={CaptureColors.foreground}
            style={styles.secondaryIcon}
          />
          <Text style={styles.secondaryLabel}>Refaire</Text>
        </Pressable>
        <Button
          label="Valider"
          variant="limeSolid"
          disabled={!photoUri}
          onPress={() => router.replace("/defi/resultat")}
          style={styles.primary}
        />
      </View>
    </SafeAreaView>
  );
}
