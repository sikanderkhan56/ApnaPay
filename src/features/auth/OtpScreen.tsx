import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { PinPad } from '@/shared/components/PinPad';
import { Screen } from '@/shared/components/Screen';
import { useSessionStore } from '@/store/useSessionStore';
import { formatPhone } from '@/utils/format';
import { toErrorMessage } from '@/utils/errors';
import type { AuthProps } from '@/app/navigation/types';

export function OtpScreen({ navigation, route }: AuthProps<'Otp'>) {
  const { mobile, requestId, demoOtp } = route.params;
  const verifyOtp = useSessionStore(s => s.verifyOtp);
  const requestOtp = useSessionStore(s => s.requestOtp);
  const [otp, setOtp] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(requestId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }
    const timer = setTimeout(() => setResendIn(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (otp.length !== 6) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    const run = async () => {
      try {
        const result = await verifyOtp(mobile, activeRequestId, otp);
        if (cancelled) {
          return;
        }
        const needsMpin = result.isNewUser || !useSessionStore.getState().hasMpin;
        if (needsMpin) {
          navigation.replace('CreateMpin');
        } else {
          navigation.replace('BiometricOptIn');
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(toErrorMessage(err, 'OTP failed'));
        setOtp('');
        setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [otp, mobile, navigation, activeRequestId, verifyOtp]);

  const resend = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await requestOtp(mobile);
      setActiveRequestId(result.requestId);
      setOtp('');
      setResendIn(30);
    } catch (err) {
      setError(toErrorMessage(err, 'Could not resend OTP'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="Verify OTP" />
      <Text style={styles.title}>Enter the 6-digit code</Text>
      <Text style={styles.subtitle}>Sent to {formatPhone(mobile)}</Text>
      <View style={styles.chip}>
        <Text style={styles.chipText}>Demo OTP · {demoOtp}</Text>
      </View>
      <ErrorText message={error} />
      <PinPad value={otp} length={6} onChange={setOtp} masked={false} />
      {loading ? <Text style={styles.subtitle}>Verifying…</Text> : null}
      <Button
        label={resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
        variant="ghost"
        disabled={resendIn > 0 || loading}
        onPress={resend}
      />
      <Button label="Change number" variant="ghost" onPress={() => navigation.goBack()} />
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
    marginBottom: 16,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  chipText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
  },
});
