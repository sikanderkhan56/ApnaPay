import { appStorage } from '@/services/storage/appStorage';
import { APP_KEYS } from '@/services/storage/keys';
import { FEES } from '@/config/demo';
import type {
  Bank,
  Biller,
  Bundle,
  CashAgent,
  FetchedBill,
  SavedBill,
  Transaction,
  User,
  Wallet,
  WalletContact,
} from '@/types';
import { addMoney, subtractMoney } from '@/domain/money';
import { createId, createReference } from '@/utils/format';

type OtpRecord = {
  requestId: string;
  mobile: string;
  expiresAt: number;
};

type DbState = {
  user: User | null;
  wallet: Wallet;
  transactions: Transaction[];
  savedBills: SavedBill[];
  deviceId: string;
  activeDeviceId: string | null;
};

const CONTACTS: WalletContact[] = [
  { mobile: '03219876543', name: 'Ayesha Malik' },
  { mobile: '03331234567', name: 'Ahmed Raza' },
  { mobile: '03451112233', name: 'Hassan Ali' },
];

export const BANKS: Bank[] = [
  { id: 'mcb', name: 'MCB Bank', shortName: 'MCB' },
  { id: 'hbl', name: 'Habib Bank Limited', shortName: 'HBL' },
  { id: 'ubl', name: 'United Bank Limited', shortName: 'UBL' },
  { id: 'abl', name: 'Allied Bank', shortName: 'ABL' },
  { id: 'bop', name: 'Bank of Punjab', shortName: 'BOP' },
  { id: 'meezan', name: 'Meezan Bank', shortName: 'MEBL' },
  { id: 'khushhali', name: 'Khushhali Microfinance Bank', shortName: 'KMBL' },
];

export const BILLERS: Biller[] = [
  { id: 'mepco', name: 'MEPCO', category: 'electricity', consumerHint: '14-digit reference' },
  { id: 'lesco', name: 'LESCO', category: 'electricity', consumerHint: '14-digit reference' },
  { id: 'ke', name: 'K-Electric', category: 'electricity', consumerHint: 'Consumer number' },
  { id: 'sngpl', name: 'SNGPL', category: 'gas', consumerHint: 'Consumer ID' },
  { id: 'ssgc', name: 'SSGC', category: 'gas', consumerHint: 'Consumer ID' },
  { id: 'wasa', name: 'WASA', category: 'water', consumerHint: 'Consumer ID' },
  { id: 'ptcl', name: 'PTCL', category: 'landline', consumerHint: 'Phone number' },
  { id: 'stormfiber', name: 'StormFiber', category: 'internet', consumerHint: 'Account number' },
];

export const BUNDLES: Bundle[] = [
  { id: 'jazz_weekly', network: 'jazz', name: 'Weekly Super', price: 180, validity: '7 days', description: '500 mins · 1000 SMS · 5 GB' },
  { id: 'jazz_monthly', network: 'jazz', name: 'Monthly Max', price: 780, validity: '30 days', description: '2000 mins · 4000 SMS · 25 GB' },
  { id: 'telenor_weekly', network: 'telenor', name: 'Weekly Talk', price: 160, validity: '7 days', description: '400 mins · 800 SMS · 4 GB' },
  { id: 'telenor_monthly', network: 'telenor', name: 'Monthly Plus', price: 720, validity: '30 days', description: '1500 mins · 3000 SMS · 20 GB' },
  { id: 'zong_weekly', network: 'zong', name: 'Weekly Behtreen', price: 170, validity: '7 days', description: '450 mins · 900 SMS · 6 GB' },
  { id: 'zong_monthly', network: 'zong', name: 'Monthly Supreme', price: 799, validity: '30 days', description: '2500 mins · 5000 SMS · 30 GB' },
  { id: 'ufone_weekly', network: 'ufone', name: 'Weekly Power', price: 150, validity: '7 days', description: '350 mins · 700 SMS · 3 GB' },
  { id: 'ufone_monthly', network: 'ufone', name: 'Monthly Prime', price: 699, validity: '30 days', description: '1200 mins · 2500 SMS · 18 GB' },
];

export const AGENTS: CashAgent[] = [
  { id: 'agt_1', name: 'Al Makkah Telecom', area: 'Liberty Market', city: 'Lahore' },
  { id: 'agt_2', name: 'Al Makkah Telecom', area: 'Gulberg III', city: 'Lahore' },
  { id: 'agt_3', name: 'Al Makkah Telecom', area: 'Blue Area', city: 'Islamabad' },
  { id: 'agt_4', name: 'Al Makkah Telecom', area: 'Saddar', city: 'Karachi' },
];

const otpStore = new Map<string, OtpRecord>();

let state: DbState = createFreshState();
let ready: Promise<void> | null = null;

function daysAgo(days: number, hours: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 12, 0, 0);
  return date.toISOString();
}

function seedTransactions(): Transaction[] {
  return [
    {
      id: 'txn_seed_1',
      type: 'wallet',
      direction: 'in',
      title: 'Ayesha Malik',
      subtitle: 'ApnaPay transfer',
      amount: 2500,
      fee: 0,
      status: 'success',
      createdAt: daysAgo(0, 10),
      reference: 'APW240001',
      meta: { mobile: '03219876543' },
    },
    {
      id: 'txn_seed_2',
      type: 'load',
      direction: 'out',
      title: 'Jazz prepaid',
      subtitle: '03001234567',
      amount: 500,
      fee: 0,
      status: 'success',
      createdAt: daysAgo(1, 18),
      reference: 'APL240002',
      meta: { network: 'jazz' },
    },
    {
      id: 'txn_seed_3',
      type: 'bill',
      direction: 'out',
      title: 'LESCO',
      subtitle: 'Consumer 14123456789012',
      amount: 8430,
      fee: FEES.bill,
      status: 'success',
      createdAt: daysAgo(2, 12),
      reference: 'APB240003',
      meta: { biller: 'LESCO' },
    },
    {
      id: 'txn_seed_4',
      type: 'wallet',
      direction: 'out',
      title: 'Ahmed Raza',
      subtitle: 'ApnaPay transfer',
      amount: 1200,
      fee: 0,
      status: 'success',
      createdAt: daysAgo(3, 16),
      reference: 'APW240004',
      meta: { mobile: '03331234567' },
    },
    {
      id: 'txn_seed_5',
      type: 'add_card',
      direction: 'in',
      title: 'Added via card',
      subtitle: 'Visa •••• 4242',
      amount: 10000,
      fee: 0,
      status: 'success',
      createdAt: daysAgo(5, 11),
      reference: 'APC240005',
      meta: { last4: '4242' },
    },
    {
      id: 'txn_seed_6',
      type: 'ibft',
      direction: 'out',
      title: 'MCB Bank',
      subtitle: 'PK12MCB0000001234567890',
      amount: 5000,
      fee: FEES.ibft,
      status: 'success',
      createdAt: daysAgo(6, 15),
      reference: 'APB240006',
      meta: { bank: 'MCB Bank' },
    },
  ];
}

function createFreshState(): DbState {
  return {
    user: null,
    wallet: { balance: 48250.75, currency: 'PKR', monthlyOutflow: 15135 },
    transactions: seedTransactions(),
    savedBills: [
      {
        id: 'sb_1',
        billerId: 'lesco',
        billerName: 'LESCO',
        consumerId: '14123456789012',
        nickname: 'Home electricity',
        category: 'electricity',
      },
    ],
    deviceId: createId('dev'),
    activeDeviceId: null,
  };
}

async function persist(): Promise<void> {
  await appStorage.setJson(APP_KEYS.db, state);
}

export const mockDb = {
  init(): Promise<void> {
    if (!ready) {
      ready = (async () => {
        const saved = await appStorage.getJson<DbState>(APP_KEYS.db);
        if (saved) {
          state = saved;
        }
      })();
    }
    return ready;
  },

  snapshot(): DbState {
    return state;
  },

  async reset(): Promise<void> {
    state = createFreshState();
    otpStore.clear();
    await persist();
  },

  getContact(mobile: string): WalletContact | undefined {
    return CONTACTS.find(item => item.mobile === mobile);
  },

  issueOtp(mobile: string): OtpRecord {
    const record: OtpRecord = {
      requestId: createId('otp'),
      mobile,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    otpStore.set(record.requestId, record);
    return record;
  },

  consumeOtp(requestId: string, mobile: string): boolean {
    const record = otpStore.get(requestId);
    if (!record || record.mobile !== mobile || record.expiresAt < Date.now()) {
      return false;
    }
    otpStore.delete(requestId);
    return true;
  },

  async upsertUser(user: User): Promise<User> {
    state = { ...state, user };
    await persist();
    return user;
  },

  async setActiveDevice(deviceId: string): Promise<void> {
    state = { ...state, activeDeviceId: deviceId, deviceId: state.deviceId || deviceId };
    await persist();
  },

  async applyDebit(transaction: Transaction): Promise<void> {
    const total = addMoney(transaction.amount, transaction.fee);
    state = {
      ...state,
      wallet: {
        ...state.wallet,
        balance: subtractMoney(state.wallet.balance, total),
        monthlyOutflow: addMoney(state.wallet.monthlyOutflow, total),
      },
      transactions: [transaction, ...state.transactions],
    };
    await persist();
  },

  async applyCredit(transaction: Transaction): Promise<void> {
    state = {
      ...state,
      wallet: {
        ...state.wallet,
        balance: addMoney(state.wallet.balance, transaction.amount),
      },
      transactions: [transaction, ...state.transactions],
    };
    await persist();
  },

  async saveBill(bill: SavedBill): Promise<void> {
    const exists = state.savedBills.some(
      item => item.billerId === bill.billerId && item.consumerId === bill.consumerId,
    );
    if (exists) {
      return;
    }
    state = { ...state, savedBills: [bill, ...state.savedBills] };
    await persist();
  },

  buildFetchedBill(biller: Biller, consumerId: string): FetchedBill {
    const amountDue = 1200 + (Number(consumerId.slice(-4)) % 8000);
    const due = new Date();
    due.setDate(due.getDate() + 6);
    return {
      id: createId('bill'),
      billerId: biller.id,
      billerName: biller.name,
      consumerId,
      customerName: state.user?.name ?? 'Account holder',
      amountDue,
      dueDate: due.toISOString(),
      billingMonth: due.toLocaleString('en-PK', { month: 'long', year: 'numeric' }),
    };
  },

  nextReference(prefix: string): string {
    return createReference(prefix);
  },
};
