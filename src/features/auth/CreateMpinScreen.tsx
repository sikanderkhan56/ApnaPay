import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/theme';
import { Header } from '@/shared/components/Header';
import { PinPad } from '@/shared/components/PinPad';
import { Screen } from '@/shared/components/Screen';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSessionStore } from '@/store/useSessionStore';
import { isValidMpin } from '@/utils/validation';
import type { AuthProps } from '@/app/navigation/types';

export function CreateMpinScreen({ navigation }: AuthProps<'CreateMpin'>) {
  const setMpin = useSessionStore(s => s.setMpin);
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onCreate = (value: string) => {
    setFirst(value);
    if (value.length === 4) {
      if (!isValidMpin(value)) {
        setError('Use a 4-digit MPIN');
        setFirst('');
        return;
      }
      setError(undefined);
      setStep('confirm');
    }
  };

  const onConfirm = async (value: string) => {
    setSecond(value);
    if (value.length !== 4) {
      return;
    }
    if (value !== first) {
      setError('MPINs do not match. Try again.');
      setSecond('');
      return;
    }
    await setMpin(value);
    navigation.replace('BiometricOptIn');
  };

  return (
    <Screen>
      <Header title="Wallet MPIN" />
      <Text style={styles.title}>{step === 'create' ? 'Create a 4-digit MPIN' : 'Confirm your MPIN'}</Text>
      <Text style={styles.subtitle}>
        This PIN unlocks the app and confirms payments. Don’t share it with anyone.
      </Text>
      <ErrorText message={error} />
      {step === 'create' ? (
        <PinPad value={first} onChange={onCreate} />
      ) : (
        <PinPad value={second} onChange={onConfirm} />
      )}
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
});
