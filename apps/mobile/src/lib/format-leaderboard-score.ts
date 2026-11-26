const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 });

export function formatLeaderboardScore(score: number | null) {
  return score === null ? null : percent.format(score / 100);
}
