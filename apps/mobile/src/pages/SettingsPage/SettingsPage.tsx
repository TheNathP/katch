import { Stack } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import ThemedText from '@/components/ui/ThemedText';
import { deleteMyAccount, signOut } from '@/data/auth';
import { type ThemePreference, useThemePreference } from '@/data/theme-preference-provider';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/styles/theme';

import { styles } from './SettingsPage.styles';

const themes = [
  { value: 'system', label: 'Système' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
] as const;

const logout = require('@/assets/icons/log-out.svg');

export default function SettingsPage() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { bottom } = useSafeAreaInsets();
  const { preference, setPreference } = useThemePreference();
  const themeSave = useRef(false);
  const accountAction = useRef(false);
  const [themeError, setThemeError] = useState(false);
  const [prompt, setPrompt] = useState<'signout' | 'delete'>();
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);

  const headerOptions = useMemo(() => ({
    headerTitleAlign: 'center' as const,
    headerTitleStyle: styles.headerTitle,
    headerStyle: { backgroundColor: theme.dailyCanvas },
    headerTintColor: theme.dailyInk,
    headerShadowVisible: false,
  }), [theme.dailyCanvas, theme.dailyInk]);

  async function chooseTheme(next: ThemePreference) {
    if (themeSave.current || preference === next) return;
    themeSave.current = true;
    setThemeError(false);
    try {
      await setPreference(next);
    } catch {
      setThemeError(true);
    } finally {
      themeSave.current = false;
    }
  }

  function changePrompt(next?: 'signout' | 'delete') {
    if (accountAction.current) return;
    setPrompt(next);
    setConfirmation('');
    setActionError(false);
  }

  async function confirmAction() {
    if (accountAction.current || !prompt || (prompt === 'delete' && confirmation !== 'SUPPRIMER')) return;
    accountAction.current = true;
    setBusy(true);
    setActionError(false);
    try {
      if (prompt === 'delete') await deleteMyAccount('SUPPRIMER');
      else await signOut();
    } catch {
      setActionError(true);
    } finally {
      accountAction.current = false;
      setBusy(false);
    }
  }

  const canDelete = confirmation === 'SUPPRIMER' && !busy;
  const panel = { borderColor: theme.dailyBorder, backgroundColor: theme.dailyCard };

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <Stack.Screen options={headerOptions} />
      <View style={styles.section}>
        <ThemedText accessibilityRole="header" style={[styles.heading, { color: theme.dailyInk }]}>Apparence</ThemedText>
        <View accessibilityRole="radiogroup" accessibilityLabel="Thème" style={[styles.card, panel]}>
          {themes.map(({ value, label }, index) => {
            const selected = value === preference;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                aria-checked={selected}
                onPress={() => void chooseTheme(value)}
                style={({ pressed }) => [
                  styles.row, index > 0 && [styles.divider, { borderColor: theme.dailyBorder }],
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={styles.label}>{label}</ThemedText>
                <View aria-hidden style={[styles.radio, { borderColor: selected ? theme.dailyAccent : theme.dailyMuted }]}>
                  {selected && <View style={[styles.dot, { backgroundColor: theme.dailyAccent }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>
        {themeError && <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">Impossible d’enregistrer le thème. Réessaie.</ThemedText>}
      </View>

      <View style={styles.section}>
        <ThemedText accessibilityRole="header" style={[styles.heading, { color: theme.dailyInk }]}>Compte</ThemedText>
        {prompt === 'delete' ? (
          <View style={[styles.confirmation, panel]}>
            <ThemedText type="smallBold" accessibilityLiveRegion="polite">
              Supprimer définitivement ton compte ?
            </ThemedText>
            <TextField
              label="Saisis SUPPRIMER pour confirmer"
              value={confirmation}
              editable={!busy}
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setConfirmation}
            />
            {actionError && (
              <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
                Impossible de supprimer ton compte. Réessaie.
              </ThemedText>
            )}
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => changePrompt()} style={styles.ghost}>
                <ThemedText type="smallBold" themeColor="textSecondary">Annuler</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy }}
                disabled={!canDelete}
                onPress={() => void confirmAction()}
                style={({ pressed }) => [styles.ghost, (pressed || !canDelete) && styles.pressed]}>
                <ThemedText type="smallBold" themeColor="danger">
                  {busy ? 'En cours…' : 'Supprimer'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Button variant="primarySolid" label="Se déconnecter" leadingIcon={logout} onPress={() => changePrompt('signout')} style={styles.primary} />
            <Pressable
              accessibilityRole="button"
              onPress={() => changePrompt('delete')}
              style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="danger">Supprimer mon compte</ThemedText>
            </Pressable>
          </>
        )}
      </View>
      {prompt === 'signout' && (
        <Modal
          transparent
          animationType={reducedMotion ? 'none' : 'fade'}
          statusBarTranslucent
          navigationBarTranslucent
          onRequestClose={() => changePrompt()}>
          <View style={styles.modal}>
            <View aria-hidden pointerEvents="none" style={styles.scrim} />
            <ScrollView contentContainerStyle={styles.modalContent} bounces={false}>
              <Pressable
                aria-hidden
                accessible={false}
                focusable={false}
                onPress={() => changePrompt()}
                style={styles.backdrop}
              />
              <View accessibilityViewIsModal style={[styles.dialog, panel, { paddingBottom: Spacing.three + bottom }]}>
                <ThemedText accessibilityRole="header" style={[styles.dialogTitle, { color: theme.dailyInk }]}>
                  Te déconnecter ?
                </ThemedText>
                {actionError && (
                  <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
                    Impossible de te déconnecter. Réessaie.
                  </ThemedText>
                )}
                <View style={styles.dialogActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => changePrompt()}
                    style={({ pressed }) => [
                      styles.dialogAction, styles.dialogCancel, { backgroundColor: theme.dailySurface },
                      (pressed || busy) && styles.pressed,
                    ]}>
                    <ThemedText type="smallBold" style={{ color: theme.dailyInk }}>Annuler</ThemedText>
                  </Pressable>
                  <Button
                    label={busy ? 'Déconnexion…' : 'Se déconnecter'}
                    accessibilityState={{ busy }}
                    disabled={busy}
                    onPress={() => void confirmAction()}
                    style={styles.dialogAction}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </Screen>
  );
}
