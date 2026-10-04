import { StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <Text style={styles.error} accessibilityRole="alert">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontWeight: '600',
  },
});
