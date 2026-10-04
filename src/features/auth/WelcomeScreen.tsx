import { Alert, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { Button } from '@/shared/components/Button';
import { LogoMark } from '@/shared/components/Icon';
import { Screen } from '@/shared/components/Screen';
import type { AuthProps } from '@/app/navigation/types';

export function WelcomeScreen({ navigation }: AuthProps<'Welcome'>) {
  return (
    <Screen>
      <View style={styles.hero}>
        <LogoMark variant="lockup" size={280} />
      </View>
      <View style={styles.actions}>
        <Text style={styles.demo}>
          Demo build for Android. OTP, NADRA, 1LINK, and IBFT sit behind the same service seams a production app would call.
        </Text>
        <Button label="Get started" onPress={() => navigation.navigate('Phone')} />
        <Button
          label="Demo credentials"
          variant="ghost"
          onPress={() =>
            Alert.alert(
              'Demo credentials',
              'Use any valid 03XXXXXXXXX number.\nOTP is always 123456.\nWallet users: 03219876543, 03331234567.',
            )
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    gap: 8,
    paddingBottom: 12,
  },
  demo: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
});
