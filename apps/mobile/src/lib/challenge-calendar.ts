const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const compactDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const scoreLabel = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const asUtcDate = (day: string) => new Date(day + 'T00:00:00Z');
const capitalize = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

export function isChallengeDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1000-01-01') return false;
  const date = asUtcDate(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isChallengeMonth(value: unknown): value is string {
  return typeof value === 'string' && isChallengeDate(value + '-01');
}

export function shiftChallengeMonth(month: string, delta: number) {
  const date = asUtcDate(month + '-01');
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
}

export function calendarWeeks(month: string) {
  const first = asUtcDate(month + '-01');
  const [year, number] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const weeks = Math.ceil((leading + count) / 7);
  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday - leading + 1;
      return day > 0 && day <= count ? month + '-' + String(day).padStart(2, '0') : null;
    }),
  );
}

export const formatChallengeMonth = (month: string) => capitalize(monthLabel.format(asUtcDate(month + '-01')));
export const formatChallengeDay = (day: string) => capitalize(dayLabel.format(asUtcDate(day)));
export const formatShortChallengeDay = (day: string) => shortDay.format(asUtcDate(day));
export const formatCompactChallengeDay = (day: string) => compactDay.format(asUtcDate(day));
export const formatChallengeScore = (score: number) => scoreLabel.format(score) + '\u00a0%';
