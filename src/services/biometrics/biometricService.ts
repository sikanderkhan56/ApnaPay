/**
 * Production seam for Android biometrics.
 * Swap the body for androidx.biometric.BiometricPrompt via a native module.
 */
export const biometricService = {
  isAvailable(): boolean {
    return true;
  },
};
