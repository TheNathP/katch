import { Image } from "expo-image";
import { View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./Avatar.styles";

type AvatarProps = {
  /** Remote image; omitted while the catalog is loading. */
  imageUrl?: string;
  /** Background color from the catalog (`#RRGGBB`). */
  backgroundHex?: string;
  size?: number;
};

export default function Avatar({
  imageUrl,
  backgroundHex,
  size = 64,
}: AvatarProps) {
  const theme = useTheme();

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
      {imageUrl && (
        <Image
          aria-hidden
          source={imageUrl}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
        />
      )}
    </View>
  );
}
