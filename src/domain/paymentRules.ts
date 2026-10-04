import { LIMITS } from '@/config/demo';
import { addMoney, compareMoney } from '@/domain/money';
import { fail, ok } from '@/domain/result';
import type { AccountTier, ApiResult, TransactionType } from '@/types';

export function evaluateDebit(input: {
  amount: number;
  fee: number;
  balance: number;
  monthlyOutflow: number;
  tier: AccountTier;
}): ApiResult<{ total: number }> {
  if (!(input.amount > 0)) {
    return fail('INVALID_AMOUNT', 'Enter an amount greater than zero.');
  }

  const total = addMoney(input.amount, input.fee);
  const limits = LIMITS[input.tier];

  if (compareMoney(total, input.balance) > 0) {
    return fail('INSUFFICIENT_FUNDS', 'Not enough balance for this payment.');
  }

  if (compareMoney(total, limits.perTransaction) > 0) {
    return fail(
      'LIMIT_TX',
      `This account can send up to Rs ${limits.perTransaction.toLocaleString()} per transaction. Complete KYC to raise limits.`,
    );
  }

  if (compareMoney(addMoney(input.monthlyOutflow, total), limits.monthly) > 0) {
    return fail('LIMIT_MONTHLY', 'Monthly sending limit reached. Complete KYC to raise limits.');
  }

  return ok({ total });
}

export function isIncomingType(type: TransactionType): boolean {
  return type === 'add_card' || type === 'add_agent' || type === 'request';
}

export function authorizeDraft(input: {
  type: TransactionType;
  amount: number;
  fee: number;
  balance: number;
  monthlyOutflow: number;
  tier: AccountTier;
}): ApiResult<true> {
  if (isIncomingType(input.type)) {
    if (!(input.amount > 0)) {
      return fail('INVALID_AMOUNT', 'Enter an amount greater than zero.');
    }
    return ok(true);
  }
  const debit = evaluateDebit(input);
  if (!debit.ok) {
    return debit;
  }
  return ok(true);
}
