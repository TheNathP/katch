import { Image, type ImageProps } from "expo-image";
import { router, Tabs, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import ColorCollection from "@/components/ui/ColorCollection";
import NavigationLink from "@/components/ui/NavigationLink";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import ThemedText from "@/components/ui/ThemedText";
import type { MyProfile } from "@/data/adapters/my-profile.adapters";
import { useAvatarCatalog } from "@/data/avatar-catalog-provider";
import { emptyColorCollection } from "@/data/color-collection";
import { getMyProfile } from "@/data/my-profile";
import { useTheme } from "@/hooks/use-theme";
import { xpPerLevel } from "@/lib/progression";
import { Colors, OnboardingColors } from "@/styles/theme";

import { styles } from "./ProfilePage.styles";

const crest = require("@/assets/icon-illus/decorations/profile-crest.svg");
const pix = require("@/assets/images/pix/confident.png");
const pencil = require("@/assets/icons/edit-pencil.svg");
const settings = require("@/assets/icons/settings.svg");
const chevron = require("@/assets/icons/chevron-right.svg");
const history = require("@/assets/icon-illus/profile-history.svg");
const startingStats = { level: 0, xp: 0, challenges: 0, streak: 0, averageScore: 0 };

const metrics = [
  { label: "Défis", value: startingStats.challenges, art: require("@/assets/icon-illus/target.png") },
  { label: "Série", value: startingStats.streak, art: require("@/assets/icon-illus/flame.png") },
  { label: "Score moyen", value: startingStats.averageScore, art: require("@/assets/icon-illus/trophy.png") },
] satisfies { label: string; value: number; art: ImageProps["source"] }[];

const shortcuts = [
  { href: "/amis", label: "Mes amis", art: require("@/assets/icons/community.svg"), tone: OnboardingColors.avatarCoral, tint: OnboardingColors.ink },
  { href: "/progression", label: "Ma progression", art: require("@/assets/icons/badges/xp.svg") },
] satisfies { href: Href; label: string; tone?: string; art: ImageProps["source"]; tint?: string }[];

export default function ProfilePage() {
  const theme = useTheme();
  const { fontScale, width } = useWindowDimensions();
  const { catalog, loadFailed: catalogLoadFailed } = useAvatarCatalog();
  const profileRequest = useRef<AbortController | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const headerOptions = useMemo(() => ({
    headerTitleAlign: "center" as const,
    headerTitleStyle: styles.headerTitle,
    headerStyle: { backgroundColor: theme.dailyCanvas },
    headerTintColor: theme.dailyInk,
    headerShadowVisible: false,
    headerRight: () => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Paramètres"
        onPress={() => router.push("/profil/parametres")}
        style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}>
        <Image aria-hidden source={settings} tintColor={theme.dailyInk} style={styles.settingsIcon} contentFit="contain" />
      </Pressable>
    ),
  }), [theme.dailyCanvas, theme.dailyInk]);

  const loadProfile = useCallback(() => {
    profileRequest.current?.abort();
    const controller = new AbortController();
    profileRequest.current = controller;
    setLoadFailed(false);
    getMyProfile(controller.signal).then(
      (loaded) => {
        if (!controller.signal.aborted) setProfile(loaded);
      },
      () => {
        if (!controller.signal.aborted) setLoadFailed(true);
      },
    );
  }, []);

  useFocusEffect(useCallback(() => {
    loadProfile();
    return () => profileRequest.current?.abort();
  }, [loadProfile]));

  const avatar = catalog?.avatars.find(({ id }) => id === profile?.avatar.avatar);
  const background = catalog?.backgrounds.find(({ id }) => id === profile?.avatar.background);
  const avatarSize = width < 350 ? 109 : 124;
  const loadingProfile = !profile && !loadFailed;
  const loadingAvatar = loadingProfile || Boolean(profile && !catalog && !catalogLoadFailed);
  const placeholder = { backgroundColor: theme.dailySurface };

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <Tabs.Screen options={headerOptions} />
      <View style={styles.hero}>
        <Image aria-hidden source={crest} contentFit="fill" style={[styles.crest, theme === Colors.dark && styles.crestDark]} />
        <View style={styles.avatarWrap}>
          {loadingAvatar ? (
            <View
              accessible={!loadingProfile}
              aria-hidden={loadingProfile}
              accessibilityLabel="Chargement de l’avatar"
              accessibilityState={{ busy: true }}
              style={[placeholder, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            />
          ) : (
            <Avatar
              imageUrl={avatar?.imageUrl}
              fallbackSource={pix}
              backgroundHex={background?.hex ?? OnboardingColors.violetEdge}
              size={avatarSize}
            />
          )}
          {loadingProfile ? (
            <View aria-hidden style={[styles.editLink, placeholder, { borderColor: theme.dailyCanvas }]} />
          ) : (
            <NavigationLink
              href="/profil/modifier"
              label="Modifier mon profil"
              variant="plain"
              style={[styles.editLink, { borderColor: theme.dailyCanvas }]}>
              <Image aria-hidden source={pencil} style={styles.pencil} contentFit="contain" />
            </NavigationLink>
          )}
        </View>
        {profile ? (
          <ThemedText accessibilityRole="header" style={[styles.name, { color: theme.dailyInk }]}>{profile.displayName}</ThemedText>
        ) : loadFailed ? (
          <View style={styles.identityError}>
            <ThemedText accessibilityLiveRegion="polite" style={{ color: theme.dailyInk }}>Profil indisponible</ThemedText>
            <Pressable accessibilityRole="button" onPress={loadProfile} style={styles.retry}>
              <ThemedText type="smallBold" style={{ color: theme.dailyAccent }}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View
            accessible
            accessibilityLabel="Chargement du profil"
            accessibilityState={{ busy: true }}
            style={[styles.namePlaceholder, placeholder]}
          />
        )}

        <View accessible accessibilityLabel={`Niveau ${startingStats.level}, ${startingStats.xp} XP`} style={styles.experience}>
          <ThemedText aria-hidden type="smallBold" style={{ color: theme.dailyMuted }}>Niveau {startingStats.level}</ThemedText>
          <View aria-hidden style={styles.xpRow}>
            <View style={styles.xpTrack}>
              <ProgressBar value={startingStats.xp} max={xpPerLevel} size="small" />
            </View>
            <ThemedText type="smallBold" style={{ color: theme.dailyMuted }}>{startingStats.xp} XP</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.metrics}>
        {metrics.map(({ label, value, art }) => (
          <View
            key={label}
            accessible
            accessibilityLabel={`${label}, ${value}`}
            style={[styles.metric, fontScale > 1.5 && styles.metricFull, { backgroundColor: theme.dailySurface }]}>
            <Image aria-hidden source={art} style={styles.metricArt} contentFit="contain" />
            <ThemedText aria-hidden style={[styles.metricValue, { color: theme.dailyInk }]}>{value}</ThemedText>
            <ThemedText aria-hidden type="smallBold" style={[styles.metricLabel, { color: theme.dailyMuted }]}>{label}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.collection}>
        <ColorCollection collection={emptyColorCollection} preview />
        <NavigationLink
          href="/collection"
          label="Voir toute la collection"
          variant="plain"
          style={styles.collectionLink}>
          <ThemedText type="smallBold" style={{ color: theme.dailyAccent }}>Voir toute la collection</ThemedText>
          <Image aria-hidden source={chevron} style={styles.chevron} tintColor={theme.dailyAccent} contentFit="contain" />
        </NavigationLink>
      </View>

      <View style={styles.shortcuts}>
        <View style={styles.shortcutGrid}>
          {shortcuts.map(({ href, label, art, tone, tint }) => (
            <NavigationLink
              key={href}
              href={href}
              label={label}
              variant="plain"
              style={[
                styles.shortcut,
                fontScale > 1.35 && styles.shortcutFull,
                { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder },
              ]}>
              <View aria-hidden style={[styles.shortcutIcon, { backgroundColor: tone }]}>
                <Image
                  aria-hidden
                  source={art}
                  tintColor={tint}
                  contentFit="contain"
                  style={tone ? styles.shortcutArt : styles.shortcutIllustration}
                />
              </View>
              <ThemedText type="smallBold" style={[styles.shortcutLabel, { color: theme.dailyInk }]}>{label}</ThemedText>
            </NavigationLink>
          ))}
        </View>

        <NavigationLink
          href="/historique"
          label="Historique des défis"
          variant="plain"
          style={[styles.historyLink, { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow }]}>
          <Image aria-hidden source={history} style={styles.historyArt} contentFit="contain" />
          <ThemedText type="smallBold" style={[styles.historyLabel, { color: theme.dailyInk }]}>Historique des défis</ThemedText>
          <Image aria-hidden source={chevron} style={styles.chevron} tintColor={theme.dailyAccent} contentFit="contain" />
        </NavigationLink>
      </View>

    </Screen>
  );
}
