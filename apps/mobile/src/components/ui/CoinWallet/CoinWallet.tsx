import { View } from 'react-native';

import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { formatNumber } from '@/lib/format-number';

import { styles } from './CoinWallet.styles';

export function walletLabel(balance?: number) {
  return balance === undefined ? 'Cagnotte KatchCoins' : `${formatNumber(balance)} KatchCoins`;
}

export default function CoinWallet({ balance, interactive = false }: { balance?: number; interactive?: boolean }) {
  return (
    <View accessible={!interactive} aria-hidden={interactive} accessibilityLabel={walletLabel(balance)} style={styles.wallet}>
      <View style={styles.icon}>
        <Icon name="coin" size={40} />
      </View>
      <ThemedText type="smallBold" aria-hidden style={styles.value}>
        {balance === undefined ? '–' : formatNumber(balance)}
      </ThemedText>
    </View>
  );
}
