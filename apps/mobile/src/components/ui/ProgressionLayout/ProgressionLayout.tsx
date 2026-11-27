import { Stack } from 'expo-router';
import { type PropsWithChildren, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { styles } from '@/styles/progression';

type LayoutProps = PropsWithChildren<{
  loading: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  rewardsHeader?: boolean;
  error?: string;
  retry: () => void;
}>;

export default function ProgressionLayout({ children, loading, backgroundColor, contentStyle, rewardsHeader, error, retry }: LayoutProps) {
  const theme = useTheme();
  const headerOptions = useMemo(() => ({
    headerTitleAlign: 'center' as const,
    headerTitleStyle: styles.navTitle,
    headerStyle: { backgroundColor: theme.dailyCanvas },
    headerTintColor: theme.dailyInk,
    headerShadowVisible: false,
  }), [theme.dailyCanvas, theme.dailyInk]);
  const panel = { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder };
  const placeholder = { backgroundColor: theme.dailySurface };

  return (
    <Screen backgroundColor={rewardsHeader ? theme.dailyCanvas : backgroundColor}>
      {rewardsHeader && <Stack.Screen options={headerOptions} />}
      <View style={[styles.layout, contentStyle]}>
        {loading && (
          <View accessible accessibilityLabel="Chargement de la progression" accessibilityState={{ busy: true }}>
            <View aria-hidden style={styles.section}>
              <View style={[styles.loadingHero, panel]}>
                <View style={[styles.loadingShort, placeholder]} />
                <View style={[styles.loadingWide, placeholder]} />
              </View>
              <View style={[styles.loadingRow, panel]} />
              <View style={[styles.loadingRow, panel]} />
            </View>
          </View>
        )}
        {children}
        {error && (
          <View style={styles.section}>
            <ThemedText accessibilityLiveRegion="polite" themeColor="danger">{error}</ThemedText>
            <Button label="Réessayer" onPress={retry} />
          </View>
        )}
      </View>
    </Screen>
  );
}
