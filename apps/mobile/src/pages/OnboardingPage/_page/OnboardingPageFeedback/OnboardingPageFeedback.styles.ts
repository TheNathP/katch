import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  feedback: {
    flex: 1,
    overflow: 'hidden',
  },
  waiting: { opacity: 0 },
  wave: { position: 'absolute' },
  waveArtwork: { position: 'absolute', overflow: 'hidden' },
  art: { position: 'absolute' },
  comic: { flex: 1, alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill },
  headline: {
    position: 'absolute',
    top: '13%',
    width: '94%',
    height: '36%',
    maxWidth: 590,
    zIndex: 3,
  },
  lettering: { flex: 1 },
  pixLayer: {
    position: 'absolute',
    bottom: '-12%',
    width: '108%',
    height: '83%',
    maxWidth: 690,
    zIndex: 2,
  },
  sprite: { width: '100%', height: '100%' },
  mark: { position: 'absolute', left: '12%', top: '11%', width: 57, height: 57, zIndex: 4, transform: [{ rotate: '10deg' }] },
});
