import { useEffect, useState } from "react";
import { type LayoutRectangle, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { prefersDarkText } from "@/lib/color-contrast";
import { useTheme } from "@/hooks/use-theme";
import { CaptureColors } from "@/styles/theme";

import {
  PILL_HEIGHT,
  PILL_MAX_WIDTH,
  PILL_SIDE_SPACE,
  styles,
} from "./CapturePageDailyColor.styles";

const DURATION = 340;

type Props = {
  hex: string;
  expanded: boolean;
  onToggle: () => void;
};

export default function CapturePageDailyColor({
  hex,
  expanded,
  onToggle,
}: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [area, setArea] = useState<LayoutRectangle>();
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.set(
      withTiming(expanded ? 1 : 0, {
        duration: reduceMotion ? 0 : DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [expanded, progress, reduceMotion]);

  const width = area?.width ?? 0;
  const height = area?.height ?? 0;
  const pillWidth = Math.min(PILL_MAX_WIDTH, width - 2 * PILL_SIDE_SPACE);
  const ink = prefersDarkText(hex)
    ? CaptureColors.accentInk
    : CaptureColors.foreground;

  const panelStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      top: interpolate(p, [0, 1], [8, 0]),
      left: interpolate(p, [0, 1], [(width - pillWidth) / 2, 0]),
      width: interpolate(p, [0, 1], [pillWidth, width]),
      height: interpolate(p, [0, 1], [PILL_HEIGHT, height]),
      borderRadius: interpolate(p, [0, 1], [PILL_HEIGHT / 2, 0]),
      backgroundColor: interpolateColor(
        p,
        [0, 0.4, 1],
        [theme.dailyCard, hex, hex],
      ),
      borderColor: interpolateColor(
        p,
        [0, 0.4, 1],
        [theme.dailyBorder, hex, hex],
      ),
    };
  });
  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.25], [1, 0], "clamp"),
  }));
  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.6, 1], [0, 1], "clamp"),
  }));

  return (
    <View
      pointerEvents="box-none"
      style={styles.layer}
      onLayout={(event) => setArea(event.nativeEvent.layout)}
    >
      {area && pillWidth > 0 && (
        <Animated.View style={[styles.panel, panelStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded
                ? `Couleur du jour ${hex}. Revenir à la caméra`
                : "Voir la couleur du jour"
            }
            accessibilityState={{ expanded }}
            hitSlop={expanded ? undefined : 8}
            onPress={onToggle}
            style={styles.pressable}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.pill, pillStyle]}
            >
              <View style={[styles.dot, { backgroundColor: hex, borderColor: theme.dailySwatchBorder }]} />
              <Text numberOfLines={1} style={[styles.pillLabel, { color: theme.dailyInk }]}>
                Couleur du jour
              </Text>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[styles.expanded, { width, height }, expandedStyle]}
            >
              <Text style={[styles.eyebrow, { color: ink }]}>
                Couleur du jour
              </Text>
              <Text style={[styles.hex, { color: ink }]}>{hex}</Text>
              <Text style={[styles.hint, { color: ink }]}>
                Touche pour revenir à la caméra
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
