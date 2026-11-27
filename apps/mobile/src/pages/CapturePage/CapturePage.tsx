import {
  type CameraType,
  CameraView,
  type FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { isDevice } from "expo-device";
import {
  AndroidHaptics,
  impactAsync,
  ImpactFeedbackStyle,
  performAndroidHapticsAsync,
} from "expo-haptics";
import {
  getMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  BackHandler,
  Linking,
  Platform,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { DailyColor } from "@/data/adapters/daily-color.adapters";
import { rememberChallengePhotoDraft } from "@/data/challenge-photo-draft";
import { rememberDailyColorReveal } from "@/data/daily-color-reveal";
import { getCachedDailyChallenge } from "@/data/daily-color-cache";
import { useSession } from "@/data/session-provider";
import { getCapturePage } from "@/data/get-capture-page";
import { useTheme } from "@/hooks/use-theme";
import { discardTemporaryPhoto } from "@/lib/discard-temporary-photo";
import { photoDateFromExif } from "@/lib/photo-date";

import CapturePageControls from "./_page/CapturePageControls";
import CapturePageDailyColor from "./_page/CapturePageDailyColor";
import CapturePagePermission from "./_page/CapturePagePermission";
import CapturePageTopBar from "./_page/CapturePageTopBar";
import CapturePageViewfinder from "./_page/CapturePageViewfinder";
import { styles } from "./CapturePage.styles";
import { useCaptureMotion } from "./use-capture-motion";

const PHOTO_QUALITY = 0.8;

export default function CapturePage() {
  const theme = useTheme();
  const accountId = useSession().user?.id;
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const photoInProgress = useRef(false);
  const autoRequested = useRef(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  const [ready, setReady] = useState(false);
  const [photoAction, setPhotoAction] = useState<"capture" | "library">();
  const busy = photoAction !== undefined;
  const [unavailable, setUnavailable] = useState(!isDevice);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [error, setError] = useState<string>();
  const [dailyColor, setDailyColor] = useState<DailyColor>();
  const [colorExpanded, setColorExpanded] = useState(false);
  const { viewfinderStyle, topBarStyle, controlsStyle, previewCoverStyle } = useCaptureMotion(ready);

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

  // Today's color, shown on demand over the preview. Reloaded on focus and when the day changes.
  useFocusEffect(
    useCallback(() => {
      if (!accountId || !appActive) return;
      const controller = new AbortController();
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;

      const loadColor = async () => {
        setDailyColor((current) =>
          current && current.refreshAt > performance.now()
            ? current
            : undefined,
        );
        try {
          const cached = (await getCachedDailyChallenge(accountId))?.color;
          if (controller.signal.aborted) return;
          if (cached && cached.refreshAt > performance.now()) setDailyColor(cached);

          const color = await getCapturePage(accountId);
          if (controller.signal.aborted) return;
          const remaining = color.refreshAt - performance.now();
          if (remaining <= 0) {
            setDailyColor(undefined);
            return;
          }
          setDailyColor(color);
          refreshTimer = setTimeout(() => void loadColor(), remaining + 50);
        } catch {
          if (!controller.signal.aborted) {
            setDailyColor(current => current && current.refreshAt > performance.now() ? current : undefined);
          }
        }
      };

      void loadColor();
      return () => {
        controller.abort();
        clearTimeout(refreshTimer);
      };
    }, [accountId, appActive]),
  );

  useFocusEffect(useCallback(() => () => setColorExpanded(false), []));

  // Android back closes the full-screen color before leaving the screen.
  useEffect(() => {
    if (!colorExpanded) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setColorExpanded(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [colorExpanded]);

  const toggleDailyColor = () => {
    if (!dailyColor) return;
    if (!colorExpanded) {
      // Seen here, the color no longer needs to be unveiled on the home screen.
      void rememberDailyColorReveal(dailyColor.date).catch(() => {});
    }
    setColorExpanded((current) => !current);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate("/");
  };

  const openPhoto = (uri: string, takenAt: string | null, fromCamera = false) => {
    setError(undefined);
    const photoId = rememberChallengePhotoDraft(uri, takenAt, fromCamera);
    router.push({
      pathname: "/defi/confirmation",
      params: { photoId },
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
    if (!ready || !activeCamera || photoInProgress.current) return;
    photoInProgress.current = true;
    if (Platform.OS === "android") {
      void performAndroidHapticsAsync(AndroidHaptics.Virtual_Key).catch(
        () => {},
      );
    } else {
      void impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    }
    setPhotoAction("capture");
    setError(undefined);
    try {
      const takenAt = new Date().toISOString();
      const photo = await activeCamera.takePictureAsync({
        quality: PHOTO_QUALITY,
      });
      if (camera.current === activeCamera) openPhoto(photo.uri, takenAt, true);
      else discardTemporaryPhoto(photo.uri);
    } catch {
      if (camera.current === activeCamera)
        setError("La photo n’a pas été prise. Réessaie.");
    } finally {
      photoInProgress.current = false;
      setPhotoAction(undefined);
    }
  };

  // Its permission is only requested when the player opens it.
  const pickFromLibrary = async () => {
    if (photoInProgress.current) return;
    photoInProgress.current = true;
    setPhotoAction("library");
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
      photoInProgress.current = false;
      setPhotoAction(undefined);
    }
  };

  const showCamera = permission?.granted === true && !unavailable;

  return (
    <View style={[styles.screen, { backgroundColor: theme.dailyCard, paddingTop: showCamera ? insets.top : 0 }]}>
      {showCamera ? (
        <>
          <Animated.View style={[styles.layer, viewfinderStyle]}>
            <CapturePageViewfinder
              preparing={photoAction === "capture"}
              overlay={
                dailyColor && (
                  <CapturePageDailyColor
                    hex={dailyColor.hex}
                    expanded={colorExpanded}
                    onToggle={toggleDailyColor}
                  />
                )
              }
            >
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
              <Animated.View
                pointerEvents="none"
                style={[styles.previewCover, { backgroundColor: theme.dailySurface }, previewCoverStyle]}
              />
            </CapturePageViewfinder>
          </Animated.View>
          <Animated.View
            pointerEvents="box-none"
            style={[styles.topBar, topBarStyle]}
          >
            <CapturePageTopBar
              top={insets.top}
              flash={flash}
              onBack={goBack}
              onToggleFlash={() =>
                setFlash((current) => (current === "off" ? "on" : "off"))
              }
            />
          </Animated.View>
          <Animated.View style={controlsStyle}>
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
          </Animated.View>
        </>
      ) : (
        <Animated.View style={[styles.layer, viewfinderStyle]}>
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
            onOpenLibrary={
              unavailable ? () => void pickFromLibrary() : undefined
            }
          />
        </Animated.View>
      )}
    </View>
  );
}
