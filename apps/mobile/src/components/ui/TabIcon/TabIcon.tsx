import { Image, type ImageProps } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { TabIconColors } from '@/styles/theme';

import { styles } from './TabIcon.styles';

const icons = {
  home: require('@/assets/icons/home.svg'),
  camera: require('@/assets/icons/camera.svg'),
  gift: require('@/assets/icons/gift.svg'),
  profile: require('@/assets/icons/profile.svg'),
} as const satisfies Record<string, ImageProps['source']>;

type TabIconProps = {
  name: keyof typeof icons | 'trophy';
  color: string;
  focused: boolean;
};

export default function TabIcon({ name, color, focused }: TabIconProps) {
  const isCapture = name === 'camera';
  const appearance = isCapture ? styles.capture : focused && styles.selected;

  return (
    <View aria-hidden style={[styles.icon, appearance, isCapture && focused && styles.captureSelected]}>
      {name === 'trophy' ? (
        <SymbolView name={{ ios: 'trophy', android: 'emoji_events', web: 'emoji_events' }} tintColor={color} size={23} />
      ) : (
        <Image
          source={icons[name]}
          contentFit="contain"
          tintColor={isCapture ? TabIconColors.captureIcon : color}
          style={isCapture ? styles.captureGlyph : styles.glyph}
        />
      )}
    </View>
  );
}
