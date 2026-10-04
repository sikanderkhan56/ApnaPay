import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'apnapay.secure.';

/**
 * Storage seam for secrets (MPIN hash, session flags).
 * Production Android: EncryptedSharedPreferences / Android Keystore.
 * This demo uses AsyncStorage so the interview device needs no extra native setup.
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`${PREFIX}${key}`);
  },
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`${PREFIX}${key}`, value);
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${PREFIX}${key}`);
  },
};
