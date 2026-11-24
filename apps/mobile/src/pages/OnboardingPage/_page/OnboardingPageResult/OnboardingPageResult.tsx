import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import OnboardingPageArt from '../OnboardingPageArt';

import { styles } from './OnboardingPageResult.styles';

type Props = {
  artHeight: number;
  photoUri: string;
  score: number;
  validated: boolean;
  revealed: boolean;
};

export default function OnboardingPageResult({ artHeight, photoUri, score, validated, revealed }: Props) {
  const reduceMotion = useReducedMotion();
  const startingScore = reduceMotion ? score : 0;
  const progress = useSharedValue(startingScore);
  const emphasis = useSharedValue(1);
  const [displayedScore, setDisplayedScore] = useState(startingScore);

  useEffect(() => {
    if (!revealed) return;
    if (reduceMotion) {
      progress.set(score);
      return;
    }

    progress.set(withDelay(180, withTiming(score, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    }, (finished) => {
      if (finished) {
        emphasis.set(withSequence(
          withTiming(1.035, { duration: 90 }),
          withTiming(1, { duration: 150 }),
        ));
      }
    })));
    return () => {
      cancelAnimation(progress);
      cancelAnimation(emphasis);
    };
  }, [emphasis, progress, reduceMotion, revealed, score]);

  useAnimatedReaction(
    () => Math.round(progress.get()),
    (value, previous) => {
      if (value !== previous) scheduleOnRN(setDisplayedScore, value);
    },
  );

  const meter = useAnimatedStyle(() => ({ width: `${progress.get()}%` }));
  const scoreMotion = useAnimatedStyle(() => ({ transform: [{ scale: emphasis.get() }] }));

  return (
    <View style={styles.result}>
      <OnboardingPageArt scene={validated ? 'result' : 'missed'} height={artHeight} />
      <Text accessibilityRole="header" style={styles.title}>
        {validated ? 'Bravo, premier Katch !' : 'Capture non validée'}
      </Text>
      <View style={styles.card}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreText}>
            <Text style={styles.scoreLabel}>Exemple de résultat</Text>
            <Animated.Text
              accessible
              accessibilityLabel={`${score} % de correspondance`}
              style={[styles.score, !validated && styles.rejectedScore, scoreMotion]}>
              {displayedScore}%<Text style={styles.scoreUnit}> de correspondance</Text>
            </Animated.Text>
          </View>
          <Image
            accessibilityLabel="Ta photo d’essai"
            source={{ uri: photoUri }}
            contentFit="cover"
            style={styles.thumbnail}
          />
        </View>
        <View aria-hidden style={styles.track}>
          <Animated.View style={[styles.fill, !validated && styles.rejectedFill, meter]} />
        </View>
      </View>
    </View>
  );
}
