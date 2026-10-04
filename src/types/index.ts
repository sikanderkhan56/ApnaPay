export type AccountTier = 'unverified' | 'verified';
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type TransactionDirection = 'in' | 'out';

export type TransactionType =
  | 'wallet'
  | 'ibft'
  | 'cnic'
  | 'bill'
  | 'load'
  | 'bundle'
  | 'postpaid'
  | 'add_card'
  | 'add_agent'
  | 'request';

export type TransactionStatus = 'success' | 'pending' | 'failed';

export type User = {
  id: string;
  name: string;
  mobile: string;
  cnic?: string;
  email?: string;
  tier: AccountTier;
  kycStatus: KycStatus;
  createdAt: string;
};

export type Wallet = {
  balance: number;
  currency: 'PKR';
  monthlyOutflow: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  direction: TransactionDirection;
  title: string;
  subtitle: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  createdAt: string;
  reference: string;
  meta: Record<string, string>;
};

export type SavedBill = {
  id: string;
  billerId: string;
  billerName: string;
  consumerId: string;
  nickname: string;
  category: BillCategory;
};

export type BillCategory = 'electricity' | 'gas' | 'water' | 'internet' | 'landline';

export type Biller = {
  id: string;
  name: string;
  category: BillCategory;
  consumerHint: string;
};

export type FetchedBill = {
  id: string;
  billerId: string;
  billerName: string;
  consumerId: string;
  customerName: string;
  amountDue: number;
  dueDate: string;
  billingMonth: string;
};

export type Bank = {
  id: string;
  name: string;
  shortName: string;
};

export type WalletContact = {
  mobile: string;
  name: string;
};

export type TelcoNetwork = 'jazz' | 'telenor' | 'zong' | 'ufone';

export type Bundle = {
  id: string;
  network: TelcoNetwork;
  name: string;
  price: number;
  validity: string;
  description: string;
};

export type CashAgent = {
  id: string;
  name: string;
  area: string;
  city: string;
};

export type PaymentDraft = {
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  fee: number;
  meta: Record<string, string>;
};

export type ApiError = {
  code: string;
  message: string;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
