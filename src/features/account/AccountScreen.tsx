import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ListRow } from '@/shared/components/List';
import { Screen } from '@/shared/components/Screen';
import { useSessionStore } from '@/store/useSessionStore';
import { formatPhone } from '@/utils/format';
import { LIMITS } from '@/config/demo';
import type { AppStackParamList } from '@/app/navigation/types';

export function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useSessionStore(s => s.user);
  const deviceId = useSessionStore(s => s.deviceId);
  const biometricEnabled = useSessionStore(s => s.biometricEnabled);
  const setBiometricEnabled = useSessionStore(s => s.setBiometricEnabled);
  const lock = useSessionStore(s => s.lock);
  const resetDemo = useSessionStore(s => s.resetDemo);
  const simulateOtherDevice = useSessionStore(s => s.simulateOtherDevice);
  const limits = user?.tier === 'verified' ? LIMITS.verified : LIMITS.unverified;

  return (
    <Screen scroll>
      <Header title="Account" showBack={false} />
      <View style={styles.profile}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>{user ? formatPhone(user.mobile) : ''}</Text>
        <Text style={styles.badge}>{user?.tier === 'verified' ? 'Verified · NADRA' : 'Unverified'}</Text>
      </View>
      <ListRow
        icon="shield"
        title="KYC & limits"
        subtitle={`Rs ${limits.perTransaction.toLocaleString()} per transfer`}
        onPress={() => navigation.navigate('Kyc')}
      />
      <ListRow
        icon="fingerprint"
        title="Fingerprint unlock"
        subtitle={biometricEnabled ? 'On' : 'Off'}
        onPress={() => setBiometricEnabled(!biometricEnabled)}
      />
      <ListRow
        icon="lock"
        title="Lock wallet"
        subtitle="Requires MPIN next time"
        onPress={lock}
      />
      <ListRow
        icon="phone"
        title="This device"
        subtitle={`${deviceId.slice(0, 18)} · single active session`}
      />
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Demo integrations</Text>
        <Text style={styles.noteBody}>
          SMS OTP, NADRA, 1LINK bill fetch, IBFT, and card acquiring are mocked in `src/services/api`. Swap the adapters; screens stay the same.
        </Text>
      </View>
      <Button
        label="Simulate login on another device"
        variant="secondary"
        onPress={simulateOtherDevice}
      />
      <Button label="Sign out" variant="secondary" onPress={lock} />
      <Button
        label="Reset demo data"
        variant="danger"
        onPress={() =>
          Alert.alert('Reset demo?', 'This clears the wallet, MPIN, and KYC on this device.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetDemo },
          ])
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 8,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
  },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  note: {
    marginVertical: 16,
    gap: 6,
  },
  noteTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  noteBody: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
