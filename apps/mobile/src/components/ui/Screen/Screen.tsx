import type { ComponentProps, PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./Screen.styles";

type Props = PropsWithChildren<{
  backgroundColor?: string;
  edges?: ComponentProps<typeof SafeAreaView>['edges'];
  /** Set to false when the content already handles its own scrolling. */
  scroll?: boolean;
}>;

export default function Screen({ children, backgroundColor, edges = ['left', 'right'], scroll = true }: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.screen, { backgroundColor: backgroundColor ?? theme.background }]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : children}
    </SafeAreaView>
  );
}
