import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./CapturePageControls.styles";

type Props = {
  bottom: number;
  canCapture: boolean;
  busy: boolean;
  error?: string;
  onCapture: () => void;
  onOpenLibrary: () => void;
  onFlip: () => void;
};

export default function CapturePageControls({
  bottom,
  canCapture,
  busy,
  error,
  onCapture,
  onOpenLibrary,
  onFlip,
}: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.panel, { paddingBottom: bottom + 28 }]}>
      {error && (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.danger }]}>
          {error}
        </Text>
      )}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une photo dans ma galerie"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          hitSlop={8}
          onPress={onOpenLibrary}
          style={({ pressed }) => [
            styles.sideButton,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: "photo", android: "image", web: "image" }}
            tintColor={theme.dailyInk}
            size={30}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          accessibilityState={{ disabled: !canCapture, busy }}
          disabled={!canCapture}
          onPress={onCapture}
          style={({ pressed }) => [
            styles.shutter,
            { borderColor: theme.dailyInk },
            (!canCapture || pressed) && styles.shutterDimmed,
          ]}
        >
          <View style={styles.shutterCenter} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Changer de caméra"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          hitSlop={8}
          onPress={onFlip}
          style={({ pressed }) => [
            styles.sideButton,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={require("@/assets/icons/refresh.svg")}
            contentFit="contain"
            tintColor={theme.dailyInk}
            style={styles.flipIcon}
          />
        </Pressable>
      </View>
    </View>
  );
}
