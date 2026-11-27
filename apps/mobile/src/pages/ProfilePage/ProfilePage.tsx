import { Image } from "expo-image";
import { router, Tabs } from "expo-router";
import { useMemo } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

import Avatar from "@/components/ui/Avatar";
import ColorCollection from "@/components/ui/ColorCollection";
import NavigationLink from "@/components/ui/NavigationLink";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen from "@/components/ui/Screen";
import Skeleton, { SkeletonBlock } from "@/components/ui/Skeleton";
import ThemedText from "@/components/ui/ThemedText";
import { useAvatarCatalog } from "@/data/avatar-catalog-provider";
import { getColorCollection } from "@/data/challenge-history";
import { useArchiveQuery } from "@/hooks/use-archive-query";
import { useMyProfile } from "@/hooks/use-my-profile";
import { useProgression } from "@/hooks/use-progression";
import { useTheme } from "@/hooks/use-theme";
import { formatNumber } from "@/lib/format-number";
import { formatChallengePercent } from "@/lib/score-feedback";
import { rewardAvatarAppearance } from "@/styles/reward-art";
import { Colors, OnboardingColors } from "@/styles/theme";

import ProfilePageShortcuts from "./_page/ProfilePageShortcuts/ProfilePageShortcuts";
import { styles } from "./ProfilePage.styles";

const crest = require("@/assets/icon-illus/decorations/profile-crest.svg");
const pix = require("@/assets/images/pix/confident.png");
const pencil = require("@/assets/icons/edit-pencil.svg");
const settings = require("@/assets/icons/settings.svg");
const chevron = require("@/assets/icons/chevron-right.svg");
const metrics = [
  { key: "challenges", label: "Défis réalisés", art: require("@/assets/icon-illus/target.png") },
  { key: "streak", label: "Série", art: require("@/assets/icon-illus/flame.png") },
  { key: "averageScore", label: "Score moyen", art: require("@/assets/icon-illus/trophy.png") },
] as const;

export default function ProfilePage() {
  const theme = useTheme();
  const { fontScale, width } = useWindowDimensions();
  const { catalog, loadFailed: catalogLoadFailed } = useAvatarCatalog();
  const { profile, loadFailed, load: loadProfile } = useMyProfile();
  const { data: collection } = useArchiveQuery('collection', getColorCollection);
  const { summary, error: progressionError } = useProgression();
  const stats = profile?.challengeStats;
  const level = summary?.level ?? 0;
  const levelXp = summary?.levelXp ?? 0;
  const xpPerLevel = summary?.xpPerLevel;
  const xpText = xpPerLevel === undefined
    ? formatNumber(levelXp)
    : `${formatNumber(levelXp)} / ${formatNumber(xpPerLevel)}`;
  const metricValues = {
    challenges: formatNumber(stats?.completedChallenges ?? 0),
    streak: formatNumber(summary?.currentStreak ?? 0),
    averageScore: formatChallengePercent(stats?.averageScore ?? 0),
  };

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

  const avatar = catalog?.avatars.find(({ id }) => id === profile?.avatar.avatar);
  const background = catalog?.backgrounds.find(({ id }) => id === profile?.avatar.background);
  const avatarSize = width < 350 ? 109 : 124;
  const loadingProfile = !profile && !loadFailed;
  const loadingProgression = !summary && !progressionError;
  const loadingAvatar = loadingProfile || Boolean(profile && !catalog && !catalogLoadFailed);
  const avatarPlaceholder = { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 };

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <Tabs.Screen options={headerOptions} />
      <View style={styles.hero}>
        <Image aria-hidden source={crest} contentFit="fill" style={[styles.crest, theme === Colors.dark && styles.crestDark]} />
        <View style={styles.avatarWrap}>
          {loadingAvatar ? (
            loadingProfile ? <SkeletonBlock style={avatarPlaceholder} /> : (
              <Skeleton label="Chargement de l’avatar">
                <SkeletonBlock style={avatarPlaceholder} />
              </Skeleton>
            )
          ) : (
            <Avatar
              {...rewardAvatarAppearance(summary?.equipped ?? profile?.equippedRewards)}
              imageUrl={avatar?.imageUrl}
              fallbackSource={pix}
              backgroundHex={background?.hex ?? OnboardingColors.violetEdge}
              size={avatarSize}
            />
          )}
          {loadingProfile ? (
            <SkeletonBlock style={[styles.editLink, { borderColor: theme.dailyCanvas }]} />
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
            <Pressable accessibilityRole="button" onPress={() => void loadProfile(true)} style={styles.retry}>
              <ThemedText type="smallBold" style={{ color: theme.dailyAccent }}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : (
          <Skeleton label="Chargement du profil">
            <SkeletonBlock style={styles.namePlaceholder} />
          </Skeleton>
        )}

        <View
          accessible
          accessibilityLabel={loadingProgression ? "Chargement du niveau" : `Niveau ${level}, ${formatNumber(summary?.xp ?? 0)} XP`}
          accessibilityState={{ busy: loadingProgression }}
          style={styles.experience}>
          <ThemedText aria-hidden type="smallBold" style={{ color: theme.dailyMuted }}>Niveau {level}</ThemedText>
          <View aria-hidden style={styles.xpRow}>
            <View style={styles.xpTrack}>
              <ProgressBar value={levelXp} max={xpPerLevel ?? 0} size="small" />
            </View>
            <ThemedText type="smallBold" style={{ color: theme.dailyMuted }}>{xpText} XP</ThemedText>
          </View>
        </View>
        {progressionError && !summary && (
          <ThemedText type="smallBold" style={{ color: theme.dailyMuted }}>Progression indisponible</ThemedText>
        )}
      </View>

      <View style={styles.metrics}>
        {metrics.map(({ key, label, art }) => {
          const value = metricValues[key];
          const loading = key === "streak" ? loadingProgression : loadingProfile;
          return (
            <View
              key={key}
              accessible
              accessibilityLabel={label}
              accessibilityValue={loading ? undefined : { text: value }}
              accessibilityState={{ busy: loading }}
              style={[styles.metric, fontScale > 1.5 && styles.metricFull, { backgroundColor: theme.dailySurface }]}>
              <Image aria-hidden source={art} style={styles.metricArt} contentFit="contain" />
              {loading ? (
                <SkeletonBlock tone="contrast" style={styles.metricPlaceholder} />
              ) : (
                <ThemedText aria-hidden style={[styles.metricValue, { color: theme.dailyInk }]}>{value}</ThemedText>
              )}
              <ThemedText aria-hidden type="smallBold" style={[styles.metricLabel, { color: theme.dailyMuted }]}>{label}</ThemedText>
            </View>
          );
        })}
      </View>

      <View style={styles.collection}>
        <ColorCollection collection={collection} />
        <NavigationLink
          href="/collection"
          label="Voir toute la collection"
          variant="plain"
          style={styles.collectionLink}>
          <ThemedText type="smallBold" style={{ color: theme.dailyAccent }}>Voir toute la collection</ThemedText>
          <Image aria-hidden source={chevron} style={styles.chevron} tintColor={theme.dailyAccent} contentFit="contain" />
        </NavigationLink>
      </View>

      <ProfilePageShortcuts />

    </Screen>
  );
}
