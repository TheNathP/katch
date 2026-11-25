import { StyleSheet } from 'react-native';

import { ProgressBarTokens } from '@/styles/theme';

export const styles = StyleSheet.create({
  track: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 1,
    boxShadow: ProgressBarTokens.trackShadow,
  },
  small: { height: 10 },
  medium: { height: 14 },
  large: { height: 18 },
  fill: { height: '100%', borderRadius: 8 },
});
