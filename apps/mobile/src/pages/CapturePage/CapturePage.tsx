import {
  type CameraType,
  CameraView,
  type FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { isDevice } from "expo-device";
import {
  AndroidHaptics,
  ImpactFeedbackStyle,
  impactAsync,
  performAndroidHapticsAsync,
} from "expo-haptics";
import {
  getMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { photoDateFromExif } from "@/lib/photo-date";

import CapturePageControls from "./_page/CapturePageControls";
import CapturePagePermission from "./_page/CapturePagePermission";
import CapturePageTopBar from "./_page/CapturePageTopBar";
import CapturePageViewfinder from "./_page/CapturePageViewfinder";
import { styles } from "./CapturePage.styles";

const PHOTO_QUALITY = 0.8;

export default function CapturePage() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const captureInProgress = useRef(false);
  const autoRequested = useRef(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(!isDevice);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [error, setError] = useState<string>();

  // The player may grant the permission from the system settings: re-read it when the app comes back.
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
      if (state === "active") void getPermission().catch(() => {});
      else setReady(false);
    });
    return () => listener.remove();
  }, [getPermission]);

  // The camera is mandatory: ask right away the first time the screen is shown.
  useEffect(() => {
    if (
      !isFocused ||
      autoRequested.current ||
      permission?.status !== "undetermined"
    )
      return;
    autoRequested.current = true;
    void requestPermission().catch(() => {});
  }, [isFocused, permission?.status, requestPermission]);

  // Tabs stay mounted: only run the camera while this tab is on screen and the app in the foreground.
  const cameraActive =
    isFocused && appActive && !unavailable && permission?.granted === true;

  // The preview is unmounted when the tab loses focus: it has to report ready again once remounted.
  useFocusEffect(useCallback(() => () => setReady(false), []));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate("/");
  };

  const openPhoto = (uri: string, takenAt: string | null) => {
    setError(undefined);
    router.push({
      pathname: "/defi/confirmation",
      params: takenAt ? { uri, takenAt } : { uri },
    });
  };

  const activateCamera = async () => {
    try {
      if (permission?.canAskAgain === false) await Linking.openSettings();
      else await requestPermission();
    } catch {
      setError(
        "Impossible d’activer la caméra. Vérifie les autorisations de Katch.",
      );
    }
  };

  const capture = async () => {
    const activeCamera = camera.current;
    if (!ready || !activeCamera || captureInProgress.current) return;
    captureInProgress.current = true;
    if (Platform.OS === "android") {
      void performAndroidHapticsAsync(AndroidHaptics.Virtual_Key).catch(
        () => {},
      );
    } else {
      void impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    }
    setBusy(true);
    setError(undefined);
    try {
      const takenAt = new Date().toISOString();
      const photo = await activeCamera.takePictureAsync({
        quality: PHOTO_QUALITY,
      });
      if (camera.current === activeCamera) openPhoto(photo.uri, takenAt);
    } catch {
      if (camera.current === activeCamera)
        setError("La photo n’a pas été prise. Réessaie.");
    } finally {
      captureInProgress.current = false;
      setBusy(false);
    }
  };

  // Its permission is only requested when the player opens it.
  const pickFromLibrary = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      let libraryPermission = await getMediaLibraryPermissionsAsync();
      if (!libraryPermission.granted && libraryPermission.canAskAgain) {
        libraryPermission = await requestMediaLibraryPermissionsAsync();
      }
      if (!libraryPermission.granted) {
        Alert.alert(
          "Accès à tes photos refusé",
          "Autorise Katch à accéder à tes photos dans les réglages pour importer une image. Tu peux aussi prendre une photo.",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Ouvrir les réglages",
              onPress: () => void Linking.openSettings(),
            },
          ],
        );
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: "images",
        quality: PHOTO_QUALITY,
        exif: true,
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) openPhoto(asset.uri, photoDateFromExif(asset.exif));
    } catch {
      setError("Impossible d’ouvrir ta galerie. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  const showCamera = permission?.granted === true && !unavailable;

  return (
    <View style={styles.screen}>
      {showCamera ? (
        <>
          <CapturePageViewfinder>
            {cameraActive && (
              <CameraView
                ref={camera}
                facing={facing}
                flash={flash}
                mode="picture"
                onCameraReady={() => setReady(true)}
                onMountError={() => {
                  setReady(false);
                  setUnavailable(true);
                }}
                style={styles.camera}
              />
            )}
          </CapturePageViewfinder>
          <CapturePageTopBar
            top={insets.top}
            flash={flash}
            onBack={goBack}
            onToggleFlash={() =>
              setFlash((current) => (current === "off" ? "on" : "off"))
            }
          />
          <CapturePageControls
            bottom={insets.bottom}
            canCapture={cameraActive && ready && !busy}
            busy={busy}
            error={error}
            onCapture={() => void capture()}
            onOpenLibrary={() => void pickFromLibrary()}
            onFlip={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          />
        </>
      ) : (
        <CapturePagePermission
          insets={insets}
          state={
            unavailable
              ? "unavailable"
              : !permission
                ? "loading"
                : permission.canAskAgain
                  ? "ask"
                  : "settings"
          }
          error={error}
          onBack={goBack}
          onActivate={() => void activateCamera()}
          onOpenLibrary={unavailable ? () => void pickFromLibrary() : undefined}
        />
      )}
    </View>
  );
}
