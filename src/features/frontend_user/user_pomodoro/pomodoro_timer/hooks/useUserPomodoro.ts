/**
 * RESPONSIBILITY: Owns Pomodoro timer actions, countdown lifecycle, focus-history persistence, and feedback.
 * FLOW: UserPomodoroTimerMainView → this hook → feature store and local focus-session service.
 */

import { useCallback, useEffect } from 'react';
import type { PomodoroMode } from '../types/user_pomodoro.types';
import { useUserPomodoroStore } from '../state/user_pomodoro.store';
import { recordUserPomodoroSession } from '../utils/userPomodoroFocusService';
import { triggerLightImpact, triggerSuccessHaptic } from '../../../../../core/interaction/haptics';
import { showToast } from '../../../../../core/toast/showToast';

/**
 * Controls the shared timer state and records each completed timer session.
 *
 * @param onSessionComplete - Optional host callback for additional session reactions.
 * @returns Timer state and mode/start/pause/reset actions.
 */
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

  const completeSession = useCallback(async (mode: PomodoroMode, durationMinutes: number) => {
    finish();
    triggerSuccessHaptic();
    try {
      await recordUserPomodoroSession({ mode, durationMinutes });
      showToast('Focus session completed and saved', 'success', 'pomodoro-session-completed');
    } catch {
      showToast('Timer finished, but focus history could not be saved', 'error', 'pomodoro-session-save-failed');
    }
    onSessionComplete?.(mode, durationMinutes);
  }, [finish, onSessionComplete]);

  useEffect(() => {
    if (!timer.running) return undefined;

    const interval = setInterval(() => {
      const current = useUserPomodoroStore.getState().timer;
      if (current.secondsLeft <= 1) {
        void completeSession(current.mode, current.selectedMinutes);
      } else {
        tick();
      }
    }, 1000);

    // timer.running starts/stops the interval; tick and completeSession are the current store actions/callback.
    return () => clearInterval(interval);
  }, [timer.running, tick, completeSession]);

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
