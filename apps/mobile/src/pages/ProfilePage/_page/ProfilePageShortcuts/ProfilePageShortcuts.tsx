import { Image, type ImageProps } from "expo-image";
import type { Href } from "expo-router";
import { View, useWindowDimensions } from "react-native";

import NavigationLink from "@/components/ui/NavigationLink";
import ThemedText from "@/components/ui/ThemedText";
import { useTheme } from "@/hooks/use-theme";
import { OnboardingColors } from "@/styles/theme";

import { styles } from "./ProfilePageShortcuts.styles";

const chevron = require("@/assets/icons/chevron-right.svg");
const history = require("@/assets/icon-illus/profile-history.svg");
const shortcuts = [
  { href: "/amis", label: "Mes amis", art: require("@/assets/icons/community.svg"), tone: OnboardingColors.avatarCoral, tint: OnboardingColors.ink },
  { href: "/progression", label: "Ma progression", art: require("@/assets/icons/badges/xp.svg") },
] satisfies { href: Href; label: string; tone?: string; art: ImageProps["source"]; tint?: string }[];

export default function ProfilePageShortcuts() {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();

  return (
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
        label="Historique et galerie"
        variant="plain"
        style={[styles.historyLink, { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow }]}>
        <Image aria-hidden source={history} style={styles.historyArt} contentFit="contain" />
        <ThemedText type="smallBold" style={[styles.historyLabel, { color: theme.dailyInk }]}>Historique et galerie</ThemedText>
        <Image aria-hidden source={chevron} style={styles.chevron} tintColor={theme.dailyAccent} contentFit="contain" />
      </NavigationLink>
    </View>
  );
}
