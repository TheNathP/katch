import type { ReactNode } from 'react';
import { View } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import ProgressBar from '@/components/ui/ProgressBar';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format-number';

import { styles } from './ProgressPanel.styles';

type Props = {
  icon: IconName;
  title: string;
  detail: string;
  label: string;
  value: number;
  max: number;
  unit: string;
  footer?: ReactNode;
};

export default function ProgressPanel({ icon, title, detail, label, value, max, unit, footer }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.dailyCard, boxShadow: theme.dailyShadow }]}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Icon name={icon} size={35} />
          <View style={styles.copy}>
            <ThemedText type="smallBold" style={{ color: theme.dailyInk }}>{title}</ThemedText>
            <ThemedText type="small" style={{ color: theme.dailyMuted }}>{detail}</ThemedText>
          </View>
        </View>
        <ThemedText type="smallBold" style={[styles.value, { color: theme.dailyInk }]}>
          {formatNumber(value)} / {formatNumber(max)} {unit}
        </ThemedText>
      </View>
      <ProgressBar label={label} value={value} max={max} />
      {footer && <View style={[styles.footer, { borderColor: theme.dailyBorder }]}>{footer}</View>}
    </View>
  );
}
