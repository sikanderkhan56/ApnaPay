import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { DetailRow } from '@/shared/components/DetailRow';
import { formatPkr, formatRelativeDate } from '@/utils/format';
import { labelForMeta } from '@/utils/labels';
import type { AppProps } from '@/app/navigation/types';

export function TransactionDetailScreen({ route }: AppProps<'TransactionDetail'>) {
  const { transaction } = route.params;
  return (
    <Screen>
      <Header title="E-receipt" />
      <View style={styles.card}>
        <Text style={styles.title}>{transaction.title}</Text>
        <Text style={styles.amount}>
          {transaction.direction === 'in' ? '+' : '-'}
          {formatPkr(transaction.amount)}
        </Text>
        <Text style={styles.muted}>{transaction.subtitle}</Text>
        <DetailRow label="Status" value={transaction.status} />
        <DetailRow label="Reference" value={transaction.reference} />
        <DetailRow label="When" value={formatRelativeDate(transaction.createdAt)} />
        <DetailRow label="Fee" value={formatPkr(transaction.fee)} />
        {Object.entries(transaction.meta).map(([key, value]) => (
          <DetailRow key={key} label={labelForMeta(key)} value={value} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
});
