import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { Screen } from '@/shared/components/Screen';
import { Segmented } from '@/shared/components/List';
import { TextField } from '@/shared/components/TextField';
import { catalogApi, paymentApi } from '@/services/api';
import { FEES } from '@/config/demo';
import { formatCnic, formatPhone } from '@/utils/format';
import { parseAmount } from '@/utils/amount';
import { toErrorMessage } from '@/utils/errors';
import {
  isValidCnic,
  isValidMobile,
  isValidPkIban,
  normalizeCnic,
  normalizeIban,
  normalizeMobile,
} from '@/utils/validation';
import type { AppProps } from '@/app/navigation/types';
import type { PaymentDraft } from '@/types';

type Method = 'wallet' | 'ibft' | 'cnic';

export function SendMoneyScreen({ navigation, route }: AppProps<'SendMoney'>) {
  const preset = route.params?.preset;
  const [method, setMethod] = useState<Method>('wallet');
  const [mobile, setMobile] = useState(preset?.mobile ?? '03219876543');
  const [amount, setAmount] = useState(preset?.amount ?? '500');
  const [bankId, setBankId] = useState(catalogApi.banks()[0].id);
  const [iban, setIban] = useState('PK12MUCB0000001234567890');
  const [cnic, setCnic] = useState('3520212345671');
  const [receiverName, setReceiverName] = useState('Cash pickup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (preset?.mobile) {
      setMethod('wallet');
      setMobile(preset.mobile);
    }
    if (preset?.amount) {
      setAmount(preset.amount);
    }
  }, [preset]);

  const continueSend = async () => {
    const value = parseAmount(amount);
    if (value == null) {
      setError('Enter a valid amount');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      let draft: PaymentDraft;
      if (method === 'wallet') {
        const lookup = await paymentApi.lookupWallet(mobile);
        if (!lookup.ok) {
          throw new Error(lookup.error.message);
        }
        draft = {
          type: 'wallet',
          title: lookup.data.name,
          subtitle: formatPhone(lookup.data.mobile),
          amount: value,
          fee: FEES.wallet,
          meta: { mobile: lookup.data.mobile },
        };
      } else if (method === 'ibft') {
        const bank = catalogApi.banks().find(item => item.id === bankId);
        if (!bank || !isValidPkIban(iban)) {
          throw new Error('Select a bank and enter a valid PK IBAN');
        }
        const account = normalizeIban(iban);
        draft = {
          type: 'ibft',
          title: bank.name,
          subtitle: account,
          amount: value,
          fee: FEES.ibft,
          meta: { bankId: bank.shortName, account },
        };
      } else {
        if (!isValidCnic(cnic) || !receiverName.trim()) {
          throw new Error('Enter a valid CNIC and receiver name');
        }
        draft = {
          type: 'cnic',
          title: receiverName.trim(),
          subtitle: formatCnic(cnic),
          amount: value,
          fee: FEES.cnic,
          meta: { cnic: normalizeCnic(cnic) },
        };
      }
      navigation.navigate('ConfirmPayment', { draft });
    } catch (err) {
      setError(toErrorMessage(err, 'Could not start transfer'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Send money" />
      <Segmented
        value={method}
        onChange={setMethod}
        options={[
          { label: 'Wallet', value: 'wallet' },
          { label: 'Bank', value: 'ibft' },
          { label: 'CNIC', value: 'cnic' },
        ]}
      />
      <View style={styles.form}>
        {method === 'wallet' ? (
          <TextField
            label="Receiver mobile"
            value={formatPhone(mobile)}
            onChangeText={value => setMobile(normalizeMobile(value))}
            keyboardType="phone-pad"
          />
        ) : null}
        {method === 'ibft' ? (
          <>
            <Text style={styles.label}>Bank</Text>
            <View style={styles.banks}>
              {catalogApi.banks().map(bank => (
                <Pressable
                  key={bank.id}
                  onPress={() => setBankId(bank.id)}
                  style={[styles.bank, bankId === bank.id && styles.bankActive]}>
                  <Text style={[styles.bankText, bankId === bank.id && styles.bankTextActive]}>
                    {bank.shortName}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextField
              label="IBAN"
              value={iban}
              onChangeText={value => setIban(normalizeIban(value))}
              autoCapitalize="characters"
            />
          </>
        ) : null}
        {method === 'cnic' ? (
          <>
            <TextField
              label="Receiver CNIC"
              value={formatCnic(cnic)}
              onChangeText={value => setCnic(normalizeCnic(value))}
              keyboardType="number-pad"
            />
            <TextField label="Receiver name" value={receiverName} onChangeText={setReceiverName} />
          </>
        ) : null}
        <TextField
          label="Amount (PKR)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <View style={styles.chips}>
          {['500', '1000', '2000', '5000'].map(chip => (
            <Pressable key={chip} onPress={() => setAmount(chip)} style={styles.chip}>
              <Text style={styles.chipText}>Rs {chip}</Text>
            </Pressable>
          ))}
        </View>
        <ErrorText message={error} />
        <Button
          label="Continue"
          loading={loading}
          onPress={continueSend}
          disabled={method === 'wallet' && !isValidMobile(mobile)}
        />
        <Button
          label="Need a demo number?"
          variant="ghost"
          onPress={() =>
            Alert.alert('Wallet contacts', 'Ayesha Malik 03219876543\nAhmed Raza 03331234567')
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
    marginTop: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  banks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bank: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  bankText: {
    fontWeight: '700',
    color: colors.textMuted,
  },
  bankTextActive: {
    color: colors.primaryDark,
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
    fontSize: 12,
  },
});
