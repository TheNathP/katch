import { CameraView, useCameraPermissions } from 'expo-camera';
import { isDevice } from 'expo-device';
import { Image } from 'expo-image';
import { AndroidHaptics, ImpactFeedbackStyle, impactAsync, performAndroidHapticsAsync } from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, Pressable, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './OnboardingPageCamera.styles';

type Props = { onCapture: (uri: string) => void; photoUri?: string };

export default function OnboardingPageCamera({ onCapture, photoUri }: Props) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const captureInProgress = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void getPermission().catch(() => {});
    });
    return () => listener.remove();
  }, [getPermission]);

  const activateCamera = async () => {
    try {
      if (permission?.canAskAgain === false) await Linking.openSettings();
      else await requestPermission();
    } catch {
      setError('Impossible d’activer la caméra. Vérifie les autorisations de Katch.');
    }
  };

  const capture = async () => {
    const activeCamera = camera.current;
    if (!ready || !activeCamera || captureInProgress.current) return;
    captureInProgress.current = true;
    if (Platform.OS === 'android') {
      void performAndroidHapticsAsync(AndroidHaptics.Virtual_Key).catch(() => {});
    } else if (Platform.OS === 'ios') {
      void impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    }
    setBusy(true);
    setError(undefined);
    try {
      const photo = await activeCamera.takePictureAsync({ quality: 0.65 });
      if (camera.current === activeCamera) onCapture(photo.uri);
    } catch {
      if (camera.current === activeCamera) setError('La photo n’a pas été prise. Réessaie.');
    } finally {
      captureInProgress.current = false;
      if (camera.current === activeCamera) setBusy(false);
    }
  };

  const canPreview = isDevice && !unavailable && permission?.granted;
  const canEnable = isDevice && !unavailable && permission && !permission.granted;

  return (
    <View style={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>Capture la couleur</Text>
      <View style={styles.target}>
        <View aria-hidden style={styles.swatch} />
        <Text style={styles.targetText}>{OnboardingColors.target}</Text>
      </View>

      {photoUri || canPreview ? (
        <>
          <View style={styles.preview}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} contentFit="cover" style={styles.camera} />
            ) : (
              <CameraView
                ref={camera}
                facing="back"
                mode="picture"
                onCameraReady={() => setReady(true)}
                onMountError={() => { setReady(false); setUnavailable(true); }}
                style={styles.camera}
              />
            )}
            <View aria-hidden pointerEvents="none" style={styles.guide}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prendre la photo"
            accessibilityState={{ disabled: !ready || busy || !!photoUri, busy }}
            disabled={!ready || busy || !!photoUri}
            onPress={() => void capture()}
            style={({ pressed }) => [styles.shutter, (!ready || busy || !!photoUri || pressed) && styles.dimmed]}>
            <View style={styles.shutterCenter} />
          </Pressable>
        </>
      ) : (
        <View style={styles.permissionCard}>
          <Text style={styles.message}>
            {!isDevice || unavailable
              ? 'La caméra est indisponible. Tu peux passer l’essai et créer ton compte.'
              : 'Autorise l’accès à la caméra pour essayer le défi. Ta photo d’essai reste sur ton appareil.'}
          </Text>
          {canEnable && (
            <Button
              label={permission.canAskAgain ? 'Autoriser la caméra' : 'Ouvrir les réglages'}
              variant="primarySolid"
              onPress={() => void activateCamera()}
              style={styles.permissionButton}
            />
          )}
        </View>
      )}
      {error && <Text accessibilityLiveRegion="polite" style={styles.message}>{error}</Text>}
    </View>
  );
}
