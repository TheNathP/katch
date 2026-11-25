import { StyleSheet } from 'react-native';

import { DailyRevealColors as color } from '@/styles/theme';

export const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: color.veil,
    backgroundImage: color.gradient,
  },
  question: {
    color: color.question,
    fontWeight: '900',
    fontSize: 80,
    lineHeight: 88,
    textAlign: 'center',
    textShadowColor: color.questionShadow,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 14,
  },
});
