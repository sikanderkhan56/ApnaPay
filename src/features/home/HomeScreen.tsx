import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, shadow, typography } from '@/theme';
import { Icon, IconButton, type IconName } from '@/shared/components/Icon';
import { Screen } from '@/shared/components/Screen';
import { TransactionRow } from '@/shared/components/List';
import { useSessionStore } from '@/store/useSessionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { formatPkr } from '@/utils/format';
import type { AppStackParamList, MainTabParamList } from '@/app/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type QuickAction = {
  label: string;
  icon: IconName;
  go: (navigation: Nav) => void;
};

const actions: QuickAction[] = [
  { label: 'Send', icon: 'send', go: nav => nav.navigate('SendMoney') },
  { label: 'Add cash', icon: 'add', go: nav => nav.navigate('AddCash') },
  { label: 'Bills', icon: 'bill', go: nav => nav.navigate('Bills') },
  { label: 'Load', icon: 'load', go: nav => nav.navigate('MobileLoad') },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useSessionStore(s => s.user);
  const wallet = useWalletStore(s => s.wallet);
  const transactions = useWalletStore(s => s.transactions);
  const [hidden, setHidden] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }, []);

  const recent = transactions.slice(0, 4);

  return (
    <Screen scroll padded={false} statusBar="light">
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.hello}>{greeting}</Text>
            <Text style={styles.name}>{user?.name ?? 'ApnaPay user'}</Text>
          </View>
          <IconButton
            name="shield"
            color={colors.textOnPrimary}
            background="rgba(255,255,255,0.16)"
            onPress={() => navigation.navigate('Kyc')}
          />
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>{hidden ? 'Rs ••••••' : formatPkr(wallet.balance)}</Text>
            <Pressable
              onPress={() => setHidden(v => !v)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}>
              <Icon name={hidden ? 'eyeOff' : 'eye'} color={colors.textOnPrimary} />
            </Pressable>
          </View>
          <Text style={styles.tier}>
            {user?.tier === 'verified' ? 'Verified account' : 'Unverified · complete KYC to raise limits'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.actions}>
          {actions.map(item => (
            <Pressable
              key={item.label}
              onPress={() => item.go(navigation)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={styles.action}>
              <View style={styles.actionIcon}>
                <Icon name={item.icon} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable
            onPress={() => navigation.navigate('HistoryTab')}
            accessibilityRole="button"
            accessibilityLabel="See all activity">
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.list}>
          {recent.map(item => (
            <TransactionRow
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hello: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  name: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  balance: {
    ...typography.amount,
    color: colors.textOnPrimary,
    fontSize: 30,
  },
  tier: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    ...shadow.card,
  },
  action: {
    alignItems: 'center',
    width: '25%',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    ...shadow.card,
  },
});
