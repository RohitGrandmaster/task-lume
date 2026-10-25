/**
 * RESPONSIBILITY: Persists completed Pomodoro sessions in the user's local focus-history store.
 * FLOW: useUserPomodoro completes a timer → this feature-local service saves a session → overview reads the same storage key.
 */

import { getItem, setItem } from '../../../../../storage/storage';
import type { PomodoroMode } from '../types/user_pomodoro.types';

export const USER_POMODORO_SESSIONS_STORAGE_KEY = '@todomaster/focus_sessions_history';
const MAX_SAVED_SESSIONS = 100;

export interface UserPomodoroSessionRecord {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt: string;
  dateKey: string;
}

/**
 * Formats a date into the local calendar's YYYY-MM-DD key.
 *
 * @param value - Date instance or ISO-compatible date value.
 * @returns Local YYYY-MM-DD key used for daily focus aggregates.
 */
export function getUserPomodoroDateKey(value: Date | string = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Records a completed work or break session and retains the most recent 100.
 *
 * @param session - Timer mode, selected duration, and completion timestamp.
 * @returns The persisted session record.
 * @throws When the local history cannot be read or saved.
 */
export async function recordUserPomodoroSession(session: {
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt?: string;
}): Promise<UserPomodoroSessionRecord> {
  const completedAt = session.completedAt ?? new Date().toISOString();
  const records = await getItem(USER_POMODORO_SESSIONS_STORAGE_KEY, []);
  const existing: UserPomodoroSessionRecord[] = Array.isArray(records) ? records : [];
  const record: UserPomodoroSessionRecord = {
    id: `pomodoro-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mode: session.mode,
    durationMinutes: Math.max(0, Number(session.durationMinutes) || 0),
    completedAt,
    dateKey: getUserPomodoroDateKey(completedAt),
  };
  await setItem(USER_POMODORO_SESSIONS_STORAGE_KEY, [record, ...existing].slice(0, MAX_SAVED_SESSIONS));
  const saved = await getItem(USER_POMODORO_SESSIONS_STORAGE_KEY, []);
  if (!Array.isArray(saved) || saved[0]?.id !== record.id) throw new Error('Focus session history could not be verified after saving.');
  return record;
}

/**
 * Reads the persisted focus session history without introducing another storage source.
 *
 * @returns The current user's locally stored focus sessions; an empty array when no history exists.
 */
export async function getUserPomodoroSessions(): Promise<UserPomodoroSessionRecord[]> {
  const records = await getItem(USER_POMODORO_SESSIONS_STORAGE_KEY, []);
  return Array.isArray(records) ? records as UserPomodoroSessionRecord[] : [];
}
