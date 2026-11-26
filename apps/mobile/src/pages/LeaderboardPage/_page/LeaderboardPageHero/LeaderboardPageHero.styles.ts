import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  artwork: { height: 168, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  illustration: { width: 194, height: 160 },
  pix: { width: 162, height: 162 },
  trophy: {
    position: 'absolute', right: 0, bottom: 21, width: 92, height: 92,
    transform: [{ rotate: '9deg' }],
  },
  purpleBlob: {
    position: 'absolute', left: -65, bottom: 24, width: 218, height: 126,
    transform: [{ rotate: '-19deg' }], opacity: 0.73,
  },
  yellowBlob: {
    position: 'absolute', right: -59, top: -19, width: 184, height: 114,
    transform: [{ rotate: '-18deg' }], opacity: 0.83,
  },
});
