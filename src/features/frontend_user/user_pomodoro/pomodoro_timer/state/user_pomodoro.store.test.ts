/**
 * RESPONSIBILITY: Verifies the feature-scoped Pomodoro timer state machine without native modules.
 * FLOW: Jest resets the Zustand store, dispatches timer actions, and asserts observable timer state.
 */

import { useUserPomodoroStore } from './user_pomodoro.store';

describe('user Pomodoro timer store', () => {
  beforeEach(() => {
    useUserPomodoroStore.getState().resetTimer();
    useUserPomodoroStore.getState().setMode('work');
  });

  it('starts, pauses, and resets the countdown', () => {
    const store = useUserPomodoroStore.getState();
    expect(store.timer.secondsLeft).toBe(25 * 60);
    store.startTimer();
    expect(useUserPomodoroStore.getState().timer.running).toBe(true);
    useUserPomodoroStore.getState().tickTimer();
    expect(useUserPomodoroStore.getState().timer.secondsLeft).toBe(25 * 60 - 1);
    useUserPomodoroStore.getState().pauseTimer();
    expect(useUserPomodoroStore.getState().timer.running).toBe(false);
    useUserPomodoroStore.getState().resetTimer();
    expect(useUserPomodoroStore.getState().timer.secondsLeft).toBe(25 * 60);
  });

  it('uses the canonical duration for each mode', () => {
    const store = useUserPomodoroStore.getState();
    store.setMode('shortBreak');
    expect(useUserPomodoroStore.getState().timer.secondsLeft).toBe(5 * 60);
    expect(useUserPomodoroStore.getState().timer.running).toBe(false);
    useUserPomodoroStore.getState().setMode('longBreak');
    expect(useUserPomodoroStore.getState().timer.secondsLeft).toBe(15 * 60);
  });

  it('never lets a tick reduce the remaining time below zero', () => {
    const store = useUserPomodoroStore.getState();
    store.finishTimer();
    store.tickTimer();
    expect(useUserPomodoroStore.getState().timer.secondsLeft).toBe(0);
    expect(useUserPomodoroStore.getState().timer.running).toBe(false);
  });
});
