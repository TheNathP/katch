import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import PhotoReticle, { photoReticleSize } from "@/components/ui/PhotoReticle";
import type { ChallengeAttempt } from "@/data/challenge-attempt";
import { useTheme } from "@/hooks/use-theme";
import { containPhoto } from "@/lib/photo-fit";

import { styles } from "./ChallengeResultPagePhoto.styles";

export default function ChallengeResultPagePhoto({ attempt }: { attempt: ChallengeAttempt }) {
  const theme = useTheme();
  const { photoUri, photoSize, matchedArea, matchedHex } = attempt;
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const pulse = useSharedValue(0);
  const image = containPhoto(frame, photoSize);
  const canHighlight = matchedArea !== null && !reduceMotion;
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.68 + pulse.get() * 0.13 }],
  }));

  function highlight() {
    cancelAnimation(pulse);
    pulse.set(0);
    pulse.set(withSequence(withTiming(1, { duration: 140 }), withTiming(0, { duration: 230 })));
  }

  return (
    <Pressable
      accessibilityRole={canHighlight ? "button" : "image"}
      accessibilityLabel={matchedArea ? "Photo du défi avec la couleur repérée" : "Photo du défi"}
      accessibilityHint={canHighlight ? "Fait ressortir la zone repérée" : undefined}
      disabled={!canHighlight}
      onPress={highlight}
      onLayout={({ nativeEvent: { layout } }) => setFrame({ width: layout.width, height: layout.height })}
      style={[styles.frame, { backgroundColor: theme.dailySurface, height: Math.max(170, Math.min(300, height * 0.34)) }]}
    >
      <Image aria-hidden source={{ uri: photoUri }} cachePolicy="none" blurRadius={24} contentFit="cover" style={styles.ambientPhoto} />
      <Image aria-hidden source={{ uri: photoUri }} cachePolicy="none" contentFit="contain" style={styles.photo} />
      {matchedArea && image.width > 0 && (
        <Animated.View
          aria-hidden
          pointerEvents="none"
          style={[
            styles.anchor,
            {
              left: image.left + (matchedArea.x + matchedArea.width / 2) * image.width - photoReticleSize / 2,
              top: image.top + (matchedArea.y + matchedArea.height / 2) * image.height - photoReticleSize / 2,
            },
            pulseStyle,
          ]}>
          <PhotoReticle color={matchedHex} />
        </Animated.View>
      )}
    </Pressable>
  );
}
