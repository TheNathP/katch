import MaskedView from '@react-native-masked-view/masked-view';
import { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { Platform, useWindowDimensions, View, type ViewProps } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ComicFeedbackColors } from '@/styles/theme';

import { styles } from './OnboardingPageFeedback.styles';

// The package's legacy class declaration is incompatible with the app's React JSX types.
const NativeMask = MaskedView as unknown as ComponentType<ViewProps & { maskElement: ReactElement }>;

const edgeBuffer = 76;
const trailingDelay = 0.012;

type Props = {
  children: ReactNode;
  progress: SharedValue<number>;
  validated: boolean;
};

function waveEdge(height: number, diagonal: number, offset: number) {
  const point = (x: number, y: number) => `${x + offset + diagonal * (1 - y)} ${height * y}`;
  return `M${point(30, 0)}
    C${point(33, 0.12)} ${point(61, 0.11)} ${point(56, 0.29)}
    S${point(8, 0.53)} ${point(17, 0.69)}
    S${point(53, 0.85)} ${point(37, 1)}`;
}

export default function OnboardingPageFeedbackWave({ children, progress, validated }: Props) {
  const { width, height } = useWindowDimensions();
  const palette = validated ? ComicFeedbackColors.validated : ComicFeedbackColors.rejected;
  const diagonal = Math.min(width * 0.82, height * 0.5);
  const entryBuffer = edgeBuffer + diagonal;
  const span = width + entryBuffer + edgeBuffer;
  const edge = waveEdge(height, diagonal, 0);
  const maskPath = `${edge} H${span} V0 Z`;

  const wave = useAnimatedStyle(() => ({ transform: [{ translateX: span * progress.get() }] }));
  // Move the artwork equally in the other direction to keep it aligned while the mask sweeps.
  const pinned = useAnimatedStyle(() => ({ transform: [{ translateX: entryBuffer - span * progress.get() }] }));
  const trailing = useAnimatedStyle(() => {
    const front = progress.get();
    const back = Math.max(0, (front - trailingDelay) / (1 - trailingDelay));
    return { transform: [{ translateX: span * (back - front) }] };
  });

  const artwork = <Animated.View style={[styles.waveArtwork, { width, height }, pinned]}>{children}</Animated.View>;
  const webMask = { width: span, height, clipPath: `path("${maskPath.replace(/\s+/g, ' ')}")` };

  return (
    <Animated.View style={[styles.wave, { width: span, height, left: -entryBuffer }, wave]}>
      {Platform.OS === 'web' ? (
        <View style={webMask}>{artwork}</View>
      ) : (
        <NativeMask
          style={{ width: span, height }}
          maskElement={<Svg width={span} height={height}><Path d={maskPath} fill="black" /></Svg>}>
          {artwork}
        </NativeMask>
      )}
      <View aria-hidden pointerEvents="none" style={styles.backdrop}>
        <Animated.View style={[styles.backdrop, trailing]}>
          <Svg width={span} height={height}>
            <Path d={waveEdge(height, diagonal, -8)} stroke={palette.shade} strokeWidth={9} fill="none" />
          </Svg>
        </Animated.View>
        <Svg width={span} height={height}>
          <Path d={edge} stroke={palette.middle} strokeWidth={17} fill="none" />
        </Svg>
      </View>
    </Animated.View>
  );
}
