import type { PropsWithChildren } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

import { styles } from './Screen.styles';

type ScreenProps = PropsWithChildren<Pick<ScrollViewProps, 'contentInsetAdjustmentBehavior'>>;

export default function Screen({ children, contentInsetAdjustmentBehavior }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
