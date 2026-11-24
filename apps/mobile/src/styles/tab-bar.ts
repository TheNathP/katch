import { StyleSheet } from 'react-native';

import { MaxContentWidth } from '@/styles/theme';

export const tabBarStyles = StyleSheet.create({
  bar: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    elevation: 0,
  },
  iconArea: {
    width: 60,
    height: 60,
  },
});
