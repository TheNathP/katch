import { Image } from "expo-image";
import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { CaptureColors } from "@/styles/theme";

import { styles } from "./CapturePageViewfinder.styles";

const RING_SIZE = 156;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const RING_GAP = 22;

type Props = PropsWithChildren<{
  overlay?: ReactNode;
}>;

export default function CapturePageViewfinder({ children, overlay }: Props) {
  return (
    <View style={styles.viewfinder}>
      {children}
      <View aria-hidden pointerEvents="none" style={styles.overlay}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={CaptureColors.guide}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${RING_LENGTH - RING_GAP} ${RING_GAP}`}
              fill="none"
            />
          </Svg>
        </View>
      </View>
      <Image
        aria-hidden
        source={require("@/assets/images/pix/excited.png")}
        contentFit="contain"
        style={styles.mascot}
      />
      {overlay}
    </View>
  );
}
