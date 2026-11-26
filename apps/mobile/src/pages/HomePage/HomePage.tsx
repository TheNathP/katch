import { useFocusEffect } from "expo-router";
import { type ComponentRef, useCallback, useRef, useState } from "react";
import { AppState, ScrollView, type View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  isDailyColorRevealed,
  rememberDailyColorReveal,
} from "@/data/daily-color-reveal";
import { getHomePage } from "@/data/get-home-page";
import { useTheme } from "@/hooks/use-theme";

import HomePageDailyChallenge, {
  type ChallengeState,
} from "./_page/HomePageDailyChallenge";
import HomePageHero from "./_page/HomePageHero";
import HomePageRevealEffect from "./_page/HomePageRevealEffect";
import HomePageShortcuts from "./_page/HomePageShortcuts";
import { styles } from "./HomePage.styles";

export default function HomePage() {
  const theme = useTheme();
  const [challenge, setChallenge] = useState<ChallengeState>({
    status: "loading",
  });
  const reload = useRef<(() => Promise<void>) | null>(null);
  const revealWrite = useRef<Promise<void> | null>(null);
  const swatchRef = useRef<ComponentRef<typeof View>>(null);
  const revealProgress = useSharedValue(0);
  const revealingColor =
    challenge.status === "ready" && challenge.reveal === "revealing"
      ? challenge.color
      : undefined;

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let pending = false;
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;

      const loadChallenge = async () => {
        if (pending || controller.signal.aborted) return;
        pending = true;
        clearTimeout(refreshTimer);
        setChallenge({ status: "loading" });

        try {
          const { color, submission } = await getHomePage(controller.signal);
          if (controller.signal.aborted) return;
          await revealWrite.current?.catch(() => {});
          const revealed =
            submission !== null || (await isDailyColorRevealed(color.date));
          if (controller.signal.aborted) return;
          setChallenge({
            status: "ready",
            color,
            submission,
            reveal: revealed ? "revealed" : "hidden",
          });
          refreshTimer = setTimeout(
            () => void loadChallenge(),
            Math.max(0, color.refreshAt - performance.now()),
          );
        } catch {
          if (!controller.signal.aborted) setChallenge({ status: "error" });
        } finally {
          pending = false;
        }
      };

      reload.current = loadChallenge;
      void loadChallenge();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") void loadChallenge();
      });

      return () => {
        reload.current = null;
        controller.abort();
        clearTimeout(refreshTimer);
        subscription.remove();
      };
    }, []),
  );

  const revealColor = async () => {
    if (
      challenge.status !== "ready" ||
      challenge.reveal !== "hidden" ||
      revealWrite.current
    )
      return;
    if (challenge.color.refreshAt <= performance.now()) {
      void reload.current?.();
      return;
    }

    const { date } = challenge.color;
    const write = rememberDailyColorReveal(date);
    revealWrite.current = write;
    setChallenge({ ...challenge, reveal: "saving", revealError: false });

    let revealError = false;
    try {
      await write;
    } catch {
      revealError = true;
    } finally {
      revealWrite.current = null;
    }
    setChallenge((current) =>
      current.status === "ready" &&
      current.color.date === date &&
      current.reveal === "saving"
        ? {
            ...current,
            reveal: revealError ? "hidden" : "revealing",
            revealError,
          }
        : current,
    );
  };

  const finishReveal = useCallback((date: string) => {
    setChallenge((current) =>
      current.status === "ready" &&
      current.color.date === date &&
      current.reveal === "revealing"
        ? { ...current, reveal: "revealed" }
        : current,
    );
  }, []);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: theme.dailyCanvas }]}
    >
      <ScrollView
        scrollEnabled={!revealingColor}
        contentContainerStyle={styles.scrollContent}
      >
        <HomePageHero />
        <SafeAreaView edges={["left", "right"]} style={styles.content}>
          <HomePageDailyChallenge
            state={challenge}
            onRetry={() => void reload.current?.()}
            onReveal={() => void revealColor()}
            revealProgress={revealProgress}
            swatchRef={swatchRef}
          />
          <HomePageShortcuts />
        </SafeAreaView>
      </ScrollView>
      {revealingColor && (
        <HomePageRevealEffect
          date={revealingColor.date}
          progress={revealProgress}
          swatchRef={swatchRef}
          onComplete={finishReveal}
        />
      )}
    </SafeAreaView>
  );
}
