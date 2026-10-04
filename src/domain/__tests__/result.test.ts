import { unwrap } from '@/domain/result';
import { toErrorMessage } from '@/utils/errors';

describe('unwrap', () => {
  it('returns data on success', () => {
    expect(unwrap({ ok: true, data: 7 })).toBe(7);
  });

  it('throws a coded error on failure', () => {
    expect(() => unwrap({ ok: false, error: { code: 'LIMIT_TX', message: 'Too much' } })).toThrow(
      'Too much',
    );
    try {
      unwrap({ ok: false, error: { code: 'LIMIT_TX', message: 'Too much' } });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).name).toBe('LIMIT_TX');
    }
  });
});

describe('toErrorMessage', () => {
  it('reads Error messages and falls back otherwise', () => {
    expect(toErrorMessage(new Error('Nope'), 'fallback')).toBe('Nope');
    expect(toErrorMessage('Nope', 'fallback')).toBe('fallback');
  });
});
