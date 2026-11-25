import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import FilterChips from '@/components/ui/FilterChips';
import Icon from '@/components/ui/Icon';
import IconLink from '@/components/ui/IconLink';
import IllustratedBanner from '@/components/ui/IllustratedBanner';
import ProgressionLayout from '@/components/ui/ProgressionLayout';
import ThemedText from '@/components/ui/ThemedText';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format-number';
import { shopItems, type ShopItem, type ShopItemCategory } from '@/lib/progression';
import { styles as common } from '@/styles/progression';
import { OnboardingColors } from '@/styles/theme';

import RewardsPagePurchaseDialog from './_page/RewardsPagePurchaseDialog';
import { styles } from './RewardsPage.styles';

const bannerPix = require('@/assets/images/pix/gold-chain.png');

type Filter = 'all' | ShopItemCategory;

const categories = [
  { value: 'all', label: 'Tout' },
  { value: 'mascots', label: 'Mascottes' },
  { value: 'backgrounds', label: 'Fond' },
  { value: 'frames', label: 'Cadres' },
] as const;

const art = {
  original: { source: require('@/assets/icon-illus/shop/pix-original.svg'), tint: OnboardingColors.lavender },
  aqua: { source: require('@/assets/icon-illus/shop/pix-aqua.svg'), tint: OnboardingColors.avatarAmethyst },
  spark: { source: require('@/assets/icon-illus/shop/pix-spark.svg'), tint: OnboardingColors.lilac },
  rose: { source: require('@/assets/images/pix/happy-rose.png'), tint: OnboardingColors.avatarCoral },
  amber: { source: require('@/assets/images/pix/excited-amber.png'), tint: OnboardingColors.avatarAmber },
  amethyst: { source: require('@/assets/images/pix/star-eyes-amethyst.png'), tint: OnboardingColors.avatarAmethyst },
  purpleWave: { source: require('@/assets/icon-illus/shop/purple-wave.svg'), tint: OnboardingColors.lavender },
  limeFrame: { source: require('@/assets/icon-illus/shop/lime-frame.svg'), tint: OnboardingColors.avatarAmber },
};

const purchaseTitles = {
  mascots: 'Style débloqué !',
  backgrounds: 'Fond débloqué !',
  frames: 'Cadre débloqué !',
} satisfies Record<ShopItemCategory, string>;

export default function RewardsPage() {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const compactGrid = width >= 350 && fontScale <= 1.2;
  const { summary, error, busy, load, purchase } = useProgression();
  const [filter, setFilter] = useState<Filter>('all');
  const [dialog, setDialog] = useState<{ item: ShopItem; complete: boolean }>();
  const coins = summary?.coins;
  const headerOptions = useMemo(() => ({
    headerTitleAlign: 'center' as const,
    headerTitleStyle: styles.headerTitle,
    headerStyle: { backgroundColor: theme.dailyCanvas },
    headerTintColor: theme.dailyInk,
    headerShadowVisible: false,
    headerLeft: () => null,
    headerRight: coins === undefined ? undefined : () => (
      <View accessible accessibilityLabel={`${coins} KatchCoins`} style={styles.wallet}>
        <View style={styles.walletIcon}>
          <Icon name="coin" size={40} />
        </View>
        <ThemedText type="smallBold" aria-hidden style={styles.walletValue}>{formatNumber(coins)}</ThemedText>
      </View>
    ),
  }), [coins, theme.dailyCanvas, theme.dailyInk]);
  const visibleItems = filter === 'all' ? shopItems : shopItems.filter(item => item.category === filter);

  async function buy(item: ShopItem) {
    if (await purchase(item)) setDialog({ item, complete: true });
  }

  return (
    <ProgressionLayout backgroundColor={theme.dailyCanvas} loading={!summary && !error} error={error} retry={() => void load()}>
      <Tabs.Screen options={headerOptions} />
      {summary && (
        <>
          <IllustratedBanner
            title="Personnalise Pix"
            detail="Échange tes KatchCoins contre des mascottes, des fonds et des cadres."
            art={{ source: bannerPix, scale: 1.19 }}
          />

          <View style={styles.shop}>
            <FilterChips options={categories} value={filter} onChange={setFilter} label="Catégories de récompenses" />
            <View style={styles.grid}>
              {visibleItems.map(item => {
                const owned = summary.owned.includes(item.id);
                const missing = Math.max(0, item.price - summary.coins);
                const disabled = owned || missing > 0 || busy;
                const { source, tint } = art[item.art];

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={owned ? `${item.name}, obtenu` : `Acheter ${item.name} pour ${item.price} KatchCoins`}
                    accessibilityHint={!owned && missing > 0 ? `Il manque ${formatNumber(missing)} pièces` : undefined}
                    disabled={disabled}
                    onPress={() => setDialog({ item, complete: false })}
                    style={({ pressed }) => [
                      styles.item,
                      compactGrid ? styles.itemThird : styles.itemHalf,
                      { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow },
                      pressed && styles.itemPressed,
                    ]}>
                    <View aria-hidden style={[styles.artWell, { backgroundColor: tint }]}>
                      <Image aria-hidden source={source} style={styles.art} contentFit="contain" />
                    </View>
                    <View aria-hidden style={styles.itemFooter}>
                      <Icon name={owned ? 'check' : 'coin'} size={owned ? 18 : 25} />
                      <ThemedText type="smallBold" style={[styles.price, { color: theme.dailyInk }]}>
                        {owned ? 'Obtenu' : formatNumber(item.price)}
                      </ThemedText>
                      {!owned && missing > 0 && <Icon name="lock" size={11} color={theme.dailyMuted} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={common.section}>
            <IconLink href="/recompenses/badges" icon="trophy" label="Mes badges" />
            <IconLink href="/progression" icon="xp" label="Ma progression" />
          </View>
        </>
      )}
      {dialog && (
        <RewardsPagePurchaseDialog
          name={dialog.item.name}
          title={purchaseTitles[dialog.item.category]}
          price={dialog.item.price}
          art={art[dialog.item.art].source}
          artBackground={art[dialog.item.art].tint}
          busy={busy}
          error={error}
          onConfirm={dialog.complete ? undefined : () => buy(dialog.item)}
          onClose={() => setDialog(undefined)}
        />
      )}
    </ProgressionLayout>
  );
}
