import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Icon } from '@/shared/components/Icon';
import { Button } from '@/shared/components/Button';

type Props = {
  visible: boolean;
  reason: string;
  onSuccess: () => void;
  onCancel: () => void;
};

/**
 * Android BiometricPrompt-shaped demo UI.
 * Production would call androidx.biometric.BiometricPrompt from a native module.
 */
export function BiometricPrompt({ visible, reason, onSuccess, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Icon name="fingerprint" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Fingerprint</Text>
          <Text style={styles.body}>{reason}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirm fingerprint"
            onPress={onSuccess}
            style={({ pressed }) => [styles.sensor, pressed && styles.sensorPressed]}>
            <Icon name="fingerprint" size={42} color={colors.primaryDark} />
            <Text style={styles.sensorLabel}>Tap sensor to continue</Text>
          </Pressable>
          <Button label="Use MPIN instead" variant="ghost" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 10,
    alignItems: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  sensor: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    gap: 8,
    marginTop: 8,
  },
  sensorPressed: {
    opacity: 0.85,
  },
  sensorLabel: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
