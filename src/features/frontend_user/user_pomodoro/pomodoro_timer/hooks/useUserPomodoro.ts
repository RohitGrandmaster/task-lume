/**
 * RESPONSIBILITY: Owns Pomodoro timer actions, countdown lifecycle, and user feedback.
 * FLOW: UserPomodoroTimerMainView → this hook → feature-scoped Zustand store.
 */

import { useCallback, useEffect } from 'react';
import type { PomodoroMode } from '../types/user_pomodoro.types';
import { useUserPomodoroStore } from '../state/user_pomodoro.store';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserPomodoro(
  onSessionComplete?: (mode: PomodoroMode, durationMinutes: number) => void,
) {
  const timer = useUserPomodoroStore((state) => state.timer);
  const start = useUserPomodoroStore((state) => state.startTimer);
  const pause = useUserPomodoroStore((state) => state.pauseTimer);
  const reset = useUserPomodoroStore((state) => state.resetTimer);
  const setMode = useUserPomodoroStore((state) => state.setMode);
  const tick = useUserPomodoroStore((state) => state.tickTimer);
  const finish = useUserPomodoroStore((state) => state.finishTimer);

  useEffect(() => {
    if (!timer.running) return undefined;

    const interval = setInterval(() => {
      const current = useUserPomodoroStore.getState().timer;
      if (current.secondsLeft <= 1) {
        finish();
        triggerSuccessHaptic();
        showToast('Focus session completed', 'success', 'pomodoro-session-completed');
        onSessionComplete?.(current.mode, current.selectedMinutes);
      } else {
        tick();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.running, finish, tick, onSessionComplete]);

  const startTimer = useCallback(() => {
    triggerLightImpact();
    start();
    showToast('Focus session started', 'info', 'pomodoro-session-started');
  }, [start]);

  const pauseTimer = useCallback(() => {
    triggerLightImpact();
    pause();
  }, [pause]);

  const resetTimer = useCallback(() => {
    triggerLightImpact();
    reset();
  }, [reset]);

  const changeMode = useCallback((mode: PomodoroMode) => {
    triggerLightImpact();
    setMode(mode);
  }, [setMode]);

  return {
    timer,
    setMode: changeMode,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
