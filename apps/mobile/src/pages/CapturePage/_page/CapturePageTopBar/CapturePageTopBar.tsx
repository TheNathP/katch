import type { FlashMode } from "expo-camera";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { CaptureColors } from "@/styles/theme";

import { styles } from "./CapturePageTopBar.styles";

type Props = {
  top: number;
  flash: FlashMode;
  onBack: () => void;
  onToggleFlash: () => void;
};

export default function CapturePageTopBar({
  top,
  flash,
  onBack,
  onToggleFlash,
}: Props) {
  const flashOn = flash !== "off";

  return (
    <View pointerEvents="box-none" style={[styles.bar, { top: top + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          source={require("@/assets/icons/arrow-left.svg")}
          contentFit="contain"
          tintColor={CaptureColors.foreground}
          style={styles.icon}
        />
      </Pressable>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Flash"
        accessibilityState={{ checked: flashOn }}
        hitSlop={8}
        onPress={onToggleFlash}
        style={({ pressed }) => [
          styles.button,
          flashOn && styles.active,
          pressed && styles.pressed,
        ]}
      >
        <Image
          source={require("@/assets/icons/lightning.svg")}
          contentFit="contain"
          tintColor={
            flashOn ? CaptureColors.accentInk : CaptureColors.foreground
          }
          style={styles.icon}
        />
      </Pressable>
    </View>
  );
}
