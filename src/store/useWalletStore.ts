import { create } from 'zustand';
import { paymentApi, walletApi } from '@/services/api';
import { unwrap } from '@/services/api/client';
import type { PaymentDraft, SavedBill, Transaction, Wallet } from '@/types';

type WalletState = {
  wallet: Wallet;
  transactions: Transaction[];
  savedBills: SavedBill[];
  loading: boolean;
  hydrate: () => void;
  refresh: () => Promise<void>;
  confirmPayment: (draft: PaymentDraft) => Promise<Transaction>;
  saveBill: (bill: SavedBill) => Promise<void>;
};

const emptyWallet: Wallet = { balance: 0, currency: 'PKR', monthlyOutflow: 0 };

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: emptyWallet,
  transactions: [],
  savedBills: [],
  loading: false,

  hydrate: () => {
    const snapshot = walletApi.getSnapshot();
    set({
      wallet: snapshot.wallet,
      transactions: snapshot.transactions,
      savedBills: snapshot.savedBills,
    });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const snapshot = unwrap(await walletApi.refresh());
      set({
        wallet: snapshot.wallet,
        transactions: snapshot.transactions,
        savedBills: snapshot.savedBills,
      });
    } finally {
      set({ loading: false });
    }
  },

  confirmPayment: async draft => {
    const quoted = unwrap(await paymentApi.quote(draft));
    const confirmed = unwrap(await paymentApi.confirm(quoted));
    get().hydrate();
    return confirmed;
  },

  saveBill: async bill => {
    unwrap(await paymentApi.saveBill(bill));
    get().hydrate();
  },
}));
