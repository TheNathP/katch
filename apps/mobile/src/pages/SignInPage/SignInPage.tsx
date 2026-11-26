import { useEffect, useState } from 'react';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import ThemedText from '@/components/ui/ThemedText';
import type { AuthResult } from '@/data/adapters/auth.adapters';
import { signInWithEmail } from '@/data/auth';
import { getCachedDailyChallenge } from '@/data/daily-color-cache';
import { isDailyColorRevealed } from '@/data/daily-color-reveal';
import { isValidEmail } from '@/lib/email';

import { styles } from './SignInPage.styles';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedHex, setCachedHex] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRevealedColor() {
      const color = (await getCachedDailyChallenge())?.color;
      if (color && await isDailyColorRevealed(color.date).catch(() => false) && active) {
        setCachedHex(color.hex);
      }
    }

    void loadRevealedColor();
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<AuthResult>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);

    // On 'signed-in', the root layout's route guard redirects to the home screen.
    if (result.status === 'error') setError(result.message);
  }

  function handleEmailSignIn() {
    if (!email.trim() || !password) {
      setError('Renseigne ton email et ton mot de passe.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Adresse email invalide.');
      return;
    }
    run(() => signInWithEmail(email, password));
  }

  return (
    <Screen>
      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleEmailSignIn}
        />

        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        )}

        <Button
          label={pending ? 'Connexion…' : 'Se connecter'}
          onPress={handleEmailSignIn}
          disabled={pending}
        />
      </View>

      <NavigationLink href="/compte/inscription" label="Pas encore de compte ? Créer un compte" replace />

      {cachedHex && (
        <View style={styles.savedColor}>
          <ThemedText type="smallBold">Dernière couleur enregistrée</ThemedText>
          <View aria-hidden style={[styles.swatch, { backgroundColor: cachedHex }]} />
          <ThemedText type="code" selectable>{cachedHex}</ThemedText>
        </View>
      )}
    </Screen>
  );
}
