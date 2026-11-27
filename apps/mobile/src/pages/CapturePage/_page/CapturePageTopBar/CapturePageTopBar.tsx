import type { FlashMode } from "expo-camera";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
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
  const theme = useTheme();
  const flashOn = flash !== "off";

  return (
    <View pointerEvents="box-none" style={[styles.bar, { top: top + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.button, { backgroundColor: pressed ? theme.dailySurface : theme.dailyCard, borderColor: theme.dailyBorder }]}
      >
        <Image
          source={require("@/assets/icons/arrow-left.svg")}
          contentFit="contain"
          tintColor={theme.dailyInk}
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
          { backgroundColor: pressed ? theme.dailySurface : theme.dailyCard, borderColor: theme.dailyBorder },
          flashOn && styles.active,
          flashOn && pressed && styles.activePressed,
        ]}
      >
        <Image
          source={require("@/assets/icons/lightning.svg")}
          contentFit="contain"
          tintColor={
            flashOn ? CaptureColors.accentInk : theme.dailyInk
          }
          style={styles.icon}
        />
      </Pressable>
    </View>
  );
}
