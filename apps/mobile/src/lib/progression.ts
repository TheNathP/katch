import type { RewardsResponse } from '@/data/api.types';

export const xpPerLevel = 600;

export const shopItems = [
  { id: 'original', name: 'Pix Original', art: 'original', category: 'mascots' },
  { id: 'aqua', name: 'Pix Aqua', art: 'aqua', category: 'mascots' },
  { id: 'spark', name: 'Pix Étincelle', art: 'spark', category: 'mascots' },
  { id: 'rose', name: 'Pix Rose', art: 'rose', category: 'mascots' },
  { id: 'ambre', name: 'Pix Ambre', art: 'amber', category: 'mascots' },
  { id: 'amethyste', name: 'Pix Améthyste', art: 'amethyst', category: 'mascots' },
  { id: 'purple-wave', name: 'Vague violette', art: 'purpleWave', category: 'backgrounds' },
  { id: 'lime-frame', name: 'Cadre Lime', art: 'limeFrame', category: 'frames' },
] as const;

export type ShopItem = typeof shopItems[number] & { price: number };
export type ShopItemCategory = ShopItem['category'];

export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function shiftDay(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return utcDay(date);
}

const achievements = [
  { id: 'first', title: 'Premier Katch', description: 'Valide ton premier défi.', unit: 'défi', art: 'trophy' },
  { id: 'three', title: 'Ça chauffe !', description: 'Valide un défi 3 jours de suite.', unit: 'jours', art: 'flame' },
  { id: 'seven', title: 'Une semaine en couleurs', description: 'Valide un défi 7 jours de suite.', unit: 'jours', art: 'calendarIllustrated' },
  { id: 'level', title: 'En pleine ascension', description: 'Atteins le niveau 3.', unit: 'niv.', art: 'xpIllustrated' },
  { id: 'ten', title: 'Œil de Pix', description: 'Valide 10 défis.', unit: 'défis', art: 'target' },
  { id: 'style', title: 'Pix à ta façon', description: 'Adopte ton premier style de Pix.', unit: 'style', art: 'gift' },
] as const;

export function summarizeProgression(data: RewardsResponse, today: string) {
  const days = data.validatedDays.filter(day => day <= today);
  const validated = new Set(days);
  const total = days.length;
  const { xp, xpPerLevel, coins, equipped } = data;
  const level = Math.floor(xp / xpPerLevel);
  const levelXp = xp % xpPerLevel;

  let bestStreak = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of days) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = day;
  }

  const currentStreak = previous === today || previous === shiftDay(today, -1) ? run : 0;
  const badges = achievements.flatMap(badge => {
    const status = data.badges.find(({ id }) => id === badge.id);
    return status ? [{ ...status, ...badge }] : [];
  });
  const items = shopItems.flatMap(item => {
    const product = data.items.find(({ id }) => id === item.id);
    return product ? [{ ...item, price: product.price }] : [];
  });

  return {
    total, xp, level, levelXp, xpPerLevel, coins, currentStreak, bestStreak, badges,
    todayValidated: validated.has(today),
    week: Array.from({ length: 7 }, (_, index) => {
      const date = shiftDay(today, index - 6);
      return { date, done: validated.has(date), isToday: date === today };
    }),
    owned: data.owned, items, equipped,
  };
}

export type ProgressionSummary = ReturnType<typeof summarizeProgression>;
