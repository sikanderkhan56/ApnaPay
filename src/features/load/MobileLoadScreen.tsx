import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { ListRow, Segmented } from '@/shared/components/List';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { catalogApi, draftFromBundle, paymentApi } from '@/services/api';
import { FEES } from '@/config/demo';
import { formatPhone } from '@/utils/format';
import { parseAmount } from '@/utils/amount';
import { toErrorMessage } from '@/utils/errors';
import { isValidMobile, normalizeMobile } from '@/utils/validation';
import { useSessionStore } from '@/store/useSessionStore';
import type { AppProps } from '@/app/navigation/types';
import type { TelcoNetwork } from '@/types';

const networks: TelcoNetwork[] = ['jazz', 'telenor', 'zong', 'ufone'];

export function MobileLoadScreen({ navigation }: AppProps<'MobileLoad'>) {
  const userMobile = useSessionStore(s => s.user?.mobile ?? '');
  const [mode, setMode] = useState<'prepaid' | 'postpaid' | 'bundles'>('prepaid');
  const [network, setNetwork] = useState<TelcoNetwork>('jazz');
  const [mobile, setMobile] = useState(userMobile);
  const [amount, setAmount] = useState('500');
  const [postpaidDue, setPostpaidDue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const bundles = useMemo(() => catalogApi.bundles(network), [network]);

  const prepaid = () => {
    const value = parseAmount(amount);
    if (!isValidMobile(mobile) || value == null) {
      setError('Enter a valid number and amount');
      return;
    }
    navigation.navigate('ConfirmPayment', {
      draft: {
        type: 'load',
        title: `${network.toUpperCase()} prepaid`,
        subtitle: formatPhone(mobile),
        amount: value,
        fee: FEES.load,
        meta: { network, mobile: normalizeMobile(mobile), kind: 'prepaid' },
      },
    });
  };

  const fetchPostpaid = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await paymentApi.fetchPostpaid(network, mobile);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setPostpaidDue(result.data.amountDue);
    } catch (err) {
      setError(toErrorMessage(err, 'Could not fetch postpaid bill'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Mobile load" />
      <Segmented
        value={mode}
        onChange={value => {
          setMode(value);
          setPostpaidDue(null);
          setError(undefined);
        }}
        options={[
          { label: 'Easy load', value: 'prepaid' },
          { label: 'Postpaid', value: 'postpaid' },
          { label: 'Bundles', value: 'bundles' },
        ]}
      />
      <View style={styles.networks}>
        {networks.map(item => (
          <Pressable
            key={item}
            onPress={() => setNetwork(item)}
            style={[styles.net, network === item && styles.netActive]}>
            <Text style={[styles.netText, network === item && styles.netTextActive]}>
              {item.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextField
        label="Mobile number"
        value={formatPhone(mobile)}
        onChangeText={value => setMobile(normalizeMobile(value))}
        keyboardType="phone-pad"
      />
      <ErrorText message={error} />
      {mode === 'prepaid' ? (
        <View style={styles.block}>
          <TextField label="Amount (PKR)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <View style={styles.chips}>
            {['100', '250', '500', '1000'].map(chip => (
              <Pressable key={chip} onPress={() => setAmount(chip)} style={styles.chip}>
                <Text style={styles.chipText}>Rs {chip}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="Continue" onPress={prepaid} />
        </View>
      ) : null}
      {mode === 'postpaid' ? (
        <View style={styles.block}>
          <Button label="Fetch postpaid bill" loading={loading} onPress={fetchPostpaid} />
          {postpaidDue != null ? (
            <>
              <Text style={styles.due}>{network.toUpperCase()} bill · Rs {postpaidDue.toLocaleString()}</Text>
              <Button
                label="Pay bill"
                onPress={() =>
                  navigation.navigate('ConfirmPayment', {
                    draft: {
                      type: 'postpaid',
                      title: `${network.toUpperCase()} postpaid`,
                      subtitle: formatPhone(mobile),
                      amount: postpaidDue,
                      fee: FEES.bill,
                      meta: { network, mobile: normalizeMobile(mobile), kind: 'postpaid' },
                    },
                  })
                }
              />
            </>
          ) : null}
        </View>
      ) : null}
      {mode === 'bundles' ? (
        <View style={styles.block}>
          {bundles.map(bundle => (
            <ListRow
              key={bundle.id}
              icon="load"
              title={`${bundle.name} · Rs ${bundle.price}`}
              subtitle={`${bundle.description} · ${bundle.validity}`}
              onPress={() =>
                navigation.navigate('ConfirmPayment', {
                  draft: draftFromBundle(bundle, normalizeMobile(mobile)),
                })
              }
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  networks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 16,
  },
  net: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  netActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  netText: {
    fontWeight: '700',
    color: colors.textMuted,
  },
  netTextActive: {
    color: colors.primaryDark,
  },
  block: {
    gap: 12,
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  due: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
