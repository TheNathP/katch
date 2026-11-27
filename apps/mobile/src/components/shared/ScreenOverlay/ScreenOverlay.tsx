import { createContext, use, useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { styles } from './ScreenOverlay.styles';

type ShowOverlay = (content: ReactNode) => () => void;
const ScreenOverlayContext = createContext<ShowOverlay | null>(null);

export function useScreenOverlay() {
  const showOverlay = use(ScreenOverlayContext);
  if (!showOverlay) throw new Error('ScreenOverlayProvider is missing');
  return showOverlay;
}

export function ScreenOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<ReactNode>(null);
  const showOverlay = useCallback<ShowOverlay>((content) => {
    setOverlay(content);
    return () => setOverlay(current => current === content ? null : current);
  }, []);

  return (
    <ScreenOverlayContext value={showOverlay}>
      <View style={styles.fill}>
        <View
          style={styles.fill}
          accessibilityElementsHidden={overlay !== null}
          importantForAccessibility={overlay === null ? 'auto' : 'no-hide-descendants'}>
          {children}
        </View>
        {overlay !== null && (
          <View pointerEvents="box-only" style={styles.overlay}>
            {overlay}
          </View>
        )}
      </View>
    </ScreenOverlayContext>
  );
}
