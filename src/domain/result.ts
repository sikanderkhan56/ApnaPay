import type { ApiError, ApiResult } from '@/types';

export function fail<T>(code: string, message: string): ApiResult<T> {
  return { ok: false, error: { code, message } };
}

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function asError(error: ApiError): Error {
  const wrapped = new Error(error.message);
  wrapped.name = error.code;
  return wrapped;
}

export function unwrap<T>(result: ApiResult<T>): T {
  if (!result.ok) {
    throw asError(result.error);
  }
  return result.data;
}
