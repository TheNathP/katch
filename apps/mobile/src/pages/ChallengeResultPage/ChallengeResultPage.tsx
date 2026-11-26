import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import { getChallengeAttempt } from "@/data/challenge-attempt";
import { scoreFeedback } from "@/lib/score-feedback";
import { CaptureColors } from "@/styles/theme";

import ChallengeResultPageCard from "./_page/ChallengeResultPageCard";
import ChallengeResultPageScore from "./_page/ChallengeResultPageScore";
import { styles } from "./ChallengeResultPage.styles";

export default function ChallengeResultPage() {
  const { attemptId } = useLocalSearchParams<{ attemptId?: string }>();
  const attempt = typeof attemptId === "string" ? getChallengeAttempt(attemptId) : undefined;

  // Back to the camera tab, which is right below this screen.
  const retry = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/defi");
  };

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate("/");
  };

  if (!attempt) {
    return (
      <SafeAreaView style={[styles.screen, styles.empty]}>
        <Text style={styles.emptyText}>Ce résultat n’est plus disponible.</Text>
        <Button label="Reprendre une photo" variant="limeSolid" onPress={retry} />
      </SafeAreaView>
    );
  }

  const feedback = scoreFeedback(attempt.score);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ChallengeResultPageScore score={attempt.score} tier={feedback.tier} />
        <ChallengeResultPageCard attempt={attempt} feedback={feedback} />
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Ta nouvelle photo remplacera celle-ci"
          onPress={retry}
          style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
        >
          <Image
            source={require("@/assets/icons/refresh.svg")}
            contentFit="contain"
            tintColor={CaptureColors.foreground}
            style={styles.secondaryIcon}
          />
          <Text style={styles.secondaryLabel}>Refaire</Text>
        </Pressable>
        <Button
          label="Continuer"
          variant="limeSolid"
          trailingIcon={require("@/assets/icons/chevron-right.svg")}
          onPress={goHome}
          style={styles.primary}
        />
      </View>
    </SafeAreaView>
  );
}
