import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { Button } from '@/shared/components/Button';
import { LogoMark } from '@/shared/components/Icon';
import { PinPad } from '@/shared/components/PinPad';
import { Screen } from '@/shared/components/Screen';
import { ErrorText } from '@/shared/components/ErrorText';
import { BiometricPrompt } from '@/shared/components/BiometricPrompt';
import { useSessionStore } from '@/store/useSessionStore';
import { biometricService } from '@/services/biometrics/biometricService';
import { formatPhone } from '@/utils/format';
import { toErrorMessage } from '@/utils/errors';

export function UnlockScreen() {
  const user = useSessionStore(s => s.user);
  const biometricEnabled = useSessionStore(s => s.biometricEnabled);
  const remoteLock = useSessionStore(s => s.remoteLock);
  const unlockWithMpin = useSessionStore(s => s.unlockWithMpin);
  const unlock = useSessionStore(s => s.unlock);
  const resetDemo = useSessionStore(s => s.resetDemo);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [bio, setBio] = useState(false);

  useEffect(() => {
    if (biometricEnabled && !remoteLock && biometricService.isAvailable()) {
      setBio(true);
    }
  }, [biometricEnabled, remoteLock]);

  const onPin = async (value: string) => {
    setPin(value);
    if (value.length !== 4) {
      return;
    }
    try {
      await unlockWithMpin(value);
    } catch (err) {
      setError(toErrorMessage(err, 'Unlock failed'));
      setPin('');
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <LogoMark size={88} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{user ? formatPhone(user.mobile) : 'ApnaPay'}</Text>
      </View>
      {remoteLock ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Signed in on another device</Text>
          <Text style={styles.bannerBody}>
            This wallet allows one active device. Enter your MPIN to reclaim this phone.
          </Text>
        </View>
      ) : null}
      <ErrorText message={error} />
      <PinPad value={pin} onChange={onPin} />
      {biometricEnabled && !remoteLock && biometricService.isAvailable() ? (
        <Button label="Unlock with fingerprint" variant="secondary" onPress={() => setBio(true)} />
      ) : null}
      <Button label="Reset demo account" variant="ghost" onPress={resetDemo} />
      <BiometricPrompt
        visible={bio}
        reason="Unlock ApnaPay with your fingerprint"
        onCancel={() => setBio(false)}
        onSuccess={() => {
          setBio(false);
          unlock();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  banner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  bannerTitle: {
    color: colors.danger,
    fontWeight: '700',
  },
  bannerBody: {
    color: colors.textMuted,
    lineHeight: 18,
  },
});
