import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { View } from 'react-native';

import { TabIconColors } from '@/styles/theme';

import { styles } from './TabIcon.styles';

const symbols = {
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  trophy: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' },
  challenge: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  rewards: { ios: 'gift', android: 'redeem', web: 'redeem' },
  profile: { ios: 'person', android: 'person', web: 'person' },
} as const satisfies Record<string, SymbolViewProps['name']>;

type TabIconProps = {
  name: keyof typeof symbols;
  color: SymbolViewProps['tintColor'];
  focused: boolean;
};

export default function TabIcon({ name, color, focused }: TabIconProps) {
  const isCapture = name === 'challenge';
  const appearance = isCapture ? styles.capture : focused && styles.selected;

  return (
    <View aria-hidden style={[styles.icon, appearance, isCapture && focused && styles.captureSelected]}>
      <SymbolView
        name={symbols[name]}
        tintColor={isCapture ? TabIconColors.captureIcon : color}
        size={isCapture ? 28 : 23}
      />
    </View>
  );
}
