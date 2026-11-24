import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    tabBarBackground: '#FFFCFF',
    tabBarBorder: '#F0E8F6',
    tabBarIcon: '#141126',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    tabBarBackground: '#1B1625',
    tabBarBorder: '#352B41',
    tabBarIcon: '#F8F3FF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

export const LinkColor = '#3c87f7';

export const TabIconColors = {
  selected: '#DFFF25',
  selectedGradient: 'linear-gradient(160deg, #F5FFA6, #DFFF25 55%, #CDF500)',
  captureIcon: '#FFFFFF',
  capture: '#6D22FF',
  captureGradient: 'linear-gradient(165deg, #A370FF, #762AFF 42%, #5200DE)',
  captureBorder: '#9D6BFF',
  captureShadow: '0 3px 6px rgba(88, 21, 211, 0.24)',
  captureSelected: '#5918E7',
  captureSelectedGradient: 'linear-gradient(165deg, #8F56FF, #6220EE 42%, #4500CB)',
  captureSelectedBorder: '#B49AFF',
} as const;
