/**
 * RESPONSIBILITY: Public TypeScript contract for the existing persisted settings provider.
 * FLOW: Settings consumers read user preferences and update settings through the provider-owned callbacks.
 */

import type { ComponentType, ReactNode } from 'react';

export interface AppSettings {
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  use24Hour: boolean;
  weekStartsMonday: boolean;
  hapticsEnabled: boolean;
  snoozeDuration: number;
  swipeActionsEnabled: boolean;
  [key: string]: boolean | number;
}

export interface SettingsContextValue extends AppSettings {
  settings: AppSettings;
  updateSetting: (key: string, value: boolean | number) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  loading: boolean;
}

export const SETTINGS_STORAGE_KEY: string;
export const SettingsProvider: ComponentType<{ children?: ReactNode }>;
export function useSettings(): SettingsContextValue;
declare const SettingsContext: unknown;
export default SettingsContext;
