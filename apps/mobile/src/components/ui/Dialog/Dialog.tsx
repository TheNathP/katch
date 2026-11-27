import type { ComponentProps, PropsWithChildren } from 'react';
import { Modal, Pressable, ScrollView, View, type ModalProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/styles/theme';

import { styles } from './Dialog.styles';

type AnimatedViewStyle = ComponentProps<typeof Animated.View>['style'];

type Props = PropsWithChildren<{
  onClose: () => void;
  placement?: 'center' | 'bottom';
  animationType?: ModalProps['animationType'];
  panelStyle?: AnimatedViewStyle;
  scrimStyle?: AnimatedViewStyle;
}>;

export default function Dialog({ onClose, placement = 'center', animationType = 'none', panelStyle, scrimStyle, children }: Props) {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const docked = placement === 'bottom';

  return (
    <Modal transparent statusBarTranslucent navigationBarTranslucent animationType={animationType} onRequestClose={onClose}>
      <View style={styles.viewport}>
        <Animated.View aria-hidden pointerEvents="none" style={[styles.scrim, scrimStyle]} />
        <ScrollView contentContainerStyle={[styles.placement, docked ? styles.bottom : styles.center]} bounces={false}>
          <Pressable aria-hidden accessible={false} focusable={false} onPress={onClose} style={styles.backdrop} />
          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            style={[
              styles.panel,
              docked ? [styles.sheet, { paddingBottom: Spacing.three + bottom }] : styles.card,
              { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder },
              panelStyle,
            ]}>
            {children}
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}
