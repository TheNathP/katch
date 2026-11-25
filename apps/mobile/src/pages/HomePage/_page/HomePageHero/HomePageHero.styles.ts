import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  artwork: {
    width: '100%',
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleBlob: {
    position: 'absolute',
    left: -69,
    bottom: -20,
    width: 244,
    height: 138,
    transform: [{ rotate: '-19deg' }],
    opacity: 0.73,
  },
  yellowBlob: {
    position: 'absolute',
    right: -64,
    top: -16,
    width: 191,
    height: 116,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.83,
  },
  pix: { width: 208, height: 208, transform: [{ translateY: 3 }] },
});
