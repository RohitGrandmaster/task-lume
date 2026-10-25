/**
 * RESPONSIBILITY: Canonical type definitions for the user_pomodoro timer sub-module.
 * FLOW: Consumed by timer components, interval selectors, and focus session handlers.
 */

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSession {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt: string;
}
