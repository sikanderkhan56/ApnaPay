import { create } from 'zustand';
import { secureStorage } from '@/services/storage/secureStorage';
import { appStorage } from '@/services/storage/appStorage';
import { APP_KEYS, SECURE_KEYS } from '@/services/storage/keys';
import { mockDb } from '@/services/api/mockDb';
import { authApi, kycApi } from '@/services/api';
import { unwrap } from '@/services/api/client';
import { asError } from '@/domain/result';
import { evaluateMpinAttempt } from '@/domain/mpinPolicy';
import type { User } from '@/types';
import { hashSecret } from '@/utils/hash';
import { createId } from '@/utils/format';

type SessionState = {
  hydrated: boolean;
  user: User | null;
  hasMpin: boolean;
  onboardingComplete: boolean;
  unlocked: boolean;
  biometricEnabled: boolean;
  deviceId: string;
  lastActivityAt: number;
  mpinAttempts: number;
  mpinLockedUntil: number;
  remoteLock: boolean;
  hydrate: () => Promise<void>;
  requestOtp: (mobile: string) => Promise<{ requestId: string; demoOtp: string }>;
  verifyOtp: (mobile: string, requestId: string, otp: string) => Promise<{ isNewUser: boolean }>;
  setMpin: (pin: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  verifyMpin: (pin: string) => Promise<void>;
  unlockWithMpin: (pin: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  unlock: () => void;
  lock: () => void;
  touch: () => void;
  resetDemo: () => Promise<void>;
  verifyKyc: (input: { name: string; cnic: string }) => Promise<void>;
  simulateOtherDevice: () => Promise<void>;
};

async function readFlag(key: string): Promise<boolean> {
  return (await secureStorage.get(key)) === '1';
}

export const useSessionStore = create<SessionState>((set, get) => ({
  hydrated: false,
  user: null,
  hasMpin: false,
  onboardingComplete: false,
  unlocked: false,
  biometricEnabled: false,
  deviceId: '',
  lastActivityAt: Date.now(),
  mpinAttempts: 0,
  mpinLockedUntil: 0,
  remoteLock: false,

  hydrate: async () => {
    await mockDb.init();
    const deviceId = (await appStorage.getJson<string>(APP_KEYS.deviceId)) ?? createId('dev');
    await appStorage.setJson(APP_KEYS.deviceId, deviceId);
    const hasMpin = Boolean(await secureStorage.get(SECURE_KEYS.mpinHash));
    const biometricEnabled = await readFlag(SECURE_KEYS.biometricEnabled);
    const onboardingComplete = await readFlag(SECURE_KEYS.onboardingComplete);
    const user = mockDb.snapshot().user;
    const remoteLock = Boolean(user) && !authApi.isActiveOnThisDevice(deviceId);
    set({
      hydrated: true,
      user,
      hasMpin,
      onboardingComplete,
      biometricEnabled,
      deviceId,
      unlocked: false,
      lastActivityAt: Date.now(),
      remoteLock,
      mpinAttempts: 0,
      mpinLockedUntil: 0,
    });
  },

  requestOtp: async mobile => unwrap(await authApi.requestOtp(mobile)),

  verifyOtp: async (mobile, requestId, otp) => {
    const data = unwrap(await authApi.verifyOtp(mobile, requestId, otp));
    await authApi.bindDevice(get().deviceId);
    set({ user: data.user, unlocked: false, remoteLock: false });
    return { isNewUser: data.isNewUser };
  },

  setMpin: async pin => {
    const salt = get().deviceId || 'apnapay';
    await secureStorage.set(SECURE_KEYS.mpinHash, hashSecret(pin, salt));
    set({ hasMpin: true });
  },

  completeOnboarding: async () => {
    await secureStorage.set(SECURE_KEYS.onboardingComplete, '1');
    set({ onboardingComplete: true, unlocked: true, lastActivityAt: Date.now() });
  },

  verifyMpin: async pin => {
    const expected = await secureStorage.get(SECURE_KEYS.mpinHash);
    const salt = get().deviceId || 'apnapay';
    const decision = evaluateMpinAttempt({
      now: Date.now(),
      lockedUntil: get().mpinLockedUntil,
      attempts: get().mpinAttempts,
      matches: Boolean(expected) && expected === hashSecret(pin, salt),
    });
    set({ mpinAttempts: decision.attempts, mpinLockedUntil: decision.lockedUntil });
    if (!decision.ok) {
      throw asError({ code: decision.code, message: decision.message });
    }
  },

  unlockWithMpin: async pin => {
    await get().verifyMpin(pin);
    set({ unlocked: true, lastActivityAt: Date.now(), remoteLock: false });
  },

  setBiometricEnabled: async enabled => {
    await secureStorage.set(SECURE_KEYS.biometricEnabled, enabled ? '1' : '0');
    set({ biometricEnabled: enabled });
  },

  unlock: () => set({ unlocked: true, lastActivityAt: Date.now() }),
  lock: () => set({ unlocked: false }),
  touch: () => set({ lastActivityAt: Date.now() }),

  resetDemo: async () => {
    await mockDb.reset();
    await secureStorage.remove(SECURE_KEYS.mpinHash);
    await secureStorage.remove(SECURE_KEYS.biometricEnabled);
    await secureStorage.remove(SECURE_KEYS.onboardingComplete);
    set({
      user: null,
      hasMpin: false,
      onboardingComplete: false,
      unlocked: false,
      biometricEnabled: false,
      lastActivityAt: Date.now(),
      remoteLock: false,
      mpinAttempts: 0,
      mpinLockedUntil: 0,
    });
  },

  verifyKyc: async input => {
    set({ user: unwrap(await kycApi.submit(input)) });
  },

  simulateOtherDevice: async () => {
    unwrap(await authApi.takeOverFromOtherDevice());
    set({ remoteLock: true, unlocked: false });
  },
}));
