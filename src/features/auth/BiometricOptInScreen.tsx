import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';
import { Screen } from '@/shared/components/Screen';
import { useSessionStore } from '@/store/useSessionStore';
import { biometricService } from '@/services/biometrics/biometricService';
import type { AuthProps } from '@/app/navigation/types';

export function BiometricOptInScreen(_props: AuthProps<'BiometricOptIn'>) {
  const setBiometricEnabled = useSessionStore(s => s.setBiometricEnabled);
  const completeOnboarding = useSessionStore(s => s.completeOnboarding);
  const available = biometricService.isAvailable();

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.icon}>
          <Icon name="fingerprint" size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>Unlock with fingerprint</Text>
        <Text style={styles.subtitle}>
          {available
            ? 'Use Android fingerprint instead of MPIN. You can change this later in Account.'
            : 'This device has no fingerprint hardware. Continue with MPIN.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Enable fingerprint"
          disabled={!available}
          onPress={async () => {
            await setBiometricEnabled(true);
            await completeOnboarding();
          }}
        />
        <Button
          label="Not now"
          variant="ghost"
          onPress={() => {
            completeOnboarding();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    gap: 8,
    paddingBottom: 12,
  },
});
