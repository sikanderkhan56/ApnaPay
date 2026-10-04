import { parseAmount } from '@/utils/amount';
import {
  isValidCardExpiry,
  isValidPkIban,
  normalizeCardExpiry,
  normalizeIban,
} from '@/utils/validation';

describe('parseAmount', () => {
  it('accepts positive rupee amounts with at most two decimals', () => {
    expect(parseAmount('500')).toBe(500);
    expect(parseAmount('12.50')).toBe(12.5);
  });

  it('rejects empty, zero, and over-precise values', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('10.123')).toBeNull();
  });
});

describe('PK IBAN', () => {
  it('accepts a 24-character Pakistani IBAN', () => {
    expect(isValidPkIban(normalizeIban('pk12 mucb 0000001234567890'))).toBe(true);
  });

  it('rejects short or malformed IBANs', () => {
    expect(isValidPkIban('PK12MCB0000001234567890')).toBe(false);
    expect(isValidPkIban('GB82WEST12345698765432')).toBe(false);
  });
});

describe('card expiry', () => {
  it('masks digits as MM/YY', () => {
    expect(normalizeCardExpiry('1228')).toBe('12/28');
  });

  it('accepts a future month and rejects invalid months', () => {
    expect(isValidCardExpiry('12/28')).toBe(true);
    expect(isValidCardExpiry('13/28')).toBe(false);
    expect(isValidCardExpiry('01/20')).toBe(false);
  });
});
