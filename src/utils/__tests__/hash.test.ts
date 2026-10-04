import { hashSecret } from '@/utils/hash';

describe('hashSecret', () => {
  it('is deterministic for the same pin and salt', () => {
    expect(hashSecret('1234', 'dev_1')).toBe(hashSecret('1234', 'dev_1'));
  });

  it('changes when the pin or device salt changes', () => {
    const a = hashSecret('1234', 'dev_1');
    expect(hashSecret('1235', 'dev_1')).not.toBe(a);
    expect(hashSecret('1234', 'dev_2')).not.toBe(a);
  });
});
