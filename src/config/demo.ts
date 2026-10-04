export const DEMO = {
  otp: '123456',
  defaultPhone: '03001234567',
  networkDelayMs: { min: 420, max: 860 },
  sessionTimeoutMs: 3 * 60 * 1000,
  sessionWarningMs: 30 * 1000,
  maxMpinAttempts: 5,
  mpinLockMs: 20 * 1000,
} as const;

export const LIMITS = {
  unverified: { perTransaction: 10_000, monthly: 25_000 },
  verified: { perTransaction: 50_000, monthly: 200_000 },
} as const;

export const FEES = {
  wallet: 0,
  ibft: 10,
  cnic: 25,
  bill: 5,
  load: 0,
  addCard: 0,
  addAgent: 0,
} as const;
