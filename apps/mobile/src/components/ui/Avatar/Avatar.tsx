import { Image, type ImageProps } from "expo-image";
import { View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./Avatar.styles";

type AvatarProps = {
  /** Remote image; omitted while the catalog is loading. */
  imageUrl?: string;
  imageSource?: ImageProps["source"];
  backgroundSource?: ImageProps["source"];
  frameColor?: string;
  fallbackSource?: ImageProps["source"];
  /** Background color from the catalog (`#RRGGBB`). */
  backgroundHex?: string;
  size?: number;
};

export default function Avatar({
  imageUrl,
  imageSource,
  backgroundSource,
  frameColor,
  fallbackSource,
  backgroundHex,
  size = 64,
}: AvatarProps) {
  const theme = useTheme();
  const source = imageSource ?? imageUrl ?? fallbackSource;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundHex ?? theme.backgroundElement,
        },
      ]}
    >
      {backgroundSource && (
        <Image aria-hidden source={backgroundSource} style={styles.backgroundImage} contentFit="fill" />
      )}
      {source != null && (
        <Image
          aria-hidden
          source={source}
          placeholder={imageUrl && !imageSource ? fallbackSource : undefined}
          placeholderContentFit="contain"
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
        />
      )}
      {frameColor && (
        <View aria-hidden style={[styles.frame, {
          borderRadius: size / 2, borderColor: frameColor, borderWidth: Math.max(2, size * 0.06),
        }]} />
      )}
    </View>
  );
}
