import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '@/theme';
import { Icon, type IconName } from '@/shared/components/Icon';
import { formatRelativeDate, formatSignedAmount } from '@/utils/format';
import type { Transaction } from '@/types';

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}>
      <View style={styles.iconWrap}>
        <Icon name={icon} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron" color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

export const TransactionRow = memo(function TransactionRowView({
  item,
  onPress,
}: {
  item: Transaction;
  onPress?: () => void;
}) {
  const incoming = item.direction === 'in';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} ${formatSignedAmount(item.amount, item.direction)}`}
      style={({ pressed }) => [styles.txn, pressed && styles.pressed]}>
      <View style={[styles.txnIcon, incoming ? styles.in : styles.out]}>
        <Icon name={incoming ? 'receive' : 'send'} color={incoming ? colors.success : colors.danger} size={18} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle}>{formatRelativeDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, { color: incoming ? colors.success : colors.text }]}>
        {formatSignedAmount(item.amount, item.direction)}
      </Text>
    </Pressable>
  );
});

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segment} accessibilityRole="tablist">
      {options.map(option => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentActive]}>
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  txn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  in: {
    backgroundColor: colors.successSoft,
  },
  out: {
    backgroundColor: colors.dangerSoft,
  },
  amount: {
    fontWeight: '700',
    fontSize: 14,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surface,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.primaryDark,
  },
});
