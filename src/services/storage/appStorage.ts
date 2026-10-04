import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'apnapay.app.';

export const appStorage = {
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  },
  async setJson(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${PREFIX}${key}`);
  },
};
