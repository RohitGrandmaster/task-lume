/**
 * RESPONSIBILITY: Canonical feature hook for User Pomodoro Timer (≤150 lines).
 * FLOW: Controls countdown timer, mode switching, and session completion notifications.
 */

import { useCallback } from 'react';
import { useUserPomodoroStore } from '../state/user_pomodoro.store';
import { triggerLightImpact, triggerNotificationSuccess } from '../../../../../core/interaction/haptics';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserPomodoro() {
  const store = useUserPomodoroStore();

  const handleStart = useCallback(() => {
    triggerLightImpact();
    store.startTimer();
    showToast('Focus session started', 'info');
  }, [store]);

  const handlePause = useCallback(() => {
    triggerLightImpact();
    store.pauseTimer();
  }, [store]);

  const handleReset = useCallback(() => {
    triggerLightImpact();
    store.resetTimer();
  }, [store]);

  return {
    timer: store.timer,
    startTimer: handleStart,
    pauseTimer: handlePause,
    resetTimer: handleReset,
  };
}
