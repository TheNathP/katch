import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AvatarCatalogProvider } from '@/data/avatar-catalog-provider';
import { hasCompletedOnboarding } from '@/data/onboarding-progress';
import { SessionProvider, useSession } from '@/data/session-provider';
import { ThemePreferenceProvider, useThemePreference } from '@/data/theme-preference-provider';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useTheme } from '@/hooks/use-theme';

// Keep the splash screen until the stored session and the onboarding flag have
// been read, so a signed-in player never sees the sign-in screen flash.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AppLayout />
    </ThemePreferenceProvider>
  );
}

function AppLayout() {
  const { scheme: colorScheme } = useThemePreference();

  return (
    <SessionProvider>
      <AvatarCatalogProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </ThemeProvider>
      </AvatarCatalogProvider>
    </SessionProvider>
  );
}

/**
 * Every screen requires a signed-in player, except the onboarding and account
 * screens: signed-out players land on the onboarding until they have completed
 * it (always in development), then on the sign-in screen. Any route file NOT declared below is public by default: declare
 * new screens inside the signed-in group.
 *
 * This only hides screens client-side; the real access control is the JWT
 * check in Edge Functions.
 */
function RootNavigator() {
  const theme = useTheme();
  const { user, isLoading } = useSession();
  const { ready: themeReady } = useThemePreference();
  // In development the onboarding is always shown (see onboarding-progress).
  const [completedOnboarding, setCompletedOnboarding] = useState<boolean | undefined>(__DEV__ ? false : undefined);
  usePushNotifications(isLoading || !themeReady || completedOnboarding === undefined ? undefined : user?.id);

  useEffect(() => {
    if (__DEV__) return;
    let active = true;
    hasCompletedOnboarding().then(
      (completed) => { if (active) setCompletedOnboarding(completed); },
      () => { if (active) setCompletedOnboarding(true); },
    );
    return () => { active = false; };
  }, []);

  if (isLoading || !themeReady || completedOnboarding === undefined) return null;
  SplashScreen.hide();

  const isSignedIn = user !== null;
  const archiveHeader = {
    headerStyle: { backgroundColor: theme.dailyCanvas },
    headerTintColor: theme.dailyInk,
    headerShadowVisible: false,
  };

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerBackTitle: 'Retour' }}>
      <Stack.Protected guard={isSignedIn} redirectTo={completedOnboarding ? '/compte/connexion' : '/bienvenue'}>
        <Stack.Screen name="(tabs)" options={{ title: 'Katch', headerShown: false }} />
        <Stack.Screen name="defi/import" options={{ title: 'Importer une photo' }} />
        <Stack.Screen name="defi/zone" options={{ title: 'Sélectionner la zone' }} />
        <Stack.Screen name="defi/confirmation" options={{
          title: 'Confirmer la photo',
          headerStyle: { backgroundColor: theme.dailyCanvas },
          headerTintColor: theme.dailyInk,
          headerShadowVisible: false,
        }} />
        <Stack.Screen name="defi/resultat" options={{ title: 'Résultat', headerShown: false, gestureEnabled: false, animation: 'none' }} />
        <Stack.Screen name="defi/photos" options={{ title: 'Photos du jour' }} />
        <Stack.Screen name="amis/index" options={{ title: 'Mes amis' }} />
        <Stack.Screen name="amis/recherche" options={{ title: 'Rechercher des amis' }} />
        <Stack.Screen name="joueurs/[playerId]" options={{ title: 'Profil du joueur' }} />
        <Stack.Screen name="classement-joueur/[playerId]" options={{
          headerShown: false, presentation: 'transparentModal', animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }} />
        <Stack.Screen name="recompenses/badges" options={{ title: 'Mes badges' }} />
        <Stack.Screen name="progression/index" options={{ title: 'Ma progression' }} />
        <Stack.Screen name="progression/serie" options={{ title: 'Ma série' }} />
        <Stack.Screen name="profil/modifier" options={{ title: 'Modifier mon profil' }} />
        <Stack.Screen name="profil/parametres" options={{ title: 'Paramètres' }} />
        <Stack.Screen name="historique/index" options={{ ...archiveHeader, title: 'Historique des défis', headerTitle: '' }} />
        <Stack.Screen name="historique/[date]" options={{ ...archiveHeader, title: 'Résultat du défi' }} />
        <Stack.Screen name="galerie" options={{ ...archiveHeader, title: 'Ma galerie', headerTitle: '' }} />
        <Stack.Screen name="collection" options={{ ...archiveHeader, title: 'Ma collection', headerTitle: '' }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="bienvenue" options={{ title: 'Découvrir Katch', headerShown: false }} />
        <Stack.Screen name="compte/connexion" options={{ title: 'Connexion' }} />
        <Stack.Screen name="compte/inscription" options={{ title: 'Inscription' }} />
      </Stack.Protected>
    </Stack>
  );
}
