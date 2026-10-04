import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { ListRow } from '@/shared/components/List';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { catalogApi, draftFromBill, paymentApi } from '@/services/api';
import { createId } from '@/utils/format';
import { useWalletStore } from '@/store/useWalletStore';
import type { AppProps } from '@/app/navigation/types';
import type { BillCategory, FetchedBill } from '@/types';
import { colors, radius } from '@/theme';

const categories: { label: string; value: BillCategory | 'saved' }[] = [
  { label: 'Saved', value: 'saved' },
  { label: 'Power', value: 'electricity' },
  { label: 'Gas', value: 'gas' },
  { label: 'Water', value: 'water' },
  { label: 'Internet', value: 'internet' },
  { label: 'Landline', value: 'landline' },
];

export function BillsScreen({ navigation }: AppProps<'Bills'>) {
  const savedBills = useWalletStore(s => s.savedBills);
  const saveBill = useWalletStore(s => s.saveBill);
  const [tab, setTab] = useState<BillCategory | 'saved'>('saved');
  const [billerId, setBillerId] = useState<string | null>(null);
  const [consumerId, setConsumerId] = useState('');
  const [fetched, setFetched] = useState<FetchedBill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const billers = useMemo(() => {
    if (tab === 'saved') {
      return [];
    }
    return catalogApi.billers().filter(item => item.category === tab);
  }, [tab]);

  const fetch = async () => {
    if (!billerId) {
      setError('Select a company first');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await paymentApi.fetchBill(billerId, consumerId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setFetched(result.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Utility bills" />
      <View style={styles.tabs}>
        {categories.map(item => {
          const active = tab === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => {
                setTab(item.value);
                setBillerId(null);
                setFetched(null);
              }}
              style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {tab === 'saved' ? (
        <View style={styles.block}>
          {savedBills.length === 0 ? (
            <Text style={styles.muted}>No saved bills yet. Fetch a bill and save it for next time.</Text>
          ) : (
            savedBills.map(item => (
              <ListRow
                key={item.id}
                icon="bill"
                title={item.nickname}
                subtitle={`${item.billerName} · ${item.consumerId}`}
                onPress={() => {
                  setTab(item.category);
                  setBillerId(item.billerId);
                  setConsumerId(item.consumerId);
                }}
              />
            ))
          )}
        </View>
      ) : (
        <View style={styles.block}>
          {billers.map(item => (
            <ListRow
              key={item.id}
              icon="bill"
              title={item.name}
              subtitle={item.consumerHint}
              onPress={() => {
                setBillerId(item.id);
                setFetched(null);
              }}
              right={
                billerId === item.id ? <Text style={styles.link}>Selected</Text> : undefined
              }
            />
          ))}
          <TextField
            label="Consumer / reference number"
            value={consumerId}
            onChangeText={setConsumerId}
            placeholder="e.g. 14123456789012"
          />
          <ErrorText message={error} />
          <Button label="Fetch bill" loading={loading} onPress={fetch} />
        </View>
      )}

      {fetched ? (
        <View style={styles.block}>
          <Text style={styles.heading}>{fetched.billerName}</Text>
          <Text style={styles.muted}>{fetched.customerName}</Text>
          <Text style={styles.heading}>Rs {fetched.amountDue.toLocaleString()}</Text>
          <Text style={styles.muted}>Due {new Date(fetched.dueDate).toDateString()}</Text>
          <Button
            label="Pay this bill"
            onPress={() => navigation.navigate('ConfirmPayment', { draft: draftFromBill(fetched) })}
          />
          <Button
            label="Save for next time"
            variant="secondary"
            onPress={() =>
              saveBill({
                id: createId('sb'),
                billerId: fetched.billerId,
                billerName: fetched.billerName,
                consumerId: fetched.consumerId,
                nickname: fetched.billerName,
                category:
                  catalogApi.billers().find(item => item.id === fetched.billerId)?.category ??
                  'electricity',
              })
            }
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabText: {
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.primaryDark,
  },
  block: {
    marginTop: 16,
    gap: 8,
  },
  muted: {
    color: colors.textMuted,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
