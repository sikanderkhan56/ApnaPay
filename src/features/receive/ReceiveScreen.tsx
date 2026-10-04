import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { Segmented } from '@/shared/components/List';
import { TextField } from '@/shared/components/TextField';
import { useSessionStore } from '@/store/useSessionStore';
import { formatPhone } from '@/utils/format';
import { isValidAmount } from '@/utils/validation';
import type { AppStackParamList, MainTabParamList } from '@/app/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'QrTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export function ReceiveScreen() {
  const navigation = useNavigation<Nav>();
  const user = useSessionStore(s => s.user);
  const [tab, setTab] = useState<'receive' | 'scan'>('receive');
  const [amount, setAmount] = useState('');

  const payload = useMemo(() => {
    const params = new URLSearchParams({
      m: user?.mobile ?? '',
      n: user?.name ?? 'ApnaPay',
    });
    if (amount && isValidAmount(Number(amount))) {
      params.set('a', amount);
    }
    return `apnapay://pay?${params.toString()}`;
  }, [amount, user?.mobile, user?.name]);

  return (
    <Screen scroll>
      <Header title="QR payments" showBack={false} />
      <View style={styles.headerPad}>
        <Segmented
          value={tab}
          onChange={value => setTab(value as 'receive' | 'scan')}
          options={[
            { label: 'My QR', value: 'receive' },
            { label: 'Scan', value: 'scan' },
          ]}
        />
      </View>
      {tab === 'receive' ? (
        <View style={styles.center}>
          <View style={styles.qrCard}>
            <QRCode value={payload} size={180} color={colors.primaryDark} backgroundColor={colors.surface} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.mobile}>{user ? formatPhone(user.mobile) : ''}</Text>
          <View style={styles.amountBox}>
            <TextField
              label="Request amount (optional)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="Leave empty for open QR"
            />
          </View>
          <Text style={styles.hint}>
            Share this QR to receive an ApnaPay transfer. Add an amount to turn it into a payment request.
          </Text>
        </View>
      ) : (
        <View style={styles.scanner}>
          <View style={styles.viewfinder} />
          <Text style={styles.hint}>
            Camera scanning is mocked in this demo. Simulate a scan to fill Send money with Ayesha’s wallet.
          </Text>
          <Button
            label="Simulate QR scan"
            onPress={() =>
              navigation.navigate('SendMoney', {
                preset: { mobile: '03219876543', name: 'Ayesha Malik', amount: '750' },
              })
            }
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    marginBottom: 20,
  },
  center: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  qrCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: radius.lg,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  mobile: {
    color: colors.textMuted,
  },
  amountBox: {
    width: '100%',
    marginTop: 8,
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  scanner: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
  },
  viewfinder: {
    width: 220,
    height: 220,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
});
