/**
 * RESPONSIBILITY: Public TypeScript contract for the persisted local profile context.
 * FLOW: useAuth and settings/profile screens read profile data and save updates through the legacy provider.
 */

import type { ComponentType, ReactNode } from 'react';

export interface LocalUserProfile {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  createdAt?: string;
}

export interface AuthContextValue {
  user: LocalUserProfile;
  loading: boolean;
  updateProfile: (name?: string, mobile?: string, email?: string) => Promise<LocalUserProfile>;
}

export const AuthProvider: ComponentType<{ children?: ReactNode }>;
export function useAuthContext(): AuthContextValue;
