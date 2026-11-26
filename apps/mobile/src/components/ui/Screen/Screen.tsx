import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";

import { styles } from "./Screen.styles";

export default function Screen({ children, backgroundColor }: PropsWithChildren<{ backgroundColor?: string }>) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.screen, { backgroundColor: backgroundColor ?? theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
