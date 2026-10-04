import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import { colors, radius } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const palette = variants[variant];
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      android_ripple={
        Platform.OS === 'android' ? { color: palette.ripple, foreground: true } : undefined
      }
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const variants = {
  primary: { bg: colors.primary, fg: colors.textOnPrimary, ripple: 'rgba(255,255,255,0.22)' },
  secondary: { bg: colors.primarySoft, fg: colors.primaryDark, ripple: 'rgba(18,58,140,0.12)' },
  ghost: { bg: 'transparent', fg: colors.primary, ripple: 'rgba(26,86,200,0.08)' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, ripple: 'rgba(186,26,26,0.12)' },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
