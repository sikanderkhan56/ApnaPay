import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { TransactionRow } from '@/shared/components/List';
import { useWalletStore } from '@/store/useWalletStore';
import { colors } from '@/theme';
import type { AppStackParamList } from '@/app/navigation/types';

export function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const transactions = useWalletStore(s => s.transactions);
  const loading = useWalletStore(s => s.loading);
  const refresh = useWalletStore(s => s.refresh);

  return (
    <Screen>
      <Header title="Activity" showBack={false} />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionRow
            item={item}
            onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
          />
        )}
        style={styles.list}
        contentContainerStyle={transactions.length === 0 ? styles.emptyWrap : undefined}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
