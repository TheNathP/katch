import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ENTRANCE_DURATION = 460;
const PREVIEW_FADE_DURATION = 240;

export function useCaptureMotion(ready: boolean) {
  const reduceMotion = useReducedMotion();
  const entrance = useSharedValue(0);
  const previewShown = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      entrance.set(
        withTiming(1, {
          duration: reduceMotion ? 180 : ENTRANCE_DURATION,
          easing: Easing.out(Easing.cubic),
        }),
      );
      // Reset while hidden, so the next opening starts from the beginning.
      return () => {
        cancelAnimation(entrance);
        entrance.set(0);
      };
    }, [entrance, reduceMotion]),
  );

  useEffect(() => {
    previewShown.set(
      ready ? withTiming(1, { duration: PREVIEW_FADE_DURATION }) : 0,
    );
    return () => cancelAnimation(previewShown);
  }, [ready, previewShown]);

  const viewfinderStyle = useAnimatedStyle(() => {
    const progress = entrance.get();
    return {
      opacity: interpolate(progress, [0, 0.6], [0, 1], "clamp"),
      transform: reduceMotion
        ? []
        : [
            { translateY: interpolate(progress, [0, 1], [32, 0]) },
            { scale: interpolate(progress, [0, 1], [0.9, 1]) },
          ],
    };
  });
  const topBarStyle = useAnimatedStyle(() => {
    const progress = entrance.get();
    return {
      opacity: interpolate(progress, [0.35, 1], [0, 1], "clamp"),
      transform: reduceMotion
        ? []
        : [{ translateY: interpolate(progress, [0, 1], [-16, 0]) }],
    };
  });
  const controlsStyle = useAnimatedStyle(() => {
    const progress = entrance.get();
    return {
      opacity: interpolate(progress, [0.15, 0.8], [0, 1], "clamp"),
      transform: reduceMotion
        ? []
        : [{ translateY: interpolate(progress, [0, 1], [72, 0]) }],
    };
  });
  const previewCoverStyle = useAnimatedStyle(() => ({
    opacity: 1 - previewShown.get(),
  }));

  return { viewfinderStyle, topBarStyle, controlsStyle, previewCoverStyle };
}
