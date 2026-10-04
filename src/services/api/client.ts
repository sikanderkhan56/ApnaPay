import type { ApiResult } from '@/types';
import { fail } from '@/domain/result';
import { simulateNetwork } from '@/utils/delay';
import { mockDb } from '@/services/api/mockDb';
import { toErrorMessage } from '@/utils/errors';

export { fail, ok, asError, unwrap } from '@/domain/result';

export async function withLatency<T>(
  work: () => Promise<ApiResult<T>> | ApiResult<T>,
): Promise<ApiResult<T>> {
  await mockDb.init();
  await simulateNetwork();
  try {
    return await work();
  } catch (error) {
    return fail('UNEXPECTED', toErrorMessage(error, 'Something went wrong'));
  }
}
