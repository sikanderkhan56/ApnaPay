import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PaymentDraft, Transaction } from '@/types';

export type AuthStackParamList = {
  Welcome: undefined;
  Phone: undefined;
  Otp: { mobile: string; requestId: string; demoOtp: string };
  CreateMpin: undefined;
  BiometricOptIn: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  QrTab: undefined;
  AccountTab: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  SendMoney: { preset?: { mobile: string; name?: string; amount?: string } } | undefined;
  ConfirmPayment: { draft: PaymentDraft };
  Receipt: { transaction: Transaction };
  Bills: undefined;
  MobileLoad: undefined;
  AddCash: undefined;
  Kyc: undefined;
  TransactionDetail: { transaction: Transaction };
};

export type RootStackParamList = {
  Auth: undefined;
  Unlock: undefined;
  App: undefined;
};

export type AuthProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type AppProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;
