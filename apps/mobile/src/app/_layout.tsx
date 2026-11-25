import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { hasCompletedOnboarding } from '@/data/onboarding-progress';
import { SessionProvider, useSession } from '@/data/session-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen until the stored session and the onboarding flag have
// been read, so a signed-in player never sees the sign-in screen flash.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeProvider>
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
  const { user, isLoading } = useSession();
  // In development the onboarding is always shown (see onboarding-progress).
  const [completedOnboarding, setCompletedOnboarding] = useState<boolean | undefined>(__DEV__ ? false : undefined);

  useEffect(() => {
    if (__DEV__) return;
    let active = true;
    hasCompletedOnboarding().then(
      (completed) => { if (active) setCompletedOnboarding(completed); },
      () => { if (active) setCompletedOnboarding(true); },
    );
    return () => { active = false; };
  }, []);

  if (isLoading || completedOnboarding === undefined) return null;
  SplashScreen.hide();

  const isSignedIn = user !== null;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerBackTitle: 'Retour' }}>
      <Stack.Protected guard={isSignedIn} redirectTo={completedOnboarding ? '/compte/connexion' : '/bienvenue'}>
        <Stack.Screen name="(tabs)" options={{ title: 'Katch', headerShown: false }} />
        <Stack.Screen name="defi/import" options={{ title: 'Importer une photo' }} />
        <Stack.Screen name="defi/zone" options={{ title: 'Sélectionner la zone' }} />
        <Stack.Screen name="defi/confirmation" options={{ title: 'Confirmer la photo' }} />
        <Stack.Screen name="defi/resultat" options={{ title: 'Résultat' }} />
        <Stack.Screen name="defi/photos" options={{ title: 'Photos du jour' }} />
        <Stack.Screen name="amis/liste" options={{ title: 'Mes amis' }} />
        <Stack.Screen name="amis/recherche" options={{ title: 'Rechercher des amis' }} />
        <Stack.Screen name="joueurs/[playerId]" options={{ title: 'Profil du joueur' }} />
        <Stack.Screen name="classement/index" options={{ title: 'Classement mondial' }} />
        <Stack.Screen name="classement/amis" options={{ title: 'Classement entre amis' }} />
        <Stack.Screen name="classement/hebdomadaire" options={{ title: 'Classement des séries' }} />
        <Stack.Screen name="recompenses/badges" options={{ title: 'Mes badges' }} />
        <Stack.Screen name="progression/index" options={{ title: 'Ma progression' }} />
        <Stack.Screen name="progression/serie" options={{ title: 'Ma série' }} />
        <Stack.Screen name="profil/modifier" options={{ title: 'Modifier mon profil' }} />
        <Stack.Screen name="historique/index" options={{ title: 'Historique des défis' }} />
        <Stack.Screen name="historique/[date]" options={{ title: 'Résultat du défi' }} />
        <Stack.Screen name="galerie" options={{ title: 'Ma galerie' }} />
        <Stack.Screen name="collection" options={{ title: 'Ma collection' }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="bienvenue" options={{ title: 'Découvrir Katch', headerShown: false }} />
        <Stack.Screen name="compte/connexion" options={{ title: 'Connexion' }} />
        <Stack.Screen name="compte/inscription" options={{ title: 'Inscription' }} />
      </Stack.Protected>
    </Stack>
  );
}
