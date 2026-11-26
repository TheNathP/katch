import { Image, type ImageProps } from "expo-image";
import { View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./Avatar.styles";

type AvatarProps = {
  /** Remote image; omitted while the catalog is loading. */
  imageUrl?: string;
  fallbackSource?: ImageProps["source"];
  /** Background color from the catalog (`#RRGGBB`). */
  backgroundHex?: string;
  size?: number;
};

export default function Avatar({
  imageUrl,
  fallbackSource,
  backgroundHex,
  size = 64,
}: AvatarProps) {
  const theme = useTheme();
  const source = imageUrl ?? fallbackSource;

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
      {source != null && (
        <Image
          aria-hidden
          source={source}
          placeholder={imageUrl ? fallbackSource : undefined}
          placeholderContentFit="contain"
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
        />
      )}
    </View>
  );
}
