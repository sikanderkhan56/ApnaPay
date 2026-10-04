import { authorizeDraft, evaluateDebit, isIncomingType } from '@/domain/paymentRules';
import { LIMITS } from '@/config/demo';

describe('evaluateDebit', () => {
  const base = {
    amount: 1000,
    fee: 10,
    balance: 5000,
    monthlyOutflow: 0,
    tier: 'unverified' as const,
  };

  it('allows a valid wallet debit', () => {
    const result = evaluateDebit(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.total).toBe(1010);
    }
  });

  it('rejects zero or negative amounts', () => {
    const result = evaluateDebit({ ...base, amount: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('rejects insufficient funds', () => {
    const result = evaluateDebit({ ...base, amount: 4995, fee: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
    }
  });

  it('enforces unverified per-transaction limits', () => {
    const result = evaluateDebit({
      ...base,
      amount: LIMITS.unverified.perTransaction + 1,
      balance: 100_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('LIMIT_TX');
    }
  });

  it('lets a verified account send above the unverified cap', () => {
    const result = evaluateDebit({
      ...base,
      amount: 20_000,
      balance: 50_000,
      tier: 'verified',
    });
    expect(result.ok).toBe(true);
  });

  it('enforces monthly outflow', () => {
    const result = evaluateDebit({
      ...base,
      amount: 1000,
      monthlyOutflow: LIMITS.unverified.monthly,
      balance: 50_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('LIMIT_MONTHLY');
    }
  });
});

describe('isIncomingType', () => {
  it('treats cash-in as credit', () => {
    expect(isIncomingType('add_card')).toBe(true);
    expect(isIncomingType('wallet')).toBe(false);
  });
});

describe('authorizeDraft', () => {
  const base = {
    amount: 2000,
    fee: 0,
    balance: 500,
    monthlyOutflow: 0,
    tier: 'unverified' as const,
  };

  it('skips debit limits for cash-in', () => {
    const result = authorizeDraft({ ...base, type: 'add_card' });
    expect(result.ok).toBe(true);
  });

  it('still rejects invalid cash-in amounts', () => {
    const result = authorizeDraft({ ...base, type: 'add_agent', amount: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('applies wallet debit rules on sends', () => {
    const result = authorizeDraft({ ...base, type: 'wallet', amount: 4000, fee: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
    }
  });
});

