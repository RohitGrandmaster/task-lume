/**
 * RESPONSIBILITY: Owns the local Pomodoro timer state and its lifecycle. Does not
 * make API requests or persist completed sessions.
 *
 * FLOW: UserPomodoroTimerMainView → useUserPomodoro → local timer state → timer controls.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerSuccessHaptic } from '../../../../../core/interaction/haptics';
import type { PomodoroMode } from '../types/user_pomodoro.types';

/**
 * Manages the countdown timer, mode durations, start/pause, reset, and completion.
 * @param onSessionComplete - Optional callback invoked once when the active session reaches zero.
 * @returns Timer state and handlers consumed by UserPomodoroTimerMainView.
 * @sideEffects Starts a one-second interval only while the timer is running and emits completion haptics.
 */
export function useUserPomodoro(
  onSessionComplete?: (mode: PomodoroMode, durationMinutes: number) => void,
) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const completionHandledRef = useRef(false);

  const handleModeChange = useCallback((nextMode: PomodoroMode) => {
    const minutes = nextMode === 'work' ? 25 : nextMode === 'shortBreak' ? 5 : 15;
    completionHandledRef.current = false;
    setMode(nextMode);
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setRunning(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setRunning((current) => !current);
  }, []);

  const handleReset = useCallback(() => {
    completionHandledRef.current = false;
    setRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  }, [selectedMinutes]);

  useEffect(() => {
    // running/secondsLeft control interval lifecycle; mode/minutes/callback identify the completed session.
    if (!running) return undefined;

    if (secondsLeft <= 0) {
      setRunning(false);
      if (!completionHandledRef.current) {
        completionHandledRef.current = true;
        triggerSuccessHaptic();
        onSessionComplete?.(mode, selectedMinutes);
      }
      return undefined;
    }

    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [running, secondsLeft, mode, selectedMinutes, onSessionComplete]);

  return {
    mode,
    selectedMinutes,
    secondsLeft,
    running,
    handleModeChange,
    handleTogglePlay,
    handleReset,
  };
}
