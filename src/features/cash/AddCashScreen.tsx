import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Header } from '@/shared/components/Header';
import { ListRow, Segmented } from '@/shared/components/List';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { catalogApi } from '@/services/api';
import { FEES } from '@/config/demo';
import { parseAmount } from '@/utils/amount';
import { isValidCardExpiry, normalizeCardExpiry } from '@/utils/validation';
import type { AppProps } from '@/app/navigation/types';
import type { CashAgent } from '@/types';

function formatCard(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function AddCashScreen({ navigation }: AppProps<'AddCash'>) {
  const [tab, setTab] = useState<'card' | 'agent'>('card');
  const [amount, setAmount] = useState('2000');
  const [card, setCard] = useState('4242424242424242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [error, setError] = useState<string | undefined>();

  const parsedAmount = parseAmount(amount);

  const addViaCard = () => {
    const pan = card.replace(/\D/g, '');
    if (parsedAmount == null || pan.length < 16) {
      setError('Enter a valid amount and 16-digit test card');
      return;
    }
    if (!isValidCardExpiry(expiry)) {
      setError('Enter a valid card expiry (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      setError('Enter a 3-digit CVV');
      return;
    }
    setError(undefined);
    navigation.navigate('ConfirmPayment', {
      draft: {
        type: 'add_card',
        title: 'Add cash via card',
        subtitle: `Visa •••• ${pan.slice(-4)}`,
        amount: parsedAmount,
        fee: FEES.addCard,
        meta: { last4: pan.slice(-4), expiry },
      },
    });
  };

  const addViaAgent = (agent: CashAgent) => {
    if (parsedAmount == null) {
      setError('Enter a valid amount');
      return;
    }
    setError(undefined);
    navigation.navigate('ConfirmPayment', {
      draft: {
        type: 'add_agent',
        title: 'Agent cash-in',
        subtitle: `${agent.name} · ${agent.area}`,
        amount: parsedAmount,
        fee: FEES.addAgent,
        meta: { agentId: agent.id, city: agent.city },
      },
    });
  };

  return (
    <Screen scroll>
      <Header title="Add cash" />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Card', value: 'card' },
          { label: 'Agent', value: 'agent' },
        ]}
      />
      {tab === 'card' ? (
        <View style={styles.block}>
          <Text style={styles.hint}>
            Card rails are mocked. PAN and CVV never leave this screen — only the last four digits go on the receipt.
          </Text>
          <TextField label="Amount (PKR)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <TextField
            label="Card number"
            value={formatCard(card)}
            onChangeText={value => setCard(value.replace(/\D/g, '').slice(0, 16))}
            keyboardType="number-pad"
          />
          <TextField
            label="Expiry"
            value={expiry}
            onChangeText={value => setExpiry(normalizeCardExpiry(value))}
            keyboardType="number-pad"
            placeholder="MM/YY"
          />
          <TextField
            label="CVV"
            value={cvv}
            onChangeText={value => setCvv(value.replace(/\D/g, '').slice(0, 3))}
            keyboardType="number-pad"
            secureTextEntry
          />
          <ErrorText message={error} />
          <Button label="Continue" onPress={addViaCard} />
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.hint}>
            Walk into an authorised Al Makkah Telecom shop and cash-in against your mobile number.
          </Text>
          <TextField label="Amount (PKR)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <ErrorText message={error} />
          {catalogApi.agents().map(agent => (
            <ListRow
              key={agent.id}
              icon="agent"
              title={agent.name}
              subtitle={`${agent.area}, ${agent.city}`}
              onPress={() => addViaAgent(agent)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 16,
    gap: 12,
  },
  hint: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
