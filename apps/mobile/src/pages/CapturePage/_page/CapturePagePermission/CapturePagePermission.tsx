import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import { CaptureColors } from "@/styles/theme";

import { styles } from "./CapturePagePermission.styles";

export type CameraAccessState = "loading" | "ask" | "settings" | "unavailable";

type Props = {
  insets: EdgeInsets;
  state: CameraAccessState;
  error?: string;
  onBack: () => void;
  onActivate: () => void;
  onOpenLibrary?: () => void;
};

const messages: Record<
  Exclude<CameraAccessState, "loading">,
  { title: string; body: string }
> = {
  ask: {
    title: "Active ta caméra",
    body: "Katch a besoin de la caméra pour photographier la couleur du jour. Tes photos ne sont envoyées que lorsque tu les valides.",
  },
  settings: {
    title: "Caméra désactivée",
    body: "L’accès à la caméra a été refusé. Active-le dans les réglages de ton téléphone pour jouer.",
  },
  unavailable: {
    title: "Caméra indisponible",
    body: "Aucune caméra n’est disponible sur cet appareil.",
  },
};

export default function CapturePagePermission({
  insets,
  state,
  error,
  onBack,
  onActivate,
  onOpenLibrary,
}: Props) {
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Image
          source={require("@/assets/icons/arrow-left.svg")}
          contentFit="contain"
          tintColor={CaptureColors.foreground}
          style={styles.backIcon}
        />
      </Pressable>

      {state === "loading" ? (
        <View style={styles.content}>
          <ActivityIndicator color={CaptureColors.foreground} />
        </View>
      ) : (
        <View style={styles.content}>
          <Image
            aria-hidden
            source={require("@/assets/images/pix/sad.png")}
            contentFit="contain"
            style={styles.mascot}
          />
          <Text accessibilityRole="header" style={styles.title}>
            {messages[state].title}
          </Text>
          <Text style={styles.body}>{messages[state].body}</Text>
          {state !== "unavailable" && (
            <Button
              label={
                state === "ask" ? "Autoriser la caméra" : "Ouvrir les réglages"
              }
              variant="limeSolid"
              onPress={onActivate}
              style={styles.action}
            />
          )}
          {onOpenLibrary && (
            <Button
              label="Choisir dans ma galerie"
              variant="limeSolid"
              onPress={onOpenLibrary}
              style={styles.action}
            />
          )}
          {error && (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
