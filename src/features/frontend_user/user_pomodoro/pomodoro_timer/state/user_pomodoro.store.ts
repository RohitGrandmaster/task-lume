/**
 * RESPONSIBILITY: Feature-scoped Zustand store for user_pomodoro UI state (≤180 lines).
 * FLOW: Manages active timer mode, linked focus task ID, sound mute state, and session target.
 */

import { create } from 'zustand';

export interface UserPomodoroState {
  linkedTaskId: string | null;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  dailyGoalSessions: number;
  setLinkedTaskId: (id: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoStartBreaks: (enabled: boolean) => void;
  setDailyGoalSessions: (goal: number) => void;
}

export const useUserPomodoroStore = create<UserPomodoroState>((set) => ({
  linkedTaskId: null,
  soundEnabled: true,
  autoStartBreaks: false,
  dailyGoalSessions: 8,

  setLinkedTaskId: (linkedTaskId) => set({ linkedTaskId }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setAutoStartBreaks: (autoStartBreaks) => set({ autoStartBreaks }),
  setDailyGoalSessions: (dailyGoalSessions) => set({ dailyGoalSessions }),
}));
