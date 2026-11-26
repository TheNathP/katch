const formatter = new Intl.NumberFormat('fr-FR');

export function formatNumber(value: number) {
  return formatter.format(value);
}
