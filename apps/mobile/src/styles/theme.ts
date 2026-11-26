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
    danger: '#D92D20',
    dailyCanvas: '#FAF4FC',
    dailyCard: '#FFFCFF',
    dailySurface: '#F5EDFA',
    dailyBorder: '#EEE2F5',
    dailySwatchBorder: 'rgba(22, 18, 41, 0.12)',
    dailyInk: '#161229',
    dailyMuted: '#625470',
    dailyAccent: '#6424E8',
    leaderboardFirstSurface: '#FFF3D2',
    leaderboardFirstBorder: '#E8BC58',
    leaderboardFirstInk: '#77500D',
    modalBackdrop: 'rgba(22, 18, 41, 0.60)',
    dailyShadow: '0 5px 18px rgba(57, 18, 128, 0.10)',
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
    danger: '#FF6B5E',
    dailyCanvas: '#171020',
    dailyCard: '#231A30',
    dailySurface: '#332445',
    dailyBorder: '#423052',
    dailySwatchBorder: 'rgba(251, 244, 255, 0.15)',
    dailyInk: '#FBF4FF',
    dailyMuted: '#D1BEDC',
    dailyAccent: '#D2ABFF',
    leaderboardFirstSurface: '#3E2C16',
    leaderboardFirstBorder: '#B98638',
    leaderboardFirstInk: '#FFDA8D',
    modalBackdrop: 'rgba(0, 0, 0, 0.70)',
    dailyShadow: '0 5px 18px rgba(10, 4, 20, 0.30)',
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

export const ComicFeedbackColors = {
  ink: '#160D31',
  paper: '#FFFFFF',
  validated: { background: '#361393', middle: '#7234EF', shade: '#471AB4', accent: '#DFFF25' },
  rejected: { background: '#961742', middle: '#EC146B', shade: '#B00751', accent: '#FFCE67' },
} as const;

export const OnboardingColors = {
  canvas: '#FAF4FC',
  card: '#FFFCFF',
  white: '#FFFFFF',
  ink: '#161229',
  muted: '#514561',
  purple: '#6424E8',
  purplePressed: '#5018BB',
  target: '#FF7A1A',
  lavender: '#EFE4FC',
  lilac: '#AE8BE9',
  track: '#DFD0EC',
  lime: '#DFFF25',
  limeShade: '#A5CA09',
  avatarAmber: '#FFF0C4',
  avatarCoral: '#FFD2CC',
  avatarAmethyst: '#EDE0FE',
  violetEdge: '#AE87F6',
  rankingHighlight: 'linear-gradient(105deg, #4B17B9, #742FF9)',
  cardShadow: '0 8px 20px rgba(57, 18, 128, 0.12)',
  feedbackRejected: '#932745',
} as const;

export const ProgressBarTokens = {
  trackShadow: 'inset 0 1px 4px rgba(62, 28, 121, 0.16)',
  primary: {
    backgroundColor: OnboardingColors.purple,
    backgroundImage: 'linear-gradient(180deg, #A374FF, #7839F4 52%, #5420C9)',
    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.39), 0 2px 5px rgba(89, 34, 198, 0.34)',
  },
  rejected: {
    backgroundColor: OnboardingColors.feedbackRejected,
    backgroundImage: 'linear-gradient(180deg, #EB7897, #C84369 60%, #AB2F54)',
    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.35), 0 2px 5px rgba(176, 46, 84, 0.21)',
  },
} as const;

/** Background colors a player can put behind their avatar, keyed by the id stored server-side. */
export const AvatarTokens = {
  selectedBorder: '#6424E8',
  editBadgeBackground: '#6424E8',
  editBadgeForeground: '#FFFFFF',
  editBadgeBorder: '#FFFFFF',
} as const;

export const dailySwatchRadius = 18;

export const DailyRevealColors = {
  veil: '#522BAF',
  gradient: 'linear-gradient(145deg, #794FE3 0%, #522BAF 53%, #352166 100%)',
  question: '#F3EDFF',
  questionShadow: 'rgba(31, 13, 75, 0.40)',
  backdrop: '#100A1C',
  rim: 'rgba(243, 237, 255, 0.45)',
} as const;

export const ButtonTokens = {
  primarySolid: {
    minHeight: 58,
    foreground: '#FFFFFF',
    background: '#6424E8',
    gradient: 'linear-gradient(180deg, #7943EC, #6326DC 66%, #5D23CD)',
    border: '#5825C3',
    base: '#4817A3',
    shadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.18), 0 4px 10px rgba(67, 23, 150, 0.19)',
    pressedGradient: 'linear-gradient(180deg, #713ADF, #5820C3)',
    pressedBackground: '#5820C3',
    pressedShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.10), 0 1px 4px rgba(67, 23, 150, 0.16)',
  },
  limeSolid: {
    minHeight: 54,
    foreground: OnboardingColors.ink,
    background: OnboardingColors.lime,
    gradient: 'linear-gradient(175deg, #EEFF80, #DFFF25 55%, #D2F71B)',
    border: '#BBD722',
    base: '#8FAA0A',
    shadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.42), 0 5px 11px rgba(187, 215, 34, 0.28)',
    pressedBackground: '#C8EA13',
    pressedGradient: 'linear-gradient(175deg, #DBF45B, #C8EA13)',
    pressedShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.23), 0 2px 5px rgba(187, 215, 34, 0.20)',
  },
} as const;
