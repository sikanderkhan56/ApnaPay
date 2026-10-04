import { addMoney, compareMoney, fromPaisa, subtractMoney, toPaisa } from '@/domain/money';

describe('money', () => {
  it('round-trips rupees through paisa', () => {
    expect(toPaisa(48250.75)).toBe(4_825_075);
    expect(fromPaisa(4_825_075)).toBe(48250.75);
  });

  it('adds without float drift', () => {
    expect(addMoney(0.1, 0.2)).toBe(0.3);
    expect(addMoney(8430, 5)).toBe(8435);
  });

  it('subtracts wallet debits exactly', () => {
    expect(subtractMoney(48250.75, 1200)).toBe(47050.75);
  });

  it('compares using integer paisa', () => {
    expect(compareMoney(10, 10.01)).toBeLessThan(0);
    expect(compareMoney(10, 10)).toBe(0);
  });
});
