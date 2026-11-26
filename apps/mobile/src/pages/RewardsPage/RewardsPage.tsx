import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import CoinWallet from '@/components/ui/CoinWallet';
import FilterChips from '@/components/ui/FilterChips';
import Icon from '@/components/ui/Icon';
import IconLink from '@/components/ui/IconLink';
import IllustratedBanner from '@/components/ui/IllustratedBanner';
import ProgressionLayout from '@/components/ui/ProgressionLayout';
import ThemedText from '@/components/ui/ThemedText';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format-number';
import type { ShopItem, ShopItemCategory } from '@/lib/progression';
import { styles as common } from '@/styles/progression';
import { rewardArt } from '@/styles/reward-art';

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

const purchaseTitles = {
  mascots: 'Style débloqué !',
  backgrounds: 'Fond débloqué !',
  frames: 'Cadre débloqué !',
} satisfies Record<ShopItemCategory, string>;

export default function RewardsPage() {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const compactGrid = width >= 350 && fontScale <= 1.2;
  const { summary, error, busy, load, change, actionError, clearActionError } = useProgression();
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
      <View style={styles.wallet}><CoinWallet balance={coins} /></View>
    ),
  }), [coins, theme.dailyCanvas, theme.dailyInk]);
  const visibleItems = summary?.items.filter(item => filter === 'all' || item.category === filter) ?? [];
  const dialogOwned = !!dialog && !!summary?.owned.includes(dialog.item.id);
  const dialogEquipped = !!dialog && summary?.equipped[dialog.item.category] === dialog.item.id;

  function openItem(item: ShopItem) {
    clearActionError();
    setDialog({ item, complete: false });
  }

  async function buy(item: ShopItem) {
    if (await change({ action: 'purchase', itemId: item.id })) setDialog({ item, complete: true });
  }

  async function changeEquipment(item: ShopItem) {
    if (await change({ action: dialogEquipped ? 'unequip' : 'equip', itemId: item.id })) setDialog(undefined);
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
                const equipped = summary.equipped[item.category] === item.id;
                const disabled = (!owned && missing > 0) || busy;
                const { source, tint } = rewardArt[item.art];

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={owned ? `${item.name}, ${equipped ? 'équipé' : 'obtenu'}` : `Acheter ${item.name} pour ${item.price} KatchCoins`}
                    accessibilityHint={!owned && missing > 0 ? `Il manque ${formatNumber(missing)} pièces` : undefined}
                    disabled={disabled}
                    onPress={() => openItem(item)}
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
                        {owned ? (equipped ? 'Équipé' : 'Obtenu') : formatNumber(item.price)}
                      </ThemedText>
                      {!owned && missing > 0 && <Icon name="lock" size={11} color={theme.dailyMuted} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={common.section}>
            <ThemedText type="small" themeColor="textSecondary">
              Récupère les pièces de tes succès dans Mes badges. Ton meilleur score du jour rapporte 5 pièces de 86 à 99 %, ou 10 à 100 %.
            </ThemedText>
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
          art={rewardArt[dialog.item.art].source}
          artBackground={rewardArt[dialog.item.art].tint}
          busy={busy}
          error={actionError}
          mode={dialog.complete ? 'complete' : dialogOwned ? 'owned' : 'purchase'}
          equipped={dialogEquipped}
          onConfirm={() => dialogOwned ? changeEquipment(dialog.item) : buy(dialog.item)}
          onClose={() => setDialog(undefined)}
        />
      )}
    </ProgressionLayout>
  );
}
