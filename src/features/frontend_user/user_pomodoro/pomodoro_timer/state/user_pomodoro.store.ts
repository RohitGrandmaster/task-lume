/**
 * RESPONSIBILITY: Feature-scoped store for Pomodoro timer and user preferences.
 * FLOW: UserPomodoroTimerMainView → useUserPomodoro → this store; state is UI-only and remains local to this feature.
 */

import { create } from 'zustand';
import type { PomodoroMode, PomodoroTimerState } from '../types/user_pomodoro.types';

export interface UserPomodoroState {
  timer: PomodoroTimerState;
  linkedTaskId: string | null;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  dailyGoalSessions: number;
  setMode: (mode: PomodoroMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  finishTimer: () => void;
  setLinkedTaskId: (id: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoStartBreaks: (enabled: boolean) => void;
  setDailyGoalSessions: (goal: number) => void;
}

const durationForMode = (mode: PomodoroMode): number =>
  mode === 'work' ? 25 : mode === 'shortBreak' ? 5 : 15;

const initialTimer: PomodoroTimerState = {
  mode: 'work',
  selectedMinutes: 25,
  secondsLeft: 25 * 60,
  running: false,
};

export const useUserPomodoroStore = create<UserPomodoroState>((set) => ({
  timer: initialTimer,
  linkedTaskId: null,
  soundEnabled: true,
  autoStartBreaks: false,
  dailyGoalSessions: 8,

  setMode: (mode) => set((state) => {
    const selectedMinutes = durationForMode(mode);
    return {
      timer: {
        mode,
        selectedMinutes,
        secondsLeft: selectedMinutes * 60,
        running: false,
      },
    };
  }),
  startTimer: () => set((state) => ({
    timer: { ...state.timer, running: state.timer.secondsLeft > 0 },
  })),
  pauseTimer: () => set((state) => ({
    timer: { ...state.timer, running: false },
  })),
  resetTimer: () => set((state) => ({
    timer: {
      ...state.timer,
      secondsLeft: state.timer.selectedMinutes * 60,
      running: false,
    },
  })),
  tickTimer: () => set((state) => ({
    timer: {
      ...state.timer,
      secondsLeft: Math.max(0, state.timer.secondsLeft - 1),
    },
  })),
  finishTimer: () => set((state) => ({
    timer: { ...state.timer, secondsLeft: 0, running: false },
  })),
  setLinkedTaskId: (linkedTaskId) => set({ linkedTaskId }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setAutoStartBreaks: (autoStartBreaks) => set({ autoStartBreaks }),
  setDailyGoalSessions: (dailyGoalSessions) => set({ dailyGoalSessions }),
}));
