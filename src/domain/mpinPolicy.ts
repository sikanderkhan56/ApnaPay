import { DEMO } from '@/config/demo';

export type MpinDecision =
  | { ok: true; attempts: 0; lockedUntil: 0 }
  | {
      ok: false;
      code: 'MPIN_LOCKED' | 'INVALID_MPIN';
      message: string;
      attempts: number;
      lockedUntil: number;
    };

export function evaluateMpinAttempt(input: {
  now: number;
  lockedUntil: number;
  attempts: number;
  matches: boolean;
}): MpinDecision {
  if (input.now < input.lockedUntil) {
    return {
      ok: false,
      code: 'MPIN_LOCKED',
      message: 'Too many attempts. Wait a moment, then try again.',
      attempts: input.attempts,
      lockedUntil: input.lockedUntil,
    };
  }

  if (input.matches) {
    return { ok: true, attempts: 0, lockedUntil: 0 };
  }

  const attempts = input.attempts + 1;
  if (attempts >= DEMO.maxMpinAttempts) {
    return {
      ok: false,
      code: 'MPIN_LOCKED',
      message: 'Too many attempts. Wallet PIN is locked for 20 seconds.',
      attempts: 0,
      lockedUntil: input.now + DEMO.mpinLockMs,
    };
  }

  return {
    ok: false,
    code: 'INVALID_MPIN',
    message: `Incorrect MPIN. ${DEMO.maxMpinAttempts - attempts} tries left.`,
    attempts,
    lockedUntil: 0,
  };
}
