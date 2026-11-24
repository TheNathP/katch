import { StyleSheet } from 'react-native';

import { TabIconColors } from '@/styles/theme';

export const styles = StyleSheet.create({
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: TabIconColors.selected,
    backgroundImage: TabIconColors.selectedGradient,
  },
  capture: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: TabIconColors.capture,
    backgroundImage: TabIconColors.captureGradient,
    borderWidth: 1,
    borderColor: TabIconColors.captureBorder,
    boxShadow: TabIconColors.captureShadow,
  },
  captureSelected: {
    backgroundColor: TabIconColors.captureSelected,
    backgroundImage: TabIconColors.captureSelectedGradient,
    borderColor: TabIconColors.captureSelectedBorder,
  },
});
