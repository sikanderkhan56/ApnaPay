import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { PinPad } from '@/shared/components/PinPad';
import { BiometricPrompt } from '@/shared/components/BiometricPrompt';
import { ErrorText } from '@/shared/components/ErrorText';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void> | void;
  biometricEnabled?: boolean;
  onBiometric?: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export function MpinSheet({
  visible,
  title,
  onClose,
  onConfirm,
  biometricEnabled,
  onBiometric,
  loading,
  error,
}: Props) {
  const [pin, setPin] = useState('');
  const [bio, setBio] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPin('');
      setBio(false);
    }
  }, [visible]);

  const handleChange = async (next: string) => {
    if (loading) {
      return;
    }
    setPin(next);
    if (next.length === 4) {
      await onConfirm(next);
      setPin('');
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Enter your 4-digit MPIN to confirm</Text>
            <ErrorText message={error} />
            <PinPad value={pin} onChange={handleChange} />
            {biometricEnabled && onBiometric ? (
              <Button label="Use fingerprint" variant="secondary" onPress={() => setBio(true)} />
            ) : null}
            {loading ? <Text style={styles.subtitle}>Confirming…</Text> : null}
          </Pressable>
        </Pressable>
      </Modal>
      <BiometricPrompt
        visible={bio}
        reason="Confirm this payment with your fingerprint"
        onCancel={() => setBio(false)}
        onSuccess={async () => {
          setBio(false);
          await onBiometric?.();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
  },
});
