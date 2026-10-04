import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Icon } from '@/shared/components/Icon';

type Props = {
  value: string;
  length?: number;
  onChange: (next: string) => void;
  masked?: boolean;
};

export function PinPad({ value, length = 4, onChange, masked = true }: Props) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

  const press = (key: (typeof keys)[number]) => {
    if (key === '') {
      return;
    }
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < length) {
      onChange(`${value}${key}`);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, index) => {
          const filled = index < value.length;
          return (
            <View key={index} style={[styles.dot, filled && styles.dotFilled]}>
              {filled && !masked ? (
                <Text style={styles.digit}>{value[index]}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={styles.grid}>
        {keys.map(key => (
          <Pressable
            key={key || 'blank'}
            accessibilityRole="button"
            accessibilityLabel={key === 'del' ? 'Delete' : key || undefined}
            onPress={() => press(key)}
            disabled={key === ''}
            style={({ pressed }) => [styles.key, pressed && key !== '' && styles.keyPressed]}>
            {key === 'del' ? (
              <Icon name="back" color={colors.text} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.pinEmpty,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  digit: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '30%',
    height: 68,
    margin: '1.5%',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: colors.primarySoft,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
  },
});
