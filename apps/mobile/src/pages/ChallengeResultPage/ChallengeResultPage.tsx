import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import CaptureFeedback from "@/components/ui/CaptureFeedback";
import { getChallengeAttempt } from "@/data/challenge-attempt";
import { useTheme } from "@/hooks/use-theme";
import { minimumCaptureScore } from "@/lib/score-feedback";
import { Colors } from "@/styles/theme";

import ChallengeResultPageCard from "./_page/ChallengeResultPageCard";
import ChallengeResultPagePhoto from "./_page/ChallengeResultPagePhoto";
import ChallengeResultPageScore from "./_page/ChallengeResultPageScore";
import { styles } from "./ChallengeResultPage.styles";

const SCORE_REVEAL_DURATION = 620;
const FEEDBACK_HOLD_DURATION = 850;

export default function ChallengeResultPage() {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [phase, setPhase] = useState<"feedback" | "wave" | "score">("feedback");
  const revealScore = useCallback(() => setPhase("wave"), []);
  const finishFeedback = useCallback(() => setPhase("score"), []);
  const { attemptId } = useLocalSearchParams<{ attemptId?: string }>();
  const attempt = typeof attemptId === "string" ? getChallengeAttempt(attemptId) : undefined;

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
      <SafeAreaView style={[styles.screen, styles.empty, { backgroundColor: theme.dailyCanvas }]}>
        <StatusBar style={theme === Colors.dark ? "light" : "dark"} />
        <Text style={[styles.emptyText, { color: theme.dailyInk }]}>Ce résultat n’est plus disponible.</Text>
        <Button label="Reprendre une photo" onPress={retry} />
      </SafeAreaView>
    );
  }

  const validated = attempt.score >= minimumCaptureScore;
  const showingFeedback = phase !== "score";
  const panelColor = { backgroundColor: theme.dailyCard };

  return (
    <View style={styles.screen}>
      <StatusBar style={showingFeedback || theme === Colors.dark ? "light" : "dark"} />
      {phase === "feedback" ? (
        <Image aria-hidden source={{ uri: attempt.photoUri }} contentFit="contain" style={styles.backingPhoto} />
      ) : (
        <SafeAreaView
          aria-hidden={showingFeedback}
          accessibilityElementsHidden={showingFeedback}
          importantForAccessibility={showingFeedback ? "no-hide-descendants" : "auto"}
          pointerEvents={showingFeedback ? "none" : "auto"}
          edges={["top", "left", "right"]}
          style={[styles.screen, { backgroundColor: theme.dailyCanvas }]}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ChallengeResultPageScore
              score={attempt.score}
              scorePercent={attempt.scorePercent}
              play={phase === "score"}
              revealDuration={SCORE_REVEAL_DURATION}
            />
            <View style={[styles.capture, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }]}>
              <ChallengeResultPagePhoto attempt={attempt} />
              <ChallengeResultPageCard attempt={attempt} />
            </View>
            <View style={styles.verdict}>
              <Image
                aria-hidden
                source={validated
                  ? require("@/assets/images/pix/result-validated.png")
                  : require("@/assets/images/pix/result-not-validated.png")}
                contentFit="contain"
                style={styles.verdictPix}
              />
              <View style={[styles.verdictBubble, { backgroundColor: theme.dailyCard }]}>
                <View aria-hidden style={[styles.verdictTail, { backgroundColor: theme.dailyCard }]} />
                <Text style={[styles.verdictText, { color: theme.dailyInk }]}>
                  {validated ? "Défi validé !" : "Défi non validé"}
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.footer, panelColor, { paddingBottom: bottom, borderColor: theme.dailyBorder }]}>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityHint="Ta nouvelle photo remplacera celle-ci"
                onPress={retry}
                style={({ pressed }) => [
                  styles.secondary,
                  { borderColor: theme.dailyBorder, backgroundColor: pressed ? theme.dailySurface : theme.dailyCard },
                ]}
              >
                <Image
                  source={require("@/assets/icons/refresh.svg")}
                  contentFit="contain"
                  tintColor={theme.dailyInk}
                  style={styles.secondaryIcon}
                />
                <Text style={[styles.secondaryLabel, { color: theme.dailyInk }]}>Refaire</Text>
              </Pressable>
              <Button
                label="Continuer"
                variant="primarySolid"
                trailingIcon={require("@/assets/icons/chevron-right.svg")}
                onPress={goHome}
                style={styles.primary}
              />
            </View>
          </View>
        </SafeAreaView>
      )}
      {showingFeedback && (
        <View style={styles.feedbackOverlay}>
          <CaptureFeedback
            validated={validated}
            successHaptic
            revealing={phase === "wave"}
            holdDuration={FEEDBACK_HOLD_DURATION}
            onReveal={revealScore}
            onComplete={finishFeedback}
          />
        </View>
      )}
    </View>
  );
}
