/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_settings UI state (≤180 lines).
 * FLOW: Manages client preferences (notification toggles, backup status, and theme state).
 */

import { create } from 'zustand';

export interface UserSettingsState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoArchiveCompleted: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setAutoArchiveCompleted: (enabled: boolean) => void;
}

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  notificationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  autoArchiveCompleted: false,

  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setAutoArchiveCompleted: (autoArchiveCompleted) => set({ autoArchiveCompleted }),
}));
