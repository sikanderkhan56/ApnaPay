import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSessionStore } from '@/store/useSessionStore';
import { formatPhone } from '@/utils/format';
import { toErrorMessage } from '@/utils/errors';
import { isValidMobile, normalizeMobile } from '@/utils/validation';
import { DEMO } from '@/config/demo';
import type { AuthProps } from '@/app/navigation/types';

export function PhoneScreen({ navigation }: AuthProps<'Phone'>) {
  const requestOtp = useSessionStore(s => s.requestOtp);
  const [mobile, setMobile] = useState<string>(DEMO.defaultPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const submit = async () => {
    const normalized = normalizeMobile(mobile);
    if (!isValidMobile(normalized)) {
      setError('Enter a valid 03XXXXXXXXX number');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await requestOtp(normalized);
      navigation.navigate('Otp', {
        mobile: normalized,
        requestId: result.requestId,
        demoOtp: result.demoOtp,
      });
    } catch (err) {
      setError(toErrorMessage(err, 'Could not send OTP'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Mobile number" />
      <Text style={styles.title}>Let’s get you in</Text>
      <Text style={styles.subtitle}>We’ll send a one-time password to verify this number.</Text>
      <View style={styles.form}>
        <TextField
          label="Mobile number"
          value={formatPhone(mobile)}
          onChangeText={value => setMobile(normalizeMobile(value))}
          keyboardType="phone-pad"
          placeholder="03XX XXXXXXX"
          error={error}
        />
        <Button label="Send OTP" onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
});
