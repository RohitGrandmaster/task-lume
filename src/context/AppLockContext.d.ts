/**
 * RESPONSIBILITY: Public TypeScript contract for device-credential backed application locking.
 * FLOW: Security UI calls the existing provider methods; secret material remains in the native Keychain adapter.
 */

import type { ComponentType, ReactNode } from 'react';

export interface AppLockContextValue {
  isLockEnabled: boolean;
  isLocked: boolean;
  loading: boolean;
  authenticateWithDevice: () => Promise<boolean>;
  enableDeviceLock: () => Promise<boolean>;
  disableDeviceLock: () => Promise<boolean>;
}

export const AppLockProvider: ComponentType<{ children?: ReactNode }>;
export function useAppLock(): AppLockContextValue;
