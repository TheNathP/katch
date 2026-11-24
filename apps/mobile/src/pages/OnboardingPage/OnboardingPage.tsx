import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { completeOnboarding } from '@/data/onboarding-progress';
import { ComicFeedbackColors, OnboardingColors } from '@/styles/theme';

import { styles } from './OnboardingPage.styles';
import OnboardingPageArt from './_page/OnboardingPageArt';
import OnboardingPageCamera from './_page/OnboardingPageCamera';
import OnboardingPageFeedback from './_page/OnboardingPageFeedback';
import OnboardingPagePagination from './_page/OnboardingPagePagination';
import OnboardingPageResult from './_page/OnboardingPageResult';

const slides = [
  {
    scene: 'hunt',
    title: 'La chasse aux couleurs',
    accent: 'du quotidien !',
    description: 'Chaque jour, une couleur à retrouver autour de toi. Repère-la, cadre-la et prends-la en photo.',
  },
  {
    scene: 'ranking',
    title: 'Grimpe dans',
    accent: 'le classement',
    description: 'Défie tes amis et compare vos scores. Chaque capture peut te faire gagner une place.',
  },
  {
    scene: 'rewards',
    title: 'Tes défis,',
    accent: 'ton butin !',
    description: 'Gagne des KatchCoins, débloque des badges et personnalise ton Pix.',
  },
  {
    scene: 'trial',
    title: 'À toi de',
    accent: 'jouer !',
    description: 'Repère un objet de ce violet autour de toi et prends-le en photo.',
  },
] as const;

const slideLabels = slides.map(({ title, accent }) => `${title} ${accent}`);
const autoAdvanceDelay = 6500;
const lastSlide = slides.length - 1;
const demoScore = 70;
const minimumCaptureScore = 70;
const transition = FadeInDown.duration(220).reduceMotion(ReduceMotion.System);
const arrow = require('@/assets/icons/arrow-left.svg');
const chevron = require('@/assets/icons/chevron-right.svg');
const cameraIcon = require('@/assets/icons/camera.svg');
const purpleCorner = require('@/assets/icon-illus/decorations/onboarding-purple-corner.svg');
const limeLeft = require('@/assets/icon-illus/decorations/onboarding-lime-left.svg');
const limeCorner = require('@/assets/icon-illus/decorations/onboarding-lime-corner.svg');

type AccountRoute = '/compte/inscription' | '/compte/connexion';
type TutorialScreen =
  | { name: 'slides' | 'camera' | 'registration' }
  | { name: 'feedback'; photoUri: string; score: number; revealing: boolean }
  | { name: 'result'; photoUri: string; score: number };

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState<TutorialScreen>({ name: 'slides' });
  const [touchingPager, setTouchingPager] = useState(false);
  const reduceMotion = useReducedMotion();
  const feedback = screen.name === 'feedback' ? screen : undefined;
  const mode = feedback ? (feedback.revealing ? 'result' : 'camera') : screen.name;
  const result = screen.name === 'result' ? screen : feedback?.revealing ? feedback : undefined;
  const [finishing, setFinishing] = useState(false);
  const navigating = useRef(false);
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const { height, width } = useWindowDimensions();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const pageWidth = Math.max(1, width - left - right);
  const usableHeight = Math.max(1, height - top - bottom);
  const artHeight = Math.min(274, Math.max(148, usableHeight * 0.32));
  const coverHeight = Math.max(0, usableHeight - 116);
  const coverTop = coverHeight * 0.18;
  const wordmarkSize = Math.min(98, pageWidth * 0.197);
  const coverArtHeight = Math.min(pageWidth * 0.88, Math.max(136, coverHeight * 0.47));
  const cornerTop = Math.max(30, top);
  const showSlideDecorations = mode === 'slides';
  const captureValidated = (screen.name === 'feedback' || screen.name === 'result') && screen.score >= minimumCaptureScore;
  const feedbackPalette = feedback && !feedback.revealing
    ? ComicFeedbackColors[captureValidated ? 'validated' : 'rejected']
    : undefined;

  const moveToSlide = useCallback((index: number, animated = false) => {
    pager.current?.scrollTo({ x: index * pageWidth, animated });
  }, [pageWidth]);

  useFocusEffect(useCallback(() => {
    if (mode !== 'slides' || step >= lastSlide || touchingPager || reduceMotion) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timeout);
      if (AppState.currentState === 'active') {
        timeout = setTimeout(() => moveToSlide(step + 1, true), autoAdvanceDelay);
      }
    };

    schedule();
    const listener = AppState.addEventListener('change', schedule);
    return () => {
      clearTimeout(timeout);
      listener.remove();
    };
  }, [mode, moveToSlide, reduceMotion, step, touchingPager]));

  const goBack = useCallback(() => {
    if (navigating.current) return true;
    if (mode !== 'slides') {
      setScreen({ name: 'slides' });
      return true;
    }
    if (step === 0) return false;
    moveToSlide(step - 1);
    return true;
  }, [mode, moveToSlide, step]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const listener = BackHandler.addEventListener('hardwareBackPress', goBack);
      return () => listener.remove();
    }, [goBack]),
  );

  const showRegistration = () => {
    setScreen({ name: 'registration' });
    void completeOnboarding().catch(() => {});
  };

  const openAccount = async (href: AccountRoute) => {
    if (navigating.current) return;
    navigating.current = true;
    setFinishing(true);
    try {
      await completeOnboarding();
    } catch {
      // Account navigation stays available if local storage is unavailable.
    }
    router.replace(href);
  };

  const showFeedback = (photoUri: string) => setScreen({ name: 'feedback', photoUri, score: demoScore, revealing: false });

  const revealScore = useCallback(() => {
    setScreen(current => current.name === 'feedback' ? { ...current, revealing: true } : current);
  }, []);

  const finishFeedback = useCallback(() => {
    setScreen(current => current.name === 'feedback' && current.revealing
      ? { name: 'result', photoUri: current.photoUri, score: current.score }
      : current);
  }, []);

  const openCamera = () => setScreen({ name: 'camera' });

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style={feedbackPalette ? 'light' : 'dark'} />
      {showSlideDecorations && (
        <View aria-hidden pointerEvents="none" style={styles.coverEdges}>
          <Image source={purpleCorner} style={[styles.purpleCorner, { top: cornerTop }]} contentFit="contain" />
          <Image source={limeLeft} style={[styles.limeLeft, { top: cornerTop + 30 }]} contentFit="contain" />
          <Image source={limeCorner} style={styles.limeCorner} contentFit="contain" />
        </View>
      )}
      <View style={[styles.header, feedback && styles.feedbackHeader]}>
        <View style={styles.headerSide}>
          {(step > 0 || mode !== 'slides') && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={goBack}
              disabled={finishing}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Image
                aria-hidden
                source={arrow}
                style={styles.backIcon}
                contentFit="contain"
                tintColor={feedbackPalette ? ComicFeedbackColors.paper : OnboardingColors.ink}
              />
            </Pressable>
          )}
        </View>
        <View style={styles.headerSide}>
          {mode !== 'registration' && (
            <Pressable
              accessibilityRole="button"
              onPress={showRegistration}
              disabled={finishing}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <Text style={[styles.skipText, feedbackPalette && styles.feedbackSkipText]}>Passer</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.main}>
        <View
          aria-hidden={mode !== 'slides'}
          accessibilityElementsHidden={mode !== 'slides'}
          importantForAccessibility={mode === 'slides' ? 'auto' : 'no-hide-descendants'}
          pointerEvents={mode === 'slides' ? 'auto' : 'none'}
          style={[styles.main, mode !== 'slides' && styles.inactivePager]}>
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            bounces={false}
            style={[styles.pager, { width: pageWidth }]}
            showsHorizontalScrollIndicator={false}
            onTouchStart={() => setTouchingPager(true)}
            onTouchEnd={() => setTouchingPager(false)}
            onTouchCancel={() => setTouchingPager(false)}
            onScroll={({ nativeEvent }) => {
              const index = Math.round(nativeEvent.contentOffset.x / pageWidth);
              setStep(Math.max(0, Math.min(lastSlide, index)));
            }}
            scrollEventThrottle={32}>
            {slides.map(({ scene, title, accent, description }, index) => (
              <ScrollView
                key={scene}
                aria-hidden={index !== step}
                accessibilityElementsHidden={index !== step}
                importantForAccessibility={index === step ? 'auto' : 'no-hide-descendants'}
                style={{ width: pageWidth }}
                contentContainerStyle={scene === 'hunt' ? [styles.coverContent, { paddingTop: coverTop }] : styles.slideContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled>
                {scene === 'hunt' ? (
                  <>
                    <View accessible accessibilityLabel="Katch" style={styles.wordmark}>
                      <Text style={[styles.brand, { fontSize: wordmarkSize, lineHeight: wordmarkSize * 1.08 }]}>KATCH{'\u2009'}</Text>
                      <View style={[styles.brandDot, { width: wordmarkSize * 0.22, height: wordmarkSize * 0.22, marginBottom: wordmarkSize * 0.16 }]} />
                    </View>
                    <OnboardingPageArt scene={scene} height={coverArtHeight} />
                    <Text accessibilityRole="header" accessibilityHint={description} style={styles.coverCaption}>
                      {title}{'\n'}{accent}
                    </Text>
                  </>
                ) : (
                  <>
                    <OnboardingPageArt scene={scene} height={artHeight} />
                    <Text accessibilityRole="header" style={styles.title}>
                      {title}{'\n'}<Text style={styles.titleAccent}>{accent}</Text>
                    </Text>
                    <Text style={styles.description}>{description}</Text>
                  </>
                )}
                {index === lastSlide && (
                  <View
                    pointerEvents={index === step && mode === 'slides' ? 'auto' : 'none'}
                    style={styles.slideAction}>
                    <Button
                      label="Prendre une photo"
                      variant="primarySolid"
                      trailingIcon={cameraIcon}
                      tabIndex={index === step && mode === 'slides' ? 0 : -1}
                      onPress={openCamera}
                    />
                  </View>
                )}
              </ScrollView>
            ))}
          </ScrollView>
          <OnboardingPagePagination
            labels={slideLabels}
            step={step}
            disabled={mode !== 'slides'}
            onSelect={moveToSlide}
          />
        </View>
        {mode !== 'slides' && (
          <ScrollView
            key={mode}
            aria-hidden={!!feedback}
            accessibilityElementsHidden={!!feedback}
            importantForAccessibility={feedback ? 'no-hide-descendants' : 'auto'}
            pointerEvents={feedback ? 'none' : 'auto'}
            style={styles.overlay}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Animated.View entering={mode === 'camera' || mode === 'registration' ? transition : undefined} style={styles.stage}>
              {mode === 'camera' && <OnboardingPageCamera onCapture={showFeedback} photoUri={feedback?.photoUri} />}
              {result && (
                <OnboardingPageResult
                  artHeight={artHeight}
                  photoUri={result.photoUri}
                  score={result.score}
                  validated={captureValidated}
                  revealed={!feedback}
                />
              )}
              {screen.name === 'registration' && (
                <>
                  <OnboardingPageArt scene="registration" height={artHeight} />
                  <Text accessibilityRole="header" style={styles.title}>
                    La chasse <Text style={styles.titleAccent}>commence ici !</Text>
                  </Text>
                  <Text style={styles.description}>Crée ton compte pour relever le défi du jour et retrouver tes amis.</Text>
                </>
              )}
            </Animated.View>
            {(result || screen.name === 'registration') && (
              <View style={styles.footer}>
                <Button
                  label="Créer mon compte"
                  variant="primarySolid"
                  trailingIcon={chevron}
                  disabled={finishing}
                  tabIndex={feedback ? -1 : 0}
                  onPress={() => void openAccount('/compte/inscription')}
                />
                {screen.name === 'registration' && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={finishing}
                    onPress={() => void openAccount('/compte/connexion')}
                    style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
                    <Text style={styles.secondaryText}>J’ai déjà un compte</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
      {feedback && (
        <View style={styles.feedbackOverlay}>
          <OnboardingPageFeedback
            validated={captureValidated}
            revealing={feedback.revealing}
            onReveal={revealScore}
            onComplete={finishFeedback}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
