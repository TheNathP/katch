const xpPerValidation = 120;
export const demoStartingCoins = 1_000;
const xpPerLevel = 600;
const demoLevelXp = 340;

export const shopItems = [
  { id: 'original', name: 'Pix Original', price: 250, art: 'original', category: 'mascots' },
  { id: 'aqua', name: 'Pix Aqua', price: 400, art: 'aqua', category: 'mascots' },
  { id: 'spark', name: 'Pix Étincelle', price: 550, art: 'spark', category: 'mascots' },
  { id: 'rose', name: 'Pix Rose', price: 180, art: 'rose', category: 'mascots' },
  { id: 'ambre', name: 'Pix Ambre', price: 220, art: 'amber', category: 'mascots' },
  { id: 'amethyste', name: 'Pix Améthyste', price: 360, art: 'amethyst', category: 'mascots' },
  { id: 'purple-wave', name: 'Vague violette', price: 240, art: 'purpleWave', category: 'backgrounds' },
  { id: 'lime-frame', name: 'Cadre Lime', price: 320, art: 'limeFrame', category: 'frames' },
] as const;

export type ShopItem = typeof shopItems[number];
export type ShopItemCategory = ShopItem['category'];
export type ShopItemId = ShopItem['id'];
export type DemoProgression = { validatedDays: string[]; owned: ShopItemId[]; coins: number };

export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function shiftDay(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return utcDay(date);
}

export function createDemoProgression(today: string): DemoProgression {
  const total = 8 + Math.floor(Math.random() * 4);
  const streak = 3 + Math.floor(Math.random() * 3);
  const endOffset = Math.random() < 0.5 ? 0 : 1;
  const recent = Array.from({ length: streak }, (_, index) => shiftDay(today, -endOffset - index));
  let offset = 7;
  const history = Array.from({ length: total - streak }, () => {
    offset += 1 + Math.floor(Math.random() * 3);
    return shiftDay(today, -offset);
  });

  return { validatedDays: [...history.reverse(), ...recent.reverse()], owned: [], coins: demoStartingCoins };
}

export function readDemoProgression(value: unknown): DemoProgression | undefined {
  if (!value || typeof value !== 'object' || !('validatedDays' in value) || !('owned' in value)) return;
  const { validatedDays, owned } = value;
  if (!Array.isArray(validatedDays) || !Array.isArray(owned)) return;

  const days = validatedDays.filter((day): day is string =>
    typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
      && Number.isFinite(Date.parse(day)) && utcDay(new Date(day)) === day);

  const items = owned.filter((id): id is ShopItemId => shopItems.some(item => item.id === id));
  const coins = 'coins' in value && typeof value.coins === 'number'
    && Number.isSafeInteger(value.coins) && value.coins >= 0 ? value.coins : demoStartingCoins;
  return { validatedDays: [...new Set(days)].sort(), owned: [...new Set(items)], coins };
}

export function resetDemoShop(data: DemoProgression): DemoProgression {
  return { ...data, owned: [], coins: demoStartingCoins };
}

const achievements = [
  { id: 'first', title: 'Premier Katch', description: 'Valide ton premier défi.', metric: 'total', goal: 1, unit: 'défi', art: 'trophy' },
  { id: 'three', title: 'Ça chauffe !', description: 'Joue 3 jours de suite.', metric: 'bestStreak', goal: 3, unit: 'jours', art: 'flame' },
  { id: 'seven', title: 'Une semaine en couleurs', description: 'Joue 7 jours de suite.', metric: 'bestStreak', goal: 7, unit: 'jours', art: 'calendarIllustrated' },
  { id: 'level', title: 'En pleine ascension', description: 'Atteins le niveau 3.', metric: 'level', goal: 3, unit: 'niv.', art: 'xpIllustrated' },
  { id: 'ten', title: 'Œil de Pix', description: 'Valide 10 défis.', metric: 'total', goal: 10, unit: 'défis', art: 'target' },
  { id: 'style', title: 'Pix à ta façon', description: 'Adopte ton premier style de Pix.', metric: 'mascotCount', goal: 1, unit: 'style', art: 'gift' },
] as const;

export function summarizeProgression(data: DemoProgression, today: string) {
  const days = data.validatedDays.filter(day => day <= today);
  const validated = new Set(days);
  const total = days.length;
  const completedLevels = Math.floor(total * xpPerValidation / xpPerLevel);
  const level = completedLevels + 1;
  const levelXp = demoLevelXp;
  const xp = completedLevels * xpPerLevel + levelXp;
  const { coins } = data;

  let bestStreak = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of days) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = day;
  }

  const currentStreak = previous === today || previous === shiftDay(today, -1) ? run : 0;
  const mascotCount = shopItems.filter(item => item.category === 'mascots' && data.owned.includes(item.id)).length;
  const statistics = { total, bestStreak, level, mascotCount };
  const badges = achievements.map(badge => ({
    ...badge,
    progress: Math.min(statistics[badge.metric], badge.goal),
    unlocked: statistics[badge.metric] >= badge.goal,
  }));

  return {
    total, xp, level, levelXp, xpPerLevel, coins, currentStreak, bestStreak, badges,
    todayValidated: validated.has(today),
    week: Array.from({ length: 7 }, (_, index) => {
      const date = shiftDay(today, index - 6);
      return { date, done: validated.has(date), isToday: date === today };
    }),
    owned: data.owned,
  };
}

export type ProgressionSummary = ReturnType<typeof summarizeProgression>;

export function purchaseDemoItem(data: DemoProgression, item: ShopItem): DemoProgression {
  if (data.owned.includes(item.id) || data.coins < item.price) return data;
  return { ...data, owned: [...data.owned, item.id], coins: data.coins - item.price };
}
