import { formatCnic, formatPhone, formatPkr, formatSignedPkr } from '@/utils/format';
import { isValidCnic, isValidMobile, normalizeCnic, normalizeMobile } from '@/utils/validation';

describe('formatters', () => {
  it('formats PKR with grouping', () => {
    expect(formatPkr(48250.75)).toBe('Rs 48,250.75');
  });

  it('formats Pakistani mobiles', () => {
    expect(formatPhone('03001234567')).toBe('0300 1234567');
  });

  it('formats CNIC with dashes', () => {
    expect(formatCnic('3520212345671')).toBe('35202-1234567-1');
  });

  it('prefixes credits and debits without mutating the amount', () => {
    expect(formatSignedPkr(1200, 'in')).toBe('+Rs 1,200.00');
    expect(formatSignedPkr(1200, 'out')).toBe('-Rs 1,200.00');
  });
});

describe('validation', () => {
  it('accepts Jazz/Telenor style numbers', () => {
    expect(isValidMobile(normalizeMobile('0300 1234567'))).toBe(true);
    expect(isValidMobile('0211234567')).toBe(false);
  });

  it('accepts 13-digit CNICs', () => {
    expect(isValidCnic(normalizeCnic('35202-1234567-1'))).toBe(true);
    expect(isValidCnic('123')).toBe(false);
  });
});
