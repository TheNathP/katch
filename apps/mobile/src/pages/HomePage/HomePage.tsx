import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';
import { hasCompletedOnboarding } from '@/data/onboarding-progress';

export default function HomePage() {
  const [completedOnboarding, setCompletedOnboarding] = useState<boolean>();

  useEffect(() => {
    if (__DEV__) return;
    let active = true;
    void hasCompletedOnboarding().then(
      (completed) => { if (active) setCompletedOnboarding(completed); },
      () => { if (active) setCompletedOnboarding(true); },
    );
    return () => { active = false; };
  }, []);

  if (__DEV__ || completedOnboarding === false) return <Redirect href="/bienvenue" />;
  if (completedOnboarding === undefined) return null;

  return (
    <Screen>
      <NavigationLink href="/defi" label="Capturer ma couleur" variant="primarySolid" />
      <NavigationLink href="/classement" label="Classement du jour" />
      <NavigationLink href="/progression/serie" label="Ma série" />
      <NavigationLink href="/bienvenue" label="Découvrir Katch" />
    </Screen>
  );
}
