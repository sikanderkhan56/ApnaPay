import { isValidAmount } from '@/utils/validation';

export function parseAmount(raw: string): number | null {
  const value = Number(raw);
  if (!isValidAmount(value)) {
    return null;
  }
  return value;
}
