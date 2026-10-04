import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSessionStore } from '@/store/useSessionStore';
import { formatCnic } from '@/utils/format';
import { toErrorMessage } from '@/utils/errors';
import { normalizeCnic } from '@/utils/validation';
import { wait } from '@/utils/delay';
import type { AppProps } from '@/app/navigation/types';

export function KycScreen({ navigation }: AppProps<'Kyc'>) {
  const user = useSessionStore(s => s.user);
  const verifyKyc = useSessionStore(s => s.verifyKyc);
  const [name, setName] = useState(user?.name ?? '');
  const [cnic, setCnic] = useState(user?.cnic ?? '');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const scan = async () => {
    setScanning(true);
    await wait(900);
    setName('Sikander Khan');
    setCnic('3520212345671');
    setScanning(false);
  };

  const submit = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await verifyKyc({ name, cnic });
      navigation.goBack();
    } catch (err) {
      setError(toErrorMessage(err, 'NADRA verification failed'));
    } finally {
      setLoading(false);
    }
  };

  if (user?.kycStatus === 'verified') {
    return (
      <Screen>
        <Header title="KYC" />
        <View style={styles.card}>
          <Text style={styles.title}>You’re verified</Text>
          <Text style={styles.muted}>
            NADRA match complete. This account can send up to Rs 50,000 per transaction.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Upgrade account" />
      <Text style={styles.lead}>
        Scan your CNIC. Production would call NADRA; this demo fills known data and upgrades your send limits.
      </Text>
      <View style={styles.scanBox}>
        <Text style={styles.scanTitle}>{scanning ? 'Reading CNIC…' : 'CNIC scanner'}</Text>
        <Button label={scanning ? 'Scanning' : 'Simulate CNIC scan'} onPress={scan} loading={scanning} />
      </View>
      <TextField label="Full name" value={name} onChangeText={setName} />
      <View style={styles.gap} />
      <TextField
        label="CNIC"
        value={formatCnic(cnic)}
        onChangeText={value => setCnic(normalizeCnic(value))}
        keyboardType="number-pad"
      />
      <ErrorText message={error} />
      <View style={styles.gap} />
      <Button label="Verify with NADRA" loading={loading} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  scanBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  scanTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  gap: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
