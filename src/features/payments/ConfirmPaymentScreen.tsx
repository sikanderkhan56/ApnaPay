import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { MpinSheet } from '@/shared/components/MpinSheet';
import { DetailRow } from '@/shared/components/DetailRow';
import { useSessionStore } from '@/store/useSessionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { ErrorText } from '@/shared/components/ErrorText';
import { formatPkr } from '@/utils/format';
import { toErrorMessage } from '@/utils/errors';
import { labelForMeta } from '@/utils/labels';
import { addMoney } from '@/domain/money';
import type { AppProps } from '@/app/navigation/types';

export function ConfirmPaymentScreen({ navigation, route }: AppProps<'ConfirmPayment'>) {
  const { draft } = route.params;
  const confirmPayment = useWalletStore(s => s.confirmPayment);
  const verifyMpin = useSessionStore(s => s.verifyMpin);
  const biometricEnabled = useSessionStore(s => s.biometricEnabled);
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = addMoney(draft.amount, draft.fee);

  const pay = async () => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await confirmPayment(draft);
      setSheet(false);
      navigation.replace('Receipt', { transaction });
    } catch (err) {
      setError(toErrorMessage(err, 'Payment failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Confirm" />
      <View style={styles.amountBox}>
        <Text style={styles.caption}>You are paying</Text>
        <Text style={styles.amount}>{formatPkr(draft.amount)}</Text>
        <Text style={styles.title}>{draft.title}</Text>
        <Text style={styles.subtitle}>{draft.subtitle}</Text>
      </View>
      <View style={styles.card}>
        <DetailRow label="Fee" value={formatPkr(draft.fee)} />
        <DetailRow label="Total debit" value={formatPkr(total)} />
        {Object.entries(draft.meta).map(([key, value]) => (
          <DetailRow key={key} label={labelForMeta(key)} value={value} />
        ))}
      </View>
      {error && !sheet ? <ErrorText message={error} /> : null}
      <Button label="Confirm & pay" onPress={() => setSheet(true)} />
      <MpinSheet
        visible={sheet}
        title="Authorise payment"
        onClose={() => setSheet(false)}
        loading={loading}
        error={error}
        biometricEnabled={biometricEnabled}
        onConfirm={async pin => {
          try {
            await verifyMpin(pin);
            await pay();
          } catch (err) {
            setError(toErrorMessage(err, 'Incorrect MPIN'));
          }
        }}
        onBiometric={pay}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  caption: {
    color: colors.textMuted,
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
});
