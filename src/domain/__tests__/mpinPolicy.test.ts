import { evaluateMpinAttempt } from '@/domain/mpinPolicy';
import { DEMO } from '@/config/demo';

describe('evaluateMpinAttempt', () => {
  const base = {
    now: 1_000,
    lockedUntil: 0,
    attempts: 0,
    matches: false,
  };

  it('accepts a matching pin and clears the counter', () => {
    expect(evaluateMpinAttempt({ ...base, matches: true, attempts: 2 })).toEqual({
      ok: true,
      attempts: 0,
      lockedUntil: 0,
    });
  });

  it('counts remaining tries', () => {
    const result = evaluateMpinAttempt({ ...base, attempts: 1 });
    expect(result).toMatchObject({
      ok: false,
      code: 'INVALID_MPIN',
      attempts: 2,
      lockedUntil: 0,
    });
    if (!result.ok) {
      expect(result.message).toContain(`${DEMO.maxMpinAttempts - 2} tries left`);
    }
  });

  it('locks after the last failed attempt', () => {
    const result = evaluateMpinAttempt({ ...base, attempts: DEMO.maxMpinAttempts - 1 });
    expect(result).toEqual({
      ok: false,
      code: 'MPIN_LOCKED',
      message: 'Too many attempts. Wallet PIN is locked for 20 seconds.',
      attempts: 0,
      lockedUntil: 1_000 + DEMO.mpinLockMs,
    });
  });

  it('rejects attempts while locked even if the pin matches', () => {
    const result = evaluateMpinAttempt({ ...base, lockedUntil: 2_000, matches: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('MPIN_LOCKED');
      expect(result.lockedUntil).toBe(2_000);
    }
  });
});
