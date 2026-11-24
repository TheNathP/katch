import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  pagination: { alignItems: 'center', paddingBottom: 27 },
  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  dotButton: {
    minWidth: 19,
    height: 44,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { height: 8, borderRadius: 4 },
});
