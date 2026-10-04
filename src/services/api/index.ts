import { DEMO, FEES } from '@/config/demo';
import { authorizeDraft, isIncomingType } from '@/domain/paymentRules';
import { fail, ok, withLatency } from '@/services/api/client';
import {
  AGENTS,
  BANKS,
  BILLERS,
  BUNDLES,
  mockDb,
} from '@/services/api/mockDb';
import type {
  ApiResult,
  Bundle,
  FetchedBill,
  PaymentDraft,
  SavedBill,
  TelcoNetwork,
  Transaction,
  User,
  Wallet,
} from '@/types';
import { createId } from '@/utils/format';
import { isValidCnic, isValidMobile, normalizeCnic, normalizeMobile } from '@/utils/validation';

function currentUser(): User | null {
  return mockDb.snapshot().user;
}

function requireUser(): ApiResult<User> {
  const user = currentUser();
  if (!user) {
    return fail('UNAUTHENTICATED', 'Please sign in again.');
  }
  return ok(user);
}

function authorize(draft: PaymentDraft): ApiResult<true> {
  const userResult = requireUser();
  if (!userResult.ok) {
    return userResult;
  }
  const { wallet } = mockDb.snapshot();
  return authorizeDraft({
    type: draft.type,
    amount: draft.amount,
    fee: draft.fee,
    balance: wallet.balance,
    monthlyOutflow: wallet.monthlyOutflow,
    tier: userResult.data.tier,
  });
}

export const catalogApi = {
  banks: () => BANKS,
  billers: () => BILLERS,
  agents: () => AGENTS,
  bundles: (network: TelcoNetwork) => BUNDLES.filter(item => item.network === network),
};

export const authApi = {
  requestOtp(mobileRaw: string): Promise<ApiResult<{ requestId: string; demoOtp: string }>> {
    return withLatency(() => {
      const mobile = normalizeMobile(mobileRaw);
      if (!isValidMobile(mobile)) {
        return fail('INVALID_MOBILE', 'Enter a valid Pakistani mobile number.');
      }
      const record = mockDb.issueOtp(mobile);
      return ok({ requestId: record.requestId, demoOtp: DEMO.otp });
    });
  },

  verifyOtp(
    mobileRaw: string,
    requestId: string,
    otp: string,
  ): Promise<ApiResult<{ user: User; isNewUser: boolean }>> {
    return withLatency(async () => {
      const mobile = normalizeMobile(mobileRaw);
      if (otp !== DEMO.otp) {
        return fail('INVALID_OTP', 'The OTP you entered is incorrect.');
      }
      if (!mockDb.consumeOtp(requestId, mobile)) {
        return fail('OTP_EXPIRED', 'This OTP has expired. Request a new one.');
      }

      const existing = mockDb.snapshot().user;
      if (existing && existing.mobile === mobile) {
        return ok({ user: existing, isNewUser: false });
      }

      const user: User = {
        id: createId('usr'),
        name: 'Sikander Khan',
        mobile,
        tier: 'unverified',
        kycStatus: 'none',
        createdAt: new Date().toISOString(),
      };
      await mockDb.upsertUser(user);
      return ok({ user, isNewUser: true });
    });
  },

  bindDevice(deviceId: string): Promise<ApiResult<true>> {
    return withLatency(async () => {
      await mockDb.setActiveDevice(deviceId);
      return ok(true);
    });
  },

  takeOverFromOtherDevice(): Promise<ApiResult<true>> {
    return withLatency(async () => {
      await mockDb.setActiveDevice('dev_other_session');
      return ok(true);
    });
  },

  isActiveOnThisDevice(deviceId: string): boolean {
    const { activeDeviceId } = mockDb.snapshot();
    return !activeDeviceId || activeDeviceId === deviceId;
  },
};

export const kycApi = {
  submit(input: { name: string; cnic: string }): Promise<ApiResult<User>> {
    return withLatency(async () => {
      const userResult = requireUser();
      if (!userResult.ok) {
        return userResult;
      }
      const cnic = normalizeCnic(input.cnic);
      if (!isValidCnic(cnic)) {
        return fail('INVALID_CNIC', 'Enter a valid 13-digit CNIC.');
      }
      if (!input.name.trim()) {
        return fail('INVALID_NAME', 'Name is required for NADRA verification.');
      }

      const user: User = {
        ...userResult.data,
        name: input.name.trim(),
        cnic,
        kycStatus: 'verified',
        tier: 'verified',
      };
      await mockDb.upsertUser(user);
      return ok(user);
    });
  },
};

type WalletSnapshot = {
  wallet: Wallet;
  transactions: Transaction[];
  savedBills: SavedBill[];
  user: User | null;
};

export const walletApi = {
  getSnapshot(): WalletSnapshot {
    const { wallet, transactions, savedBills, user } = mockDb.snapshot();
    return { wallet, transactions, savedBills, user };
  },

  refresh(): Promise<ApiResult<WalletSnapshot>> {
    return withLatency(() => ok(walletApi.getSnapshot()));
  },
};

export const paymentApi = {
  quote(draft: PaymentDraft): Promise<ApiResult<PaymentDraft>> {
    return withLatency(() => {
      const authorized = authorize(draft);
      if (!authorized.ok) {
        return authorized;
      }
      return ok(draft);
    });
  },

  confirm(draft: PaymentDraft): Promise<ApiResult<Transaction>> {
    return withLatency(async () => {
      const authorized = authorize(draft);
      if (!authorized.ok) {
        return authorized;
      }

      const incoming = isIncomingType(draft.type);

      const transaction: Transaction = {
        id: createId('txn'),
        type: draft.type,
        direction: incoming ? 'in' : 'out',
        title: draft.title,
        subtitle: draft.subtitle,
        amount: draft.amount,
        fee: draft.fee,
        status: 'success',
        createdAt: new Date().toISOString(),
        reference: mockDb.nextReference('AP'),
        meta: draft.meta,
      };

      if (incoming) {
        await mockDb.applyCredit(transaction);
      } else {
        await mockDb.applyDebit(transaction);
      }

      return ok(transaction);
    });
  },

  lookupWallet(mobileRaw: string): Promise<ApiResult<{ name: string; mobile: string }>> {
    return withLatency(() => {
      const mobile = normalizeMobile(mobileRaw);
      if (!isValidMobile(mobile)) {
        return fail('INVALID_MOBILE', 'Enter a valid mobile number.');
      }
      if (mobile === currentUser()?.mobile) {
        return fail('SELF_TRANSFER', 'You cannot send money to your own wallet.');
      }
      const contact = mockDb.getContact(mobile);
      return ok({
        mobile,
        name: contact?.name ?? 'ApnaPay user',
      });
    });
  },

  fetchBill(billerId: string, consumerId: string): Promise<ApiResult<FetchedBill>> {
    return withLatency(() => {
      const biller = BILLERS.find(item => item.id === billerId);
      if (!biller) {
        return fail('UNKNOWN_BILLER', 'Biller is not supported yet.');
      }
      if (consumerId.trim().length < 8) {
        return fail('INVALID_CONSUMER', 'Enter a valid consumer / reference number.');
      }
      return ok(mockDb.buildFetchedBill(biller, consumerId.trim()));
    });
  },

  saveBill(bill: SavedBill): Promise<ApiResult<true>> {
    return withLatency(async () => {
      await mockDb.saveBill(bill);
      return ok(true);
    });
  },

  fetchPostpaid(
    network: TelcoNetwork,
    mobileRaw: string,
  ): Promise<ApiResult<{ mobile: string; network: TelcoNetwork; amountDue: number; billingMonth: string }>> {
    return withLatency(() => {
      const mobile = normalizeMobile(mobileRaw);
      if (!isValidMobile(mobile)) {
        return fail('INVALID_MOBILE', 'Enter a valid mobile number.');
      }
      const due = new Date();
      return ok({
        mobile,
        network,
        amountDue: 1200 + (Number(mobile.slice(-4)) % 1800),
        billingMonth: due.toLocaleString('en-PK', { month: 'long', year: 'numeric' }),
      });
    });
  },
};

export function draftFromBill(bill: FetchedBill): PaymentDraft {
  return {
    type: 'bill',
    title: bill.billerName,
    subtitle: `${bill.customerName} · ${bill.consumerId}`,
    amount: bill.amountDue,
    fee: FEES.bill,
    meta: {
      billerId: bill.billerId,
      consumerId: bill.consumerId,
      billingMonth: bill.billingMonth,
    },
  };
}

export function draftFromBundle(bundle: Bundle, mobile: string): PaymentDraft {
  return {
    type: 'bundle',
    title: bundle.name,
    subtitle: `${bundle.network.toUpperCase()} · ${mobile}`,
    amount: bundle.price,
    fee: FEES.load,
    meta: { bundleId: bundle.id, network: bundle.network, mobile },
  };
}
