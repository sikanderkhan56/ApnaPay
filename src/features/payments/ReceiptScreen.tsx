import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Screen } from '@/shared/components/Screen';
import { DetailRow } from '@/shared/components/DetailRow';
import { formatPkr, formatRelativeDate } from '@/utils/format';
import type { AppProps } from '@/app/navigation/types';

export function ReceiptScreen({ navigation, route }: AppProps<'Receipt'>) {
  const { transaction } = route.params;
  const incoming = transaction.direction === 'in';

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name="check" color={colors.success} size={32} />
        </View>
        <Text style={styles.status}>{incoming ? 'Cash added' : 'Payment successful'}</Text>
        <Text style={styles.amount}>{formatPkr(transaction.amount)}</Text>
        <Text style={styles.subtitle}>{transaction.title}</Text>
      </View>
      <View style={styles.card}>
        <DetailRow label="Reference" value={transaction.reference} />
        <DetailRow label="When" value={formatRelativeDate(transaction.createdAt)} />
        <DetailRow label="Fee" value={formatPkr(transaction.fee)} />
        <DetailRow label="Type" value={transaction.type.replace('_', ' ')} />
      </View>
      <Button label="Done" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    gap: 6,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  status: {
    color: colors.success,
    fontWeight: '700',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
});
