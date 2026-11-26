import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { CaptureColors } from "@/styles/theme";

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
  return (
    <View style={[styles.panel, { paddingBottom: bottom + 28 }]}>
      {error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
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
            tintColor={CaptureColors.foreground}
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
            (!canCapture || pressed) && styles.shutterDimmed,
          ]}
        >
          <View style={styles.shutterCenter}>
            {busy && <ActivityIndicator color={CaptureColors.accentInk} />}
          </View>
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
            tintColor={CaptureColors.foreground}
            style={styles.flipIcon}
          />
        </Pressable>
      </View>
    </View>
  );
}
