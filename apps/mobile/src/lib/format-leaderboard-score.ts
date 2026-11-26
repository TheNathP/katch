const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });

export function formatLeaderboardScore(score: number | null) {
  return percent.format((score ?? 0) / 100);
}
