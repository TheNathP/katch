import { AndroidHaptics, impactAsync, ImpactFeedbackStyle, performAndroidHapticsAsync } from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import Dialog from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import PixReactionBar, { pixReactionArt } from '@/components/ui/PixReactionBar';
import ThemedText from '@/components/ui/ThemedText';
import type { PhotoReactions, PixReaction } from '@/data/social-api.types';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './PhotoReactionBadge.styles';

const holdDurationMs = 500;
const hapticSettleDelayMs = 72;

type Props = {
  value: PhotoReactions;
  onReact?: (reaction: PixReaction | null) => Promise<boolean>;
  busy?: boolean;
  error?: string;
};

export default function PhotoReactionBadge({ value, onReact, busy, error }: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [pickerOpen, setPickerOpen] = useState(false);
  const hapticTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(hapticTimer.current), []);
  if (!value.myReaction) return null;

  const { source, label } = pixReactionArt[value.myReaction];
  const title = `Ta réaction, ${label}`;
  const badgeStyle = [styles.badge, {
    backgroundColor: theme.dailyCard,
    borderColor: theme.dailyAccent,
    boxShadow: theme.dailyShadow,
  }];
  const sticker = <Image aria-hidden source={source} style={styles.pix} contentFit="contain" enforceEarlyResizing />;
  if (!onReact) {
    return <View accessible accessibilityLabel={title} pointerEvents="none" style={badgeStyle}>{sticker}</View>;
  }

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => {
    clearTimeout(hapticTimer.current);
    setPickerOpen(false);
  };

  function openPickerFromLongPress() {
    if (pickerOpen) return;
    openPicker();

    const android = Platform.OS === 'android';
    const impact = android
      ? performAndroidHapticsAsync(AndroidHaptics.Long_Press)
      : impactAsync(ImpactFeedbackStyle.Medium);
    void impact.catch(() => {});

    clearTimeout(hapticTimer.current);
    hapticTimer.current = setTimeout(() => {
      const settle = android
        ? performAndroidHapticsAsync(AndroidHaptics.Segment_Frequent_Tick)
        : impactAsync(ImpactFeedbackStyle.Soft);
      void settle.catch(() => {});
    }, hapticSettleDelayMs);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint="Maintiens le Pix pour ouvrir les réactions"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'activate') openPicker();
        }}
        onAccessibilityTap={openPicker}
        delayLongPress={holdDurationMs}
        onLongPress={openPickerFromLongPress}
        style={({ pressed }) => [badgeStyle, pressed && styles.pressed, pressed && !reduceMotion && styles.sunk]}>
        {sticker}
      </Pressable>
      {pickerOpen && (
        <Dialog onClose={closePicker} placement="bottom" animationType={reduceMotion ? 'none' : 'fade'}>
          <View style={styles.header}>
            <ThemedText accessibilityRole="header" themeColor="dailyInk" style={styles.heading}>
              Changer ta réaction
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer les réactions"
              onPress={closePicker}
              style={({ pressed }) => [styles.close, { backgroundColor: theme.dailySurface }, pressed && styles.pressed]}>
              <Icon name="xMark" size={18} color={theme.dailyInk} />
            </Pressable>
          </View>
          <PixReactionBar
            value={value}
            busy={busy}
            error={error}
            onReact={async reaction => {
              if (await onReact(reaction)) closePicker();
            }}
          />
        </Dialog>
      )}
    </>
  );
}
