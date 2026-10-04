const MOBILE_RE = /^03[0-9]{9}$/;
const CNIC_DIGITS_RE = /^\d{13}$/;
const MPIN_RE = /^\d{4}$/;
const OTP_RE = /^\d{6}$/;
const PK_IBAN_RE = /^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/;
const CARD_EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function normalizeMobile(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function isValidMobile(value: string): boolean {
  return MOBILE_RE.test(normalizeMobile(value));
}

export function normalizeCnic(value: string): string {
  return value.replace(/\D/g, '').slice(0, 13);
}

export function isValidCnic(value: string): boolean {
  return CNIC_DIGITS_RE.test(normalizeCnic(value));
}

export function isValidMpin(value: string): boolean {
  return MPIN_RE.test(value);
}

export function isValidOtp(value: string): boolean {
  return OTP_RE.test(value);
}

export function isValidAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0 && Math.round(value * 100) === value * 100;
}

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function isValidPkIban(value: string): boolean {
  return PK_IBAN_RE.test(normalizeIban(value));
}

export function normalizeCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isValidCardExpiry(value: string): boolean {
  if (!CARD_EXPIRY_RE.test(value)) {
    return false;
  }
  const [month, year] = value.split('/');
  const expiry = new Date(2000 + Number(year), Number(month), 0);
  return expiry.getTime() >= Date.now();
}
