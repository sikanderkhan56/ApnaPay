/* eslint-disable no-bitwise */
/**
 * Demo-only hash. Production would send a salted hash to the backend
 * and keep the MPIN behind Android Keystore / EncryptedSharedPreferences.
 */
export function hashSecret(value: string, salt: string): string {
  let hash = 2166136261;
  const input = `${salt}:${value}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}`;
}
