import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { colors } from '@/theme';
import { Icon, type IconName } from '@/shared/components/Icon';
import { HomeScreen } from '@/features/home/HomeScreen';
import { HistoryScreen } from '@/features/history/HistoryScreen';
import { ReceiveScreen } from '@/features/receive/ReceiveScreen';
import { AccountScreen } from '@/features/account/AccountScreen';
import { SendMoneyScreen } from '@/features/send/SendMoneyScreen';
import { ConfirmPaymentScreen } from '@/features/payments/ConfirmPaymentScreen';
import { ReceiptScreen } from '@/features/payments/ReceiptScreen';
import { BillsScreen } from '@/features/bills/BillsScreen';
import { MobileLoadScreen } from '@/features/load/MobileLoadScreen';
import { AddCashScreen } from '@/features/cash/AddCashScreen';
import { KycScreen } from '@/features/kyc/KycScreen';
import { TransactionDetailScreen } from '@/features/history/TransactionDetailScreen';
import { useWalletStore } from '@/store/useWalletStore';
import { SessionGuard } from '@/shared/components/SessionGuard';
import type { AppStackParamList, MainTabParamList } from '@/app/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function tabIcon(name: IconName) {
  return ({ color }: { color: string }) => <Icon name={name} color={color} size={22} />;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{ title: 'Activity', tabBarIcon: tabIcon('history') }}
      />
      <Tab.Screen
        name="QrTab"
        component={ReceiveScreen}
        options={{ title: 'QR', tabBarIcon: tabIcon('qr') }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ title: 'Account', tabBarIcon: tabIcon('user') }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const hydrate = useWalletStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SessionGuard>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="Bills" component={BillsScreen} />
        <Stack.Screen name="MobileLoad" component={MobileLoadScreen} />
        <Stack.Screen name="AddCash" component={AddCashScreen} />
        <Stack.Screen name="Kyc" component={KycScreen} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      </Stack.Navigator>
    </SessionGuard>
  );
}
