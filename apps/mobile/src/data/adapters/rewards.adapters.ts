import type { EquippedRewards, RewardsResponse } from '@/data/api.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function adaptEquippedRewards(value: unknown): EquippedRewards {
  const equipped = isRecord(value) ? value : {};
  return {
    mascots: typeof equipped.mascots === 'string' ? equipped.mascots : null,
    backgrounds: typeof equipped.backgrounds === 'string' ? equipped.backgrounds : null,
    frames: typeof equipped.frames === 'string' ? equipped.frames : null,
  };
}

export function adaptRewards(value: unknown): RewardsResponse {
  if (!isRecord(value) || !isCount(value.coins) || !isCount(value.xp) ||
      !isCount(value.xpPerLevel) || value.xpPerLevel === 0 ||
      !Array.isArray(value.owned) || !value.owned.every(id => typeof id === 'string') ||
      !Array.isArray(value.validatedDays) || !value.validatedDays.every(day =>
        typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day))) ||
      !Array.isArray(value.items) || !Array.isArray(value.badges)) {
    throw new Error('Invalid rewards response');
  }
  const items = value.items.map(item => {
    if (!isRecord(item) || typeof item.id !== 'string' || !isCount(item.price) || !item.price) {
      throw new Error('Invalid shop item');
    }
    return { id: item.id, price: item.price };
  });
  const badges = value.badges.map(badge => {
    if (!isRecord(badge) || typeof badge.id !== 'string' || !isCount(badge.progress) ||
        !isCount(badge.goal) || !badge.goal || !isCount(badge.coins) || typeof (badge.eligible ?? badge.unlocked) !== 'boolean') {
      throw new Error('Invalid badge');
    }
    return {
      id: badge.id, progress: badge.progress, goal: badge.goal, coins: badge.coins,
      eligible: badge.eligible === true || badge.unlocked === true,
      claimed: badge.claimed === true || badge.unlocked === true,
    };
  });
  return {
    coins: value.coins,
    owned: value.owned,
    validatedDays: [...new Set<string>(value.validatedDays)].sort(),
    items,
    badges,
    xp: value.xp,
    xpPerLevel: value.xpPerLevel,
    equipped: adaptEquippedRewards(value.equipped),
  };
}
